import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Lock, 
  Mail, 
  User
} from 'lucide-react';
import { Profile } from '../types';
import { db } from '../services/db';
import { SenaLogo } from './SenaLogo';
import { ThemeToggle } from './ThemeToggle';

interface PasswordRecoveryViewProps {
  profiles: Profile[];
  onRefreshData?: () => void;
  onGoToLogin: () => void;
  onBackToLanding?: () => void;
}

export const PasswordRecoveryView: React.FC<PasswordRecoveryViewProps> = ({
  profiles,
  onRefreshData,
  onGoToLogin,
  onBackToLanding,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Paso 1: Verificar cédula y correo registrado
  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanCed = cedula.trim();
    const cleanMail = email.trim().toLowerCase();

    if (!cleanCed || !cleanMail) {
      setError('Por favor ingresa tu cédula y correo registrado.');
      return;
    }

    setLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === cleanCed);
      if (!profile) {
        profile = await db.findProfileByCedula(cleanCed);
      }

      if (!profile) {
        setError('No se encontró un usuario con el número de documento ingresado.');
        setLoading(false);
        return;
      }

      if (profile.email.trim().toLowerCase() !== cleanMail) {
        setError('El correo electrónico no coincide con el registrado institucionalmente para este documento.');
        setLoading(false);
        return;
      }

      if (!profile.registrado) {
        setError('Esta cuenta no ha sido activada previamente. Por favor utiliza la opción "Activar Cuenta".');
        setLoading(false);
        return;
      }

      setFoundProfile(profile);
      setStep(2);
    } catch {
      setError('Error al verificar los datos de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Guardar nueva contraseña
  const handleCompleteRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!foundProfile) return;

    if (!newPassword || newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres para cumplir con los estándares de seguridad.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas cuidadosamente.');
      return;
    }

    setLoading(true);

    try {
      const res = await db.updateProfile(foundProfile.id, {
        password: newPassword,
        registrado: true,
      });

      if (!res.success) {
        setError(res.error || 'No fue posible restablecer la contraseña.');
        setLoading(false);
        return;
      }

      if (onRefreshData) onRefreshData();

      setSuccess('¡Contraseña restablecida exitosamente! Redirigiendo a la pantalla de ingreso...');

      setTimeout(() => {
        onGoToLogin();
      }, 1500);
    } catch {
      setError('Error al restablecer la contraseña.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Barra Superior */}
      <header className="w-full py-3 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding || onGoToLogin}
              id="btn-back-from-recovery"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#39A900] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
            <SenaLogo size="sm" subtext="Recuperación de Contraseña" />
          </div>

          <ThemeToggle variant="dropdown" />
        </div>
      </header>

      {/* Contenedor Principal de Recuperación */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-colors">
          
          {/* Header del Card */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-[#0288D1] dark:text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recuperar Contraseña
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {step === 1 
                ? 'Ingresa tus datos registrados para restablecer tu clave institucional'
                : 'Define tu nueva contraseña segura'}
            </p>
          </div>

          {/* Mensajes de Alerta / Éxito */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="leading-tight">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#39A900]" />
              <div className="leading-tight">{success}</div>
            </div>
          )}

          {/* Paso 1: Documento y Correo */}
          {step === 1 ? (
            <form onSubmit={handleVerifyRecovery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Número de Cédula o Documento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={cedula}
                    onChange={e => setCedula(e.target.value)}
                    placeholder="Ej: 1098765432"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ejemplo@sena.edu.co"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verificando datos...' : 'Validar Identidad'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-[#39A900] dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                >
                  Recordé mi contraseña — Iniciar Sesión
                </button>
              </div>
            </form>
          ) : (
            /* Paso 2: Crear Nueva Contraseña */
            <form onSubmit={handleCompleteRecovery} className="space-y-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">{foundProfile?.nombre_completo}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">CC: {foundProfile?.cedula}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nueva Contraseña (Mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Cambiar y Continuar'}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Servicio Nacional de Aprendizaje — SENA • Sistema GDHC
      </footer>
    </div>
  );
};
