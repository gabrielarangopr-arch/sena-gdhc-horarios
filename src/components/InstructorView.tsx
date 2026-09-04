import React, { useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Download, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  Printer,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { Profile, Horario, Programa, Ambiente } from '../types';
import { DIAS_SEMANA, timeToMinutes } from '../services/overlapEngine';
import { excelService } from '../services/excelService';

interface InstructorViewProps {
  instructor: Profile;
  horarios?: Horario[];
  programas?: Programa[];
  ambientes?: Ambiente[];
  profiles?: Profile[];
  allHorarios?: Horario[];
  allProgramas?: Programa[];
  allAmbientes?: Ambiente[];
  allProfiles?: Profile[];
  onRefreshData?: () => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({
  instructor,
  horarios,
  programas,
  ambientes,
  profiles,
  allHorarios,
  allProgramas,
  allAmbientes,
  allProfiles,
}) => {
  const safeHorarios = useMemo(() => horarios || allHorarios || [], [horarios, allHorarios]);
  const safeProgramas = useMemo(() => programas || allProgramas || [], [programas, allProgramas]);
  const safeAmbientes = useMemo(() => ambientes || allAmbientes || [], [ambientes, allAmbientes]);
  const safeProfiles = useMemo(() => profiles || allProfiles || [], [profiles, allProfiles]);

  // Filtrar solo los horarios correspondientes a este instructor
  const instructorHorarios = useMemo(() => {
    return safeHorarios.filter(h => h.instructor_id === instructor.id);
  }, [safeHorarios, instructor]);

  // Calcular horas semanales asignadas
  const totalWeeklyHours = useMemo(() => {
    let totalMinutes = 0;
    for (const h of instructorHorarios) {
      const start = timeToMinutes(h.hora_inicio);
      const end = timeToMinutes(h.hora_fin);
      totalMinutes += Math.max(0, end - start);
    }
    return (totalMinutes / 60).toFixed(1);
  }, [instructorHorarios]);

  // Fichas únicas en las que dicta clases
  const uniqueFichas = useMemo(() => {
    const fichaIds = new Set(instructorHorarios.map(h => h.programa_id));
    return safeProgramas.filter(p => fichaIds.has(p.id));
  }, [instructorHorarios, safeProgramas]);

  const handleExport = () => {
    excelService.exportHorariosToExcel(
      instructorHorarios,
      safeProfiles,
      safeProgramas,
      safeAmbientes,
      `Horario_Instructor_${instructor.nombre_completo.replace(/\s+/g, '_')}`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Principal: Programación Semanal de Clases */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#39A900] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Mi Programación Semanal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clases presenciales y virtuales asignadas en el trimestre
                  </p>
                </div>
              </div>
              
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sin solapamientos
              </span>
            </div>

            {instructorHorarios.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">No tienes clases asignadas actualmente.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  La Coordinación Académica publicará tu horario una vez definidos los ambientes e itinerarios.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 p-4 bg-slate-50/40">
                {DIAS_SEMANA.map(dia => {
                  const diaHorarios = instructorHorarios
                    .filter(h => Number(h.dia_semana) === Number(dia.id))
                    .sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));

                  return (
                    <div
                      key={dia.id}
                      className="border border-slate-200/80 rounded-2xl bg-white shadow-2xs overflow-hidden flex flex-col"
                    >
                      <div className="bg-slate-900 text-white px-3.5 py-2.5 text-xs font-bold flex items-center justify-between">
                        <span>{dia.nombre}</span>
                        <span className="text-[11px] font-medium text-slate-300">
                          {diaHorarios.length} {diaHorarios.length === 1 ? 'sesión' : 'sesiones'}
                        </span>
                      </div>

                      <div className="p-3 space-y-2.5 flex-1">
                        {diaHorarios.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 italic">
                            Sin sesiones programadas
                          </div>
                        ) : (
                          diaHorarios.map(h => {
                            const programa = safeProgramas.find(p => p.id === h.programa_id);
                            const ambiente = safeAmbientes.find(a => a.id === h.ambiente_id);

                            return (
                              <div
                                key={h.id}
                                className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/70 rounded-xl p-3 transition-colors"
                              >
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                    {h.hora_inicio} - {h.hora_fin}
                                  </span>
                                  <span className="font-mono font-bold text-slate-600 text-[10px] bg-slate-200/70 px-1.5 py-0.5 rounded">
                                    Ficha {programa?.codigo_ficha}
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                  {h.materia_competencia}
                                </h4>

                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-col space-y-1.5 text-xs text-slate-600">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate text-[11px]">{programa?.nombre_programa}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                                    <span className="truncate font-semibold text-slate-800 text-[11px]">
                                      {ambiente?.numero_ambiente} • {ambiente?.nombre_ambiente}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Lateral: Tarjetas Reestructuradas de Perfil y Carga Horaria */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 no-print">
          
          {/* Tarjeta de Perfil del Instructor */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#39A900] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                {instructor.nombre_completo.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                  INSTRUCTOR
                </span>
                <h2 className="text-sm font-bold text-slate-900 truncate">
                  {instructor.nombre_completo}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  CC: {instructor.cedula}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Especialidad:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[170px]">
                  {instructor.especialidad || 'TIC y Software'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Correo:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[170px]">
                  {instructor.email}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Resumen de Carga Horaria */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Carga Semanal
              </span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{totalWeeklyHours}</span>
              <span className="text-xs text-slate-400">Horas programadas</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Sesiones</span>
                <span className="font-bold text-white text-sm">{instructorHorarios.length}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Fichas</span>
                <span className="font-bold text-white text-sm">{uniqueFichas.length}</span>
              </div>
            </div>

            {/* Acciones de exportación e impresión */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleExport}
                className="w-full py-2 px-3 bg-[#39A900] hover:bg-[#2e8800] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Horario (.xlsx)</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Horario</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Fichas Asignadas */}
          {uniqueFichas.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mis Fichas de Formación
              </h3>
              <div className="space-y-2">
                {uniqueFichas.map(f => (
                  <div key={f.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-bold text-slate-900">Ficha {f.codigo_ficha}</div>
                    <div className="text-slate-500 text-[11px] line-clamp-1">{f.nombre_programa}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Jornada: {f.jornada}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
