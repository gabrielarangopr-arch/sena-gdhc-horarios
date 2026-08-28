import React from 'react';
import { AlertOctagon, X, Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { OverlapConflict, Profile, Ambiente, Programa } from '../types';
import { getDiaNombre } from '../services/overlapEngine';

interface ConflictModalProps {
  conflict: OverlapConflict;
  onClose: () => void;
  profiles: Profile[];
  ambientes: Ambiente[];
  programas: Programa[];
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  conflict,
  onClose,
  profiles,
  ambientes,
  programas,
}) => {
  const existing = conflict.details?.existingHorario;
  const existingInstructor = existing ? profiles.find(p => p.id === existing.instructor_id) : null;
  const existingPrograma = existing ? programas.find(p => p.id === existing.programa_id) : null;
  const existingAmbiente = existing ? ambientes.find(a => a.id === existing.ambiente_id) : null;

  const getConflictTitle = (type: string) => {
    switch (type) {
      case 'INSTRUCTOR_OVERLAP':
        return 'Cruce de Horario: Instructor Ocupado';
      case 'AMBIENTE_OVERLAP':
        return 'Cruce de Horario: Ambiente no Disponible';
      case 'PROGRAMA_OVERLAP':
        return 'Cruce de Horario: Ficha con Clase Simultánea';
      default:
        return 'Conflicto de Horarios (Regla OVERLAPS)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-md shadow-2xl max-w-lg w-full border border-[#D32F2F] overflow-hidden">
        {/* Header with status-error style */}
        <div className="bg-[#D32F2F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {getConflictTitle(conflict.conflictType)}
              </h3>
              <p className="text-xs text-red-100">
                Restricción Activa en Servidor: Cláusula PostgreSQL OVERLAPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-sm hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Main Error Description Box */}
          <div className="p-3.5 bg-[#FFEBEE] border border-[#ffcdd2] rounded-md text-xs text-[#b71c1c] leading-relaxed">
            <span className="font-bold">Detalle del Conflicto: </span>
            {conflict.description}
          </div>

          {/* Detailed Comparison Card */}
          {existing && (
            <div className="border border-gray-200 rounded-md p-4 bg-[#FAFAFA]">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Horario Existente en Base de Datos</span>
                <span className="text-[#D32F2F] font-semibold">Ocupado</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[11px]">Día:</span>
                    <span className="font-semibold text-gray-800">{getDiaNombre(existing.dia_semana)}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[11px]">Bloque Horario:</span>
                    <span className="font-bold text-[#D32F2F]">{existing.hora_inicio} - {existing.hora_fin}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[11px]">Instructor Asignado:</span>
                    <span className="font-semibold text-gray-800">{existingInstructor?.nombre_completo || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[11px]">Ambiente:</span>
                    <span className="font-semibold text-gray-800">{existingAmbiente?.numero_ambiente || 'N/A'}</span>
                  </div>
                </div>

                <div className="col-span-2 flex items-start space-x-2 pt-1 border-t border-gray-200">
                  <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[11px]">Ficha & Competencia:</span>
                    <span className="font-medium text-gray-800">
                      {existingPrograma?.codigo_ficha} - {existing.materia_competencia}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explanatory Note on Business Rule */}
          <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200">
            <span className="font-semibold text-gray-700">Normativa GDHC:</span> El sistema impide guardar registros que colisionen temporalmente para garantizar que ningún instructor deba estar en dos sitios simultáneamente, ningún aula tenga doble ocupación, y ninguna ficha reciba dos materias a la misma hora.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Entendido, Corregir Horario
          </button>
        </div>
      </div>
    </div>
  );
};
