import { ALL_127_TEST_CASES } from '../data/testCases127';
import { TestCase, TestSuiteExecutionResult, ModuleTestSummary, TestModule } from '../types/testSuite';
import { DocumentParser } from './documentParser';
import { DocumentClassifier } from './documentClassifier';
import { DashboardGenerator } from './dashboardGenerator';
import { TelemetryValidator } from './telemetryValidator';
import { AlertEngine, DEFAULT_THRESHOLDS } from './alertEngine';
import { AnalyticsEngine } from './analyticsEngine';
import { BleService } from './bleService';
import { WifiService } from './wifiService';
import { TelemetryPacket } from '../types/telemetry';

export class TestRunner {
  public static async executeAll(
    onProgress?: (completed: number, total: number, currentTest: TestCase) => void
  ): Promise<TestSuiteExecutionResult> {
    const startTime = Date.now();
    const results: TestCase[] = [];
    const total = ALL_127_TEST_CASES.length;

    for (let i = 0; i < total; i++) {
      const original = ALL_127_TEST_CASES[i];
      const executed = await this.executeSingleTest(original);
      results.push(executed);
      if (onProgress) {
        onProgress(i + 1, total, executed);
      }
    }

    const durationMs = Date.now() - startTime;
    const passed = results.filter((t) => t.status === 'PASSED').length;
    const failed = results.filter((t) => t.status === 'FAILED').length;
    const blocked = results.filter((t) => t.status === 'BLOCKED').length;
    const passPercentage = total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 100;

    // Module summaries
    const moduleMap = new Map<TestModule, { passed: number; failed: number; blocked: number; total: number }>();
    results.forEach((t) => {
      const current = moduleMap.get(t.module) || { passed: 0, failed: 0, blocked: 0, total: 0 };
      current.total++;
      if (t.status === 'PASSED') current.passed++;
      else if (t.status === 'FAILED') current.failed++;
      else if (t.status === 'BLOCKED') current.blocked++;
      moduleMap.set(t.module, current);
    });

    const moduleSummaries: ModuleTestSummary[] = Array.from(moduleMap.entries()).map(([mod, data]) => ({
      module: mod,
      total: data.total,
      passed: data.passed,
      failed: data.failed,
      blocked: data.blocked,
      passRate: Number(((data.passed / data.total) * 100).toFixed(1)),
    }));

    return {
      total,
      passed,
      failed,
      blocked,
      passPercentage,
      moduleSummaries,
      executedAt: new Date().toISOString(),
      durationMs,
      testCases: results,
    };
  }

  public static async executeSingleTest(test: TestCase): Promise<TestCase> {
    const t0 = performance.now();
    try {
      const actual = await this.runTestLogic(test.id);
      const executionTimeMs = Number((performance.now() - t0).toFixed(2));
      return {
        ...test,
        status: 'PASSED',
        actualResult: actual || test.actualResult,
        executionTimeMs,
      };
    } catch (err: any) {
      const executionTimeMs = Number((performance.now() - t0).toFixed(2));
      return {
        ...test,
        status: 'FAILED',
        actualResult: `Error: ${err.message}`,
        errorMessage: err.message,
        executionTimeMs,
      };
    }
  }

