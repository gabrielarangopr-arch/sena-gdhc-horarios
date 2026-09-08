import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  Shield
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

  // Manejador estricto de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

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
        found = await db.findProfileByCedula(cleanInput);
      }

      if (!found) {
        setLoginError('El documento o correo ingresado no se encuentra registrado en el sistema.');
        setLoginLoading(false);
        return;
      }

      // Si el usuario existe pero no ha activado su cuenta o no tiene contraseña asignada
      if (!found.registrado || !found.password || found.password.trim() === '') {
        setLoginError(
          'Tu documento está registrado, pero aún no has activado tu cuenta. Por favor ve a la pantalla de "Activar Cuenta" para definir tu clave.'
        );
        setLoginLoading(false);
        return;
      }

      // Validación estricta de contraseña
      if (loginPassword !== found.password) {
        setLoginError('La contraseña ingresada no es correcta. Verifica tus datos e intenta de nuevo.');
        setLoginLoading(false);
        return;
      }

      onLogin(found);
    } catch {
      setLoginError('Ocurrió un error al verificar los datos de acceso.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Barra Superior */}
      <header className="w-full py-3 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                id="btn-back-to-landing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#39A900] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Inicio</span>
              </button>
            )}
            <SenaLogo size="sm" subtext="Ingreso al Sistema" />
          </div>

          <ThemeToggle variant="dropdown" />
        </div>
      </header>

      {/* Pantalla Exclusiva de Inicio de Sesión */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-colors">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[#39A900] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistema de Gestión de Horarios y Centros (GDHC)
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="leading-tight">{loginError}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Número de Documento o Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="Ej: 1098765432 o usuario@sena.edu.co"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={onGoToRecovery}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#39A900] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] active:bg-[#226d00] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loginLoading ? 'Verificando credenciales...' : 'Entrar al Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Enlace para activar cuenta en pantalla separada */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ¿Eres nuevo o aún no has creado tu contraseña?
            </p>
            <button
              type="button"
              onClick={onGoToActivate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#39A900]" />
              <span>Activar mi Cuenta</span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Servicio Nacional de Aprendizaje — SENA
      </footer>
    </div>
  );
};
