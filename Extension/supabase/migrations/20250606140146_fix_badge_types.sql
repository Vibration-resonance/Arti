-- Mise à jour de la contrainte des types de badge pour permettre tous les types nécessaires

-- Supprimer la contrainte existante
ALTER TABLE public.badges DROP CONSTRAINT IF EXISTS badges_type_badge_check;

-- Ajouter une nouvelle contrainte avec toutes les valeurs nécessaires
ALTER TABLE public.badges ADD CONSTRAINT badges_type_badge_check 
CHECK (type_badge IN ('reports', 'votes', 'accuracy', 'special', 'first_report', 'votes_given', 'votes_received', 'trust_index', 'all_badges'));
