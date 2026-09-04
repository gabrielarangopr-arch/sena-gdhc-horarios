import React, { useState } from 'react';
import { Bell, Check, CheckCheck, X, AlertTriangle, Calendar, Info } from 'lucide-react';
import { Notificacion } from '../types';

interface NotificationPopoverProps {
  notificaciones: Notificacion[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notificaciones,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notificaciones.filter(n => {
    if (filter === 'unread') return !n.leido;
    return true;
  });

  const unreadTotal = notificaciones.filter(n => !n.leido).length;

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return `Hace ${diffDays} d`;
    } catch {
      return '';
    }
  };

  const getIcon = (tipo?: string) => {
    switch (tipo) {
      case 'horario_nuevo':
        return <Calendar className="w-4 h-4 text-[#39A900]" />;
      case 'alerta':
      case 'horario_modificado':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'conflicto_resuelto':
        return <CheckCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#39A900]" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Centro de Notificaciones</h3>
          {unreadTotal > 0 && (
            <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">
              {unreadTotal} nuevas
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Action */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#00324D] dark:bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#39A900] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            No Leídas ({unreadTotal})
          </button>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Marcar todas</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No hay notificaciones {filter === 'unread' ? 'sin leer' : 'registradas'}.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => onMarkAsRead(notif.id)}
              className={`p-3.5 transition-colors cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 ${
                !notif.leido
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-[#39A900]'
                  : 'bg-white dark:bg-slate-900 border-l-4 border-l-transparent opacity-85'
              }`}
            >
              <div className="mt-0.5 shrink-0 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                {getIcon(notif.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs ${!notif.leido ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    {notif.titulo}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    {formatRelativeTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                  {notif.mensaje}
                </p>
                {!notif.leido && (
                  <div className="mt-1 flex items-center text-[10px] text-[#39A900] dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39A900] inline-block mr-1"></span>
                    Haga clic para marcar como leída
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-[10px] text-center text-slate-400 dark:text-slate-500">
        Persistencia sincronizada con Supabase / Microservicio de Alertas
      </div>
    </div>
  );
};
