import { create } from 'zustand';
import { 
  TelemetryPacket, 
  DeviceInfo, 
  SensorStatus, 
  ConnectionProtocol, 
  DeviceConnectionStatus 
} from '../types/telemetry';

export interface HealthState {
  currentPacket: TelemetryPacket;
  previousPacket?: TelemetryPacket;
  packetBuffer: TelemetryPacket[]; // Ring buffer of last 100 packets for live charts
  historicalRecords: TelemetryPacket[]; // Up to 5000 historical records
  deviceInfo: DeviceInfo;
  sensors: SensorStatus[];
  timeFilter: '1m' | '5m' | '15m' | '1h' | '24h';
  soundMuted: boolean;
  manualOverrideActive: boolean;
  manualOverrides: {
    heartRate: number;
    spo2: number;
    temperature: number;
    signalQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DISCONNECTED';
  };

  // Actions
  ingestPacket: (packet: TelemetryPacket) => void;
  setConnectionProtocol: (protocol: ConnectionProtocol) => void;
  setConnectionStatus: (status: DeviceConnectionStatus) => void;
  setTimeFilter: (filter: '1m' | '5m' | '15m' | '1h' | '24h') => void;
  toggleSound: () => void;
  setManualOverrides: (overrides: Partial<HealthState['manualOverrides']>) => void;
  toggleManualOverride: (active: boolean) => void;
  importHistoryRecords: (records: TelemetryPacket[]) => void;
  clearHistory: () => void;
}

const INITIAL_PACKET: TelemetryPacket = {
  device_id: 'ESP32_WEARABLE_01',
  timestamp: new Date().toISOString(),
  heart_rate_bpm: 74,
  spo2_percent: 98,
  temperature_c: 36.5,
  temperature_sensor_type: 'DS18B20',
  signal_quality: 'GOOD',
  battery_voltage: 4.02,
  connection_status: 'CONNECTED',
  data_source: 'DEMO',
  rssi_dbm: -58,
};

const INITIAL_DEVICE: DeviceInfo = {
  device_id: 'ESP32_WEARABLE_01',
  name: 'ESP32 Obsidian Health Monitor Node',
  connection_type: 'DEMO',
  connection_status: 'CONNECTED',
  ip_address: '192.168.1.144',
  mac_address: '24:6F:28:B1:C9:82',
  wifi_rssi: -58,
  ble_rssi: -64,
  ble_status: 'ADVERTISING',
  last_heartbeat: new Date().toISOString(),
  last_packet: INITIAL_PACKET,
  firmware_version: 'v2.4.1-obsidian',
  uptime_seconds: 1420,
  battery_voltage: 4.02,
  battery_percent: 88,
  packets_received: 142,
  packets_dropped: 1,
  error_logs: [],
};

const INITIAL_SENSORS: SensorStatus[] = [
  {
    id: 'sensor-max30100',
    name: 'MAX30100 Pulse Oximeter & Heart Rate',
    model: 'Maxim Integrated MAX30100',
    bus: 'I2C',
    addressOrPin: '0x57 (SDA:21, SCL:22)',
    status: 'OPERATIONAL',
    reading: '74 BPM / 98%',
    unit: 'BPM & %',
    signal_quality: 'GOOD',
    last_calibrated: '2026-10-28',
    notes: 'Photoplethysmography dual-LED (Red 660nm, IR 880nm)',
  },
  {
    id: 'sensor-ds18b20',
    name: 'DS18B20 Digital Body Temperature Probe',
    model: 'Maxim DS18B20 1-Wire',
    bus: '1-Wire',
    addressOrPin: 'GPIO 4 (4.7kΩ Pullup)',
    status: 'OPERATIONAL',
    reading: '36.5',
    unit: '°C',
    signal_quality: 'EXCELLENT',
    last_calibrated: '2026-10-25',
    notes: 'Direct skin contact thermal sensor. ±0.5°C accuracy from -10°C to +85°C',
  },
  {
    id: 'sensor-esp32-vsys',
    name: 'LiPo Battery Voltage Monitor',
    model: 'Internal ADC Voltage Divider',
    bus: 'Analog',
    addressOrPin: 'GPIO 35 (ADC1_CH7)',
    status: 'OPERATIONAL',
    reading: '4.02',
    unit: 'V',
    signal_quality: 'GOOD',
    notes: 'Scaled 1:2 resistor divider (100k / 100k)',
  },
];