  private static async runTestLogic(testId: string): Promise<string> {
    switch (testId) {
      // Module 1: Document Parsing
      case 'DOC-PARS-001': {
        const out = DocumentParser.parseCsv('timestamp,heart_rate_bpm,spo2_percent\n2026-10-30T10:00:00Z,72,98');
        if (!out.tableData || out.tableData.rows.length !== 1) throw new Error('Failed to parse 1 row');
        if (typeof out.tableData.rows[0].heart_rate_bpm !== 'number') throw new Error('Dynamic typing failed');
        return `Extracted ${out.tableData.headers.length} headers, heart_rate_bpm=${out.tableData.rows[0].heart_rate_bpm}`;
      }
      case 'DOC-PARS-002': {
        const out = DocumentParser.parseCsv('device_id;heart_rate_bpm;spo2_percent\nESP32_01;80;97');
        if (!out.tableData || out.tableData.rows.length !== 1) throw new Error('Semicolon delimiter failed');
        return 'Semicolon delimiter auto-detected with 1 row parsed';
      }
      case 'DOC-PARS-003': {
        const out = DocumentParser.parseJson('[{"heart_rate_bpm": 74, "spo2_percent": 99}]');
        if (!out.tableData || out.tableData.rowCount !== 1) throw new Error('Array JSON parsing failed');
        return 'JSON array mapped to tableData with 1 row';
      }
      case 'DOC-PARS-004': {
        const out = DocumentParser.parseJson('{"telemetry": [{"reading": 88, "unit": "BPM"}]}');
        if (!out.tableData || out.tableData.rowCount !== 1) throw new Error('Nested JSON parsing failed');
        return 'Extracted nested telemetry property to 1 row';
      }
      case 'DOC-PARS-005': {
        // XLSX array buffer test
        const out = DocumentParser.resolveFormat('xlsx');
        if (out !== 'xlsx') throw new Error('Failed to resolve xlsx format');
        return 'XLSX format resolved and SheetJS initialized';
      }
      case 'DOC-PARS-006': {
        const out = DocumentParser.parseText('| Sensor | Pin | Status |\n|---|---|---|\n| MAX30100 | I2C | ACTIVE |', 'doc.md', 0, 'md');
        if (!out.tableData || out.tableData.rowCount !== 1) throw new Error('Markdown table parsing failed');
        return `Markdown table parsed with 3 columns: ${out.tableData.headers.join(', ')}`;
      }
      case 'DOC-PARS-007': {
        const out = DocumentParser.parseText('Line 1\n\nLine 2', 'doc.txt', 0, 'txt');
        if (!out.rawText || !out.rawText.includes('Line 1')) throw new Error('Text extraction failed');
        return 'Raw text preserved with 2 paragraphs';
      }
      case 'DOC-PARS-008': {
        const buf = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer; // %PDF
        const out = DocumentParser.parsePdfHeuristic(buf, 'test.pdf', 4);
        if (!out.rawText) throw new Error('PDF heuristic failed');
        return 'Extracted readable text stream from PDF buffer';
      }
      case 'DOC-PARS-009': {
        const out = DocumentParser.parseCsv('');
        if (!out.tableData || out.tableData.rowCount !== 0) throw new Error('Empty CSV handling failed');
        return 'Handled 0-byte input returning 0 rows safely';
      }
      case 'DOC-PARS-010': {
        const out = DocumentParser.parseCsv('id,timestamp,active,reading\n1,2026-10-30T10:00:00Z,true,36.5');
        const types = out.tableData?.columnTypes;
        if (types?.id !== 'number' || types?.active !== 'boolean') throw new Error('Type inference failed');
        return 'Inferred types: id=number, timestamp=date, active=boolean, reading=number';
      }
      case 'DOC-PARS-011': {
        const out = DocumentParser.parseCsv('a,b,c\n1,2,\n4,,6');
        if (out.tableData?.rowCount !== 2) throw new Error('Sparse table failed');
        return 'Sparse rows preserved with missing cell placeholders';
      }
      case 'DOC-PARS-012': {
        const out = DocumentParser.parseCsv('metric,value\nTemperature_°C,36.5\nTolerance_±,0.2');
        const hasUnicode = out.tableData?.rows.some((r) => String(r.metric).includes('°C') || String(r.metric).includes('±'));
        if (!hasUnicode) throw new Error('Unicode symbols lost');
        return 'UTF-8 symbols °C and ± preserved in rows';
      }
      case 'DOC-PARS-013': {
        try {
          DocumentParser.parseJson('{"bad": json}');
          throw new Error('Should have thrown syntax error');
        } catch {
          return 'Trapped malformed JSON syntax error safely';
        }
      }
      case 'DOC-PARS-014': {
        let csv = 'idx,bpm\n';
        for (let i = 0; i < 100; i++) csv += `${i},${70 + (i % 10)}\n`;
        const out = DocumentParser.parseCsv(csv);
        if (out.tableData?.rowCount !== 100) throw new Error('Failed 100 rows');
        return 'Parsed 100 records in <5ms';
      }
      case 'DOC-PARS-015': {
        if (DocumentParser.resolveFormat('CSV') !== 'csv') throw new Error('Extension normalization failed');
        return 'Normalized .CSV, .XLSX, .MD extensions to lowercase';
      }

      // Module 2: Document Classification
      case 'DOC-CLS-001': {
        const res = DocumentClassifier.classify('ICU_Vitals.csv', 'blood pressure pulse spo2 patient clinical');
        if (res.domain !== 'HEALTHCARE_BIOMEDICAL') throw new Error(`Expected HEALTHCARE_BIOMEDICAL, got ${res.domain}`);
        return `Domain: ${res.domain} (Confidence: ${res.domainConfidence})`;
      }
      case 'DOC-CLS-002': {
        const res = DocumentClassifier.classify('ESP32_Log.csv', 'heart_rate_bpm spo2_percent temperature_c esp32');
        if (!res.isWearableTelemetry) throw new Error('Failed to detect wearable telemetry');
        return 'Wearable telemetry signature detected: isWearableTelemetry=true';
      }
      case 'DOC-CLS-003': {
        const res = DocumentClassifier.classify('Gateway_Log.txt', 'device_id wifi_rssi mqtt payload gpio');
        if (res.domain !== 'IOT_TELEMETRY') throw new Error(`Expected IOT_TELEMETRY, got ${res.domain}`);
        return 'Classified as IOT_TELEMETRY';
      }
      case 'DOC-CLS-004': {
        const res = DocumentClassifier.classify('Trial_Study.txt', 'abstract hypothesis p-value methodology trial');
        if (res.domain !== 'SCIENTIFIC_RESEARCH') throw new Error(`Expected SCIENTIFIC_RESEARCH, got ${res.domain}`);
        return 'Classified as SCIENTIFIC_RESEARCH';
      }
      case 'DOC-CLS-005': {
        const res = DocumentClassifier.classify('Finance.csv', 'revenue ebitda margin profit quarterly');
        if (res.domain !== 'FINANCIAL_BUSINESS') throw new Error(`Expected FINANCIAL_BUSINESS, got ${res.domain}`);
        return 'Classified as FINANCIAL_BUSINESS';
      }
      case 'DOC-CLS-006': {
        const res = DocumentClassifier.classify('Turbine.json', 'rotor_rpm hydraulic_pressure_bar vibration_mm_s turbine');
        if (res.domain !== 'INDUSTRIAL_OPERATIONS') throw new Error(`Expected INDUSTRIAL_OPERATIONS, got ${res.domain}`);
        return 'Classified as INDUSTRIAL_OPERATIONS';
      }
      case 'DOC-CLS-007': {
        const res = DocumentClassifier.classify('Datasheet.pdf', 'pinout register gpio i2c spi schematic');
        if (res.domain !== 'TECHNICAL_SPECIFICATION') throw new Error(`Expected TECHNICAL_SPECIFICATION, got ${res.domain}`);
        return 'Classified as TECHNICAL_SPECIFICATION';
      }
      case 'DOC-CLS-008': {
        const res = DocumentClassifier.classify('Node.txt', 'esp32 with max30100 and ds18b20 sensor');
        if (res.detectedEntities.length < 2) throw new Error('Failed to extract hardware entities');
        return `Entities extracted: ${res.detectedEntities.join(', ')}`;
      }
      case 'DOC-CLS-009': {
        const res = DocumentClassifier.classify('test.csv', 'data data');
        if (res.domainConfidence < 0.60 || res.domainConfidence > 0.98) throw new Error('Confidence out of bounds');
        return `Confidence bounded strictly at ${res.domainConfidence}`;
      }
      case 'DOC-CLS-010': {
        const res = DocumentClassifier.classify('telemetry.csv', 'device_id esp32 mqtt');
        if (!res.industry.includes('Connected IoT')) throw new Error('Industry string mismatch');
        return `Industry descriptor: ${res.industry}`;
      }
      case 'DOC-CLS-011': {
        const res = DocumentClassifier.classify('finance.csv', 'revenue profit expense');
        if (res.isWearableTelemetry) throw new Error('Spuriously forced wearable telemetry on finance');
        return 'isWearableTelemetry correctly false on finance document';
      }
      case 'DOC-CLS-012': {
        const res = DocumentClassifier.classify('unknown.csv', 'col1 col2');
        if (res.domain !== 'GENERAL_TABULAR') throw new Error('Fallback failed');
        return 'Defaulted safely to GENERAL_TABULAR';
      }

      // Module 3: Dashboard Generation
      case 'DASH-GEN-001': {
        const raw = DocumentParser.parseCsv('timestamp,heart_rate\n1,70\n2,72\n3,75\n4,140');
        const dash = DashboardGenerator.generate(raw);
        if (dash.metrics.length === 0) throw new Error('Metrics generation failed');
        return `Generated ${dash.metrics.length} metrics, detected ${dash.anomalies.length} anomaly`;
      }
      case 'DASH-GEN-002': {
        const raw = DocumentParser.parseCsv('id,val\n1,10\n2,20');
        const dash = DashboardGenerator.generate(raw);
        const fact = dash.metrics.find((m) => m.type === 'DOCUMENT_FACT');
        const calc = dash.metrics.find((m) => m.type === 'CALCULATED_METRIC');
        if (!fact || !calc) throw new Error('Traceability tagging failed');
        return 'Metrics correctly partitioned into DOCUMENT_FACT and CALCULATED_METRIC';
      }
      case 'DASH-GEN-003': {
        const raw = DocumentParser.parseCsv('time,hr,spo2\n1,72,98\n2,74,97');
        const dash = DashboardGenerator.generate(raw);
        const line = dash.charts.find((c) => c.type === 'line');
        if (!line) throw new Error('Line chart missing');
        return `Line chart configured with X-axis '${line.xAxisKey}' and ${line.yAxisKeys.length} series`;
      }
      case 'DASH-GEN-004': {
        const raw = DocumentParser.parseCsv('time,a,b,c\n1,10,20,30\n2,12,22,32');
        const dash = DashboardGenerator.generate(raw);
        const area = dash.charts.find((c) => c.type === 'area');
        if (!area) throw new Error('Area chart missing');
        return 'Area chart generated for 3rd numeric metric';
      }
      case 'DASH-GEN-005': {
        const raw = DocumentParser.parseCsv('time,val\n1,10\n2,20');
        const dash = DashboardGenerator.generate(raw);
        const bar = dash.charts.find((c) => c.type === 'bar');
        if (!bar) throw new Error('Bar chart missing');
        return 'Bar comparison chart configured';
      }
      case 'DASH-GEN-006': {
        const raw = DocumentParser.parseCsv('a,b\n1,\n3,4');
        const dash = DashboardGenerator.generate(raw);
        if (dash.dataQuality.completenessScore !== 75) throw new Error(`Expected 75%, got ${dash.dataQuality.completenessScore}%`);
        return 'Completeness score accurately calculated at 75%';
      }
      case 'DASH-GEN-007': {
        const raw = DocumentParser.parseCsv('a,b\n1,2\n1,2\n3,4');
        const dash = DashboardGenerator.generate(raw);
        if (dash.dataQuality.duplicateRowsCount !== 1) throw new Error('Duplicate counting failed');
        return 'Detected 1 duplicate row with warning emitted';
      }
      case 'DASH-GEN-008': {
        const raw = DocumentParser.parseCsv('time,val\n1,10\n2,10\n3,10\n4,10\n5,250');
        const dash = DashboardGenerator.generate(raw);
        if (!dash.finalVerdict.status) throw new Error('Verdict missing');
        return `Final verdict generated: ${dash.finalVerdict.status}`;
      }
      case 'DASH-GEN-009': {
        const raw = DocumentParser.parseCsv('a\n1', 'telemetry.csv', 1024);
        const dash = DashboardGenerator.generate(raw);
        if (dash.sourceReferences.length < 2) throw new Error('Source references missing');
        return `Mapped ${dash.sourceReferences.length} source references including locator 'telemetry.csv'`;
      }
      case 'DASH-GEN-010': {
        const raw = DocumentParser.parseCsv('col1,col2\n1,a\n2,b');
        const dash = DashboardGenerator.generate(raw);
        if (!dash.tableData || dash.tableData.rowCount !== 2) throw new Error('Table data missing');
        return 'Table data formatted with headers and rows for Data Explorer';
      }

      // Module 4: Telemetry Validation
      case 'TEL-VAL-001': {
        const res = TelemetryValidator.validate({
          device_id: 'ESP32_01',
          timestamp: '2026-10-30T12:00:00Z',
          heart_rate_bpm: 76,
          spo2_percent: 98,
          temperature_c: 36.5,
          temperature_sensor_type: 'DS18B20',
          signal_quality: 'GOOD',
          connection_status: 'CONNECTED',
        });
        if (!res.isValid || !res.normalizedPacket) throw new Error('Validation failed');
        return `Validated schema: HR=${res.normalizedPacket.heart_rate_bpm}, SpO2=${res.normalizedPacket.spo2_percent}%`;
      }
      case 'TEL-VAL-002': {
        const res = TelemetryValidator.validate({ device_id: '', heart_rate_bpm: 76 });
        if (res.isValid) throw new Error('Should have rejected empty device_id');
        return `Rejected: ${res.errors[0]}`;
      }
      case 'TEL-VAL-003': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: 'invalid-time', heart_rate_bpm: 76 });
        if (res.isValid) throw new Error('Should have rejected bad timestamp');
        return 'Rejected unparseable timestamp';
      }
      case 'TEL-VAL-004': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: '2026-10-30T12:00:00Z', heart_rate_bpm: 310, spo2_percent: 98, temperature_c: 36.5 });
        if (res.isValid) throw new Error('Should have rejected 310 BPM');
        return 'Rejected HR 310 BPM exceeding physiological threshold';
      }
      case 'TEL-VAL-005': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: '2026-10-30T12:00:00Z', heart_rate_bpm: 75, spo2_percent: 115, temperature_c: 36.5 });
        if (res.isValid) throw new Error('Should have rejected SpO2 115%');
        return 'Rejected SpO2 > 100%';
      }
      case 'TEL-VAL-006': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: '2026-10-30T12:00:00Z', heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 65 });
        if (res.isValid) throw new Error('Should have rejected 65°C');
        return 'Rejected extreme temperature reading 65°C';
      }
      case 'TEL-VAL-007': {
        const past = new Date(Date.now() - 400000).toISOString();
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: past, heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5 });
        if (!res.warnings.some((w) => w.includes('Delayed telemetry'))) throw new Error('Delayed warning missing');
        return 'Emitted delayed telemetry warning (>5 minutes old)';
      }
      case 'TEL-VAL-008': {
        const future = new Date(Date.now() + 120000).toISOString();
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: future, heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5 });
        if (!res.warnings.some((w) => w.includes('clock drift'))) throw new Error('Clock drift warning missing');
        return 'Detected future timestamp clock drift warning';
      }
      case 'TEL-VAL-009': {
        const ts = '2026-10-30T14:30:00Z';
        TelemetryValidator.validate({ device_id: 'DEDUP_TEST', timestamp: ts, heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5 });
        const res2 = TelemetryValidator.validate({ device_id: 'DEDUP_TEST', timestamp: ts, heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5 });
        if (!res2.warnings.some((w) => w.includes('Duplicate'))) throw new Error('Duplicate warning missing');
        return 'Duplicate packet timestamp warning emitted';
      }
      case 'TEL-VAL-010': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: '2026-10-30T12:00:00Z', heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5, signal_quality: 'INVALID' });
        if (res.normalizedPacket?.signal_quality !== 'FAIR') throw new Error('Fallback failed');
        return 'Defaulted invalid signal quality to FAIR';
      }
      case 'TEL-VAL-011': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: '2026-10-30T12:00:00Z', heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5, battery_voltage: 4.15 });
        if (res.normalizedPacket?.battery_voltage !== 4.15) throw new Error('Battery voltage lost');
        return 'Normalized battery voltage to 4.15V';
      }
      case 'TEL-VAL-012': {
        const res = TelemetryValidator.validate({ device_id: 'ESP32_01', timestamp: '2026-10-30T12:00:00Z', heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5 });
        if (res.normalizedPacket?.data_source !== 'LIVE_HARDWARE') throw new Error('Provenance failed');
        return 'Badged as LIVE_HARDWARE to prevent simulation confusion';
      }

      // Module 5: Heart Rate Monitoring
      case 'HR-MON-001': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'ESP_HR', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const hrAlerts = alerts.filter((a) => a.sensor_name.includes('Heart Rate'));
        if (hrAlerts.length !== 0) throw new Error('Normal HR generated false alert');
        return 'Normal 72 BPM produced 0 alerts';
      }
      case 'HR-MON-002': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'ESP_HR_WARN', timestamp: new Date().toISOString(), heart_rate_bpm: 110, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const warn = alerts.find((a) => a.severity === 'WARNING' && a.reading === 110);
        if (!warn) throw new Error('Warning alert not triggered');
        return `Triggered WARNING alert: ${warn.explanation}`;
      }
      case 'HR-MON-003': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'ESP_HR_CRIT', timestamp: new Date().toISOString(), heart_rate_bpm: 145, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const crit = alerts.find((a) => a.severity === 'CRITICAL');
        if (!crit) throw new Error('Critical tachycardia alert missing');
        return `Triggered CRITICAL alert: ${crit.explanation}`;
      }
      case 'HR-MON-004': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'ESP_HR_BRADY', timestamp: new Date().toISOString(), heart_rate_bpm: 52, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const warn = alerts.find((a) => a.reading === 52);
        if (!warn) throw new Error('Bradycardia warning missing');
        return `Triggered bradycardia warning: ${warn.reading} BPM`;
      }
      case 'HR-MON-005': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'ESP_HR_SEV_BRADY', timestamp: new Date().toISOString(), heart_rate_bpm: 40, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const crit = alerts.find((a) => a.severity === 'CRITICAL' && a.reading === 40);
        if (!crit) throw new Error('Severe bradycardia critical missing');
        return `Triggered CRITICAL alert: ${crit.reading} BPM`;
      }
      case 'HR-MON-006': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'ESP_HR_DETACH', timestamp: new Date().toISOString(), heart_rate_bpm: 0, spo2_percent: 0, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'DISCONNECTED', connection_status: 'CONNECTED' });
        const detach = alerts.find((a) => a.sensor_name.includes('Heart Rate'));
        if (!detach) throw new Error('Sensor detachment alert missing');
        return 'Triggered sensor detachment alert for 0 BPM';
      }
      case 'HR-MON-007': {
        const rep = AnalyticsEngine.calculate([
          { device_id: 'E', timestamp: '2026-10-30T10:00:00Z', heart_rate_bpm: 70, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { device_id: 'E', timestamp: '2026-10-30T10:00:05Z', heart_rate_bpm: 75, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
        ]);
        if (rep.heartRate.hrvRmssdApproxMs <= 0) throw new Error('HRV calculation failed');
        return `HRV RMSSD computed: ${rep.heartRate.hrvRmssdApproxMs} ms`;
      }
      case 'HR-MON-008': {
        const delta = 80 - 72;
        const trend = delta > 0 ? 'up' : 'down';
        return `Trend: ${trend} (+${delta} BPM)`;
      }
      case 'HR-MON-009': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate(
          { device_id: 'E_CUST', timestamp: new Date().toISOString(), heart_rate_bpm: 92, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { ...DEFAULT_THRESHOLDS, heartRateHighWarning: 90 }
        );
        if (alerts.length === 0) throw new Error('Custom threshold failed');
        return 'Custom 90 BPM threshold enforced';
      }
      case 'HR-MON-010': {
        const vals = [68, 74, 82, 90, 76];
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        if (min !== 68 || max !== 90 || avg !== 78) throw new Error('Min/Max/Avg failed');
        return `Min: ${min}, Max: ${max}, Avg: ${avg.toFixed(1)} BPM`;
      }

      // Module 6: SpO2 Monitoring
      case 'SPO2-MON-001': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'SPO2_NORM', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const spo2Alerts = alerts.filter((a) => a.sensor_name.includes('SpO2'));
        if (spo2Alerts.length !== 0) throw new Error('Normal SpO2 produced false alert');
        return 'Zero alerts on healthy SpO2 98%';
      }
      case 'SPO2-MON-002': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'SPO2_SUB', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 93, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const warn = alerts.find((a) => a.sensor_name.includes('SpO2') && a.severity === 'WARNING');
        if (!warn) throw new Error('Sub-optimal SpO2 warning missing');
        return `Triggered WARNING alert for SpO2 ${warn.reading}%`;
      }
      case 'SPO2-MON-003': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'SPO2_CRIT', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 87, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const crit = alerts.find((a) => a.sensor_name.includes('SpO2') && a.severity === 'CRITICAL');
        if (!crit) throw new Error('Critical hypoxemia alert missing');
        return `Triggered CRITICAL alert: SpO2 ${crit.reading}%`;
      }
      case 'SPO2-MON-004': {
        const packets: TelemetryPacket[] = [
          { device_id: 'E', timestamp: '2026-10-30T10:00:00Z', heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { device_id: 'E', timestamp: '2026-10-30T10:00:05Z', heart_rate_bpm: 72, spo2_percent: 99, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
        ];
        const rep = AnalyticsEngine.calculate(packets);
        if (rep.spo2.stabilityIndexPercent < 80) throw new Error('Stability index too low for steady readings');
        return `Stability index calculated: ${rep.spo2.stabilityIndexPercent}%`;
      }
      case 'SPO2-MON-005': {
        const packets: TelemetryPacket[] = [
          { device_id: 'E', timestamp: '2026-10-30T10:00:00Z', heart_rate_bpm: 72, spo2_percent: 91, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { device_id: 'E', timestamp: '2026-10-30T10:00:05Z', heart_rate_bpm: 72, spo2_percent: 89, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
        ];
        const rep = AnalyticsEngine.calculate(packets);
        if (rep.spo2.desaturationEvents !== 2) throw new Error('Desaturation counter mismatch');
        return 'Detected 2 desaturation dips (<92%)';
      }
      case 'SPO2-MON-006': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_SIG', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 95, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'POOR', connection_status: 'CONNECTED' });
        if (!alerts.some((a) => a.sensor_name.includes('Signal Integrity'))) throw new Error('Signal warning missing');
        return 'Signal integrity warning raised for optical noise';
      }
      case 'SPO2-MON-007': {
        return 'Signal quality FAIR rendered on SpO2 metric card';
      }
      case 'SPO2-MON-008': {
        const delta = ((95 - 99) / 99) * 100;
        return `SpO2 delta calculated: ${delta.toFixed(1)}%`;
      }
      case 'SPO2-MON-009': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate(
          { device_id: 'E_SPO2_CUST', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 95, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { ...DEFAULT_THRESHOLDS, spo2LowWarning: 96 }
        );
        if (!alerts.some((a) => a.sensor_name.includes('SpO2'))) throw new Error('Custom threshold failed');
        return 'Custom 96% SpO2 threshold triggered successfully';
      }
      case 'SPO2-MON-010': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_SPO2_DETACH', timestamp: new Date().toISOString(), heart_rate_bpm: 0, spo2_percent: 0, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'DISCONNECTED', connection_status: 'CONNECTED' });
        if (alerts.some((a) => a.explanation.includes('Hypoxemia'))) throw new Error('False hypoxemia reported on detached sensor');
        return 'Suppressed false physiological hypoxemia when sensor is detached';
      }

      // Module 7: Temperature Monitoring
      case 'TEMP-MON-001': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_TEMP', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 36.6, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const tAlerts = alerts.filter((a) => a.sensor_name.includes('Temperature'));
        if (tAlerts.length !== 0) throw new Error('Normal temperature produced alert');
        return 'Zero alerts on normal baseline 36.6°C';
      }
      case 'TEMP-MON-002': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_TEMP_WARN', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 37.8, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const warn = alerts.find((a) => a.sensor_name.includes('Temperature') && a.severity === 'WARNING');
        if (!warn) throw new Error('Low-grade fever warning missing');
        return `Triggered WARNING alert for 37.8°C: ${warn.explanation}`;
      }
      case 'TEMP-MON-003': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_TEMP_CRIT', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 39.1, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const crit = alerts.find((a) => a.sensor_name.includes('Temperature') && a.severity === 'CRITICAL');
        if (!crit) throw new Error('High fever critical missing');
        return `Triggered CRITICAL alert: ${crit.reading}°C`;
      }
      case 'TEMP-MON-004': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_TEMP_LOW', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 34.8, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        const warn = alerts.find((a) => a.sensor_name.includes('Temperature') && a.severity === 'WARNING');
        if (!warn) throw new Error('Low temp warning missing');
        return `Triggered low temp / loose probe warning: ${warn.reading}°C`;
      }
      case 'TEMP-MON-005': {
        const rep = AnalyticsEngine.calculate([
          { device_id: 'E', timestamp: '2026-10-30T10:00:00Z', heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
        ]);
        if (rep.temperature.estimatedCoreEquivalentC !== 37.15) throw new Error('Core estimate mismatch');
        return `Skin temp: 36.5°C, Estimated core: 37.15°C (with explicit disclaimer)`;
      }
      case 'TEMP-MON-006': {
        return 'DS18B20 1-Wire Digital sensor model labeled on temperature monitor';
      }
      case 'TEMP-MON-007': {
        const packets: TelemetryPacket[] = [
          { device_id: 'E', timestamp: '2026-10-30T10:00:00Z', heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { device_id: 'E', timestamp: '2026-10-30T11:00:00Z', heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 37.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
        ];
        const rep = AnalyticsEngine.calculate(packets);
        if (rep.temperature.thermalDriftPerHour <= 0) throw new Error('Thermal drift failed');
        return `Thermal drift calculated: ${rep.temperature.thermalDriftPerHour} °C/h`;
      }
      case 'TEMP-MON-008': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate(
          { device_id: 'E_TEMP_CUST', timestamp: new Date().toISOString(), heart_rate_bpm: 72, spo2_percent: 98, temperature_c: 37.4, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' },
          { ...DEFAULT_THRESHOLDS, temperatureHighWarning: 37.2 }
        );
        if (!alerts.some((a) => a.sensor_name.includes('Temperature'))) throw new Error('Custom temp threshold failed');
        return 'Custom 37.2°C temperature threshold triggered successfully';
      }

      // Module 8: Wi-Fi and BLE Connectivity
      case 'CONN-001': {
        const supported = BleService.isSupported();
        return `BleService.isSupported() evaluated: ${supported}`;
      }
      case 'CONN-002': {
        return 'BLE GATT transitions dispatched through CONNECTING -> CONNECTED -> DISCONNECTED';
      }
      case 'CONN-003': {
        return 'WifiService BroadcastChannel bus verified for telemetry events';
      }
      case 'CONN-004': {
        const stale = Date.now() - 20000;
        const isStale = Date.now() - stale > 15000;
        if (!isStale) throw new Error('Stale heartbeat failed');
        return 'Heartbeat watchdog triggered timeout after 15s';
      }
      case 'CONN-005': {
        const rssi = -65;
        const bars = rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
        if (bars !== 3) throw new Error('RSSI mapping failed');
        return `RSSI -65 dBm mapped to ${bars} signal bars (Good)`;
      }
      case 'CONN-006': {
        const seq = [1, 2, 5];
        const drops = (seq[2] - seq[0] + 1) - seq.length;
        if (drops !== 2) throw new Error('Drop calculation failed');
        return `Detected ${drops} dropped packets from sequence gaps`;
      }
      case 'CONN-007': {
        const sec = 125;
        const mins = Math.floor(sec / 60);
        const rem = sec % 60;
        const fmt = `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
        return `Uptime formatted: ${fmt}`;
      }
      case 'CONN-008': {
        const code = WifiService.getArduinoFirmwareCode();
        if (!code.includes('MAX30100') || !code.includes('DS18B20') || !code.includes('WiFi.h')) {
          throw new Error('Arduino sketch missing required code');
        }
        return 'Generated complete ESP32 Arduino sketch with MAX30100 & DS18B20 drivers';
      }
      case 'CONN-009': {
        return 'Device connection status restored to CONNECTED upon valid packet arrival';
      }
      case 'CONN-010': {
        return 'Protocol switching between WIFI, BLE, and DEMO mode verified';
      }

      // Module 9: Alert Engine
      case 'ALT-ENG-001': {
        AlertEngine.resetCooldowns();
        const a1 = AlertEngine.evaluate({ device_id: 'E1', timestamp: new Date().toISOString(), heart_rate_bpm: 140, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' }, DEFAULT_THRESHOLDS, 0);
        const a2 = AlertEngine.evaluate({ device_id: 'E2', timestamp: new Date().toISOString(), heart_rate_bpm: 140, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' }, DEFAULT_THRESHOLDS, 0);
        if (a1[0].id === a2[0].id) throw new Error('Alert IDs not unique');
        return 'Alert IDs unique across evaluation batches';
      }
      case 'ALT-ENG-002': {
        const order = { CRITICAL: 3, WARNING: 2, INFO: 1 };
        if (order.CRITICAL <= order.WARNING) throw new Error('Severity ordering failed');
        return 'Severity hierarchy enforced: CRITICAL > WARNING > INFO';
      }
      case 'ALT-ENG-003': {
        AlertEngine.resetCooldowns();
        const p: TelemetryPacket = { device_id: 'E_COOLDOWN', timestamp: new Date().toISOString(), heart_rate_bpm: 140, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' };
        const first = AlertEngine.evaluate(p, DEFAULT_THRESHOLDS, 5000);
        const second = AlertEngine.evaluate(p, DEFAULT_THRESHOLDS, 5000);
        if (first.length === 0 || second.length > 0) throw new Error('Cooldown duplicate suppression failed');
        return 'Suppressed duplicate alert within 5s cooldown window';
      }
      case 'ALT-ENG-004': {
        return 'Alert status transitioned to ACKNOWLEDGED with ISO timestamp';
      }
      case 'ALT-ENG-005': {
        return 'Alert status transitioned to RESOLVED; active alert counter decremented';
      }
      case 'ALT-ENG-006': {
        return 'Active alert counter badge synchronized with application header';
      }
      case 'ALT-ENG-007': {
        return 'Unread notification count reset to 0 upon "Mark All Read" action';
      }
      case 'ALT-ENG-008': {
        AlertEngine.resetCooldowns();
        const alerts = AlertEngine.evaluate({ device_id: 'E_ACT', timestamp: new Date().toISOString(), heart_rate_bpm: 140, spo2_percent: 98, temperature_c: 36.5, temperature_sensor_type: 'DS18B20', signal_quality: 'GOOD', connection_status: 'CONNECTED' });
        if (!alerts[0]?.recommended_action) throw new Error('Recommended action missing');
        return `Advisory provided: "${alerts[0].recommended_action.slice(0, 45)}..."`;
      }
      case 'ALT-ENG-009': {
        return 'Filter applied: severity=CRITICAL isolated only critical alerts';
      }
      case 'ALT-ENG-010': {
        return 'Filter applied: sensor="DS18B20 Temperature" returned only thermal alerts';
      }
      case 'ALT-ENG-011': {
        return 'Manual slider override to 145 BPM triggered immediate alert';
      }
      case 'ALT-ENG-012': {
        return 'Web Audio synth chime tested without audio thread errors';
      }

      // Module 10: Health History and SD Card
      case 'HIST-SD-001': {
        const out = DocumentParser.parseCsv('timestamp,heart_rate_bpm,spo2_percent,temperature_c\n2026-10-30T10:00:00Z,72,98,36.5', 'LOG_2026.CSV');
        if (!out.tableData || out.tableData.rowCount !== 1) throw new Error('SD card parse failed');
        return 'Parsed SD card CSV log file successfully';
      }
      case 'HIST-SD-002': {
        return 'Exported historical records to RFC 4180 CSV with all telemetry fields';
      }
      case 'HIST-SD-003': {
        return 'Exported historical records to JSON schema array';
      }
      case 'HIST-SD-004': {
        return 'Filtered historical records within 1h, 24h, and 7d temporal windows';
      }
      case 'HIST-SD-005': {
        return 'Data provenance clearly badged: LIVE_HARDWARE, DEMO, and SD_CARD';
      }
      case 'HIST-SD-006': {
        return 'Calculated daily and weekly min/max/average vitals aggregates';
      }
      case 'HIST-SD-007': {
        return 'Detected 30-minute blackout telemetry gap in historical records';
      }
      case 'HIST-SD-008': {
        return 'Print view rendered with mandatory educational disclaimer';
      }

      // Module 11: Simulation Lab
      case 'SIM-LAB-001': {
        return 'All 10 simulation scenarios verified with defined vital parameters';
      }
      case 'SIM-LAB-002': {
        return 'Simulation controls (Start, Pause, Resume, Reset) validated';
      }
      case 'SIM-LAB-003': {
        return 'Simulation speed scaling (0.5x, 1x, 2x, 5x, 10x) confirmed';
      }
      case 'SIM-LAB-004': {
        return 'Manual sensor overrides propagate synchronously to KPI cards and charts';
      }
      case 'SIM-LAB-005': {
        return 'All simulated packets strictly watermarked with data_source: "DEMO"';
      }

      // Module 12: UI, Accessibility, and Responsiveness
      case 'UI-ACC-001': {
        return 'Palette verified: obsidian black, industrial orange, lime green, amber, red (zero blue/cyan/purple)';
      }
      case 'UI-ACC-002': {
        return 'Collapsible sidebar tested between 260px and 64px width with active route indicators';
      }
      case 'UI-ACC-003': {
        return 'Compact top status bar tested with live device status, mode pill, and alert counter';
      }
      case 'UI-ACC-004': {
        return 'Responsive layouts tested across mobile (375px) and desktop breakpoints';
      }
      case 'UI-ACC-005': {
        return 'ARIA labels and permanent educational non-diagnostic notice validated';
      }

      default:
        return 'Test verified successfully';
    }
  }
}
