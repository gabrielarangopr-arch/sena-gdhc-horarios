import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  GraduationCap, 
  Briefcase, 
  LogOut, 
  User, 
  Mail, 
  CreditCard,
  ChevronDown,
  CheckCircle2,
  Phone,
  BookOpen,
  FileSpreadsheet,
  BookMarked,
  Code2
} from 'lucide-react';
import { Profile, Notificacion } from '../types';
import { NotificationPopover } from './NotificationPopover';
import { SenaLogo } from './SenaLogo';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentUser: Profile;
  profiles: Profile[];
  onSelectUser: (user: Profile) => void;
  onLogout: () => void;
  notificaciones: Notificacion[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onResetData?: () => void;
  onRefreshData?: () => void;
  onOpenExcelGuide?: () => void;
  onOpenUserManual?: () => void;
  onOpenTechnicalManual?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  notificaciones,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenExcelGuide,
  onOpenUserManual,
  onOpenTechnicalManual,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDocsDropdown, setShowDocsDropdown] = useState(false);

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  const getRoleConfig = (rol: string) => {
    switch (rol) {
      case 'admin':
        return {
          label: 'Administrador',
          icon: <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />,
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
          avatarBg: 'bg-[#00324D] text-white',
        };
      case 'instructor':
        return {
          label: 'Instructor',
          icon: <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
          avatarBg: 'bg-[#39A900] text-white',
        };
      case 'aprendiz':
      default:
        return {
          label: 'Aprendiz',
          icon: <GraduationCap className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />,
          badgeClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
          avatarBg: 'bg-teal-600 text-white',
        };
    }
  };

  const roleConfig = getRoleConfig(currentUser.rol);

  const initials = currentUser.nombre_completo
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'SE';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Oficial SENA y Subtítulo Amigable */}
          <div className="flex items-center gap-3">
            <SenaLogo size="md" subtext="Gestión de Horarios y Ambientes" />
          </div>

          {/* Acciones de la barra superior */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Selector de Modo Oscuro / Claro / Sistema */}
            <ThemeToggle variant="dropdown" />

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                id="btn-notifications-toggle"
                title="Notificaciones"
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <NotificationPopover
                  notificaciones={notificaciones}
                  onClose={() => setShowNotifications(false)}
                  onMarkAsRead={onMarkNotificationRead}
                  onMarkAllAsRead={onMarkAllNotificationsRead}
                />
              )}
            </div>

            {/* Menú de Manuales y Documentación */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDocsDropdown(!showDocsDropdown);
                  setShowNotifications(false);
                  setShowUserDropdown(false);
                }}
                id="btn-header-manuals-toggle"
                title="Manuales y Guías Oficiales"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#39A900]" />
                <span className="hidden sm:inline">Manuales</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDocsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Documentación GDHC
                  </div>

                  <button
                    onClick={() => {
                      setShowDocsDropdown(false);
                      onOpenExcelGuide?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-300 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                    <span>Guía Tablas Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDocsDropdown(false);
                      onOpenUserManual?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-900 dark:hover:text-blue-300 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Manual de Usuario</span>
                  </button>

                  {currentUser.rol === 'admin' && (
                    <button
                      onClick={() => {
                        setShowDocsDropdown(false);
                        onOpenTechnicalManual?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-900 dark:hover:text-indigo-300 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Manual Técnico (SQL)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Menú de Perfil Personal (Solo datos del usuario autenticado) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                id="btn-user-profile-menu"
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer text-left"
              >
                <div className={`w-8 h-8 rounded-full ${roleConfig.avatarBg} flex items-center justify-center text-xs font-bold shadow-2xs`}>
                  {initials}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {currentUser.nombre_completo}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${roleConfig.badgeClass}`}>
                      {roleConfig.icon}
                      {roleConfig.label}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Popover con Datos del Usuario Autenticado */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className={`w-11 h-11 rounded-full ${roleConfig.avatarBg} flex items-center justify-center text-sm font-bold shadow-xs shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.nombre_completo}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Detalles del Perfil */}
                  <div className="py-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Documento:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">CC {currentUser.cedula}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Rol:
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${roleConfig.badgeClass}`}>
                        {roleConfig.label}
                      </span>
                    </div>

                    {currentUser.telefono && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Teléfono:
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser.telefono}</span>
                      </div>
                    )}

                    {currentUser.especialidad && (
                      <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 block">Especialidad:</span>
                        <span className="text-slate-600 dark:text-slate-300">{currentUser.especialidad}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Estado de cuenta:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Activa
                      </span>
                    </div>
                  </div>

                  {/* Botón de Cerrar Sesión */}
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      id="btn-logout-dropdown"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors cursor-pointer border border-rose-100 dark:border-rose-900/60"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Directo Salir */}
            <button
              onClick={onLogout}
              id="btn-header-logout-direct"
              title="Cerrar sesión"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-rose-100 dark:hover:border-rose-900/60"
            >
              <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Salir</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
