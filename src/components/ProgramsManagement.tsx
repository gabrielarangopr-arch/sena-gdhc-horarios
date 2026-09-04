import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit3, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Programa, JornadaType } from '../types';
import { db } from '../services/db';

interface ProgramsManagementProps {
  programas: Programa[];
  onRefresh: () => void;
}

export const ProgramsManagement: React.FC<ProgramsManagementProps> = ({
  programas,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProg, setEditingProg] = useState<Programa | null>(null);
  const [codigoFicha, setCodigoFicha] = useState('');
  const [nombrePrograma, setNombrePrograma] = useState('');
  const [jornada, setJornada] = useState<JornadaType>('Mañana');
  const [nivelFormacion, setNivelFormacion] = useState<'Técnico' | 'Tecnólogo' | 'Especialización Tecnológica' | 'Complementario'>('Tecnólogo');
  const [centroFormacion, setCentroFormacion] = useState('Centro de Tecnologías de la Información y las Comunicaciones');
  const [cupos, setCupos] = useState<number>(30);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreate = () => {
    setEditingProg(null);
    setCodigoFicha('');
    setNombrePrograma('');
    setJornada('Mañana');
    setNivelFormacion('Tecnólogo');
    setCentroFormacion('Centro de Tecnologías de la Información y las Comunicaciones');
    setCupos(30);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (prog: Programa) => {
    setEditingProg(prog);
    setCodigoFicha(prog.codigo_ficha);
    setNombrePrograma(prog.nombre_programa);
    setJornada(prog.jornada);
    setNivelFormacion(prog.nivel_formacion || 'Tecnólogo');
    setCentroFormacion(prog.centro_formacion || 'Centro de Tecnologías');
    setCupos(prog.cupos || 30);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!codigoFicha.trim() || !nombrePrograma.trim()) {
      setErrorMsg('El código de ficha y el nombre del programa son obligatorios.');
      return;
    }

    if (editingProg) {
      const res = await db.updatePrograma(editingProg.id, {
        codigo_ficha: codigoFicha.trim(),
        nombre_programa: nombrePrograma.trim(),
        jornada,
        nivel_formacion: nivelFormacion,
        centro_formacion: centroFormacion.trim(),
        cupos: Number(cupos),
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Error al actualizar ficha.');
        return;
      }
    } else {
      const res = await db.createPrograma({
        codigo_ficha: codigoFicha.trim(),
        nombre_programa: nombrePrograma.trim(),
        jornada,
        nivel_formacion: nivelFormacion,
        centro_formacion: centroFormacion.trim(),
        cupos: Number(cupos),
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Error al crear ficha.');
        return;
      }
    }

    onRefresh();
    setShowModal(false);
  };

  const handleDelete = async (prog: Programa) => {
    if (confirm(`¿Eliminar la ficha ${prog.codigo_ficha} (${prog.nombre_programa})?`)) {
      await db.deletePrograma(prog.id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#00324D] dark:text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-[#00324D] dark:text-white uppercase tracking-wider">
              Programas de Formación y Fichas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grupos curriculares matriculados y sus jornadas de formación
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nueva Ficha</span>
        </button>
      </div>

      {/* Programas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {programas.map(p => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all relative border-l-4 border-l-[#00324D] dark:border-l-emerald-500"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold bg-[#e1f5fe] dark:bg-sky-950/70 text-[#0288D1] dark:text-sky-300 px-2 py-0.5 rounded-md uppercase">
                  {p.nivel_formacion || 'Tecnólogo'}
                </span>
                <span className="ml-2 text-xs font-mono font-bold text-[#00324D] dark:text-slate-200">
                  Ficha #{p.codigo_ficha}
                </span>
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Editar Ficha"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar Ficha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
              {p.nombre_programa}
            </h3>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-medium">Jornada:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{p.jornada}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-medium">Cupos Asignados:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{p.cupos || 30} Aprendices</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-medium">Centro de Formación:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate block">{p.centro_formacion || 'Centro TIC'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Ficha */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-[#00324D] dark:bg-slate-950 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingProg ? 'Editar Ficha de Formación' : 'Crear Nueva Ficha / Programa'}
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

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Código de Ficha (Único) *
                </label>
                <input
                  type="text"
                  value={codigoFicha}
                  onChange={e => setCodigoFicha(e.target.value)}
                  required
                  placeholder="Ej: 2824356"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                  Nombre del Programa de Formación *
                </label>
                <input
                  type="text"
                  value={nombrePrograma}
                  onChange={e => setNombrePrograma(e.target.value)}
                  required
                  placeholder="Ej: Análisis y Desarrollo de Software"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Jornada *
                  </label>
                  <select
                    value={jornada}
                    onChange={e => setJornada(e.target.value as JornadaType)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    <option value="Mañana">Mañana (06:00 - 12:00)</option>
                    <option value="Tarde">Tarde (12:00 - 18:00)</option>
                    <option value="Noche">Noche (18:00 - 22:00)</option>
                    <option value="Mixta">Mixta</option>
                    <option value="Fines de Semana">Fines de Semana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Nivel *
                  </label>
                  <select
                    value={nivelFormacion}
                    onChange={e => setNivelFormacion(e.target.value as any)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    <option value="Tecnólogo">Tecnólogo</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Especialización Tecnológica">Especialización</option>
                    <option value="Complementario">Complementario</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Cupos Estimados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cupos}
                    onChange={e => setCupos(parseInt(e.target.value, 10) || 30)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                    Centro de Formación
                  </label>
                  <input
                    type="text"
                    value={centroFormacion}
                    onChange={e => setCentroFormacion(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
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
                  {editingProg ? 'Guardar Cambios' : 'Crear Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
