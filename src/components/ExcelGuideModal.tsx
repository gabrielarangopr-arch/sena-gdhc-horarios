import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  BookOpen,
  Info
} from 'lucide-react';
import { excelService } from '../services/excelService';

interface ExcelGuideModalProps {
  initialTab?: 'horarios' | 'usuarios';
  onClose: () => void;
}

export const ExcelGuideModal: React.FC<ExcelGuideModalProps> = ({
  initialTab = 'horarios',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'horarios' | 'usuarios'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 transition-colors">
        
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#00324D] to-[#002236] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39A900]/20 border border-[#39A900]/40 flex items-center justify-center text-[#39A900]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Guía de Estructura y Formato para Archivos Excel
              </h2>
              <p className="text-xs text-slate-300">
                Organización de columnas y validaciones para carga masiva al Sistema GDHC SENA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('horarios')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'horarios'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#39A900]" />
              <span>1. Tabla de Horarios Semanales</span>
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'usuarios'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>2. Tabla de Usuarios (Instructores y Aprendices)</span>
            </button>
          </div>

          <div>
            {activeTab === 'horarios' ? (
              <button
                onClick={() => excelService.downloadHorariosTemplate()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Plantilla Horarios (.xlsx)</span>
              </button>
            ) : (
              <button
                onClick={() => excelService.downloadUsuariosTemplate()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Plantilla Usuarios (.xlsx)</span>
              </button>
            )}
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          
          {/* TAB 1: HORARIOS */}
          {activeTab === 'horarios' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#39A900] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm mb-1">
                    Estructura requerida para Horarios de Formación
                  </h4>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    La primera fila de tu archivo Excel (<code className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">Fila 1</code>) debe contener los encabezados exactos de columna indicados a continuación. El orden de las columnas no afecta el procesamiento siempre y cuando los nombres coincidan.
                  </p>
                </div>
              </div>

              {/* Tabla de Columnas */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Nombre Columna (Encabezado)</th>
                      <th className="p-3">Tipo / Formato</th>
                      <th className="p-3">Requerido</th>
                      <th className="p-3">Ejemplo</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">cedula_instructor</td>
                      <td className="p-3">Texto / Número</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">71987654</td>
                      <td className="p-3">Cédula del instructor. Debe coincidir con un instructor previamente registrado en la plataforma.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">codigo_ficha</td>
                      <td className="p-3">Texto / Número</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">2824356</td>
                      <td className="p-3">Número de ficha del programa. Debe existir en el listado de Programas / Fichas.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">numero_ambiente</td>
                      <td className="p-3">Texto</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">Ambiente 301</td>
                      <td className="p-3">Número o identificador del aula/laboratorio. Debe existir en Ambientes de Aprendizaje.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">dia_semana</td>
                      <td className="p-3">Número (1-6) o Texto</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">1 ó "Lunes"</td>
                      <td className="p-3">Día de la semana: 1 (Lunes), 2 (Martes), 3 (Miércoles), 4 (Jueves), 5 (Viernes), 6 (Sábado).</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">hora_inicio</td>
                      <td className="p-3 font-mono">HH:MM (24h)</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">07:00</td>
                      <td className="p-3">Hora de inicio de la sesión en formato 24 horas (ej. 07:00, 14:00).</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">hora_fin</td>
                      <td className="p-3 font-mono">HH:MM (24h)</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">13:00</td>
                      <td className="p-3">Hora de finalización. Debe ser posterior a la hora de inicio (ej. 13:00, 18:00).</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">competencia</td>
                      <td className="p-3">Texto</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">Bases de Datos</td>
                      <td className="p-3">Nombre de la competencia, materia o resultado de aprendizaje a impartir.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Vista Previa Ejemplo Visual */}
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#39A900]" />
                  <span>Ejemplo de filas válidas en el archivo Excel:</span>
                </h5>
                <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                  <div className="text-emerald-400 font-bold">cedula_instructor | codigo_ficha | numero_ambiente | dia_semana | hora_inicio | hora_fin | competencia</div>
                  <div className="text-slate-300">71987654          | 2824356      | Ambiente 301    | 1          | 07:00       | 12:00    | Desarrollo Web Full-Stack</div>
                  <div className="text-slate-300">43876543          | 2712940      | Ambiente 204    | 3          | 13:00       | 18:00    | Redes y Seguridad Informática</div>
                  <div className="text-slate-300">1017554433        | 2824356      | Ambiente 405    | 4          | 08:00       | 12:00    | Algoritmia y Pruebas Unitarias</div>
                </div>
              </div>

              {/* Reglas y Validaciones de Solapamiento */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Validaciones de Integridad y Detección de Conflictos (OVERLAPS):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                  <li><strong>Instructor Ocupado:</strong> Un instructor no puede tener asignadas dos clases al mismo tiempo en el mismo día.</li>
                  <li><strong>Ambiente Ocupado:</strong> Un aula o laboratorio no puede albergar dos fichas simultáneas en el mismo horario.</li>
                  <li><strong>Ficha Ocupada:</strong> Una ficha de aprendices no puede recibir dos materias a la misma hora.</li>
                  <li><strong>Modo Dry-Run de Importación:</strong> Si un horario presenta conflicto, la plataforma te lo señalará en rojo y te permitirá decidir si importar únicamente las filas válidas o descartar la operación.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: USUARIOS */}
          {activeTab === 'usuarios' && (
            <div className="space-y-5">
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sky-950 dark:text-sky-200 text-sm mb-1">
                    Estructura requerida para Carga Masiva de Usuarios
                  </h4>
                  <p className="text-sky-800 dark:text-sky-300 leading-relaxed">
                    Permite pre-registrar instructores y aprendices en lote. Una vez cargados, cada usuario podrá ingresar a la pestaña <strong>"Activar Cuenta"</strong> para registrar su contraseña personal usando su documento de identidad.
                  </p>
                </div>
              </div>

              {/* Tabla de Columnas Usuarios */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Nombre Columna</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Requerido</th>
                      <th className="p-3">Valores Permitidos</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">cedula</td>
                      <td className="p-3">Texto / Número</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">1098765432</td>
                      <td className="p-3">Cédula o número de documento único. Clave principal de activación.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">nombre_completo</td>
                      <td className="p-3">Texto</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3">Nombres y Apellidos</td>
                      <td className="p-3">Nombre completo del instructor o aprendiz tal como aparecerá en los reportes.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">email</td>
                      <td className="p-3">Correo válido</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">usuario@sena.edu.co</td>
                      <td className="p-3">Correo institucional o personal para recuperación de contraseña y avisos.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">rol</td>
                      <td className="p-3">Texto</td>
                      <td className="p-3"><span className="text-emerald-700 dark:text-emerald-400 font-bold">Sí</span></td>
                      <td className="p-3 font-mono">"instructor" | "aprendiz"</td>
                      <td className="p-3">Rol institucional dentro de la plataforma (debe ser en minúsculas).</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">especialidad</td>
                      <td className="p-3">Texto</td>
                      <td className="p-3"><span className="text-slate-500 dark:text-slate-400">Opcional</span></td>
                      <td className="p-3">Área de formación</td>
                      <td className="p-3">Especialidad del instructor (ej. Inteligencia Artificial, Telemática, Contabilidad).</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">telefono</td>
                      <td className="p-3">Texto / Número</td>
                      <td className="p-3"><span className="text-slate-500 dark:text-slate-400">Opcional</span></td>
                      <td className="p-3 font-mono">3101234567</td>
                      <td className="p-3">Número de contacto telefónico o celular.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">codigo_ficha</td>
                      <td className="p-3">Texto / Número</td>
                      <td className="p-3"><span className="text-amber-700 dark:text-amber-400 font-bold">Requerido para Aprendices</span></td>
                      <td className="p-3 font-mono">2824356</td>
                      <td className="p-3">Código de la ficha de formación a la que pertenece el aprendiz. Los instructores pueden dejarlo en blanco.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ejemplo Visual Usuarios */}
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Ejemplo de filas válidas en el Excel de Usuarios:</span>
                </h5>
                <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                  <div className="text-sky-400 font-bold">cedula     | nombre_completo               | email                    | rol        | especialidad          | telefono   | codigo_ficha</div>
                  <div className="text-slate-300">1098765432 | Andrés Felipe Morales Toro    | afmorales@sena.edu.co    | instructor | Inteligencia Artificial| 3109876543 | </div>
                  <div className="text-slate-300">1045678901 | Laura Juliana Mejía Vélez     | lmejia@soy.sena.edu.co   | aprendiz   |                      | 3201234567 | 2824356</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <HelpCircle className="w-4 h-4 text-[#39A900]" />
            <span>Formatos admitidos: <strong>.xlsx</strong> y <strong>.xls</strong> (Microsoft Excel)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Entendido, cerrar guía
          </button>
        </div>

      </div>
    </div>
  );
};
