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
        return <AlertTriangle className="w-4 h-4 text-[#ED6C02]" />;
      case 'conflicto_resuelto':
        return <CheckCheck className="w-4 h-4 text-[#00324D]" />;
      default:
        return <Info className="w-4 h-4 text-[#0288D1]" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-xl border border-[#E0E0E0] z-50 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="p-3 bg-[#F5F5F5] border-b border-[#E0E0E0] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#00324D]" />
          <h3 className="text-sm font-bold text-[#00324D]">Centro de Notificaciones</h3>
          {unreadTotal > 0 && (
            <span className="text-[11px] bg-[#D32F2F] text-white px-1.5 py-0.2 rounded-full font-bold">
              {unreadTotal} nuevas
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Action */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between text-xs bg-white">
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              filter === 'all' ? 'bg-[#00324D] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              filter === 'unread' ? 'bg-[#39A900] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            No Leídas ({unreadTotal})
          </button>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[#0288D1] hover:text-[#01579b] font-medium flex items-center space-x-1 hover:underline text-[11px]"
          >
            <Check className="w-3 h-3" />
            <span>Marcar todas</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No hay notificaciones {filter === 'unread' ? 'sin leer' : 'registradas'}.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => onMarkAsRead(notif.id)}
              className={`p-3 transition-colors cursor-pointer text-left hover:bg-gray-50 flex items-start space-x-3 ${
                !notif.leido ? 'bg-[#F0F7FF] border-l-4 border-l-[#0288D1]' : 'bg-white border-l-4 border-l-transparent opacity-80'
              }`}
            >
              <div className="mt-0.5 shrink-0 p-1.5 rounded-full bg-white border border-gray-200 shadow-2xs">
                {getIcon(notif.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs ${!notif.leido ? 'font-bold text-[#00324D]' : 'font-semibold text-gray-700'}`}>
                    {notif.titulo}
                  </h4>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {formatRelativeTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                  {notif.mensaje}
                </p>
                {!notif.leido && (
                  <div className="mt-1 flex items-center text-[10px] text-[#0288D1] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0288D1] inline-block mr-1"></span>
                    Haga clic para marcar como leída
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-gray-50 border-t border-[#E0E0E0] text-[10px] text-center text-gray-500">
        Persistencia sincronizada con Supabase / Microservicio de Alertas
      </div>
    </div>
  );
};
