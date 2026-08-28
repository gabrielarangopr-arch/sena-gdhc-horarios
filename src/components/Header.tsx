import React, { useState } from 'react';
import { 
  Calendar, 
  Bell, 
  Database, 
  UserCheck, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Shield,
  GraduationCap,
  Briefcase,
  LogOut
} from 'lucide-react';
import { Profile, Notificacion } from '../types';
import { NotificationPopover } from './NotificationPopover';
import { SupabaseConfigModal } from './SupabaseConfigModal';

interface HeaderProps {
  currentUser: Profile;
  profiles: Profile[];
  onSelectUser: (user: Profile) => void;
  onLogout: () => void;
  notificaciones: Notificacion[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  profiles,
  onSelectUser,
  onLogout,
  notificaciones,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onResetData,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return {
          label: 'Administrador GDHC',
          icon: <Shield className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-[#00324D] text-white',
        };
      case 'instructor':
        return {
          label: 'Instructor',
          icon: <Briefcase className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-[#39A900] text-white',
        };
      case 'aprendiz':
        return {
          label: 'Aprendiz',
          icon: <GraduationCap className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-[#0288D1] text-white',
        };
      default:
        return {
          label: rol,
          icon: null,
          bg: 'bg-gray-700 text-white',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.rol);

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40 shadow-xs">
      {/* Top Banner Institucional SENA */}
      <div className="bg-[#00324D] text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#39A900] animate-pulse"></span>
          <span className="font-semibold tracking-wide">SERVICIO NACIONAL DE APRENDIZAJE — SENA</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-200">Sistema GDHC v2.0 Production-Ready</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 hidden sm:inline">Motor de Reglas OVERLAPS Activo</span>
          <button
            onClick={() => setShowDbModal(true)}
            className="flex items-center space-x-1 text-[#b5dcfe] hover:text-white transition-colors cursor-pointer"
            title="Ver conexión y script SQL para Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="underline decoration-dotted">Supabase / PostgreSQL</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          {/* Institutional SENA Emblem */}
          <div className="w-10 h-10 rounded-md bg-[#39A900] flex items-center justify-center text-white font-bold shadow-xs">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L19.5 8 12 11.2 4.5 8 12 4.8zM4 9.5l7 3.1v7.4l-7-3.5V9.5zm9 10.5v-7.4l7-3.1v7l-7 3.5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#00324D] tracking-tight">
                GDHC <span className="text-[#39A900]">SENA</span>
              </h1>
              <span className="text-xs bg-[#e9f1df] text-[#226d00] font-semibold px-2 py-0.5 rounded-full">
                Horarios & Centros
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              Gestión de Horarios y Disponibilidad de Centros de Formación
            </p>
          </div>
        </div>

        {/* Right Actions: Role Switcher & Notifications */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Reset Data */}
          <button
            onClick={onResetData}
            title="Restablecer datos iniciales de prueba"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors hidden md:flex items-center text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1 text-gray-500" />
            <span>Reiniciar Datos</span>
          </button>

          {/* Notifications Center Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-[#00324D] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Notificaciones del Sistema"
              id="btn-notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#D32F2F] rounded-full border-2 border-white animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer/Popover */}
            {showNotifications && (
              <NotificationPopover
                notificaciones={notificaciones}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={onMarkNotificationRead}
                onMarkAllAsRead={onMarkAllNotificationsRead}
              />
            )}
          </div>

          {/* User Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 bg-[#F5F5F5] hover:bg-[#eaeaea] border border-[#E0E0E0] rounded-md transition-all cursor-pointer text-left"
              id="btn-user-switcher"
            >
              <div className="w-7 h-7 rounded-full bg-[#00324D] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.nombre_completo.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-[#212121] leading-tight truncate max-w-[150px]">
                  {currentUser.nombre_completo}
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-[#E0E0E0] py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-[#00324D] uppercase tracking-wider">
                    Usuarios Registrados en el Sistema
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Cambiar de cuenta activa
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {profiles.map(p => {
                    const isCurrent = p.id === currentUser.id;
                    const rBadge = getRoleBadge(p.rol);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectUser(p);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-[#f5fcea] font-semibold text-[#226d00]' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            p.rol === 'admin' ? 'bg-[#00324D] text-white' :
                            p.rol === 'instructor' ? 'bg-[#39A900] text-white' : 'bg-[#0288D1] text-white'
                          }`}>
                            {p.nombre_completo.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="font-medium truncate">{p.nombre_completo}</div>
                            <div className="text-[10px] text-gray-400">CC: {p.cedula}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${rBadge.bg}`}>
                          {p.rol.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-gray-100 px-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 rounded flex items-center space-x-2 transition-colors cursor-pointer font-bold"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Cerrar Sesión (Ir al Login)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Logout Button */}
          <button
            onClick={onLogout}
            title="Cerrar sesión actual y volver al portal de login"
            className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors hidden lg:flex items-center text-xs font-semibold cursor-pointer border border-transparent hover:border-red-200"
          >
            <LogOut className="w-4 h-4 mr-1 text-red-600" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Supabase Config / SQL Script Modal */}
      {showDbModal && <SupabaseConfigModal onClose={() => setShowDbModal(false)} />}
    </header>
  );
};