// Generate initial buffer
const generateSeedBuffer = (): TelemetryPacket[] => {
  const buffer: TelemetryPacket[] = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const t = new Date(now - i * 3000).toISOString();
    buffer.push({
      device_id: 'ESP32_WEARABLE_01',
      timestamp: t,
      heart_rate_bpm: Math.round(72 + Math.sin(i / 3) * 4),
      spo2_percent: Math.min(100, Math.round(98 + (i % 2 === 0 ? 0 : -1))),
      temperature_c: Number((36.5 + Math.cos(i / 5) * 0.15).toFixed(2)),
      temperature_sensor_type: 'DS18B20',
      signal_quality: 'GOOD',
      battery_voltage: 4.02,
      connection_status: 'CONNECTED',
      data_source: 'DEMO',
      rssi_dbm: -58,
    });
  }
  return buffer;
};

export const useHealthStore = create<HealthState>((set) => ({
  currentPacket: INITIAL_PACKET,
  previousPacket: undefined,
  packetBuffer: generateSeedBuffer(),
  historicalRecords: generateSeedBuffer(),
  deviceInfo: INITIAL_DEVICE,
  sensors: INITIAL_SENSORS,
  timeFilter: '15m',
  soundMuted: false,
  manualOverrideActive: false,
  manualOverrides: {
    heartRate: 74,
    spo2: 98,
    temperature: 36.5,
    signalQuality: 'GOOD',
  },

  ingestPacket: (newPacket: TelemetryPacket) => {
    set((state) => {
      const buffer = [...state.packetBuffer, newPacket];
      if (buffer.length > 200) buffer.shift(); // retain last 200

      const history = [...state.historicalRecords, newPacket];
      if (history.length > 5000) history.shift();

      // Update sensors
      const updatedSensors = state.sensors.map((s) => {
        if (s.id === 'sensor-max30100') {
          return {
            ...s,
            reading: `${newPacket.heart_rate_bpm} BPM / ${newPacket.spo2_percent}%`,
            signal_quality: newPacket.signal_quality,
            status: newPacket.signal_quality === 'DISCONNECTED' ? ('DISCONNECTED' as const) : ('OPERATIONAL' as const),
          };
        }
        if (s.id === 'sensor-ds18b20') {
          return {
            ...s,
            reading: newPacket.temperature_c.toFixed(1),
            status: newPacket.connection_status === 'CONNECTED' ? ('OPERATIONAL' as const) : ('FAULT' as const),
          };
        }
        if (s.id === 'sensor-esp32-vsys' && newPacket.battery_voltage) {
          return {
            ...s,
            reading: newPacket.battery_voltage.toFixed(2),
          };
        }
        return s;
      });

      const updatedDevice: DeviceInfo = {
        ...state.deviceInfo,
        last_heartbeat: newPacket.timestamp,
        last_packet: newPacket,
        connection_status: newPacket.connection_status,
        battery_voltage: newPacket.battery_voltage || state.deviceInfo.battery_voltage,
        packets_received: state.deviceInfo.packets_received + 1,
        uptime_seconds: state.deviceInfo.uptime_seconds + 1,
      };

      return {
        previousPacket: state.currentPacket,
        currentPacket: newPacket,
        packetBuffer: buffer,
        historicalRecords: history,
        deviceInfo: updatedDevice,
        sensors: updatedSensors,
      };
    });
  },

  setConnectionProtocol: (protocol) => {
    set((state) => ({
      deviceInfo: {
        ...state.deviceInfo,
        connection_type: protocol,
      },
    }));
  },

  setConnectionStatus: (status) => {
    set((state) => ({
      deviceInfo: {
        ...state.deviceInfo,
        connection_status: status,
      },
      currentPacket: {
        ...state.currentPacket,
        connection_status: status,
      },
    }));
  },

  setTimeFilter: (timeFilter) => set({ timeFilter }),

  toggleSound: () => set((state) => ({ soundMuted: !state.soundMuted })),

  setManualOverrides: (overrides) => {
    set((state) => ({
      manualOverrides: {
        ...state.manualOverrides,
        ...overrides,
      },
    }));
  },

  toggleManualOverride: (active) => set({ manualOverrideActive: active }),

  importHistoryRecords: (records) => {
    set((state) => ({
      historicalRecords: [...records, ...state.historicalRecords].slice(0, 5000),
      packetBuffer: [...records.slice(-50), ...state.packetBuffer].slice(-100),
    }));
  },

  clearHistory: () => set({ historicalRecords: [] }),
}));
