import { TelemetryPacket } from '../types/telemetry';
import { TelemetryValidator } from './telemetryValidator';

export class WifiService {
  private static channel: BroadcastChannel | null = null;

  public static initReceiver(onPacket: (packet: TelemetryPacket) => void): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('esp32_telemetry_bus');
      this.channel.onmessage = (event) => {
        const validation = TelemetryValidator.validate(event.data);
        if (validation.isValid && validation.normalizedPacket) {
          onPacket(validation.normalizedPacket);
        }
      };
    }

    // Also listen to window postMessage
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'ESP32_TELEMETRY') {
          const validation = TelemetryValidator.validate(event.data.payload);
          if (validation.isValid && validation.normalizedPacket) {
            onPacket(validation.normalizedPacket);
          }
        }
      });
    }
  }

  public static broadcastPacket(packet: TelemetryPacket): void {
    if (this.channel) {
      this.channel.postMessage(packet);
    }
  }

  public static getArduinoFirmwareCode(): string {
    return `/*
 * ESP32 WEARABLE HEALTH MONITORING FIRMWARE
 * Sensors: MAX30100 (I2C SDA=21, SCL=22) + DS18B20 (OneWire GPIO 4)
 * Network: Wi-Fi 802.11 b/g/n -> JSON HTTP REST / WebSocket
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "MAX30100_PulseOximeter.h"

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.100:5173/api/telemetry";

#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
PulseOximeter pox;

uint32_t tsLastReport = 0;
const char* DEVICE_ID = "ESP32_WEARABLE_01";

void onBeatDetected() {
  Serial.println(">>> Heart Beat Detected <<<");
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  tempSensor.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\\nConnected! IP: %s\\n", WiFi.localIP().toString().c_str());

  if (!pox.begin()) {
    Serial.println("FAILED to initialize MAX30100. Check wiring!");
  } else {
    pox.setOnBeatDetectedCallback(onBeatDetected);
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  }
}

void loop() {
  pox.update();

  if (millis() - tsLastReport > 1000) {
    tempSensor.requestTemperatures();
    float tempC = tempSensor.getTempCByIndex(0);
    float bpm = pox.getHeartRate();
    float spo2 = pox.getSpO2();

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = String("{") +
        "\\"device_id\\":\\"" + DEVICE_ID + "\\"," +
        "\\"timestamp\\":\\"2026-10-30T17:15:00.000Z\\"," +
        "\\"heart_rate_bpm\\":" + String(bpm) + "," +
        "\\"spo2_percent\\":" + String(spo2) + "," +
        "\\"temperature_c\\":" + String(tempC) + "," +
        "\\"temperature_sensor_type\\":\\"DS18B20\\"," +
        "\\"signal_quality\\":\\"" + (spo2 > 80 ? "GOOD" : "POOR") + "\\"," +
        "\\"battery_voltage\\":3.92," +
        "\\"connection_status\\":\\"CONNECTED\\"" +
      "}";

      int httpResponseCode = http.POST(jsonPayload);
      http.end();
    }
    tsLastReport = millis();
  }
}
`;
  }
}
