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
      <div className="bg-white p-4 rounded-md border border-[#E0E0E0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#00324D]" />
          <div>
            <h2 className="text-sm font-bold text-[#00324D] uppercase tracking-wider">
              Programas de Formación y Fichas
            </h2>
            <p className="text-xs text-gray-500">
              Grupos curriculares matriculados y sus jornadas de formación
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
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
            className="bg-white p-4 rounded-md border border-[#E0E0E0] shadow-2xs hover:shadow-xs transition-shadow relative border-l-4 border-l-[#00324D]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold bg-[#e1f5fe] text-[#0288D1] px-2 py-0.5 rounded uppercase">
                  {p.nivel_formacion || 'Tecnólogo'}
                </span>
                <span className="ml-2 text-xs font-mono font-bold text-[#00324D]">
                  Ficha #{p.codigo_ficha}
                </span>
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => openEdit(p)}
                  className="p-1 text-gray-500 hover:text-[#00324D] hover:bg-gray-100 rounded"
                  title="Editar Ficha"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-1 text-gray-500 hover:text-[#D32F2F] hover:bg-red-50 rounded"
                  title="Eliminar Ficha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mt-2 leading-snug">
              {p.nombre_programa}
            </h3>

            <div className="mt-3 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Jornada:</span>
                <span className="font-semibold text-gray-800">{p.jornada}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Cupos Asignados:</span>
                <span className="font-semibold text-gray-800">{p.cupos || 30} Aprendices</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block text-[10px] uppercase">Centro de Formación:</span>
                <span className="text-gray-700 truncate block">{p.centro_formacion || 'Centro TIC'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Ficha */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-md shadow-xl max-w-md w-full border border-[#E0E0E0] overflow-hidden">
            <div className="bg-[#00324D] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingProg ? 'Editar Ficha de Formación' : 'Crear Nueva Ficha / Programa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Código de Ficha (Único) *
                </label>
                <input
                  type="text"
                  value={codigoFicha}
                  onChange={e => setCodigoFicha(e.target.value)}
                  required
                  placeholder="Ej: 2824356"
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nombre del Programa de Formación *
                </label>
                <input
                  type="text"
                  value={nombrePrograma}
                  onChange={e => setNombrePrograma(e.target.value)}
                  required
                  placeholder="Ej: Análisis y Desarrollo de Software"
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Jornada *
                  </label>
                  <select
                    value={jornada}
                    onChange={e => setJornada(e.target.value as JornadaType)}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  >
                    <option value="Mañana">Mañana (06:00 - 12:00)</option>
                    <option value="Tarde">Tarde (12:00 - 18:00)</option>
                    <option value="Noche">Noche (18:00 - 22:00)</option>
                    <option value="Mixta">Mixta</option>
                    <option value="Fines de Semana">Fines de Semana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nivel *
                  </label>
                  <select
                    value={nivelFormacion}
                    onChange={e => setNivelFormacion(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
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
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Cupos Estimados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cupos}
                    onChange={e => setCupos(parseInt(e.target.value, 10) || 30)}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Centro de Formación
                  </label>
                  <input
                    type="text"
                    value={centroFormacion}
                    onChange={e => setCentroFormacion(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded shadow-xs"
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
