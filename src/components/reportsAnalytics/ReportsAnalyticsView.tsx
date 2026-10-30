import React, { useMemo } from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { useAlertStore } from '../../store/useAlertStore';
import { AnalyticsEngine } from '../../services/analyticsEngine';
import { BarChart3, Activity, Heart, Droplet, Thermometer, ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ReportsAnalyticsView: React.FC = () => {
  const packetBuffer = useHealthStore((state) => state.packetBuffer);
  const alerts = useAlertStore((state) => state.alerts);

  const analytics = useMemo(() => {
    return AnalyticsEngine.calculate(packetBuffer);
  }, [packetBuffer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF8A24]" />
            HEALTH ANALYTICS & INSIGHTS ENGINE
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            PHYSIOLOGICAL TRENDS // HRV RMSSD // THERMAL GRADIENT // RELIABILITY METRICS
          </p>
        </div>

        <Badge variant="lime">NON-DIAGNOSTIC TELEMETRY</Badge>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer Banner */}
      <div className="bg-[#10100E] border border-[#FFB547]/50 p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#FFB547] shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-[#A6A69A] leading-relaxed">
          <strong className="text-[#F4F1E9] font-mono uppercase block mb-1">
            CLINICAL DISCLAIMER & MEASUREMENT LIMITATIONS:
          </strong>
          {analytics.clinicalDisclaimer}
        </p>
      </div>

      {/* 4 Analytics Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Heart Rate & Variability */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                HEART RATE DYNAMICS & HRV
              </h3>
            </div>
            <span className="text-xs font-mono text-[#FF8A24]">{analytics.heartRate.mean} BPM MEAN</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">HRV (RMSSD APPROX):</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.heartRate.hrvRmssdApproxMs} ms</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">SDNN (VARIABILITY):</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.heartRate.sdnnApproxMs} ms</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">TACHYCARDIA EPISODES (&gt;100):</span>
              <span className="text-[#FFB547] font-bold">{analytics.heartRate.tachycardiaBursts}</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">BRADYCARDIA DIPS (&lt;60):</span>
              <span className="text-[#B6F23A] font-bold">{analytics.heartRate.bradycardiaDips}</span>
            </div>
          </div>
        </div>

        {/* 2. SpO2 Saturation Stability */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-[#B6F23A]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                SPO2 SATURATION STABILITY
              </h3>
            </div>
            <span className="text-xs font-mono text-[#B6F23A]">{analytics.spo2.mean}% MEAN</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">STABILITY INDEX:</span>
              <span className="text-[#54E38E] font-bold">{analytics.spo2.stabilityIndexPercent}%</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">DESATURATION EVENTS (&lt;92%):</span>
              <span className="text-[#FF4545] font-bold">{analytics.spo2.desaturationEvents}</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">MIN SATURATION:</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.spo2.min}%</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">MAX SATURATION:</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.spo2.max}%</span>
            </div>
          </div>
        </div>

        {/* 3. Temperature & Core Gradient */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#FFB547]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                THERMAL DYNAMICS & GRADIENT
              </h3>
            </div>
            <span className="text-xs font-mono text-[#FFB547]">{analytics.temperature.meanSkinTempC}°C SKIN</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">SENSOR SURFACE (SKIN):</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.temperature.meanSkinTempC}°C</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">ESTIMATED INTERNAL CORE EQUIV:</span>
              <span className="text-[#FF8A24] font-bold">{analytics.temperature.estimatedCoreEquivalentC}°C</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">CALCULATED OFFSET:</span>
              <span className="text-[#A6A69A]">+0.65°C empirical adjustment</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">HOURLY DRIFT:</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.temperature.thermalDriftPerHour} °C/h</span>
            </div>
          </div>
        </div>

        {/* 4. Hardware Reliability & Signal */}
        <div className="bg-[#171714] border border-[#34342B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase text-[#F4F1E9]">
                RELIABILITY & PACKET TELEMETRY
              </h3>
            </div>
            <span className="text-xs font-mono text-[#54E38E]">{analytics.reliability.sensorUptimePercent}% UPTIME</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">SENSOR CONTACT RATIO:</span>
              <span className="text-[#54E38E] font-bold">{analytics.reliability.sensorContactRatio}%</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">PACKET DROP RATE:</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.reliability.packetDropRatePercent}%</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">SAMPLE OBSERVATIONS:</span>
              <span className="text-[#F4F1E9] font-bold">{analytics.sampleCount} packets</span>
            </div>
            <div className="flex justify-between p-2 bg-[#10100E] border border-[#23231D]">
              <span className="text-[#6B6B5F]">ALERT INCIDENTS:</span>
              <span className="text-[#FF8A24] font-bold">{alerts.length} logged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
