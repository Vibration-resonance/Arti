import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { report_id, vote_type } = await req.json()

    if (!report_id || !vote_type) {
      return new Response(
        JSON.stringify({ error: 'Report ID and vote type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['approve', 'refute', 'not_ia'].includes(vote_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid vote type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que le rapport existe
    const { data: report, error: reportError } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('id', report_id)
      .single()

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur n'a pas déjà voté
    const { data: existingVote } = await supabaseClient
      .from('votes')
      .select('*')
      .eq('report_id', report_id)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: 'User has already voted on this report' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le vote
    const { data: vote, error: voteError } = await supabaseClient
      .from('votes')
      .insert({
        user_id: user.id,
        report_id,
        vote_type
      })
      .select()
      .single()

    if (voteError) {
      throw voteError
    }

    // Mettre à jour les points du votant (+5 points)
    await supabaseClient.rpc('update_user_points', {
      user_id: user.id,
      points_to_add: 5
    })

    // Si vote positif, donner des points au créateur du rapport (+5 points)
    if (vote_type === 'approve') {
      await supabaseClient.rpc('update_user_points', {
        user_id: report.user_id,
        points_to_add: 5
      })
    }

    // Recalculer le statut du rapport
    const { data: allVotes } = await supabaseClient
      .from('votes')
      .select('vote_type')
      .eq('report_id', report_id)

    const voteCount = allVotes?.length || 0
    const approveCount = allVotes?.filter(v => v.vote_type === 'approve').length || 0
    const refuteCount = allVotes?.filter(v => v.vote_type === 'refute').length || 0
    const notIaCount = allVotes?.filter(v => v.vote_type === 'not_ia').length || 0

    let newStatus = 'pending'
    
    // Si 100+ votes "not_ia", marquer comme définitivement non-IA
    if (notIaCount >= 100) {
      newStatus = 'not_ia'
    }
    // Si plus de votes "approve" que "refute" et au moins 5 votes
    else if (voteCount >= 5 && approveCount > refuteCount) {
      newStatus = 'ia'
    }
    // Si plus de votes "refute" que "approve" et au moins 5 votes
    else if (voteCount >= 5 && refuteCount > approveCount) {
      newStatus = 'not_ia'
    }

    // Mettre à jour le statut du rapport
    await supabaseClient
      .from('reports')
      .update({ status: newStatus })
      .eq('id', report_id)

    // Vérifier et attribuer des badges
    await supabaseClient.rpc('check_and_award_badges', {
      user_id: user.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          vote,
          newReportStatus: newStatus,
          voteCount,
          approveCount,
          refuteCount,
          notIaCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
