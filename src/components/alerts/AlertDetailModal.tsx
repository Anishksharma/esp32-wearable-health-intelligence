import React from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { Modal } from '../common/Modal';
import { SeverityBadge } from '../common/Badge';
import { ShieldAlert, Check, X, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export const AlertDetailModal: React.FC = () => {
  const selectedAlert = useAlertStore((state) => state.selectedAlertModal);
  const setSelectedAlertModal = useAlertStore((state) => state.setSelectedAlertModal);
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const resolveAlert = useAlertStore((state) => state.resolveAlert);

  if (!selectedAlert) return null;

  const isCritical = selectedAlert.severity === 'CRITICAL';

  return (
    <Modal
      isOpen={!!selectedAlert}
      onClose={() => setSelectedAlertModal(undefined)}
      title={`ALERT DETAILS // ${selectedAlert.id}`}
      subtitle={`DEVICE: ${selectedAlert.device_id} | SENSOR: ${selectedAlert.sensor_name}`}
      maxWidth="xl"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Severity Banner */}
        <div
          className={`p-3.5 border flex items-center justify-between ${
            isCritical
              ? 'bg-[#FF4545]/15 border-[#FF4545] text-[#FF4545]'
              : 'bg-[#FFB547]/15 border-[#FFB547] text-[#FFB547]'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCritical ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-bold text-sm uppercase">
              {selectedAlert.severity} THRESHOLD VIOLATION
            </span>
          </div>
          <SeverityBadge severity={selectedAlert.severity} />
        </div>

        {/* Vital Reading vs Threshold Table */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#10100E] border border-[#34342B]">
          <div>
            <span className="text-[#6B6B5F] block uppercase">RECORDED READING:</span>
            <span className="text-xl font-bold text-[#FF8A24]">
              {selectedAlert.reading} {selectedAlert.unit}
            </span>
          </div>

          <div>
            <span className="text-[#6B6B5F] block uppercase">VIOLATED LIMIT:</span>
            <span className="text-xl font-bold text-[#FF4545]">
              {selectedAlert.threshold}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-[#23231D] text-[#A6A69A]">
            <span>TIMESTAMP: {selectedAlert.timestamp.replace('T', ' ')}</span>
          </div>
        </div>

        {/* Technical Explanation */}
        <div>
          <span className="text-[#6B6B5F] uppercase block mb-1">INCIDENT EXPLANATION:</span>
          <div className="p-3 bg-[#10100E] border border-[#34342B] font-sans text-xs text-[#F4F1E9] leading-relaxed">
            {selectedAlert.explanation}
          </div>
        </div>

        {/* Non-Diagnostic Action Advisory */}
        <div>
          <span className="text-[#FF8A24] uppercase block mb-1">RECOMMENDED FIRST-AID / PROCEDURAL ACTION:</span>
          <div className="p-3 bg-[#FF8A24]/10 border border-[#FF8A24]/40 font-sans text-xs text-[#F4F1E9] leading-relaxed">
            {selectedAlert.recommended_action}
          </div>
        </div>

        {/* Audit Timestamps */}
        <div className="p-2.5 bg-[#10100E] border border-[#23231D] text-[11px] text-[#6B6B5F] space-y-1">
          <div>STATUS: <strong className="text-[#F4F1E9]">{selectedAlert.status}</strong></div>
          {selectedAlert.acknowledged_at && (
            <div>ACKNOWLEDGED: {selectedAlert.acknowledged_at} (by {selectedAlert.acknowledged_by || 'User'})</div>
          )}
          {selectedAlert.resolved_at && (
            <div>RESOLVED: {selectedAlert.resolved_at}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#34342B]">
          {selectedAlert.status === 'ACTIVE' && (
            <button
              onClick={() => {
                acknowledgeAlert(selectedAlert.id, 'User Operator');
                setSelectedAlertModal(undefined);
              }}
              className="px-4 py-2 bg-[#FFB547]/15 hover:bg-[#FFB547]/30 border border-[#FFB547] text-[#FFB547] font-mono text-xs font-bold uppercase transition-colors"
            >
              Acknowledge Alert
            </button>
          )}

          {selectedAlert.status !== 'RESOLVED' && (
            <button
              onClick={() => {
                resolveAlert(selectedAlert.id);
                setSelectedAlertModal(undefined);
              }}
              className="px-4 py-2 bg-[#54E38E]/20 hover:bg-[#54E38E]/30 border border-[#54E38E] text-[#54E38E] font-mono text-xs font-bold uppercase transition-colors"
            >
              Resolve Alert
            </button>
          )}

          <button
            onClick={() => setSelectedAlertModal(undefined)}
            className="px-4 py-2 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-[#A6A69A] hover:text-[#F4F1E9] font-mono text-xs uppercase transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
};
