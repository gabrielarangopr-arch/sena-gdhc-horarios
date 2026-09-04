import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Download, 
  MapPin, 
  User, 
  BookOpen, 
  GraduationCap, 
  Printer,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Profile, Horario, Programa, Ambiente } from '../types';
import { DIAS_SEMANA, timeToMinutes } from '../services/overlapEngine';
import { excelService } from '../services/excelService';

interface AprendizViewProps {
  aprendiz: Profile;
  horarios?: Horario[];
  programas?: Programa[];
  ambientes?: Ambiente[];
  profiles?: Profile[];
  allHorarios?: Horario[];
  allProgramas?: Programa[];
  allAmbientes?: Ambiente[];
  allProfiles?: Profile[];
}

export const AprendizView: React.FC<AprendizViewProps> = ({
  aprendiz,
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

  // Ficha seleccionada (por defecto la del aprendiz o la primera disponible)
  const [selectedFichaId, setSelectedFichaId] = useState<string>(() => {
    return aprendiz.ficha_id || (safeProgramas.length > 0 ? safeProgramas[0].id : '');
  });

  // Si no había ficha seleccionada pero cargaron programas
  React.useEffect(() => {
    if (!selectedFichaId && safeProgramas.length > 0) {
      setSelectedFichaId(aprendiz.ficha_id || safeProgramas[0].id);
    }
  }, [selectedFichaId, safeProgramas, aprendiz.ficha_id]);

  const selectedPrograma = useMemo(() => {
    return safeProgramas.find(p => p.id === selectedFichaId);
  }, [safeProgramas, selectedFichaId]);

  // Horarios de la ficha
  const fichaHorarios = useMemo(() => {
    return safeHorarios.filter(h => h.programa_id === selectedFichaId);
  }, [safeHorarios, selectedFichaId]);

  const handleExport = () => {
    excelService.exportHorariosToExcel(
      fichaHorarios,
      safeProfiles,
      safeProgramas,
      safeAmbientes,
      `Horario_Ficha_${selectedPrograma?.codigo_ficha || 'SENA'}`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Principal: Selector de Ficha y Horario Semanal */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* Selector de Ficha y Cabecera del Horario */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Ficha de Formación
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Selecciona la ficha para consultar su itinerario
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedFichaId}
                onChange={e => setSelectedFichaId(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
              >
                {safeProgramas.map(p => (
                  <option key={p.id} value={p.id}>
                    Ficha {p.codigo_ficha} - {p.nombre_programa.substring(0, 32)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grilla Semanal de Clases */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Horario Semanal de Formación (Lunes a Sábado)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {fichaHorarios.length} bloques asignados
              </span>
            </div>

            {fichaHorarios.length === 0 ? (
              <div className="p-16 text-center text-slate-400 dark:text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No hay horarios programados para esta ficha todavía.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  La Coordinación Académica está consolidando la programación y asignación de aulas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 p-4 bg-slate-50/40 dark:bg-slate-950/40">
                {DIAS_SEMANA.map(dia => {
                  const diaHorarios = fichaHorarios
                    .filter(h => Number(h.dia_semana) === Number(dia.id))
                    .sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));

                  return (
                    <div
                      key={dia.id}
                      className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs overflow-hidden flex flex-col"
                    >
                      <div className="bg-slate-900 dark:bg-slate-950 text-white px-3.5 py-2.5 text-xs font-bold flex items-center justify-between border-b border-slate-800">
                        <span>{dia.nombre}</span>
                        <span className="text-[11px] font-medium text-slate-300 dark:text-slate-400">
                          {diaHorarios.length} {diaHorarios.length === 1 ? 'materia' : 'materias'}
                        </span>
                      </div>

                      <div className="p-3 space-y-2.5 flex-1">
                        {diaHorarios.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                            Sin actividades programadas
                          </div>
                        ) : (
                          diaHorarios.map(h => {
                            const instructor = safeProfiles.find(p => p.id === h.instructor_id);
                            const ambiente = safeAmbientes.find(a => a.id === h.ambiente_id);

                            return (
                              <div
                                key={h.id}
                                className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-xl p-3 transition-colors"
                              >
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 text-[11px]">
                                    {h.hora_inicio} - {h.hora_fin}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold bg-slate-200/60 dark:bg-slate-700/80 px-1.5 py-0.5 rounded">
                                    Presencial
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                  {h.materia_competencia}
                                </h4>

                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <User className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                                    <span className="truncate font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                                      {instructor?.nombre_completo || 'Instructor por confirmar'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                      {ambiente?.numero_ambiente} • {ambiente?.sede}
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

        {/* Columna Lateral: Perfil del Aprendiz y Detalles de la Ficha */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 no-print">
          
          {/* Tarjeta de Perfil del Aprendiz */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                {aprendiz.nombre_completo.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full inline-block mb-1 border border-sky-200 dark:border-sky-800/60">
                  APRENDIZ SENA
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {aprendiz.nombre_completo}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  CC: {aprendiz.cedula}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500">Estado Cuenta:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Activa
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500">Correo:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[170px]">
                  {aprendiz.email}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Información de la Ficha */}
          {selectedPrograma && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Ficha Seleccionada
              </span>
              
              <div>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Ficha #{selectedPrograma.codigo_ficha}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedPrograma.nombre_programa}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Jornada:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPrograma.jornada}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Nivel de formación:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPrograma.nivel_formacion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Cupos:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPrograma.cupos} aprendices</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={handleExport}
                  className="w-full py-2 px-3 bg-[#39A900] hover:bg-[#2e8800] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Horario (.xlsx)</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Horario</span>
                </button>
              </div>
            </div>
          )}

          {/* Tarjeta de Recomendaciones para el Aprendiz */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-2xl shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Recordatorio de Formación</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Recuerda portar el carné institucional y llegar con 10 minutos de antelación al ambiente asignado.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
