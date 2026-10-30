export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertThresholds {
  heartRateHighWarning: number; // e.g. 100
  heartRateHighCritical: number; // e.g. 130
  heartRateLowWarning: number; // e.g. 60
  heartRateLowCritical: number; // e.g. 45
  spo2LowWarning: number; // e.g. 95
  spo2LowCritical: number; // e.g. 90
  temperatureHighWarning: number; // e.g. 37.5
  temperatureHighCritical: number; // e.g. 38.5
  temperatureLowWarning: number; // e.g. 35.5
  temperatureLowCritical: number; // e.g. 34.5
  heartbeatTimeoutSeconds: number; // e.g. 5s warning, 15s critical
  poorSignalCooldownSeconds: number;
}

export interface HealthAlert {
  id: string;
  device_id: string;
  sensor_name: 'MAX30100 Heart Rate' | 'MAX30100 SpO2' | 'DS18B20 Temperature' | 'ESP32 Telemetry' | 'Signal Integrity';
  reading: number | string;
  unit: string;
  threshold: number | string;
  timestamp: string; // ISO 8601
  severity: AlertSeverity;
  explanation: string;
  recommended_action: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
}

export interface AlertFilterOptions {
  severity?: AlertSeverity | 'ALL';
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ALL';
  sensor?: string;
  search?: string;
}
