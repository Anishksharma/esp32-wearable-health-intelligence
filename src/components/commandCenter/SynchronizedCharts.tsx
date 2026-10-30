import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { useHealthStore } from '../../store/useHealthStore';
import { useAlertStore } from '../../store/useAlertStore';
import { Activity, Droplet, Thermometer, SlidersHorizontal } from 'lucide-react';

export const SynchronizedCharts: React.FC = () => {
  const packetBuffer = useHealthStore((state) => state.packetBuffer);
  const timeFilter = useHealthStore((state) => state.timeFilter);
  const setTimeFilter = useHealthStore((state) => state.setTimeFilter);
  const thresholds = useAlertStore((state) => state.thresholds);

  // Filter slice based on timeFilter
  const chartData = React.useMemo(() => {
    const total = packetBuffer.length;
    let sliceCount = 30;
    if (timeFilter === '1m') sliceCount = 15;
    else if (timeFilter === '5m') sliceCount = 30;
    else if (timeFilter === '15m') sliceCount = 60;
    else if (timeFilter === '1h') sliceCount = 100;
    else if (timeFilter === '24h') sliceCount = total;

    return packetBuffer.slice(-sliceCount).map((p) => ({
      time: p.timestamp.includes('T') ? p.timestamp.split('T')[1].slice(0, 8) : p.timestamp,
      heartRate: p.heart_rate_bpm,
      spo2: p.spo2_percent,
      temperature: p.temperature_c,
      signal: p.signal_quality,
    }));
  }, [packetBuffer, timeFilter]);

  // Statistics for Heart Rate
  const hrStats = React.useMemo(() => {
    const vals = chartData.map((d) => d.heartRate).filter((v) => v > 0);
    if (vals.length === 0) return { min: 72, max: 72, avg: 72 };
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    };
  }, [chartData]);

  // Statistics for SpO2
  const spo2Stats = React.useMemo(() => {
    const vals = chartData.map((d) => d.spo2).filter((v) => v > 0);
    if (vals.length === 0) return { current: 98, change: 0 };
    const current = vals[vals.length - 1];
    const prev = vals[0] || current;
    const change = Number((current - prev).toFixed(1));
    return { current, change };
  }, [chartData]);

  // Statistics for Temperature
  const tempStats = React.useMemo(() => {
    const vals = chartData.map((d) => d.temperature).filter((v) => v > 10);
    if (vals.length === 0) return { current: 36.5, min: 36.5, max: 36.5 };
    return {
      current: vals[vals.length - 1],
      min: Math.min(...vals).toFixed(1),
      max: Math.max(...vals).toFixed(1),
    };
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* Top Header with Synchronized Time Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#171714] border border-[#34342B] p-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#FF8A24]" />
          <span className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
            SYNCHRONIZED TELEMETRY TIME SERIES
          </span>
          <span className="text-xs font-mono text-[#6B6B5F] hidden md:inline">
            // MAX30100 & DS18B20 LIVE STREAMS
          </span>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1">
          {(['1m', '5m', '15m', '1h', '24h'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-2.5 py-1 text-xs font-mono border transition-all ${
                timeFilter === filter
                  ? 'bg-[#FF8A24] text-[#0B0B0A] font-bold border-[#FF8A24]'
                  : 'bg-[#20201B] text-[#A6A69A] border-[#34342B] hover:text-[#F4F1E9] hover:bg-[#34342B]'
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* CHART 1: HEART RATE (ORANGE) */}
      <div className="bg-[#171714] border border-[#34342B] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF8A24]" />
            <h4 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              HEART RATE (MAX30100 OPTICAL PPG)
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#A6A69A]">
            <span>MIN: <strong className="text-[#F4F1E9]">{hrStats.min}</strong> BPM</span>
            <span>MAX: <strong className="text-[#F4F1E9]">{hrStats.max}</strong> BPM</span>
            <span>AVG: <strong className="text-[#FF8A24]">{hrStats.avg}</strong> BPM</span>
            <span className="text-[#FF4545] hidden sm:inline">HIGH THRESH: {thresholds.heartRateHighWarning} BPM</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} syncId="healthSync" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#23231D" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#6B6B5F" fontSize={10} fontFamily="DM Mono" tickLine={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#6B6B5F" fontSize={10} fontFamily="DM Mono" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171714', borderColor: '#34342B', fontFamily: 'DM Mono', fontSize: '11px', color: '#F4F1E9' }}
                formatter={(val: any) => [`${val} BPM`, 'Heart Rate']}
              />
              <ReferenceLine y={thresholds.heartRateHighCritical} stroke="#FF4545" strokeDasharray="4 4" label={{ value: 'CRIT 130', fill: '#FF4545', fontSize: 9, position: 'insideTopRight' }} />
              <ReferenceLine y={thresholds.heartRateHighWarning} stroke="#FFB547" strokeDasharray="3 3" label={{ value: 'WARN 100', fill: '#FFB547', fontSize: 9, position: 'insideTopRight' }} />
              <ReferenceLine y={thresholds.heartRateLowWarning} stroke="#FFB547" strokeDasharray="3 3" label={{ value: 'LOW 60', fill: '#FFB547', fontSize: 9, position: 'insideBottomRight' }} />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#FF8A24"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#FF8A24', stroke: '#0B0B0A', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: SPO2 (LIME GREEN) */}
      <div className="bg-[#171714] border border-[#34342B] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-[#B6F23A]" />
            <h4 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              SPO2 OXYGEN SATURATION (PULSE OXIMETRY)
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#A6A69A]">
            <span>DELTA: <strong className={spo2Stats.change < 0 ? 'text-[#FF4545]' : 'text-[#B6F23A]'}>{spo2Stats.change}%</strong></span>
            <span>QUALITY: <strong className="text-[#B6F23A]">GOOD</strong></span>
            <span className="text-[#FF4545] hidden sm:inline">LOW THRESH: {thresholds.spo2LowWarning}%</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} syncId="healthSync" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#23231D" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#6B6B5F" fontSize={10} fontFamily="DM Mono" tickLine={false} />
              <YAxis domain={[80, 102]} stroke="#6B6B5F" fontSize={10} fontFamily="DM Mono" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171714', borderColor: '#34342B', fontFamily: 'DM Mono', fontSize: '11px', color: '#F4F1E9' }}
                formatter={(val: any) => [`${val}%`, 'SpO2']}
              />
              <ReferenceLine y={thresholds.spo2LowCritical} stroke="#FF4545" strokeDasharray="4 4" label={{ value: 'CRIT 90%', fill: '#FF4545', fontSize: 9, position: 'insideBottomRight' }} />
              <ReferenceLine y={thresholds.spo2LowWarning} stroke="#FFB547" strokeDasharray="3 3" label={{ value: 'WARN 95%', fill: '#FFB547', fontSize: 9, position: 'insideBottomRight' }} />
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="#B6F23A"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#B6F23A', stroke: '#0B0B0A', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 3: TEMPERATURE (AMBER) */}
      <div className="bg-[#171714] border border-[#34342B] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#FFB547]" />
            <h4 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              SKIN TEMPERATURE (DS18B20 1-WIRE DIGITAL)
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#A6A69A]">
            <span>LOCATION: <strong className="text-[#F4F1E9]">WRIST / SKIN</strong></span>
            <span>RANGE: <strong className="text-[#FFB547]">{tempStats.min} - {tempStats.max} °C</strong></span>
            <span className="text-[#FF4545] hidden sm:inline">FEVER THRESH: {thresholds.temperatureHighWarning}°C</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} syncId="healthSync" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#23231D" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#6B6B5F" fontSize={10} fontFamily="DM Mono" tickLine={false} />
              <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#6B6B5F" fontSize={10} fontFamily="DM Mono" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171714', borderColor: '#34342B', fontFamily: 'DM Mono', fontSize: '11px', color: '#F4F1E9' }}
                formatter={(val: any) => [`${val} °C`, 'Skin Temperature']}
              />
              <ReferenceLine y={thresholds.temperatureHighCritical} stroke="#FF4545" strokeDasharray="4 4" label={{ value: 'FEVER 38.5°C', fill: '#FF4545', fontSize: 9, position: 'insideTopRight' }} />
              <ReferenceLine y={thresholds.temperatureHighWarning} stroke="#FFB547" strokeDasharray="3 3" label={{ value: 'WARN 37.5°C', fill: '#FFB547', fontSize: 9, position: 'insideTopRight' }} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#FFB547"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#FFB547', stroke: '#0B0B0A', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
