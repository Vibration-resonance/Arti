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
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    // Ajout des logs pour debug
    console.log('user:', user);
    if (user) {
      console.log('user_id:', user.id);
    }

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { url, type_contenu, commentaire, anonyme, whitelist_request } = await req.json()

    const allowedTypes = ['text', 'image', 'video', 'audio', 'other']
    if (!url || !type_contenu || !allowedTypes.includes(type_contenu)) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL and valid content type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const domain = new URL(url).hostname

    // Vérifier si la page n'est pas déjà signalée
    const { data: existingReport } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('url', url)
      .single()

    if (existingReport) {
      return new Response(
        JSON.stringify({ success: false, error: 'Page already reported' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le signalement
    const { data: report, error: reportError } = await supabaseClient
      .from('reports')
      .insert({
        user_id: user.id,
        url,
        domain,
        type_contenu,
        commentaire: commentaire || '',
        anonyme: anonyme || false,
        status: 'ia' // Set status to 'ia' immediately
      })
      .select()
      .single()

    if (reportError) {
      throw reportError
    }

    // Traiter la demande de whitelist si utilisateur Pro
    if (whitelist_request) {
      const { data: userData } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'Pro') {
        await supabaseClient
          .from('whitelist_requests')
          .insert({
            user_id: user.id,
            domain,
            reason: commentaire || 'Demande d\'ajout à la whitelist',
            status: 'pending'
          })
      }
    }

    // Mettre à jour les points utilisateur (+10 points)
    await supabaseClient.rpc('update_user_points', {
      user_id: user.id,
      points_to_add: 10
    })

    // Vérifier et attribuer des badges
    await supabaseClient.rpc('check_and_award_badges', {
      user_id: user.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: report
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(error) // Ajout du log pour debug dans les logs Supabase
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error // Ajout du détail complet de l'erreur pour debug côté client
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
