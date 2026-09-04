/**
 * Servicio de Exportación y Procesamiento de Archivos Excel (.xlsx / .csv)
 * Genera reportes estructurados y procesa cargas masivas con validación de integridad
 */

import * as XLSX from 'xlsx';
import { Horario, Profile, Programa, Ambiente, BulkImportSummary, BulkUploadRowResult, OverlapConflict } from '../types';
import { preToolUseValidateExcel, sanitizeInput, validateHorarioOverlap, DIAS_SEMANA, getDiaNombre } from './overlapEngine';

export class ExcelService {
  /**
   * Genera y descarga la plantilla oficial de horarios de SENA en formato .xlsx
   */
  public downloadHorariosTemplate(): void {
    const templateData = [
      {
        cedula_instructor: '71987654',
        codigo_ficha: '2824356',
        numero_ambiente: 'Ambiente 301',
        dia_semana: 1, // Lunes
        hora_inicio: '14:00',
        hora_fin: '18:00',
        competencia: 'Seguridad en Aplicaciones Web y Pruebas OWASP',
      },
      {
        cedula_instructor: '43876543',
        codigo_ficha: '2712940',
        numero_ambiente: 'Ambiente 204',
        dia_semana: 3, // Miércoles
        hora_inicio: '07:00',
        hora_fin: '12:00',
        competencia: 'Administración de Servidores Linux Enterprise',
      },
      {
        cedula_instructor: '1017554433',
        codigo_ficha: '2824356',
        numero_ambiente: 'Ambiente 405',
        dia_semana: 4, // Jueves
        hora_inicio: '08:00',
        hora_fin: '12:00',
        competencia: 'Diseño de Interfaces UI/UX con Figma y Tailwind',
      },
      {
        cedula_instructor: '32987123',
        codigo_ficha: '2901452',
        numero_ambiente: 'Ambiente 102',
        dia_semana: 5, // Viernes
        hora_inicio: '13:00',
        hora_fin: '17:00',
        competencia: 'Implementación de Redes de Sensores e IoT',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios_SENA');

    // Estilo básico de columnas
    ws['!cols'] = [
      { wch: 18 }, // cedula_instructor
      { wch: 16 }, // codigo_ficha
      { wch: 18 }, // numero_ambiente
      { wch: 12 }, // dia_semana (1-6)
      { wch: 14 }, // hora_inicio
      { wch: 14 }, // hora_fin
      { wch: 45 }, // competencia
    ];

    XLSX.writeFile(wb, 'Plantilla_Carga_Masiva_Horarios_SENA.xlsx');
  }

  /**
   * Genera y descarga la plantilla oficial de usuarios en formato .xlsx
   */
  public downloadUsuariosTemplate(): void {
    const templateData = [
      {
        cedula: '1098765432',
        nombre_completo: 'Andrés Felipe Morales Toro',
        email: 'afmorales@sena.edu.co',
        rol: 'instructor', // admin, instructor, aprendiz
        especialidad: 'Inteligencia Artificial y Python',
        telefono: '3109876543',
        codigo_ficha: '', // Solo si es aprendiz
      },
      {
        cedula: '1045678901',
        nombre_completo: 'Laura Juliana Mejía Vélez',
        email: 'lmejia@soy.sena.edu.co',
        rol: 'aprendiz',
        especialidad: '',
        telefono: '3201234567',
        codigo_ficha: '2824356', // Ficha asignada
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios_SENA');

    ws['!cols'] = [
      { wch: 16 }, // cedula
      { wch: 32 }, // nombre_completo
      { wch: 28 }, // email
      { wch: 14 }, // rol
      { wch: 30 }, // especialidad
      { wch: 16 }, // telefono
      { wch: 16 }, // codigo_ficha
    ];

    XLSX.writeFile(wb, 'Plantilla_Carga_Masiva_Usuarios_SENA.xlsx');
  }

  /**
   * Parsea y valida un archivo Excel de horarios con PreToolUse y detección exhaustiva de OVERLAPS
   */
  public async parseExcelHorarios(
    file: File,
    profiles: Profile[],
    programas: Programa[],
    ambientes: Ambiente[],
    existingHorarios: Horario[]
  ): Promise<BulkImportSummary> {
    // 1. Hook de Seguridad PreToolUse
    const securityCheck = preToolUseValidateExcel(file);
    if (!securityCheck.isValid) {
      throw new Error(securityCheck.error);
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      throw new Error('El archivo Excel está vacío o no contiene filas con datos válidos.');
    }

    const results: BulkUploadRowResult[] = [];
    const validCandidateHorarios: Array<Omit<Horario, 'id' | 'created_at'>> = [];

    // Validar fila a fila
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNumber = i + 2; // +2 por encabezado y base-1
      const errors: string[] = [];

      const rawCedula = sanitizeInput(row.cedula_instructor || row.instructor || row.cedula);
      const rawFicha = sanitizeInput(row.codigo_ficha || row.ficha || row.programa);
      const rawAmbiente = sanitizeInput(row.numero_ambiente || row.ambiente);
      let rawDia = parseInt(String(row.dia_semana || row.dia || '1'), 10);
      if (isNaN(rawDia) || rawDia < 1 || rawDia > 6) {
        // Intentar parsear si viene como nombre de día (e.g. "Lunes")
        const diaText = String(row.dia_semana || row.dia || '').toLowerCase();
        if (diaText.includes('lun')) rawDia = 1;
        else if (diaText.includes('mar')) rawDia = 2;
        else if (diaText.includes('mi')) rawDia = 3;
        else if (diaText.includes('jue')) rawDia = 4;
        else if (diaText.includes('vie')) rawDia = 5;
        else if (diaText.includes('s')) rawDia = 6;
        else rawDia = 1;
      }

      let horaInicio = sanitizeInput(row.hora_inicio || row.inicio);
      let horaFin = sanitizeInput(row.hora_fin || row.fin);
      const competencia = sanitizeInput(row.competencia || row.materia || 'Competencia Técnica');

      // Formatear horas si vienen como decimales de Excel o HH:MM
      horaInicio = this.normalizeTime(horaInicio, '07:00');
      horaFin = this.normalizeTime(horaFin, '11:00');

      // 1. Buscar Instructor por Cédula o ID
      const instructor = profiles.find(
        p => p.rol === 'instructor' && (p.cedula === rawCedula || p.id === rawCedula || p.nombre_completo.toLowerCase().includes(rawCedula.toLowerCase()))
      );
      if (!instructor) {
        errors.push(`No se encontró un instructor con cédula o nombre "${rawCedula}".`);
      }

      // 2. Buscar Ficha / Programa
      const programa = programas.find(
        p => p.codigo_ficha === rawFicha || p.id === rawFicha || p.nombre_programa.toLowerCase().includes(rawFicha.toLowerCase())
      );
      if (!programa) {
        errors.push(`No se encontró la ficha o programa con código "${rawFicha}".`);
      }

      // 3. Buscar Ambiente
      const ambiente = ambientes.find(
        a => a.numero_ambiente.toLowerCase() === rawAmbiente.toLowerCase() ||
             a.id === rawAmbiente ||
             a.nombre_ambiente.toLowerCase().includes(rawAmbiente.toLowerCase())
      );
      if (!ambiente) {
        errors.push(`No se encontró el ambiente "${rawAmbiente}".`);
      }

      // Validar orden de horas
      if (horaInicio >= horaFin) {
        errors.push(`La hora de inicio (${horaInicio}) debe ser estrictamente menor que la hora de fin (${horaFin}).`);
      }

      let conflict: OverlapConflict = { hasConflict: false, conflictType: 'NONE', description: '' };

      if (errors.length === 0 && instructor && programa && ambiente) {
        const candidate = {
          instructor_id: instructor.id,
          programa_id: programa.id,
          ambiente_id: ambiente.id,
          dia_semana: rawDia,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          materia_competencia: competencia,
          created_by: 'usr-admin-01',
        };

        // A. Validar contra la Base de Datos Existente
        conflict = validateHorarioOverlap(
          candidate,
          existingHorarios,
          undefined,
          profiles,
          ambientes,
          programas
        );

        // B. Validar también contra filas previas válidas del mismo lote (Intra-batch overlaps)
        if (!conflict.hasConflict) {
          const fakeBatchHorarios: Horario[] = validCandidateHorarios.map((vh, idx) => ({
            ...vh,
            id: `batch-temp-${idx}`,
            created_at: new Date().toISOString(),
          }));

          const intraConflict = validateHorarioOverlap(
            candidate,
            fakeBatchHorarios,
            undefined,
            profiles,
            ambientes,
            programas
          );

          if (intraConflict.hasConflict) {
            conflict = {
              ...intraConflict,
              description: `[Cruce dentro del mismo archivo Excel] ${intraConflict.description}`,
            };
          }
        }

        if (conflict.hasConflict) {
          errors.push(conflict.description);
        } else {
          validCandidateHorarios.push(candidate);
        }

        results.push({
          rowNumber,
          rawData: {
            cedula_instructor: rawCedula,
            codigo_ficha: rawFicha,
            numero_ambiente: rawAmbiente,
            dia_semana: rawDia,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            competencia,
          },
          isValid: errors.length === 0,
          errors,
          conflict: conflict.hasConflict ? conflict : undefined,
          parsedHorario: errors.length === 0 ? candidate : undefined,
        });
      } else {
        results.push({
          rowNumber,
          rawData: {
            cedula_instructor: rawCedula,
            codigo_ficha: rawFicha,
            numero_ambiente: rawAmbiente,
            dia_semana: rawDia,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            competencia,
          },
          isValid: false,
          errors,
        });
      }
    }

    const validCount = results.filter(r => r.isValid).length;
    const conflictCount = results.filter(r => r.conflict?.hasConflict).length;
    const errorCount = results.filter(r => !r.isValid).length;

    return {
      totalRows: results.length,
      validCount,
      conflictCount,
      errorCount,
      results,
    };
  }

  /**
   * Parsea archivo Excel de usuarios
   */
  public async parseExcelUsuarios(
    file: File,
    existingProfiles: Profile[],
    programas: Programa[]
  ): Promise<{
    valid: Array<Omit<Profile, 'id' | 'created_at'>>;
    errors: Array<{ row: number; cedula: string; nombre: string; error: string }>;
  }> {
    const securityCheck = preToolUseValidateExcel(file);
    if (!securityCheck.isValid) {
      throw new Error(securityCheck.error);
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    const valid: Array<Omit<Profile, 'id' | 'created_at'>> = [];
    const errors: Array<{ row: number; cedula: string; nombre: string; error: string }> = [];

    const seenCedulasInBatch = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNumber = i + 2;
      const cedula = sanitizeInput(row.cedula || row.documento || row.identificacion);
      const nombre = sanitizeInput(row.nombre_completo || row.nombre || row.nombres);
      const email = sanitizeInput(row.email || row.correo || `${cedula}@sena.edu.co`);
      let rol = sanitizeInput(row.rol || 'aprendiz').toLowerCase();
      if (!['admin', 'instructor', 'aprendiz'].includes(rol)) {
        rol = 'aprendiz';
      }
      const especialidad = sanitizeInput(row.especialidad || '');
      const telefono = sanitizeInput(row.telefono || row.celular || '');
      const rawFicha = sanitizeInput(row.codigo_ficha || row.ficha || '');

      if (!cedula || !nombre) {
        errors.push({
          row: rowNumber,
          cedula: cedula || 'VACÍA',
          nombre: nombre || 'VACÍO',
          error: 'La cédula y el nombre completo son obligatorios.',
        });
        continue;
      }

      // Validar unicidad en el lote
      if (seenCedulasInBatch.has(cedula)) {
        errors.push({
          row: rowNumber,
          cedula,
          nombre,
          error: `Cédula duplicada dentro del mismo archivo Excel (${cedula}).`,
        });
        continue;
      }

      // Validar unicidad contra base de datos
      const existingInDb = existingProfiles.find(p => p.cedula === cedula);
      if (existingInDb) {
        errors.push({
          row: rowNumber,
          cedula,
          nombre,
          error: `La cédula ya está registrada en el sistema por ${existingInDb.nombre_completo} (${existingInDb.rol}).`,
        });
        continue;
      }

      seenCedulasInBatch.add(cedula);

      let fichaId: string | undefined = undefined;
      if (rol === 'aprendiz' && rawFicha) {
        const prog = programas.find(p => p.codigo_ficha === rawFicha || p.id === rawFicha);
        if (prog) {
          fichaId = prog.id;
        }
      }

      valid.push({
        cedula,
        nombre_completo: nombre,
        email,
        rol: rol as any,
        especialidad: rol === 'instructor' ? especialidad : undefined,
        telefono,
        ficha_id: fichaId,
        registrado: false,
      });
    }

    return { valid, errors };
  }

  /**
   * Exporta la Grilla Semanal de Horarios a un archivo Excel (.xlsx) estructurado
   */
  public exportHorariosToExcel(
    horarios: Horario[],
    profiles: Profile[],
    programas: Programa[],
    ambientes: Ambiente[],
    title: string = 'Horario_Semanal_SENA'
  ): void {
    const rows = horarios.map(h => {
      const instructor = profiles.find(p => p.id === h.instructor_id);
      const programa = programas.find(p => p.id === h.programa_id);
      const ambiente = ambientes.find(a => a.id === h.ambiente_id);

      return {
        Día: getDiaNombre(h.dia_semana),
        'Hora Inicio': h.hora_inicio,
        'Hora Fin': h.hora_fin,
        'Ficha / Programa': `${programa?.codigo_ficha || ''} - ${programa?.nombre_programa || ''}`,
        Instructor: instructor?.nombre_completo || '',
        'Cédula Instructor': instructor?.cedula || '',
        Ambiente: `${ambiente?.numero_ambiente || ''} (${ambiente?.sede || ''})`,
        Competencia: h.materia_competencia,
        Jornada: programa?.jornada || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios');

    ws['!cols'] = [
      { wch: 14 }, // Día
      { wch: 12 }, // Hora Inicio
      { wch: 12 }, // Hora Fin
      { wch: 40 }, // Ficha / Programa
      { wch: 32 }, // Instructor
      { wch: 18 }, // Cédula
      { wch: 30 }, // Ambiente
      { wch: 45 }, // Competencia
      { wch: 14 }, // Jornada
    ];

    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `${safeTitle}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  private normalizeTime(time: any, fallback: string): string {
    if (!time) return fallback;
    const str = String(time).trim();
    if (str.includes(':')) {
      const parts = str.split(':');
      const h = parts[0].padStart(2, '0');
      const m = (parts[1] || '00').padStart(2, '0');
      return `${h}:${m}`;
    }
    // Si viene en decimal de Excel (fracción de 24 horas)
    const num = parseFloat(str);
    if (!isNaN(num) && num >= 0 && num <= 1) {
      const totalMinutes = Math.round(num * 24 * 60);
      const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
      const m = (totalMinutes % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    return fallback;
  }
}

export const excelService = new ExcelService();
