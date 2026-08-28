/**
 * Motor de Validación de Conflictos OVERLAPS en Servidor
 * Basado en TRD v2.0 y cláusula OVERLAPS de PostgreSQL
 * (hora_inicio, hora_fin) OVERLAPS (nueva_hora_inicio, nueva_hora_fin)
 */

import { Horario, OverlapConflict, Profile, Ambiente, Programa, BulkUploadRowResult, BulkImportSummary } from '../types';

/**
 * Convierte cadena "HH:MM" a minutos transcurridos en el día
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  const parts = clean.split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Convierte minutos a "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Cláusula OVERLAPS estándar de PostgreSQL:
 * Dos intervalos (S1, E1) y (S2, E2) se traslapan si:
 * S1 < E2 AND E1 > S2
 */
export function checkTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  // Intervalo inválido (inicio >= fin)
  if (minStartA >= minEndA || minStartB >= minEndB) {
    return false;
  }

  return minStartA < minEndB && minEndA > minStartB;
}

export const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes', corto: 'LUN' },
  { id: 2, nombre: 'Martes', corto: 'MAR' },
  { id: 3, nombre: 'Miércoles', corto: 'MIÉ' },
  { id: 4, nombre: 'Jueves', corto: 'JUE' },
  { id: 5, nombre: 'Viernes', corto: 'VIE' },
  { id: 6, nombre: 'Sábado', corto: 'SÁB' },
];

export function getDiaNombre(diaId: number): string {
  const found = DIAS_SEMANA.find(d => d.id === Number(diaId));
  return found ? found.nombre : `Día ${diaId}`;
}

/**
 * Valida si un nuevo registro de horario genera conflictos OVERLAPS en PostgreSQL
 * Restricciones Activas:
 * 1. Cruce de Instructor (Mismo instructor no puede estar en dos ambientes a la misma hora)
 * 2. Cruce de Ambiente (El mismo salón no puede tener dos clases simultáneas)
 * 3. Cruce de Ficha/Programa (Una ficha no puede tener dos materias simultáneas)
 */
export function validateHorarioOverlap(
  candidate: {
    instructor_id: string;
    programa_id: string;
    ambiente_id: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
  },
  existingHorarios: Horario[],
  ignoreHorarioId?: string,
  profiles: Profile[] = [],
  ambientes: Ambiente[] = [],
  programas: Programa[] = []
): OverlapConflict {
  const startMin = timeToMinutes(candidate.hora_inicio);
  const endMin = timeToMinutes(candidate.hora_fin);

  if (startMin >= endMin) {
    return {
      hasConflict: true,
      conflictType: 'MULTIPLE',
      description: `La hora de inicio (${candidate.hora_inicio}) debe ser anterior a la hora de fin (${candidate.hora_fin}).`,
    };
  }

  // Filtrar horarios que no sean el mismo que se está editando
  const relevantHorarios = existingHorarios.filter(h => {
    if (ignoreHorarioId && h.id === ignoreHorarioId) return false;
    return Number(h.dia_semana) === Number(candidate.dia_semana);
  });

  for (const existing of relevantHorarios) {
    const isOverlapping = checkTimeOverlap(
      candidate.hora_inicio,
      candidate.hora_fin,
      existing.hora_inicio,
      existing.hora_fin
    );

    if (isOverlapping) {
      const instructor = profiles.find(p => p.id === existing.instructor_id);
      const ambiente = ambientes.find(a => a.id === existing.ambiente_id);
      const programa = programas.find(pr => pr.id === existing.programa_id);
      const diaNom = getDiaNombre(candidate.dia_semana);

      // 1. Cruce de Instructor
      if (existing.instructor_id === candidate.instructor_id) {
        const candidateAmbiente = ambientes.find(a => a.id === candidate.ambiente_id);
        return {
          hasConflict: true,
          conflictType: 'INSTRUCTOR_OVERLAP',
          description: `El instructor ${instructor?.nombre_completo || 'asignado'} ya tiene una clase programada el ${diaNom} de ${existing.hora_inicio} a ${existing.hora_fin} en el ambiente ${ambiente?.numero_ambiente || 'ocupado'}.`,
          details: {
            instructorName: instructor?.nombre_completo,
            ambienteName: candidateAmbiente?.numero_ambiente,
            programaName: programa?.nombre_programa,
            existingHorario: existing,
            overlappingDay: candidate.dia_semana,
            conflictingRange: `${existing.hora_inicio} - ${existing.hora_fin}`,
          },
        };
      }

      // 2. Cruce de Ambiente
      if (existing.ambiente_id === candidate.ambiente_id) {
        return {
          hasConflict: true,
          conflictType: 'AMBIENTE_OVERLAP',
          description: `El ambiente ${ambiente?.numero_ambiente || 'seleccionado'} ya está reservado el ${diaNom} de ${existing.hora_inicio} a ${existing.hora_fin} para la ficha ${programa?.codigo_ficha || ''} (${programa?.nombre_programa || ''}).`,
          details: {
            instructorName: instructor?.nombre_completo,
            ambienteName: ambiente?.numero_ambiente,
            programaName: programa?.nombre_programa,
            existingHorario: existing,
            overlappingDay: candidate.dia_semana,
            conflictingRange: `${existing.hora_inicio} - ${existing.hora_fin}`,
          },
        };
      }

      // 3. Cruce de Programa / Ficha
      if (existing.programa_id === candidate.programa_id) {
        return {
          hasConflict: true,
          conflictType: 'PROGRAMA_OVERLAP',
          description: `La ficha ${programa?.codigo_ficha || 'seleccionada'} (${programa?.nombre_programa || ''}) ya tiene programada la competencia "${existing.materia_competencia}" el ${diaNom} de ${existing.hora_inicio} a ${existing.hora_fin}.`,
          details: {
            instructorName: instructor?.nombre_completo,
            ambienteName: ambiente?.numero_ambiente,
            programaName: programa?.nombre_programa,
            existingHorario: existing,
            overlappingDay: candidate.dia_semana,
            conflictingRange: `${existing.hora_inicio} - ${existing.hora_fin}`,
          },
        };
      }
    }
  }

  return {
    hasConflict: false,
    conflictType: 'NONE',
    description: 'Sin cruces de horarios detectados.',
  };
}

/**
 * Harness Security Hook: PreToolUse
 * Nombre: validate_excel_mime
 * Ejecución: Previa al parseo de archivos en Edge Functions / API.
 * Función: Valida el MIME-Type (.xlsx / .csv), límite de tamaño (<10MB) y sanitiza caracteres.
 */
export function preToolUseValidateExcel(file: File): { isValid: boolean; error?: string } {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'application/csv',
    'text/plain',
  ];

  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExt && !allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Seguridad PreToolUse: Formato de archivo no permitido. Solo se aceptan hojas de cálculo .xlsx, .xls o .csv (Recibido: ${file.type || 'desconocido'})`,
    };
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Seguridad PreToolUse: El archivo excede el tamaño máximo permitido de 10MB (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitiza campos de texto previniendo inyecciones de fórmulas y caracteres maliciosos
 */
export function sanitizeInput(input: any): string {
  if (input === null || input === undefined) return '';
  let str = String(input).trim();
  // Prevenir inyección de fórmulas CSV/Excel (=, +, -, @, cmd)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return str;
}
