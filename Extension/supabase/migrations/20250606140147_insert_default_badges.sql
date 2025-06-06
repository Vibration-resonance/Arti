-- Insertion des badges par défaut pour Arti AI Detector selon les spécifications exactes

-- Badge spécial : Premier Signalement
INSERT INTO public.badges (nom_badge, type_badge, seuil, description, couleur_fond) VALUES
('Premier Signalement', 'first_report', 1, 'Effectuer son premier signalement', '#10B981');

-- Badges basés sur le nombre de signalements effectués
INSERT INTO public.badges (nom_badge, type_badge, seuil, description, couleur_fond) VALUES
('Observateur Débutant', 'reports', 50, '50 signalements effectués', '#CD7F32'),
('Observateur Actif', 'reports', 100, '100 signalements effectués', '#C0C0C0'),
('Observateur Expert', 'reports', 250, '250 signalements effectués', '#FFD700'),
('Observateur Élite', 'reports', 500, '500 signalements effectués', '#B9F2FF'),
('Observateur Légendaire', 'reports', 1000, '1000 signalements effectués', '#E5E4E2');

-- Badges basés sur le nombre de votes effectués
INSERT INTO public.badges (nom_badge, type_badge, seuil, description, couleur_fond) VALUES
('Votant Débutant', 'votes_given', 50, '50 votes effectués', '#CD7F32'),
('Votant Régulier', 'votes_given', 100, '100 votes effectués', '#C0C0C0'),
('Votant Expert', 'votes_given', 250, '250 votes effectués', '#FFD700'),
('Votant Élite', 'votes_given', 500, '500 votes effectués', '#B9F2FF'),
('Votant Légendaire', 'votes_given', 1000, '1000 votes effectués', '#E5E4E2');

-- Badges basés sur le nombre de votes reçus
INSERT INTO public.badges (nom_badge, type_badge, seuil, description, couleur_fond) VALUES
('Contenu Populaire', 'votes_received', 50, '50 votes reçus sur vos signalements', '#CD7F32'),
('Contenu Reconnu', 'votes_received', 100, '100 votes reçus sur vos signalements', '#C0C0C0'),
('Contenu Influent', 'votes_received', 250, '250 votes reçus sur vos signalements', '#FFD700'),
('Contenu Notable', 'votes_received', 500, '500 votes reçus sur vos signalements', '#B9F2FF'),
('Contenu Légendaire', 'votes_received', 1000, '1000 votes reçus sur vos signalements', '#E5E4E2');

-- Badges basés sur l'indice de confiance (en pourcentage)
INSERT INTO public.badges (nom_badge, type_badge, seuil, description, couleur_fond) VALUES
('Fiabilité Bronze', 'trust_index', 60, 'Indice de confiance de 60%+', '#CD7F32'),
('Fiabilité Argent', 'trust_index', 75, 'Indice de confiance de 75%+', '#C0C0C0'),
('Fiabilité Or', 'trust_index', 90, 'Indice de confiance de 90%+', '#FFD700'),
('Fiabilité Platine', 'trust_index', 95, 'Indice de confiance de 95%+', '#E5E4E2'),
('Fiabilité Diamant', 'trust_index', 99, 'Indice de confiance de 99%+', '#B9F2FF');

-- Badge ultime pour tous les badges
INSERT INTO public.badges (nom_badge, type_badge, seuil, description, couleur_fond) VALUES
('Maître Détecteur', 'all_badges', 0, 'Obtenir tous les autres badges', 'linear-gradient(45deg, #FFD700, #B9F2FF, #E5E4E2, #CD7F32)');