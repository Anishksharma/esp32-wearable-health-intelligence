export type DocumentFormat = 'csv' | 'xlsx' | 'xls' | 'json' | 'pdf' | 'txt' | 'md';

export type DocumentDomain = 
  | 'HEALTHCARE_BIOMEDICAL'
  | 'IOT_TELEMETRY'
  | 'SCIENTIFIC_RESEARCH'
  | 'FINANCIAL_BUSINESS'
  | 'INDUSTRIAL_OPERATIONS'
  | 'TECHNICAL_SPECIFICATION'
  | 'GENERAL_TABULAR';

export type MetricTraceabilityType = 'DOCUMENT_FACT' | 'CALCULATED_METRIC' | 'FORECAST' | 'AI_INTERPRETATION';

export interface ExtractedMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  type: MetricTraceabilityType;
  sourceReference: string; // e.g. "Column 'HeartRate_BPM', row 42" or "Section 3.2"
  calculationDetails?: string;
}

export interface ExtractedChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'scatter' | 'pie';
  xAxisKey: string;
  yAxisKeys: Array<{
    key: string;
    label: string;
    color: string;
    unit?: string;
  }>;
  description?: string;
  traceability: MetricTraceabilityType;
}

export interface DocumentAnomaly {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  affectedField: string;
  rowOrSection?: string | number;
  recommendation: string;
}

export interface ExtractedTableData {
  headers: string[];
  rows: Array<Record<string, any>>;
  rowCount: number;
  columnTypes: Record<string, 'number' | 'string' | 'date' | 'boolean'>;
}

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  format: DocumentFormat;
  uploadedAt: string;
  domain: DocumentDomain;
  domainConfidence: number; // 0 to 1
  industry: string;
  title: string;
  executiveSummary: string;
  rawTextPreview?: string;
  tableData?: ExtractedTableData;
  metrics: ExtractedMetric[];
  charts: ExtractedChartConfig[];
  anomalies: DocumentAnomaly[];
  recommendations: string[];
  finalVerdict: {
    status: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_ATTENTION' | 'CRITICAL_RISK';
    verdictSummary: string;
    actionableNextSteps: string[];
  };
  methodology: string;
  sourceReferences: Array<{
    label: string;
    locator: string;
    excerpt: string;
  }>;
  dataQuality: {
    completenessScore: number; // 0-100
    missingValuesCount: number;
    duplicateRowsCount: number;
    warnings: string[];
  };
  isWearableTelemetry?: boolean; // detected as ESP32 / wearable dataset
}
