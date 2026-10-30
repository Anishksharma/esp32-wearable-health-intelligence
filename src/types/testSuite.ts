export type TestModule =
  | 'Document upload and parsing'
  | 'Document classification and intelligence'
  | 'Dashboard generation and visualizations'
  | 'ESP32 telemetry validation'
  | 'Heart-rate monitoring'
  | 'SpO2 monitoring'
  | 'Temperature monitoring'
  | 'Wi-Fi and BLE connectivity'
  | 'Alert engine'
  | 'Health history and SD card records'
  | 'Simulation lab'
  | 'UI, accessibility, and responsiveness';

export type TestStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'PENDING';

export interface TestCase {
  id: string; // e.g. DOC-PARS-001
  name: string;
  module: TestModule;
  preconditions: string;
  input: string;
  executionSteps: string[];
  expectedResult: string;
  actualResult?: string;
  status: TestStatus;
  executionTimeMs?: number;
  errorMessage?: string;
}

export interface ModuleTestSummary {
  module: TestModule;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  passRate: number;
}

export interface TestSuiteExecutionResult {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  passPercentage: number;
  moduleSummaries: ModuleTestSummary[];
  executedAt: string;
  durationMs: number;
  testCases: TestCase[];
}
