/**
 * Cliente Supabase y Configuración de Conexión
 * Conectado directamente al proyecto institucional de Supabase / PostgreSQL
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'sena_gdhc_supabase_config_v3';

// Credenciales institucionales por defecto de Supabase
export const DEFAULT_SUPABASE_URL = 'https://hpplpuaurwqdnqvyybka.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcGxwdWF1cndxZG5xdnl5YmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjY3MDQsImV4cCI6MjEwMzUwMjcwNH0.hkzmniU-Y636NMwDTPTbFX1MfsCreH5khsVWabTAZpE';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastTested?: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const activeUrl = envUrl || parsed.url || DEFAULT_SUPABASE_URL;
      const activeKey = envKey || parsed.anonKey || DEFAULT_SUPABASE_ANON_KEY;
      return {
        url: activeUrl,
        anonKey: activeKey,
        connected: true,
        lastTested: parsed.lastTested || new Date().toISOString(),
      };
    }
  } catch {
    // fallback
  }

  const activeUrl = envUrl || DEFAULT_SUPABASE_URL;
  const activeKey = envKey || DEFAULT_SUPABASE_ANON_KEY;

  return {
    url: activeUrl,
    anonKey: activeKey,
    connected: true,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  supabaseInstance = null; // Reiniciar instancia para aplicar nuevas credenciales
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  const url = (config.url || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (config.anonKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  if (url && anonKey) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      } catch (e) {
        console.error('Error creating Supabase client:', e);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
      return { success: false, message: 'La URL debe comenzar con https:// y tener el dominio .supabase.co' };
    }
    if (!cleanKey || cleanKey.length < 20) {
      return { success: false, message: 'La anon key pública parece inválida o muy corta.' };
    }

    const testClient = createClient(cleanUrl, cleanKey);
    // Intentar una consulta a la tabla profiles
    const { error } = await testClient.from('profiles').select('id, cedula', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: `Error de conexión: ${error.message} (Código: ${error.code})` };
    }

    return { success: true, message: 'Conexión a Supabase establecida y validada correctamente.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'No se pudo contactar el servidor de Supabase.' };
  }
}
