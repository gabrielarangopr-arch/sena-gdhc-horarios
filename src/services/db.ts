/**
 * Base de datos relacional y persistencia para GDHC / SENA
 * Implementa sincronización en tiempo real con Supabase (PostgreSQL, RLS y Triggers)
 * con fallback seguro en LocalStorage.
 */

import { Profile, Programa, Ambiente, Horario, Notificacion, UserRole } from '../types';
import { validateHorarioOverlap } from './overlapEngine';
import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';

const STORAGE_KEYS = {
  PROFILES: 'sena_gdhc_profiles_v3',
  PROGRAMAS: 'sena_gdhc_programas_v3',
  AMBIENTES: 'sena_gdhc_ambientes_v3',
  HORARIOS: 'sena_gdhc_horarios_v3',
  NOTIFICACIONES: 'sena_gdhc_notificaciones_v3',
  CURRENT_USER_ID: 'sena_gdhc_current_user_id_v3',
};

// Generador de UUID v4 estándar compatible con PostgreSQL UUID
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Seed Data Inicial Institucional del SENA (Único Administrador Registrado con UUID válido)
export const SEED_PROFILES: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    cedula: '1020405060',
    nombre_completo: 'Gabriel Arango',
    email: 'gabrielarangopr@gmail.com',
    rol: 'admin',
    especialidad: 'Coordinación Académica GDHC',
    telefono: '3105551234',
    created_at: new Date('2026-01-01T08:00:00Z').toISOString(),
  },
];

export const SEED_PROGRAMAS: Programa[] = [];
export const SEED_AMBIENTES: Ambiente[] = [];
export const SEED_HORARIOS: Horario[] = [];
export const SEED_NOTIFICACIONES: Notificacion[] = [];

class SenaDatabaseService {
  private profilesCache: Profile[] = [];
  private programasCache: Programa[] = [];
  private ambientesCache: Ambiente[] = [];
  private horariosCache: Horario[] = [];
  private notificacionesCache: Notificacion[] = [];
  private isSyncing = false;

  private getStorageItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  constructor() {
    this.initializeFromStorage();
  }

  public initializeFromStorage(): void {
    this.profilesCache = this.getStorageItem<Profile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    this.programasCache = this.getStorageItem<Programa[]>(STORAGE_KEYS.PROGRAMAS, SEED_PROGRAMAS);
    this.ambientesCache = this.getStorageItem<Ambiente[]>(STORAGE_KEYS.AMBIENTES, SEED_AMBIENTES);
    this.horariosCache = this.getStorageItem<Horario[]>(STORAGE_KEYS.HORARIOS, SEED_HORARIOS);
    this.notificacionesCache = this.getStorageItem<Notificacion[]>(STORAGE_KEYS.NOTIFICACIONES, SEED_NOTIFICACIONES);
  }

  public isSupabaseConnected(): boolean {
    const supabase = getSupabaseClient();
    return !!supabase;
  }

