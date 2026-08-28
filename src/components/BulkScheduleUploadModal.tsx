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

interface BulkScheduleUploadModalProps {
  horarios: Horario[];
  profiles: Profile[];
  ambientes: Ambiente[];
  programas: Programa[];
  onCommitPartial: (validHorarios: Array<Omit<Horario, 'id' | 'created_at'>>) => void;
  onClose: () => void;
}

export const BulkScheduleUploadModal: React.FC<BulkScheduleUploadModalProps> = ({
  horarios,
  profiles,
  ambientes,
  programas,
  onCommitPartial,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        horarios
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

    onCommitPartial(validHorarios);
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
      <div className="bg-white rounded-md shadow-2xl max-w-3xl w-full border border-[#E0E0E0] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#00324D] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#39A900]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Carga Masiva de Horarios (Excel / CSV)
              </h3>
              <p className="text-xs text-gray-300">
                Validación de Seguridad PreToolUse + Detección de Cruces OVERLAPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-sm hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Action Bar: Download Template */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#f5fcea] border border-[#becbb3] rounded-md">
            <div className="text-xs text-[#226d00]">
              <span className="font-bold">¿Necesitas el formato estándar? </span>
              Descarga la plantilla con encabezados y validaciones institucionales.
            </div>
            <button
              onClick={() => excelService.downloadHorariosTemplate()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#39A900] hover:bg-[#226d00] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla .xlsx</span>
            </button>
          </div>

          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#39A900] bg-[#f5fcea]'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <UploadCloud className="w-10 h-10 mx-auto text-[#00324D] mb-2 opacity-80" />
            <p className="text-xs font-semibold text-gray-700">
              Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionarlo
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
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
              <span className="px-3.5 py-1.5 bg-white border border-[#00324D] text-[#00324D] hover:bg-[#00324D] hover:text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                Examinar Archivo
              </span>
            </label>

            {selectedFile && (
              <div className="mt-3 text-xs text-[#00324D] font-medium flex items-center justify-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="p-4 text-center text-xs text-[#00324D] flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#39A900]" />
              <span>Ejecutando validaciones de seguridad PreToolUse y matriz OVERLAPS...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
                <div className="p-2.5 bg-gray-100 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 font-medium">Total Filas</div>
                  <div className="text-lg font-bold text-gray-800">{summary.totalRows}</div>
                </div>
                <div className="p-2.5 bg-[#f5fcea] rounded border border-[#becbb3]">
                  <div className="text-xs text-[#226d00] font-medium">Válidas</div>
                  <div className="text-lg font-bold text-[#226d00]">{summary.validCount}</div>
                </div>
                <div className="p-2.5 bg-[#FFEBEE] rounded border border-[#ffcdd2]">
                  <div className="text-xs text-[#D32F2F] font-medium">Con Cruces</div>
                  <div className="text-lg font-bold text-[#D32F2F]">{summary.conflictCount}</div>
                </div>
                <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
                  <div className="text-xs text-amber-800 font-medium">Con Errores</div>
                  <div className="text-lg font-bold text-amber-700">{summary.errorCount}</div>
                </div>
              </div>

              {/* Detailed Decision Warning if conflicts exist */}
              {summary.errorCount > 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800 mb-1">
                    <AlertOctagon className="w-4 h-4 text-[#D32F2F]" />
                    <span>Bucle de Decisión Requerido (Loop Engineering):</span>
                  </div>
                  <p>
                    Se detectaron {summary.errorCount} filas con inconsistencias o cruces de horario. Puedes elegir realizar una <strong>Carga Parcial</strong> (insertando solo las {summary.validCount} filas válidas) o ejecutar una <strong>Cancelación Atómica (Rollback)</strong> para no alterar la base de datos.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-[#f5fcea] border border-[#becbb3] rounded text-xs text-[#226d00] flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#39A900] shrink-0" />
                  <div>
                    <strong>¡Validación 100% Exitosa!</strong> Todas las {summary.validCount} filas cumplen las restricciones de instructor, ambiente y ficha sin ningún cruce OVERLAPS.
                  </div>
                </div>
              )}

              {/* Rows Status Table */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 border-b border-gray-200">
                  Detalle Fila por Fila (Dry-Run en Servidor)
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 text-xs">
                  {summary.results.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 flex items-start justify-between gap-3 ${
                        res.isValid ? 'bg-white' : 'bg-[#FFEBEE]/40'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="font-mono font-bold text-gray-400 w-8">
                          #{res.rowNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-800">
                            CC {res.rawData.cedula_instructor} | Ficha {res.rawData.codigo_ficha} | {res.rawData.numero_ambiente}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {getDiaNombre(Number(res.rawData.dia_semana))} ({res.rawData.hora_inicio} - {res.rawData.hora_fin}) — {res.rawData.competencia}
                          </div>
                          {res.errors.length > 0 && (
                            <div className="mt-1 text-[11px] text-[#D32F2F] font-medium space-y-0.5">
                              {res.errors.map((err, eIdx) => (
                                <div key={eIdx}>• {err}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {res.isValid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#e9f1df] text-[#226d00]">
                            VÁLIDA
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
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
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {summary && (
            <div className="flex items-center space-x-2">
              {summary.errorCount > 0 && (
                <button
                  type="button"
                  onClick={handleRollback}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
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
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white rounded shadow-xs transition-colors cursor-pointer ${
                  summary.validCount > 0
                    ? 'bg-[#39A900] hover:bg-[#226d00]'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
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
    </div>
  );
};
