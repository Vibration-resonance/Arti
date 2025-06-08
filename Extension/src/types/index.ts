export interface User {
  id: string;
  google_id: string;
  pseudo: string;
  avatar_url: string;
  email: string;
  created_at: string;
  role: UserRole;
  points_totaux: number;
  indice_confiance: number;
}

export type UserRole = 'Free' | 'Premium' | 'Pro';

export interface Report {
  id: string;
  user_id: string;
  url: string;
  domain: string;
  type_contenu: ContentType;
  commentaire: string;
  anonyme: boolean;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  user?: User;
  votes?: Vote[];
}

export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'other';
export type ReportStatus = 'pending' | 'ia' | 'not_ia';

export interface Vote {
  id: string;
  user_id: string;
  report_id: string;
  vote_type: VoteType;
  created_at: string;
  user?: User;
}

export type VoteType = 'approve' | 'refute' | 'not_ia';

export interface Badge {
  id: number;
  nom_badge: string;
  type_badge: BadgeType;
  seuil: number;
  icon_url: string;
  couleur_fond: string;
}

export type BadgeType = 'report' | 'vote' | 'votes_received' | 'trust_index' | 'special';

export interface BadgeObtenu {
  id: string;
  user_id: string;
  badge_id: number;
  attribue_le: string;
  badge?: Badge;
}

export interface PageStatus {
  url: string;
  domain: string;
  status: PageStatusType;
  is_whitelisted: boolean;
  reports: Report[];
  domain_reports_count: number;
  confidence_score: number;
}

export type PageStatusType = 'ai' | 'not_ai' | 'pending' | 'unknown' | 'whitelisted';

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  stripe_subscription_id: string;
  started_at: string;
  ended_at?: string;
}

export interface LeaderboardUser {
  user: User;
  badges: BadgeObtenu[];
  rank: number;
  reports_count: number;
  votes_count: number;
  votes_received: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ExtensionSettings {
  language: 'fr' | 'en';
  showFloatingButton: boolean;
  showNotifications: boolean;
  anonymousMode: boolean;
  theme: 'light' | 'dark' | 'auto';
}
