import React, { useState, useEffect } from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { Activity, Radio, Cpu, RefreshCw, Terminal, Eye } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';

export const LiveMonitoringView: React.FC = () => {
  const currentPacket = useHealthStore((state) => state.currentPacket);
  const packetBuffer = useHealthStore((state) => state.packetBuffer);
  const deviceInfo = useHealthStore((state) => state.deviceInfo);

  // Simulated raw optical PPG waveform samples (60Hz pulse wave)
  const [ppgPoints, setPpgPoints] = useState<Array<{ t: number; ir: number; red: number }>>([]);

  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t++;
      const hr = currentPacket.heart_rate_bpm > 0 ? currentPacket.heart_rate_bpm : 72;
      const freq = (hr / 60) * 2 * Math.PI;
      // Synthetic photoplethysmogram: primary peak + dicrotic notch
      const phase = (t * 0.15 * freq) % (2 * Math.PI);
      const systolic = Math.max(0, Math.sin(phase));
      const dicrotic = phase > 1.2 && phase < 2.5 ? 0.35 * Math.sin((phase - 1.2) * 2) : 0;
      const noise = (Math.random() - 0.5) * 0.05;

      const irVal = Math.round(18000 + (systolic + dicrotic + noise) * 3500);
      const redVal = Math.round(15500 + (systolic + dicrotic * 0.9 + noise) * 2800);

      setPpgPoints((prev) => {
        const next = [...prev, { t, ir: irVal, red: redVal }];
        return next.slice(-60); // keep last 60 points
      });
    }, 60);

    return () => clearInterval(interval);
  }, [currentPacket.heart_rate_bpm]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171714] border border-[#34342B] p-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF8A24]" />
            LIVE TELEMETRY & OPTICAL WAVEFORM MONITOR
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            HIGH-SPEED INGESTION BUFFER // MAX30100 RAW OPTICAL ADC & DUAL WAVELENGTH PPG
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 bg-[#10100E] border border-[#34342B] text-[#54E38E] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#54E38E] animate-ping" />
            60 Hz SAMPLING
          </span>
          <span className="text-[#A6A69A]">SAMPLES: {packetBuffer.length}</span>
        </div>
      </div>

      {/* PPG Optical Oscilloscope */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF8A24]" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              REAL-TIME PHOTOPLETHYSMOGRAM (PPG) OPTICAL OSCILLOSCOPE
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#FF8A24] flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#FF8A24] inline-block" />
              IR LED (880nm Oxygenated)
            </span>
            <span className="text-[#FF4545] flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#FF4545] inline-block" />
              RED LED (660nm Deoxygenated)
            </span>
          </div>
        </div>

        <div className="h-56 w-full bg-[#0B0B0A] border border-[#34342B] p-2 relative bg-tech-grid">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ppgPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <YAxis domain={['auto', 'auto']} stroke="#47473B" fontSize={10} fontFamily="DM Mono" hide />
              <Line
                type="monotone"
                dataKey="ir"
                stroke="#FF8A24"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="red"
                stroke="#FF4545"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-[#6B6B5F]">
            SWEEP: 1.0s // AC COUPLED HIGH-PASS FILTER (0.5Hz) // SYSTOLIC PEAK DETECTOR ACTIVE
          </div>
        </div>
      </div>

      {/* Cluster of 3 Industrial Gauge Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gauge 1: Heart Rate */}
        <div className="bg-[#171714] border border-[#34342B] p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs font-mono text-[#A6A69A] uppercase tracking-wider mb-2">
            PULSE VELOCITY
          </div>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#20201B" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#FF8A24"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * Math.min(180, Math.max(0, currentPacket.heart_rate_bpm))) / 180}
                strokeLinecap="butt"
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold text-[#FF8A24]">
                {currentPacket.heart_rate_bpm}
              </span>
              <span className="font-mono text-[10px] text-[#A6A69A]">BPM</span>
            </div>
          </div>
          <div className="mt-3 text-xs font-mono text-[#6B6B5F]">
            RESTING TARGET: 60 - 100 BPM
          </div>
        </div>

        {/* Gauge 2: SpO2 */}
        <div className="bg-[#171714] border border-[#34342B] p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs font-mono text-[#A6A69A] uppercase tracking-wider mb-2">
            BLOOD OXYGENATION
          </div>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#20201B" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#B6F23A"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * Math.min(100, Math.max(0, currentPacket.spo2_percent))) / 100}
                strokeLinecap="butt"
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold text-[#B6F23A]">
                {currentPacket.spo2_percent}%
              </span>
              <span className="font-mono text-[10px] text-[#A6A69A]">SPO2</span>
            </div>
          </div>
          <div className="mt-3 text-xs font-mono text-[#6B6B5F]">
            CRITICAL THRESHOLD: &lt; 90%
          </div>
        </div>

        {/* Gauge 3: Body Temperature */}
        <div className="bg-[#171714] border border-[#34342B] p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs font-mono text-[#A6A69A] uppercase tracking-wider mb-2">
            PROBE TEMPERATURE
          </div>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#20201B" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#FFB547"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * Math.min(45, Math.max(30, currentPacket.temperature_c - 30))) / 15}
                strokeLinecap="butt"
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold text-[#FFB547]">
                {currentPacket.temperature_c.toFixed(1)}
              </span>
              <span className="font-mono text-[10px] text-[#A6A69A]">°C</span>
            </div>
          </div>
          <div className="mt-3 text-xs font-mono text-[#6B6B5F]">
            SKIN BASELINE: 36.0 - 37.2 °C
          </div>
        </div>
      </div>

      {/* Raw Telemetry Packet Stream Inspector */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#FF8A24]" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              RAW INGESTED TELEMETRY PACKET STREAM (JSON & HEX PAYLOAD)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#A6A69A]">
            SEQUENCE: #{deviceInfo.packets_received}
          </span>
        </div>

        <div className="bg-[#0B0B0A] border border-[#34342B] p-3 font-mono text-xs text-[#54E38E] overflow-x-auto max-h-48">
          <pre>{JSON.stringify(currentPacket, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
