-- Arti AI Detector - Schema Initial
-- Extension de table users par défaut de Supabase avec des champs personnalisés

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs étendue
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    google_id TEXT UNIQUE,
    pseudo TEXT NOT NULL,
    avatar_url TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT DEFAULT 'Free' CHECK (role IN ('Free', 'Premium', 'Pro')),
    points_totaux INTEGER DEFAULT 0,
    indice_confiance DECIMAL(3,2) DEFAULT 0.00,
    is_anonymous_mode BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'canceled', 'past_due')),
    subscription_end_date TIMESTAMP WITH TIME ZONE
);

-- Table des domaines en whitelist
CREATE TABLE public.whitelisted_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des signalements
CREATE TABLE public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    type_contenu TEXT NOT NULL CHECK (type_contenu IN ('text', 'image', 'audio', 'video')),
    commentaire TEXT,
    anonyme BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ia', 'not_ia')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    votes_approve INTEGER DEFAULT 0,
    votes_refute INTEGER DEFAULT 0,
    votes_not_ia INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.00
);

-- Table des votes
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('approve', 'refute', 'not_ia')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, report_id)
);

-- Table des badges
CREATE TABLE public.badges (
    id SERIAL PRIMARY KEY,
    nom_badge TEXT NOT NULL UNIQUE,
    type_badge TEXT NOT NULL CHECK (type_badge IN ('reports', 'votes', 'accuracy', 'special')),
    seuil INTEGER NOT NULL,
    icon_url TEXT,
    couleur_fond TEXT DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges utilisateur (relation many-to-many)
CREATE TABLE public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    badge_id INTEGER REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Table des demandes de whitelist (pour les utilisateurs Pro)
CREATE TABLE public.whitelist_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    domain TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX idx_reports_url ON public.reports(url);
CREATE INDEX idx_reports_domain ON public.reports(domain);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_votes_report_id ON public.votes(report_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_users_points ON public.users(points_totaux DESC);
CREATE INDEX idx_users_role ON public.users(role);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour recalculer les statistiques d'un rapport après vote
CREATE OR REPLACE FUNCTION recalculate_report_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer les compteurs de votes
    UPDATE public.reports 
    SET 
        votes_approve = (SELECT COUNT(*) FROM public.votes WHERE report_id = COALESCE(NEW.report_id, OLD.report_id) AND vote_type = 'approve'),
        votes_refute = (SELECT COUNT(*) FROM public.votes WHERE report_id = COALESCE(NEW.report_id, OLD.report_id) AND vote_type = 'refute'),
        votes_not_ia = (SELECT COUNT(*) FROM public.votes WHERE report_id = COALESCE(NEW.report_id, OLD.report_id) AND vote_type = 'not_ia')
    WHERE id = COALESCE(NEW.report_id, OLD.report_id);
    
    -- Mettre à jour le statut si nécessaire
    UPDATE public.reports 
    SET status = CASE 
        WHEN votes_not_ia >= 100 THEN 'not_ia'
        WHEN votes_approve > votes_refute AND votes_approve >= 10 THEN 'ia'
        ELSE 'pending'
    END
    WHERE id = COALESCE(NEW.report_id, OLD.report_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger pour recalculer les stats après chaque vote
CREATE TRIGGER recalculate_report_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON public.votes 
    FOR EACH ROW EXECUTE FUNCTION recalculate_report_stats();

-- Fonction pour mettre à jour les points et l'indice de confiance utilisateur
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_id_to_update UUID;
    total_reports INTEGER;
    total_votes INTEGER;
    accurate_reports INTEGER;
BEGIN
    -- Déterminer l'utilisateur à mettre à jour
    IF TG_TABLE_NAME = 'reports' THEN
        user_id_to_update = COALESCE(NEW.user_id, OLD.user_id);
    ELSIF TG_TABLE_NAME = 'votes' THEN
        user_id_to_update = COALESCE(NEW.user_id, OLD.user_id);
    END IF;
    
    -- Calculer les nouvelles stats
    SELECT COUNT(*) INTO total_reports FROM public.reports WHERE user_id = user_id_to_update;
    SELECT COUNT(*) INTO total_votes FROM public.votes WHERE user_id = user_id_to_update;
    
    -- Calculer l'indice de confiance (rapports confirmés IA / total rapports)
    SELECT COUNT(*) INTO accurate_reports 
    FROM public.reports 
    WHERE user_id = user_id_to_update AND status = 'ia';
    
    -- Mettre à jour les stats utilisateur
    UPDATE public.users 
    SET 
        points_totaux = (total_reports * 10) + (total_votes * 1),
        indice_confiance = CASE 
            WHEN total_reports > 0 THEN ROUND((accurate_reports::DECIMAL / total_reports::DECIMAL), 2)
            ELSE 0.00
        END
    WHERE id = user_id_to_update;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour les stats utilisateur
CREATE TRIGGER update_user_stats_reports 
    AFTER INSERT OR UPDATE OR DELETE ON public.reports 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_user_stats_votes 
    AFTER INSERT OR UPDATE OR DELETE ON public.votes 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- RLS (Row Level Security) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist_requests ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies pour reports (lecture publique, écriture authentifiée)
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own reports" ON public.reports FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour votes (lecture publique, écriture authentifiée)
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create votes" ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own votes" ON public.votes FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- Policies pour whitelist_requests
CREATE POLICY "Users can view their own requests" ON public.whitelist_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create requests" ON public.whitelist_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');