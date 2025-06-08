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
    const pageUrl = url.searchParams.get('url')
    
    if (!pageUrl) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const domain = new URL(pageUrl).hostname

    // Vérifier si le domaine est en whitelist
    const { data: whitelistData } = await supabaseClient
      .from('whitelist_domains')
      .select('*')
      .eq('domain', domain)
      .single()

    if (whitelistData) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: 'whitelisted',
            domain,
            url: pageUrl,
            recentReports: []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer le rapport de la page (tous statuts pertinents)
    const { data: pageReport } = await supabaseClient
      .from('reports')
      .select(`
        *,
        user:users(*),
        votes(*)
      `)
      .eq('url', pageUrl)
      .in('status', [
        'ia',
        'not_ia',
        'reported_ia',
        'not_ai',
        'confirmed_not_ia',
        'domain_has_reports',
        'whitelisted',
        'unknown',
        'not_reported'
      ])
      .single()

    // Calculer les totaux de votes pour l'affichage
    if (pageReport) {
      const votes = pageReport.votes || [];
      pageReport.approve_votes = votes.filter((v) => v.vote_type === 'approve').length;
      pageReport.refute_votes = votes.filter((v) => v.vote_type === 'refute').length;
      pageReport.not_ai_votes = votes.filter((v) => v.vote_type === 'not_ia').length;
    }

    // Récupérer les signalements du domaine (tous statuts pertinents)
    const { data: domainReports } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('domain', domain)
      .in('status', [
        'ia',
        'reported_ia',
        'not_ia',
        'not_ai',
        'confirmed_not_ia',
        'domain_has_reports',
        'whitelisted',
        'unknown',
        'not_reported'
      ])

    // Récupérer les 5 derniers signalements de la communauté (tous statuts pertinents)
    const { data: recentReports } = await supabaseClient
      .from('reports')
      .select(`
        id,
        url,
        domain,
        created_at,
        status,
        type_contenu,
        anonyme,
        user:users(pseudo, avatar_url)
      `)
      .in('status', [
        'ia',
        'reported_ia',
        'not_ia',
        'not_ai',
        'confirmed_not_ia',
        'domain_has_reports',
        'whitelisted',
        'unknown',
        'not_reported'
      ])
      .order('created_at', { ascending: false })
      .limit(5)

    let status = 'not_reported'
    if (pageReport) {
      const votes = pageReport.votes || []
      const notIaVotes = votes.filter((v: any) => v.vote_type === 'not_ia').length
      if (notIaVotes >= 100) {
        status = 'confirmed_not_ia'
      } else if (pageReport.status === 'ia' || pageReport.status === 'reported_ia') {
        status = 'ai'
      } else if (pageReport.status === 'not_ia' || pageReport.status === 'not_ai') {
        status = 'not_ai'
      } else if (pageReport.status === 'domain_has_reports') {
        status = 'domain_has_reports'
      } else if (pageReport.status === 'whitelisted') {
        status = 'whitelisted'
      } else if (pageReport.status === 'unknown') {
        status = 'unknown'
      } else if (pageReport.status === 'not_reported') {
        status = 'not_reported'
      }
    } else if (domainReports && domainReports.length > 0) {
      status = 'domain_has_reports'
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status,
          domain,
          url: pageUrl,
          reports: pageReport ? [pageReport] : [],
          domain_reports_count: domainReports?.length || 0,
          recentReports: recentReports || []
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
