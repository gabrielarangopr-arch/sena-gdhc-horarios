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
  Info
} from 'lucide-react';
import { Profile, Horario, Programa, Ambiente } from '../types';
import { DIAS_SEMANA, getDiaNombre, timeToMinutes } from '../services/overlapEngine';
import { excelService } from '../services/excelService';

interface AprendizViewProps {
  aprendiz: Profile;
  horarios: Horario[];
  programas: Programa[];
  ambientes: Ambiente[];
  profiles: Profile[];
}

export const AprendizView: React.FC<AprendizViewProps> = ({
  aprendiz,
  horarios,
  programas,
  ambientes,
  profiles,
}) => {
  // Ficha seleccionada (por defecto la del aprendiz o la primera disponible)
  const [selectedFichaId, setSelectedFichaId] = useState<string>(
    aprendiz.ficha_id || programas[0]?.id || ''
  );

  const selectedPrograma = useMemo(() => {
    return programas.find(p => p.id === selectedFichaId);
  }, [programas, selectedFichaId]);

  // Horarios de la ficha
  const fichaHorarios = useMemo(() => {
    return horarios.filter(h => h.programa_id === selectedFichaId);
  }, [horarios, selectedFichaId]);

  const handleExport = () => {
    excelService.exportHorariosToExcel(
      fichaHorarios,
      profiles,
      programas,
      ambientes,
      `Horario_Ficha_${selectedPrograma?.codigo_ficha || 'SENA'}`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Apprentice Info Banner */}
      <div className="bg-white p-5 rounded-md border border-[#E0E0E0] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-[#0288D1] text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {aprendiz.nombre_completo.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-[#00324D]">
                  {aprendiz.nombre_completo}
                </h2>
                <span className="text-xs bg-[#e1f5fe] text-[#0288D1] font-bold px-2 py-0.5 rounded-full">
                  Aprendiz en Formación
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Cédula: <span className="font-mono font-bold text-gray-700">{aprendiz.cedula}</span> | 
                Correo: <span className="font-medium text-gray-800">{aprendiz.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Ficha Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Ver Ficha:
              </label>
              <select
                value={selectedFichaId}
                onChange={e => setSelectedFichaId(e.target.value)}
                className="text-xs p-1.5 bg-white border border-gray-300 rounded font-semibold text-[#00324D] focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
              >
                {programas.map(p => (
                  <option key={p.id} value={p.id}>
                    Ficha {p.codigo_ficha} - {p.nombre_programa.substring(0, 28)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#39A900]" />
              <span>Descargar Horario (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Selected Ficha Summary Bar */}
        {selectedPrograma && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-[#F5F5F5] p-2.5 rounded">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#00324D]" />
              <span className="font-bold text-[#00324D]">
                {selectedPrograma.nombre_programa} (Ficha #{selectedPrograma.codigo_ficha})
              </span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <span><strong>Jornada:</strong> {selectedPrograma.jornada}</span>
              <span><strong>Nivel:</strong> {selectedPrograma.nivel_formacion}</span>
              <span><strong>Cupos:</strong> {selectedPrograma.cupos} Aprendices</span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Schedule View */}
      <div className="bg-white rounded-md border border-[#E0E0E0] shadow-xs overflow-hidden">
        <div className="p-3 bg-[#F5F5F5] border-b border-[#E0E0E0] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#00324D]" />
            <h3 className="text-xs font-bold text-[#00324D] uppercase tracking-wider">
              Horario de Formación Semanal (Lunes a Sábado)
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            {fichaHorarios.length} bloques asignados para esta ficha
          </span>
        </div>

        {fichaHorarios.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-gray-600">No hay horarios programados para esta ficha todavía.</p>
            <p className="text-xs text-gray-400 mt-1">
              La Coordinación Académica está consolidando la disponibilidad de ambientes e instructores.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {DIAS_SEMANA.map(dia => {
              const diaHorarios = fichaHorarios
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
                      {diaHorarios.length} {diaHorarios.length === 1 ? 'materia' : 'materias'}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2">
                    {diaHorarios.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400 italic">
                        Sin actividades presenciales programadas
                      </div>
                    ) : (
                      diaHorarios.map(h => {
                        const instructor = profiles.find(p => p.id === h.instructor_id);
                        const ambiente = ambientes.find(a => a.id === h.ambiente_id);

                        return (
                          <div
                            key={h.id}
                            className="bg-white border border-gray-200 rounded p-3 shadow-2xs border-l-4 border-l-[#0288D1]"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#00324D] bg-[#e1f5fe] px-1.5 py-0.5 rounded text-[11px]">
                                {h.hora_inicio} - {h.hora_fin}
                              </span>
                              <span className="text-gray-500 text-[10px] font-mono">
                                Presencial
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-900 mt-1.5 leading-snug">
                              {h.materia_competencia}
                            </h4>

                            <div className="mt-2 pt-1.5 border-t border-gray-100 flex flex-col space-y-1 text-xs text-gray-600">
                              <div className="flex items-center space-x-1.5 truncate">
                                <User className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                                <span className="truncate font-medium text-gray-800">
                                  {instructor?.nombre_completo || 'Instructor asignado'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-[#0288D1] shrink-0" />
                                <span className="truncate font-semibold text-gray-800">
                                  {ambiente?.numero_ambiente} ({ambiente?.sede})
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
