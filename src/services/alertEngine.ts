import { HealthAlert, AlertThresholds, AlertSeverity } from '../types/alerts';
import { TelemetryPacket } from '../types/telemetry';

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  heartRateHighWarning: 100,
  heartRateHighCritical: 130,
  heartRateLowWarning: 60,
  heartRateLowCritical: 45,
  spo2LowWarning: 95,
  spo2LowCritical: 90,
  temperatureHighWarning: 37.5,
  temperatureHighCritical: 38.5,
  temperatureLowWarning: 35.5,
  temperatureLowCritical: 34.5,
  heartbeatTimeoutSeconds: 10,
  poorSignalCooldownSeconds: 15,
};

export class AlertEngine {
  private static lastAlertTimeBySensor: Map<string, number> = new Map();
  private static activeAlertsMap: Map<string, HealthAlert> = new Map();
  private static alertCounter = 0;

  public static evaluate(
    packet: TelemetryPacket,
    thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
    cooldownMs = 8000
  ): HealthAlert[] {
    const generatedAlerts: HealthAlert[] = [];
    const now = Date.now();
    const ts = packet.timestamp || new Date().toISOString();

    const checkCooldown = (key: string): boolean => {
      const last = this.lastAlertTimeBySensor.get(key) || 0;
      if (now - last < cooldownMs) {
        return false; // suppressed by cooldown
      }
      this.lastAlertTimeBySensor.set(key, now);
      return true;
    };

    // 1. Heart Rate Evaluation
    if (packet.signal_quality !== 'DISCONNECTED' && packet.heart_rate_bpm > 0) {
      if (packet.heart_rate_bpm >= thresholds.heartRateHighCritical) {
        const key = `${packet.device_id}_HR_HIGH_CRIT`;
        if (checkCooldown(key)) {
          generatedAlerts.push({
            id: `ALT_${Date.now()}_${++this.alertCounter}_HR_CRIT`,
            device_id: packet.device_id,
            sensor_name: 'MAX30100 Heart Rate',
            reading: packet.heart_rate_bpm,
            unit: 'BPM',
            threshold: thresholds.heartRateHighCritical,
            timestamp: ts,
            severity: 'CRITICAL',
            explanation: `Critical Tachycardia detected: Current heart rate is ${packet.heart_rate_bpm} BPM, exceeding critical threshold of ${thresholds.heartRateHighCritical} BPM.`,
            recommended_action: 'Advise user to rest in a seated position immediately. Recheck pulse manually and seek qualified medical attention if sustained.',
            status: 'ACTIVE',
          });
        }
      } else if (packet.heart_rate_bpm >= thresholds.heartRateHighWarning) {
        const key = `${packet.device_id}_HR_HIGH_WARN`;
        if (checkCooldown(key)) {
          generatedAlerts.push({
            id: `ALT_${Date.now()}_${++this.alertCounter}_HR_WARN`,
            device_id: packet.device_id,
            sensor_name: 'MAX30100 Heart Rate',
            reading: packet.heart_rate_bpm,
            unit: 'BPM',
            threshold: thresholds.heartRateHighWarning,
            timestamp: ts,
            severity: 'WARNING',
            explanation: `Elevated heart rate: ${packet.heart_rate_bpm} BPM exceeds warning threshold of ${thresholds.heartRateHighWarning} BPM.`,
            recommended_action: 'Monitor reading for 2 minutes. Eliminate physical exertion, emotional distress, or caffeine intake.',
            status: 'ACTIVE',
          });
        }
      } else if (packet.heart_rate_bpm <= thresholds.heartRateLowCritical) {
        const key = `${packet.device_id}_HR_LOW_CRIT`;
        if (checkCooldown(key)) {
          generatedAlerts.push({
            id: `ALT_${Date.now()}_${++this.alertCounter}_HR_LOW_CRIT`,
            device_id: packet.device_id,
            sensor_name: 'MAX30100 Heart Rate',
            reading: packet.heart_rate_bpm,
            unit: 'BPM',
            threshold: thresholds.heartRateLowCritical,
            timestamp: ts,
            severity: 'CRITICAL',
            explanation: `Severe Bradycardia alert: Heart rate is ${packet.heart_rate_bpm} BPM, falling below critical floor of ${thresholds.heartRateLowCritical} BPM.`,
            recommended_action: 'Check subject responsiveness and pulse manually. If symptomatic with dizziness, prepare urgent clinical assessment.',
            status: 'ACTIVE',
          });
        }
      } else if (packet.heart_rate_bpm <= thresholds.heartRateLowWarning) {
        const key = `${packet.device_id}_HR_LOW_WARN`;
        if (checkCooldown(key)) {
          generatedAlerts.push({
            id: `ALT_${Date.now()}_${++this.alertCounter}_HR_LOW_WARN`,
            device_id: packet.device_id,
            sensor_name: 'MAX30100 Heart Rate',
            reading: packet.heart_rate_bpm,
            unit: 'BPM',
            threshold: thresholds.heartRateLowWarning,
            timestamp: ts,
            severity: 'WARNING',
            explanation: `Low resting heart rate: ${packet.heart_rate_bpm} BPM is below standard baseline (${thresholds.heartRateLowWarning} BPM).`,
            recommended_action: 'Confirm subject is at rest or athletic baseline. Recheck MAX30100 sensor contact pressure.',
            status: 'ACTIVE',
          });
        }
      }
    }

    // 2. SpO2 Oxygen Saturation Evaluation
    if (packet.signal_quality !== 'DISCONNECTED' && packet.spo2_percent > 0) {
      if (packet.spo2_percent <= thresholds.spo2LowCritical) {
        const key = `${packet.device_id}_SPO2_CRIT`;
        if (checkCooldown(key)) {
          generatedAlerts.push({
            id: `ALT_${Date.now()}_${++this.alertCounter}_SPO2_CRIT`,
            device_id: packet.device_id,
            sensor_name: 'MAX30100 SpO2',
            reading: packet.spo2_percent,
            unit: '%',
            threshold: thresholds.spo2LowCritical,
            timestamp: ts,
            severity: 'CRITICAL',
            explanation: `Critical Hypoxemia condition: SpO2 has dropped to ${packet.spo2_percent}%, dangerously below ${thresholds.spo2LowCritical}%.`,
            recommended_action: 'Ensure clear airway, upright posture, and calibrate optical contact. Seek emergency clinical evaluation without delay.',
            status: 'ACTIVE',
          });
        }
      } else if (packet.spo2_percent <= thresholds.spo2LowWarning) {
        const key = `${packet.device_id}_SPO2_WARN`;
        if (checkCooldown(key)) {
          generatedAlerts.push({
            id: `ALT_${Date.now()}_${++this.alertCounter}_SPO2_WARN`,
            device_id: packet.device_id,
            sensor_name: 'MAX30100 SpO2',
            reading: packet.spo2_percent,
            unit: '%',
            threshold: thresholds.spo2LowWarning,
            timestamp: ts,
            severity: 'WARNING',
            explanation: `Sub-optimal oxygen saturation: SpO2 is ${packet.spo2_percent}%, falling below target limit of ${thresholds.spo2LowWarning}%.`,
            recommended_action: 'Take 5 deep breaths, adjust wearable band to prevent ambient light leakage, and ensure fingers are warm.',
            status: 'ACTIVE',
          });
        }
      }
    }

    // 3. Body Temperature Evaluation
    if (packet.temperature_c >= thresholds.temperatureHighCritical) {
      const key = `${packet.device_id}_TEMP_HIGH_CRIT`;
      if (checkCooldown(key)) {
        generatedAlerts.push({
          id: `ALT_${Date.now()}_${++this.alertCounter}_TEMP_CRIT`,
          device_id: packet.device_id,
          sensor_name: 'DS18B20 Temperature',
          reading: packet.temperature_c,
          unit: '°C',
          threshold: thresholds.temperatureHighCritical,
          timestamp: ts,
          severity: 'CRITICAL',
          explanation: `High fever / Hyperthermia: Temperature is ${packet.temperature_c.toFixed(1)}°C (threshold: ${thresholds.temperatureHighCritical}°C).`,
          recommended_action: 'Initiate physical cooling measures, hydrate with fluids, and consult a healthcare provider.',
          status: 'ACTIVE',
        });
      }
    } else if (packet.temperature_c >= thresholds.temperatureHighWarning) {
      const key = `${packet.device_id}_TEMP_HIGH_WARN`;
      if (checkCooldown(key)) {
        generatedAlerts.push({
          id: `ALT_${Date.now()}_${++this.alertCounter}_TEMP_WARN`,
          device_id: packet.device_id,
          sensor_name: 'DS18B20 Temperature',
          reading: packet.temperature_c,
          unit: '°C',
          threshold: thresholds.temperatureHighWarning,
          timestamp: ts,
          severity: 'WARNING',
          explanation: `Low-grade pyrexia detected: Reading of ${packet.temperature_c.toFixed(1)}°C exceeds normal range (${thresholds.temperatureHighWarning}°C).`,
          recommended_action: 'Retest temperature in 10 minutes. Distinguish sensor-contact skin reading from core temperature.',
          status: 'ACTIVE',
        });
      }
    } else if (packet.temperature_c <= thresholds.temperatureLowWarning) {
      const key = `${packet.device_id}_TEMP_LOW_WARN`;
      if (checkCooldown(key)) {
        generatedAlerts.push({
          id: `ALT_${Date.now()}_${++this.alertCounter}_TEMP_LOW_WARN`,
          device_id: packet.device_id,
          sensor_name: 'DS18B20 Temperature',
          reading: packet.temperature_c,
          unit: '°C',
          threshold: thresholds.temperatureLowWarning,
          timestamp: ts,
          severity: 'WARNING',
          explanation: `Low skin temperature: ${packet.temperature_c.toFixed(1)}°C is below standard skin range (${thresholds.temperatureLowWarning}°C).`,
          recommended_action: 'Check probe contact against skin. Ensure wearable strap is snug and ambient room is not chilled.',
          status: 'ACTIVE',
        });
      }
    }

    // 4. Signal Integrity & Sensor Disconnection
    if (packet.signal_quality === 'POOR') {
      const key = `${packet.device_id}_SIGNAL_POOR`;
      if (checkCooldown(key)) {
        generatedAlerts.push({
          id: `ALT_${Date.now()}_${++this.alertCounter}_SIGNAL_POOR`,
          device_id: packet.device_id,
          sensor_name: 'Signal Integrity',
          reading: 'POOR',
          unit: 'Q-Score',
          threshold: 'GOOD',
          timestamp: ts,
          severity: 'WARNING',
          explanation: 'Degraded optical signal quality on MAX30100. Movement artifacts or suboptimal LED optical path.',
          recommended_action: 'Keep wrist and finger steady for 10 seconds. Clean sensor glass cover.',
          status: 'ACTIVE',
        });
      }
    } else if (packet.signal_quality === 'DISCONNECTED' || packet.heart_rate_bpm === 0) {
      const key = `${packet.device_id}_SENSOR_DISCONNECTED`;
      if (checkCooldown(key)) {
        generatedAlerts.push({
          id: `ALT_${Date.now()}_${++this.alertCounter}_SENSOR_DISCONNECTED`,
          device_id: packet.device_id,
          sensor_name: 'MAX30100 Heart Rate',
          reading: 0,
          unit: 'BPM',
          threshold: '>0 BPM',
          timestamp: ts,
          severity: 'CRITICAL',
          explanation: 'MAX30100 optical pulse sensor disconnected or subject contact lost.',
          recommended_action: 'Re-attach sensor probe to skin or finger clip. Check I2C wiring (SDA/SCL) on ESP32.',
          status: 'ACTIVE',
        });
      }
    }

    return generatedAlerts;
  }

  public static resetCooldowns(): void {
    this.lastAlertTimeBySensor.clear();
    this.activeAlertsMap.clear();
  }
}