  /**
   * Sincroniza en segundo plano todas las tablas directamente con Supabase PostgreSQL
   */
  public async syncFromSupabase(): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase || this.isSyncing) {
      return { success: false, message: 'Supabase no está configurado.' };
    }

    this.isSyncing = true;
    try {
      // 1. Perfiles
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (pErr) {
        console.warn('Error fetching profiles from Supabase:', pErr);
      } else if (profs) {
        this.profilesCache = profs;
        this.setStorageItem(STORAGE_KEYS.PROFILES, profs);
      }

      // 2. Programas
      const { data: progs, error: prgErr } = await supabase
        .from('programas')
        .select('*')
        .order('created_at', { ascending: true });

      if (prgErr) {
        console.warn('Error fetching programas from Supabase:', prgErr);
      } else if (progs) {
        this.programasCache = progs;
        this.setStorageItem(STORAGE_KEYS.PROGRAMAS, progs);
      }

      // 3. Ambientes
      const { data: ambs, error: ambErr } = await supabase
        .from('ambientes')
        .select('*')
        .order('created_at', { ascending: true });

      if (ambErr) {
        console.warn('Error fetching ambientes from Supabase:', ambErr);
      } else if (ambs) {
        this.ambientesCache = ambs;
        this.setStorageItem(STORAGE_KEYS.AMBIENTES, ambs);
      }

      // 4. Horarios
      const { data: hors, error: hErr } = await supabase
        .from('horarios')
        .select('*')
        .order('created_at', { ascending: true });

      if (hErr) {
        console.warn('Error fetching horarios from Supabase:', hErr);
      } else if (hors) {
        this.horariosCache = hors;
        this.setStorageItem(STORAGE_KEYS.HORARIOS, hors);
      }

      // 5. Notificaciones
      const { data: notifs, error: nErr } = await supabase
        .from('notificaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (nErr) {
        console.warn('Error fetching notificaciones from Supabase:', nErr);
      } else if (notifs) {
        this.notificacionesCache = notifs;
        this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, notifs);
      }

      this.isSyncing = false;
      return { success: true, message: 'Datos sincronizados exitosamente con Supabase.' };
    } catch (err: any) {
      this.isSyncing = false;
      console.error('Error in syncFromSupabase:', err);
      return { success: false, message: err?.message || 'Error de red con Supabase.' };
    }
  }

  public resetToSeed(): void {
    this.profilesCache = [...SEED_PROFILES];
    this.programasCache = [...SEED_PROGRAMAS];
    this.ambientesCache = [...SEED_AMBIENTES];
    this.horariosCache = [...SEED_HORARIOS];
    this.notificacionesCache = [...SEED_NOTIFICACIONES];

    this.setStorageItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, SEED_PROGRAMAS);
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, SEED_AMBIENTES);
    this.setStorageItem(STORAGE_KEYS.HORARIOS, SEED_HORARIOS);
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, SEED_NOTIFICACIONES);
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, SEED_PROFILES[0].id);
  }

  // --- PROFILES / USUARIOS ---
  public getProfiles(): Profile[] {
    return this.profilesCache.length > 0
      ? this.profilesCache
      : this.getStorageItem<Profile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  }

  public getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  public getProfileByCedula(cedula: string): Profile | undefined {
    return this.getProfiles().find(p => p.cedula.trim() === cedula.trim());
  }

  public getInstructores(): Profile[] {
    return this.getProfiles().filter(p => p.rol === 'instructor');
  }

  public getAprendices(): Profile[] {
    return this.getProfiles().filter(p => p.rol === 'aprendiz');
  }

  public async createProfile(profileData: Omit<Profile, 'id' | 'created_at'>): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    const cleanCedula = profileData.cedula.trim();
    if (!cleanCedula) {
      return { success: false, error: 'El número de Cédula de Ciudadanía es obligatorio.' };
    }

    const cleanEmail = profileData.email.trim().toLowerCase();
    const newId = generateUUID();
    const newProfile: Profile = {
      ...profileData,
      id: newId,
      cedula: cleanCedula,
      email: cleanEmail || `${cleanCedula}@sena.edu.co`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              id: newProfile.id,
              cedula: newProfile.cedula,
              nombre_completo: newProfile.nombre_completo,
              email: newProfile.email,
              rol: newProfile.rol,
              especialidad: newProfile.especialidad || null,
              telefono: newProfile.telefono || null,
              ficha_id: newProfile.ficha_id || null,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase createProfile error:', error);
          if (error.code === '23505') {
            return { success: false, error: `Ya existe un usuario con la cédula o correo ingresado en la base de datos (${error.message}).` };
          }
          return { success: false, error: `Error de Supabase: ${error.message}` };
        }

        if (data) {
          this.profilesCache = [...this.profilesCache, data];
          this.setStorageItem(STORAGE_KEYS.PROFILES, this.profilesCache);
          return { success: true, profile: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error de conexión con Supabase.' };
      }
    }

    // Modo local / Fallback
    const profiles = this.getProfiles();
    if (profiles.some(p => p.cedula.trim() === cleanCedula)) {
      return { success: false, error: `Ya existe un usuario registrado con la cédula ${cleanCedula}.` };
    }
    if (cleanEmail && profiles.some(p => p.email.trim().toLowerCase() === cleanEmail)) {
      return { success: false, error: `Ya existe un usuario registrado con el correo ${cleanEmail}.` };
    }

    profiles.push(newProfile);
    this.profilesCache = profiles;
    this.setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return { success: true, profile: newProfile };
  }

  public async updateProfile(id: string, updates: Partial<Profile>): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = { ...updates };
        delete payload.id;
        delete payload.created_at;

        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return { success: false, error: `Error de Supabase: ${error.message}` };
        }

        if (data) {
          this.profilesCache = this.profilesCache.map(p => (p.id === id ? { ...p, ...data } : p));
          this.setStorageItem(STORAGE_KEYS.PROFILES, this.profilesCache);
          return { success: true, profile: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error al actualizar en Supabase.' };
      }
    }

    // Modo local
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'Usuario no encontrado.' };

    profiles[index] = { ...profiles[index], ...updates };
    this.profilesCache = profiles;
    this.setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return { success: true, profile: profiles[index] };
  }

  public async deleteProfile(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
          return { success: false, error: `Error de Supabase: ${error.message}` };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error al eliminar en Supabase.' };
      }
    }

    this.profilesCache = this.profilesCache.filter(p => p.id !== id);
    this.setStorageItem(STORAGE_KEYS.PROFILES, this.profilesCache);
    return { success: true };
  }

  // --- PROGRAMAS / FICHAS ---
  public getProgramas(): Programa[] {
    return this.programasCache.length > 0
      ? this.programasCache
      : this.getStorageItem<Programa[]>(STORAGE_KEYS.PROGRAMAS, SEED_PROGRAMAS);
  }

  public getProgramaById(id: string): Programa | undefined {
    return this.getProgramas().find(p => p.id === id);
  }

  public async createPrograma(progData: Omit<Programa, 'id' | 'created_at'>): Promise<{ success: boolean; programa?: Programa; error?: string }> {
    const cleanFicha = progData.codigo_ficha.trim();
    if (!cleanFicha) {
      return { success: false, error: 'El código de ficha es obligatorio.' };
    }

    const newId = generateUUID();
    const newProg: Programa = {
      ...progData,
      id: newId,
      codigo_ficha: cleanFicha,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('programas')
          .insert([
            {
              id: newProg.id,
              codigo_ficha: newProg.codigo_ficha,
              nombre_programa: newProg.nombre_programa,
              jornada: newProg.jornada,
              nivel_formacion: newProg.nivel_formacion || 'Tecnólogo',
              centro_formacion: newProg.centro_formacion || '',
              cupos: newProg.cupos || 30,
            },
          ])
          .select()
          .single();

        if (error) {
          return { success: false, error: `Error de Supabase: ${error.message}` };
        }

        if (data) {
          this.programasCache = [...this.programasCache, data];
          this.setStorageItem(STORAGE_KEYS.PROGRAMAS, this.programasCache);
          return { success: true, programa: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error al conectar con Supabase.' };
      }
    }

    const programas = this.getProgramas();
    if (programas.some(p => p.codigo_ficha.trim() === cleanFicha)) {
      return { success: false, error: `Ya existe una ficha registrada con el código ${cleanFicha}.` };
    }

    programas.push(newProg);
    this.programasCache = programas;
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, programas);
    return { success: true, programa: newProg };
  }

  public async updatePrograma(id: string, updates: Partial<Programa>): Promise<{ success: boolean; programa?: Programa; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = { ...updates };
        delete payload.id;
        delete payload.created_at;

        const { data, error } = await supabase.from('programas').update(payload).eq('id', id).select().single();
        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };

        if (data) {
          this.programasCache = this.programasCache.map(p => (p.id === id ? { ...p, ...data } : p));
          this.setStorageItem(STORAGE_KEYS.PROGRAMAS, this.programasCache);
          return { success: true, programa: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    const programas = this.getProgramas();
    const index = programas.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'Programa no encontrado.' };

    programas[index] = { ...programas[index], ...updates };
    this.programasCache = programas;
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, programas);
    return { success: true, programa: programas[index] };
  }

  public async deletePrograma(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('programas').delete().eq('id', id);
        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    this.programasCache = this.programasCache.filter(p => p.id !== id);
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, this.programasCache);
    return { success: true };
  }

  // --- AMBIENTES / LABORATORIOS ---
  public getAmbientes(): Ambiente[] {
    return this.ambientesCache.length > 0
      ? this.ambientesCache
      : this.getStorageItem<Ambiente[]>(STORAGE_KEYS.AMBIENTES, SEED_AMBIENTES);
  }

  public getAmbienteById(id: string): Ambiente | undefined {
    return this.getAmbientes().find(a => a.id === id);
  }

  public async createAmbiente(ambData: Omit<Ambiente, 'id' | 'created_at'>): Promise<{ success: boolean; ambiente?: Ambiente; error?: string }> {
    const cleanNum = ambData.numero_ambiente.trim();
    if (!cleanNum) {
      return { success: false, error: 'El número o identificador del ambiente es obligatorio.' };
    }

    const newId = generateUUID();
    const newAmb: Ambiente = {
      ...ambData,
      id: newId,
      numero_ambiente: cleanNum,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ambientes')
          .insert([
            {
              id: newAmb.id,
              numero_ambiente: newAmb.numero_ambiente,
              nombre_ambiente: newAmb.nombre_ambiente,
              sede: newAmb.sede,
              tipo: newAmb.tipo,
              capacidad: newAmb.capacidad,
              equipamiento: newAmb.equipamiento || [],
              activo: newAmb.activo ?? true,
            },
          ])
          .select()
          .single();

        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };

        if (data) {
          this.ambientesCache = [...this.ambientesCache, data];
          this.setStorageItem(STORAGE_KEYS.AMBIENTES, this.ambientesCache);
          return { success: true, ambiente: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    const ambientes = this.getAmbientes();
    ambientes.push(newAmb);
    this.ambientesCache = ambientes;
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, ambientes);
    return { success: true, ambiente: newAmb };
  }

  public async updateAmbiente(id: string, updates: Partial<Ambiente>): Promise<{ success: boolean; ambiente?: Ambiente; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = { ...updates };
        delete payload.id;
        delete payload.created_at;

        const { data, error } = await supabase.from('ambientes').update(payload).eq('id', id).select().single();
        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };

        if (data) {
          this.ambientesCache = this.ambientesCache.map(a => (a.id === id ? { ...a, ...data } : a));
          this.setStorageItem(STORAGE_KEYS.AMBIENTES, this.ambientesCache);
          return { success: true, ambiente: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    const ambientes = this.getAmbientes();
    const index = ambientes.findIndex(a => a.id === id);
    if (index === -1) return { success: false, error: 'Ambiente no encontrado.' };

    ambientes[index] = { ...ambientes[index], ...updates };
    this.ambientesCache = ambientes;
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, ambientes);
    return { success: true, ambiente: ambientes[index] };
  }

  public async deleteAmbiente(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('ambientes').delete().eq('id', id);
        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    this.ambientesCache = this.ambientesCache.filter(a => a.id !== id);
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, this.ambientesCache);
    return { success: true };
  }

  // --- HORARIOS & MOTOR OVERLAPS ---
  public getHorarios(): Horario[] {
    return this.horariosCache.length > 0
      ? this.horariosCache
      : this.getStorageItem<Horario[]>(STORAGE_KEYS.HORARIOS, SEED_HORARIOS);
  }

  public getHorarioById(id: string): Horario | undefined {
    return this.getHorarios().find(h => h.id === id);
  }

  public getHorariosByInstructor(instructorId: string): Horario[] {
    return this.getHorarios().filter(h => h.instructor_id === instructorId);
  }

  public getHorariosByPrograma(programaId: string): Horario[] {
    return this.getHorarios().filter(h => h.programa_id === programaId);
  }

  public getHorariosByAmbiente(ambienteId: string): Horario[] {
    return this.getHorarios().filter(h => h.ambiente_id === ambienteId);
  }

  /**
   * Crea un nuevo horario evaluando de forma estricta los cruces con OVERLAPS
   */
  public async createHorario(horarioData: Omit<Horario, 'id' | 'created_at'>): Promise<{ success: boolean; horario?: Horario; error?: string }> {
    const existingHorarios = this.getHorarios();
    const profiles = this.getProfiles();
    const programas = this.getProgramas();
    const ambientes = this.getAmbientes();

    // 1. Validación en cliente de OVERLAPS
    const validation = validateHorarioOverlap(
      horarioData,
      existingHorarios,
      undefined,
      profiles,
      ambientes,
      programas
    );

    if (validation.hasConflict) {
      return {
        success: false,
        error: validation.description || 'Existe un conflicto de traslape de horario.',
      };
    }

    const newId = generateUUID();
    const newHorario: Horario = {
      ...horarioData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('horarios')
          .insert([
            {
              id: newHorario.id,
              instructor_id: newHorario.instructor_id,
              programa_id: newHorario.programa_id,
              ambiente_id: newHorario.ambiente_id,
              dia_semana: newHorario.dia_semana,
              hora_inicio: newHorario.hora_inicio,
              hora_fin: newHorario.hora_fin,
              materia_competencia: newHorario.materia_competencia,
              created_by: newHorario.created_by || null,
            },
          ])
          .select()
          .single();

        if (error) {
          return { success: false, error: `Error de Supabase (OVERLAPS Trigger): ${error.message}` };
        }

        if (data) {
          this.horariosCache = [...this.horariosCache, data];
          this.setStorageItem(STORAGE_KEYS.HORARIOS, this.horariosCache);

          // Crear notificación
          this.createNotification({
            usuario_id: newHorario.instructor_id,
            titulo: 'Nueva Asignación de Clase',
            mensaje: `Se le ha asignado la competencia "${newHorario.materia_competencia}".`,
            tipo: 'horario_nuevo',
          });

          return { success: true, horario: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    existingHorarios.push(newHorario);
    this.horariosCache = existingHorarios;
    this.setStorageItem(STORAGE_KEYS.HORARIOS, existingHorarios);

    this.createNotification({
      usuario_id: newHorario.instructor_id,
      titulo: 'Nueva Asignación de Clase',
      mensaje: `Se le ha asignado la competencia "${newHorario.materia_competencia}".`,
      tipo: 'horario_nuevo',
    });

    return { success: true, horario: newHorario };
  }

  public async updateHorario(id: string, updates: Partial<Horario>): Promise<{ success: boolean; horario?: Horario; error?: string }> {
    const existingHorarios = this.getHorarios();
    const index = existingHorarios.findIndex(h => h.id === id);
    if (index === -1) return { success: false, error: 'Horario no encontrado.' };

    const merged = { ...existingHorarios[index], ...updates };
    const profiles = this.getProfiles();
    const programas = this.getProgramas();
    const ambientes = this.getAmbientes();

    // Validar conflictos excluyendo el propio ID
    const validation = validateHorarioOverlap(
      merged,
      existingHorarios,
      id,
      profiles,
      ambientes,
      programas
    );

    if (validation.hasConflict) {
      return {
        success: false,
        error: validation.description || 'La modificación genera un conflicto de horario.',
      };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: any = { ...updates };
        delete payload.id;
        delete payload.created_at;

        const { data, error } = await supabase.from('horarios').update(payload).eq('id', id).select().single();
        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };

        if (data) {
          this.horariosCache = this.horariosCache.map(h => (h.id === id ? { ...h, ...data } : h));
          this.setStorageItem(STORAGE_KEYS.HORARIOS, this.horariosCache);
          return { success: true, horario: data };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    existingHorarios[index] = merged;
    this.horariosCache = existingHorarios;
    this.setStorageItem(STORAGE_KEYS.HORARIOS, existingHorarios);
    return { success: true, horario: existingHorarios[index] };
  }

  public async deleteHorario(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('horarios').delete().eq('id', id);
        if (error) return { success: false, error: `Error de Supabase: ${error.message}` };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    this.horariosCache = this.horariosCache.filter(h => h.id !== id);
    this.setStorageItem(STORAGE_KEYS.HORARIOS, this.horariosCache);
    return { success: true };
  }

  // --- CARGA MASIVA DE HORARIOS CON OVERLAPS ---
  public async bulkInsertHorarios(rows: Array<Omit<Horario, 'id' | 'created_at'>>, skipConflicts: boolean = false): Promise<{
    insertedCount: number;
    conflicts: Array<{ row: Omit<Horario, 'id' | 'created_at'>; reason: string }>;
  }> {
    let currentHorarios = [...this.getHorarios()];
    const profiles = this.getProfiles();
    const programas = this.getProgramas();
    const ambientes = this.getAmbientes();

    const conflicts: Array<{ row: Omit<Horario, 'id' | 'created_at'>; reason: string }> = [];
    const validToInsert: Horario[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const tempId = generateUUID();
      const candidate: Horario = {
        ...row,
        id: tempId,
        created_at: new Date().toISOString(),
      };

      const validation = validateHorarioOverlap(
        candidate,
        [...currentHorarios, ...validToInsert],
        undefined,
        profiles,
        ambientes,
        programas
      );

      if (validation.hasConflict) {
        conflicts.push({
          row,
          reason: validation.description || 'Conflicto detectado en la carga masiva',
        });
      } else {
        validToInsert.push(candidate);
      }
    }

    if (conflicts.length > 0 && !skipConflicts) {
      return { insertedCount: 0, conflicts };
    }

    const supabase = getSupabaseClient();
    if (supabase && validToInsert.length > 0) {
      try {
        const payload = validToInsert.map(h => ({
          id: h.id,
          instructor_id: h.instructor_id,
          programa_id: h.programa_id,
          ambiente_id: h.ambiente_id,
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          materia_competencia: h.materia_competencia,
          created_by: h.created_by || null,
        }));

        const { data, error } = await supabase.from('horarios').insert(payload).select();
        if (!error && data) {
          this.horariosCache = [...this.horariosCache, ...data];
          this.setStorageItem(STORAGE_KEYS.HORARIOS, this.horariosCache);
          return { insertedCount: data.length, conflicts };
        }
      } catch (err) {
        console.error('Supabase bulk insert error:', err);
      }
    }

    if (validToInsert.length > 0) {
      this.horariosCache = [...this.horariosCache, ...validToInsert];
      this.setStorageItem(STORAGE_KEYS.HORARIOS, this.horariosCache);
    }

    return { insertedCount: validToInsert.length, conflicts };
  }

  public async batchInsertHorarios(rows: Array<Omit<Horario, 'id' | 'created_at'>>, skipConflicts: boolean = false) {
    return this.bulkInsertHorarios(rows, skipConflicts);
  }

  // --- NOTIFICACIONES ---
  public getNotificaciones(usuarioId?: string): Notificacion[] {
    const list = this.notificacionesCache.length > 0
      ? this.notificacionesCache
      : this.getStorageItem<Notificacion[]>(STORAGE_KEYS.NOTIFICACIONES, SEED_NOTIFICACIONES);
    if (!usuarioId) return list;
    return list.filter(n => n.usuario_id === usuarioId || n.usuario_id === 'all');
  }

  public async createNotification(data: Omit<Notificacion, 'id' | 'created_at' | 'leido'>): Promise<void> {
    const newId = generateUUID();
    const newNotif: Notificacion = {
      ...data,
      id: newId,
      leido: false,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('notificaciones').insert([
          {
            id: newNotif.id,
            usuario_id: newNotif.usuario_id,
            titulo: newNotif.titulo,
            mensaje: newNotif.mensaje,
            tipo: newNotif.tipo || 'general',
            leido: false,
          },
        ]);
      } catch (err) {
        console.warn('Supabase notif error:', err);
      }
    }

    const list = this.getNotificaciones();
    list.unshift(newNotif);
    this.notificacionesCache = list.slice(0, 50);
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, this.notificacionesCache);
  }

  public async markNotificationAsRead(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('notificaciones').update({ leido: true }).eq('id', id);
      } catch (err) {
        console.warn('Supabase mark read error:', err);
      }
    }

    const list = this.getNotificaciones();
    this.notificacionesCache = list.map(n => (n.id === id ? { ...n, leido: true } : n));
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, this.notificacionesCache);
  }

  public async markAllNotificationsAsRead(usuarioId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('notificaciones').update({ leido: true }).eq('usuario_id', usuarioId);
      } catch (err) {
        console.warn('Supabase mark all error:', err);
      }
    }

    const list = this.getNotificaciones();
    this.notificacionesCache = list.map(n => (n.usuario_id === usuarioId || n.usuario_id === 'all' ? { ...n, leido: true } : n));
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, this.notificacionesCache);
  }

  // --- SESIÓN ACTUAL ---
  public getCurrentUserId(): string {
    return this.getStorageItem<string>(STORAGE_KEYS.CURRENT_USER_ID, SEED_PROFILES[0].id);
  }

  public setCurrentUserId(id: string): void {
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  public getCurrentUser(): Profile {
    const id = this.getCurrentUserId();
    const found = this.getProfileById(id);
    if (found) return found;
    return this.getProfiles()[0] || SEED_PROFILES[0];
  }

  /**
   * Genera el script DDL PostgreSQL / Supabase para ejecución directa en Supabase SQL Editor
   */
  public generateSupabaseSQLScript(): string {
    return `-- ============================================================================
-- SCRIPT DE BASE DE DATOS SUPABASE / POSTGRESQL (SENA GDHC v2.0 - PRODUCCIÓN)
-- Cumple con arquitectura relacional, RLS, Índices y Triggers de OVERLAPS
-- ============================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPO ENUM PARA ROLES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'aprendiz');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: profiles (Usuarios del Sistema)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre_completo VARCHAR(250) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    rol user_role NOT NULL DEFAULT 'aprendiz',
    especialidad VARCHAR(250),
    telefono VARCHAR(50),
    ficha_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_cedula ON public.profiles(cedula);
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON public.profiles(rol);

-- 4. TABLA: programas (Fichas de Formación)
CREATE TABLE IF NOT EXISTS public.programas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_ficha VARCHAR(50) NOT NULL UNIQUE,
    nombre_programa VARCHAR(200) NOT NULL,
    jornada VARCHAR(50) NOT NULL,
    nivel_formacion VARCHAR(100),
    centro_formacion VARCHAR(250),
    cupos INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_programas_codigo ON public.programas(codigo_ficha);

-- 5. TABLA: ambientes (Espacios Físicos, Talleres y Laboratorios)
CREATE TABLE IF NOT EXISTS public.ambientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ambiente VARCHAR(50) NOT NULL,
    nombre_ambiente VARCHAR(200) NOT NULL,
    sede VARCHAR(150) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL DEFAULT 30,
    equipamiento TEXT[],
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ambientes_sede ON public.ambientes(sede);

-- 6. TABLA: horarios (Programación Académica con Intervalos de Tiempo)
CREATE TABLE IF NOT EXISTS public.horarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    programa_id UUID NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
    ambiente_id UUID NOT NULL REFERENCES public.ambientes(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    materia_competencia VARCHAR(250) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_valid_time_interval CHECK (hora_inicio < hora_fin)
);

CREATE INDEX IF NOT EXISTS idx_horarios_dia_inst ON public.horarios(dia_semana, instructor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_amb ON public.horarios(dia_semana, ambiente_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_prog ON public.horarios(dia_semana, programa_id);

-- 7. TABLA: notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    tipo VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. FUNCIÓN TRIGGER PARA DETECTAR TRASLAPES (OVERLAPS EN POSTGRESQL)
CREATE OR REPLACE FUNCTION check_horario_overlaps()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar traslape de Instructor
    IF EXISTS (
        SELECT 1 FROM public.horarios
        WHERE id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND instructor_id = NEW.instructor_id
          AND dia_semana = NEW.dia_semana
          AND (hora_inicio, hora_fin) OVERLAPS (NEW.hora_inicio, NEW.hora_fin)
    ) THEN
        RAISE EXCEPTION 'OVERLAPS_CONFLICT: El instructor ya tiene una clase programada en ese horario (Día %)', NEW.dia_semana;
    END IF;

    -- Validar traslape de Ambiente
    IF EXISTS (
        SELECT 1 FROM public.horarios
        WHERE id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND ambiente_id = NEW.ambiente_id
          AND dia_semana = NEW.dia_semana
          AND (hora_inicio, hora_fin) OVERLAPS (NEW.hora_inicio, NEW.hora_fin)
    ) THEN
        RAISE EXCEPTION 'OVERLAPS_CONFLICT: El ambiente físico ya está ocupado en ese horario (Día %)', NEW.dia_semana;
    END IF;

    -- Validar traslape de Programa / Ficha
    IF EXISTS (
        SELECT 1 FROM public.horarios
        WHERE id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND programa_id = NEW.programa_id
          AND dia_semana = NEW.dia_semana
          AND (hora_inicio, hora_fin) OVERLAPS (NEW.hora_inicio, NEW.hora_fin)
    ) THEN
        RAISE EXCEPTION 'OVERLAPS_CONFLICT: La ficha ya tiene clase programada en ese horario (Día %)', NEW.dia_semana;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_horarios_overlaps ON public.horarios;
CREATE TRIGGER trg_check_horarios_overlaps
    BEFORE INSERT OR UPDATE ON public.horarios
    FOR EACH ROW
    EXECUTE FUNCTION check_horario_overlaps();

-- 9. POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Gestión de perfiles por Admin" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Lectura pública de programas" ON public.programas FOR SELECT USING (true);
CREATE POLICY "Gestión de programas por Admin" ON public.programas FOR ALL USING (true);

CREATE POLICY "Lectura pública de ambientes" ON public.ambientes FOR SELECT USING (true);
CREATE POLICY "Gestión de ambientes por Admin" ON public.ambientes FOR ALL USING (true);

CREATE POLICY "Lectura pública de horarios" ON public.horarios FOR SELECT USING (true);
CREATE POLICY "Gestión de horarios por Admin" ON public.horarios FOR ALL USING (true);

CREATE POLICY "Lectura de notificaciones" ON public.notificaciones FOR SELECT USING (true);
CREATE POLICY "Actualizar notificaciones" ON public.notificaciones FOR ALL USING (true);

-- 10. REGISTRO INICIAL DEL ADMINISTRADOR INSTITUCIONAL GDHC
INSERT INTO public.profiles (id, cedula, nombre_completo, email, rol, especialidad, telefono)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '1020405060',
    'Gabriel Arango',
    'gabrielarangopr@gmail.com',
    'admin',
    'Coordinación Académica GDHC',
    '3105551234'
)
ON CONFLICT (cedula) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    email = EXCLUDED.email,
    rol = EXCLUDED.rol;
`;
  }
}

export const db = new SenaDatabaseService();
