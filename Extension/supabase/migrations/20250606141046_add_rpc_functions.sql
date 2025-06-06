-- Fonction pour mettre à jour les points d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_points(
  user_id UUID,
  points_to_add INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET points_totaux = points_totaux + points_to_add
  WHERE id = user_id;
END;
$$;

-- Fonction pour calculer l'indice de confiance d'un utilisateur
CREATE OR REPLACE FUNCTION calculate_trust_index(user_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_votes INTEGER;
  positive_votes INTEGER;
  trust_index DECIMAL;
BEGIN
  -- Compter les votes reçus sur les signalements de l'utilisateur
  SELECT 
    COUNT(v.*),
    COUNT(CASE WHEN v.vote_type = 'approve' THEN 1 END)
  INTO total_votes, positive_votes
  FROM votes v
  INNER JOIN reports r ON v.report_id = r.id
  WHERE r.user_id = calculate_trust_index.user_id;
  
  -- Calculer l'indice de confiance (pourcentage de votes positifs)
  IF total_votes > 0 THEN
    trust_index := (positive_votes::DECIMAL / total_votes::DECIMAL) * 100;
  ELSE
    trust_index := 0;
  END IF;
  
  -- Mettre à jour l'indice dans la table users
  UPDATE users 
  SET indice_confiance = trust_index
  WHERE id = calculate_trust_index.user_id;
  
  RETURN trust_index;
END;
$$;

-- Fonction pour vérifier et attribuer des badges
CREATE OR REPLACE FUNCTION check_and_award_badges(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reports_count INTEGER;
  votes_given_count INTEGER;
  votes_received_count INTEGER;
  trust_index DECIMAL;
  badge_record RECORD;
BEGIN
  -- Calculer les statistiques de l'utilisateur
  SELECT COUNT(*) INTO reports_count
  FROM reports WHERE reports.user_id = check_and_award_badges.user_id;
  
  SELECT COUNT(*) INTO votes_given_count
  FROM votes WHERE votes.user_id = check_and_award_badges.user_id;
  
  SELECT COUNT(v.*) INTO votes_received_count
  FROM votes v
  INNER JOIN reports r ON v.report_id = r.id
  WHERE r.user_id = check_and_award_badges.user_id;
  
  -- Calculer l'indice de confiance
  trust_index := calculate_trust_index(check_and_award_badges.user_id);
  
  -- Vérifier les badges de signalements
  FOR badge_record IN 
    SELECT * FROM badges 
    WHERE type_badge = 'reports' 
    AND seuil <= reports_count
    ORDER BY seuil DESC
  LOOP
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    VALUES (check_and_award_badges.user_id, badge_record.id, NOW())
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  -- Badge premier signalement
  IF reports_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    SELECT check_and_award_badges.user_id, id, NOW()
    FROM badges WHERE type_badge = 'first_report'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- Vérifier les badges de votes donnés
  FOR badge_record IN 
    SELECT * FROM badges 
    WHERE type_badge = 'votes_given' 
    AND seuil <= votes_given_count
    ORDER BY seuil DESC
  LOOP
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    VALUES (check_and_award_badges.user_id, badge_record.id, NOW())
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  -- Vérifier les badges de votes reçus
  FOR badge_record IN 
    SELECT * FROM badges 
    WHERE type_badge = 'votes_received' 
    AND seuil <= votes_received_count
    ORDER BY seuil DESC
  LOOP
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    VALUES (check_and_award_badges.user_id, badge_record.id, NOW())
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  -- Vérifier les badges d'indice de confiance
  FOR badge_record IN 
    SELECT * FROM badges 
    WHERE type_badge = 'trust_index' 
    AND seuil <= trust_index
    ORDER BY seuil DESC
  LOOP
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    VALUES (check_and_award_badges.user_id, badge_record.id, NOW())
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  -- Vérifier le badge "Maître Détecteur" (tous les autres badges)
  IF (
    SELECT COUNT(DISTINCT b.type_badge)
    FROM user_badges ub
    INNER JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = check_and_award_badges.user_id
    AND b.type_badge IN ('reports', 'votes_given', 'votes_received', 'trust_index')
  ) >= 4 THEN
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    SELECT check_and_award_badges.user_id, id, NOW()
    FROM badges WHERE type_badge = 'all_badges'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
END;
$$;

-- Fonction pour récupérer les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'reports_count', (
      SELECT COUNT(*) FROM reports WHERE reports.user_id = get_user_stats.user_id
    ),
    'votes_given_count', (
      SELECT COUNT(*) FROM votes WHERE votes.user_id = get_user_stats.user_id
    ),
    'votes_received_count', (
      SELECT COUNT(v.*) 
      FROM votes v
      INNER JOIN reports r ON v.report_id = r.id
      WHERE r.user_id = get_user_stats.user_id
    ),
    'positive_votes_received', (
      SELECT COUNT(v.*) 
      FROM votes v
      INNER JOIN reports r ON v.report_id = r.id
      WHERE r.user_id = get_user_stats.user_id
      AND v.vote_type = 'approve'
    ),
    'trust_index', (
      SELECT indice_confiance FROM users WHERE id = get_user_stats.user_id
    ),
    'badges_count', (
      SELECT COUNT(*) FROM user_badges WHERE user_badges.user_id = get_user_stats.user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;