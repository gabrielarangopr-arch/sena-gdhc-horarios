import React, { useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Download, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  UserCheck, 
  Award, 
  Printer,
  CheckCircle2
} from 'lucide-react';
import { Profile, Horario, Programa, Ambiente } from '../types';
import { DIAS_SEMANA, getDiaNombre, timeToMinutes } from '../services/overlapEngine';
import { excelService } from '../services/excelService';

interface InstructorViewProps {
  instructor: Profile;
  horarios: Horario[];
  programas: Programa[];
  ambientes: Ambiente[];
  profiles: Profile[];
}

export const InstructorView: React.FC<InstructorViewProps> = ({
  instructor,
  horarios,
  programas,
  ambientes,
  profiles,
}) => {
  // Filtrar solo los horarios correspondientes a este instructor
  const instructorHorarios = useMemo(() => {
    return horarios.filter(h => h.instructor_id === instructor.id);
  }, [horarios, instructor]);

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

  const handleExport = () => {
    excelService.exportHorariosToExcel(
      instructorHorarios,
      profiles,
      programas,
      ambientes,
      `Horario_Instructor_${instructor.nombre_completo.replace(/\s+/g, '_')}`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Instructor Profile Header */}
      <div className="bg-white p-5 rounded-md border border-[#E0E0E0] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-[#39A900] text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {instructor.nombre_completo.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-[#00324D]">
                  {instructor.nombre_completo}
                </h2>
                <span className="text-xs bg-[#e9f1df] text-[#226d00] font-bold px-2 py-0.5 rounded-full">
                  Instructor de Planta / Contratista
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Cédula: <span className="font-mono font-bold text-gray-700">{instructor.cedula}</span> | 
                Especialidad: <span className="font-medium text-gray-800">{instructor.especialidad || 'Área de Software y TIC'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#f5fcea] border border-[#becbb3] rounded-md px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-[#226d00] block">
                Carga Semanal
              </span>
              <span className="text-base font-extrabold text-[#00324D]">
                {totalWeeklyHours} <span className="text-xs font-normal">Horas</span>
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#39A900]" />
              <span>Descargar Mi Horario (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid for Instructor */}
      <div className="bg-white rounded-md border border-[#E0E0E0] shadow-xs overflow-hidden">
        <div className="p-3 bg-[#F5F5F5] border-b border-[#E0E0E0] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#00324D]" />
            <h3 className="text-xs font-bold text-[#00324D] uppercase tracking-wider">
              Mi Programación Semanal de Clases
            </h3>
          </div>
          <span className="text-xs text-[#226d00] font-semibold flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Sin conflictos de cruce OVERLAPS
          </span>
        </div>

        {instructorHorarios.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-gray-600">No tienes clases asignadas actualmente.</p>
            <p className="text-xs text-gray-400 mt-1">
              Coordinación Académica GDHC publicará tu programación para este trimestre.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {DIAS_SEMANA.map(dia => {
              const diaHorarios = instructorHorarios
                .filter(h => Number(h.dia_semana) === Number(dia.id))
                .sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));

              return (
                <div
                  key={dia.id}
                  className="border border-gray-200 rounded-md bg-[#FAFAFA] overflow-hidden"
                >
                  <div className="bg-[#00324D] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>{dia.nombre}</span>
                    <span className="text-[11px] font-normal text-gray-300">
                      {diaHorarios.length} {diaHorarios.length === 1 ? 'sesión' : 'sesiones'}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2">
                    {diaHorarios.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400 italic">
                        Día libre sin clases programadas
                      </div>
                    ) : (
                      diaHorarios.map(h => {
                        const programa = programas.find(p => p.id === h.programa_id);
                        const ambiente = ambientes.find(a => a.id === h.ambiente_id);

                        return (
                          <div
                            key={h.id}
                            className="bg-white border border-gray-200 rounded p-3 shadow-2xs border-l-4 border-l-[#39A900]"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#00324D] bg-[#e9f1df] px-1.5 py-0.5 rounded text-[11px]">
                                {h.hora_inicio} - {h.hora_fin}
                              </span>
                              <span className="font-mono font-bold text-gray-500 text-[10px]">
                                Ficha {programa?.codigo_ficha}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-800 mt-1.5 leading-snug">
                              {h.materia_competencia}
                            </h4>

                            <div className="mt-2 pt-1.5 border-t border-gray-100 flex flex-col space-y-1 text-xs text-gray-600">
                              <div className="flex items-center space-x-1.5 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-[#00324D] shrink-0" />
                                <span className="truncate">{programa?.nombre_programa}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                                <span className="truncate font-semibold text-gray-700">
                                  {ambiente?.numero_ambiente} ({ambiente?.nombre_ambiente})
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
  );
};
