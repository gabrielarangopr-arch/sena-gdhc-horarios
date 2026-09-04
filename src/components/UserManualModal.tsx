import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Printer, 
  Download, 
  Search, 
  Shield, 
  Briefcase, 
  GraduationCap, 
  Key, 
  Calendar, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Layers,
  MapPin,
  ChevronRight,
  Users
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';

interface UserManualModalProps {
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'intro', label: '1. Introducción y Objetivos' },
    { id: 'roles', label: '2. Roles y Permisos' },
    { id: 'auth', label: '3. Acceso, Activación y Recuperación' },
    { id: 'admin', label: '4. Módulo del Administrador' },
    { id: 'matrix', label: '5. Matriz y Prevención OVERLAPS' },
    { id: 'excel', label: '6. Carga Masiva desde Excel' },
    { id: 'instructor', label: '7. Módulo del Instructor' },
    { id: 'aprendiz', label: '8. Módulo del Aprendiz' },
    { id: 'faq', label: '9. Preguntas Frecuentes' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Encabezado del Manual */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#00324D] to-[#002236] text-white no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#39A900]/20 border border-[#39A900]/40 flex items-center justify-center text-[#39A900] shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#39A900] text-white">
                  Documentación Oficial
                </span>
                <span className="text-xs text-slate-300 font-mono">v2.0</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5">
                Manual de Usuario — Sistema GDHC SENA
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
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-3 overflow-y-auto hidden md:block no-print">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Índice de Contenido
            </div>
            <nav className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeSection === s.id
                      ? 'bg-[#39A900] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-200">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#39A900]" />
                  <span>SENA Colombia</span>
                </div>
                <p>Gestión de Horarios y Disponibilidad de Centros GDHC.</p>
              </div>
            </div>
          </div>

          {/* Área de Lectura */}
          <div className="flex-1 p-6 overflow-y-auto text-slate-700 space-y-8 print:p-0 print:overflow-visible">
            
            {/* Cabecera institucional imprimible */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    MANUAL DE USUARIO OPERATIVO
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Servicio Nacional de Aprendizaje (SENA) • Plataforma de Horarios GDHC
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Edición 2026 • Versión 2.0
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: INTRODUCCIÓN */}
            {(activeSection === 'intro' || searchTerm) && (
              <section id="intro" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">1</span>
                  <span>Introducción y Propósito del Sistema</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El <strong>Sistema GDHC</strong> (Gestión de Horarios y Disponibilidad de Centros) es una solución institucional integral desarrollada para optimizar, coordinar y transparentar la asignación de horarios académicos, instructores y ambientes de aprendizaje en el Servicio Nacional de Aprendizaje (SENA).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs mb-1">Cero Solapamientos</div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Validación matemática en tiempo real para evitar que un aula o instructor tenga dos clases en el mismo horario.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs mb-1">Carga Masiva Ágil</div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Importación y exportación masiva desde hojas de cálculo Excel (.xlsx) con análisis preventivo (Dry-Run).
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs mb-1">Acceso Multi-Rol</div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Vistas y herramientas personalizadas para Coordinadores Académicos, Instructores y Aprendices.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN 2: ROLES */}
            {(activeSection === 'roles' || searchTerm) && (
              <section id="roles" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">2</span>
                  <span>Roles y Niveles de Acceso</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El sistema cuenta con tres perfiles institucionales diferenciados:
                </p>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">1. Administrador (Coordinación Académica)</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Control total sobre la plataforma. Puede crear, modificar y eliminar horarios; gestionar fichas de formación y programas; configurar ambientes y sedes; gestionar usuarios y realizar cargas masivas. Su cuenta está activa de manera permanente.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-[#39A900] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-950">2. Instructor de Formación</div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Acceso exclusivo a su itinerario semanal de clases (Lunes a Sábado), balance de horas impartidas, fichas a su cargo, ambientes asignados y herramientas de exportación e impresión.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-sky-950">3. Aprendiz</div>
                      <p className="text-[11px] text-sky-800 leading-relaxed">
                        Consulta en tiempo real del horario semanal de su ficha de formación, instructores encargados, asignaturas y ambientes físicos de formación.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN 3: AUTENTICACIÓN, ACTIVACIÓN Y RECUPERACIÓN */}
            {(activeSection === 'auth' || searchTerm) && (
              <section id="auth" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">3</span>
                  <span>Acceso, Activación de Cuentas y Recuperación de Contraseña</span>
                </h3>
                
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#39A900]" />
                      <span>A. Inicio de Sesión Ordinario</span>
                    </h4>
                    <p>
                      Ingresa tu número de documento de identidad (Cédula) o correo electrónico registrado, seguido de tu contraseña personal.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>B. Activación de Cuentas Pre-registradas</span>
                    </h4>
                    <p>
                      Cuando la Coordinación carga un listado de aprendices o instructores desde Excel, estos quedan en estado <em>pre-registrado</em>. Para ingresar por primera vez:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-600">
                      <li>Haz clic en la pestaña <strong>"Activar Cuenta"</strong> en la pantalla de bienvenida.</li>
                      <li>Ingresa tu número de cédula y presiona <em>"Verificar Cédula"</em>.</li>
                      <li>El sistema validará tu nombre y correo pre-cargado.</li>
                      <li>Crea una contraseña segura (mínimo 6 caracteres) y confírmala.</li>
                      <li>¡Listo! Tu cuenta quedará activada y podrás ingresar inmediatamente.</li>
                    </ol>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>C. Recuperación de Contraseña Olvidada</span>
                    </h4>
                    <p>
                      Si olvidaste tu contraseña, haz clic en el enlace <strong>"¿Olvidaste tu contraseña?"</strong> en la pantalla de inicio de sesión:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-600">
                      <li>Ingresa tu Cédula y tu Correo institucional o personal registrado.</li>
                      <li>El sistema verificará la coincidencia de identidad.</li>
                      <li>Ingresa tu nueva contraseña y confírmala.</li>
                      <li>El acceso será actualizado de forma segura tanto en la base de datos como localmente.</li>
                    </ol>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN 4: ADMINISTRADOR */}
            {(activeSection === 'admin' || searchTerm) && (
              <section id="admin" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">4</span>
                  <span>Módulo del Administrador y Coordinación Académica</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El panel de administración centraliza la gestión académica en 4 módulos principales:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70">
                    <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#39A900]" />
                      <span>Matriz de Horarios</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Visualización gráfica semanal por Ambientes, Instructores y Fichas con filtros interactivos y botón para programar nuevas clases.
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70">
                    <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>Programas y Fichas</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Registro de programas técnicos y tecnólogos, códigos de ficha, jornadas (Diurna, Mixta, Nocturna) y fechas de inicio/fin.
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70">
                    <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>Ambientes de Aprendizaje</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Administración de aulas, talleres, capacidad máxima de aprendices, tipos de ambiente y sedes del centro de formación.
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70">
                    <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Gestión de Usuarios</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Listado general de usuarios, filtrado por estado (Registrado vs Pendiente), creación manual y carga masiva desde Excel.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN 5: MATRIZ Y OVERLAPS */}
            {(activeSection === 'matrix' || searchTerm) && (
              <section id="matrix" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">5</span>
                  <span>Programación de Horarios y Prevención OVERLAPS</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Al programar una sesión formativa, el motor de colisiones analiza automáticamente los intervalos de tiempo en minutos:
                </p>
                <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-3 rounded-xl border border-slate-800">
                  ¿Hay colisión? = (Nueva_Inicio &lt; Existente_Fin) AND (Nueva_Fin &gt; Existente_Inicio)
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>Si se detecta que:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>El <strong>Instructor</strong> ya tiene clase asignada en ese bloque.</li>
                    <li>El <strong>Ambiente</strong> ya se encuentra ocupado por otra ficha.</li>
                    <li>La <strong>Ficha</strong> ya tiene otra asignatura a la misma hora.</li>
                  </ul>
                  <p className="pt-1">
                    El sistema bloqueará la inserción y mostrará una alerta detallada indicando qué entidad colisiona, la materia en conflicto y el rango horario exacto.
                  </p>
                </div>
              </section>
            )}

            {/* SECCIÓN 6: CARGA MASIVA */}
            {(activeSection === 'excel' || searchTerm) && (
              <section id="excel" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">6</span>
                  <span>Carga Masiva desde Archivos Excel</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para programaciones de inicio de trimestre o creación de cohortes, utiliza la carga masiva:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 pl-2">
                  <li>
                    Descarga la <strong>Plantilla Oficial</strong> desde el botón correspondiente en la herramienta o en la <em>Guía Excel</em>.
                  </li>
                  <li>
                    Diligencia las filas respetando los nombres de encabezado, los números de cédula, códigos de ficha y formato de hora <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">07:00</code> a <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">13:00</code>.
                  </li>
                  <li>
                    Arrastra o selecciona el archivo en la ventana de carga.
                  </li>
                  <li>
                    El sistema ejecutará un <strong>Dry-Run de validación en memoria</strong>: te mostrará en verde las filas aprobadas y en rojo aquellas que tengan inconsistencias o colisiones de horario.
                  </li>
                  <li>
                    Podrás confirmar la importación de las filas aprobadas o cancelar para corregir el archivo.
                  </li>
                </ol>
              </section>
            )}

            {/* SECCIÓN 7: INSTRUCTOR */}
            {(activeSection === 'instructor' || searchTerm) && (
              <section id="instructor" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">7</span>
                  <span>Módulo del Instructor</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Los instructores disponen de una interfaz limpia y centrada en sus actividades formativas:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Contador de Horas Semanales:</strong> Muestra la suma total de horas programadas durante la semana lectiva.</li>
                  <li><strong>Resumen de Fichas:</strong> Detalle de cada programa y ficha que tiene a su cargo.</li>
                  <li><strong>Itinerario Semanal:</strong> Grilla día a día (Lunes a Sábado) con las horas, competencias y ambiente físico donde debe impartir su sesión.</li>
                  <li><strong>Exportación a Excel e Impresión:</strong> Botones dedicados para descargar su horario en formato .xlsx o imprimir una copia en formato legible.</li>
                </ul>
              </section>
            )}

            {/* SECCIÓN 8: APRENDIZ */}
            {(activeSection === 'aprendiz' || searchTerm) && (
              <section id="aprendiz" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">8</span>
                  <span>Módulo del Aprendiz</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Los aprendices pueden consultar el itinerario académico de su ficha en cualquier momento desde computadores o dispositivos móviles:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Visualización de Ficha:</strong> Al ingresar, la plataforma muestra automáticamente el horario de su ficha asignada. También pueden alternar entre fichas si cursan formación complementaria.</li>
                  <li><strong>Detalle de Materias y Aulas:</strong> Cada bloque indica con claridad el nombre de la competencia, el nombre del instructor responsable y la ubicación física del aula o laboratorio.</li>
                  <li><strong>Descarga de Itinerario:</strong> Posibilidad de descargar el horario de su grupo a Excel o imprimirlo para su consulta física.</li>
                </ul>
              </section>
            )}

            {/* SECCIÓN 9: FAQ */}
            {(activeSection === 'faq' || searchTerm) && (
              <section id="faq" className="space-y-3 scroll-mt-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#39A900] flex items-center justify-center text-xs font-extrabold">9</span>
                  <span>Preguntas Frecuentes (FAQ)</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
                    <h5 className="font-bold text-slate-900 mb-1">¿Qué hago si me aparece "Documento no registrado"?</h5>
                    <p className="text-slate-600 text-[11px]">
                      Comunícate con la Coordinación Académica de tu centro para confirmar que hayan cargado tu cédula y correo en el sistema.
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
                    <h5 className="font-bold text-slate-900 mb-1">¿Puedo usar el sistema sin conexión a internet?</h5>
                    <p className="text-slate-600 text-[11px]">
                      Sí. El sistema cuenta con caché local inteligente. Puedes consultar tus horarios previamente cargados incluso si la red presenta intermitencias.
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
                    <h5 className="font-bold text-slate-900 mb-1">¿Cómo evito que dos instructores reserven el mismo laboratorio?</h5>
                    <p className="text-slate-600 text-[11px]">
                      El sistema lo impide de forma automática. Si intentas asignar un ambiente que ya tiene una sesión registrada a esa misma hora, la plataforma rechazará el guardado y te indicará el conflicto.
                    </p>
                  </div>
                </div>
              </section>
            )}

          </div>

        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#39A900]" />
            <span>Documento emitido para Centros de Formación Profesional Integral — SENA</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Manual
          </button>
        </div>

      </div>
    </div>
  );
};
