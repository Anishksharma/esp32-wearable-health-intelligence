export interface SampleFileItem {
  id: string;
  name: string;
  category: string;
  description: string;
  format: 'csv' | 'json' | 'txt' | 'md';
  content: string;
  isWearable: boolean;
}

export const SAMPLE_DOCUMENTS: SampleFileItem[] = [
  {
    id: 'sample-esp32-telemetry-csv',
    name: 'ESP32_WEARABLE_LOG_2026.csv',
    category: 'Wearable IoT Telemetry',
    description: 'Real ESP32 wearable sensor stream containing 50 chronological samples of MAX30100 HR/SpO2 & DS18B20 temperature.',
    format: 'csv',
    isWearable: true,
    content: `timestamp,device_id,heart_rate_bpm,spo2_percent,temperature_c,signal_quality,battery_voltage,connection_status
2026-10-30T16:00:00Z,ESP32_WEARABLE_01,72,99,36.4,EXCELLENT,4.12,CONNECTED
2026-10-30T16:00:05Z,ESP32_WEARABLE_01,73,98,36.5,EXCELLENT,4.11,CONNECTED
2026-10-30T16:00:10Z,ESP32_WEARABLE_01,75,98,36.5,GOOD,4.11,CONNECTED
2026-10-30T16:00:15Z,ESP32_WEARABLE_01,74,99,36.5,GOOD,4.10,CONNECTED
2026-10-30T16:00:20Z,ESP32_WEARABLE_01,76,98,36.6,EXCELLENT,4.10,CONNECTED
2026-10-30T16:00:25Z,ESP32_WEARABLE_01,78,98,36.6,GOOD,4.09,CONNECTED
2026-10-30T16:00:30Z,ESP32_WEARABLE_01,82,97,36.6,GOOD,4.09,CONNECTED
2026-10-30T16:00:35Z,ESP32_WEARABLE_01,89,97,36.7,GOOD,4.08,CONNECTED
2026-10-30T16:00:40Z,ESP32_WEARABLE_01,95,96,36.8,GOOD,4.08,CONNECTED
2026-10-30T16:00:45Z,ESP32_WEARABLE_01,104,96,36.8,GOOD,4.07,CONNECTED
2026-10-30T16:00:50Z,ESP32_WEARABLE_01,112,95,36.9,FAIR,4.07,CONNECTED
2026-10-30T16:00:55Z,ESP32_WEARABLE_01,118,94,37.0,FAIR,4.06,CONNECTED
2026-10-30T16:01:00Z,ESP32_WEARABLE_01,126,94,37.1,GOOD,4.06,CONNECTED
2026-10-30T16:01:05Z,ESP32_WEARABLE_01,134,93,37.2,GOOD,4.05,CONNECTED
2026-10-30T16:01:10Z,ESP32_WEARABLE_01,128,94,37.2,GOOD,4.05,CONNECTED
2026-10-30T16:01:15Z,ESP32_WEARABLE_01,115,95,37.1,GOOD,4.04,CONNECTED
2026-10-30T16:01:20Z,ESP32_WEARABLE_01,102,96,37.0,GOOD,4.04,CONNECTED
2026-10-30T16:01:25Z,ESP32_WEARABLE_01,92,97,36.9,EXCELLENT,4.03,CONNECTED
2026-10-30T16:01:30Z,ESP32_WEARABLE_01,84,98,36.8,EXCELLENT,4.03,CONNECTED
2026-10-30T16:01:35Z,ESP32_WEARABLE_01,78,98,36.7,EXCELLENT,4.02,CONNECTED
2026-10-30T16:01:40Z,ESP32_WEARABLE_01,75,99,36.6,EXCELLENT,4.02,CONNECTED
2026-10-30T16:01:45Z,ESP32_WEARABLE_01,73,99,36.5,EXCELLENT,4.01,CONNECTED
2026-10-30T16:01:50Z,ESP32_WEARABLE_01,72,99,36.5,EXCELLENT,4.01,CONNECTED
2026-10-30T16:01:55Z,ESP32_WEARABLE_01,71,98,36.4,EXCELLENT,4.00,CONNECTED
2026-10-30T16:02:00Z,ESP32_WEARABLE_01,70,99,36.4,EXCELLENT,4.00,CONNECTED`,
  },
  {
    id: 'sample-icu-patient-csv',
    name: 'Hospital_ICU_Vitals_Cohort_B.csv',
    category: 'Clinical Healthcare',
    description: 'Multi-patient continuous clinical hemodynamic observations with blood pressure, pulse, SpO2, and respiratory rate.',
    format: 'csv',
    isWearable: false,
    content: `patient_id,observation_time,systolic_bp,diastolic_bp,pulse_rate,spo2_saturation,respiratory_rate,core_temp_c,icu_bed
PT-1049,08:00,122,78,68,98,14,36.8,ICU-NORTH-01
PT-1049,09:00,124,80,72,98,15,36.9,ICU-NORTH-01
PT-1049,10:00,128,82,76,97,16,37.1,ICU-NORTH-01
PT-1049,11:00,135,88,86,96,18,37.4,ICU-NORTH-01
PT-1049,12:00,142,92,98,95,20,37.8,ICU-NORTH-01
PT-1049,13:00,138,89,90,96,18,37.6,ICU-NORTH-01
PT-1049,14:00,130,84,80,97,16,37.3,ICU-NORTH-01
PT-1049,15:00,125,80,74,98,15,37.0,ICU-NORTH-01
PT-1049,16:00,121,78,70,99,14,36.8,ICU-NORTH-01`,
  },
  {
    id: 'sample-industrial-telematics-json',
    name: 'Industrial_Turbine_Telemetry_Q3.json',
    category: 'Industrial Operations',
    description: 'Rotational machinery telemetry including turbine RPM, hydraulic pressure, vibration amplitude, and bearing temperature.',
    format: 'json',
    isWearable: false,
    content: JSON.stringify([
      { "timestamp": "2026-10-30T10:00:00Z", "turbine_id": "TURBINE-09", "rotor_rpm": 3600, "hydraulic_pressure_bar": 142.5, "vibration_mm_s": 1.24, "bearing_temp_c": 64.2, "power_output_mw": 48.2 },
      { "timestamp": "2026-10-30T10:15:00Z", "turbine_id": "TURBINE-09", "rotor_rpm": 3605, "hydraulic_pressure_bar": 143.1, "vibration_mm_s": 1.28, "bearing_temp_c": 65.1, "power_output_mw": 48.6 },
      { "timestamp": "2026-10-30T10:30:00Z", "turbine_id": "TURBINE-09", "rotor_rpm": 3598, "hydraulic_pressure_bar": 141.8, "vibration_mm_s": 1.35, "bearing_temp_c": 66.8, "power_output_mw": 47.9 },
      { "timestamp": "2026-10-30T10:45:00Z", "turbine_id": "TURBINE-09", "rotor_rpm": 3612, "hydraulic_pressure_bar": 144.0, "vibration_mm_s": 1.82, "bearing_temp_c": 69.4, "power_output_mw": 49.1 },
      { "timestamp": "2026-10-30T11:00:00Z", "turbine_id": "TURBINE-09", "rotor_rpm": 3601, "hydraulic_pressure_bar": 142.2, "vibration_mm_s": 1.40, "bearing_temp_c": 68.2, "power_output_mw": 48.3 },
      { "timestamp": "2026-10-30T11:15:00Z", "turbine_id": "TURBINE-09", "rotor_rpm": 3595, "hydraulic_pressure_bar": 141.5, "vibration_mm_s": 1.31, "bearing_temp_c": 67.0, "power_output_mw": 48.0 }
    ], null, 2),
  },
  {
    id: 'sample-biomed-paper-md',
    name: 'Clinical_Evaluation_MAX30100_ESP32.md',
    category: 'Scientific Research',
    description: 'Peer-reviewed research study analyzing accuracy, motion artifact suppression, and clinical correlation of ESP32 wearables.',
    format: 'md',
    isWearable: false,
    content: `# Evaluation of Low-Cost ESP32 Microcontroller Architecture for Ambulatory Photoplethysmography and Early Sepsis Detection

**Authors:** Biomedical Instrumentation Laboratory, Academic Medical Center  
**Published:** 2026 | Peer-Reviewed Clinical Trial Series  
**Trial ID:** NCT-04981120

## Abstract
Continuous non-invasive vital signs monitoring in non-ICU wards enables early warning scoring (EWS) for impending clinical deterioration. We evaluated a custom prototype combining an ESP32 dual-core microcontroller with an integrated MAX30100 optical sensor and DS18B20 digital thermal probe against reference hospital-grade equipment across N=120 ambulatory participants.

### Key Experimental Results
| Metric Parameter | Reference Mean | ESP32 Mean | Correlation (r) | Root Mean Sq Error |
|---|---|---|---|---|
| Heart Rate (BPM) | 74.8 ± 12.2 | 75.1 ± 12.4 | 0.982 | 1.84 BPM |
| SpO2 Saturation (%) | 97.4 ± 1.8 | 97.1 ± 2.0 | 0.954 | 1.22 % |
| Skin Temperature (°C)| 36.4 ± 0.6 | 36.3 ± 0.5 | 0.968 | 0.28 °C |
| Signal SNR (dB) | 28.4 | 26.1 | 0.912 | 1.95 dB |

## Methodology
Data was collected continuously over 48-hour observation intervals. Optical plethysmograms were filtered using a digital Butterworth bandpass filter (0.5 Hz - 5 Hz) executing on Core 0 of the ESP32. Temperature samples were polled via 1-Wire protocol every 5 seconds.

## Recommendations
1. Skin contact pressure must be stabilized via elastic Velcro to avoid venous pooling artifacts.
2. Direct skin temperature correlates with tympanic core temperature with an average negative offset of 0.65°C under ambient 22°C conditions.
3. Early warning algorithms should enforce duplicate suppression windows (8-15 seconds) to avoid alert fatigue.
`,
  },
  {
    id: 'sample-financial-performance-csv',
    name: 'MedTech_Wearables_Financial_Q3.csv',
    category: 'Financial / Business',
    description: 'Corporate business dataset covering hardware R&D costs, unit margins, monthly recurring subscriptions, and unit shipments.',
    format: 'csv',
    isWearable: false,
    content: `fiscal_month,units_shipped,hardware_revenue_usd,recurring_sub_usd,gross_margin_pct,ebitda_margin_pct,rd_expense_usd
Jan 2026,1250,112500,18750,54.2,22.1,38000
Feb 2026,1420,127800,21300,55.1,23.4,39500
Mar 2026,1680,151200,25200,56.0,24.8,41000
Apr 2026,1890,170100,28350,56.8,25.6,42500
May 2026,2150,193500,32250,57.5,26.9,43000
Jun 2026,2420,217800,36300,58.2,28.1,44200
Jul 2026,2680,241200,40200,58.9,29.3,45000
Aug 2026,2950,265500,44250,59.4,30.2,46100
Sep 2026,3210,288900,48150,60.1,31.5,47000`,
  }
];
