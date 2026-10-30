import { create } from 'zustand';
import { TelemetryPacket, SensorSignalQuality, DeviceConnectionStatus } from '../types/telemetry';
import { useHealthStore } from './useHealthStore';
import { useAlertStore } from './useAlertStore';
import { AlertEngine } from '../services/alertEngine';
import { WifiService } from '../services/wifiService';

export interface SimulationScenario {
  id: number;
  name: string;
  category: 'PHYSIOLOGICAL' | 'HARDWARE_FAULT' | 'NETWORK' | 'RECOVERY';
  description: string;
  expectedHeartRate: number;
  expectedSpO2: number;
  expectedTemperature: number;
  signalQuality: SensorSignalQuality;
  connectionStatus: DeviceConnectionStatus;
  packetDropRate: number; // 0 to 1
}

export const SCENARIOS: SimulationScenario[] = [
  {
    id: 1,
    name: '1. Normal Resting Vitals',
    category: 'PHYSIOLOGICAL',
    description: 'Subject resting calmly. Baseline heart rate 72 BPM, SpO2 98%, temperature 36.6°C with excellent optical signal.',
    expectedHeartRate: 72,
    expectedSpO2: 98,
    expectedTemperature: 36.6,
    signalQuality: 'EXCELLENT',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0,
  },
  {
    id: 2,
    name: '2. Elevated Heart Rate (Tachycardia)',
    category: 'PHYSIOLOGICAL',
    description: 'Acute tachycardia spike or exertion: HR jumps to 138 BPM, triggering critical warning thresholds.',
    expectedHeartRate: 138,
    expectedSpO2: 97,
    expectedTemperature: 37.1,
    signalQuality: 'GOOD',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0,
  },
  {
    id: 3,
    name: '3. Low SpO2 Hypoxemia Scenario',
    category: 'PHYSIOLOGICAL',
    description: 'Peripheral oxygen saturation plunges to 88%, breaching the critical 90% threshold for immediate warning.',
    expectedHeartRate: 92,
    expectedSpO2: 88,
    expectedTemperature: 36.4,
    signalQuality: 'GOOD',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0,
  },
  {
    id: 4,
    name: '4. Fever / Hyperthermia Scenario',
    category: 'PHYSIOLOGICAL',
    description: 'Pyrexia progression: skin surface temperature reaches 39.2°C, accompanied by compensatory pulse 106 BPM.',
    expectedHeartRate: 106,
    expectedSpO2: 96,
    expectedTemperature: 39.2,
    signalQuality: 'GOOD',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0,
  },
  {
    id: 5,
    name: '5. Poor Optical Signal (Motion Artifact)',
    category: 'HARDWARE_FAULT',
    description: 'Subject walking or loose wrist strap causes optical noise. Signal quality drops to POOR with erratic waveform.',
    expectedHeartRate: 84,
    expectedSpO2: 93,
    expectedTemperature: 36.5,
    signalQuality: 'POOR',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0.1,
  },
  {
    id: 6,
    name: '6. MAX30100 Optical Disconnection',
    category: 'HARDWARE_FAULT',
    description: 'Sensor finger detached or I2C bus loss. Heart rate and SpO2 register 0 with DISCONNECTED sensor status.',
    expectedHeartRate: 0,
    expectedSpO2: 0,
    expectedTemperature: 36.5,
    signalQuality: 'DISCONNECTED',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0,
  },
  {
    id: 7,
    name: '7. ESP32 Wi-Fi Disconnection',
    category: 'NETWORK',
    description: 'Access Point out of range. Telemetry ingestion freezes, leading to heartbeat timeout watchdog trigger.',
    expectedHeartRate: 74,
    expectedSpO2: 98,
    expectedTemperature: 36.5,
    signalQuality: 'GOOD',
    connectionStatus: 'DISCONNECTED',
    packetDropRate: 1.0,
  },
  {
    id: 8,
    name: '8. Bluetooth Low Energy Disconnection',
    category: 'NETWORK',
    description: 'GATT connection dropped unexpectedly. Status reflects DISCONNECTED over BLE channel.',
    expectedHeartRate: 74,
    expectedSpO2: 98,
    expectedTemperature: 36.5,
    signalQuality: 'GOOD',
    connectionStatus: 'DISCONNECTED',
    packetDropRate: 1.0,
  },
  {
    id: 9,
    name: '9. Missing Telemetry / 50% Packet Drops',
    category: 'NETWORK',
    description: 'Severely degraded RF environment or high latency leading to sequence gaps and 50% packet drop rate.',
    expectedHeartRate: 76,
    expectedSpO2: 98,
    expectedTemperature: 36.6,
    signalQuality: 'FAIR',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0.5,
  },
  {
    id: 10,
    name: '10. Recovery to Healthy Baseline',
    category: 'RECOVERY',
    description: 'Post-intervention stabilization: HR recovers to 72 BPM, SpO2 99%, Temp 36.6°C, all alerts clear.',
    expectedHeartRate: 72,
    expectedSpO2: 99,
    expectedTemperature: 36.6,
    signalQuality: 'EXCELLENT',
    connectionStatus: 'CONNECTED',
    packetDropRate: 0,
  },
];

