-- Ajoute la colonne awarded_at à la table user_badges si elle n'existe pas déjà (sécurité)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_badges' AND column_name='awarded_at'
    ) THEN
        ALTER TABLE public.user_badges
        ADD COLUMN awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Si la colonne earned_at existe encore, la supprimer pour éviter la redondance
do $$
begin
    if EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_badges' AND column_name='earned_at'
    ) then
        ALTER TABLE public.user_badges DROP COLUMN earned_at;
    end if;
end $$;
