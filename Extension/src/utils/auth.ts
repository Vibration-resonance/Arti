import { supabase } from './supabase';
import type { User } from '../types';

export class AuthService {  /**
   * Connexion avec Google OAuth en utilisant chrome.identity
   */  async signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Utiliser chrome.identity pour obtenir le token d'authentification Google
      const authToken = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(token);
        });
      });
      
      if (!authToken) {
        throw new Error('Failed to get auth token from Google');
      }
      
      // Obtenir les informations utilisateur depuis Google avec le token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }
      
      const userInfo = await userInfoResponse.json();      // Au lieu d'utiliser signInWithIdToken ou signInWithOAuth, utilisons directement 
      // les données utilisateur que nous avons obtenues de Google pour créer/connecter l'utilisateur
      let { error: authError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: `google-auth-${userInfo.sub}`,
        options: {
          data: {
            full_name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.sub,
            email_verified: userInfo.email_verified
          }
        }
      });
      
      // Si l'utilisateur existe déjà, connectez-le
      if (authError && authError.message.includes('User already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userInfo.email,
          password: `google-auth-${userInfo.sub}`
        });
        
        if (signInError) {
          throw signInError;
        }
      } 
      // Pour toute autre erreur, la renvoyer
      else if (authError) {
        throw authError;
      }

      // Vérifier que la session est établie
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Créer ou mettre à jour l'utilisateur dans notre base
        const user = await this.createOrUpdateUser(session.user);
        return { success: true, user };
      }

      return { success: false, error: 'No session established' };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Sign-out error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign-out failed' 
      };
    }
  }

  /**
   * Obtenir l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Récupérer les données utilisateur de notre base
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          user_badges:user_badges(
            badge:badges(*)
          )
        `)
        .eq('id', session.user.id) // Corrected: use 'id' instead of 'google_id'
        .single();

      if (error || !userData) {
        console.error('Get current user error (Supabase error object or !userData):', error || 'No user data found, attempting to create/update.');
        // Si l'utilisateur n'existe pas dans notre base, le créer
        return await this.createOrUpdateUser(session.user);
      }

      return userData as User;
    } catch (error) {
      console.error('Get current user error (outer catch):', error);
      return null;
    }
  }

  /**
   * Écouter les changements d'authentification
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
  /**
   * Créer ou mettre à jour un utilisateur dans notre base
   */
  private async createOrUpdateUser(authUser: any): Promise<User> {
    const googleSub = authUser.user_metadata?.sub;
    if (!googleSub) {
      console.error("Google 'sub' ID is missing from user_metadata. Cannot create/update user in public table correctly.");
      throw new Error("Missing Google user identifier in user_metadata for createOrUpdateUser.");
    }

    const userData = {
      id: authUser.id, // Crucial: Set the public.users.id to auth.user.id
      google_id: googleSub, 
      email: authUser.email || '',
      pseudo: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur',
      avatar_url: authUser.user_metadata?.picture || authUser.user_metadata?.avatar_url || '',
      role: 'Free' as const,
      points_totaux: 0,
      indice_confiance: 0
    };

    // Essayer d'insérer ou mettre à jour
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'google_id', // This now correctly uses Google's 'sub'
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating user (Supabase error object):', error);
      throw new Error(error.message || 'Supabase upsert failed in createOrUpdateUser');
    }
    if (!data) { // Ensure data is returned
        throw new Error('User data not returned after upsert in createOrUpdateUser.');
    }
    return data as User;
  }

  /**
   * Vérifier si l'utilisateur est Premium/Pro
   */
  async isUserPremium(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'Premium' || user?.role === 'Pro';
  }

  /**
   * Vérifier si l'utilisateur est Pro
   */
  async isUserPro(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'Pro';
  }
}

export const authService = new AuthService();
