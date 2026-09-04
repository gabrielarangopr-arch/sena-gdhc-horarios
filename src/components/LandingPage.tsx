import React from 'react';
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
  ShieldCheck,
  LogIn,
  UserPlus,
  Layers,
  MapPin,
  UploadCloud
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
  onOpenExcelGuide?: () => void;
  onOpenUserManual?: () => void;
  onOpenTechnicalManual?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  profiles,
  programas,
  ambientes,
  horarios,
  onGoToLogin,
  onGoToRegister,
}) => {
  const instructoresCount = profiles.filter(p => p.rol === 'instructor').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header institucional compacto */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-2.5">
              <SenaLogo size="sm" subtext="Gestión de Horarios y Centros" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle variant="dropdown" />

              <button
                onClick={onGoToRegister}
                id="btn-landing-register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#39A900]" />
                <span>Activar Cuenta</span>
              </button>

              <button
                onClick={onGoToLogin}
                id="btn-landing-login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#2d8500] active:bg-[#226d00] rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal Compacto */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
        
        {/* Hero Centralizado */}
        <section className="text-center space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[#226D00] dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#39A900] animate-pulse"></span>
            <span>Servicio Nacional de Aprendizaje — SENA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Gestión de Horarios y Disponibilidad de Centros
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Plataforma institucional para la asignación y consulta de ambientes, fichas de formación y carga de instructores con prevención automática de cruces.
          </p>

          {/* Botones de acción principales */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onGoToLogin}
              id="btn-hero-login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00324D] hover:bg-[#002236] text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4 text-[#39A900]" />
              <span>Iniciar Sesión en el Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToRegister}
              id="btn-hero-register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#39A900]" />
              <span>Activar Cuenta de Aprendiz</span>
            </button>
          </div>
        </section>

        {/* Métricas Resumidas en una sola barra */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-center p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00324D] dark:text-emerald-400">
              {ambientes.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Ambientes
            </div>
          </div>
          <div className="text-center p-2 border-l border-slate-100 dark:border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#39A900]">
              {programas.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Fichas Activas
            </div>
          </div>
          <div className="text-center p-2 sm:border-l border-slate-100 dark:border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0288D1] dark:text-sky-400">
              {instructoresCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Instructores
            </div>
          </div>
          <div className="text-center p-2 border-l border-slate-100 dark:border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-200">
              {horarios.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Horarios Asignados
            </div>
          </div>
        </section>

        {/* 3 Pilares Clave (Tarjetas Compactas) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#226D00] dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Validación Sin Cruces
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Algoritmo estricto de intervalos que bloquea colisiones de salones e instructores antes de guardar.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0288D1] dark:text-sky-400 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Carga Masiva Excel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Importación veloz de horarios con validación celda a celda y reporte detallado de novedades.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Acceso por Rol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Vistas dedicadas para Administradores, Instructores y Aprendices con sus respectivos horarios.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Compacto */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#39A900]"></span>
            <span>Servicio Nacional de Aprendizaje — SENA • Sistema GDHC</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[11px]">
            Dirección de Formación Profesional
          </p>
        </div>
      </footer>
    </div>
  );
};
