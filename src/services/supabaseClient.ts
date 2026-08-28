/**
 * Cliente Supabase y Configuración de Conexión
 * Permite alternar entre base de datos local y proyecto remoto en Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'sena_gdhc_supabase_config_v3';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastTested?: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        connected: parsed.connected ?? (!!(parsed.url || envUrl) && !!(parsed.anonKey || envKey)),
        lastTested: parsed.lastTested,
      };
    }
  } catch {
    // fallback
  }

  return {
    url: envUrl,
    anonKey: envKey,
    connected: !!envUrl && !!envKey,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  supabaseInstance = null; // Reiniciar instancia para aplicar nuevas credenciales
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(config.url.trim(), config.anonKey.trim(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
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
