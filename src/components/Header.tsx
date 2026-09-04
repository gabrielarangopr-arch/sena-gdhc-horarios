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
          icon: <Shield className="w-3.5 h-3.5 text-emerald-700" />,
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          avatarBg: 'bg-[#00324D] text-white',
        };
      case 'instructor':
        return {
          label: 'Instructor',
          icon: <Briefcase className="w-3.5 h-3.5 text-[#2563eb]" />,
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
          avatarBg: 'bg-[#39A900] text-white',
        };
      case 'aprendiz':
      default:
        return {
          label: 'Aprendiz',
          icon: <GraduationCap className="w-3.5 h-3.5 text-teal-700" />,
          badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Oficial SENA y Subtítulo Amigable */}
          <div className="flex items-center gap-3">
            <SenaLogo size="md" subtext="Gestión de Horarios y Ambientes" />
          </div>

          {/* Acciones de la barra superior */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                id="btn-notifications-toggle"
                title="Notificaciones"
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#39A900]" />
                <span className="hidden sm:inline">Manuales</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDocsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Documentación GDHC
                  </div>

                  <button
                    onClick={() => {
                      setShowDocsDropdown(false);
                      onOpenExcelGuide?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                    <span>Guía Tablas Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDocsDropdown(false);
                      onOpenUserManual?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <BookMarked className="w-4 h-4 text-blue-600" />
                    <span>Manual de Usuario</span>
                  </button>

                  {currentUser.rol === 'admin' && (
                    <button
                      onClick={() => {
                        setShowDocsDropdown(false);
                        onOpenTechnicalManual?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Code2 className="w-4 h-4 text-indigo-600" />
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
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer text-left"
              >
                <div className={`w-8 h-8 rounded-full ${roleConfig.avatarBg} flex items-center justify-center text-xs font-bold shadow-2xs`}>
                  {initials}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {currentUser.nombre_completo}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
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
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className={`w-11 h-11 rounded-full ${roleConfig.avatarBg} flex items-center justify-center text-sm font-bold shadow-xs shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.nombre_completo}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Detalles del Perfil */}
                  <div className="py-3 space-y-2 text-xs text-slate-600 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Documento:
                      </span>
                      <span className="font-semibold text-slate-800">CC {currentUser.cedula}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Rol:
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${roleConfig.badgeClass}`}>
                        {roleConfig.label}
                      </span>
                    </div>

                    {currentUser.telefono && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Teléfono:
                        </span>
                        <span className="font-medium text-slate-700">{currentUser.telefono}</span>
                      </div>
                    )}

                    {currentUser.especialidad && (
                      <div className="pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 block">Especialidad:</span>
                        <span className="text-slate-600">{currentUser.especialidad}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Estado de cuenta:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-100"
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
              className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Salir</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
