import { create } from 'zustand';
import { HealthAlert, AlertThresholds, AlertFilterOptions, AlertSeverity } from '../types/alerts';
import { DEFAULT_THRESHOLDS } from '../services/alertEngine';

export interface AlertState {
  alerts: HealthAlert[];
  unreadCount: number;
  thresholds: AlertThresholds;
  filterOptions: AlertFilterOptions;
  soundEnabled: boolean;
  selectedAlertModal?: HealthAlert;

  // Actions
  addAlerts: (newAlerts: HealthAlert[]) => void;
  acknowledgeAlert: (alertId: string, ackBy?: string) => void;
  resolveAlert: (alertId: string) => void;
  markAllAsRead: () => void;
  updateThresholds: (thresholds: Partial<AlertThresholds>) => void;
  setFilterOptions: (options: Partial<AlertFilterOptions>) => void;
  setSelectedAlertModal: (alert?: HealthAlert) => void;
  toggleSound: () => void;
  playAlertTone: (severity: AlertSeverity) => void;
}

const INITIAL_ALERTS: HealthAlert[] = [
  {
    id: 'ALT_INIT_001',
    device_id: 'ESP32_WEARABLE_01',
    sensor_name: 'MAX30100 Heart Rate',
    reading: 104,
    unit: 'BPM',
    threshold: 100,
    timestamp: new Date(Date.now() - 420000).toISOString(),
    severity: 'WARNING',
    explanation: 'Transient elevated resting heart rate detected during calibration cycle.',
    recommended_action: 'Advise subject to remain still for optical sensor calibration baseline.',
    status: 'RESOLVED',
    acknowledged_at: new Date(Date.now() - 360000).toISOString(),
    resolved_at: new Date(Date.now() - 300000).toISOString(),
  },
];

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: INITIAL_ALERTS,
  unreadCount: 0,
  thresholds: DEFAULT_THRESHOLDS,
  filterOptions: {
    severity: 'ALL',
    status: 'ALL',
    sensor: '',
    search: '',
  },
  soundEnabled: true,
  selectedAlertModal: undefined,

  addAlerts: (newAlerts) => {
    if (newAlerts.length === 0) return;

    // Check highest severity for sound
    const hasCritical = newAlerts.some((a) => a.severity === 'CRITICAL');
    const hasWarning = newAlerts.some((a) => a.severity === 'WARNING');
    if (hasCritical) get().playAlertTone('CRITICAL');
    else if (hasWarning) get().playAlertTone('WARNING');

    set((state) => ({
      alerts: [...newAlerts, ...state.alerts].slice(0, 300),
      unreadCount: state.unreadCount + newAlerts.length,
    }));
  },

  acknowledgeAlert: (alertId, ackBy = 'Operator') => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'ACKNOWLEDGED' as const,
              acknowledged_at: new Date().toISOString(),
              acknowledged_by: ackBy,
            }
          : a
      ),
    }));
  },

  resolveAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'RESOLVED' as const,
              resolved_at: new Date().toISOString(),
            }
          : a
      ),
    }));
  },

  markAllAsRead: () => set({ unreadCount: 0 }),

  updateThresholds: (partial) => {
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        ...partial,
      },
    }));
  },

  setFilterOptions: (partial) => {
    set((state) => ({
      filterOptions: {
        ...state.filterOptions,
        ...partial,
      },
    }));
  },

  setSelectedAlertModal: (alert) => set({ selectedAlertModal: alert }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  playAlertTone: (severity) => {
    const { soundEnabled } = get();
    if (!soundEnabled) return;

    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (severity === 'CRITICAL') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15); // A4
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        } else if (severity === 'WARNING') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.25);
        }
      }
    } catch {
      // Audio autoplay policy catch
    }
  },
}));
