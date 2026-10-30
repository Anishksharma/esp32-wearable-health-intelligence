import React from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { AlertTriangle, AlertCircle, Info, X, Check } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const alerts = useAlertStore((state) => state.alerts);
  const acknowledgeAlert = useAlertStore((state) => state.acknowledgeAlert);
  const setSelectedAlertModal = useAlertStore((state) => state.setSelectedAlertModal);

  // Show only up to 3 most recent active alerts as toasts
  const activeToasts = alerts.filter((a) => a.status === 'ACTIVE').slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {activeToasts.map((alert) => {
        const isCritical = alert.severity === 'CRITICAL';
        const isWarning = alert.severity === 'WARNING';

        const borderColor = isCritical ? 'border-[#FF4545]' : isWarning ? 'border-[#FFB547]' : 'border-[#34342B]';
        const bgGlow = isCritical ? 'bg-[#171714] shadow-critical-glow' : 'bg-[#171714] shadow-lg';
        const iconColor = isCritical ? 'text-[#FF4545]' : isWarning ? 'text-[#FFB547]' : 'text-[#FF8A24]';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto border ${borderColor} ${bgGlow} p-3.5 transition-all duration-300 transform translate-y-0`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isCritical ? (
                  <AlertCircle className={`w-5 h-5 ${iconColor} animate-pulse`} />
                ) : isWarning ? (
                  <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
                ) : (
                  <Info className={`w-5 h-5 ${iconColor}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold tracking-wider uppercase ${iconColor}`}>
                    {alert.severity} // {alert.sensor_name}
                  </span>
                  <span className="text-[10px] font-mono text-[#6B6B5F]">
                    {alert.timestamp.split('T')[1]?.slice(0, 8)}
                  </span>
                </div>

                <p className="text-xs text-[#F4F1E9] font-sans line-clamp-2 leading-relaxed">
                  {alert.explanation}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#34342B]">
                  <button
                    onClick={() => setSelectedAlertModal(alert)}
                    className="text-[11px] font-mono text-[#FF8A24] hover:underline"
                  >
                    View Details & Action &rarr;
                  </button>

                  <button
                    onClick={() => acknowledgeAlert(alert.id, 'User')}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-[#54E38E] transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
