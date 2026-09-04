import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  HelpCircle,
  Layers
} from 'lucide-react';
import { Profile } from '../types';
import { db } from '../services/db';
import { SenaLogo, SENA_LOGO_URL } from './SenaLogo';
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

  // Sync if initialTab changes
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
      // Buscar usuario en base de datos local o Supabase
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
      const res = await db.updateProfile(foundProfile.id, {
        password: regPassword,
        email: regEmail.trim(),
        telefono: regTelefono.trim(),
        registrado: true,
        fecha_registro: new Date().toISOString(),
      });

      if (!res.success) {
        setRegError(res.error || 'No fue posible completar la activación.');
        setRegLoading(false);
        return;
      }

      if (onRefreshData) onRefreshData();

      setRegSuccess('¡Cuenta activada exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.');
      setLoginIdentifier(foundProfile.cedula);
      setLoginPassword(regPassword);

      setTimeout(() => {
        setActiveTab('login');
        setRegSuccess(null);
        setRegStep(1);
        setFoundProfile(null);
        setRegPassword('');
        setRegConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setRegError(err?.message || 'Error al completar el registro.');
      setRegLoading(false);
    }
  };

  // Recuperación: Paso 1 Verificar Identidad
  const handleCheckRecoveryIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);
    setRecSuccess(null);

    const cleanCedula = recCedula.trim();
    const cleanEmail = recEmail.trim().toLowerCase();

    if (!cleanCedula) {
      setRecError('Por favor ingresa tu número de documento.');
      return;
    }

    if (!cleanEmail) {
      setRecError('Por favor ingresa el correo electrónico registrado.');
      return;
    }

    setRecLoading(true);

    try {
      let profile = profiles.find(p => p.cedula.trim() === cleanCedula);
      if (!profile) {
        profile = await db.findProfileByCedula(cleanCedula);
      }

      if (!profile) {
        setRecError('No se encontró ningún usuario con ese número de documento.');
        setRecLoading(false);
        return;
      }

      const registeredEmail = (profile.email || '').trim().toLowerCase();
      if (registeredEmail && registeredEmail !== cleanEmail) {
        setRecError('El correo electrónico no coincide con el registrado para este documento.');
        setRecLoading(false);
        return;
      }

      setRecFoundProfile(profile);
      setRecStep(2);
    } catch (err) {
      setRecError('Error al validar la identidad del usuario.');
    } finally {
      setRecLoading(false);
    }
  };

  // Recuperación: Paso 2 Guardar Nueva Contraseña
  const handleCompletePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);

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

  // Helper para autocompletar credenciales de prueba con un solo clic
  const handleQuickFill = (role: 'admin' | 'instructor' | 'aprendiz') => {
    setActiveTab('login');
    setLoginError(null);
    if (role === 'admin') {
      const p = profiles.find(x => x.rol === 'admin') || { cedula: '1098765432', password: 'admin' };
      setLoginIdentifier(p.cedula);
      setLoginPassword(p.password || 'admin');
    } else if (role === 'instructor') {
      const p = profiles.find(x => x.rol === 'instructor') || { cedula: '1098765433', password: 'sena' };
      setLoginIdentifier(p.cedula);
      setLoginPassword(p.password || 'sena');
    } else {
      const p = profiles.find(x => x.rol === 'aprendiz') || { cedula: '1098765434', password: 'sena' };
      setLoginIdentifier(p.cedula);
      setLoginPassword(p.password || 'sena');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* BARRA SUPERIOR CON BOTÓN DE REGRESO Y SELECTOR DE TEMA */}
      {/* ========================================================================= */}
      <header className="w-full py-3.5 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                id="btn-back-to-landing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#39A900] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Portal</span>
              </button>
            )}
            <SenaLogo size="sm" subtext="Autenticación Institucional" />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="dropdown" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Acceso Seguro GDHC
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONTENEDOR PRINCIPAL: ARQUITECTURA ELEVADA DE DOS PANELES */}
      {/* ========================================================================= */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors">
          
          {/* ===================================================================== */}
          {/* PANEL IZQUIERDO (BRANDING INSTITUCIONAL Y CREDENCIALES DE PRUEBA) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#00324D] via-[#002236] to-[#001724] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Luces decorativas sutiles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39A900]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              {/* Badge institucional */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-[11px] font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-[#39A900] animate-pulse"></span>
                <span>Servicio Nacional de Aprendizaje</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Gestión de Horarios y Centros
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Plataforma oficial para la programación de ambientes de formación, validación temporal de colisiones <code className="text-emerald-400 font-mono text-xs">OVERLAPS</code> y coordinación de carga lectiva.
              </p>

              {/* Indicadores de Seguridad y Resiliencia */}
              <div className="mt-6 space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#39A900] shrink-0" />
                  <span>Validación estricta sin dobles asignaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39A900] shrink-0" />
                  <span>Carga masiva .xlsx con rollback selectivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#39A900] shrink-0" />
                  <span>Sincronización en tiempo real para aprendices</span>
                </div>
              </div>
            </div>

            {/* Selector Rápido de Cuentas de Demostración */}
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Acceso Rápido de Prueba</span>
                <span className="text-[10px] text-emerald-400 font-medium">1 clic</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="p-2 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-bold text-white truncate">Admin</div>
                  <div className="text-[9px] text-slate-400 truncate">Coord.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('instructor')}
                  className="p-2 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <Briefcase className="w-4 h-4 text-blue-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-bold text-white truncate">Instructor</div>
                  <div className="text-[9px] text-slate-400 truncate">Docente</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('aprendiz')}
                  className="p-2 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <GraduationCap className="w-4 h-4 text-teal-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-bold text-white truncate">Aprendiz</div>
                  <div className="text-[9px] text-slate-400 truncate">Alumno</div>
                </button>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* PANEL DERECHO (FORMULARIO DINÁMICO DE ACCESO / ACTIVACIÓN / RECUPERACIÓN) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            
            <div>
              {/* Selector de Pestañas con micro-animación y diseño refinado */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  id="tab-btn-login"
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-[#39A900]" />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('register');
                    setRegError(null);
                    setRegSuccess(null);
                  }}
                  id="tab-btn-register"
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Activar Cuenta</span>
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
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'recovery'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recuperar</span>
                </button>
              </div>

              {/* ==================== VISTA: INICIAR SESIÓN ==================== */}
              {activeTab === 'login' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Bienvenido al Sistema
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ingresa tu número de identificación o correo institucional registrado.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{loginError}</div>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Número de Documento o Correo
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={e => setLoginIdentifier(e.target.value)}
                          placeholder="Ej: 1098765432 o aprendiz@sena.edu.co"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                          className="text-[11px] text-[#00324D] dark:text-blue-400 hover:text-[#39A900] dark:hover:text-[#39A900] font-semibold hover:underline cursor-pointer"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>

                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      id="btn-login-submit"
                      className="w-full py-3 px-4 bg-[#39A900] hover:bg-[#2d8500] active:bg-[#226d00] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50 mt-2"
                    >
                      {loginLoading ? (
                        <span>Verificando credenciales...</span>
                      ) : (
                        <>
                          <span>Ingresar al Sistema GDHC</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setRegError(null);
                      }}
                      className="text-xs text-[#39A900] hover:underline font-semibold cursor-pointer"
                    >
                      ¿Eres nuevo o no has activado tu cuenta? Haz clic aquí
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== VISTA: ACTIVAR CUENTA ==================== */}
              {activeTab === 'register' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Activar Cuenta Institucional
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Verifica tu documento precargado por el centro para definir tu contraseña personal.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{regError}</div>
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed font-semibold">{regSuccess}</div>
                    </div>
                  )}

                  {/* PASO 1: Ingreso de Cédula */}
                  {regStep === 1 && (
                    <form onSubmit={handleCheckCedula} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Número de Cédula de Ciudadanía
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={regCedula}
                            onChange={e => setRegCedula(e.target.value)}
                            placeholder="Ingresa tu número de documento sin puntos"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            autoFocus
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading}
                        id="btn-verify-cedula"
                        className="w-full py-3 px-4 bg-[#00324D] hover:bg-[#002236] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {regLoading ? (
                          <span>Consultando base de datos...</span>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Verificar Documento en el Centro</span>
                          </>
                        )}
                      </button>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        💡 Si fuiste incluido en las listas de formación del SENA, tus datos ya están precargados y listos para ser activados.
                      </div>
                    </form>
                  )}

                  {/* PASO 2: Confirmación de Datos y Creación de Contraseña */}
                  {regStep === 2 && foundProfile && (
                    <form onSubmit={handleCompleteRegistration} className="space-y-4 animate-in fade-in">
                      <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Identidad Confirmada</span>
                        </div>
                        <div className="text-xs text-slate-900 dark:text-white font-bold pl-5.5">
                          {foundProfile.nombre_completo}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-5.5 flex items-center gap-2">
                          <span className="capitalize font-medium text-emerald-700 dark:text-emerald-400">
                            {foundProfile.rol === 'instructor' ? 'Instructor de Formación' : 'Aprendiz SENA'}
                          </span>
                          <span>•</span>
                          <span>CC {foundProfile.cedula}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            value={regEmail}
                            onChange={e => setRegEmail(e.target.value)}
                            placeholder="tu_correo@soy.sena.edu.co"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Teléfono Móvil (Opcional)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={regTelefono}
                            onChange={e => setRegTelefono(e.target.value)}
                            placeholder="Ej: 3101234567"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Crea tu Contraseña
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            placeholder="Mínimo 4 caracteres"
                            className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            required
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Confirma tu Contraseña
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regConfirmPassword}
                            onChange={e => setRegConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={regLoading}
                          id="btn-complete-register"
                          className="flex-1 py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {regLoading ? (
                            <span>Activando cuenta...</span>
                          ) : (
                            <>
                              <span>Completar Activación</span>
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
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-[#39A900]" />
                      <span>Recuperar Contraseña</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Valida tu documento y correo registrado para establecer una nueva clave.
                    </p>
                  </div>

                  {recError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{recError}</div>
                    </div>
                  )}

                  {recSuccess && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed font-semibold">{recSuccess}</div>
                    </div>
                  )}

                  {/* PASO 1: Validación de Documento y Correo */}
                  {recStep === 1 && (
                    <form onSubmit={handleCheckRecoveryIdentity} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Número de Documento
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={recCedula}
                            onChange={e => setRecCedula(e.target.value)}
                            placeholder="Ingresa tu documento sin puntos"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Correo Electrónico Registrado
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            value={recEmail}
                            onChange={e => setRecEmail(e.target.value)}
                            placeholder="ejemplo@soy.sena.edu.co"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={recLoading}
                        id="btn-recovery-verify-id"
                        className="w-full py-3 px-4 bg-[#00324D] hover:bg-[#002236] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {recLoading ? (
                          <span>Verificando identidad...</span>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Verificar Datos</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* PASO 2: Nueva Contraseña */}
                  {recStep === 2 && recFoundProfile && (
                    <form onSubmit={handleCompletePasswordRecovery} className="space-y-4 animate-in fade-in">
                      <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-1">
                        <div className="text-xs text-slate-900 dark:text-white font-bold">
                          {recFoundProfile.nombre_completo}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          CC {recFoundProfile.cedula} • {recFoundProfile.rol.toUpperCase()}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type={showRecPassword ? 'text' : 'password'}
                            value={recNewPassword}
                            onChange={e => setRecNewPassword(e.target.value)}
                            placeholder="Mínimo 4 caracteres"
                            className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            required
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowRecPassword(!showRecPassword)}
                            className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showRecPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Confirma tu Nueva Contraseña
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type={showRecPassword ? 'text' : 'password'}
                            value={recConfirmPassword}
                            onChange={e => setRecConfirmPassword(e.target.value)}
                            placeholder="Repite tu nueva clave"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#39A900] focus:border-transparent transition-all outline-hidden text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRecStep(1)}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={recLoading}
                          id="btn-recovery-submit"
                          className="flex-1 py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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

                  <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setRecError(null);
                        setRecSuccess(null);
                      }}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a Iniciar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer institucional del panel derecho */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>SENA Regional • Sistema GDHC</span>
              <span>Protegido por RLS y HTTPS</span>
            </div>

          </div>

        </div>
      </main>

      {/* Pie de página mínimo */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Servicio Nacional de Aprendizaje SENA • Horarios y Centros de Formación
      </footer>
    </div>
  );
};
