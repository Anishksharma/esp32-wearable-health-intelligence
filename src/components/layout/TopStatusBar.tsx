import React from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { useAlertStore } from '../../store/useAlertStore';
import { Volume2, VolumeX, ShieldAlert, Cpu, Activity, Clock, TestTube2 } from 'lucide-react';
import { ConnectionPill, RadarLiveDot } from '../common/StatusIndicator';

export interface TopStatusBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({ setActiveView }) => {
  const currentPacket = useHealthStore((state) => state.currentPacket);
  const deviceInfo = useHealthStore((state) => state.deviceInfo);
  const soundMuted = useHealthStore((state) => state.soundMuted);
  const toggleSound = useHealthStore((state) => state.toggleSound);

  const alerts = useAlertStore((state) => state.alerts);
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  const formattedTime = currentPacket.timestamp.includes('T')
    ? currentPacket.timestamp.split('T')[1].slice(0, 8)
    : currentPacket.timestamp;

  return (
    <header className="h-14 bg-[#10100E] border-b border-[#34342B] px-4 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Left: Device Selection & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#34342B]">
          <RadarLiveDot active={currentPacket.connection_status === 'CONNECTED'} />
          <span className="font-heading tracking-widest text-sm text-[#FF8A24] font-bold uppercase hidden sm:inline">
            OBSIDIAN // IoT HEALTH
          </span>
        </div>

        {/* Device selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#F4F1E9]">
          <Cpu className="w-3.5 h-3.5 text-[#FF8A24]" />
          <span className="font-semibold">{deviceInfo.device_id}</span>
          <span className="text-[10px] text-[#A6A69A] hidden md:inline">({deviceInfo.firmware_version})</span>
        </div>

        {/* Connection status pill */}
        <ConnectionPill status={currentPacket.connection_status} mode={deviceInfo.connection_type} />
      </div>

      {/* Right: Active Alert Pill, Telemetry Time, Test Suite Jump, Sound Toggle */}
      <div className="flex items-center gap-3">
        {/* Active Alerts Pill */}
        <button
          onClick={() => setActiveView('alerts')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border transition-all ${
            activeAlerts.length > 0
              ? 'bg-[#FF4545]/15 border-[#FF4545] text-[#FF4545] animate-pulse'
              : 'bg-[#171714] border-[#34342B] text-[#A6A69A] hover:text-[#F4F1E9]'
          }`}
          title="Open Alert & Notification Engine"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="font-bold">{activeAlerts.length} ALERTS</span>
        </button>

        {/* Last Packet Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-[#A6A69A] px-2 py-1 bg-[#171714] border border-[#34342B]">
          <Clock className="w-3.5 h-3.5 text-[#FF8A24]" />
          <span>PKT:</span>
          <span className="text-[#F4F1E9]">{formattedTime} UTC</span>
        </div>

        {/* 127 Test Suite Shortcut */}
        <button
          onClick={() => setActiveView('tests')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-[#B6F23A] transition-colors"
          title="View 127 Automated Test Cases"
        >
          <TestTube2 className="w-3.5 h-3.5" />
          <span className="font-semibold">127 TESTS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#54E38E]" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 text-[#A6A69A] hover:text-[#F4F1E9] hover:bg-[#20201B] border border-transparent hover:border-[#34342B] transition-colors"
          title={soundMuted ? 'Unmute Audio Warning Chimes' : 'Mute Warning Chimes'}
          aria-label="Toggle Sound"
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-[#FF4545]" /> : <Volume2 className="w-4 h-4 text-[#54E38E]" />}
        </button>
      </div>
    </header>
  );
};
