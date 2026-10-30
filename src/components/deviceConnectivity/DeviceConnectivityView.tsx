import React, { useState } from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { BleService } from '../../services/bleService';
import { WifiService } from '../../services/wifiService';
import { TelemetryValidator } from '../../services/telemetryValidator';
import { Wifi, Bluetooth, Cpu, RefreshCw, Send, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { BatteryGauge, SignalQualityBars } from '../common/StatusIndicator';

export const DeviceConnectivityView: React.FC = () => {
  const deviceInfo = useHealthStore((state) => state.deviceInfo);
  const currentPacket = useHealthStore((state) => state.currentPacket);
  const setConnectionProtocol = useHealthStore((state) => state.setConnectionProtocol);
  const setConnectionStatus = useHealthStore((state) => state.setConnectionStatus);
  const ingestPacket = useHealthStore((state) => state.ingestPacket);

  const [bleStatusMsg, setBleStatusMsg] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [rawJsonInput, setRawJsonInput] = useState(
    JSON.stringify(
      {
        device_id: 'ESP32_WEARABLE_01',
        timestamp: new Date().toISOString(),
        heart_rate_bpm: 78,
        spo2_percent: 98,
        temperature_c: 36.6,
        temperature_sensor_type: 'DS18B20',
        signal_quality: 'GOOD',
        battery_voltage: 4.02,
        connection_status: 'CONNECTED',
      },
      null,
      2
    )
  );
  const [validationOutput, setValidationOutput] = useState<{ msg: string; success: boolean } | null>(null);

  // BLE Scan
  const handleBleScan = async () => {
    setBleStatusMsg('Scanning for BLE GATT peripherals...');
    const ok = await BleService.scanAndConnect(
      (packet) => {
        ingestPacket(packet);
        setConnectionProtocol('BLE');
      },
      (status, msg) => {
        setConnectionStatus(status);
        if (msg) setBleStatusMsg(msg);
      }
    );
    if (!ok) {
      setBleStatusMsg('Web Bluetooth scan cancelled or device not selected.');
    }
  };

  // Test Raw Packet Ingestion
  const handleTestIngest = () => {
    try {
      const parsed = JSON.parse(rawJsonInput);
      const val = TelemetryValidator.validate(parsed);
      if (val.isValid && val.normalizedPacket) {
        val.normalizedPacket.data_source = 'LIVE_HARDWARE';
        ingestPacket(val.normalizedPacket);
        setConnectionProtocol('WIFI');
        setValidationOutput({ msg: 'Valid packet accepted & ingested into live state!', success: true });
      } else {
        setValidationOutput({ msg: `Validation rejected: ${val.errors.join(', ')}`, success: false });
      }
    } catch (err: any) {
      setValidationOutput({ msg: `JSON Syntax error: ${err.message}`, success: false });
    }
  };

  const copyFirmware = () => {
    navigator.clipboard.writeText(WifiService.getArduinoFirmwareCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FF8A24]" />
            ESP32 HARDWARE CONNECTIVITY & BUS MANAGER
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            DUAL-CORE NODES // 802.11 b/g/n WI-FI & BLUETOOTH LOW ENERGY GATT
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[#10100E] border border-[#34342B] p-1">
          {(['DEMO', 'WIFI', 'BLE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setConnectionProtocol(mode)}
              className={`px-3 py-1 text-xs font-mono border transition-all ${
                deviceInfo.connection_type === mode
                  ? 'bg-[#FF8A24] text-[#0B0B0A] font-bold border-[#FF8A24]'
                  : 'bg-[#171714] text-[#A6A69A] border-transparent hover:text-[#F4F1E9]'
              }`}
            >
              {mode} MODE
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Telemetry Parameters Card */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-4">
        <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9] border-b border-[#34342B] pb-2">
          CONNECTED CONTROLLER METRICS
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">DEVICE IDENTIFIER</span>
            <span className="text-[#F4F1E9] font-bold text-sm">{deviceInfo.device_id}</span>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">CONNECTION PROTOCOL</span>
            <span className="text-[#FF8A24] font-bold text-sm">{deviceInfo.connection_type}</span>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">LINK STATUS</span>
            <span className={`font-bold text-sm ${deviceInfo.connection_status === 'CONNECTED' ? 'text-[#54E38E]' : 'text-[#FF4545]'}`}>
              {deviceInfo.connection_status}
            </span>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">IPV4 ADDRESS</span>
            <span className="text-[#F4F1E9] font-bold text-sm">{deviceInfo.ip_address || '192.168.1.144'}</span>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">WI-FI RSSI STRENGTH</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#F4F1E9] font-bold">{deviceInfo.wifi_rssi} dBm</span>
              <SignalQualityBars quality={currentPacket.signal_quality} />
            </div>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">FIRMWARE REVISION</span>
            <span className="text-[#F4F1E9] font-bold text-sm">{deviceInfo.firmware_version}</span>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">CONTROLLER UPTIME</span>
            <span className="text-[#F4F1E9] font-bold text-sm">
              {Math.floor(deviceInfo.uptime_seconds / 60)}m {deviceInfo.uptime_seconds % 60}s
            </span>
          </div>

          <div className="p-3 bg-[#10100E] border border-[#34342B]">
            <span className="text-[#6B6B5F] block text-[10px] uppercase">BATTERY STATUS</span>
            <div className="mt-1">
              <BatteryGauge voltage={deviceInfo.battery_voltage} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: BLE Scanner & Wi-Fi JSON Packet Tester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BLE Direct Web Bluetooth API */}
        <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#34342B] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-[#FF8A24]" />
                <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
                  BLUETOOTH LOW ENERGY (WEB BLE)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#54E38E]">GATT PROFILE 0x180D</span>
            </div>

            <p className="text-xs font-sans text-[#A6A69A] leading-relaxed mb-4">
              Connect directly from Chrome or Edge to physical ESP32 BLE GATT peripherals over Bluetooth 4.2/5.0. Streams heart rate and SpO2 notifications without intermediaries.
            </p>

            {bleStatusMsg && (
              <div className="p-2.5 bg-[#10100E] border border-[#34342B] text-xs font-mono text-[#FFB547] mb-3">
                {bleStatusMsg}
              </div>
            )}
          </div>

          <button
            onClick={handleBleScan}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#20201B] hover:bg-[#34342B] border border-[#FF8A24]/60 text-[#FF8A24] font-mono text-xs uppercase font-bold transition-colors"
          >
            <Bluetooth className="w-4 h-4" />
            <span>Scan & Connect ESP32 Peripheral</span>
          </button>
        </div>

        {/* Live Packet Ingestion Tester */}
        <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
                LIVE REST / MQTT PACKET INGESTION TESTER
              </h3>
            </div>
            <span className="text-xs font-mono text-[#A6A69A]">JSON INGEST</span>
          </div>

          <textarea
            value={rawJsonInput}
            onChange={(e) => setRawJsonInput(e.target.value)}
            rows={6}
            className="w-full bg-[#0B0B0A] border border-[#34342B] p-2 text-xs font-mono text-[#F4F1E9] focus:outline-none focus:border-[#FF8A24]"
          />

          {validationOutput && (
            <div
              className={`p-2 text-xs font-mono border ${
                validationOutput.success
                  ? 'bg-[#54E38E]/10 border-[#54E38E]/40 text-[#54E38E]'
                  : 'bg-[#FF4545]/10 border-[#FF4545]/40 text-[#FF4545]'
              }`}
            >
              {validationOutput.msg}
            </div>
          )}

          <button
            onClick={handleTestIngest}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] font-mono text-xs uppercase font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Validate & Ingest Real Hardware Packet</span>
          </button>
        </div>
      </div>

      {/* Arduino C++ Firmware Code Preview */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FF8A24]" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              ESP32 ARDUINO C++ FIRMWARE CODE
            </h3>
          </div>

          <button
            onClick={copyFirmware}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-xs font-mono text-[#F4F1E9] transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#54E38E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'COPIED TO CLIPBOARD' : 'COPY FIRMWARE SKETCH'}</span>
          </button>
        </div>

        <div className="bg-[#0B0B0A] border border-[#34342B] p-3 max-h-56 overflow-y-auto font-mono text-xs text-[#A6A69A]">
          <pre>{WifiService.getArduinoFirmwareCode()}</pre>
        </div>
      </div>
    </div>
  );
};
