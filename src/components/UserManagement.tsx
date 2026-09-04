import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  UploadCloud, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Shield, 
  Briefcase, 
  GraduationCap, 
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Profile, Programa, UserRole } from '../types';
import { db } from '../services/db';
import { excelService } from '../services/excelService';
import { ExcelGuideModal } from './ExcelGuideModal';

interface UserManagementProps {
  profiles: Profile[];
  programas: Programa[];
  onRefreshProfiles: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  profiles,
  programas,
  onRefreshProfiles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExcelGuide, setShowExcelGuide] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  // Form State for Manual Add/Edit
  const [formCedula, setFormCedula] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRol, setFormRol] = useState<UserRole>('aprendiz');
  const [formEspecialidad, setFormEspecialidad] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formFichaId, setFormFichaId] = useState('');
  const [formPreRegistrado, setFormPreRegistrado] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const filteredProfiles = profiles.filter(p => {
    if (roleFilter !== 'all' && p.rol !== roleFilter) return false;
    const isActivo = p.rol === 'admin' || !!p.registrado;
    if (statusFilter === 'registered' && !isActivo) return false;
    if (statusFilter === 'pending' && isActivo) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${p.nombre_completo} ${p.cedula} ${p.email} ${p.especialidad || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormCedula('');
    setFormNombre('');
    setFormEmail('');
    setFormRol('aprendiz');
    setFormEspecialidad('');
    setFormTelefono('');
    setFormFichaId(programas[0]?.id || '');
    setFormPreRegistrado(true);
    setFormError(null);
    setShowAddModal(true);
  };

  const openEditModal = (user: Profile) => {
    setEditingUser(user);
    setFormCedula(user.cedula);
    setFormNombre(user.nombre_completo);
    setFormEmail(user.email);
    setFormRol(user.rol);
    setFormEspecialidad(user.especialidad || '');
    setFormTelefono(user.telefono || '');
    setFormFichaId(user.ficha_id || programas[0]?.id || '');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCedula = formCedula.trim();
    if (!cleanCedula || !formNombre.trim() || !formEmail.trim()) {
      setFormError('Cédula, nombre completo y correo son campos obligatorios.');
      return;
    }

    if (editingUser) {
      const res = await db.updateProfile(editingUser.id, {
        cedula: cleanCedula,
        nombre_completo: formNombre.trim(),
        email: formEmail.trim(),
        rol: formRol,
        especialidad: formRol === 'instructor' ? formEspecialidad.trim() : undefined,
        telefono: formTelefono.trim(),
        ficha_id: formRol === 'aprendiz' ? formFichaId : undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'Error al actualizar usuario.');
        return;
      }
    } else {
      const res = await db.createProfile({
        cedula: cleanCedula,
        nombre_completo: formNombre.trim(),
        email: formEmail.trim(),
        rol: formRol,
        especialidad: formRol === 'instructor' ? formEspecialidad.trim() : undefined,
        telefono: formTelefono.trim(),
        ficha_id: formRol === 'aprendiz' ? formFichaId : undefined,
        registrado: formRol === 'admin' ? true : !formPreRegistrado,
      });

      if (!res.success) {
        setFormError(res.error || 'Error al crear usuario.');
        return;
      }
    }

    onRefreshProfiles();
    setShowAddModal(false);
  };

  const handleDeleteUser = async (user: Profile) => {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.nombre_completo} (CC: ${user.cedula})? Esta acción removerá sus horarios vinculados.`)) {
      await db.deleteProfile(user.id);
      onRefreshProfiles();
    }
  };

  // Process Bulk User Excel
  const handleProcessBulkUsers = async (file: File) => {
    setBulkFile(file);
    setBulkProcessing(true);
    setBulkError(null);
    setBulkResult(null);

    try {
      const parsed = await excelService.parseExcelUsuarios(file, profiles, programas);
      setBulkResult(parsed);
    } catch (err: any) {
      setBulkError(err?.message || 'Error al procesar archivo.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleCommitBulkUsers = async () => {
    if (!bulkResult || !bulkResult.valid) return;
    for (const u of bulkResult.valid) {
      await db.createProfile(u);
    }
    onRefreshProfiles();
    setShowBulkModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#00324D] dark:text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-[#00324D] dark:text-white uppercase tracking-wider">
              Gestión de Usuarios (Instructores & Aprendices)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control de identidades, validación estricta de Cédula Única y roles
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setBulkFile(null);
              setBulkResult(null);
              setBulkError(null);
              setShowBulkModal(true);
            }}
            className="px-3 py-1.5 bg-[#00324D] hover:bg-[#002236] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs border border-[#002236] dark:border-slate-700"
          >
            <UploadCloud className="w-4 h-4 text-[#39A900]" />
            <span>Carga Masiva (Excel)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Usuario</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre o correo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center space-x-1 text-xs bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({profiles.length})
            </button>
            <button
              onClick={() => setRoleFilter('instructor')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                roleFilter === 'instructor' ? 'bg-[#39A900] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Instructores ({profiles.filter(p => p.rol === 'instructor').length})
            </button>
            <button
              onClick={() => setRoleFilter('aprendiz')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                roleFilter === 'aprendiz' ? 'bg-[#0288D1] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Aprendices ({profiles.filter(p => p.rol === 'aprendiz').length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 text-xs bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Estado: Todos
            </button>
            <button
              onClick={() => setStatusFilter('registered')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'registered' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pendientes
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto transition-colors">
        <table className="w-full border-collapse text-left text-xs min-w-[780px]">
          <thead>
            <tr className="bg-[#00324D] dark:bg-slate-950 text-white">
              <th className="p-3.5 font-bold uppercase tracking-wider">Cédula</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Nombre Completo</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Rol</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Estado Cuenta</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Detalle / Ficha</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Contacto</th>
              <th className="p-3.5 font-bold uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                  No se encontraron usuarios con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredProfiles.map(u => {
                const ficha = u.ficha_id ? programas.find(p => p.id === u.ficha_id) : null;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {u.cedula}
                    </td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">
                      <div>{u.nombre_completo}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {u.rol === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 dark:bg-slate-700 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          ADMIN
                        </span>
                      ) : u.rol === 'instructor' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          <Briefcase className="w-3 h-3 mr-1" />
                          INSTRUCTOR
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          APRENDIZ
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {u.rol === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-[#39A900]" />
                          Activo / Administrador
                        </span>
                      ) : u.registrado ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Registrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          Pendiente activación
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {u.rol === 'instructor' && (
                        <span>{u.especialidad || 'General'}</span>
                      )}
                      {u.rol === 'aprendiz' && (
                        <div>
                          {ficha ? (
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Ficha {ficha.codigo_ficha} ({ficha.nombre_programa.substring(0, 20)}...)
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Sin ficha asignada</span>
                          )}
                        </div>
                      )}
                      {u.rol === 'admin' && <span className="text-slate-500 dark:text-slate-400">Coordinación GDHC</span>}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {u.telefono || 'Sin teléfono'}
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar Usuario"
                      >
                        <Edit3 className="w-4 h-4 inline" />
                      </button>
                      {u.rol !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Usuario"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-[#00324D] dark:bg-slate-950 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingUser ? 'Editar Usuario SENA' : 'Registrar Nuevo Usuario'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3">
              {formError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Número de Cédula (Documento Único) *
                </label>
                <input
                  type="text"
                  value={formCedula}
                  onChange={e => setFormCedula(e.target.value)}
                  required
                  placeholder="Ej: 1020304050"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  required
                  placeholder="Ej: Carlos Eduardo Mendoza"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  required
                  placeholder="Ej: cmendoza@sena.edu.co"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Rol *
                  </label>
                  <select
                    value={formRol}
                    onChange={e => setFormRol(e.target.value as UserRole)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    <option value="instructor">Instructor</option>
                    <option value="aprendiz">Aprendiz</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formTelefono}
                    onChange={e => setFormTelefono(e.target.value)}
                    placeholder="3124567890"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              {formRol === 'instructor' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Especialidad Técnica
                  </label>
                  <input
                    type="text"
                    value={formEspecialidad}
                    onChange={e => setFormEspecialidad(e.target.value)}
                    placeholder="Ej: Arquitectura de Software y Cloud"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              )}

              {formRol === 'aprendiz' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Ficha Asignada
                  </label>
                  <select
                    value={formFichaId}
                    onChange={e => setFormFichaId(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    {programas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.codigo_ficha} - {p.nombre_programa}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!editingUser && formRol !== 'admin' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPreRegistrado}
                      onChange={e => setFormPreRegistrado(e.target.checked)}
                      className="mt-0.5 text-[#39A900] rounded focus:ring-[#39A900]"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        Pre-registrar usuario (activación manual requerida)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        El usuario deberá activar su cuenta y crear su contraseña con su número de documento.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-[#00324D] dark:bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-[#39A900]" />
                <h3 className="text-sm font-bold">Carga Masiva de Usuarios (Excel .xlsx)</h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl gap-2">
                <span className="text-xs text-emerald-800 dark:text-emerald-300">
                  Estructura oficial para carga masiva de aprendices e instructores.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExcelGuide(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#39A900]" />
                    <span>Ver Guía de Columnas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => excelService.downloadUsuariosTemplate()}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-800/50">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  id="user-file-input"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessBulkUsers(e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor="user-file-input"
                  className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[#00324D] dark:border-slate-600 text-[#00324D] dark:text-slate-200 rounded-xl text-xs font-bold shadow-2xs hover:bg-[#00324D] hover:text-white dark:hover:bg-slate-700 transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seleccionar Archivo Excel</span>
                </label>
                {bulkFile && (
                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {bulkFile.name} ({(bulkFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {bulkProcessing && (
                <div className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Validando cédulas únicas y estructura...
                </div>
              )}

              {bulkError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl">
                  {bulkError}
                </div>
              )}

              {bulkResult && (
                <div className="space-y-3">
                  <div className="flex space-x-3 text-center text-xs">
                    <div className="flex-1 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="font-bold text-[#226d00] dark:text-emerald-400 text-base">{bulkResult.valid.length}</div>
                      <div className="text-slate-600 dark:text-slate-400">Válidos para Insertar</div>
                    </div>
                    <div className="flex-1 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
                      <div className="font-bold text-red-600 dark:text-red-400 text-base">{bulkResult.errors.length}</div>
                      <div className="text-slate-600 dark:text-slate-400">Errores / Cédula Duplicada</div>
                    </div>
                  </div>

                  {bulkResult.errors.length > 0 && (
                    <div className="max-h-36 overflow-y-auto border border-red-200 dark:border-red-900 rounded-xl p-2 bg-red-50/50 dark:bg-red-950/30 text-xs text-red-800 dark:text-red-300 space-y-1">
                      {bulkResult.errors.map((err: any, idx: number) => (
                        <div key={idx}>
                          • Fila {err.row} (CC: {err.cedula}): {err.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cerrar
              </button>
              {bulkResult && bulkResult.valid.length > 0 && (
                <button
                  onClick={handleCommitBulkUsers}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded-xl shadow-xs cursor-pointer"
                >
                  Insertar {bulkResult.valid.length} Usuarios Válidos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Guía de Estructura Excel */}
      {showExcelGuide && (
        <ExcelGuideModal
          initialTab="usuarios"
          onClose={() => setShowExcelGuide(false)}
        />
      )}
    </div>
  );
};
