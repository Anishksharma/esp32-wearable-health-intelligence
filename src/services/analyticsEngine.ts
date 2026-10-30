import { TelemetryPacket } from '../types/telemetry';

export interface HealthAnalyticsReport {
  sampleCount: number;
  timeSpanMinutes: number;
  heartRate: {
    mean: number;
    min: number;
    max: number;
    hrvRmssdApproxMs: number; // Root Mean Square of Successive Differences
    sdnnApproxMs: number;
    tachycardiaBursts: number;
    bradycardiaDips: number;
  };
  spo2: {
    mean: number;
    min: number;
    max: number;
    stabilityIndexPercent: number; // 0-100
    desaturationEvents: number; // SpO2 < 92%
  };
  temperature: {
    meanSkinTempC: number;
    minC: number;
    maxC: number;
    estimatedCoreEquivalentC: number; // with clear non-clinical annotation
    thermalDriftPerHour: number;
  };
  reliability: {
    packetDropRatePercent: number;
    sensorContactRatio: number; // 0-100
    missingTelemetrySeconds: number;
    sensorUptimePercent: number;
  };
  clinicalDisclaimer: string;
}

export class AnalyticsEngine {
  public static calculate(packets: TelemetryPacket[]): HealthAnalyticsReport {
    const disclaimer = 
      "EDUCATIONAL PROTOTYPE NOTICE: This system provides engineering telemetry demonstration only. " +
      "It does NOT perform clinical medical diagnosis, disease detection, or medical treatment monitoring. " +
      "Skin contact temperature differs from internal core temperature. Do not make medical decisions based on these readings.";

    if (!packets || packets.length === 0) {
      return {
        sampleCount: 0,
        timeSpanMinutes: 0,
        heartRate: { mean: 72, min: 72, max: 72, hrvRmssdApproxMs: 38, sdnnApproxMs: 45, tachycardiaBursts: 0, bradycardiaDips: 0 },
        spo2: { mean: 98, min: 98, max: 98, stabilityIndexPercent: 99, desaturationEvents: 0 },
        temperature: { meanSkinTempC: 36.5, minC: 36.5, maxC: 36.5, estimatedCoreEquivalentC: 37.1, thermalDriftPerHour: 0 },
        reliability: { packetDropRatePercent: 0, sensorContactRatio: 100, missingTelemetrySeconds: 0, sensorUptimePercent: 100 },
        clinicalDisclaimer: disclaimer,
      };
    }

    const validPackets = packets.filter((p) => p.heart_rate_bpm > 0);
    const count = packets.length;

    // Time span
    const firstTs = new Date(packets[0].timestamp).getTime();
    const lastTs = new Date(packets[packets.length - 1].timestamp).getTime();
    const spanMinutes = Math.max(1, Math.round(Math.abs(lastTs - firstTs) / 60000));

    // Heart Rate stats
    const hrVals = validPackets.map((p) => p.heart_rate_bpm);
    const hrMean = hrVals.length > 0 ? hrVals.reduce((a, b) => a + b, 0) / hrVals.length : 72;
    const hrMin = hrVals.length > 0 ? Math.min(...hrVals) : 72;
    const hrMax = hrVals.length > 0 ? Math.max(...hrVals) : 72;

    // Approximate RR interval differences in ms: RR = 60000 / BPM
    let sumSquaredDiffs = 0;
    let validPairs = 0;
    for (let i = 1; i < hrVals.length; i++) {
      const rrCurrent = 60000 / hrVals[i];
      const rrPrev = 60000 / hrVals[i - 1];
      sumSquaredDiffs += Math.pow(rrCurrent - rrPrev, 2);
      validPairs++;
    }
    const rmssd = validPairs > 0 ? Math.sqrt(sumSquaredDiffs / validPairs) : 42;

    const variance = hrVals.reduce((a, b) => a + Math.pow(b - hrMean, 2), 0) / (hrVals.length || 1);
    const sdnn = Math.sqrt(variance) * 10; // scaled approx

    const tachy = hrVals.filter((v) => v > 100).length;
    const brady = hrVals.filter((v) => v < 60).length;

    // SpO2 stats
    const spo2Vals = validPackets.map((p) => p.spo2_percent).filter((v) => v > 0);
    const spo2Mean = spo2Vals.length > 0 ? spo2Vals.reduce((a, b) => a + b, 0) / spo2Vals.length : 98;
    const spo2Min = spo2Vals.length > 0 ? Math.min(...spo2Vals) : 98;
    const spo2Max = spo2Vals.length > 0 ? Math.max(...spo2Vals) : 98;
    const desat = spo2Vals.filter((v) => v < 92).length;
    const spo2Variance = spo2Vals.reduce((a, b) => a + Math.pow(b - spo2Mean, 2), 0) / (spo2Vals.length || 1);
    const stabilityIndex = Math.max(60, Math.min(100, Math.round(100 - Math.sqrt(spo2Variance) * 8)));

    // Temperature stats
    const tempVals = packets.map((p) => p.temperature_c).filter((v) => !isNaN(v) && v > 10);
    const tempMean = tempVals.length > 0 ? tempVals.reduce((a, b) => a + b, 0) / tempVals.length : 36.5;
    const tempMin = tempVals.length > 0 ? Math.min(...tempVals) : 36.5;
    const tempMax = tempVals.length > 0 ? Math.max(...tempVals) : 36.5;
    // Skin contact to core estimation: standard empirical difference is ~0.6°C to 0.8°C depending on ambient exposure
    const coreEstimate = tempMean + 0.65;
    const thermalDrift = tempVals.length > 1 ? ((tempVals[tempVals.length - 1] - tempVals[0]) / spanMinutes) * 60 : 0;

    // Reliability
    const poorSignalCount = packets.filter((p) => p.signal_quality === 'POOR' || p.signal_quality === 'DISCONNECTED').length;
    const contactRatio = Math.round(((count - poorSignalCount) / count) * 100);
    const dropRate = packets.filter((p) => p.connection_status !== 'CONNECTED').length / count;

    return {
      sampleCount: count,
      timeSpanMinutes: spanMinutes,
      heartRate: {
        mean: Number(hrMean.toFixed(1)),
        min: hrMin,
        max: hrMax,
        hrvRmssdApproxMs: Number(rmssd.toFixed(1)),
        sdnnApproxMs: Number(sdnn.toFixed(1)),
        tachycardiaBursts: tachy,
        bradycardiaDips: brady,
      },
      spo2: {
        mean: Number(spo2Mean.toFixed(1)),
        min: spo2Min,
        max: spo2Max,
        stabilityIndexPercent: stabilityIndex,
        desaturationEvents: desat,
      },
      temperature: {
        meanSkinTempC: Number(tempMean.toFixed(2)),
        minC: Number(tempMin.toFixed(2)),
        maxC: Number(tempMax.toFixed(2)),
        estimatedCoreEquivalentC: Number(coreEstimate.toFixed(2)),
        thermalDriftPerHour: Number(thermalDrift.toFixed(2)),
      },
      reliability: {
        packetDropRatePercent: Number((dropRate * 100).toFixed(1)),
        sensorContactRatio: contactRatio,
        missingTelemetrySeconds: Math.round(poorSignalCount * 1.5),
        sensorUptimePercent: Math.max(0, 100 - Math.round(dropRate * 100)),
      },
      clinicalDisclaimer: disclaimer,
    };
  }
}
