import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Horario, Profile, Ambiente, Programa } from '../types';
import { validateHorarioOverlap, DIAS_SEMANA } from '../services/overlapEngine';

interface ScheduleAssignmentModalProps {
  initialHorario?: Partial<Horario>;
  isEditing?: boolean;
  horarios: Horario[];
  profiles: Profile[];
  ambientes: Ambiente[];
  programas: Programa[];
  currentUserId: string;
  onSave: (horario: Omit<Horario, 'id' | 'created_at'>) => boolean | Promise<boolean>;
  onClose: () => void;
}

export const ScheduleAssignmentModal: React.FC<ScheduleAssignmentModalProps> = ({
  initialHorario,
  isEditing = false,
  horarios,
  profiles,
  ambientes,
  programas,
  currentUserId,
  onSave,
  onClose,
}) => {
  const instructors = profiles.filter(p => p.rol === 'instructor');

  const [instructorId, setInstructorId] = useState(initialHorario?.instructor_id || instructors[0]?.id || '');
  const [programaId, setProgramaId] = useState(initialHorario?.programa_id || programas[0]?.id || '');
  const [ambienteId, setAmbienteId] = useState(initialHorario?.ambiente_id || ambientes[0]?.id || '');
  const [diaSemana, setDiaSemana] = useState(initialHorario?.dia_semana ? Number(initialHorario.dia_semana) : 1);
  const [horaInicio, setHoraInicio] = useState(initialHorario?.hora_inicio || '07:00');
  const [horaFin, setHoraFin] = useState(initialHorario?.hora_fin || '11:00');
  const [materiaCompetencia, setMateriaCompetencia] = useState(initialHorario?.materia_competencia || '');
  
  const [liveConflict, setLiveConflict] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Ejecutar validación de OVERLAPS en tiempo real cada vez que cambia un campo
  useEffect(() => {
    if (!instructorId || !programaId || !ambienteId || !horaInicio || !horaFin) return;

    const conflict = validateHorarioOverlap(
      {
        instructor_id: instructorId,
        programa_id: programaId,
        ambiente_id: ambienteId,
        dia_semana: Number(diaSemana),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      },
      horarios,
      isEditing && initialHorario?.id ? initialHorario.id : undefined,
      profiles,
      ambientes,
      programas
    );

    setLiveConflict(conflict);
  }, [instructorId, programaId, ambienteId, diaSemana, horaInicio, horaFin, horarios, isEditing, initialHorario, profiles, ambientes, programas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!materiaCompetencia.trim()) {
      setFormError('Por favor ingrese la competencia o asignatura a impartir.');
      return;
    }

    if (horaInicio >= horaFin) {
      setFormError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    if (liveConflict && liveConflict.hasConflict) {
      setFormError(`No se puede guardar: ${liveConflict.description}`);
      return;
    }

    const payload: Omit<Horario, 'id' | 'created_at'> = {
      instructor_id: instructorId,
      programa_id: programaId,
      ambiente_id: ambienteId,
      dia_semana: Number(diaSemana),
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      materia_competencia: materiaCompetencia.trim(),
      created_by: currentUserId,
    };

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="bg-[#00324D] dark:bg-slate-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#39A900]" />
            <h3 className="text-sm sm:text-base font-bold">
              {isEditing ? 'Editar Asignación de Horario' : 'Asignar Nuevo Bloque de Horario'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Live Validation Indicator Banner */}
          {liveConflict && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 transition-all ${
                liveConflict.hasConflict
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {liveConflict.hasConflict ? (
                <AlertCircle className="w-4 h-4 text-[#D32F2F] dark:text-red-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#39A900] dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-bold">
                  {liveConflict.hasConflict ? 'Cruce Detectado: ' : 'Validación Exitosa: '}
                </span>
                <span>{liveConflict.description}</span>
              </div>
            </div>
          )}

          {formError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          {/* Ficha / Programa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-[#00324D] dark:text-emerald-400" />
              Programa / Ficha de Formación *
            </label>
            <select
              value={programaId}
              onChange={e => setProgramaId(e.target.value)}
              required
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
            >
              {programas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo_ficha} - {p.nombre_programa} ({p.jornada})
                </option>
              ))}
            </select>
          </div>

          {/* Instructor Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-[#39A900]" />
              Instructor Responsable *
            </label>
            <select
              value={instructorId}
              onChange={e => setInstructorId(e.target.value)}
              required
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
            >
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre_completo} (CC: {inst.cedula}) - {inst.especialidad || 'Instructor SENA'}
                </option>
              ))}
            </select>
          </div>

          {/* Ambiente / Salón */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#0288D1] dark:text-sky-400" />
              Ambiente / Espacio de Formación *
            </label>
            <select
              value={ambienteId}
              onChange={e => setAmbienteId(e.target.value)}
              required
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
            >
              {ambientes.map(amb => (
                <option key={amb.id} value={amb.id}>
                  {amb.numero_ambiente} - {amb.nombre_ambiente} ({amb.sede}) [Cap: {amb.capacidad}]
                </option>
              ))}
            </select>
          </div>

          {/* Día de la Semana y Horarios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Día *
              </label>
              <select
                value={diaSemana}
                onChange={e => setDiaSemana(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
              >
                {DIAS_SEMANA.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Hora Inicio *
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                required
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Hora Fin *
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={e => setHoraFin(e.target.value)}
                required
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Materia / Competencia */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Competencia / Resultado de Aprendizaje / Materia *
            </label>
            <input
              type="text"
              value={materiaCompetencia}
              onChange={e => setMateriaCompetencia(e.target.value)}
              required
              placeholder="Ej: Construcción de Bases de Datos Relacionales y NoSQL"
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={Boolean(liveConflict?.hasConflict)}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors shadow-xs cursor-pointer ${
                liveConflict?.hasConflict
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-[#39A900] hover:bg-[#226d00]'
              }`}
            >
              {isEditing ? 'Actualizar Horario' : 'Guardar Horario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
