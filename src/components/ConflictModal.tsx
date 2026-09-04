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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-red-500 dark:border-red-600/80 overflow-hidden transition-colors">
        {/* Header with status-error style */}
        <div className="bg-red-600 dark:bg-red-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
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
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Main Error Description Box */}
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs leading-relaxed">
            <span className="font-bold">Detalle del Conflicto: </span>
            {conflict.description}
          </div>

          {/* Detailed Comparison Card */}
          {existing && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/80 dark:bg-slate-800/60">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Horario Existente en Base de Datos</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">Ocupado</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Día:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{getDiaNombre(existing.dia_semana)}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Bloque Horario:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{existing.hora_inicio} - {existing.hora_fin}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Instructor Asignado:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{existingInstructor?.nombre_completo || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Ambiente:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{existingAmbiente?.numero_ambiente || 'N/A'}</span>
                  </div>
                </div>

                <div className="col-span-2 flex items-start space-x-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Ficha & Competencia:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {existingPrograma?.codigo_ficha} - {existing.materia_competencia}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explanatory Note on Business Rule */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Normativa GDHC:</span> El sistema impide guardar registros que colisionen temporalmente para garantizar que ningún instructor deba estar en dos sitios simultáneamente, ningún aula tenga doble ocupación, y ninguna ficha reciba dos materias a la misma hora.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00324D] hover:bg-[#002236] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer border border-transparent dark:border-slate-700"
          >
            Entendido, Corregir Horario
          </button>
        </div>
      </div>
    </div>
  );
};