export interface SimulationState {
  isRunning: boolean;
  simulationSpeed: number; // 0.5, 1, 2, 5, 10
  selectedScenarioId: number;
  timerId: any;
  tickCount: number;

  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: number) => void;
  selectScenario: (scenarioId: number) => void;
  dispatchTick: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: true, // starts auto-simulating in demo mode
  simulationSpeed: 1,
  selectedScenarioId: 1,
  timerId: null,
  tickCount: 0,

  startSimulation: () => {
    const { isRunning, timerId } = get();
    if (isRunning && timerId) return;

    const intervalMs = Math.round(1500 / get().simulationSpeed);
    const id = setInterval(() => {
      get().dispatchTick();
    }, intervalMs);

    set({ isRunning: true, timerId: id });
  },

  pauseSimulation: () => {
    const { timerId } = get();
    if (timerId) clearInterval(timerId);
    set({ isRunning: false, timerId: null });
  },

  resumeSimulation: () => {
    get().startSimulation();
  },

  resetSimulation: () => {
    get().pauseSimulation();
    set({ selectedScenarioId: 1, tickCount: 0 });
    get().dispatchTick();
    get().startSimulation();
  },

  setSpeed: (speed) => {
    const wasRunning = get().isRunning;
    get().pauseSimulation();
    set({ simulationSpeed: speed });
    if (wasRunning) {
      get().startSimulation();
    }
  },

  selectScenario: (scenarioId) => {
    set({ selectedScenarioId: scenarioId });
    get().dispatchTick();
  },

  dispatchTick: () => {
    const { selectedScenarioId, tickCount } = get();
    const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];
    const healthState = useHealthStore.getState();

    // Check packet drop rate for scenario 7, 8, 9
    if (scenario.packetDropRate > 0 && Math.random() < scenario.packetDropRate) {
      // Packet dropped
      healthState.setConnectionStatus('DISCONNECTED');
      set((s) => ({ tickCount: s.tickCount + 1 }));
      return;
    }

    // Determine values: check if manual override is active
    let hr = scenario.expectedHeartRate;
    let spo2 = scenario.expectedSpO2;
    let temp = scenario.expectedTemperature;
    let quality = scenario.signalQuality;

    if (healthState.manualOverrideActive) {
      hr = healthState.manualOverrides.heartRate;
      spo2 = healthState.manualOverrides.spo2;
      temp = healthState.manualOverrides.temperature;
      quality = healthState.manualOverrides.signalQuality;
    } else if (hr > 0) {
      // Natural subtle physiological jitter (sinus arrhythmia)
      const jitter = Math.sin(tickCount / 2) * 2;
      hr = Math.round(hr + jitter);
      temp = Number((temp + (Math.cos(tickCount / 4) * 0.05)).toFixed(2));
    }

    const packet: TelemetryPacket = {
      device_id: 'ESP32_WEARABLE_01',
      timestamp: new Date().toISOString(),
      heart_rate_bpm: hr,
      spo2_percent: spo2,
      temperature_c: temp,
      temperature_sensor_type: 'DS18B20',
      signal_quality: quality,
      battery_voltage: 4.02,
      connection_status: scenario.connectionStatus,
      data_source: 'DEMO',
      packet_sequence: tickCount,
      rssi_dbm: scenario.connectionStatus === 'CONNECTED' ? -56 : -95,
    };

    // Ingest into health store
    healthState.ingestPacket(packet);

    // Evaluate alerts
    const thresholds = useAlertStore.getState().thresholds;
    const alerts = AlertEngine.evaluate(packet, thresholds);
    if (alerts.length > 0) {
      useAlertStore.getState().addAlerts(alerts);
    }

    // Broadcast on bus
    WifiService.broadcastPacket(packet);

    set((s) => ({ tickCount: s.tickCount + 1 }));
  },
}));
