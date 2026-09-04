import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  Users,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Search,
  FileSpreadsheet,
  BookMarked,
  Code2,
  Layers,
  MapPin,
  Flame,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import { ThemeToggle } from './ThemeToggle';
import { Profile, Horario, Programa, Ambiente } from '../types';

interface LandingPageProps {
  profiles: Profile[];
  programas: Programa[];
  ambientes: Ambiente[];
  horarios: Horario[];
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onOpenExcelGuide: () => void;
  onOpenUserManual: () => void;
  onOpenTechnicalManual: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  profiles,
  programas,
  ambientes,
  horarios,
  onGoToLogin,
  onGoToRegister,
  onOpenExcelGuide,
  onOpenUserManual,
  onOpenTechnicalManual,
}) => {
  // Estado para la búsqueda rápida de horarios públicos
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Lunes por defecto en la demo

  const diasSemana = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
  ];

  // Filtrar horarios para el buscador público
  const filteredHorarios = searchQuery.trim() === ''
    ? []
    : horarios.filter(h => {
        const prog = programas.find(p => p.id === h.programa_id);
        const amb = ambientes.find(a => a.id === h.ambiente_id);
        const inst = profiles.find(p => p.id === h.instructor_id);
        const q = searchQuery.toLowerCase();

        return (
          prog?.codigo_ficha.toLowerCase().includes(q) ||
          prog?.nombre_programa.toLowerCase().includes(q) ||
          amb?.numero_ambiente.toLowerCase().includes(q) ||
          amb?.nombre_ambiente.toLowerCase().includes(q) ||
          inst?.nombre_completo.toLowerCase().includes(q) ||
          h.materia_competencia.toLowerCase().includes(q)
        );
      }).slice(0, 8);

  // Muestra de horarios para el día seleccionado en la matriz interactiva del Hero
  const demoDayHorarios = horarios.filter(h => h.dia_semana === selectedDay).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE NAVEGACIÓN Y BOTONES DE ACCESO (ESQUINA SUPERIOR) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            
            {/* Logotipo SENA Oficial + Identificador GDHC */}
            <div className="flex items-center gap-3">
              <SenaLogo size="md" subtext="Gestión de Horarios y Centros" />
            </div>

            {/* Enlaces de Navegación de Sección (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
              <a href="#ventajas" className="hover:text-[#39A900] dark:hover:text-[#39A900] transition-colors">
                Ventajas
              </a>
              <a href="#modulos" className="hover:text-[#39A900] dark:hover:text-[#39A900] transition-colors">
                Módulos
              </a>
              <a href="#buscador-publico" className="hover:text-[#39A900] dark:hover:text-[#39A900] transition-colors">
                Consultar Horario
              </a>
              <a href="#documentacion" className="hover:text-[#39A900] dark:hover:text-[#39A900] transition-colors">
                Manuales
              </a>
            </nav>

            {/* Esquina Superior: Modo Oscuro/Claro + Botones de Inicio de Sesión y Registro */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Selector de Modo Oscuro / Claro / Sistema */}
              <ThemeToggle variant="dropdown" />

              {/* Botón de Activar Cuenta / Registro */}
              <button
                onClick={onGoToRegister}
                id="btn-landing-register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#39A900]" />
                <span>Activar Cuenta</span>
              </button>

              {/* Botón Principal de Iniciar Sesión */}
              <button
                onClick={onGoToLogin}
                id="btn-landing-login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#39A900] hover:bg-[#2d8500] active:bg-[#226d00] rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION CON TYPOGRAFÍA Y PROPUESTA DE VALOR INSTITUCIONAL */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/60 dark:border-slate-800/60">
        {/* Luces de fondo sutiles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Pill Badge Oficial */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#39A900] animate-pulse"></span>
              <span>Plataforma Oficial SENA • Algoritmo de Detección OVERLAPS v2.0</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
              Asignación Eficiente de Ambientes, Horarios y Carga Lectiva
            </h1>

            {/* Subtítulo Descriptivo */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              La plataforma institucional para la optimización de ambientes de aprendizaje, fichas de formación y asignación de instructores en los Centros del SENA. Garantiza <strong>cero cruces horarios</strong> con validación matemática en tiempo real.
            </p>

            {/* Botones de Llamado a la Acción (CTA) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onGoToLogin}
                id="hero-btn-login"
                className="px-6 py-3 text-sm font-bold text-white bg-[#39A900] hover:bg-[#2d8500] active:bg-[#226d00] rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <span>Acceder al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToRegister}
                id="hero-btn-register"
                className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-[#39A900]" />
                <span>Activar Mi Cuenta</span>
              </button>

              <a
                href="#buscador-publico"
                className="px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Consultar Ficha</span>
              </a>
            </div>

            {/* Ticker de Métricas de Rendimiento */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 text-left">
              <div className="p-3.5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-[#39A900]">0 Cruces</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Validación estricta OVERLAPS
                </div>
              </div>
              <div className="p-3.5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-[#00324D] dark:text-blue-400">3 Roles</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Admin, Instructor y Aprendiz
                </div>
              </div>
              <div className="p-3.5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100% XLSX</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Carga masiva con feedback
                </div>
              </div>
              <div className="p-3.5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl">
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">24/7</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Disponibilidad híbrida local/nube
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* VISTA PREVIA INTERACTIVA DE LA MATRIZ DE HORARIOS (HERO SHOWCASE) */}
          {/* ========================================================================= */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 overflow-hidden">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#39A900]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Demostración de Programación Semanal de Ambientes
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Selecciona un día para visualizar la distribución horaria sin solapamientos
                    </p>
                  </div>
                </div>

                {/* Selector de Días Interactivo */}
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {diasSemana.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDay(d.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                        selectedDay === d.id
                          ? 'bg-[#39A900] text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {d.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarjetas de Clases / Horarios Asignados para ese día */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {demoDayHorarios.length > 0 ? (
                  demoDayHorarios.map((h) => {
                    const prog = programas.find(p => p.id === h.programa_id);
                    const amb = ambientes.find(a => a.id === h.ambiente_id);
                    const inst = profiles.find(p => p.id === h.instructor_id);

                    return (
                      <div
                        key={h.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:border-[#39A900]/60 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#39A900] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                              <Clock className="w-3 h-3" />
                              <span>{h.hora_inicio} - {h.hora_fin}</span>
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              Ficha {prog?.codigo_ficha || 'N/A'}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {prog?.nombre_programa || h.materia_competencia}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {h.materia_competencia}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 truncate">
                            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{inst?.nombre_completo || 'Instructor'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium shrink-0 ml-2">
                            <MapPin className="w-3 h-3 text-[#39A900] shrink-0" />
                            <span>{amb?.numero_ambiente || 'Ambiente'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                    No hay bloques programados para este día de demostración.
                  </div>
                )}
              </div>

              {/* Barra de Certificación de Cero Cruces */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#39A900]" />
                  <span>Validado con algoritmo OVERLAPS en PostgreSQL (0 Cruces Detectados)</span>
                </div>
                <button
                  onClick={onGoToLogin}
                  className="text-xs font-bold text-[#00324D] dark:text-blue-400 hover:text-[#39A900] dark:hover:text-[#39A900] flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir Matriz Completa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECCIÓN DE VENTAJAS QUE OFRECE USAR EL SISTEMA (BENEFICIOS CLAVE) */}
      {/* ========================================================================= */}
      <section id="ventajas" className="py-16 sm:py-24 bg-white dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#39A900]">
              Ventajas Institucionales
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              ¿Por qué los Centros de Formación eligen GDHC?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Diseñado para resolver las fricciones comunes en la coordinación académica y la planeación física.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Ventaja 1 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#39A900]/60 transition-all shadow-2xs hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#39A900] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Eliminación Total de Cruces Horarios
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                El motor matemático evalúa simultáneamente colisiones de <strong>Instructor</strong>, <strong>Ambiente</strong> y <strong>Ficha</strong> con la cláusula <code className="text-emerald-700 dark:text-emerald-400 font-mono">OVERLAPS</code>, impidiendo dobles asignaciones en la misma franja.
              </p>
            </div>

            {/* Ventaja 2 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#39A900]/60 transition-all shadow-2xs hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Carga Masiva Excel Inteligente
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Importa cientos de registros en segundos. Si alguna fila contiene un cruce o error de formato, el sistema lo aísla con reporte exacto por celda e inserta selectivamente las filas válidas.
              </p>
            </div>

            {/* Ventaja 3 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#39A900]/60 transition-all shadow-2xs hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Consulta Ágil para Aprendices
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Los aprendices conocen su aula física, jornada y docente asignado en tiempo real sin necesidad de consultar listas impresas o cartelera física, reduciendo desinformación en el centro.
              </p>
            </div>

            {/* Ventaja 4 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#39A900]/60 transition-all shadow-2xs hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Monitoreo de Carga para Instructores
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Vista semanal personalizada de horas lectivas dictadas, control de disponibilidad y notificación directa ante cualquier cambio realizado por coordinación.
              </p>
            </div>

            {/* Ventaja 5 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#39A900]/60 transition-all shadow-2xs hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Gestión Centralizada de Ambientes
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Catálogo completo de aulas TIC, talleres especializados y laboratorios con seguimiento de capacidad, equipamiento y porcentaje de ocupación semanal.
              </p>
            </div>

            {/* Ventaja 6 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#39A900]/60 transition-all shadow-2xs hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Resiliencia y Modo Híbrido
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Funciona sincronizado a PostgreSQL en la nube (Supabase) con respaldo local inmediato. Si se pierde la conexión, la interfaz sigue operando sin interrupción de clases.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BUSCADOR PÚBLICO DE HORARIOS (HERRAMIENTA DIRECTA EN LA LANDING) */}
      {/* ========================================================================= */}
      <section id="buscador-publico" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold text-[#39A900] uppercase tracking-wider">
                Consulta Inmediata sin Iniciar Sesión
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Buscador Rápido de Horarios de Formación
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ingresa tu número de ficha, nombre del programa, ambiente o instructor para previsualizar las sesiones asignadas.
              </p>
            </div>

            {/* Barra de Búsqueda Reactiva */}
            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ej: 2694123, ADSO, Carlos, Aula TIC, 204..."
                className="w-full pl-12 pr-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Chips de Búsqueda Rápida Sugeridos */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mb-6">
              <span className="text-[11px] font-medium">Búsquedas sugeridas:</span>
              <button
                onClick={() => setSearchQuery('ADSO')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer text-xs"
              >
                ADSO
              </button>
              <button
                onClick={() => setSearchQuery('2694123')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Ficha 2694123
              </button>
              <button
                onClick={() => setSearchQuery('TIC')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Ambientes TIC
              </button>
            </div>

            {/* Resultados de la Búsqueda */}
            {searchQuery.trim() !== '' && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredHorarios.length > 0 ? (
                  filteredHorarios.map(h => {
                    const prog = programas.find(p => p.id === h.programa_id);
                    const amb = ambientes.find(a => a.id === h.ambiente_id);
                    const inst = profiles.find(p => p.id === h.instructor_id);
                    const diaTxt = diasSemana.find(d => d.id === h.dia_semana)?.nombre || 'Día';

                    return (
                      <div
                        key={h.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#39A900] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-[#39A900] font-bold text-xs rounded-md">
                              {diaTxt} • {h.hora_inicio} a {h.hora_fin}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              Ficha {prog?.codigo_ficha || 'Sin Ficha'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {prog?.nombre_programa}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Competencia: {h.materia_competencia}
                          </div>
                        </div>

                        <div className="flex sm:flex-col sm:items-end justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#39A900]" />
                            <span>{amb?.numero_ambiente} - {amb?.nombre_ambiente}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Instructor: {inst?.nombre_completo}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No se encontraron horarios para la búsqueda "{searchQuery}". Prueba con otro término o consulta al administrador.
                  </div>
                )}
              </div>
            )}

            {/* Aviso para Aprendices */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ¿Deseas guardar tu horario o gestionar clases?{' '}
                <button
                  onClick={onGoToLogin}
                  className="font-bold text-[#39A900] hover:underline cursor-pointer"
                >
                  Inicia sesión con tu documento
                </button>
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECCIÓN DE MÓDULOS DEL SISTEMA (ROLES) */}
      {/* ========================================================================= */}
      <section id="modulos" className="py-16 sm:py-24 bg-white dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#39A900]">
              Ecosistema Integral
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              Diseñado a la Medida de Cada Rol Institucional
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Flujos de trabajo específicos para coordinadores académicos, docentes y aprendices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Módulo Admin */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Coordinación y Administración
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Control global del centro de formación. Asignación matricial interactiva, gestión de programas y fichas, administración de infraestructura física y carga masiva de archivos Excel.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                    <span>Detección automática de conflictos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                    <span>Carga masiva .xlsx con rollback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39A900] shrink-0" />
                    <span>Disparo de notificaciones masivas</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={onGoToLogin}
                  className="text-xs font-bold text-[#00324D] dark:text-blue-400 hover:text-[#39A900] flex items-center gap-1 cursor-pointer"
                >
                  <span>Acceso de Coordinador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Módulo Instructor */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-400 flex items-center justify-center mb-5">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Portal del Instructor
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Herramienta de seguimiento pedagógico. Permite a los instructores visualizar su cronograma de horas semanales, ambientes físicos asignados y novedades de jornada.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Agenda semanal filtrable por día</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Resumen de horas lectivas semanales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Alertas por cambio de aula</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={onGoToLogin}
                  className="text-xs font-bold text-[#00324D] dark:text-blue-400 hover:text-[#39A900] flex items-center gap-1 cursor-pointer"
                >
                  <span>Acceso de Docente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Módulo Aprendiz */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-400 flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Portal del Aprendiz
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Experiencia rápida y transparente para los aprendices. Consulta directa de su ficha de formación, ubicación física de la sede y datos de contacto de sus instructores.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Consulta por cédula o número de ficha</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Ambiente, sede y jornada claros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Activación de cuenta en 1 minuto</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={onGoToRegister}
                  className="text-xs font-bold text-[#00324D] dark:text-blue-400 hover:text-[#39A900] flex items-center gap-1 cursor-pointer"
                >
                  <span>Activar Cuenta de Aprendiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CENTRO DE DOCUMENTACIÓN Y MANUALES OFICIALES */}
      {/* ========================================================================= */}
      <section id="documentacion" className="py-14 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#39A900]">
              Recursos de Apoyo
            </h2>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Documentación y Guías Institucionales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Consulta las especificaciones de plantilla Excel, el manual de usuario paso a paso y la arquitectura de datos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            
            <button
              onClick={onOpenExcelGuide}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-[#39A900] hover:shadow-sm transition-all cursor-pointer group"
            >
              <FileSpreadsheet className="w-6 h-6 text-[#39A900] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Guía Tablas Excel
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Estructura de columnas y formatos requeridos para carga masiva sin fallas.
              </p>
            </button>

            <button
              onClick={onOpenUserManual}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <BookMarked className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Manual de Usuario
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Instrucciones detalladas de operación para Administradores, Docentes y Alumnos.
              </p>
            </button>

            <button
              onClick={onOpenTechnicalManual}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <Code2 className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Manual Técnico (SQL)
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Arquitectura PostgreSQL, cláusula OVERLAPS, políticas RLS y script DDL.
              </p>
            </button>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PIE DE PÁGINA INSTITUCIONAL SENA */}
      {/* ========================================================================= */}
      <footer className="py-10 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SenaLogo size="sm" showText={false} />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Servicio Nacional de Aprendizaje — SENA
              </span>
              <p className="text-[11px] text-slate-400">
                Sistema de Gestión de Horarios y Disponibilidad de Centros (GDHC v2.4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={onGoToLogin} className="hover:text-[#39A900] cursor-pointer">
              Iniciar Sesión
            </button>
            <span>•</span>
            <button onClick={onGoToRegister} className="hover:text-[#39A900] cursor-pointer">
              Activar Cuenta
            </button>
            <span>•</span>
            <button onClick={onOpenUserManual} className="hover:text-[#39A900] cursor-pointer">
              Ayuda
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
