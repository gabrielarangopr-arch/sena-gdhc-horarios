import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  AlertOctagon, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Profile, Ambiente, Programa, Horario, BulkImportSummary } from '../types';
import { excelService } from '../services/excelService';
import { getDiaNombre } from '../services/overlapEngine';
import { ExcelGuideModal } from './ExcelGuideModal';

interface BulkScheduleUploadModalProps {
  existingHorarios?: Horario[];
  profiles: Profile[];
  ambientes: Ambiente[];
  programas: Programa[];
  onBatchInsert?: (validHorarios: Array<Omit<Horario, 'id' | 'created_at'>>) => void;
  onClose: () => void;
  isOpen?: boolean;
}

export const BulkScheduleUploadModal: React.FC<BulkScheduleUploadModalProps> = ({
  existingHorarios = [],
  profiles,
  ambientes,
  programas,
  onBatchInsert,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showExcelGuide, setShowExcelGuide] = useState(false);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setSummary(null);
    setIsProcessing(true);

    try {
      // Parsear y ejecutar Dry-Run de validación en memoria con OVERLAPS
      const result = await excelService.parseExcelHorarios(
        file,
        profiles,
        programas,
        ambientes,
        existingHorarios
      );
      setSummary(result);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al procesar el archivo Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Opción A: Inserción Parcial (Inserta solo filas válidas sin cruces)
  const handleExecutePartial = () => {
    if (!summary) return;
    const validHorarios = summary.results
      .filter(r => r.isValid && r.parsedHorario)
      .map(r => r.parsedHorario!);

    if (onBatchInsert) {
      onBatchInsert(validHorarios);
    }
    onClose();
  };

  // Opción B: Cancelación Atómica (Rollback completo)
  const handleRollback = () => {
    setSelectedFile(null);
    setSummary(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="bg-[#00324D] dark:bg-slate-950 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#39A900]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Carga Masiva de Horarios (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                Validación de Seguridad PreToolUse + Detección de Cruces OVERLAPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Action Bar: Download Template */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl">
            <div className="text-xs text-emerald-900 dark:text-emerald-300">
              <span className="font-bold">Formato estándar de horarios SENA: </span>
              Valida cruces de ambiente e instructor automáticamente.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExcelGuide(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#39A900]" />
                <span>Ver Guía de Columnas</span>
              </button>
              <button
                type="button"
                onClick={() => excelService.downloadHorariosTemplate()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Plantilla .xlsx</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#39A900] bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-950/40'
            }`}
          >
            <UploadCloud className="w-10 h-10 mx-auto text-[#00324D] dark:text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionarlo
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Formatos soportados: .xlsx, .xls, .csv (Máximo 10 MB)
            </p>

            <label className="mt-3 inline-block">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <span className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-[#00324D] dark:border-slate-600 text-[#00324D] dark:text-slate-100 hover:bg-[#00324D] hover:text-white dark:hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs inline-block">
                Examinar Archivo
              </span>
            </label>

            {selectedFile && (
              <div className="mt-3 text-xs text-[#00324D] dark:text-emerald-400 font-medium flex items-center justify-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="p-4 text-center text-xs text-[#00324D] dark:text-slate-200 flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#39A900]" />
              <span>Ejecutando validaciones de seguridad PreToolUse y matriz OVERLAPS...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error de Procesamiento: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Dry-Run Results Matrix */}
          {summary && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Filas</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{summary.totalRows}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Válidas</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary.validCount}</div>
                </div>
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                  <div className="text-xs text-red-700 dark:text-red-300 font-medium">Con Cruces</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{summary.conflictCount}</div>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900">
                  <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">Con Errores</div>
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-400">{summary.errorCount}</div>
                </div>
              </div>

              {/* Detailed Decision Warning if conflicts exist */}
              {summary.errorCount > 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 mb-1">
                    <AlertOctagon className="w-4 h-4 text-[#D32F2F] dark:text-red-400" />
                    <span>Bucle de Decisión Requerido (Loop Engineering):</span>
                  </div>
                  <p>
                    Se detectaron {summary.errorCount} filas con inconsistencias o cruces de horario. Puedes elegir realizar una <strong>Carga Parcial</strong> (insertando solo las {summary.validCount} filas válidas) o ejecutar una <strong>Cancelación Atómica (Rollback)</strong> para no alterar la base de datos.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#39A900] dark:text-emerald-400 shrink-0" />
                  <div>
                    <strong>¡Validación 100% Exitosa!</strong> Todas las {summary.validCount} filas cumplen las restricciones de instructor, ambiente y ficha sin ningún cruce OVERLAPS.
                  </div>
                </div>
              )}

              {/* Rows Status Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800/90 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  Detalle Fila por Fila (Dry-Run en Servidor)
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {summary.results.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 flex items-start justify-between gap-3 ${
                        res.isValid
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-red-50/50 dark:bg-red-950/30'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="font-mono font-bold text-slate-400 dark:text-slate-500 w-8">
                          #{res.rowNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            CC {res.rawData.cedula_instructor} | Ficha {res.rawData.codigo_ficha} | {res.rawData.numero_ambiente}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {getDiaNombre(Number(res.rawData.dia_semana))} ({res.rawData.hora_inicio} - {res.rawData.hora_fin}) — {res.rawData.competencia}
                          </div>
                          {res.errors.length > 0 && (
                            <div className="mt-1 text-[11px] text-[#D32F2F] dark:text-red-400 font-medium space-y-0.5">
                              {res.errors.map((err, eIdx) => (
                                <div key={eIdx}>• {err}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {res.isValid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                            VÁLIDA
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300">
                            CON CONFLICTO
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Decision Loop Controls) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {summary && (
            <div className="flex items-center space-x-2">
              {summary.errorCount > 0 && (
                <button
                  type="button"
                  onClick={handleRollback}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Opción B: Descartar todas las filas y cancelar la transacción"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cancelar Todo (Rollback)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExecutePartial}
                disabled={summary.validCount === 0}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                  summary.validCount > 0
                    ? 'bg-[#39A900] hover:bg-[#226d00]'
                    : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  {summary.errorCount > 0
                    ? `Carga Parcial (${summary.validCount} filas válidas)`
                    : `Confirmar e Insertar (${summary.validCount} filas)`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showExcelGuide && (
        <ExcelGuideModal
          initialTab="horarios"
          onClose={() => setShowExcelGuide(false)}
        />
      )}
    </div>
  );
};
