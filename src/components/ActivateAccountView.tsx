import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone,
  ShieldCheck
} from 'lucide-react';
import { Profile } from '../types';
import { db } from '../services/db';
import { SenaLogo } from './SenaLogo';
import { ThemeToggle } from './ThemeToggle';

interface ActivateAccountViewProps {
  profiles: Profile[];
  onLogin: (user: Profile) => void;
  onRefreshData?: () => void;
  onGoToLogin: () => void;
  onBackToLanding?: () => void;
}

export const ActivateAccountView: React.FC<ActivateAccountViewProps> = ({
  profiles,
  onLogin,
  onRefreshData,
  onGoToLogin,
  onBackToLanding,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [cedula, setCedula] = useState('');
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Paso 1: Buscar cédula en el censo
  const handleCheckCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const clean = cedula.trim();
    if (!clean) {
      setError('Por favor ingresa tu número de cédula o documento.');
      return;
    }

    setLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === clean);
      if (!profile) {
        profile = await db.findProfileByCedula(clean);
      }

      if (!profile) {
        setError(
          'Tu documento no se encuentra en el censo institucional. Contacta a la coordinación académica de tu centro para ser registrado.'
        );
        setLoading(false);
        return;
      }

      if (profile.registrado && profile.password && profile.password.trim() !== '') {
        setError(
          'Esta cuenta ya se encuentra activa y cuenta con contraseña. Puedes iniciar sesión directamente con tus credenciales.'
        );
        setLoading(false);
        return;
      }

      setFoundProfile(profile);
      setEmail(profile.email || '');
      setTelefono(profile.telefono || '');
      setStep(2);
    } catch {
      setError('Error al consultar el censo institucional.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Configurar contraseña y activar cuenta
  const handleCompleteActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!foundProfile) return;

    if (!password || password.length < 8) {
      setError('La contraseña debe tener un mínimo de 8 caracteres para garantizar la seguridad institucional de tu cuenta.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas cuidadosamente.');
      return;
    }

    setLoading(true);

    try {
      const res = await db.updateProfile(foundProfile.id, {
        password: password,
        registrado: true,
        email: email.trim() || foundProfile.email,
        telefono: telefono.trim() || foundProfile.telefono,
      });

      if (!res.success) {
        setError(res.error || 'No fue posible completar la activación.');
        setLoading(false);
        return;
      }

      if (onRefreshData) onRefreshData();

      setSuccess('¡Cuenta activada exitosamente! Iniciando sesión...');

      const activatedUser: Profile = {
        ...foundProfile,
        password: password,
        registrado: true,
        email: email.trim() || foundProfile.email,
        telefono: telefono.trim() || foundProfile.telefono,
      };

      setTimeout(() => {
        onLogin(activatedUser);
      }, 1300);
    } catch {
      setError('Error al activar la cuenta.');
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
              id="btn-back-from-activate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#39A900] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
            <SenaLogo size="sm" subtext="Activación de Cuenta" />
          </div>

          <ThemeToggle variant="dropdown" />
        </div>
      </header>

      {/* Contenedor Principal de la Pantalla */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-colors">
          
          {/* Header de la pantalla */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[#39A900] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Activar Cuenta Institucional
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {step === 1 
                ? 'Verifica tu documento en el censo para configurar tu clave de acceso'
                : 'Define tu contraseña segura para completar la activación'}
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

          {/* Paso 1: Ingreso de Cédula */}
          {step === 1 ? (
            <form onSubmit={handleCheckCedula} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Número de Cédula o Documento
                </label>
                <input
                  type="text"
                  required
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  placeholder="Ej: 1098765432"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#39A900] mt-0.5" />
                <p>
                  Si eres aprendiz o instructor nuevo, tu cédula debe estar precargada por la coordinación de tu centro.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Consultando Censo...' : 'Verificar en el Censo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-[#39A900] dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                >
                  ¿Ya tienes contraseña? Iniciar Sesión
                </button>
              </div>
            </form>
          ) : (
            /* Paso 2: Creación de Contraseña y Datos */
            <form onSubmit={handleCompleteActivation} className="space-y-3.5">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">{foundProfile?.nombre_completo}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>CC: {foundProfile?.cedula}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-[#39A900]">{foundProfile?.rol}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Ej: 3101234567"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                  />
                </div>
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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
                  Confirmar Contraseña
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
                  {loading ? 'Activando...' : 'Completar y Entrar'}
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
