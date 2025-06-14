import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');

    // Total reports
    const { count: total_reports } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Total votes donnés
    const { count: total_votes } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Total points, etc. depuis la table users (utilise points_totaux et indice_confiance)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points_totaux, indice_confiance, pseudo, avatar_url, role')
      .eq('id', userId)
      .single();
    if (userError) throw userError;

    // Reports by type (utilise 'type_contenu' au lieu de 'type')
    const { data: reportsByType } = await supabase
      .from('reports')
      .select('type_contenu')
      .eq('user_id', userId);
    const reports_by_type = {};
    if (reportsByType) {
      for (const r of reportsByType) {
        reports_by_type[r.type_contenu] = (reports_by_type[r.type_contenu] || 0) + 1;
      }
    }

    // Vote accuracy (dummy, à adapter selon ta logique)
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type, is_correct')
      .eq('user_id', userId);
    const vote_accuracy = { approve: 0, refute: 0, not_ai: 0 };
    let approveTotal = 0, approveCorrect = 0;
    let refuteTotal = 0, refuteCorrect = 0;
    let notAiTotal = 0, notAiCorrect = 0;
    if (votes) {
      for (const v of votes) {
        if (v.vote_type === 'approve') {
          approveTotal++;
          if (v.is_correct) approveCorrect++;
        } else if (v.vote_type === 'refute') {
          refuteTotal++;
          if (v.is_correct) refuteCorrect++;
        } else if (v.vote_type === 'not_ai') {
          notAiTotal++;
          if (v.is_correct) notAiCorrect++;
        }
      }
      vote_accuracy.approve = approveTotal ? Math.round((approveCorrect / approveTotal) * 100) : 0;
      vote_accuracy.refute = refuteTotal ? Math.round((refuteCorrect / refuteTotal) * 100) : 0;
      vote_accuracy.not_ai = notAiTotal ? Math.round((notAiCorrect / notAiTotal) * 100) : 0;
    }

    // Reports/votes/points this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: reports_this_week } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgo);
    const { count: votes_this_week } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgo);
    // Points this week (somme des points des reports de la semaine)
    const { data: reportsWeek } = await supabase
      .from('reports')
      .select('points')
      .eq('user_id', userId)
      .gte('created_at', weekAgo);
    let points_this_week = 0;
    if (reportsWeek) {
      for (const r of reportsWeek) {
        points_this_week += r.points || 0;
      }
    }

    // Badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select('id, badge_type, earned_at')
      .eq('user_id', userId);

    // --- Définition des badges et paliers ---
    const BADGE_TIERS = [
      { tier: 'bronze', color: '#cd7f32' },
      { tier: 'argent', color: '#C0C0C0' },
      { tier: 'or', color: '#FFD700' },
      { tier: 'diamant', color: '#b9f2ff' },
      { tier: 'platine', color: '#e5e4e2' }
    ];
    const BADGES = [
      // Signalements effectués
      { category: 'reports', label: 'observer', thresholds: [50, 100, 250, 500, 1000], icon: 'observateur.png' },
      // Votes effectués
      { category: 'votes', label: 'voter', thresholds: [50, 100, 250, 500, 1000], icon: 'votant.png' },
      // Votes reçus
      { category: 'votes_received', label: 'content', thresholds: [50, 100, 250, 500, 1000], icon: 'contenu.png' },
      // Indice de confiance
      { category: 'confidence', label: 'confidence', thresholds: [60, 75, 90, 95, 99], icon: 'fiabilite.png' }
    ];

    // --- Récupération des stats utilisateur ---
    // Récupérer le nombre de votes reçus sur ses signalements
    const { count: votes_received } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .in('report_id', (
        await supabase.from('reports').select('id').eq('user_id', userId)
      ).data?.map(r => r.id) || []);
    // Calcul de l'indice de confiance (si pas déjà dans userData)
    const indice_confiance = userData?.indice_confiance || 0;

    // --- Calcul dynamique des badges ---
    // --- Définition du type pour les badges dynamiques ---
    type BadgeProgress = {
      category: string;
      tier: string;
      label: string;
      badge_type: string;
      unlocked: boolean;
      current_value: number;
      target_value: number;
      progress: number;
      color: string;
      icon: string;
      earned_at: string | null;
    };
    const badges_progress: BadgeProgress[] = [];
    // Signalements
    const reportsCount = total_reports || 0;
    BADGES[0].thresholds.forEach((threshold, idx) => {
      const unlocked = reportsCount >= threshold;
      const prev = idx === 0 ? 0 : BADGES[0].thresholds[idx - 1];
      const progress = Math.min(100, Math.round(((reportsCount - prev) / (threshold - prev)) * 100));
      badges_progress.push({
        category: 'reports',
        tier: BADGE_TIERS[idx].tier,
        label: `${BADGES[0].label} ${BADGE_TIERS[idx].tier.charAt(0).toUpperCase() + BADGE_TIERS[idx].tier.slice(1)}`,
        badge_type: `reports_${BADGE_TIERS[idx].tier}`,
        unlocked,
        current_value: reportsCount,
        target_value: threshold,
        progress,
        color: BADGE_TIERS[idx].color,
        icon: BADGES[0].icon,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `reports_${BADGE_TIERS[idx].tier}`)?.earned_at || null) : null
      });
    });
    // Votes effectués
    const votesCount = total_votes || 0;
    BADGES[1].thresholds.forEach((threshold, idx) => {
      const unlocked = votesCount >= threshold;
      const prev = idx === 0 ? 0 : BADGES[1].thresholds[idx - 1];
      const progress = Math.min(100, Math.round(((votesCount - prev) / (threshold - prev)) * 100));
      badges_progress.push({
        category: 'votes',
        tier: BADGE_TIERS[idx].tier,
        label: `${BADGES[1].label} ${BADGE_TIERS[idx].tier.charAt(0).toUpperCase() + BADGE_TIERS[idx].tier.slice(1)}`,
        badge_type: `votes_${BADGE_TIERS[idx].tier}`,
        unlocked,
        current_value: votesCount,
        target_value: threshold,
        progress,
        color: BADGE_TIERS[idx].color,
        icon: BADGES[1].icon,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `votes_${BADGE_TIERS[idx].tier}`)?.earned_at || null) : null
      });
    });
    // Votes reçus
    const votesReceivedCount = votes_received || 0;
    BADGES[2].thresholds.forEach((threshold, idx) => {
      const unlocked = votesReceivedCount >= threshold;
      const prev = idx === 0 ? 0 : BADGES[2].thresholds[idx - 1];
      const progress = Math.min(100, Math.round(((votesReceivedCount - prev) / (threshold - prev)) * 100));
      badges_progress.push({
        category: 'votes_received',
        tier: BADGE_TIERS[idx].tier,
        label: `${BADGES[2].label} ${BADGE_TIERS[idx].tier.charAt(0).toUpperCase() + BADGE_TIERS[idx].tier.slice(1)}`,
        badge_type: `votes_received_${BADGE_TIERS[idx].tier}`,
        unlocked,
        current_value: votesReceivedCount,
        target_value: threshold,
        progress,
        color: BADGE_TIERS[idx].color,
        icon: BADGES[2].icon,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `votes_received_${BADGE_TIERS[idx].tier}`)?.earned_at || null) : null
      });
    });
    // Indice de confiance
    BADGES[3].thresholds.forEach((threshold, idx) => {
      const unlocked = indice_confiance >= threshold;
      const prev = idx === 0 ? 0 : BADGES[3].thresholds[idx - 1];
      const progress = Math.min(100, Math.round(((indice_confiance - prev) / (threshold - prev)) * 100));
      badges_progress.push({
        category: 'confidence',
        tier: BADGE_TIERS[idx].tier,
        label: `${BADGES[3].label} ${BADGE_TIERS[idx].tier.charAt(0).toUpperCase() + BADGE_TIERS[idx].tier.slice(1)}`,
        badge_type: `confidence_${BADGE_TIERS[idx].tier}`,
        unlocked,
        current_value: indice_confiance,
        target_value: threshold,
        progress,
        color: BADGE_TIERS[idx].color,
        icon: BADGES[3].icon,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `confidence_${BADGE_TIERS[idx].tier}`)?.earned_at || null) : null
      });
    });
    // Badge spécial "Maître Détecteur"
    badges_progress.push({
      category: 'special',
      tier: 'master',
      label: 'Maître Détecteur',
      badge_type: 'master_detector',
      unlocked: false,
      current_value: 0,
      target_value: 1,
      progress: 0,
      color: 'linear-gradient(90deg,#cd7f32,#C0C0C0,#FFD700,#b9f2ff,#e5e4e2)',
      icon: 'master.png',
      earned_at: null
    });

    // --- Nouvelle structure des badges : une seule entrée par badge ---
    type BadgeCard = {
      category: string;
      label: string;
      icon: string;
      unlocked: boolean;
      current_value: number;
      current_tier: string | null;
      current_color: string;
      current_threshold: number | null;
      next_tier: string | null;
      next_color: string | null;
      next_threshold: number | null;
      progress: number; // % vers le prochain palier
      earned_at: string | null;
    };
    const badges_cards: BadgeCard[] = [];
    // Signalements
    {
      const badge = BADGES[0];
      const value = total_reports || 0;
      let currentIdx = -1;
      for (let i = badge.thresholds.length - 1; i >= 0; i--) {
        if (value >= badge.thresholds[i]) { currentIdx = i; break; }
      }
      const unlocked = currentIdx >= 0;
      const current_tier = unlocked ? BADGE_TIERS[currentIdx].tier : null;
      const current_color = unlocked ? BADGE_TIERS[currentIdx].color : '#e5e7eb';
      const current_threshold = unlocked ? badge.thresholds[currentIdx] : null;
      const nextIdx = currentIdx + 1;
      const next_tier = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].tier : null;
      const next_color = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].color : null;
      const next_threshold = nextIdx < badge.thresholds.length ? badge.thresholds[nextIdx] : null;
      let progress = 0;
      if (next_threshold) {
        const prev = current_threshold || 0;
        progress = Math.max(0, Math.min(100, Math.round(((value - prev) / (next_threshold - prev)) * 100)));
      } else if (unlocked) {
        progress = 100;
      }
      badges_cards.push({
        category: badge.category,
        label: badge.label,
        icon: badge.icon,
        unlocked,
        current_value: value,
        current_tier,
        current_color,
        current_threshold,
        next_tier,
        next_color,
        next_threshold,
        progress,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `${badge.category}_${current_tier}`)?.earned_at || null) : null
      });
    }
    // Votes effectués
    {
      const badge = BADGES[1];
      const value = total_votes || 0;
      let currentIdx = -1;
      for (let i = badge.thresholds.length - 1; i >= 0; i--) {
        if (value >= badge.thresholds[i]) { currentIdx = i; break; }
      }
      const unlocked = currentIdx >= 0;
      const current_tier = unlocked ? BADGE_TIERS[currentIdx].tier : null;
      const current_color = unlocked ? BADGE_TIERS[currentIdx].color : '#e5e7eb';
      const current_threshold = unlocked ? badge.thresholds[currentIdx] : null;
      const nextIdx = currentIdx + 1;
      const next_tier = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].tier : null;
      const next_color = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].color : null;
      const next_threshold = nextIdx < badge.thresholds.length ? badge.thresholds[nextIdx] : null;
      let progress = 0;
      if (next_threshold) {
        const prev = current_threshold || 0;
        progress = Math.max(0, Math.min(100, Math.round(((value - prev) / (next_threshold - prev)) * 100)));
      } else if (unlocked) {
        progress = 100;
      }
      badges_cards.push({
        category: badge.category,
        label: badge.label,
        icon: badge.icon,
        unlocked,
        current_value: value,
        current_tier,
        current_color,
        current_threshold,
        next_tier,
        next_color,
        next_threshold,
        progress,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `${badge.category}_${current_tier}`)?.earned_at || null) : null
      });
    }
    // Votes reçus
    {
      const badge = BADGES[2];
      const value = votes_received || 0;
      let currentIdx = -1;
      for (let i = badge.thresholds.length - 1; i >= 0; i--) {
        if (value >= badge.thresholds[i]) { currentIdx = i; break; }
      }
      const unlocked = currentIdx >= 0;
      const current_tier = unlocked ? BADGE_TIERS[currentIdx].tier : null;
      const current_color = unlocked ? BADGE_TIERS[currentIdx].color : '#e5e7eb';
      const current_threshold = unlocked ? badge.thresholds[currentIdx] : null;
      const nextIdx = currentIdx + 1;
      const next_tier = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].tier : null;
      const next_color = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].color : null;
      const next_threshold = nextIdx < badge.thresholds.length ? badge.thresholds[nextIdx] : null;
      let progress = 0;
      if (next_threshold) {
        const prev = current_threshold || 0;
        progress = Math.max(0, Math.min(100, Math.round(((value - prev) / (next_threshold - prev)) * 100)));
      } else if (unlocked) {
        progress = 100;
      }
      badges_cards.push({
        category: badge.category,
        label: badge.label,
        icon: badge.icon,
        unlocked,
        current_value: value,
        current_tier,
        current_color,
        current_threshold,
        next_tier,
        next_color,
        next_threshold,
        progress,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `${badge.category}_${current_tier}`)?.earned_at || null) : null
      });
    }
    // Indice de confiance
    {
      const badge = BADGES[3];
      const value = indice_confiance;
      let currentIdx = -1;
      for (let i = badge.thresholds.length - 1; i >= 0; i--) {
        if (value >= badge.thresholds[i]) { currentIdx = i; break; }
      }
      const unlocked = currentIdx >= 0;
      const current_tier = unlocked ? BADGE_TIERS[currentIdx].tier : null;
      const current_color = unlocked ? BADGE_TIERS[currentIdx].color : '#e5e7eb';
      const current_threshold = unlocked ? badge.thresholds[currentIdx] : null;
      const nextIdx = currentIdx + 1;
      const next_tier = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].tier : null;
      const next_color = nextIdx < BADGE_TIERS.length ? BADGE_TIERS[nextIdx].color : null;
      const next_threshold = nextIdx < badge.thresholds.length ? badge.thresholds[nextIdx] : null;
      let progress = 0;
      if (next_threshold) {
        const prev = current_threshold || 0;
        progress = Math.max(0, Math.min(100, Math.round(((value - prev) / (next_threshold - prev)) * 100)));
      } else if (unlocked) {
        progress = 100;
      }
      badges_cards.push({
        category: badge.category,
        label: badge.label,
        icon: badge.icon,
        unlocked,
        current_value: value,
        current_tier,
        current_color,
        current_threshold,
        next_tier,
        next_color,
        next_threshold,
        progress,
        earned_at: unlocked ? (badges?.find(b => b.badge_type === `${badge.category}_${current_tier}`)?.earned_at || null) : null
      });
    }
    // Badge spécial "Maître Détecteur"
    const allUnlocked = badges_cards.every(b => b.unlocked && b.progress === 100);
    badges_cards.push({
      category: 'special',
      label: 'master_detector',
      icon: 'master.png',
      unlocked: allUnlocked,
      current_value: allUnlocked ? 1 : 0,
      current_tier: allUnlocked ? 'master' : null,
      current_color: allUnlocked ? 'linear-gradient(90deg,#cd7f32,#C0C0C0,#FFD700,#b9f2ff,#e5e4e2)' : '#e5e7eb',
      current_threshold: 1,
      next_tier: null,
      next_color: null,
      next_threshold: null,
      progress: allUnlocked ? 100 : 0,
      earned_at: allUnlocked ? (badges?.find(b => b.badge_type === 'master_detector')?.earned_at || null) : null
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        total_reports: total_reports || 0,
        total_votes: total_votes || 0,
        points_totaux: userData?.points_totaux || 0,
        indice_confiance,
        reports_by_type,
        vote_accuracy,
        reports_this_week: reports_this_week || 0,
        votes_this_week: votes_this_week || 0,
        points_this_week,
        badges: badges_cards
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
