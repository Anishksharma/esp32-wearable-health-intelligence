import React from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { useAlertStore } from '../../store/useAlertStore';
import { Modal } from './Modal';
import { Printer, ShieldCheck, Heart, Droplet, Thermometer } from 'lucide-react';

export const PrintReportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const currentPacket = useHealthStore((state) => state.currentPacket);
  const deviceInfo = useHealthStore((state) => state.deviceInfo);
  const historicalRecords = useHealthStore((state) => state.historicalRecords);
  const alerts = useAlertStore((state) => state.alerts);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PRINTABLE HEALTH & OBSERVATION SUMMARY REPORT"
      subtitle="DOCUMENT FORMATTING // NON-DIAGNOSTIC TELEMETRY LOGS"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-[#F4F1E9]">
        {/* Print button bar */}
        <div className="flex justify-end gap-2 pb-3 border-b border-[#34342B]">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] font-mono text-xs font-bold uppercase transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Send to System Printer</span>
          </button>
        </div>

        {/* Printable Document Sheet Preview */}
        <div className="p-6 bg-[#0B0B0A] border border-[#34342B] space-y-6 text-xs font-mono">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-[#34342B] pb-4">
            <div>
              <h2 className="font-heading text-2xl uppercase tracking-widest text-[#FF8A24]">
                ESP32 WEARABLE HEALTH MONITORING REPORT
              </h2>
              <p className="text-[#A6A69A] mt-1">
                SYSTEM: OBSIDIAN HEALTH INTELLIGENCE PLATFORM v2.4
              </p>
            </div>
            <div className="text-right text-[#A6A69A]">
              <div>GENERATED: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</div>
              <div>DEVICE ID: {deviceInfo.device_id}</div>
              <div>FIRMWARE: {deviceInfo.firmware_version}</div>
            </div>
          </div>

          {/* Educational Disclaimer Banner */}
          <div className="p-3 bg-[#171714] border border-[#FFB547] text-[#FFB547] text-[11px] leading-relaxed">
            <strong>NOTICE:</strong> This document contains engineering telemetry recorded from an experimental ESP32 microcontroller prototype. It is non-clinical and has NOT been validated for medical diagnosis or clinical treatment monitoring.
          </div>

          {/* Vitals Summary Table */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm uppercase text-[#F4F1E9]">
              CURRENT PHYSIOLOGICAL VITALS SNAPSHOT
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#171714] border border-[#34342B]">
                <span className="text-[#6B6B5F] block uppercase">PULSE RATE</span>
                <span className="text-2xl font-bold text-[#FF8A24]">{currentPacket.heart_rate_bpm} BPM</span>
                <span className="text-[10px] text-[#A6A69A] block mt-1">MAX30100 Optical</span>
              </div>
              <div className="p-3 bg-[#171714] border border-[#34342B]">
                <span className="text-[#6B6B5F] block uppercase">BLOOD OXYGENATION</span>
                <span className="text-2xl font-bold text-[#B6F23A]">{currentPacket.spo2_percent}%</span>
                <span className="text-[10px] text-[#A6A69A] block mt-1">SpO2 Pulse Oximetry</span>
              </div>
              <div className="p-3 bg-[#171714] border border-[#34342B]">
                <span className="text-[#6B6B5F] block uppercase">PERIPHERAL SKIN TEMP</span>
                <span className="text-2xl font-bold text-[#FFB547]">{currentPacket.temperature_c.toFixed(1)} °C</span>
                <span className="text-[10px] text-[#A6A69A] block mt-1">DS18B20 1-Wire Digital</span>
              </div>
            </div>
          </div>

          {/* Incident Alert Logs */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm uppercase text-[#F4F1E9]">
              OBSERVED ALERT INCIDENTS ({alerts.length})
            </h4>
            <table className="w-full text-left border-collapse border border-[#34342B]">
              <thead>
                <tr className="bg-[#171714] text-[#6B6B5F] border-b border-[#34342B]">
                  <th className="p-2">SEVERITY</th>
                  <th className="p-2">TIMESTAMP</th>
                  <th className="p-2">SENSOR</th>
                  <th className="p-2">READING / LIMIT</th>
                  <th className="p-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23231D]">
                {alerts.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td className="p-2 text-[#FF8A24] font-bold">{a.severity}</td>
                    <td className="p-2 text-[#A6A69A]">{a.timestamp.slice(0, 19)}</td>
                    <td className="p-2">{a.sensor_name}</td>
                    <td className="p-2">{a.reading} {a.unit} (lim: {a.threshold})</td>
                    <td className="p-2 text-[#54E38E]">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#34342B] flex items-center justify-between text-[10px] text-[#6B6B5F]">
            <span>OBSIDIAN // ESP32 WEARABLE EMBEDDED SYSTEM</span>
            <span>END OF HEALTH MONITORING TELEMETRY REPORT</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
