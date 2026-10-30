import React from 'react';
import { useSimulationStore, SCENARIOS } from '../../store/useSimulationStore';
import { useHealthStore } from '../../store/useHealthStore';
import { FlaskConical, Play, Pause, RotateCcw, FastForward, Sliders, ShieldAlert, Cpu } from 'lucide-react';
import { Badge } from '../common/Badge';

export const SimulationLabView: React.FC = () => {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const pauseSimulation = useSimulationStore((state) => state.pauseSimulation);
  const resumeSimulation = useSimulationStore((state) => state.resumeSimulation);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const simulationSpeed = useSimulationStore((state) => state.simulationSpeed);
  const setSpeed = useSimulationStore((state) => state.setSpeed);
  const selectedScenarioId = useSimulationStore((state) => state.selectedScenarioId);
  const selectScenario = useSimulationStore((state) => state.selectScenario);
  const tickCount = useSimulationStore((state) => state.tickCount);

  const manualOverrideActive = useHealthStore((state) => state.manualOverrideActive);
  const toggleManualOverride = useHealthStore((state) => state.toggleManualOverride);
  const manualOverrides = useHealthStore((state) => state.manualOverrides);
  const setManualOverrides = useHealthStore((state) => state.setManualOverrides);
  const dispatchTick = useSimulationStore((state) => state.dispatchTick);

  const handleSliderChange = (key: keyof typeof manualOverrides, val: any) => {
    if (!manualOverrideActive) toggleManualOverride(true);
    setManualOverrides({ [key]: val });
    dispatchTick();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#FF8A24]" />
            WEARABLE TELEMETRY SIMULATION LAB & TESTBENCH
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            10 REPRODUCIBLE SCENARIOS // HARDWARE IN THE LOOP (HIL) SYNTHESIZER
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="amber" className="text-xs">DEMO WATERMARK ACTIVE</Badge>
          <span className="text-xs font-mono text-[#A6A69A]">TICKS: #{tickCount}</span>
        </div>
      </div>

      {/* Playback Controls & Speed Multipliers */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Play / Pause / Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => (isRunning ? pauseSimulation() : resumeSimulation())}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all ${
              isRunning
                ? 'bg-[#20201B] border border-[#34342B] text-[#FFB547] hover:bg-[#34342B]'
                : 'bg-[#54E38E] text-[#0B0B0A] hover:bg-[#43c477]'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'PAUSE SIMULATION' : 'RESUME SIMULATION'}</span>
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] font-mono text-xs text-[#A6A69A] hover:text-[#F4F1E9] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET TO BASELINE</span>
          </button>
        </div>

        {/* Speed Scaler */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#A6A69A] flex items-center gap-1">
            <FastForward className="w-3.5 h-3.5 text-[#FF8A24]" />
            SPEED:
          </span>
          {[0.5, 1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-2.5 py-1 border transition-all ${
                simulationSpeed === spd
                  ? 'bg-[#FF8A24] text-[#0B0B0A] font-bold border-[#FF8A24]'
                  : 'bg-[#10100E] border-[#34342B] text-[#A6A69A] hover:text-[#F4F1E9]'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* The 10 Scenarios Grid */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-4">
        <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9] border-b border-[#34342B] pb-2">
          SELECT REPRODUCIBLE CLINICAL OR HARDWARE SCENARIO (1 - 10)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenarioId === sc.id && !manualOverrideActive;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  toggleManualOverride(false);
                  selectScenario(sc.id);
                }}
                className={`p-3.5 border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#FF8A24]/10 border-[#FF8A24]'
                    : 'bg-[#10100E] border-[#34342B] hover:border-[#6B6B5F]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className={`font-mono text-xs font-bold ${isSelected ? 'text-[#FF8A24]' : 'text-[#F4F1E9]'}`}>
                    {sc.name}
                  </h4>
                  <Badge variant={sc.category === 'PHYSIOLOGICAL' ? 'orange' : sc.category === 'HARDWARE_FAULT' ? 'red' : 'amber'}>
                    {sc.category}
                  </Badge>
                </div>

                <p className="text-xs font-sans text-[#A6A69A] leading-relaxed mb-2">
                  {sc.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-[#6B6B5F] pt-2 border-t border-[#23231D]">
                  <span>HR: <strong className="text-[#FF8A24]">{sc.expectedHeartRate} BPM</strong></span>
                  <span>SpO2: <strong className="text-[#B6F23A]">{sc.expectedSpO2}%</strong></span>
                  <span>Temp: <strong className="text-[#FFB547]">{sc.expectedTemperature}°C</strong></span>
                  <span>Signal: <strong className="text-[#F4F1E9]">{sc.signalQuality}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Sensor Slider Tuner */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF8A24]" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              LIVE SENSOR POTENTIOMETER TUNING (MANUAL OVERRIDES)
            </h3>
          </div>
          {manualOverrideActive && (
            <button
              onClick={() => toggleManualOverride(false)}
              className="text-xs font-mono text-[#FF8A24] hover:underline"
            >
              Revert to Scenario Presets
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Heart Rate Slider */}
          <div className="space-y-2 p-3 bg-[#10100E] border border-[#34342B]">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#A6A69A]">HEART RATE:</span>
              <span className="text-[#FF8A24] font-bold text-sm">{manualOverrides.heartRate} BPM</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={manualOverrides.heartRate}
              onChange={(e) => handleSliderChange('heartRate', Number(e.target.value))}
              className="w-full accent-[#FF8A24] bg-[#20201B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6B6B5F]">
              <span>0 (Off)</span>
              <span>72 (Norm)</span>
              <span>140 (Crit Tachy)</span>
            </div>
          </div>

          {/* SpO2 Slider */}
          <div className="space-y-2 p-3 bg-[#10100E] border border-[#34342B]">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#A6A69A]">SPO2 OXYGEN:</span>
              <span className="text-[#B6F23A] font-bold text-sm">{manualOverrides.spo2}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={manualOverrides.spo2}
              onChange={(e) => handleSliderChange('spo2', Number(e.target.value))}
              className="w-full accent-[#B6F23A] bg-[#20201B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6B6B5F]">
              <span>70 (Crit Hypox)</span>
              <span>94 (Warn)</span>
              <span>99 (Optimal)</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2 p-3 bg-[#10100E] border border-[#34342B]">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#A6A69A]">TEMPERATURE:</span>
              <span className="text-[#FFB547] font-bold text-sm">{manualOverrides.temperature.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="33.0"
              max="42.0"
              step="0.1"
              value={manualOverrides.temperature}
              onChange={(e) => handleSliderChange('temperature', Number(e.target.value))}
              className="w-full accent-[#FFB547] bg-[#20201B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6B6B5F]">
              <span>33.0 (Hypo)</span>
              <span>36.6 (Norm)</span>
              <span>39.5 (Fever)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
