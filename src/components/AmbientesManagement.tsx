import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit3, X, Laptop, Wrench, Monitor, Building2 } from 'lucide-react';
import { Ambiente, TipoAmbiente } from '../types';
import { db } from '../services/db';

interface AmbientesManagementProps {
  ambientes: Ambiente[];
  onRefresh: () => void;
}

export const AmbientesManagement: React.FC<AmbientesManagementProps> = ({
  ambientes,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAmb, setEditingAmb] = useState<Ambiente | null>(null);
  const [numeroAmbiente, setNumeroAmbiente] = useState('');
  const [nombreAmbiente, setNombreAmbiente] = useState('');
  const [sede, setSede] = useState('Sede Central - Torre TIC');
  const [tipo, setTipo] = useState<TipoAmbiente>('Aula de Cómputo');
  const [capacidad, setCapacidad] = useState<number>(30);
  const [equipamientoStr, setEquipamientoStr] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreate = () => {
    setEditingAmb(null);
    setNumeroAmbiente('');
    setNombreAmbiente('');
    setSede('Sede Central - Torre TIC');
    setTipo('Aula de Cómputo');
    setCapacidad(30);
    setEquipamientoStr('30 Computadores Core i7, Video Beam 4K, Red Gigabit');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (amb: Ambiente) => {
    setEditingAmb(amb);
    setNumeroAmbiente(amb.numero_ambiente);
    setNombreAmbiente(amb.nombre_ambiente);
    setSede(amb.sede);
    setTipo(amb.tipo);
    setCapacidad(amb.capacidad);
    setEquipamientoStr(amb.equipamiento?.join(', ') || '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!numeroAmbiente.trim() || !nombreAmbiente.trim()) {
      setErrorMsg('El número y nombre del ambiente son obligatorios.');
      return;
    }

    const equipArray = equipamientoStr
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (editingAmb) {
      const res = await db.updateAmbiente(editingAmb.id, {
        numero_ambiente: numeroAmbiente.trim(),
        nombre_ambiente: nombreAmbiente.trim(),
        sede: sede.trim(),
        tipo,
        capacidad: Number(capacidad),
        equipamiento: equipArray,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Error al actualizar ambiente.');
        return;
      }
    } else {
      const res = await db.createAmbiente({
        numero_ambiente: numeroAmbiente.trim(),
        nombre_ambiente: nombreAmbiente.trim(),
        sede: sede.trim(),
        tipo,
        capacidad: Number(capacidad),
        equipamiento: equipArray,
        activo: true,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Error al crear ambiente.');
        return;
      }
    }

    onRefresh();
    setShowModal(false);
  };

  const handleDelete = async (amb: Ambiente) => {
    if (confirm(`¿Eliminar el ambiente ${amb.numero_ambiente} (${amb.nombre_ambiente})?`)) {
      await db.deleteAmbiente(amb.id);
      onRefresh();
    }
  };

  const getTipoIcon = (tipoAmb: TipoAmbiente) => {
    switch (tipoAmb) {
      case 'Aula de Cómputo':
        return <Laptop className="w-4 h-4 text-[#0288D1]" />;
      case 'Taller':
        return <Wrench className="w-4 h-4 text-[#ED6C02]" />;
      case 'Laboratorio':
        return <Monitor className="w-4 h-4 text-[#39A900]" />;
      default:
        return <Building2 className="w-4 h-4 text-[#00324D]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-[#00324D] dark:text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-[#00324D] dark:text-white uppercase tracking-wider">
              Gestión de Ambientes y Espacios de Formación
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laboratorios, aulas de cómputo y talleres de las sedes SENA
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Ambiente</span>
        </button>
      </div>

      {/* Ambientes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ambientes.map(a => (
          <div
            key={a.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all relative border-l-4 border-l-[#39A900] dark:border-l-emerald-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-1.5">
                {getTipoIcon(a.tipo)}
                <span className="text-xs font-bold text-[#00324D] dark:text-slate-200">
                  {a.numero_ambiente}
                </span>
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => openEdit(a)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Editar Ambiente"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar Ambiente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
              {a.nombre_ambiente}
            </h3>

            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{a.sede}</span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="bg-[#e9f1df] dark:bg-emerald-950/60 text-[#226d00] dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                {a.tipo}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Capacidad: {a.capacidad} Aprendices
              </span>
            </div>

            {a.equipamiento && a.equipamiento.length > 0 && (
              <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Equipamiento:</span>
                <span className="line-clamp-2">{a.equipamiento.join(' • ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-[#00324D] dark:bg-slate-950 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingAmb ? 'Editar Ambiente' : 'Registrar Nuevo Ambiente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Número / Código *
                  </label>
                  <input
                    type="text"
                    value={numeroAmbiente}
                    onChange={e => setNumeroAmbiente(e.target.value)}
                    required
                    placeholder="Ej: Ambiente 301"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Capacidad (Personas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={capacidad}
                    onChange={e => setCapacidad(parseInt(e.target.value, 10) || 30)}
                    required
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Nombre Descriptivo *
                </label>
                <input
                  type="text"
                  value={nombreAmbiente}
                  onChange={e => setNombreAmbiente(e.target.value)}
                  required
                  placeholder="Ej: Laboratorio de Software y Redes"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Tipo de Espacio *
                  </label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as TipoAmbiente)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    <option value="Aula de Cómputo">Aula de Cómputo</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Taller">Taller</option>
                    <option value="Aula Convencional">Aula Convencional</option>
                    <option value="Auditorio">Auditorio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Sede / Bloque *
                  </label>
                  <input
                    type="text"
                    value={sede}
                    onChange={e => setSede(e.target.value)}
                    required
                    placeholder="Ej: Sede Central - Bloque A"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Equipamiento y Recursos (Separados por coma)
                </label>
                <textarea
                  value={equipamientoStr}
                  onChange={e => setEquipamientoStr(e.target.value)}
                  rows={2}
                  placeholder="30 PCs Core i7, Video Beam 4K, Red Gigabit"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded-xl shadow-xs cursor-pointer"
                >
                  {editingAmb ? 'Guardar Cambios' : 'Registrar Ambiente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
