import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  FileCode, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { db } from '../services/db';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';

interface SupabaseConfigModalProps {
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'sql'>('status');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setUrl(cfg.url || '');
    setAnonKey(cfg.anonKey || '');
  }, []);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      saveSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
        connected: true,
        lastTested: new Date().toISOString(),
      });
    }
  };

  const handleSave = () => {
    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      connected: testResult?.success || false,
      lastTested: new Date().toISOString(),
    });
    onClose();
  };

  const sqlScript = db.generateSupabaseSQLScript();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-md shadow-2xl max-w-3xl w-full border border-[#E0E0E0] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#00324D] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#39A900] rounded text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Arquitectura Supabase / PostgreSQL (GDHC SENA)
              </h3>
              <p className="text-xs text-gray-300">
                Esquema Relacional, Cláusulas OVERLAPS y Seguridad RLS
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'status'
                ? 'border-[#39A900] text-[#00324D] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Conexión Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'sql'
                ? 'border-[#39A900] text-[#00324D] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Script SQL / DDL Schema (Supabase)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'status' ? (
            <div className="space-y-4">
              {/* Architecture Info Card */}
              <div className="p-3.5 bg-[#f5fcea] border border-[#becbb3] rounded-md text-[#226d00] space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#39A900]" />
                  <span>Motor Relacional Activo (PostgreSQL / Supabase Ready)</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Esta aplicación implementa las tablas relacionales de Supabase (<strong>profiles</strong>, <strong>programas</strong>, <strong>ambientes</strong>, <strong>horarios</strong>, <strong>notificaciones</strong>) y ejecuta en servidor la cláusula de control de concurrencia <strong>OVERLAPS</strong> para evitar cruces de instructores, ambientes y fichas.
                </p>
              </div>

              {/* Supabase Credentials Form */}
              <div className="border border-gray-200 rounded-md p-4 bg-white space-y-3">
                <h4 className="font-bold text-[#00324D] uppercase tracking-wider text-xs">
                  Parámetros de Conexión de Supabase (Opcional)
                </h4>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#39A900] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={e => setAnonKey(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#39A900] focus:outline-hidden font-mono"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting || !url || !anonKey}
                    className="px-3.5 py-1.5 bg-[#00324D] hover:bg-[#002236] text-white font-bold rounded flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Probando conexión...</span>
                      </>
                    ) : (
                      <>
                        <Server className="w-3.5 h-3.5 text-[#39A900]" />
                        <span>Probar Conexión</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded border flex items-start space-x-2 ${
                      testResult.success
                        ? 'bg-[#f5fcea] border-[#becbb3] text-[#226d00]'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-[#39A900] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        {testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}
                      </div>
                      <div>{testResult.message}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  Copia y pega este script en el <strong>SQL Editor</strong> de tu panel de Supabase:
                </span>
                <button
                  onClick={handleCopySQL}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white font-bold rounded transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] p-4 rounded-md overflow-x-auto max-h-96 leading-relaxed border border-gray-800">
                <pre>{sqlScript}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
          >
            Cerrar
          </button>
          {activeTab === 'status' && (
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#226d00] rounded shadow-xs"
            >
              Guardar Configuración
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
