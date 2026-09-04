import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Sparkles,
  Search,
  RotateCcw,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { Profile } from '../types';
import { db } from '../services/db';
import { SenaLogo, SENA_LOGO_URL } from './SenaLogo';

interface LoginViewProps {
  profiles: Profile[];
  onLogin: (user: Profile) => void;
  onRefreshData?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ profiles, onLogin, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Activation / Register Form State
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regCedula, setRegCedula] = useState('');
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
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
      // Buscar usuario en base de datos (con fallback remoto a Supabase si aplica)
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
          'Tu documento está pre-registrado en el sistema, pero aún no has activado tu cuenta. Por favor haz clic en la pestaña "Activar Cuenta" para definir tu contraseña.'
        );
        // Prellenar cédula en la pestaña de activación para comodidad del usuario
        setRegCedula(found.cedula);
        setLoginLoading(false);
        return;
      }

      // Validar contraseña si está registrada en el perfil
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

      // Autenticación exitosa
      onLogin(found);
    } catch (err: any) {
      setLoginError('Ocurrió un error al verificar los datos de acceso.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Paso 1 de Activación: Verificar si la cédula existe en la base de datos
  const handleCheckCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const cleanCedula = regCedula.trim();
    if (!cleanCedula) {
      setRegError('Por favor ingresa tu número de Cédula de Ciudadanía.');
      return;
    }

    setRegLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === cleanCedula);
      if (!profile) {
        profile = await db.findProfileByCedula(cleanCedula);
      }

      if (!profile) {
        setRegError(
          `El documento CC ${cleanCedula} no se encuentra registrado en el sistema. Solicita a la Coordinación Académica o a tu Administrador que precargue tus datos.`
        );
        setRegLoading(false);
        return;
      }

      if (profile.registrado) {
        setRegError(
          `Esta cuenta ya se encuentra registrada y activa. Puedes iniciar sesión directamente con tu contraseña.`
        );
        setRegLoading(false);
        return;
      }

      // Si existe y no está registrado: avanzar al paso 2
      setFoundProfile(profile);
      setRegEmail(profile.email || '');
      setRegTelefono(profile.telefono || '');
      setRegStep(2);
    } catch (err) {
      setRegError('Error al consultar el documento en el sistema.');
    } finally {
      setRegLoading(false);
    }
  };

  // Paso 2 de Activación: Definir contraseña y completar registro
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

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
      const res = await db.activateProfile(foundProfile.cedula, {
        password: regPassword,
        email: regEmail.trim(),
        telefono: regTelefono.trim(),
      });

      if (!res.success || !res.profile) {
        setRegError(res.error || 'No fue posible completar la activación de la cuenta.');
        setRegLoading(false);
        return;
      }

      if (onRefreshData) onRefreshData();

      setRegSuccess('¡Cuenta activada exitosamente! Ingresando al sistema...');
      
      setTimeout(() => {
        onLogin(res.profile!);
      }, 1200);
    } catch (err: any) {
      setRegError(err?.message || 'Error al activar la cuenta.');
      setRegLoading(false);
    }
  };

  // Paso 1 de Recuperación: Verificar Cédula y Correo
  const handleRecoveryCheckCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);
    setRecSuccess(null);

    const cleanCedula = recCedula.trim();
    const cleanEmail = recEmail.trim().toLowerCase();

    if (!cleanCedula) {
      setRecError('Por favor ingresa tu número de documento.');
      return;
    }

    setRecLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === cleanCedula);
      if (!profile) {
        profile = await db.findProfileByCedula(cleanCedula);
      }

      if (!profile) {
        setRecError(`No se encontró ningún usuario con el documento CC ${cleanCedula}.`);
        setRecLoading(false);
        return;
      }

      // Si especificó correo, validar que coincida
      if (cleanEmail) {
        const userEmail = (profile.email || '').trim().toLowerCase();
        if (userEmail && userEmail !== cleanEmail) {
          setRecError('El correo ingresado no coincide con el registrado para este documento.');
          setRecLoading(false);
          return;
        }
      }

      setRecFoundProfile(profile);
      setRecStep(2);
    } catch (err: any) {
      setRecError('Error al consultar los datos para recuperación de contraseña.');
    } finally {
      setRecLoading(false);
    }
  };

  // Paso 2 de Recuperación: Definir y confirmar nueva contraseña
  const handleRecoveryResetPassword = async (e: React.FormEvent) => {
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
      }, 1500);
    } catch (err: any) {
      setRecError(err?.message || 'Error al restablecer la contraseña.');
      setRecLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Barra Superior Simplificada */}
      <header className="w-full py-4 px-6 border-b border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <SenaLogo size="md" subtext="Horarios Académicos GDHC" />
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Portal de Formación y Coordinación
          </div>
        </div>
      </header>

      {/* Contenedor Principal Centrado */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          
          {/* Logo institucional centrado en la tarjeta */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 p-2 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 mb-3 flex items-center justify-center shadow-2xs">
              <img
                src={SENA_LOGO_URL}
                alt="Logo SENA"
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Sistema GDHC SENA
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión de Horarios y Disponibilidad de Centros
            </p>
          </div>

          {/* Selector de Pestañas Moderno (Pill switcher estilo shadcn/ui) */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              id="tab-btn-login"
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
                setRegSuccess(null);
              }}
              id="tab-btn-register"
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Activar Cuenta</span>
              <span className="w-2 h-2 rounded-full bg-[#39A900]"></span>
            </button>
            <button
              onClick={() => {
                setActiveTab('recovery');
                setRecError(null);
                setRecSuccess(null);
                if (loginIdentifier && !recCedula) {
                  setRecCedula(loginIdentifier);
                }
              }}
              id="tab-btn-recovery"
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'recovery'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recuperar Clave
            </button>
          </div>

          {/* ==================== VISTA: INICIAR SESIÓN ==================== */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Bienvenido
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa tu documento o correo para acceder a tus horarios.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Número de Documento o Correo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="Ej: 1098765432 o aprendiz@sena.edu.co"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('recovery');
                        setRecError(null);
                        setRecSuccess(null);
                        if (loginIdentifier && !recCedula) {
                          setRecCedula(loginIdentifier);
                        }
                      }}
                      className="text-[11px] text-[#00324D] hover:text-[#39A900] font-semibold hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  id="btn-login-submit"
                  className="w-full py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] active:bg-[#256d00] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs mt-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <span>Verificando...</span>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError(null);
                  }}
                  className="text-xs text-[#39A900] hover:underline font-medium cursor-pointer"
                >
                  ¿Eres nuevo o no has activado tu cuenta? Actívala aquí
                </button>
              </div>
            </div>
          )}

          {/* ==================== VISTA: ACTIVAR CUENTA ==================== */}
          {activeTab === 'register' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Activar Cuenta
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Verifica tu documento precargado por el centro para crear tu contraseña.
                </p>
              </div>

              {regError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{regError}</div>
                </div>
              )}

              {regSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{regSuccess}</div>
                </div>
              )}

              {/* PASO 1: Ingreso de Cédula para validación */}
              {regStep === 1 && (
                <form onSubmit={handleCheckCedula} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Número de Cédula de Ciudadanía
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={regCedula}
                        onChange={e => setRegCedula(e.target.value)}
                        placeholder="Ingresa tu número de documento sin puntos"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    id="btn-verify-cedula"
                    className="w-full py-2.5 px-4 bg-[#00324D] hover:bg-[#002236] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {regLoading ? (
                      <span>Consultando datos...</span>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Verificar Documento</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                    💡 Si fuiste incluido en las listas de formación o el Excel del administrador, tu documento ya está registrado y listo para ser activado.
                  </div>
                </form>
              )}

              {/* PASO 2: Confirmación de Datos y Definición de Contraseña */}
              {regStep === 2 && foundProfile && (
                <form onSubmit={handleCompleteRegistration} className="space-y-4 animate-in fade-in">
                  {/* Tarjeta con los datos encontrados en la BD */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Documento verificado en el sistema</span>
                    </div>
                    <div className="text-xs text-slate-800 font-semibold pl-5.5">
                      {foundProfile.nombre_completo}
                    </div>
                    <div className="text-[11px] text-slate-600 pl-5.5 flex items-center gap-2">
                      <span className="capitalize font-medium text-emerald-700">
                        {foundProfile.rol === 'instructor' ? 'Instructor de Formación' : 'Aprendiz SENA'}
                      </span>
                      <span>•</span>
                      <span>CC {foundProfile.cedula}</span>
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="tu_correo@soy.sena.edu.co"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  {/* Teléfono (Opcional) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Teléfono Móvil (Opcional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={regTelefono}
                        onChange={e => setRegTelefono(e.target.value)}
                        placeholder="Ej: 3101234567"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Crea tu Contraseña
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Confirma tu Contraseña
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      id="btn-complete-register"
                      className="flex-1 py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {regLoading ? (
                        <span>Activando cuenta...</span>
                      ) : (
                        <>
                          <span>Completar Registro</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================== VISTA: RECUPERACIÓN DE CONTRASEÑA ==================== */}
          {activeTab === 'recovery' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[#39A900]" />
                  <span>Recuperar Contraseña</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Restablece tu clave de acceso ingresando tu documento de identidad.
                </p>
              </div>

              {recError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{recError}</div>
                </div>
              )}

              {recSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{recSuccess}</div>
                </div>
              )}

              {recStep === 1 && (
                <form onSubmit={handleRecoveryCheckCedula} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Número de Cédula de Ciudadanía
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={recCedula}
                        onChange={e => setRecCedula(e.target.value)}
                        placeholder="Ej: 1098765432"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Documento con el que estás registrado en el SENA
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Correo Electrónico (Opcional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={recEmail}
                        onChange={e => setRecEmail(e.target.value)}
                        placeholder="Ej: usuario@sena.edu.co"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Para mayor seguridad en la verificación de identidad
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={recLoading}
                    id="btn-recovery-step1"
                    className="w-full py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs mt-2 disabled:opacity-50"
                  >
                    {recLoading ? (
                      <span>Consultando usuario...</span>
                    ) : (
                      <>
                        <span>Verificar Usuario</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {recStep === 2 && recFoundProfile && (
                <form onSubmit={handleRecoveryResetPassword} className="space-y-4">
                  {/* Tarjeta de Confirmación de Identidad */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#39A900]" />
                      <span>Usuario Identificado:</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 pl-5">
                      {recFoundProfile.nombre_completo}
                    </div>
                    <div className="text-[11px] text-slate-500 pl-5 flex items-center gap-2">
                      <span>CC {recFoundProfile.cedula}</span>
                      <span>•</span>
                      <span className="capitalize font-medium text-emerald-700">{recFoundProfile.rol}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={recNewPassword}
                        onChange={e => setRecNewPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={recConfirmPassword}
                        onChange={e => setRecConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRecStep(1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={recLoading}
                      id="btn-recovery-submit"
                      className="flex-1 py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {recLoading ? (
                        <span>Guardando nueva clave...</span>
                      ) : (
                        <>
                          <span>Restablecer Contraseña</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setRecError(null);
                    setRecSuccess(null);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Iniciar Sesión</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Pie de Página Institucional Mínimo */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Servicio Nacional de Aprendizaje SENA • Horarios y Disponibilidad
      </footer>
    </div>
  );
};
