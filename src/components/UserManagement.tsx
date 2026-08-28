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
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Profile, Programa, UserRole } from '../types';
import { db } from '../services/db';
import { excelService } from '../services/excelService';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  // Form State for Manual Add/Edit
  const [formCedula, setFormCedula] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRol, setFormRol] = useState<UserRole>('instructor');
  const [formEspecialidad, setFormEspecialidad] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formFichaId, setFormFichaId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const filteredProfiles = profiles.filter(p => {
    if (roleFilter !== 'all' && p.rol !== roleFilter) return false;
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
    setFormRol('instructor');
    setFormEspecialidad('');
    setFormTelefono('');
    setFormFichaId(programas[0]?.id || '');
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
      <div className="bg-white p-4 rounded-md border border-[#E0E0E0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#00324D]" />
          <div>
            <h2 className="text-sm font-bold text-[#00324D] uppercase tracking-wider">
              Gestión de Usuarios (Instructores & Aprendices)
            </h2>
            <p className="text-xs text-gray-500">
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
            className="px-3 py-1.5 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-4 h-4 text-[#39A900]" />
            <span>Carga Masiva (Excel)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Usuario</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-md border border-[#E0E0E0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre o correo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#39A900] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              roleFilter === 'all' ? 'bg-[#00324D] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todos ({profiles.length})
          </button>
          <button
            onClick={() => setRoleFilter('instructor')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              roleFilter === 'instructor' ? 'bg-[#39A900] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Instructores ({profiles.filter(p => p.rol === 'instructor').length})
          </button>
          <button
            onClick={() => setRoleFilter('aprendiz')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              roleFilter === 'aprendiz' ? 'bg-[#0288D1] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Aprendices ({profiles.filter(p => p.rol === 'aprendiz').length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-md border border-[#E0E0E0] shadow-xs overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[750px]">
          <thead>
            <tr className="bg-[#00324D] text-white">
              <th className="p-3 font-bold uppercase tracking-wider">Cédula (Única)</th>
              <th className="p-3 font-bold uppercase tracking-wider">Nombre Completo</th>
              <th className="p-3 font-bold uppercase tracking-wider">Rol</th>
              <th className="p-3 font-bold uppercase tracking-wider">Detalle / Especialidad</th>
              <th className="p-3 font-bold uppercase tracking-wider">Contacto</th>
              <th className="p-3 font-bold uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No se encontraron usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredProfiles.map(u => {
                const ficha = u.ficha_id ? programas.find(p => p.id === u.ficha_id) : null;

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#00324D] whitespace-nowrap">
                      {u.cedula}
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      <div>{u.nombre_completo}</div>
                      <div className="text-[11px] text-gray-400">{u.email}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {u.rol === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#00324D] text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          ADMINISTRADOR
                        </span>
                      ) : u.rol === 'instructor' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#e9f1df] text-[#226d00]">
                          <Briefcase className="w-3 h-3 mr-1" />
                          INSTRUCTOR
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#e1f5fe] text-[#0288D1]">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          APRENDIZ
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">
                      {u.rol === 'instructor' && (
                        <span>{u.especialidad || 'General'}</span>
                      )}
                      {u.rol === 'aprendiz' && (
                        <div>
                          {ficha ? (
                            <span className="font-semibold text-gray-800">
                              Ficha {ficha.codigo_ficha} ({ficha.nombre_programa.substring(0, 20)}...)
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Sin ficha asignada</span>
                          )}
                        </div>
                      )}
                      {u.rol === 'admin' && <span className="text-gray-500">Coordinación GDHC</span>}
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {u.telefono || 'Sin teléfono'}
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1 text-gray-600 hover:text-[#00324D] hover:bg-gray-100 rounded transition-colors"
                        title="Editar Usuario"
                      >
                        <Edit3 className="w-4 h-4 inline" />
                      </button>
                      {u.rol !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1 text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 rounded transition-colors"
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
          <div className="bg-white rounded-md shadow-xl max-w-md w-full border border-[#E0E0E0] overflow-hidden">
            <div className="bg-[#00324D] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingUser ? 'Editar Usuario SENA' : 'Registrar Nuevo Usuario'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Número de Cédula (Documento Único) *
                </label>
                <input
                  type="text"
                  value={formCedula}
                  onChange={e => setFormCedula(e.target.value)}
                  required
                  placeholder="Ej: 1020304050"
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  required
                  placeholder="Ej: Carlos Eduardo Mendoza"
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  required
                  placeholder="Ej: cmendoza@sena.edu.co"
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Rol *
                  </label>
                  <select
                    value={formRol}
                    onChange={e => setFormRol(e.target.value as UserRole)}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    <option value="instructor">Instructor</option>
                    <option value="aprendiz">Aprendiz</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formTelefono}
                    onChange={e => setFormTelefono(e.target.value)}
                    placeholder="3124567890"
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              {formRol === 'instructor' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Especialidad Técnica
                  </label>
                  <input
                    type="text"
                    value={formEspecialidad}
                    onChange={e => setFormEspecialidad(e.target.value)}
                    placeholder="Ej: Arquitectura de Software y Cloud"
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              )}

              {formRol === 'aprendiz' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Ficha Asignada
                  </label>
                  <select
                    value={formFichaId}
                    onChange={e => setFormFichaId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    {programas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.codigo_ficha} - {p.nombre_programa}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded shadow-xs"
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
          <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full border border-[#E0E0E0] overflow-hidden">
            <div className="bg-[#00324D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-[#39A900]" />
                <h3 className="text-sm font-bold">Carga Masiva de Usuarios (Excel .xlsx)</h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#f5fcea] border border-[#becbb3] rounded">
                <span className="text-xs text-[#226d00]">
                  Descarga la plantilla con validaciones de Cédula Única y columnas requeridas.
                </span>
                <button
                  onClick={() => excelService.downloadUsuariosTemplate()}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#39A900] text-white rounded text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Plantilla Usuarios</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center bg-gray-50">
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
                  className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-[#00324D] text-[#00324D] rounded text-xs font-bold shadow-2xs hover:bg-[#00324D] hover:text-white transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seleccionar Archivo Excel</span>
                </label>
                {bulkFile && (
                  <p className="mt-2 text-xs text-gray-700 font-medium">
                    {bulkFile.name} ({(bulkFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {bulkProcessing && (
                <div className="text-xs text-center text-gray-500">
                  Validando cédulas únicas y estructura...
                </div>
              )}

              {bulkError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {bulkError}
                </div>
              )}

              {bulkResult && (
                <div className="space-y-3">
                  <div className="flex space-x-3 text-center text-xs">
                    <div className="flex-1 p-2 bg-[#f5fcea] border border-[#becbb3] rounded">
                      <div className="font-bold text-[#226d00] text-base">{bulkResult.valid.length}</div>
                      <div className="text-gray-600">Válidos para Insertar</div>
                    </div>
                    <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="font-bold text-red-600 text-base">{bulkResult.errors.length}</div>
                      <div className="text-gray-600">Errores / Cédula Duplicada</div>
                    </div>
                  </div>

                  {bulkResult.errors.length > 0 && (
                    <div className="max-h-36 overflow-y-auto border border-red-200 rounded p-2 bg-red-50/50 text-xs text-red-800 space-y-1">
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

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded"
              >
                Cerrar
              </button>
              {bulkResult && bulkResult.valid.length > 0 && (
                <button
                  onClick={handleCommitBulkUsers}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded shadow-xs"
                >
                  Insertar {bulkResult.valid.length} Usuarios Válidos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
