import { TelemetryPacket, TelemetryValidationResult } from '../types/telemetry';

export class TelemetryValidator {
  private static seenTimestamps = new Set<string>();
  private static lastSequence = -1;

  public static validate(raw: any): TelemetryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!raw || typeof raw !== 'object') {
      return {
        isValid: false,
        errors: ['Packet is not a valid JSON object or is null/undefined'],
        warnings: [],
      };
    }

    // 1. Device ID
    if (!raw.device_id || typeof raw.device_id !== 'string' || raw.device_id.trim() === '') {
      errors.push("Missing or invalid 'device_id'. Must be a non-empty string.");
    }

    // 2. Timestamp
    if (!raw.timestamp || typeof raw.timestamp !== 'string') {
      errors.push("Missing or invalid 'timestamp'. Must be an ISO 8601 string.");
    } else {
      const parsedTime = Date.parse(raw.timestamp);
      if (isNaN(parsedTime)) {
        errors.push(`Timestamp '${raw.timestamp}' is not valid ISO 8601.`);
      } else {
        const now = Date.now();
        if (parsedTime > now + 60000) {
          warnings.push(`Timestamp is in the future (+${Math.round((parsedTime - now) / 1000)}s). Potential device clock drift.`);
        } else if (now - parsedTime > 300000) {
          warnings.push(`Delayed telemetry packet detected (>5 minutes old).`);
        }

        const dedupKey = `${raw.device_id}_${raw.timestamp}`;
        if (this.seenTimestamps.has(dedupKey)) {
          warnings.push(`Duplicate telemetry packet with timestamp '${raw.timestamp}' detected.`);
        } else {
          this.seenTimestamps.add(dedupKey);
          if (this.seenTimestamps.size > 2000) {
            const first = this.seenTimestamps.values().next().value;
            if (first) this.seenTimestamps.delete(first);
          }
        }
      }
    }

    // 3. Heart Rate
    if (typeof raw.heart_rate_bpm !== 'number' || isNaN(raw.heart_rate_bpm)) {
      errors.push("Missing or non-numeric 'heart_rate_bpm'.");
    } else {
      if (raw.heart_rate_bpm < 0 || raw.heart_rate_bpm > 250) {
        errors.push(`Heart rate ${raw.heart_rate_bpm} BPM is outside physiological or instrument limit (0 - 250 BPM).`);
      } else if (raw.heart_rate_bpm > 0 && raw.heart_rate_bpm < 30) {
        warnings.push(`Severe bradycardia reading (<30 BPM). Verify MAX30100 sensor placement.`);
      } else if (raw.heart_rate_bpm > 200) {
        warnings.push(`Extremely elevated heart rate (>200 BPM). Verify motion artifact filter.`);
      }
    }

    // 4. SpO2
    if (typeof raw.spo2_percent !== 'number' || isNaN(raw.spo2_percent)) {
      errors.push("Missing or non-numeric 'spo2_percent'.");
    } else {
      if (raw.spo2_percent < 0 || raw.spo2_percent > 100) {
        errors.push(`SpO2 ${raw.spo2_percent}% is outside valid percentage bounds (0 - 100%).`);
      } else if (raw.spo2_percent > 0 && raw.spo2_percent < 60) {
        warnings.push(`Critically low SpO2 (<60%). Check sensor optical contact.`);
      }
    }

    // 5. Temperature
    if (typeof raw.temperature_c !== 'number' || isNaN(raw.temperature_c)) {
      errors.push("Missing or non-numeric 'temperature_c'.");
    } else {
      if (raw.temperature_c < 10 || raw.temperature_c > 50) {
        errors.push(`Temperature ${raw.temperature_c}°C is outside valid sensor limits (10 - 50°C).`);
      } else if (raw.temperature_c < 30) {
        warnings.push(`Low surface temperature (<30°C). Sensor may not be in skin contact.`);
      } else if (raw.temperature_c > 43) {
        warnings.push(`Severe hyperthermia or sensor ambient heat exposure (>43°C).`);
      }
    }

    // 6. Signal Quality
    const validSignalQualities = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DISCONNECTED'];
    if (!raw.signal_quality || !validSignalQualities.includes(raw.signal_quality)) {
      warnings.push(`Signal quality '${raw.signal_quality}' unrecognised. Defaulting to 'FAIR'.`);
    }

    // 7. Battery Voltage (optional)
    if (raw.battery_voltage !== undefined) {
      if (typeof raw.battery_voltage !== 'number' || raw.battery_voltage < 2.0 || raw.battery_voltage > 5.5) {
        warnings.push(`Battery voltage ${raw.battery_voltage}V abnormal for LiPo cell.`);
      }
    }

    // 8. Connection Status
    const validStatuses = ['CONNECTED', 'DISCONNECTED', 'CONNECTING', 'ERROR'];
    if (!raw.connection_status || !validStatuses.includes(raw.connection_status)) {
      warnings.push(`Connection status '${raw.connection_status}' invalid. Defaulting to 'CONNECTED'.`);
    }

    const isValid = errors.length === 0;

    const normalizedPacket: TelemetryPacket = {
      device_id: String(raw.device_id || 'ESP32_UNKNOWN'),
      timestamp: String(raw.timestamp || new Date().toISOString()),
      heart_rate_bpm: Number(raw.heart_rate_bpm ?? 0),
      spo2_percent: Number(raw.spo2_percent ?? 0),
      temperature_c: Number(raw.temperature_c ?? 36.5),
      temperature_sensor_type: raw.temperature_sensor_type || 'DS18B20',
      signal_quality: validSignalQualities.includes(raw.signal_quality) ? raw.signal_quality : 'FAIR',
      battery_voltage: raw.battery_voltage !== undefined ? Number(raw.battery_voltage) : 3.9,
      connection_status: validStatuses.includes(raw.connection_status) ? raw.connection_status : 'CONNECTED',
      packet_sequence: raw.packet_sequence ?? ++this.lastSequence,
      rssi_dbm: raw.rssi_dbm ?? -62,
      data_source: raw.data_source || 'LIVE_HARDWARE',
    };

    return {
      isValid,
      errors,
      warnings,
      normalizedPacket: isValid ? normalizedPacket : undefined,
    };
  }

  public static resetValidationCache(): void {
    this.seenTimestamps.clear();
    this.lastSequence = 0;
  }
}
