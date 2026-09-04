import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Plus, 
  Download, 
  MapPin, 
  User, 
  BookOpen, 
  Trash2, 
  Edit3, 
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';
import { Horario, Profile, Ambiente, Programa } from '../types';
import { DIAS_SEMANA, timeToMinutes } from '../services/overlapEngine';
import { excelService } from '../services/excelService';

interface ScheduleMatrixProps {
  horarios: Horario[];
  profiles: Profile[];
  ambientes: Ambiente[];
  programas: Programa[];
  isAdmin?: boolean;
  onOpenCreateModal?: (defaultDay?: number, defaultTime?: string) => void;
  onCellClick?: (defaultDay?: number, defaultTime?: string) => void;
  onEditHorario: (horario: Horario) => void;
  onDeleteHorario: (id: string) => void;
}

// Bloques horarios estándar de formación SENA (06:00 a 22:00)
const TIME_SLOTS = [
  { start: '06:00', end: '08:00', label: '06:00 - 08:00' },
  { start: '08:00', end: '10:00', label: '08:00 - 10:00' },
  { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
  { start: '12:00', end: '14:00', label: '12:00 - 14:00' },
  { start: '14:00', end: '16:00', label: '14:00 - 16:00' },
  { start: '16:00', end: '18:00', label: '16:00 - 18:00' },
  { start: '18:00', end: '20:00', label: '18:00 - 20:00' },
  { start: '20:00', end: '22:00', label: '20:00 - 22:00' },
];

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  horarios,
  profiles,
  ambientes,
  programas,
  isAdmin = true,
  onOpenCreateModal,
  onCellClick,
  onEditHorario,
  onDeleteHorario,
}) => {
  const [filterAmbiente, setFilterAmbiente] = useState<string>('all');
  const [filterInstructor, setFilterInstructor] = useState<string>('all');
  const [filterFicha, setFilterFicha] = useState<string>('all');
  const [filterJornada, setFilterJornada] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const triggerCreateModal = (day?: number, time?: string) => {
    if (onCellClick) {
      onCellClick(day, time);
    } else if (onOpenCreateModal) {
      onOpenCreateModal(day, time);
    }
  };

  // Filtrado reactivo de horarios
  const filteredHorarios = useMemo(() => {
    return horarios.filter(h => {
      if (filterAmbiente !== 'all' && h.ambiente_id !== filterAmbiente) return false;
      if (filterInstructor !== 'all' && h.instructor_id !== filterInstructor) return false;
      if (filterFicha !== 'all' && h.programa_id !== filterFicha) return false;

      const prog = programas.find(p => p.id === h.programa_id);
      if (filterJornada !== 'all' && prog?.jornada !== filterJornada) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inst = profiles.find(p => p.id === h.instructor_id);
        const amb = ambientes.find(a => a.id === h.ambiente_id);
        const matchText = `${h.materia_competencia} ${prog?.codigo_ficha} ${prog?.nombre_programa} ${inst?.nombre_completo} ${amb?.numero_ambiente}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }

      return true;
    });
  }, [horarios, filterAmbiente, filterInstructor, filterFicha, filterJornada, searchQuery, programas, profiles, ambientes]);

  // Encuentra los horarios que caen o se intersectan con un día y bloque horario específico
  const getHorariosForCell = (diaId: number, slotStart: string, slotEnd: string) => {
    const slotMinStart = timeToMinutes(slotStart);
    const slotMinEnd = timeToMinutes(slotEnd);

    return filteredHorarios.filter(h => {
      if (Number(h.dia_semana) !== Number(diaId)) return false;
      const hStart = timeToMinutes(h.hora_inicio);
      const hEnd = timeToMinutes(h.hora_fin);

      // Intersección
      return hStart < slotMinEnd && hEnd > slotMinStart;
    });
  };

  const handleExportExcel = () => {
    excelService.exportHorariosToExcel(
      filteredHorarios,
      profiles,
      programas,
      ambientes,
      'Matriz_Horarios_GDHC_SENA'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs no-print transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#00324D] dark:text-[#39A900]" />
            <h2 className="text-sm font-bold text-[#00324D] dark:text-slate-100 uppercase tracking-wider">
              Filtros de Consulta
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({filteredHorarios.length} de {horarios.length} bloques asignados)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Imprimir Horario"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-[#00324D] hover:bg-[#002236] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs border border-[#002236] dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-[#39A900]" />
              <span>Exportar Excel (.xlsx)</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => triggerCreateModal()}
                className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                id="btn-nuevo-horario"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar Horario</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-3">
          {/* Filter by Ambiente */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Ambiente / Salón
            </label>
            <select
              value={filterAmbiente}
              onChange={e => setFilterAmbiente(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
            >
              <option value="all">Todos los Ambientes ({ambientes.length})</option>
              {ambientes.map(a => (
                <option key={a.id} value={a.id}>
                  {a.numero_ambiente} ({a.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Instructor */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Instructor
            </label>
            <select
              value={filterInstructor}
              onChange={e => setFilterInstructor(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
            >
              <option value="all">Todos los Instructores</option>
              {profiles
                .filter(p => p.rol === 'instructor')
                .map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre_completo}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter by Ficha */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Ficha / Programa
            </label>
            <select
              value={filterFicha}
              onChange={e => setFilterFicha(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
            >
              <option value="all">Todas las Fichas ({programas.length})</option>
              {programas.map(prog => (
                <option key={prog.id} value={prog.id}>
                  {prog.codigo_ficha} - {prog.nombre_programa.substring(0, 25)}...
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Jornada */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Jornada
            </label>
            <select
              value={filterJornada}
              onChange={e => setFilterJornada(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
            >
              <option value="all">Todas las Jornadas</option>
              <option value="Mañana">Mañana (06:00 - 12:00)</option>
              <option value="Tarde">Tarde (12:00 - 18:00)</option>
              <option value="Noche">Noche (18:00 - 22:00)</option>
              <option value="Mixta">Mixta</option>
            </select>
          </div>

          {/* Text Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Buscar por texto
            </label>
            <input
              type="text"
              placeholder="Competencia, instructor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Interactive Schedule Matrix Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto transition-colors">
        <table className="w-full border-collapse min-w-[900px]">
          {/* Header Days of Week (Lunes - Sábado) */}
          <thead>
            <tr className="bg-[#00324D] dark:bg-slate-950 text-white">
              <th className="p-3 text-left text-xs font-bold uppercase tracking-wider w-28 border-r border-[#002236] dark:border-slate-800">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#39A900]" />
                  <span>Franja</span>
                </div>
              </th>
              {DIAS_SEMANA.map(dia => (
                <th
                  key={dia.id}
                  className="p-3 text-center text-xs font-bold uppercase tracking-wider border-r border-[#002236] dark:border-slate-800 last:border-r-0 hover:bg-[#00283d] dark:hover:bg-slate-900/80 transition-colors"
                >
                  <div>{dia.nombre}</div>
                  <div className="text-[10px] text-slate-300 dark:text-slate-400 font-normal">Jornada Activa</div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Time Slots Rows */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {TIME_SLOTS.map((slot, sIdx) => (
              <tr key={sIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                {/* Time Slot Header */}
                <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 align-top whitespace-nowrap">
                  <div className="text-[#00324D] dark:text-emerald-400">{slot.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">2 Horas</div>
                </td>

                {/* Day Columns */}
                {DIAS_SEMANA.map(dia => {
                  const cellHorarios = getHorariosForCell(dia.id, slot.start, slot.end);

                  return (
                    <td
                      key={dia.id}
                      className="p-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top schedule-grid-cell"
                    >
                      {cellHorarios.length === 0 ? (
                        /* Empty State: Dotted border, click to add */
                        isAdmin ? (
                          <button
                            onClick={() => triggerCreateModal(dia.id, slot.start)}
                            className="w-full h-full min-h-[64px] border border-dashed border-slate-200 dark:border-slate-700 hover:border-[#39A900] dark:hover:border-[#39A900] hover:bg-[#f5fcea]/40 dark:hover:bg-emerald-950/20 rounded-xl p-2 text-center text-slate-400 dark:text-slate-500 hover:text-[#226d00] dark:hover:text-emerald-400 transition-all flex flex-col items-center justify-center group cursor-pointer"
                            title={`Asignar horario para ${dia.nombre} a las ${slot.start}`}
                          >
                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[10px] font-medium opacity-60 group-hover:opacity-100">
                              Disponible
                            </span>
                          </button>
                        ) : (
                          <div className="w-full min-h-[64px] rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">
                            Libre
                          </div>
                        )
                      ) : (
                        /* Filled State: SENA Green Left Accent Card */
                        <div className="space-y-1.5">
                          {cellHorarios.map(h => {
                            const instructor = profiles.find(p => p.id === h.instructor_id);
                            const programa = programas.find(p => p.id === h.programa_id);
                            const ambiente = ambientes.find(a => a.id === h.ambiente_id);

                            return (
                              <div
                                key={h.id}
                                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-2xs border-l-4 border-l-[#39A900] hover:shadow-xs transition-all text-left relative group"
                              >
                                {/* Header: Time & Program */}
                                <div className="flex items-center justify-between text-[11px] font-bold text-[#00324D] dark:text-slate-100">
                                  <span className="bg-[#e9f1df] dark:bg-emerald-950/80 text-[#226d00] dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    {h.hora_inicio} - {h.hora_fin}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                                    Ficha {programa?.codigo_ficha}
                                  </span>
                                </div>

                                {/* Subject / Competence */}
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-2 leading-tight">
                                  {h.materia_competencia}
                                </div>

                                {/* Details: Instructor & Room */}
                                <div className="mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 flex flex-col space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                  <div className="flex items-center space-x-1 truncate" title={instructor?.nombre_completo}>
                                    <User className="w-3 h-3 text-[#39A900] shrink-0" />
                                    <span className="truncate">{instructor?.nombre_completo}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 truncate" title={ambiente?.nombre_ambiente}>
                                    <MapPin className="w-3 h-3 text-[#0288D1] dark:text-sky-400 shrink-0" />
                                    <span className="truncate">{ambiente?.numero_ambiente}</span>
                                  </div>
                                </div>

                                {/* Admin Action Toolbar on Hover */}
                                {isAdmin && (
                                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xs p-0.5 flex space-x-1 border border-slate-200 dark:border-slate-700 no-print">
                                    <button
                                      onClick={() => onEditHorario(h)}
                                      className="p-1 text-slate-500 hover:text-[#00324D] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                                      title="Editar Asignación"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`¿Eliminar la asignación de "${h.materia_competencia}"?`)) {
                                          onDeleteHorario(h.id);
                                        }
                                      }}
                                      className="p-1 text-slate-500 hover:text-[#D32F2F] dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded cursor-pointer"
                                      title="Eliminar Horario"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
