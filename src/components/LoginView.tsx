import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus
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
  initialTab?: 'login' | 'register' | 'recovery';
}

export const LoginView: React.FC<LoginViewProps> = ({
  profiles,
  onLogin,
  onRefreshData,
  onBackToLanding,
  initialTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Activation / Register Form State
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regCedula, setRegCedula] = useState('');
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Password Recovery Form State
  const [recStep, setRecStep] = useState<1 | 2>(1);
  const [recCedula, setRecCedula] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recFoundProfile, setRecFoundProfile] = useState<Profile | null>(null);
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recConfirmPassword, setRecConfirmPassword] = useState('');
  const [showRecPassword, setShowRecPassword] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recSuccess, setRecSuccess] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  // Manejador de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInput = loginIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setLoginError('Por favor ingresa tu número de documento o correo institucional.');
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

      // Si el usuario existe pero no ha activado su cuenta
      if (found.rol !== 'admin' && found.registrado === false) {
        setLoginError(
          'Tu documento está registrado, pero aún no has activado tu cuenta. Por favor haz clic en "Activar Cuenta" para definir tu contraseña.'
        );
        setRegCedula(found.cedula);
        setLoginLoading(false);
        return;
      }

      // Validar contraseña
      if (found.password && found.password.trim() !== '') {
        if (!loginPassword) {
          setLoginError('Por favor ingresa tu contraseña.');
          setLoginLoading(false);
          return;
        }
        if (loginPassword !== found.password) {
          setLoginError('La contraseña ingresada no es correcta.');
          setLoginLoading(false);
          return;
        }
      }

      onLogin(found);
    } catch {
      setLoginError('Ocurrió un error al verificar los datos de acceso.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Paso 1 de Activación: Verificar si la cédula existe
  const handleCheckCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const clean = regCedula.trim();
    if (!clean) {
      setRegError('Ingresa tu número de cédula o documento.');
      return;
    }

    setRegLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === clean);
      if (!profile) {
        profile = await db.findProfileByCedula(clean);
      }

      if (!profile) {
        setRegError(
          'Tu documento no se encuentra en el censo institucional. Contacta a la coordinación académica de tu centro.'
        );
        setRegLoading(false);
        return;
      }

      if (profile.registrado && profile.password) {
        setRegError('Esta cuenta ya se encuentra activa. Puedes iniciar sesión directamente.');
        setRegLoading(false);
        return;
      }

      setFoundProfile(profile);
      setRegEmail(profile.email || '');
      setRegTelefono(profile.telefono || '');
      setRegStep(2);
    } catch {
      setRegError('Error al consultar el documento.');
    } finally {
      setRegLoading(false);
    }
  };

  // Paso 2 de Activación: Crear Contraseña
  const handleCompleteActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!foundProfile) return;

    if (!regPassword || regPassword.length < 4) {
      setRegError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await db.updateProfile(foundProfile.id, {
        password: regPassword,
        registrado: true,
        email: regEmail.trim() || foundProfile.email,
        telefono: regTelefono.trim() || foundProfile.telefono,
      });

      if (!res.success) {
        setRegError(res.error || 'No fue posible completar la activación.');
        setRegLoading(false);
        return;
      }

      if (onRefreshData) onRefreshData();

      setRegSuccess('¡Cuenta activada exitosamente! Iniciando sesión...');
      setLoginIdentifier(foundProfile.cedula);
      setLoginPassword(regPassword);

      setTimeout(() => {
        onLogin({
          ...foundProfile,
          password: regPassword,
          registrado: true,
          email: regEmail.trim() || foundProfile.email,
          telefono: regTelefono.trim() || foundProfile.telefono,
        });
      }, 1200);
    } catch {
      setRegError('Error al activar la cuenta.');
      setRegLoading(false);
    }
  };

  // Paso 1 de Recuperación: Verificar Cédula y Correo
  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);
    setRecSuccess(null);

    const cleanCed = recCedula.trim();
    const cleanMail = recEmail.trim().toLowerCase();

    if (!cleanCed || !cleanMail) {
      setRecError('Por favor ingresa tu cédula y correo registrado.');
      return;
    }

    setRecLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === cleanCed);
      if (!profile) {
        profile = await db.findProfileByCedula(cleanCed);
      }

      if (!profile) {
        setRecError('No se encontró un usuario con el documento ingresado.');
        setRecLoading(false);
        return;
      }

      if (profile.email.trim().toLowerCase() !== cleanMail) {
        setRecError('El correo electrónico no coincide con el registrado para este documento.');
        setRecLoading(false);
        return;
      }

      setRecFoundProfile(profile);
      setRecStep(2);
    } catch {
      setRecError('Error al verificar los datos de recuperación.');
    } finally {
      setRecLoading(false);
    }
  };

  // Paso 2 de Recuperación: Guardar Nueva Contraseña
  const handleCompleteRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);
    setRecSuccess(null);

    if (!recFoundProfile) return;

    if (!recNewPassword || recNewPassword.length < 4) {
      setRecError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (recNewPassword !== recConfirmPassword) {
      setRecError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setRecLoading(true);

    try {
      const res = await db.updateProfile(recFoundProfile.id, {
        password: recNewPassword,
        registrado: true,
      });

      if (!res.success) {
        setRecError(res.error || 'No fue posible restablecer la contraseña.');
        setRecLoading(false);
        return;
      }

      if (onRefreshData) onRefreshData();

      setRecSuccess('¡Contraseña restablecida exitosamente! Redirigiendo al inicio de sesión...');
      setLoginIdentifier(recFoundProfile.cedula);
      setLoginPassword(recNewPassword);

      setTimeout(() => {
        setActiveTab('login');
        setRecSuccess(null);
        setRecStep(1);
        setRecFoundProfile(null);
        setRecNewPassword('');
        setRecConfirmPassword('');
      }, 1400);
    } catch {
      setRecError('Error al restablecer la contraseña.');
      setRecLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Barra Superior Compacta */}
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
                <span>Volver</span>
              </button>
            )}
            <SenaLogo size="sm" subtext="Acceso al Sistema" />
          </div>

          <ThemeToggle variant="dropdown" />
        </div>
      </header>

      {/* Contenedor Principal Centrado y Limpio */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-colors">
          
          {/* Header del Card */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'login' && 'Iniciar Sesión'}
              {activeTab === 'register' && 'Activar Cuenta'}
              {activeTab === 'recovery' && 'Recuperar Contraseña'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistema de Gestión de Horarios y Centros (GDHC)
            </p>
          </div>

          {/* Selector de Pestañas Simple */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ingreso
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegStep(1);
                setRegError(null);
                setRegSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Activar Cuenta
            </button>
            <button
              onClick={() => {
                setActiveTab('recovery');
                setRecStep(1);
                setRecError(null);
                setRecSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'recovery'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Recuperar
            </button>
          </div>

          {/* ================================================================= */}
          {/* PESTAÑA 1: INICIAR SESIÓN */}
          {/* ================================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="leading-tight">{loginError}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Número de Documento o Correo
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
                    placeholder="Ej: 1098765432"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
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
                <span>{loginLoading ? 'Verificando...' : 'Entrar al Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('recovery');
                    setRecStep(1);
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#39A900] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 2: ACTIVAR CUENTA */}
          {/* ================================================================= */}
          {activeTab === 'register' && (
            <div>
              {regError && (
                <div className="p-3 mb-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="leading-tight">{regError}</div>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 mb-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#39A900]" />
                  <div className="leading-tight">{regSuccess}</div>
                </div>
              )}

              {regStep === 1 ? (
                <form onSubmit={handleCheckCedula} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ingresa tu cédula registrada para verificar tus datos y crear tu clave de acceso.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Número de Cédula o Documento
                    </label>
                    <input
                      type="text"
                      required
                      value={regCedula}
                      onChange={e => setRegCedula(e.target.value)}
                      placeholder="Ej: 1098765434"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{regLoading ? 'Consultando...' : 'Verificar Documento'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteActivation} className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{foundProfile?.nombre_completo}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">CC: {foundProfile?.cedula}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Crear Contraseña
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirmar Contraseña
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="w-1/3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-2/3 py-2 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {regLoading ? 'Activando...' : 'Completar Activación'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 3: RECUPERAR CONTRASEÑA */}
          {/* ================================================================= */}
          {activeTab === 'recovery' && (
            <div>
              {recError && (
                <div className="p-3 mb-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="leading-tight">{recError}</div>
                </div>
              )}

              {recSuccess && (
                <div className="p-3 mb-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#39A900]" />
                  <div className="leading-tight">{recSuccess}</div>
                </div>
              )}

              {recStep === 1 ? (
                <form onSubmit={handleVerifyRecovery} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ingresa tu documento y correo registrado para restablecer tu clave.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Número de Cédula
                    </label>
                    <input
                      type="text"
                      required
                      value={recCedula}
                      onChange={e => setRecCedula(e.target.value)}
                      placeholder="Ej: 1098765432"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Correo Electrónico Registrado
                    </label>
                    <input
                      type="email"
                      required
                      value={recEmail}
                      onChange={e => setRecEmail(e.target.value)}
                      placeholder="ejemplo@sena.edu.co"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#39A900] focus:outline-hidden transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={recLoading}
                    className="w-full py-2.5 px-4 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{recLoading ? 'Validando...' : 'Verificar y Continuar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteRecovery} className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{recFoundProfile?.nombre_completo}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">CC: {recFoundProfile?.cedula}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type={showRecPassword ? 'text' : 'password'}
                      required
                      value={recNewPassword}
                      onChange={e => setRecNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type={showRecPassword ? 'text' : 'password'}
                      required
                      value={recConfirmPassword}
                      onChange={e => setRecConfirmPassword(e.target.value)}
                      placeholder="Repite tu nueva contraseña"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#39A900] focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecStep(1)}
                      className="w-1/3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={recLoading}
                      className="w-2/3 py-2 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {recLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer Mínimo */}
      <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Servicio Nacional de Aprendizaje — SENA
      </footer>
    </div>
  );
};
