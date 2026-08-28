/**
 * Base de datos relacional y persistencia para GDHC / SENA
 * Implementa la estructura relacional de Supabase (PostgreSQL, RLS y Triggers)
 */

import { Profile, Programa, Ambiente, Horario, Notificacion, UserRole } from '../types';
import { validateHorarioOverlap } from './overlapEngine';

const STORAGE_KEYS = {
  PROFILES: 'sena_gdhc_profiles_v3',
  PROGRAMAS: 'sena_gdhc_programas_v3',
  AMBIENTES: 'sena_gdhc_ambientes_v3',
  HORARIOS: 'sena_gdhc_horarios_v3',
  NOTIFICACIONES: 'sena_gdhc_notificaciones_v3',
  CURRENT_USER_ID: 'sena_gdhc_current_user_id_v3',
};

// Seed Data Inicial Institucional del SENA - Único Administrador Registrado (Sin datos simulados)
export const SEED_PROFILES: Profile[] = [
  {
    id: 'usr-admin-01',
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
    this.initializeIfEmpty();
  }

  public initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      this.resetToSeed();
    }
  }

  public resetToSeed(): void {
    this.setStorageItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, SEED_PROGRAMAS);
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, SEED_AMBIENTES);
    this.setStorageItem(STORAGE_KEYS.HORARIOS, SEED_HORARIOS);
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, SEED_NOTIFICACIONES);
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER_ID, SEED_PROFILES[0].id);
  }

  // --- PROFILES / USUARIOS ---
  public getProfiles(): Profile[] {
    return this.getStorageItem<Profile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
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

  public createProfile(profileData: Omit<Profile, 'id' | 'created_at'>): { success: boolean; profile?: Profile; error?: string } {
    const profiles = this.getProfiles();

    // Validar cédula única
    const cleanCedula = profileData.cedula.trim();
    if (!cleanCedula) {
      return { success: false, error: 'El número de Cédula de Ciudadanía es obligatorio.' };
    }
    if (profiles.some(p => p.cedula.trim() === cleanCedula)) {
      return { success: false, error: `Ya existe un usuario registrado con la cédula ${cleanCedula}.` };
    }

    // Validar email único
    const cleanEmail = profileData.email.trim().toLowerCase();
    if (cleanEmail && profiles.some(p => p.email.trim().toLowerCase() === cleanEmail)) {
      return { success: false, error: `Ya existe un usuario registrado con el correo ${cleanEmail}.` };
    }

    const newProfile: Profile = {
      ...profileData,
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      cedula: cleanCedula,
      email: cleanEmail || `${cleanCedula}@sena.edu.co`,
      created_at: new Date().toISOString(),
    };

    profiles.push(newProfile);
    this.setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return { success: true, profile: newProfile };
  }

  public updateProfile(id: string, updates: Partial<Profile>): { success: boolean; profile?: Profile; error?: string } {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'Usuario no encontrado.' };

    if (updates.cedula) {
      const cleanCedula = updates.cedula.trim();
      if (profiles.some(p => p.id !== id && p.cedula.trim() === cleanCedula)) {
        return { success: false, error: `La cédula ${cleanCedula} ya está en uso por otro usuario.` };
      }
    }

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      if (profiles.some(p => p.id !== id && p.email.trim().toLowerCase() === cleanEmail)) {
        return { success: false, error: `El correo ${cleanEmail} ya está en uso por otro usuario.` };
      }
    }

    profiles[index] = { ...profiles[index], ...updates };
    this.setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return { success: true, profile: profiles[index] };
  }

  public deleteProfile(id: string): { success: boolean; error?: string } {
    let profiles = this.getProfiles();
    const target = profiles.find(p => p.id === id);
    if (!target) return { success: false, error: 'Usuario no encontrado.' };

    if (target.rol === 'admin' && profiles.filter(p => p.rol === 'admin').length <= 1) {
      return { success: false, error: 'No es posible eliminar al único Administrador del sistema.' };
    }

    // Comprobar si tiene horarios asignados
    const horarios = this.getHorarios();
    if (horarios.some(h => h.instructor_id === id)) {
      return { success: false, error: 'No se puede eliminar el instructor porque tiene horarios de clase programados.' };
    }

    profiles = profiles.filter(p => p.id !== id);
    this.setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return { success: true };
  }

  // --- PROGRAMAS / FICHAS ---
  public getProgramas(): Programa[] {
    return this.getStorageItem<Programa[]>(STORAGE_KEYS.PROGRAMAS, SEED_PROGRAMAS);
  }

  public getProgramaById(id: string): Programa | undefined {
    return this.getProgramas().find(p => p.id === id);
  }

  public createPrograma(progData: Omit<Programa, 'id' | 'created_at'>): { success: boolean; programa?: Programa; error?: string } {
    const programas = this.getProgramas();
    const cleanFicha = progData.codigo_ficha.trim();

    if (!cleanFicha) {
      return { success: false, error: 'El código de ficha es obligatorio.' };
    }

    if (programas.some(p => p.codigo_ficha.trim() === cleanFicha)) {
      return { success: false, error: `Ya existe una ficha registrada con el código ${cleanFicha}.` };
    }

    const newProg: Programa = {
      ...progData,
      id: `prog-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      codigo_ficha: cleanFicha,
      created_at: new Date().toISOString(),
    };

    programas.push(newProg);
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, programas);
    return { success: true, programa: newProg };
  }

  public updatePrograma(id: string, updates: Partial<Programa>): { success: boolean; programa?: Programa; error?: string } {
    const programas = this.getProgramas();
    const index = programas.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'Programa no encontrado.' };

    if (updates.codigo_ficha) {
      const cleanFicha = updates.codigo_ficha.trim();
      if (programas.some(p => p.id !== id && p.codigo_ficha.trim() === cleanFicha)) {
        return { success: false, error: `La ficha ${cleanFicha} ya está registrada en otro programa.` };
      }
    }

    programas[index] = { ...programas[index], ...updates };
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, programas);
    return { success: true, programa: programas[index] };
  }

  public deletePrograma(id: string): { success: boolean; error?: string } {
    let programas = this.getProgramas();
    const horarios = this.getHorarios();

    if (horarios.some(h => h.programa_id === id)) {
      return { success: false, error: 'No se puede eliminar la ficha porque tiene horarios asignados en la matriz.' };
    }

    programas = programas.filter(p => p.id !== id);
    this.setStorageItem(STORAGE_KEYS.PROGRAMAS, programas);
    return { success: true };
  }

  // --- AMBIENTES / LABORATORIOS ---
  public getAmbientes(): Ambiente[] {
    return this.getStorageItem<Ambiente[]>(STORAGE_KEYS.AMBIENTES, SEED_AMBIENTES);
  }

  public getAmbienteById(id: string): Ambiente | undefined {
    return this.getAmbientes().find(a => a.id === id);
  }

  public createAmbiente(ambData: Omit<Ambiente, 'id' | 'created_at'>): { success: boolean; ambiente?: Ambiente; error?: string } {
    const ambientes = this.getAmbientes();
    const cleanNum = ambData.numero_ambiente.trim();

    if (!cleanNum) {
      return { success: false, error: 'El número o identificador del ambiente es obligatorio.' };
    }

    if (ambientes.some(a => a.numero_ambiente.trim().toLowerCase() === cleanNum.toLowerCase() && a.sede.trim().toLowerCase() === ambData.sede.trim().toLowerCase())) {
      return { success: false, error: `El ambiente "${cleanNum}" ya existe en la sede "${ambData.sede}".` };
    }

    const newAmb: Ambiente = {
      ...ambData,
      id: `amb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      numero_ambiente: cleanNum,
      created_at: new Date().toISOString(),
    };

    ambientes.push(newAmb);
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, ambientes);
    return { success: true, ambiente: newAmb };
  }

  public updateAmbiente(id: string, updates: Partial<Ambiente>): { success: boolean; ambiente?: Ambiente; error?: string } {
    const ambientes = this.getAmbientes();
    const index = ambientes.findIndex(a => a.id === id);
    if (index === -1) return { success: false, error: 'Ambiente no encontrado.' };

    ambientes[index] = { ...ambientes[index], ...updates };
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, ambientes);
    return { success: true, ambiente: ambientes[index] };
  }

  public deleteAmbiente(id: string): { success: boolean; error?: string } {
    let ambientes = this.getAmbientes();
    const horarios = this.getHorarios();

    if (horarios.some(h => h.ambiente_id === id)) {
      return { success: false, error: 'No se puede eliminar el ambiente porque tiene clases asignadas.' };
    }

    ambientes = ambientes.filter(a => a.id !== id);
    this.setStorageItem(STORAGE_KEYS.AMBIENTES, ambientes);
    return { success: true };
  }

  // --- HORARIOS & MOTOR OVERLAPS ---
  public getHorarios(): Horario[] {
    return this.getStorageItem<Horario[]>(STORAGE_KEYS.HORARIOS, SEED_HORARIOS);
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
  public createHorario(horarioData: Omit<Horario, 'id' | 'created_at'>): { success: boolean; horario?: Horario; error?: string } {
    const existingHorarios = this.getHorarios();
    const profiles = this.getProfiles();
    const programas = this.getProgramas();
    const ambientes = this.getAmbientes();

    // Ejecutar validación del motor de OVERLAPS
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

    const newHorario: Horario = {
      ...horarioData,
      id: `hor-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    existingHorarios.push(newHorario);
    this.setStorageItem(STORAGE_KEYS.HORARIOS, existingHorarios);

    // Crear notificación para el instructor
    const prog = this.getProgramaById(newHorario.programa_id);
    const amb = this.getAmbienteById(newHorario.ambiente_id);
    this.createNotification({
      usuario_id: newHorario.instructor_id,
      titulo: 'Nueva Asignación de Clase',
      mensaje: `Se le ha asignado la competencia "${newHorario.materia_competencia}" para la Ficha ${prog?.codigo_ficha || ''} en ${amb?.numero_ambiente || ''}.`,
      tipo: 'horario_nuevo',
    });

    return { success: true, horario: newHorario };
  }

  public updateHorario(id: string, updates: Partial<Horario>): { success: boolean; horario?: Horario; error?: string } {
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

    existingHorarios[index] = merged;
    this.setStorageItem(STORAGE_KEYS.HORARIOS, existingHorarios);
    return { success: true, horario: existingHorarios[index] };
  }

  public deleteHorario(id: string): { success: boolean; error?: string } {
    let existingHorarios = this.getHorarios();
    const target = existingHorarios.find(h => h.id === id);
    if (!target) return { success: false, error: 'Horario no encontrado.' };

    existingHorarios = existingHorarios.filter(h => h.id !== id);
    this.setStorageItem(STORAGE_KEYS.HORARIOS, existingHorarios);
    return { success: true };
  }

  // --- CARGA MASIVA DE HORARIOS CON OVERLAPS ---
  public bulkInsertHorarios(rows: Array<Omit<Horario, 'id' | 'created_at'>>, skipConflicts: boolean = false): {
    insertedCount: number;
    conflicts: Array<{ row: Omit<Horario, 'id' | 'created_at'>; reason: string }>;
  } {
    let currentHorarios = [...this.getHorarios()];
    const profiles = this.getProfiles();
    const programas = this.getProgramas();
    const ambientes = this.getAmbientes();

    const conflicts: Array<{ row: Omit<Horario, 'id' | 'created_at'>; reason: string }> = [];
    const validToInsert: Horario[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const tempId = `bulk-${Date.now()}-${i}`;
      const candidate: Horario = {
        ...row,
        id: tempId,
        created_at: new Date().toISOString(),
      };

      // Validar contra la base actual más los que ya se aprobaron en este lote
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

    if (validToInsert.length > 0) {
      currentHorarios = [...currentHorarios, ...validToInsert];
      this.setStorageItem(STORAGE_KEYS.HORARIOS, currentHorarios);
    }

    return { insertedCount: validToInsert.length, conflicts };
  }

  // Alias para compatibilidad
  public batchInsertHorarios(rows: Array<Omit<Horario, 'id' | 'created_at'>>, skipConflicts: boolean = false) {
    return this.bulkInsertHorarios(rows, skipConflicts);
  }

  // --- NOTIFICACIONES ---
  public getNotificaciones(usuarioId?: string): Notificacion[] {
    const list = this.getStorageItem<Notificacion[]>(STORAGE_KEYS.NOTIFICACIONES, SEED_NOTIFICACIONES);
    if (!usuarioId) return list;
    return list.filter(n => n.usuario_id === usuarioId || n.usuario_id === 'all');
  }

  public createNotification(data: Omit<Notificacion, 'id' | 'created_at' | 'leido'>): void {
    const list = this.getNotificaciones();
    const newNotif: Notificacion = {
      ...data,
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      leido: false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newNotif);
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, list.slice(0, 50));
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotificaciones();
    const updated = list.map(n => (n.id === id ? { ...n, leido: true } : n));
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, updated);
  }

  public markAllNotificationsAsRead(usuarioId: string): void {
    const list = this.getNotificaciones();
    const updated = list.map(n => (n.usuario_id === usuarioId || n.usuario_id === 'all' ? { ...n, leido: true } : n));
    this.setStorageItem(STORAGE_KEYS.NOTIFICACIONES, updated);
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
