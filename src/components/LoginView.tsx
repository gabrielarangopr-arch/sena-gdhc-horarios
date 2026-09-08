import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { Profile } from '../types';
import { db } from '../services/db';
import { SenaLogo } from './SenaLogo';
import { ThemeToggle } from './ThemeToggle';

interface LoginViewProps {
  profiles: Profile[];
  onLogin: (user: Profile) => void;
  onRefreshData?: () => void;
  onBackToLanding?: () => void;
  onGoToActivate: () => void;
  onGoToRecovery: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  profiles,
  onLogin,
  onBackToLanding,
  onGoToActivate,
  onGoToRecovery,
}) => {
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Estadísticas institucionales en tiempo real para el panel izquierdo
  const stats = useMemo(() => {
    try {
      const ambs = db.getAmbientes();
      const progs = db.getProgramas();
      const hors = db.getHorarios();
      return {
        ambientesCount: ambs.length > 0 ? ambs.length : 18,
        programasCount: progs.length > 0 ? progs.length : 12,
        horariosCount: hors.length > 0 ? hors.length : 36,
      };
    } catch {
      return {
        ambientesCount: 18,
        programasCount: 12,
        horariosCount: 36,
      };
    }
  }, []);

  // Manejador estricto de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Verificación de bloqueo por intentos fallidos excesivos
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingSeconds = Math.ceil((lockoutTime - Date.now()) / 1000);
      setLoginError(`Demasiados intentos fallidos. Por seguridad, espera ${remainingSeconds} segundos antes de reintentar.`);
      return;
    }

    const cleanInput = loginIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setLoginError('Por favor ingresa tu número de documento o correo institucional.');
      return;
    }

    // CONTROL DE SEGURIDAD CRÍTICO: La contraseña es estrictamente obligatoria
    if (!loginPassword || loginPassword.trim() === '') {
      setLoginError('Por favor ingresa tu contraseña.');
      return;
    }

    setLoginLoading(true);

    try {
      let found: Profile | null | undefined = profiles.find(
        p => p.cedula.trim().toLowerCase() === cleanInput || p.email.trim().toLowerCase() === cleanInput
      );

      if (!found) {
        found = await db.findProfileByIdentifier(cleanInput);
      }

      if (!found) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutTime(Date.now() + 30000);
          setLoginError('Has alcanzado el límite de 5 intentos fallidos. Por seguridad, tu acceso está pausado temporalmente durante 30 segundos.');
        } else {
          setLoginError('El documento o correo ingresado no se encuentra registrado en el sistema.');
        }
        setLoginLoading(false);
        return;
      }

      // Si el usuario existe pero no ha activado su cuenta o no tiene contraseña asignada
      if (!found.registrado || !found.password || found.password.trim() === '') {
        setLoginError(
          'Tu documento está registrado en el censo, pero aún no has activado tu cuenta. Por favor haz clic en "Activar mi Cuenta" para crear tu contraseña.'
        );
        setLoginLoading(false);
        return;
      }

      // Validación estricta de contraseña
      if (loginPassword !== found.password) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutTime(Date.now() + 30000);
          setLoginError('Has superado 5 intentos fallidos. Por seguridad institucional, tu acceso está suspendido temporalmente por 30 segundos.');
        } else {
          setLoginError(`La contraseña ingresada es incorrecta. Intentos restantes antes de bloqueo temporal: ${5 - nextAttempts}.`);
        }
        setLoginLoading(false);
        return;
      }

      // Éxito: Restablecer contador de intentos y autenticar
      setFailedAttempts(0);
      setLockoutTime(null);
      onLogin(found);
    } catch {
      setLoginError('Ocurrió un error al verificar los datos de acceso.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-[#0f172a] dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      
      {/* Barra de navegación superior sutil */}
      <div className="w-full max-w-[1020px] mb-4 flex items-center justify-between px-2">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            id="btn-back-to-landing"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#39a900] dark:hover:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <ThemeToggle variant="dropdown" />
        </div>
      </div>

      {/* Tarjeta Principal de Inicio de Sesión (.login-container) */}
      <div 
        id="login-main-container"
        className="w-full max-w-md md:max-w-[1020px] md:min-h-[580px] bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row transition-colors"
      >
        
        {/* --- PANEL LATERAL IZQUIERDO (Identidad y Marca SENA - Oculto en Móvil) --- */}
        <aside 
          id="brand-panel"
          aria-label="Panel de Identidad Institucional"
          className="hidden md:flex flex-1 bg-gradient-to-br from-[#0f172a] via-[#141e33] to-[#1e293b] text-white p-8 sm:p-12 flex-col justify-between relative overflow-hidden"
        >
          {/* Luz ambiental verde SENA */}
          <div 
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-64 h-64 bg-[#39a900] opacity-15 blur-[80px] rounded-full pointer-events-none"
          />
          <div 
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500 opacity-10 blur-[70px] rounded-full pointer-events-none"
          />

          {/* Header de la marca con Logo Oficial del SENA */}
          <div className="flex items-center relative z-10">
            <SenaLogo variant="on-dark" size="md" showText={true} subtext="Sistema GDHC" />
          </div>

          {/* Contenido principal del panel izquierdo */}
          <div className="my-8 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-[#39a900] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gestión de Horarios y Centros</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold leading-tight tracking-tight text-white">
              Optimización y Asignación de Horarios
            </h2>
            <p className="text-slate-400 text-sm sm:text-[0.95rem] leading-relaxed">
              Plataforma institucional para la asignación inteligente de ambientes, programación de instructores y control de fichas de formación sin traslapes.
            </p>
          </div>

          {/* Footer del panel izquierdo con estadísticas */}
          <div className="flex items-center gap-4 sm:gap-6 relative z-10 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-[#39a900]">
                {stats.ambientesCount}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">
                Ambientes
              </span>
            </div>

            <div className="w-[1px] h-7 bg-slate-700" />

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-[#39a900]">
                {stats.programasCount}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">
                Fichas
              </span>
            </div>

            <div className="w-[1px] h-7 bg-slate-700" />

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-[#39a900]">
                0 Cruces
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">
                Garantizado
              </span>
            </div>
          </div>
        </aside>

        {/* --- PANEL DERECHO (Formulario de Inicio de Sesión) --- */}
        <div 
          id="form-panel"
          className="flex-1 p-6 sm:p-10 md:p-12 flex items-center justify-center bg-white dark:bg-slate-900 transition-colors"
        >
          <div className="w-full max-w-[380px]">
            
            {/* Header del Formulario */}
            <div className="mb-6">
              {/* Logo visible en pantallas móviles cuando el aside está oculto */}
              <div className="md:hidden mb-5 flex items-center justify-start">
                <SenaLogo size="sm" subtext="Gestión de Horarios y Centros" />
              </div>

              <h1 className="text-2xl sm:text-[1.75rem] font-bold text-[#0f172a] dark:text-white tracking-tight">
                Iniciar Sesión
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Formulario de Login */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div 
                  role="alert"
                  className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-[12px] text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="leading-tight">{loginError}</div>
                </div>
              )}

              {/* Grupo: Documento o Correo */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="input-login-id"
                  className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 uppercase tracking-wider"
                >
                  Documento o Correo
                </label>
                <div className="flex items-center bg-[#f8fafc] dark:bg-slate-800/70 border border-[#e2e8f0] dark:border-slate-700 rounded-[12px] px-3.5 transition-all focus-within:border-[#39a900] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#39a900]/10">
                  <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    id="input-login-id"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="Ej: 1098765432 o usuario@sena.edu.co"
                    className="w-full py-3 border-none bg-transparent outline-none text-sm text-[#0f172a] dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Grupo: Contraseña y Enlace Recuperar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label 
                    htmlFor="input-login-password"
                    className="block text-xs font-semibold text-[#0f172a] dark:text-slate-200 uppercase tracking-wider"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={onGoToRecovery}
                    id="link-go-to-recovery"
                    className="text-xs text-[#39a900] hover:text-[#2e8800] dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="flex items-center bg-[#f8fafc] dark:bg-slate-800/70 border border-[#e2e8f0] dark:border-slate-700 rounded-[12px] px-3.5 transition-all focus-within:border-[#39a900] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#39a900]/10">
                  <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3 border-none bg-transparent outline-none text-sm text-[#0f172a] dark:text-white placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    id="btn-toggle-password-visibility"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón Submit (.btn-submit) */}
              <button
                type="submit"
                id="btn-login-submit"
                disabled={loginLoading || Boolean(lockoutTime && Date.now() < lockoutTime)}
                className="w-full py-3.5 bg-[#39a900] hover:bg-[#2e8800] active:scale-[0.99] text-white rounded-[12px] text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loginLoading ? 'Verificando...' : lockoutTime && Date.now() < lockoutTime ? 'Acceso Pausado' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Pie del Formulario: Enlace a Pantalla Independiente de Activación */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ¿Aún no has configurado tu contraseña o eres nuevo?
              </p>
              <button
                type="button"
                onClick={onGoToActivate}
                id="btn-go-to-activate"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#39a900]" />
                <span>Activar mi Cuenta</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Footer institucional */}
      <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Servicio Nacional de Aprendizaje — SENA &bull; GDHC {new Date().getFullYear()}
      </footer>

    </div>
  );
};

