import React, { useState } from 'react';
import { 
  Code2, 
  X, 
  Printer, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Server, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronRight,
  GitBranch,
  Terminal,
  FileCode2,
  Workflow
} from 'lucide-react';

interface TechnicalManualModalProps {
  onClose: () => void;
}

export const TechnicalManualModal: React.FC<TechnicalManualModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('arch');
  const [copiedSql, setCopiedSql] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'arch', label: '1. Arquitectura del Software' },
    { id: 'database', label: '2. Modelo Relacional y DDL SQL' },
    { id: 'overlap', label: '3. Motor Matemático de Colisiones' },
    { id: 'sync', label: '4. Resiliencia y Cache Híbrida' },
    { id: 'security', label: '5. Seguridad y Control de Acceso' },
    { id: 'excel-engine', label: '6. Procesamiento Masivo Excel' },
    { id: 'deployment', label: '7. Despliegue y Variables' },
  ];

  const sqlDDL = `-- =================================================================
-- SISTEMA GDHC SENA - ESQUEMA DE BASE DE DATOS POSTGRESQL / SUPABASE
-- =================================================================

-- 1. Perfiles de Usuario (Administradores, Instructores, Aprendices)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula VARCHAR(32) UNIQUE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rol VARCHAR(32) NOT NULL CHECK (rol IN ('admin', 'instructor', 'aprendiz')),
  especialidad VARCHAR(255),
  telefono VARCHAR(32),
  programa_id UUID,
  registrado BOOLEAN DEFAULT FALSE,
  password VARCHAR(255),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Programas y Fichas de Formación
CREATE TABLE IF NOT EXISTS public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_programa VARCHAR(255) NOT NULL,
  codigo_ficha VARCHAR(64) UNIQUE NOT NULL,
  jornada VARCHAR(32) NOT NULL CHECK (jornada IN ('Diurna', 'Nocturna', 'Mixta')),
  trimestre INT NOT NULL DEFAULT 1,
  total_aprendices INT DEFAULT 30,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ambientes de Aprendizaje (Aulas y Laboratorios)
CREATE TABLE IF NOT EXISTS public.ambientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_ambiente VARCHAR(255) NOT NULL,
  numero_ambiente VARCHAR(64) UNIQUE NOT NULL,
  capacidad INT NOT NULL DEFAULT 30,
  tipo VARCHAR(64) NOT NULL,
  sede VARCHAR(128) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Asignación de Horarios Semanales con Detección de Colisiones
CREATE TABLE IF NOT EXISTS public.horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ambiente_id UUID NOT NULL REFERENCES public.ambientes(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  materia_competencia VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_horas_logicas CHECK (hora_inicio < hora_fin)
);

-- 5. Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(32) NOT NULL DEFAULT 'info',
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices B-Tree para optimización de consultas de solapamiento
CREATE INDEX IF NOT EXISTS idx_horarios_dia_instructor ON public.horarios (dia_semana, instructor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_ambiente ON public.horarios (dia_semana, ambiente_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_programa ON public.horarios (dia_semana, programa_id);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlDDL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 transition-colors">
        
        {/* Encabezado del Manual */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-[#002236] to-[#001524] text-white no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-xs">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 font-mono">
                  Manual de Ingeniería & DDL
                </span>
                <span className="text-xs text-slate-400 font-mono">v2.0 Architecture</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5">
                Manual Técnico de Arquitectura — Sistema GDHC SENA
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Manual con Menú Lateral */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navegación Lateral */}
          <div className="w-64 bg-slate-50 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 overflow-y-auto hidden md:block no-print">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Secciones Técnicas
            </div>
            <nav className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeSection === s.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Stack: React + Supabase</span>
              </div>
              <p>TypeScript estricto, PostgREST y algoritmos de intervalo $O(N)$ en memoria.</p>
            </div>
          </div>

          {/* Área de Lectura */}
          <div className="flex-1 p-6 overflow-y-auto text-slate-700 dark:text-slate-300 space-y-8 print:p-0 print:overflow-visible">
            
            {/* Cabecera Técnica */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono">
                    ESPECIFICACIÓN TÉCNICA Y DE ARQUITECTURA
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Servicio Nacional de Aprendizaje (SENA) • Plataforma GDHC
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Stack v2.0 • Cloud Run & Supabase Ready
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: ARQUITECTURA */}
            {activeSection === 'arch' && (
              <section id="arch" className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">1</span>
                  <span>Arquitectura del Software y Componentes</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El sistema está estructurado bajo una arquitectura desacoplada basada en componentes React 18, servicios de dominio tipados y una capa de persistencia dual (Supabase PostgreSQL + Local Storage Repository Pattern):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>Capa de Presentación (UI / UX)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Construida con React 18 funcional, TypeScript con tipado estricto, Tailwind CSS con paleta institucional oficial del SENA (<code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">#39A900</code> y <code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">#00324D</code>) y Lucide Icons.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-600" />
                      <span>Motor de Lógica de Negocio</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Módulos independientes de validación en tiempo real (<code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">overlapEngine.ts</code>), parser y serializador Excel (<code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">excelService.ts</code>) con detección de colisiones antes del envío.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-amber-600" />
                      <span>Capa de Datos Híbrida (Repository)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Implementada en <code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">db.ts</code>. Administra operaciones CRUD contra Supabase PostgreSQL usando el SDK oficial de Supabase con fallback transparente a LocalStorage y auto-reintento con exclusión de columnas faltantes.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-purple-600" />
                      <span>Infraestructura & Contenedor</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Desarrollado sobre Vite y compatible con Cloud Run y contenedores Docker en el puerto estándar <code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">3000</code>.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN 2: DDL */}
            {activeSection === 'database' && (
              <section id="database" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">2</span>
                    <span>Modelo Relacional de Datos y Script DDL</span>
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar DDL SQL'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  A continuación se detalla el esquema relacional completo en PostgreSQL con todas las llaves foráneas, restricciones de chequeo (<code className="font-mono">CHECK</code>) e índices de aceleración:
                </p>

                <div className="relative">
                  <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
                    {sqlDDL}
                  </pre>
                </div>
              </section>
            )}

            {/* SECCIÓN 3: MOTOR DE INTERVALOS OVERLAPS */}
            {activeSection === 'overlap' && (
              <section id="overlap" className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">3</span>
                  <span>Motor Matemático de Prevención de Colisiones (OVERLAPS)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dos intervalos de tiempo semiabiertos en el mismo día lectivo, definidos como $I_A = [S_A, E_A)$ e $I_B = [S_B, E_B)$, presentan una colisión o solapamiento si y solo si su intersección es no vacía:
                </p>

                <div className="p-4 bg-slate-900 text-white font-mono text-center text-xs rounded-xl border border-slate-800 space-y-2">
                  <div className="text-emerald-400 font-bold text-sm">
                    Collision(A, B) &hArr; (S_A &lt; E_B) &and; (S_B &lt; E_A)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Donde S = Hora de Inicio en minutos desde las 00:00, E = Hora de Fin en minutos.
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-slate-900">Dimensiones de Conflicto Evaluadas Simultáneamente:</div>
                  <ul className="list-disc list-inside space-y-1 pl-2 font-mono text-[11px] text-slate-700">
                    <li><strong>Instructor:</strong> instructor_id(A) = instructor_id(B) AND dia(A) = dia(B) AND ColisionHoraria(A, B)</li>
                    <li><strong>Ambiente:</strong> ambiente_id(A) = ambiente_id(B) AND dia(A) = dia(B) AND ColisionHoraria(A, B)</li>
                    <li><strong>Ficha / Programa:</strong> programa_id(A) = programa_id(B) AND dia(A) = dia(B) AND ColisionHoraria(A, B)</li>
                  </ul>
                  <p className="pt-2">
                    Esta lógica se ejecuta tanto en el cliente durante el arrastre/selección de celdas como durante la carga masiva en memoria antes de persistir cualquier registro.
                  </p>
                </div>
              </section>
            )}

            {/* SECCIÓN 4: RESILIENCIA Y CACHE */}
            {activeSection === 'sync' && (
              <section id="sync" className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">4</span>
                  <span>Resiliencia de Esquema y Caché Híbrida</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para garantizar funcionamiento ininterrumpido en despliegues con diferentes versiones de bases de datos, <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">db.ts</code> implementa el siguiente mecanismo defensivo:
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-[#39A900]" />
                    <span>Algoritmo de Auto-Exclusión de Columnas Faltantes</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>La aplicación intenta sincronizar el payload completo contra Supabase.</li>
                    <li>Si PostgREST retorna un error de tipo <code className="font-mono text-[10px] bg-rose-50 text-rose-800 px-1 py-0.5 rounded border border-rose-200">Could not find the 'columna' in schema cache</code>, el regex extractor aísla el nombre del campo.</li>
                    <li>El servicio elimina dinámicamente dicha propiedad del payload y reintenta la mutación sin interrumpir al usuario.</li>
                    <li>Los datos se preservan en la caché local para garantizar la persistencia del estado en la sesión del cliente.</li>
                  </ol>
                </div>
              </section>
            )}

            {/* SECCIÓN 5: SEGURIDAD Y ACCESO */}
            {activeSection === 'security' && (
              <section id="security" className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">5</span>
                  <span>Seguridad, Autenticación y Control de Acceso (RBAC)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El sistema define 3 roles institucionales inmutables:
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Rol</th>
                        <th className="p-3">Permisos de Lectura</th>
                        <th className="p-3">Permisos de Escritura</th>
                        <th className="p-3">Estado de Activación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600">
                      <tr>
                        <td className="p-3 font-bold text-slate-900">admin</td>
                        <td className="p-3">Total (Horarios, Usuarios, Fichas, Ambientes)</td>
                        <td className="p-3">Total (CRUD completo, Carga masiva)</td>
                        <td className="p-3"><span className="text-emerald-700 font-bold">Siempre Activo</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">instructor</td>
                        <td className="p-3">Horarios propios y catálogo de fichas/ambientes</td>
                        <td className="p-3">Actualización de contraseña propia</td>
                        <td className="p-3">Activación por cédula</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">aprendiz</td>
                        <td className="p-3">Horarios de su ficha asignada</td>
                        <td className="p-3">Actualización de contraseña propia</td>
                        <td className="p-3">Activación por cédula</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* SECCIÓN 6: EXCEL ENGINE */}
            {activeSection === 'excel-engine' && (
              <section id="excel-engine" className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">6</span>
                  <span>Procesamiento Masivo y Dry-Run con SheetJS</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  La carga masiva lee archivos <code className="font-mono">.xlsx</code> directamente en el navegador del cliente mediante la biblioteca SheetJS (<code className="font-mono">xlsx</code>):
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800">1. Normalización de Celdas:</div>
                    <p className="text-[11px] text-slate-600">
                      Transformación de horas en números fraccionarios de Excel o cadenas como <code className="font-mono">"07:00"</code> a enteros canónicos en minutos [0..1439].
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800">2. Resolución de Llaves Foráneas en Memoria:</div>
                    <p className="text-[11px] text-slate-600">
                      Búsqueda de <code className="font-mono">cedula_instructor &rarr; profile.id</code>, <code className="font-mono">codigo_ficha &rarr; programa.id</code> y <code className="font-mono">numero_ambiente &rarr; ambiente.id</code>.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800">3. Análisis Acumulativo de Solapamientos:</div>
                    <p className="text-[11px] text-slate-600">
                      Cada fila válida aprobada se añade al conjunto temporal de evaluación para detectar solapamientos entre las mismas filas del Excel antes de escribir en la base de datos.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN 7: DESPLIEGUE */}
            {activeSection === 'deployment' && (
              <section id="deployment" className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-mono font-bold">7</span>
                  <span>Despliegue y Variables de Entorno</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para el correcto aprovisionamiento en entornos de producción, declare las siguientes variables de entorno:
                </p>
                <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-4 rounded-xl border border-slate-800 space-y-1">
                  <div><span className="text-sky-400">VITE_SUPABASE_URL</span>=https://tu-proyecto.supabase.co</div>
                  <div><span className="text-sky-400">VITE_SUPABASE_ANON_KEY</span>=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
                  <div><span className="text-emerald-400">PORT</span>=3000</div>
                  <div><span className="text-emerald-400">HOST</span>=0.0.0.0</div>
                </div>
              </section>
            )}

          </div>

        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>Sistema GDHC SENA • TRD v2.0 Production Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Manual Técnico
          </button>
        </div>

      </div>
    </div>
  );
};
