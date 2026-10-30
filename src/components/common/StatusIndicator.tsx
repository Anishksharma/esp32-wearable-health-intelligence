import React from 'react';
import { SensorSignalQuality, DeviceConnectionStatus } from '../../types/telemetry';

export const RadarLiveDot: React.FC<{ active?: boolean }> = ({ active = true }) => {
  return (
    <div className="relative flex items-center justify-center w-3 h-3">
      {active && (
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#54E38E] opacity-75 animate-ping" />
      )}
      <span className={`relative inline-flex w-2 h-2 rounded-full ${active ? 'bg-[#54E38E]' : 'bg-[#6B6B5F]'}`} />
    </div>
  );
};

export const SignalQualityBars: React.FC<{ quality: SensorSignalQuality }> = ({ quality }) => {
  const levels = {
    EXCELLENT: 4,
    GOOD: 3,
    FAIR: 2,
    POOR: 1,
    DISCONNECTED: 0,
  }[quality];

  return (
    <div className="flex items-end gap-1 h-3.5" title={`Signal Quality: ${quality}`}>
      {[1, 2, 3, 4].map((bar) => {
        const isActive = bar <= levels;
        const barColor = levels === 0 ? 'bg-[#FF4545]' : levels === 1 ? 'bg-[#FFB547]' : 'bg-[#B6F23A]';
        const heightPercent = bar * 25;
        return (
          <div
            key={bar}
            className={`w-1 rounded-none transition-all ${isActive ? barColor : 'bg-[#34342B]'}`}
            style={{ height: `${heightPercent}%` }}
          />
        );
      })}
    </div>
  );
};

export const BatteryGauge: React.FC<{ voltage: number }> = ({ voltage }) => {
  // 3.6V is 0%, 4.2V is 100%
  const pct = Math.max(0, Math.min(100, Math.round(((voltage - 3.5) / (4.2 - 3.5)) * 100)));
  const isLow = pct < 20;

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-[#A6A69A]">
      <div className="relative w-6 h-3 border border-[#34342B] p-0.5 flex items-center">
        <div
          className={`h-full transition-all ${isLow ? 'bg-[#FF4545]' : 'bg-[#54E38E]'}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute -right-1 top-0.5 w-0.5 h-1.5 bg-[#34342B]" />
      </div>
      <span>{voltage.toFixed(2)}V ({pct}%)</span>
    </div>
  );
};

export const ConnectionPill: React.FC<{ status: DeviceConnectionStatus; mode?: string }> = ({
  status,
  mode = 'DEMO',
}) => {
  const isConnected = status === 'CONNECTED';
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono tracking-wider border ${
        isConnected
          ? 'bg-[#171714] border-[#34342B] text-[#54E38E]'
          : 'bg-[#FF4545]/10 border-[#FF4545]/40 text-[#FF4545]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#54E38E] animate-pulse' : 'bg-[#FF4545]'}`} />
      <span className="font-semibold">{status}</span>
      <span className="text-[#6B6B5F]">|</span>
      <span className="text-[#FF8A24]">{mode}</span>
    </div>
  );
};
