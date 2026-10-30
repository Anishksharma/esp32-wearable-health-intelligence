import { DocumentDomain, ExtractedTableData } from '../types/document';

export interface ClassificationResult {
  domain: DocumentDomain;
  domainConfidence: number;
  industry: string;
  isWearableTelemetry: boolean;
  detectedEntities: string[];
}

export class DocumentClassifier {
  public static classify(
    fileName: string,
    rawText = '',
    tableData?: ExtractedTableData
  ): ClassificationResult {
    const combinedContent = (
      fileName +
      ' ' +
      rawText.slice(0, 5000) +
      ' ' +
      (tableData?.headers.join(' ') || '')
    ).toLowerCase();

    // Check Wearable Telemetry specific signature
    const hasWearableCols = 
      (combinedContent.includes('heart_rate') || combinedContent.includes('bpm') || combinedContent.includes('pulse')) &&
      (combinedContent.includes('spo2') || combinedContent.includes('oximeter') || combinedContent.includes('oxygen')) &&
      (combinedContent.includes('temp') || combinedContent.includes('temperature'));
    
    const isWearableTelemetry = hasWearableCols || combinedContent.includes('esp32_wearable') || combinedContent.includes('max30100');

    // Domain scoring
    const scores: Record<DocumentDomain, number> = {
      HEALTHCARE_BIOMEDICAL: 0,
      IOT_TELEMETRY: 0,
      SCIENTIFIC_RESEARCH: 0,
      FINANCIAL_BUSINESS: 0,
      INDUSTRIAL_OPERATIONS: 0,
      TECHNICAL_SPECIFICATION: 0,
      GENERAL_TABULAR: 1, // base score
    };

    // Keyword weights
    const healthKeywords = ['heart', 'bpm', 'spo2', 'pulse', 'vital', 'patient', 'clinical', 'ecg', 'blood', 'systolic', 'diastolic', 'doctor', 'hospital', 'icu', 'oxygen'];
    const iotKeywords = ['device_id', 'esp32', 'telemetry', 'payload', 'voltage', 'rssi', 'packet', 'sensor', 'gpio', 'mqtt', 'ble', 'firmware', 'wifi'];
    const researchKeywords = ['abstract', 'hypothesis', 'methodology', 'p-value', 'experiment', 'cohort', 'trial', 'peer-reviewed', 'citation', 'statistical'];
    const financeKeywords = ['revenue', 'profit', 'ebitda', 'expense', 'margin', 'quarterly', 'q1', 'q2', 'q3', 'q4', 'fiscal', 'balance', 'roi', 'cagr'];
    const industrialKeywords = ['rpm', 'pressure', 'psi', 'bar', 'vibration', 'temperature_bearing', 'maintenance', 'uptime', 'motor', 'turbine', 'factory'];
    const techKeywords = ['specification', 'datasheet', 'pinout', 'register', 'i2c', 'spi', 'uart', 'baud', 'microcontroller', 'schematic'];

    healthKeywords.forEach((k) => { if (combinedContent.includes(k)) scores.HEALTHCARE_BIOMEDICAL += 2; });
    iotKeywords.forEach((k) => { if (combinedContent.includes(k)) scores.IOT_TELEMETRY += 2; });
    researchKeywords.forEach((k) => { if (combinedContent.includes(k)) scores.SCIENTIFIC_RESEARCH += 2; });
    financeKeywords.forEach((k) => { if (combinedContent.includes(k)) scores.FINANCIAL_BUSINESS += 2; });
    industrialKeywords.forEach((k) => { if (combinedContent.includes(k)) scores.INDUSTRIAL_OPERATIONS += 2; });
    techKeywords.forEach((k) => { if (combinedContent.includes(k)) scores.TECHNICAL_SPECIFICATION += 2; });

    if (isWearableTelemetry) {
      scores.HEALTHCARE_BIOMEDICAL += 5;
      scores.IOT_TELEMETRY += 4;
    }

    let bestDomain: DocumentDomain = 'GENERAL_TABULAR';
    let maxScore = 0;
    (Object.keys(scores) as DocumentDomain[]).forEach((domain) => {
      if (scores[domain] > maxScore) {
        maxScore = scores[domain];
        bestDomain = domain;
      }
    });

    const confidence = Math.min(0.98, Math.max(0.60, maxScore / 15));

    const industryMap: Record<DocumentDomain, string> = {
      HEALTHCARE_BIOMEDICAL: 'Digital Health & Biomedical Instrumentation',
      IOT_TELEMETRY: 'Embedded Systems & Connected IoT Telemetry',
      SCIENTIFIC_RESEARCH: 'Academic & Laboratory Experimental Science',
      FINANCIAL_BUSINESS: 'Corporate Finance & Commercial Operations',
      INDUSTRIAL_OPERATIONS: 'Industrial Automation & Machinery Telematics',
      TECHNICAL_SPECIFICATION: 'Hardware Engineering & Microelectronics',
      GENERAL_TABULAR: 'General Analytical Data Science',
    };

    // Extract notable entities
    const detectedEntities: string[] = [];
    if (combinedContent.includes('esp32')) detectedEntities.push('ESP32 Dual-Core MCU');
    if (combinedContent.includes('max30100')) detectedEntities.push('MAX30100 Photoplethysmography Sensor');
    if (combinedContent.includes('ds18b20')) detectedEntities.push('DS18B20 1-Wire Thermal Probe');
    if (combinedContent.includes('ble') || combinedContent.includes('bluetooth')) detectedEntities.push('Bluetooth Low Energy 4.2/5.0');
    if (combinedContent.includes('wifi') || combinedContent.includes('rssi')) detectedEntities.push('802.11 b/g/n Wi-Fi Interface');

    return {
      domain: bestDomain,
      domainConfidence: Number(confidence.toFixed(2)),
      industry: industryMap[bestDomain],
      isWearableTelemetry,
      detectedEntities,
    };
  }
}
