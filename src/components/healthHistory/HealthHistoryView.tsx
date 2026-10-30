import React, { useState } from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { History, Download, Upload, Printer, FileText, Calendar, Filter } from 'lucide-react';
import { DataSourceBadge } from '../common/Badge';
import { DocumentParser } from '../../services/documentParser';

export const HealthHistoryView: React.FC<{ onOpenPrintReport?: () => void }> = ({ onOpenPrintReport }) => {
  const historicalRecords = useHealthStore((state) => state.historicalRecords);
  const importHistoryRecords = useHealthStore((state) => state.importHistoryRecords);
  const clearHistory = useHealthStore((state) => state.clearHistory);

  const [dateFilter, setDateFilter] = useState<'1h' | '24h' | '7d' | 'ALL'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [importStatus, setImportStatus] = useState<string>('');

  // Filter records
  const filteredRecords = historicalRecords.filter((rec) => {
    if (sourceFilter !== 'ALL' && rec.data_source !== sourceFilter) return false;
    if (dateFilter !== 'ALL') {
      const recTime = new Date(rec.timestamp).getTime();
      const now = Date.now();
      if (dateFilter === '1h' && now - recTime > 3600000) return false;
      if (dateFilter === '24h' && now - recTime > 86400000) return false;
      if (dateFilter === '7d' && now - recTime > 604800000) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    let csv = 'timestamp,device_id,heart_rate_bpm,spo2_percent,temperature_c,signal_quality,battery_voltage,data_source\n';
    historicalRecords.forEach((r) => {
      csv += `${r.timestamp},${r.device_id},${r.heart_rate_bpm},${r.spo2_percent},${r.temperature_c},${r.signal_quality},${r.battery_voltage || 3.9},${r.data_source || 'DEMO'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ESP32_HEALTH_HISTORY_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(historicalRecords, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ESP32_HEALTH_HISTORY_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import MicroSD CSV
  const handleMicroSdImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const raw = await DocumentParser.parseFile(file);
      if (raw.tableData && raw.tableData.rows.length > 0) {
        const imported = raw.tableData.rows.map((row, idx) => ({
          device_id: row.device_id || 'ESP32_SD_CARD',
          timestamp: row.timestamp || new Date(Date.now() - idx * 3000).toISOString(),
          heart_rate_bpm: Number(row.heart_rate_bpm || row.heart_rate || row.bpm || 72),
          spo2_percent: Number(row.spo2_percent || row.spo2 || 98),
          temperature_c: Number(row.temperature_c || row.temperature || 36.5),
          temperature_sensor_type: 'DS18B20' as const,
          signal_quality: (row.signal_quality || 'GOOD') as any,
          battery_voltage: Number(row.battery_voltage || 3.95),
          connection_status: 'CONNECTED' as const,
          data_source: 'SD_CARD' as const,
        }));

        importHistoryRecords(imported);
        setImportStatus(`Successfully ingested ${imported.length} records from MicroSD file '${file.name}'`);
      } else {
        setImportStatus('File parsed but no valid telemetry records discovered.');
      }
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <History className="w-5 h-5 text-[#FF8A24]" />
            HEALTH HISTORY & MICROSD ARCHIVE
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            CONTINUOUS OBSERVATION LOGS // CSV/JSON IMPORT & EXPORT PIPELINE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-xs font-mono text-[#F4F1E9] transition-colors"
          >
            <Download className="w-4 h-4 text-[#FF8A24]" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-xs font-mono text-[#F4F1E9] transition-colors"
          >
            <Download className="w-4 h-4 text-[#B6F23A]" />
            <span>EXPORT JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20201B] hover:bg-[#34342B] border border-[#FF8A24]/60 text-xs font-mono text-[#FF8A24] cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>IMPORT MICROSD</span>
            <input type="file" accept=".csv,.json" onChange={handleMicroSdImport} className="hidden" />
          </label>

          {onOpenPrintReport && (
            <button
              onClick={onOpenPrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] text-xs font-mono font-bold uppercase transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT REPORT</span>
            </button>
          )}
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-[#10100E] border border-[#FF8A24]/40 text-xs font-mono text-[#FF8A24]">
          {importStatus}
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171714] border border-[#34342B] p-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#FF8A24]" />
            <span className="text-[#A6A69A]">DATE RANGE:</span>
          </div>

          {(['1h', '24h', '7d', 'ALL'] as const).map((rng) => (
            <button
              key={rng}
              onClick={() => setDateFilter(rng)}
              className={`px-2 py-0.5 border ${
                dateFilter === rng
                  ? 'bg-[#FF8A24] text-[#0B0B0A] font-bold border-[#FF8A24]'
                  : 'bg-[#10100E] text-[#A6A69A] border-[#34342B]'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#A6A69A]">DATA PROVENANCE:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#10100E] border border-[#34342B] p-1 text-[#F4F1E9] focus:outline-none"
          >
            <option value="ALL">ALL SOURCES</option>
            <option value="LIVE_HARDWARE">LIVE HARDWARE ONLY</option>
            <option value="DEMO">SIMULATED DEMO</option>
            <option value="SD_CARD">MICROSD ARCHIVE</option>
          </select>
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="bg-[#171714] border border-[#34342B] overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#10100E] text-[#6B6B5F] border-b border-[#34342B]">
              <th className="p-3">RECORD TIMESTAMP</th>
              <th className="p-3">SOURCE</th>
              <th className="p-3">HEART RATE</th>
              <th className="p-3">SPO2 %</th>
              <th className="p-3">TEMPERATURE</th>
              <th className="p-3">SIGNAL</th>
              <th className="p-3">BATTERY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23231D]">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#6B6B5F]">
                  No historical records match the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.slice(0, 50).map((r, idx) => (
                <tr key={idx} className="hover:bg-[#20201B]/50">
                  <td className="p-3 text-[#A6A69A]">{r.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="p-3">
                    <DataSourceBadge source={r.data_source} />
                  </td>
                  <td className="p-3 text-[#FF8A24] font-bold">{r.heart_rate_bpm} BPM</td>
                  <td className="p-3 text-[#B6F23A] font-bold">{r.spo2_percent}%</td>
                  <td className="p-3 text-[#FFB547] font-bold">{r.temperature_c.toFixed(1)} °C</td>
                  <td className="p-3 text-[#F4F1E9]">{r.signal_quality}</td>
                  <td className="p-3 text-[#A6A69A]">{r.battery_voltage ? `${r.battery_voltage.toFixed(2)}V` : '--'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
