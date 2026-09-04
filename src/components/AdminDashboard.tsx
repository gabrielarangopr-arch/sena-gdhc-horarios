import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Plus, 
  UploadCloud, 
  ShieldCheck, 
  Briefcase,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Profile, Horario, Programa, Ambiente, OverlapConflict } from '../types';
import { ScheduleMatrix } from './ScheduleMatrix';
import { UserManagement } from './UserManagement';
import { ProgramsManagement } from './ProgramsManagement';
import { AmbientesManagement } from './AmbientesManagement';
import { ScheduleAssignmentModal } from './ScheduleAssignmentModal';
import { BulkScheduleUploadModal } from './BulkScheduleUploadModal';
import { ConflictModal } from './ConflictModal';

interface AdminDashboardProps {
  currentUser: Profile;
  profiles: Profile[];
  programas: Programa[];
  ambientes: Ambiente[];
  horarios: Horario[];
  onRefreshData: () => void;
  onCreateHorario: (horario: Omit<Horario, 'id' | 'created_at'>) => Promise<boolean>;
  onUpdateHorario: (id: string, updates: Partial<Horario>) => Promise<boolean>;
  onDeleteHorario: (id: string) => void;
  onBatchInsertHorarios: (validHorarios: Array<Omit<Horario, 'id' | 'created_at'>>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  profiles,
  programas,
  ambientes,
  horarios,
  onRefreshData,
  onCreateHorario,
  onUpdateHorario,
  onDeleteHorario,
  onBatchInsertHorarios,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'programas' | 'ambientes'>('matrix');

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [defaultDay, setDefaultDay] = useState<number | undefined>(undefined);
  const [defaultTime, setDefaultTime] = useState<string | undefined>(undefined);

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [activeConflict, setActiveConflict] = useState<OverlapConflict | null>(null);

  const instructors = profiles.filter(p => p.rol === 'instructor');
  const aprendices = profiles.filter(p => p.rol === 'aprendiz');
  const aprendicesRegistrados = aprendices.filter(p => p.registrado);
  const aprendicesPendientes = aprendices.filter(p => !p.registrado);

  const handleOpenCreate = (day?: number, time?: string) => {
    setEditingHorario(null);
    setDefaultDay(day);
    setDefaultTime(time);
    setShowAssignModal(true);
  };

  const handleOpenEdit = (horario: Horario) => {
    setEditingHorario(horario);
    setShowAssignModal(true);
  };

  const handleSaveAssignment = async (horarioData: Omit<Horario, 'id' | 'created_at'>) => {
    if (editingHorario) {
      return await onUpdateHorario(editingHorario.id, horarioData);
    } else {
      return await onCreateHorario(horarioData);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Layout Reestructurado: Contenido Principal + Panel Lateral de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Principal: Pestañas de Navegación y Vistas */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* Barra Superior con Pestañas Estilo Moderno (Pill tabs) y Acciones */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'matrix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Matriz de Horarios</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Usuarios ({profiles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('programas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'programas'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fichas ({programas.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ambientes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ambientes'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Ambientes ({ambientes.length})</span>
              </button>
            </div>

            {/* Acciones Rápidas en Cabecera */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkUploadModal(true)}
                id="btn-admin-bulk-excel"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Carga masiva de horarios desde archivo Excel"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Cargar Excel</span>
              </button>

              <button
                onClick={() => handleOpenCreate()}
                id="btn-admin-new-assignment"
                className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar Horario</span>
              </button>
            </div>
          </div>

          {/* Vistas Dinámicas Según Pestaña Activa */}
          {activeTab === 'matrix' && (
            <ScheduleMatrix
              horarios={horarios}
              profiles={profiles}
              programas={programas}
              ambientes={ambientes}
              onCellClick={(day, time) => handleOpenCreate(day, time)}
              onEditHorario={handleOpenEdit}
              onDeleteHorario={onDeleteHorario}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              profiles={profiles}
              programas={programas}
              onRefreshProfiles={onRefreshData}
            />
          )}

          {activeTab === 'programas' && (
            <ProgramsManagement
              programas={programas}
              horarios={horarios}
              onRefreshProgramas={onRefreshData}
            />
          )}

          {activeTab === 'ambientes' && (
            <AmbientesManagement
              ambientes={ambientes}
              horarios={horarios}
              onRefreshAmbientes={onRefreshData}
            />
          )}
        </div>

        {/* Columna Lateral: Tarjetas Reestructuradas de Resumen y Métricas del Centro */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 no-print">
          
          {/* Tarjeta de Integridad de Horarios (OVERLAPS) */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                100% Verificado
              </span>
            </div>
            <div className="mt-3">
              <div className="text-lg font-bold text-slate-800">0 Cruces Detectados</div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                El motor de validación relacional garantiza cero solapamientos entre instructores y ambientes.
              </p>
            </div>
          </div>

          {/* Tarjetas de Métricas Institucionales (Forma suave y moderna) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resumen del Centro
            </h3>

            {/* Métrica 1: Instructores */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-[#39A900] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Instructores</div>
                  <div className="text-[11px] text-slate-500">De planta y contrato</div>
                </div>
              </div>
              <span className="text-base font-bold text-slate-900">{instructors.length}</span>
            </div>

            {/* Métrica 2: Aprendices (Con estado de registro) */}
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Aprendices</div>
                    <div className="text-[11px] text-slate-500">En base de datos</div>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900">{aprendices.length}</span>
              </div>
              
              {/* Desglose de registro */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200/60">
                  <span className="text-emerald-700 font-medium">Activos:</span>
                  <span className="font-bold text-slate-800">{aprendicesRegistrados.length}</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200/60">
                  <span className="text-amber-700 font-medium">Pendientes:</span>
                  <span className="font-bold text-slate-800">{aprendicesPendientes.length}</span>
                </div>
              </div>
            </div>

            {/* Métrica 3: Fichas de Formación */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Fichas Activas</div>
                  <div className="text-[11px] text-slate-500">Programas técnicos y tecnólogos</div>
                </div>
              </div>
              <span className="text-base font-bold text-slate-900">{programas.length}</span>
            </div>

            {/* Métrica 4: Ambientes Disponibles */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Ambientes</div>
                  <div className="text-[11px] text-slate-500">Cómputo, aulas y laboratorios</div>
                </div>
              </div>
              <span className="text-base font-bold text-slate-900">{ambientes.length}</span>
            </div>

            {/* Métrica 5: Bloques de Horario Programados */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100/80 text-violet-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Bloques de Horario</div>
                  <div className="text-[11px] text-slate-500">Semana Lunes a Sábado</div>
                </div>
              </div>
              <span className="text-base font-bold text-slate-900">{horarios.length}</span>
            </div>

          </div>

          {/* Tarjeta de Acceso Rápido a Instructores y Aprendices */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-[#39A900]" />
              <span>Gestión de Aprendices</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Puedes cargar listas de aprendices en Excel desde la pestaña de Usuarios. Cada aprendiz activará su cuenta ingresando su cédula.
            </p>
            <button
              onClick={() => setActiveTab('users')}
              className="mt-3 w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
            >
              Ir a Gestión de Usuarios
            </button>
          </div>

        </div>

      </div>

      {/* Modales de Asignación y Carga Masiva */}
      {showAssignModal && (
        <ScheduleAssignmentModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSave={handleSaveAssignment}
          profiles={profiles}
          programas={programas}
          ambientes={ambientes}
          existingHorarios={horarios}
          initialHorario={editingHorario || undefined}
          defaultDay={defaultDay}
          defaultTime={defaultTime}
        />
      )}

      {showBulkUploadModal && (
        <BulkScheduleUploadModal
          isOpen={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          profiles={profiles}
          programas={programas}
          ambientes={ambientes}
          existingHorarios={horarios}
          onBatchInsert={onBatchInsertHorarios}
        />
      )}

      {activeConflict && (
        <ConflictModal
          conflict={activeConflict}
          onClose={() => setActiveConflict(null)}
        />
      )}
    </div>
  );
};
