// ESP32 Telemetry & Sensor Types

export type SensorSignalQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DISCONNECTED';

export type DeviceConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export type ConnectionProtocol = 'WIFI' | 'BLE' | 'DEMO' | 'SD_CARD' | 'MANUAL';

export type TemperatureSensorType = 'DS18B20' | 'LM35' | 'MAX30205' | 'EMULATED';

export type TelemetryDataSource = 'LIVE_HARDWARE' | 'DEMO' | 'IMPORTED_FILE' | 'SD_CARD';

export interface TelemetryPacket {
  device_id: string;
  timestamp: string; // ISO 8601
  heart_rate_bpm: number;
  spo2_percent: number;
  temperature_c: number;
  temperature_sensor_type: TemperatureSensorType;
  signal_quality: SensorSignalQuality;
  battery_voltage?: number; // e.g. 3.9 V
  connection_status: DeviceConnectionStatus;
  packet_sequence?: number;
  rssi_dbm?: number;
  data_source?: TelemetryDataSource;
  raw_red_led?: number;
  raw_ir_led?: number;
}

export interface DeviceInfo {
  device_id: string;
  name: string;
  connection_type: ConnectionProtocol;
  connection_status: DeviceConnectionStatus;
  ip_address?: string;
  mac_address?: string;
  wifi_rssi?: number; // dBm
  ble_rssi?: number;
  ble_status?: 'ADVERTISING' | 'CONNECTED' | 'DISCONNECTED';
  last_heartbeat: string;
  last_packet?: TelemetryPacket;
  firmware_version: string;
  uptime_seconds: number;
  battery_voltage: number;
  battery_percent: number;
  packets_received: number;
  packets_dropped: number;
  error_logs: Array<{ timestamp: string; message: string; code: string }>;
}

export interface SensorStatus {
  id: string;
  name: string;
  model: string;
  bus: 'I2C' | '1-Wire' | 'Analog' | 'SPI';
  addressOrPin: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DISCONNECTED' | 'FAULT';
  reading: string | number;
  unit: string;
  signal_quality: SensorSignalQuality;
  last_calibrated?: string;
  notes?: string;
}

export interface TelemetryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedPacket?: TelemetryPacket;
}
