/**
 * GDHC SENA — Sistema de Gestión de Horarios y Disponibilidad de Centros
 * Implementación de TRD v2.0 Production-Ready y PRD
 * Cláusula OVERLAPS en PostgreSQL / Supabase, Carga Masiva y Loop Engineering
 */

import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import { Profile, Horario, Programa, Ambiente, Notificacion } from './types';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { AdminDashboard } from './components/AdminDashboard';
import { InstructorView } from './components/InstructorView';
import { AprendizView } from './components/AprendizView';
import { CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sena_gdhc_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  // Toast / Status Message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = useCallback(() => {
    const profs = db.getProfiles();
    const progs = db.getProgramas();
    const ambs = db.getAmbientes();
    const hors = db.getHorarios();
    const currentId = db.getCurrentUserId();

    setProfiles(profs);
    setProgramas(progs);
    setAmbientes(ambs);
    setHorarios(hors);

    const activeProfile = profs.find(p => p.id === currentId) || profs[0];
    setCurrentUser(activeProfile);

    // Cargar notificaciones del usuario actual o globales
    const notifs = db.getNotificaciones(activeProfile?.id);
    setNotificaciones(notifs);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejo de inicio de sesión desde el portal
  const handleLogin = (user: Profile) => {
    try {
      sessionStorage.setItem('sena_gdhc_logged_in', 'true');
    } catch {
      // ignore
    }
    db.setCurrentUserId(user.id);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setNotificaciones(db.getNotificaciones(user.id));
    showToast(`Sesión iniciada como ${user.nombre_completo} (${user.rol.toUpperCase()})`, 'success');
  };

  // Manejo de cierre de sesión
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('sena_gdhc_logged_in');
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
    showToast('Has cerrado la sesión correctamente.', 'info');
  };

  // Cambiar persona / rol de usuario directamente desde el Header
  const handleSelectUser = (user: Profile) => {
    db.setCurrentUserId(user.id);
    setCurrentUser(user);
    setNotificaciones(db.getNotificaciones(user.id));
    showToast(`Cambiaste a la vista de ${user.nombre_completo} (${user.rol.toUpperCase()})`, 'info');
  };

  // Notificaciones: Marcar como leída con persistencia sincronizada
  const handleMarkNotificationRead = (id: string) => {
    db.markNotificationAsRead(id);
    if (currentUser) {
      setNotificaciones(db.getNotificaciones(currentUser.id));
    }
  };

  const handleMarkAllNotificationsRead = () => {
    if (currentUser) {
      db.markAllNotificationsAsRead(currentUser.id);
      setNotificaciones(db.getNotificaciones(currentUser.id));
      showToast('Todas las notificaciones fueron marcadas como leídas.', 'success');
    }
  };

  // Restablecer datos iniciales de prueba
  const handleResetData = () => {
    if (confirm('¿Restablecer la base de datos a los valores iniciales institucionales del SENA?')) {
      db.resetToSeed();
      loadData();
      showToast('Base de datos restablecida con datos semilla del SENA.', 'success');
    }
  };

  // Asignar Horario Manual
  const handleCreateHorario = async (horarioData: Omit<Horario, 'id' | 'created_at'>): Promise<boolean> => {
    const result = db.createHorario(horarioData);
    if (!result.success) {
      showToast(result.error || 'Error al guardar el horario.', 'error');
      return false;
    }

    loadData();
    showToast('Horario asignado exitosamente y notificaciones disparadas.', 'success');
    return true;
  };

  // Actualizar Horario
  const handleUpdateHorario = async (id: string, updates: Partial<Horario>): Promise<boolean> => {
    const result = db.updateHorario(id, updates);
    if (!result.success) {
      showToast(result.error || 'Error al actualizar el horario.', 'error');
      return false;
    }

    loadData();
    showToast('Horario actualizado y notificaciones enviadas.', 'success');
    return true;
  };

  // Eliminar Horario
  const handleDeleteHorario = (id: string) => {
    db.deleteHorario(id);
    loadData();
    showToast('Asignación de horario eliminada.', 'info');
  };

  // Inserción de Carga Masiva (Bucle de Decisión Parcial)
  const handleBatchInsertHorarios = (validHorarios: Array<Omit<Horario, 'id' | 'created_at'>>) => {
    const res = db.batchInsertHorarios(validHorarios);
    loadData();
    showToast(`Carga Masiva Exitosa: Se insertaron ${res.insertedCount} bloques de horario válidos.`, 'success');
  };

  // Renderizar Portal de Inicio de Sesión si la sesión está cerrada
  if (!isLoggedIn) {
    return <LoginView profiles={profiles.length > 0 ? profiles : db.getProfiles()} onLogin={handleLogin} />;
  }

  if (!currentUser || profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center p-6 bg-white rounded-md shadow-xs border border-[#E0E0E0]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#39A900] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#00324D]">Iniciando GDHC SENA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#212121] flex flex-col font-sans">
      {/* Institutional Header */}
      <Header
        currentUser={currentUser}
        profiles={profiles}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
        notificaciones={notificaciones}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onResetData={handleResetData}
      />

      {/* Floating Alert / Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <div
            className={`p-3.5 rounded-md shadow-lg border text-xs font-semibold flex items-center space-x-2.5 max-w-md ${
              toast.type === 'error'
                ? 'bg-[#D32F2F] text-white border-[#b71c1c]'
                : toast.type === 'info'
                ? 'bg-[#00324D] text-white border-[#001e30]'
                : 'bg-[#226D00] text-white border-[#185200]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            ) : toast.type === 'info' ? (
              <ShieldCheck className="w-4 h-4 text-[#39A900] shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#39A900] shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white p-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Role-Based Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.rol === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            profiles={profiles}
            programas={programas}
            ambientes={ambientes}
            horarios={horarios}
            onRefreshData={loadData}
            onCreateHorario={handleCreateHorario}
            onUpdateHorario={handleUpdateHorario}
            onDeleteHorario={handleDeleteHorario}
            onBatchInsertHorarios={handleBatchInsertHorarios}
          />
        )}

        {currentUser.rol === 'instructor' && (
          <InstructorView
            instructor={currentUser}
            horarios={horarios}
            programas={programas}
            ambientes={ambientes}
            profiles={profiles}
          />
        )}

        {currentUser.rol === 'aprendiz' && (
          <AprendizView
            aprendiz={currentUser}
            horarios={horarios}
            programas={programas}
            ambientes={ambientes}
            profiles={profiles}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-[#E0E0E0] py-4 mt-8 text-center text-xs text-gray-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#00324D]">SENA GDHC v2.0</span>
            <span>—</span>
            <span>Gestión de Horarios y Disponibilidad de Centros</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-gray-400">
            <span>Servicio Nacional de Aprendizaje</span>
            <span>•</span>
            <span>Motor OVERLAPS & Supabase Relational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
