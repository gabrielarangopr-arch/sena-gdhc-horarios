/**
 * Tipos de datos e interfaces para el sistema GDHC / SENA
 * Basado en TRD v2.0 Production-Ready y esquema relacional PostgreSQL / Supabase
 */

export type UserRole = 'admin' | 'instructor' | 'aprendiz';

export type JornadaType = 'Mañana' | 'Tarde' | 'Noche' | 'Mixta' | 'Fines de Semana';

export type TipoAmbiente = 'Aula de Cómputo' | 'Laboratorio' | 'Taller' | 'Aula Convencional' | 'Auditorio';

export interface Profile {
  id: string; // UUID (PK)
  cedula: string; // UNIQUE INDEX
  nombre_completo: string;
  email: string;
  rol: UserRole;
  especialidad?: string;
  telefono?: string;
  ficha_id?: string; // Para aprendices
  created_at: string;
}

export interface Programa {
  id: string; // UUID (PK)
  codigo_ficha: string; // UNIQUE
  nombre_programa: string;
  jornada: JornadaType;
  nivel_formacion?: 'Técnico' | 'Tecnólogo' | 'Especialización Tecnológica' | 'Complementario';
  centro_formacion?: string;
  cupos?: number;
  created_at?: string;
}

export interface Ambiente {
  id: string; // UUID (PK)
  numero_ambiente: string;
  nombre_ambiente: string;
  sede: string;
  tipo: TipoAmbiente;
  capacidad: number;
  equipamiento?: string[];
  activo: boolean;
  created_at?: string;
}

export interface Horario {
  id: string; // UUID (PK)
  instructor_id: string; // FK profiles.id
  programa_id: string; // FK programas.id (Ficha)
  ambiente_id: string; // FK ambientes.id
  dia_semana: number; // 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado
  hora_inicio: string; // "HH:MM" e.g. "07:00"
  hora_fin: string; // "HH:MM" e.g. "11:00"
  materia_competencia: string;
  created_by: string; // FK profiles.id
  created_at: string;
}

export interface Notificacion {
  id: string; // UUID (PK)
  usuario_id: string; // FK profiles.id
  titulo: string;
  mensaje: string;
  leido: boolean;
  tipo?: 'horario_nuevo' | 'horario_modificado' | 'conflicto_resuelto' | 'general' | 'alerta';
  created_at: string;
}

export interface OverlapConflict {
  hasConflict: boolean;
  conflictType: 'INSTRUCTOR_OVERLAP' | 'AMBIENTE_OVERLAP' | 'PROGRAMA_OVERLAP' | 'MULTIPLE' | 'NONE';
  description: string;
  details?: {
    instructorName?: string;
    ambienteName?: string;
    programaName?: string;
    existingHorario?: Horario;
    overlappingDay: number;
    conflictingRange: string;
  };
}

export interface BulkUploadRowResult {
  rowNumber: number;
  rawData: {
    cedula_instructor: string;
    codigo_ficha: string;
    numero_ambiente: string;
    dia_semana: number | string;
    hora_inicio: string;
    hora_fin: string;
    competencia: string;
  };
  isValid: boolean;
  errors: string[];
  conflict?: OverlapConflict;
  parsedHorario?: Omit<Horario, 'id' | 'created_at'>;
}

export interface BulkImportSummary {
  totalRows: number;
  validCount: number;
  conflictCount: number;
  errorCount: number;
  results: BulkUploadRowResult[];
}
