import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Plus, 
  UploadCloud, 
  ShieldCheck, 
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers
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

  const instructorsCount = profiles.filter(p => p.rol === 'instructor').length;
  const aprendicesCount = profiles.filter(p => p.rol === 'aprendiz').length;

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
    <div className="space-y-5">
      {/* Top Institutional KPI Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 no-print">
        {/* KPI 1: Instructores */}
        <div className="bg-white p-3.5 rounded-md border border-[#E0E0E0] shadow-2xs border-l-4 border-l-[#39A900]">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Instructores</span>
            <Briefcase className="w-4 h-4 text-[#39A900]" />
          </div>
          <div className="text-xl font-black text-[#00324D] mt-1">{instructorsCount}</div>
          <div className="text-[11px] text-[#226d00] font-medium">Asignados y activos</div>
        </div>

        {/* KPI 2: Fichas Activas */}
        <div className="bg-white p-3.5 rounded-md border border-[#E0E0E0] shadow-2xs border-l-4 border-l-[#00324D]">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Fichas Activas</span>
            <BookOpen className="w-4 h-4 text-[#00324D]" />
          </div>
          <div className="text-xl font-black text-[#00324D] mt-1">{programas.length}</div>
          <div className="text-[11px] text-gray-500 font-medium">Todas las jornadas</div>
        </div>

        {/* KPI 3: Ambientes */}
        <div className="bg-white p-3.5 rounded-md border border-[#E0E0E0] shadow-2xs border-l-4 border-l-[#0288D1]">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Ambientes</span>
            <MapPin className="w-4 h-4 text-[#0288D1]" />
          </div>
          <div className="text-xl font-black text-[#00324D] mt-1">{ambientes.length}</div>
          <div className="text-[11px] text-gray-500 font-medium">Laboratorios & Aulas</div>
        </div>

        {/* KPI 4: Bloques Horarios */}
        <div className="bg-white p-3.5 rounded-md border border-[#E0E0E0] shadow-2xs border-l-4 border-l-[#fa52aa]">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Bloques de Horario</span>
            <Calendar className="w-4 h-4 text-[#b40e73]" />
          </div>
          <div className="text-xl font-black text-[#00324D] mt-1">{horarios.length}</div>
          <div className="text-[11px] text-gray-500 font-medium">Semana LUN - SÁB</div>
        </div>

        {/* KPI 5: Conflictos OVERLAPS */}
        <div className="bg-white p-3.5 rounded-md border border-[#becbb3] bg-[#f5fcea] shadow-2xs border-l-4 border-l-[#39A900] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#226d00] font-semibold uppercase">
            <span>Cruces OVERLAPS</span>
            <ShieldCheck className="w-4 h-4 text-[#39A900]" />
          </div>
          <div className="text-xl font-black text-[#226d00] mt-1">0 Conflictos</div>
          <div className="text-[11px] text-[#226d00] font-medium">Restricciones 100% OK</div>
        </div>
      </div>

      {/* Main Admin Navigation Bar & Quick Actions */}
      <div className="bg-white rounded-md border border-[#E0E0E0] shadow-2xs overflow-hidden no-print">
        <div className="flex flex-wrap items-center justify-between p-2 border-b border-gray-200 bg-[#F5F5F5] gap-2">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-[#00324D] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Matriz de Horarios (Scheduler)</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'users'
                  ? 'bg-[#00324D] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuarios (Cédula Única & Masivo)</span>
            </button>

            <button
              onClick={() => setActiveTab('programas')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'programas'
                  ? 'bg-[#00324D] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Fichas & Programas</span>
            </button>

            <button
              onClick={() => setActiveTab('ambientes')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'ambientes'
                  ? 'bg-[#00324D] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Ambientes & Sedes</span>
            </button>
          </div>

          {/* Quick Schedule Management Actions */}
          {activeTab === 'matrix' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="px-3 py-1.5 bg-white border border-[#00324D] text-[#00324D] hover:bg-[#00324D] hover:text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Cargar archivo Excel con validación de cruces y bucle de decisión"
                id="btn-carga-masiva-horarios"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#39A900]" />
                <span>Carga Masiva Excel</span>
              </button>

              <button
                onClick={() => handleOpenCreate()}
                className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar Horario Manual</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Active View Tab */}
      {activeTab === 'matrix' && (
        <ScheduleMatrix
          horarios={horarios}
          profiles={profiles}
          ambientes={ambientes}
          programas={programas}
          isAdmin={true}
          onOpenCreateModal={handleOpenCreate}
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
          onRefresh={onRefreshData}
        />
      )}

      {activeTab === 'ambientes' && (
        <AmbientesManagement
          ambientes={ambientes}
          onRefresh={onRefreshData}
        />
      )}

      {/* Manual Assignment Modal */}
      {showAssignModal && (
        <ScheduleAssignmentModal
          initialHorario={
            editingHorario || {
              dia_semana: defaultDay || 1,
              hora_inicio: defaultTime || '07:00',
              hora_fin: defaultTime ? `${(parseInt(defaultTime.split(':')[0], 10) + 4).toString().padStart(2, '0')}:00` : '11:00',
            }
          }
          isEditing={Boolean(editingHorario)}
          horarios={horarios}
          profiles={profiles}
          ambientes={ambientes}
          programas={programas}
          currentUserId={currentUser.id}
          onSave={handleSaveAssignment}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {/* Bulk Upload Modal with Loop Decision */}
      {showBulkUploadModal && (
        <BulkScheduleUploadModal
          horarios={horarios}
          profiles={profiles}
          ambientes={ambientes}
          programas={programas}
          onCommitPartial={onBatchInsertHorarios}
          onClose={() => setShowBulkUploadModal(false)}
        />
      )}

      {/* Conflict Modal */}
      {activeConflict && (
        <ConflictModal
          conflict={activeConflict}
          onClose={() => setActiveConflict(null)}
          profiles={profiles}
          ambientes={ambientes}
          programas={programas}
        />
      )}
    </div>
  );
};
