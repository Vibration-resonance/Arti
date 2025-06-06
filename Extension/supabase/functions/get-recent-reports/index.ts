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

  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const page = parseInt(url.searchParams.get('page') || '1')
    const status = url.searchParams.get('status') // 'pending', 'ia', 'not_ia'
    const offset = (page - 1) * limit

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    let query = supabaseClient
      .from('reports')
      .select(`
        id,
        url,
        domain,
        type_contenu,
        commentaire,
        anonyme,
        status,
        created_at,
        updated_at,
        user:users(
          id,
          pseudo,
          avatar_url
        ),
        votes(
          id,
          vote_type,
          user:users(pseudo)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrer par statut si spécifié
    if (status && ['pending', 'ia', 'not_ia'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: reports, error: reportsError } = await query

    if (reportsError) {
      throw reportsError
    }

    // Calculer les statistiques des votes pour chaque rapport
    const reportsWithStats = reports?.map(report => {
      const votes = report.votes || []
      const voteStats = {
        total: votes.length,
        approve: votes.filter((v: any) => v.vote_type === 'approve').length,
        refute: votes.filter((v: any) => v.vote_type === 'refute').length,
        not_ia: votes.filter((v: any) => v.vote_type === 'not_ia').length
      }

      // Masquer les informations utilisateur si anonyme
      const user = report.anonyme ? null : report.user

      return {
        ...report,
        user,
        vote_stats: voteStats
      }
    }) || []

    // Récupérer le nombre total de rapports pour la pagination
    let countQuery = supabaseClient
      .from('reports')
      .select('id', { count: 'exact', head: true })

    if (status && ['pending', 'ia', 'not_ia'].includes(status)) {
      countQuery = countQuery.eq('status', status)
    }

    const { count: totalReports } = await countQuery

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reports: reportsWithStats,
          pagination: {
            page,
            limit,
            total: totalReports || 0,
            totalPages: Math.ceil((totalReports || 0) / limit)
          },
          filters: {
            status
          }
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
