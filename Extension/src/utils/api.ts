import type { ApiResponse } from '../types';
import { supabase } from './supabase';

// URL de base pour les Edge Functions Supabase
const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

class ApiClient {  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Ajouter le token d'auth Supabase si disponible
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('[api.ts] Supabase access_token:', session.access_token);
      } else {
        console.warn('[api.ts] Aucun token Supabase trouvé, utilisateur probablement non connecté.');
      }
    } catch (error) {
      console.warn('Failed to get auth session:', error);
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      const text = await response.text();
      console.log('[api.ts] Raw response body:', text);
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('[api.ts] JSON parse error:', parseError);
        return { success: false, error: 'Invalid JSON response from server.' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  // Méthodes spécifiques à Arti AI Detector
  async getPageStatus(url: string): Promise<ApiResponse<any>> {
    const encodedUrl = encodeURIComponent(url);
    return this.get(`/get-page-status?url=${encodedUrl}`);
  }

  async createReport(data: {
    url: string;
    type_contenu: string;
    commentaire?: string;
    anonyme?: boolean;
    whitelist_request?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.post('/create-report', data); // Correction: endpoint avec tiret
  }
  async createVote(data: {
    report_id: string;
    vote_type: 'approve' | 'refute' | 'not_ai';
  }): Promise<ApiResponse<any>> {
    return this.post('/create-vote', data);
  }

  async getTopUsers(params?: {
    limit?: number;
    page?: number;
    period?: 'all' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.period) searchParams.set('period', params.period);
    
    const queryString = searchParams.toString();
    return this.get(`/get-top-users${queryString ? `?${queryString}` : ''}`);
  }
  async getRecentReports(params?: {
    limit?: number;
    page?: number;
    status?: 'pending' | 'ai' | 'not_ai';
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.status) searchParams.set('status', params.status);
    
    const queryString = searchParams.toString();
    return this.get(`/get-recent-reports${queryString ? `?${queryString}` : ''}`);
  }

  async getWhitelistDomains(): Promise<ApiResponse<any>> {
    return this.get('/get-whitelist-domains');
  }
  async createCheckoutSession(data: {
    plan: 'Premium' | 'Pro';
    return_url?: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/create-checkout-session', data);
  }
}

export const apiClient = new ApiClient();
