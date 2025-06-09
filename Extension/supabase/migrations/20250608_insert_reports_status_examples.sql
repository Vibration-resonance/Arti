-- Script d'insertion de rapports de test pour chaque statut possible
-- Statuts autorisés : 'ia', 'not_ia'

INSERT INTO reports (id, user_id, url, domain, type_contenu, commentaire, anonyme, status, created_at, updated_at, votes_approve, votes_refute, votes_not_ia, confidence_score)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'https://test-ia.com', 'test-ia.com', 'text', 'Test rapport IA', false, 'ia', NOW(), NOW(), 0, 0, 0, 0),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'https://test-notia.com', 'test-notia.com', 'image', 'Test rapport Not IA', false, 'not_ia', NOW(), NOW(), 0, 0, 0, 0);

-- Remplace les user_id par des UUID valides de ta table users si besoin.
