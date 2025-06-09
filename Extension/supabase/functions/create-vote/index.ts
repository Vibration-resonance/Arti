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

    // Create Supabase client with user's JWT for RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
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

    // Log pour debug : afficher l'objet inséré et le user complet
    console.log('[create-vote] Objet inséré dans votes:', {
      user_id: user.id,
      report_id,
      vote_type
    })
    console.log('[create-vote] user complet:', user)
    // Log du rapport récupéré
    console.log('[create-vote] rapport récupéré:', report)
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
      console.error('[create-vote] Erreur lors de l\'insertion du vote:', voteError)
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

    // Vérification stricte du statut avant update
    const allowedStatus = ['ia', 'not_ia'];
    if (!allowedStatus.includes(report.status)) {
      console.error('[create-vote] Statut du rapport non autorisé pour update:', report.status);
      return new Response(
        JSON.stringify({ error: `Statut du rapport non autorisé: ${report.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour les compteurs dans reports
    let updateFields: any = { status: report.status };
    if (vote_type === 'approve') updateFields.votes_approve = report.votes_approve + 1;
    if (vote_type === 'refute') updateFields.votes_refute = report.votes_refute + 1;
    if (vote_type === 'not_ia') updateFields.votes_not_ia = report.votes_not_ia + 1;

    // Ajout du log pour debug
    console.log('[create-vote] updateFields avant update reports:', updateFields);
    // Log des valeurs autorisées pour status (à adapter selon la contrainte SQL)
    console.log('[create-vote] Valeurs autorisées pour status: pending, approved, refuted, not_ia');
    // Log de la valeur actuelle de report.status
    console.log('[create-vote] Valeur actuelle de report.status:', report.status);

    if (Object.keys(updateFields).length > 1) { // il y a au moins un compteur à mettre à jour
      const { error: updateVotesError } = await supabaseClient
        .from('reports')
        .update(updateFields)
        .eq('id', report_id);
      if (updateVotesError) {
        console.error('[create-vote] Erreur lors de la mise à jour des compteurs de votes:', updateVotesError);
        throw updateVotesError;
      }
    }

    // Recalculer les votes
    const { data: allVotes } = await supabaseClient
      .from('votes')
      .select('vote_type')
      .eq('report_id', report_id)

    const voteCount = allVotes?.length || 0
    const approveCount = allVotes?.filter(v => v.vote_type === 'approve').length || 0
    const refuteCount = allVotes?.filter(v => v.vote_type === 'refute').length || 0
    const notIaCount = allVotes?.filter(v => v.vote_type === 'not_ia').length || 0

    // Log des votes
    console.log('[create-vote] Stats votes:', { voteCount, approveCount, refuteCount, notIaCount })
    // Log du statut avant update
    console.log('[create-vote] Statut du rapport avant update:', report.status)

    // Le statut ne change que si 100 votes "not_ia" sont atteints
    if (notIaCount >= 100 && report.status !== 'not_ia') {
      const { error: updateError } = await supabaseClient
        .from('reports')
        .update({ status: 'not_ia' })
        .eq('id', report_id)
      if (updateError) {
        console.error('[create-vote] Erreur lors de la mise à jour du statut du rapport:', updateError)
        throw updateError
      }
    }

    // Vérifier et attribuer des badges
    await supabaseClient.rpc('check_and_award_badges', {
      user_id: user.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          vote,
          newReportStatus: notIaCount >= 100 ? 'not_ia' : report.status,
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
