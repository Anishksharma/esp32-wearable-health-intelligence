import React, { useState } from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { HealthAlert, AlertSeverity } from '../../types/alerts';
import { Bell, ShieldAlert, Check, CheckCheck, Filter, Search, Sliders, ExternalLink } from 'lucide-react';
import { SeverityBadge } from '../common/Badge';

export const AlertsView: React.FC = () => {
  const alerts = useAlertStore((state) => state.alerts);
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);
  const markAllAsRead = useAlertStore((state) => state.markAllAsRead);
  const thresholds = useAlertStore((state) => state.thresholds);
  const updateThresholds = useAlertStore((state) => state.updateThresholds);
  const setSelectedAlertModal = useAlertStore((state) => state.setSelectedAlertModal);

  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Threshold form local state
  const [editThresholds, setEditThresholds] = useState(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        a.sensor_name.toLowerCase().includes(term) ||
        a.explanation.toLowerCase().includes(term) ||
        a.id.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(editThresholds);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF8A24]" />
            EARLY WARNING & INCIDENT NOTIFICATION ENGINE
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            DETERMINISTIC RULE MONITORING // DUPLICATE SUPPRESSION & ACTION LOGGING
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-xs font-mono text-[#54E38E] transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>MARK ALL AS READ</span>
        </button>
      </div>

      {/* Threshold Configurator Panel */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#34342B] pb-2">
          <Sliders className="w-4 h-4 text-[#FF8A24]" />
          <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
            CONFIGURABLE VITAL SIGN ALERT THRESHOLDS
          </h3>
        </div>

        <form onSubmit={handleSaveThresholds} className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-[#A6A69A] block mb-1">HR WARNING HIGH (&gt; BPM):</label>
            <input
              type="number"
              value={editThresholds.heartRateHighWarning}
              onChange={(e) => setEditThresholds({ ...editThresholds, heartRateHighWarning: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#A6A69A] block mb-1">HR CRITICAL HIGH (&gt; BPM):</label>
            <input
              type="number"
              value={editThresholds.heartRateHighCritical}
              onChange={(e) => setEditThresholds({ ...editThresholds, heartRateHighCritical: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#A6A69A] block mb-1">SPO2 WARNING LOW (&lt; %):</label>
            <input
              type="number"
              value={editThresholds.spo2LowWarning}
              onChange={(e) => setEditThresholds({ ...editThresholds, spo2LowWarning: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#A6A69A] block mb-1">SPO2 CRITICAL LOW (&lt; %):</label>
            <input
              type="number"
              value={editThresholds.spo2LowCritical}
              onChange={(e) => setEditThresholds({ ...editThresholds, spo2LowCritical: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#A6A69A] block mb-1">TEMP WARNING HIGH (&gt; °C):</label>
            <input
              type="number"
              step="0.1"
              value={editThresholds.temperatureHighWarning}
              onChange={(e) => setEditThresholds({ ...editThresholds, temperatureHighWarning: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#A6A69A] block mb-1">TEMP CRITICAL HIGH (&gt; °C):</label>
            <input
              type="number"
              step="0.1"
              value={editThresholds.temperatureHighCritical}
              onChange={(e) => setEditThresholds({ ...editThresholds, temperatureHighCritical: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#A6A69A] block mb-1">COOLDOWN SECONDS:</label>
            <input
              type="number"
              value={editThresholds.poorSignalCooldownSeconds}
              onChange={(e) => setEditThresholds({ ...editThresholds, poorSignalCooldownSeconds: Number(e.target.value) })}
              className="w-full bg-[#10100E] border border-[#34342B] p-2 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] font-mono text-xs uppercase font-bold transition-colors"
            >
              {savedSuccess ? 'SAVED OK' : 'UPDATE THRESHOLDS'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#171714] border border-[#34342B] p-3 text-xs font-mono">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-[#6B6B5F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by sensor, message, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#10100E] border border-[#34342B] pl-9 pr-3 py-1.5 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-[#10100E] border border-[#34342B] p-1.5 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL ONLY</option>
            <option value="WARNING">WARNING ONLY</option>
            <option value="INFO">INFO ONLY</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#10100E] border border-[#34342B] p-1.5 text-[#F4F1E9] focus:border-[#FF8A24] focus:outline-none"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#171714] border border-[#34342B] overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#10100E] text-[#6B6B5F] border-b border-[#34342B]">
              <th className="p-3">SEVERITY</th>
              <th className="p-3">TIMESTAMP</th>
              <th className="p-3">SENSOR</th>
              <th className="p-3">READING / THRESHOLD</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23231D]">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#6B6B5F]">
                  No matching alert notifications found.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#20201B]/50 transition-colors">
                  <td className="p-3">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="p-3 text-[#A6A69A]">
                    {alert.timestamp.replace('T', ' ').slice(0, 19)}
                  </td>
                  <td className="p-3 font-semibold text-[#F4F1E9]">{alert.sensor_name}</td>
                  <td className="p-3">
                    <span className="text-[#FF8A24] font-bold">{alert.reading} {alert.unit}</span>
                    <span className="text-[#6B6B5F] ml-1.5">(limit: {alert.threshold})</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 border text-[10px] ${
                        alert.status === 'ACTIVE'
                          ? 'bg-[#FF4545]/20 border-[#FF4545] text-[#FF4545]'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-[#FFB547]/20 border-[#FFB547] text-[#FFB547]'
                          : 'bg-[#54E38E]/20 border-[#54E38E] text-[#54E38E]'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAlertModal(alert)}
                      className="px-2 py-1 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-[#A6A69A] hover:text-[#F4F1E9] text-[11px]"
                    >
                      Details
                    </button>
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id, 'Operator')}
                        className="px-2 py-1 bg-[#FFB547]/15 hover:bg-[#FFB547]/30 border border-[#FFB547]/50 text-[#FFB547] text-[11px]"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-2 py-1 bg-[#54E38E]/15 hover:bg-[#54E38E]/30 border border-[#54E38E]/50 text-[#54E38E] text-[11px]"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
