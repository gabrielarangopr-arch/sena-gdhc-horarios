import React, { useState } from 'react';
import { 
  Shield, 
  Briefcase, 
  GraduationCap, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { Profile } from '../types';

interface LoginViewProps {
  profiles: Profile[];
  onLogin: (user: Profile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ profiles, onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = identifier.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMsg('Por favor ingrese su Cédula de Ciudadanía o Correo Institucional.');
      return;
    }

    // Buscar por cédula o correo
    const found = profiles.find(
      p => p.cedula.trim() === cleanInput || p.email.trim().toLowerCase() === cleanInput
    );

    if (!found) {
      setErrorMsg(`No se encontró ningún usuario con documento o correo "${identifier}". Verifique e intente nuevamente.`);
      return;
    }

    onLogin(found);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans">
      {/* Top Institutional Header Bar */}
      <header className="bg-[#00324D] text-white border-b-4 border-[#39A900] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* SENA Logo Symbol */}
            <div className="w-10 h-10 rounded-full bg-[#39A900] flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white">
              S
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
                SENA • GDHC
              </h1>
              <p className="text-[11px] text-[#A5D6A7] font-medium">
                Gestión de Horarios y Disponibilidad de Centros
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-[#002236] px-3 py-1.5 rounded-full border border-gray-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#39A900] animate-pulse"></span>
            <span className="text-gray-300">Motor OVERLAPS & PostgreSQL Supabase</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-lg shadow-xl border border-[#E0E0E0] overflow-hidden">
          
          {/* Left Column: Institutional Info */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#00324D] to-[#001D2D] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#39A900]/20 border border-[#39A900]/40 rounded-full text-[#A5D6A7] text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Portal de Autenticación GDHC</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Sistema Institucional de Gestión de Horarios
                </h2>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Plataforma oficial para la coordinación y consulta de programación académica, control de ambientes y asignación horaria.
                </p>
              </div>

              {/* Roles Summary */}
              <div className="space-y-2.5 pt-2">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-md text-xs">
                  <div className="font-bold text-[#39A900] flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Administrador / Coordinador</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Matriz de horarios, control de cruces OVERLAPS, carga masiva Excel, gestión de fichas, ambientes y usuarios.
                  </p>
                </div>

                <div className="p-2.5 bg-white/5 border border-white/10 rounded-md text-xs">
                  <div className="font-bold text-[#A5D6A7] flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Instructor de Formación</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Programación semanal de clases, cómputo de carga horaria (horas/semana) y exportación a Excel.
                  </p>
                </div>

                <div className="p-2.5 bg-white/5 border border-white/10 rounded-md text-xs">
                  <div className="font-bold text-[#90CAF9] flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Aprendiz en Formación</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Consulta del horario por ficha curricular, instructores responsables, laboratorios asignados y descarga.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
              <span>SENA • GDHC v2.0</span>
              <span>Regional & Centros TIC</span>
            </div>
          </div>

          {/* Right Column: Clean Login Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="border-b border-gray-200 pb-3 mb-5">
                <h3 className="text-lg font-bold text-[#00324D]">
                  Iniciar Sesión Institucional
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ingrese con su Cédula de Ciudadanía o Correo Registrado
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Cédula de Ciudadanía o Correo Institucional
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="Ej: 1020405060 o gabrielarangopr@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900] focus:outline-hidden"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Contraseña Institucional
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900] focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#39A900] hover:bg-[#226d00] text-white text-xs font-bold rounded flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md mt-2"
                >
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Footer Notice */}
            <div className="text-[11px] text-gray-400 text-center pt-2">
              Validación relacional con Cláusula PostgreSQL OVERLAPS y Supabase RLS
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-[#E0E0E0] py-3 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Servicio Nacional de Aprendizaje — SENA • GDHC</span>
          <span>Gestión de Horarios y Disponibilidad de Centros v2.0</span>
        </div>
      </footer>
    </div>
  );
};
