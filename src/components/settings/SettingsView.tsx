import React, { useState } from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { useHealthStore } from '../../store/useHealthStore';
import { Settings, Volume2, ShieldAlert, Trash2, Cpu, Check, RotateCcw } from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '../../services/alertEngine';

export const SettingsView: React.FC = () => {
  const thresholds = useAlertStore((state) => state.thresholds);
  const updateThresholds = useAlertStore((state) => state.updateThresholds);
  const soundEnabled = useAlertStore((state) => state.soundEnabled);
  const toggleSound = useAlertStore((state) => state.toggleSound);
  const playAlertTone = useAlertStore((state) => state.playAlertTone);

  const clearHistory = useHealthStore((state) => state.clearHistory);
  const deviceInfo = useHealthStore((state) => state.deviceInfo);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  const handleTestAudio = (type: 'WARNING' | 'CRITICAL') => {
    playAlertTone(type);
  };

  const handleResetThresholds = () => {
    updateThresholds(DEFAULT_THRESHOLDS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handlePurgeHistory = () => {
    if (window.confirm('Clear all historical telemetry records from browser state?')) {
      clearHistory();
      setClearedSuccess(true);
      setTimeout(() => setClearedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF8A24]" />
            SYSTEM SETTINGS & TELEMETRY CONFIGURATION
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            AUDIO CHIMES // THRESHOLD POLICIES // MEMORY & CONTROLLER METADATA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio Notification Settings */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                WEB AUDIO WARNING CHIMES
              </h3>
            </div>
            <button
              onClick={toggleSound}
              className={`px-3 py-1 font-mono text-xs border ${
                soundEnabled
                  ? 'bg-[#54E38E]/15 border-[#54E38E] text-[#54E38E]'
                  : 'bg-[#FF4545]/15 border-[#FF4545] text-[#FF4545]'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <p className="text-xs font-sans text-[#A6A69A] leading-relaxed">
            Real-time audio tones synthesize via Web Audio API when critical hypoxemia or tachycardia thresholds are violated.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleTestAudio('WARNING')}
              className="flex-1 py-2 bg-[#20201B] hover:bg-[#34342B] border border-[#FFB547]/50 text-xs font-mono text-[#FFB547] uppercase font-semibold"
            >
              Test Warning Tone (D5)
            </button>
            <button
              onClick={() => handleTestAudio('CRITICAL')}
              className="flex-1 py-2 bg-[#20201B] hover:bg-[#34342B] border border-[#FF4545]/50 text-xs font-mono text-[#FF4545] uppercase font-semibold"
            >
              Test Critical Tone (A5)
            </button>
          </div>
        </div>

        {/* System Threshold Reset */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                FACTORY THRESHOLDS RESTORATION
              </h3>
            </div>
          </div>

          <p className="text-xs font-sans text-[#A6A69A] leading-relaxed">
            Reset all configurable thresholds back to clinical prototype factory standards (HR: 100/130 BPM, SpO2: 95/90%, Temp: 37.5/38.5°C).
          </p>

          <button
            onClick={handleResetThresholds}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] hover:border-[#FF8A24] text-xs font-mono text-[#FF8A24] uppercase font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{savedSuccess ? 'RESTORED FACTORY DEFAULTS' : 'RESTORE FACTORY THRESHOLDS'}</span>
          </button>
        </div>

        {/* Memory and Historical Data Storage */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#FF4545]" />
              <h3 className="font-heading text-sm uppercase text-[#FF4545]">
                STORAGE & RING BUFFER PURGE
              </h3>
            </div>
          </div>

          <p className="text-xs font-sans text-[#A6A69A] leading-relaxed">
            Clear historical observations ring buffer from local application state. This will reset telemetry charts and health record tables.
          </p>

          <button
            onClick={handlePurgeHistory}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF4545]/15 hover:bg-[#FF4545]/30 border border-[#FF4545] text-xs font-mono text-[#FF4545] uppercase font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearedSuccess ? 'HISTORY PURGED' : 'PURGE ALL STORED RECORDS'}</span>
          </button>
        </div>

        {/* Node Architecture Spec */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                NODE ARCHITECTURE SPECIFICATION
              </h3>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-[#A6A69A]">
            <div>DEVICE: <strong className="text-[#F4F1E9]">{deviceInfo.device_id}</strong></div>
            <div>ARCH: <strong className="text-[#F4F1E9]">Xtensa Dual-Core 32-bit LX6 @ 240MHz</strong></div>
            <div>MEMORY: <strong className="text-[#F4F1E9]">520 KB SRAM // 4MB SPI Flash</strong></div>
            <div>RF: <strong className="text-[#F4F1E9]">Wi-Fi 802.11 b/g/n + BLE 4.2 BR/EDR</strong></div>
            <div>I2C BUS: <strong className="text-[#F4F1E9]">400 kHz Fast-Mode (SDA:21, SCL:22)</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
