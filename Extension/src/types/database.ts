export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          google_id: string
          pseudo: string
          avatar_url: string
          email: string
          created_at: string
          role: 'Free' | 'Premium' | 'Pro'
          points_totaux: number
          indice_confiance: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
        }
        Insert: {
          id?: string
          google_id: string
          pseudo: string
          avatar_url?: string
          email: string
          created_at?: string
          role?: 'Free' | 'Premium' | 'Pro'
          points_totaux?: number
          indice_confiance?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
        }
        Update: {
          id?: string
          google_id?: string
          pseudo?: string
          avatar_url?: string
          email?: string
          created_at?: string
          role?: 'Free' | 'Premium' | 'Pro'
          points_totaux?: number
          indice_confiance?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          url: string
          domain: string
          type_contenu: 'text' | 'image' | 'audio' | 'video'
          commentaire: string
          anonyme: boolean
          status: 'pending' | 'ia' | 'not_ia'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          domain: string
          type_contenu: 'text' | 'image' | 'audio' | 'video'
          commentaire?: string
          anonyme?: boolean
          status?: 'pending' | 'ia' | 'not_ia'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          domain?: string
          type_contenu?: 'text' | 'image' | 'audio' | 'video'
          commentaire?: string
          anonyme?: boolean
          status?: 'pending' | 'ia' | 'not_ia'
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          report_id: string
          vote_type: 'approve' | 'refute' | 'not_ia'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id: string
          vote_type: 'approve' | 'refute' | 'not_ia'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string
          vote_type?: 'approve' | 'refute' | 'not_ia'
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: number
          nom_badge: string
          type_badge: string
          seuil: number
          description: string
          couleur_fond: string
        }
        Insert: {
          id?: number
          nom_badge: string
          type_badge: string
          seuil: number
          description: string
          couleur_fond: string
        }
        Update: {
          id?: number
          nom_badge?: string
          type_badge?: string
          seuil?: number
          description?: string
          couleur_fond?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: number
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: number
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: number
          awarded_at?: string
        }
      }
      whitelist_domains: {
        Row: {
          id: string
          domain: string
          added_at: string
          added_by: string | null
          reason: string | null
          active: boolean
        }
        Insert: {
          id?: string
          domain: string
          added_at?: string
          added_by?: string | null
          reason?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          domain?: string
          added_at?: string
          added_by?: string | null
          reason?: string | null
          active?: boolean
        }
      }
      whitelist_requests: {
        Row: {
          id: string
          user_id: string
          domain: string
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          reason: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          reason?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_points: {
        Args: {
          user_id: string
          points_to_add: number
        }
        Returns: undefined
      }
      calculate_trust_index: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      check_and_award_badges: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_user_stats: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
