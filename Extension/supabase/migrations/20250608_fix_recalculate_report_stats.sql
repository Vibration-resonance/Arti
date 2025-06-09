-- Correction de la fonction recalculate_report_stats pour ne plus jamais mettre status = 'pending'
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
        ELSE 'ia'
    END
    WHERE id = COALESCE(NEW.report_id, OLD.report_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';
