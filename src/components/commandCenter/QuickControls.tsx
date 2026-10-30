import React from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { useSimulationStore, SCENARIOS } from '../../store/useSimulationStore';
import { Sliders, Play, Pause, RotateCcw, AlertTriangle, Zap } from 'lucide-react';

export const QuickControls: React.FC = () => {
  const manualOverrideActive = useHealthStore((state) => state.manualOverrideActive);
  const toggleManualOverride = useHealthStore((state) => state.toggleManualOverride);
  const manualOverrides = useHealthStore((state) => state.manualOverrides);
  const setManualOverrides = useHealthStore((state) => state.setManualOverrides);

  const isRunning = useSimulationStore((state) => state.isRunning);
  const pauseSimulation = useSimulationStore((state) => state.pauseSimulation);
  const resumeSimulation = useSimulationStore((state) => state.resumeSimulation);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const selectedScenarioId = useSimulationStore((state) => state.selectedScenarioId);
  const selectScenario = useSimulationStore((state) => state.selectScenario);
  const dispatchTick = useSimulationStore((state) => state.dispatchTick);

  const handleOverrideChange = (field: keyof typeof manualOverrides, val: any) => {
    if (!manualOverrideActive) {
      toggleManualOverride(true);
    }
    setManualOverrides({ [field]: val });
    // Force immediate tick dispatch so KPIs and alerts trigger synchronously
    dispatchTick();
  };

  return (
    <div className="bg-[#171714] border border-[#34342B] p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#34342B] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FF8A24]" />
          <h4 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
            LIVE SENSOR OVERRIDES & SCENARIO INJECTION
          </h4>
        </div>

        {/* Playback actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => (isRunning ? pauseSimulation() : resumeSimulation())}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono border transition-all ${
              isRunning
                ? 'bg-[#20201B] border-[#34342B] text-[#FFB547] hover:bg-[#34342B]'
                : 'bg-[#54E38E] border-[#54E38E] text-[#0B0B0A] font-bold'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'PAUSE TELEMETRY' : 'RESUME TELEMETRY'}</span>
          </button>

          <button
            onClick={resetSimulation}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-[#20201B] border border-[#34342B] text-[#A6A69A] hover:text-[#F4F1E9] hover:bg-[#34342B] transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Quick Scenario Buttons */}
      <div>
        <label className="block text-[11px] font-mono uppercase text-[#A6A69A] mb-2">
          Quick Reproducible Scenario Preset:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SCENARIOS.slice(0, 5).map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                toggleManualOverride(false);
                selectScenario(sc.id);
              }}
              className={`p-2 text-left border text-xs font-mono transition-all ${
                selectedScenarioId === sc.id && !manualOverrideActive
                  ? 'bg-[#FF8A24]/15 border-[#FF8A24] text-[#FF8A24] font-semibold'
                  : 'bg-[#10100E] border-[#34342B] text-[#A6A69A] hover:text-[#F4F1E9] hover:border-[#6B6B5F]'
              }`}
            >
              <div className="truncate font-bold">{sc.name.split('. ')[1] || sc.name}</div>
              <div className="text-[10px] text-[#6B6B5F] truncate mt-0.5">{sc.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Sensor Value Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#34342B]">
        {/* Heart Rate Slider */}
        <div className="space-y-1.5 p-3 bg-[#10100E] border border-[#34342B]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A6A69A]">MANUAL HEART RATE:</span>
            <span className="text-[#FF8A24] font-bold">{manualOverrides.heartRate} BPM</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            value={manualOverrides.heartRate}
            onChange={(e) => handleOverrideChange('heartRate', Number(e.target.value))}
            className="w-full accent-[#FF8A24] bg-[#20201B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#6B6B5F]">
            <span>30 (Brady)</span>
            <span>72 (Norm)</span>
            <span>140 (Tachy)</span>
          </div>
        </div>

        {/* SpO2 Slider */}
        <div className="space-y-1.5 p-3 bg-[#10100E] border border-[#34342B]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A6A69A]">MANUAL SPO2 SAT:</span>
            <span className="text-[#B6F23A] font-bold">{manualOverrides.spo2} %</span>
          </div>
          <input
            type="range"
            min="75"
            max="100"
            value={manualOverrides.spo2}
            onChange={(e) => handleOverrideChange('spo2', Number(e.target.value))}
            className="w-full accent-[#B6F23A] bg-[#20201B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#6B6B5F]">
            <span>75 (Crit Hypox)</span>
            <span>93 (Warn)</span>
            <span>100 (Optimal)</span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-1.5 p-3 bg-[#10100E] border border-[#34342B]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A6A69A]">MANUAL TEMPERATURE:</span>
            <span className="text-[#FFB547] font-bold">{manualOverrides.temperature.toFixed(1)} °C</span>
          </div>
          <input
            type="range"
            min="34.0"
            max="41.0"
            step="0.1"
            value={manualOverrides.temperature}
            onChange={(e) => handleOverrideChange('temperature', Number(e.target.value))}
            className="w-full accent-[#FFB547] bg-[#20201B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#6B6B5F]">
            <span>34.0 (Hypo)</span>
            <span>36.6 (Norm)</span>
            <span>40.0 (Fever)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
