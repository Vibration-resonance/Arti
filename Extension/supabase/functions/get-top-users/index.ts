import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const period = url.searchParams.get('period') || 'all' // all, week, month
    ;
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = `AND created_at >= NOW() - INTERVAL '7 days'`;
    } else if (period === 'month') {
      dateFilter = `AND created_at >= NOW() - INTERVAL '30 days'`;
    }
    // Récupérer les utilisateurs avec leurs statistiques
    const { data: users, error: usersError } = await supabaseClient.from('users').select(`
        id,
        pseudo,
        avatar_url,
        points_totaux,
        indice_confiance,
        created_at,
        role
      `).order('points_totaux', {
      ascending: false
    }).range(offset, offset + limit - 1);
    if (usersError) {
      throw usersError;
    }
    // Pour chaque utilisateur, récupérer ses badges et statistiques détaillées
    const usersWithStats = await Promise.all(users.map(async (user)=>{
      // Récupérer les badges
      const { data: userBadges } = await supabaseClient.from('user_badges').select(`
          badge:badges(*)
        `).eq('user_id', user.id);
      // Statistiques des signalements
      let reportsQuery = supabaseClient.from('reports').select('id', {
        count: 'exact',
        head: true
      }).eq('user_id', user.id);
      if (period === 'week') {
        reportsQuery = reportsQuery.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (period === 'month') {
        reportsQuery = reportsQuery.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }
      const { count: reportsCount } = await reportsQuery;
      // Statistiques des votes donnés
      let votesQuery = supabaseClient.from('votes').select('id', {
        count: 'exact',
        head: true
      }).eq('user_id', user.id);
      if (period === 'week') {
        votesQuery = votesQuery.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (period === 'month') {
        votesQuery = votesQuery.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }
      const { count: votesCount } = await votesQuery;
      // Votes reçus (sur les signalements de l'utilisateur)
      const { data: votesReceived } = await supabaseClient.from('votes').select(`
          vote_type,
          report:reports!inner(user_id)
        `).eq('report.user_id', user.id);
      const totalVotesReceived = votesReceived?.length || 0;
      const positiveVotesReceived = votesReceived?.filter((v)=>v.vote_type === 'approve').length || 0;
      return {
        ...user,
        badges: userBadges?.map((ub)=>ub.badge) || [],
        stats: {
          reports_count: reportsCount || 0,
          votes_given_count: votesCount || 0,
          votes_received_count: totalVotesReceived,
          positive_votes_received: positiveVotesReceived
        }
      };
    }));
    // Récupérer le nombre total d'utilisateurs pour la pagination
    const { count: totalUsers } = await supabaseClient.from('users').select('id', {
      count: 'exact',
      head: true
    });
    return new Response(JSON.stringify({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalUsers || 0,
          totalPages: Math.ceil((totalUsers || 0) / limit)
        },
        period
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
