import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Hard-coded values for Chrome extension environment
// These values would normally be in .env file, but for extensions we need them directly in the code
const supabaseUrl = 'https://ybdwktfpcccxntmboqpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZHdrdGZwY2NjeG50bWJvcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTMzMTUsImV4cCI6MjA2NDU4OTMxNX0.KbP_5c7okqFbkhn6oVmQLaEbfnLG0rYNJ7eKIbkOSwg';

// Custom storage implementation that works in both background service workers and regular contexts
const createCustomStorage = () => {
  return {
    async getItem(key: string): Promise<string | null> {
      return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
          resolve(result[key] || null);
        });
      });
    },
    async setItem(key: string, value: string): Promise<void> {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    },
    async removeItem(key: string): Promise<void> {
      return new Promise((resolve) => {
        chrome.storage.local.remove(key, resolve);
      });
    }
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: createCustomStorage(),
    storageKey: 'arti-ai-detector-auth',
    autoRefreshToken: true,
  },
});

export default supabase;
