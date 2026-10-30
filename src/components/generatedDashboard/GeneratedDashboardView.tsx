import React, { useState, useMemo } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { 
  LineChart as LucideLineChart, 
  BarChart as LucideBarChart, 
  Download, 
  Printer, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  Activity,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Badge, TraceabilityBadge } from '../common/Badge';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const GeneratedDashboardView: React.FC<{ onOpenPrintReport?: () => void }> = ({
  onOpenPrintReport,
}) => {
  const documents = useDocumentStore((state) => state.documents);
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const setActiveDocument = useDocumentStore((state) => state.setActiveDocument);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocumentId) || documents[0];
  }, [documents, activeDocumentId]);

  // Data Explorer search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!activeDoc) {
    return (
      <div className="bg-[#171714] border border-[#34342B] p-12 text-center space-y-4">
        <FileText className="w-12 h-12 text-[#FF8A24] mx-auto opacity-50" />
        <h3 className="font-heading text-lg uppercase text-[#F4F1E9]">
          NO DOCUMENT LOADED FOR DASHBOARD GENERATION
        </h3>
        <p className="text-xs font-mono text-[#A6A69A]">
          Please upload a document or select one from the Document Engine repository.
        </p>
      </div>
    );
  }

  // Filtered and sorted table data for Data Explorer
  const filteredRows = useMemo(() => {
    if (!activeDoc.tableData) return [];
    let rows = [...activeDoc.tableData.rows];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(term))
      );
    }

    if (sortCol) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        const res = valA < valB ? -1 : 1;
        return sortAsc ? res : -res;
      });
    }

    return rows;
  }, [activeDoc.tableData, searchTerm, sortCol, sortAsc]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportCsv = () => {
    if (!activeDoc.tableData) return;
    const headers = activeDoc.tableData.headers;
    let csv = headers.join(',') + '\n';
    activeDoc.tableData.rows.forEach((r) => {
      csv += headers.map((h) => JSON.stringify(r[h] ?? '')).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title.replace(/\s+/g, '_')}_EXPORT.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW & METADATA BAR */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9]">
              {activeDoc.title}
            </h2>
            <Badge variant="orange">{activeDoc.format.toUpperCase()}</Badge>
            {activeDoc.isWearableTelemetry && <Badge variant="lime">WEARABLE HEALTH</Badge>}
          </div>
          <p className="text-xs font-mono text-[#A6A69A]">
            CLASSIFIED DOMAIN: <strong className="text-[#F4F1E9]">{activeDoc.industry}</strong> (Confidence: {Math.round(activeDoc.domainConfidence * 100)}%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {documents.length > 1 && (
            <select
              value={activeDocumentId}
              onChange={(e) => setActiveDocument(e.target.value)}
              className="bg-[#10100E] border border-[#34342B] text-xs font-mono text-[#F4F1E9] p-1.5 focus:outline-none"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  Switch: {d.title}
                </option>
              ))}
            </select>
          )}

          {activeDoc.tableData && (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] text-xs font-mono text-[#F4F1E9] transition-colors"
            >
              <Download className="w-4 h-4 text-[#FF8A24]" />
              <span>EXPORT DATA</span>
            </button>
          )}

          {onOpenPrintReport && (
            <button
              onClick={onOpenPrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] text-xs font-mono font-bold uppercase transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT REPORT</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY */}
      <div className="bg-[#171714] border border-[#34342B] p-5 space-y-2">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <span className="font-heading text-sm uppercase tracking-wider text-[#FF8A24]">
            // SECTION 1: EXECUTIVE SUMMARY
          </span>
          <span className="text-[11px] font-mono text-[#6B6B5F]">
            TRACEABILITY: DETERMINISTIC AGGREGATION
          </span>
        </div>
        <p className="text-xs font-sans text-[#F4F1E9] leading-relaxed">
          {activeDoc.executiveSummary}
        </p>
      </div>

      {/* 3. KEY METRICS WITH PROVENANCE TRACEABILITY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
            // SECTION 2: EXTRACTED KEY METRICS & KPI ATTRIBUTION
          </h3>
          <span className="text-xs font-mono text-[#A6A69A]">
            TOTAL METRICS: {activeDoc.metrics.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeDoc.metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-[#171714] border border-[#34342B] p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-sans uppercase tracking-wider text-[#A6A69A] font-semibold truncate">
                  {metric.label}
                </span>
                <TraceabilityBadge type={metric.type} />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#F4F1E9]">
                  {metric.value}
                </span>
                {metric.unit && <span className="font-mono text-xs text-[#A6A69A]">{metric.unit}</span>}
              </div>

              <div className="pt-2 border-t border-[#34342B] text-[10px] font-mono text-[#6B6B5F] space-y-0.5">
                <div className="truncate" title={metric.sourceReference}>
                  SRC: {metric.sourceReference}
                </div>
                {metric.calculationDetails && (
                  <div className="text-[#A6A69A] truncate" title={metric.calculationDetails}>
                    CALC: {metric.calculationDetails}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. INTERACTIVE CHARTS & TRENDS */}
      {activeDoc.charts.length > 0 && activeDoc.tableData && (
        <div className="space-y-4">
          <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
            // SECTION 3: INTERACTIVE VISUALIZATIONS & TIME SERIES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDoc.charts.map((chart) => {
              const data = activeDoc.tableData?.rows.slice(0, 40) || [];
              return (
                <div key={chart.id} className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
                    <h4 className="font-heading text-xs uppercase text-[#F4F1E9]">
                      {chart.title}
                    </h4>
                    <TraceabilityBadge type={chart.traceability} />
                  </div>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === 'line' ? (
                        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#23231D" strokeDasharray="3 3" />
                          <XAxis dataKey={chart.xAxisKey} stroke="#6B6B5F" fontSize={9} fontFamily="DM Mono" tickLine={false} />
                          <YAxis stroke="#6B6B5F" fontSize={9} fontFamily="DM Mono" tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#171714', borderColor: '#34342B', fontFamily: 'DM Mono', fontSize: '11px', color: '#F4F1E9' }} />
                          {chart.yAxisKeys.map((k) => (
                            <Line
                              key={k.key}
                              type="monotone"
                              dataKey={k.key}
                              stroke={k.color}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      ) : chart.type === 'area' ? (
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#23231D" strokeDasharray="3 3" />
                          <XAxis dataKey={chart.xAxisKey} stroke="#6B6B5F" fontSize={9} fontFamily="DM Mono" tickLine={false} />
                          <YAxis stroke="#6B6B5F" fontSize={9} fontFamily="DM Mono" tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#171714', borderColor: '#34342B', fontFamily: 'DM Mono', fontSize: '11px', color: '#F4F1E9' }} />
                          {chart.yAxisKeys.map((k) => (
                            <Area
                              key={k.key}
                              type="monotone"
                              dataKey={k.key}
                              stroke={k.color}
                              fill={k.color}
                              fillOpacity={0.2}
                            />
                          ))}
                        </AreaChart>
                      ) : (
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#23231D" strokeDasharray="3 3" />
                          <XAxis dataKey={chart.xAxisKey} stroke="#6B6B5F" fontSize={9} fontFamily="DM Mono" tickLine={false} />
                          <YAxis stroke="#6B6B5F" fontSize={9} fontFamily="DM Mono" tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#171714', borderColor: '#34342B', fontFamily: 'DM Mono', fontSize: '11px', color: '#F4F1E9' }} />
                          {chart.yAxisKeys.map((k) => (
                            <Bar key={k.key} dataKey={k.key} fill={k.color} />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {chart.description && (
                    <p className="text-[11px] font-mono text-[#6B6B5F]">
                      {chart.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ANOMALIES, RISKS & RED FLAGS */}
      {activeDoc.anomalies.length > 0 && (
        <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#34342B] pb-2">
            <AlertTriangle className="w-4 h-4 text-[#FF4545]" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#FF4545]">
              // SECTION 4: ANOMALIES & RED FLAGS DETECTED ({activeDoc.anomalies.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeDoc.anomalies.map((anom) => (
              <div key={anom.id} className="p-3 bg-[#10100E] border border-[#FF4545]/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-bold text-[#FF4545]">{anom.title}</h4>
                  <Badge variant="red">{anom.severity}</Badge>
                </div>
                <p className="text-xs font-sans text-[#A6A69A]">{anom.description}</p>
                <div className="text-[10px] font-mono text-[#FFB547]">
                  REMEDY: {anom.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DATA EXPLORER (SEARCHABLE & SORTABLE TABLE) */}
      {activeDoc.tableData && (
        <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF8A24]" />
              <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
                // SECTION 5: DATA EXPLORER ({activeDoc.tableData.rowCount} OBSERVATIONS)
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#6B6B5F] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search tabular cells..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#10100E] border border-[#34342B] pl-8 pr-3 py-1.5 text-xs font-mono text-[#F4F1E9] focus:outline-none focus:border-[#FF8A24]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#10100E] text-[#6B6B5F] border-b border-[#34342B]">
                  {activeDoc.tableData.headers.map((h) => (
                    <th
                      key={h}
                      onClick={() => {
                        if (sortCol === h) setSortAsc(!sortAsc);
                        else {
                          setSortCol(h);
                          setSortAsc(true);
                        }
                      }}
                      className="p-2.5 cursor-pointer hover:text-[#F4F1E9] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{h}</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23231D]">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={activeDoc.tableData.headers.length} className="p-6 text-center text-[#6B6B5F]">
                      No rows match search filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#20201B]/50">
                      {activeDoc.tableData?.headers.map((h) => (
                        <td key={h} className="p-2.5 text-[#F4F1E9]">
                          {String(r[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between pt-2 border-t border-[#34342B] text-xs font-mono text-[#A6A69A]">
            <span>
              PAGE {currentPage} OF {totalPages} ({filteredRows.length} RECORDS)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 bg-[#10100E] border border-[#34342B] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 bg-[#10100E] border border-[#34342B] disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. METHODOLOGY & SOURCE REFERENCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#171714] border border-[#34342B] p-4 space-y-2">
          <span className="font-heading text-xs uppercase tracking-wider text-[#FF8A24]">
            // METHODOLOGY
          </span>
          <p className="text-xs font-sans text-[#A6A69A] leading-relaxed">
            {activeDoc.methodology}
          </p>
        </div>

        <div className="bg-[#171714] border border-[#34342B] p-4 space-y-2">
          <span className="font-heading text-xs uppercase tracking-wider text-[#FF8A24]">
            // SOURCE REFERENCES
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            {activeDoc.sourceReferences.map((ref, idx) => (
              <div key={idx} className="p-1.5 bg-[#10100E] border border-[#23231D] text-[#A6A69A]">
                <strong className="text-[#F4F1E9]">{ref.label}:</strong> {ref.locator} — {ref.excerpt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. RECOMMENDATIONS & FINAL VERDICT */}
      <div className="bg-[#171714] border border-[#34342B] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <span className="font-heading text-sm uppercase tracking-wider text-[#54E38E]">
            // FINAL VERDICT & ACTIONABLE RECOMMENDATIONS
          </span>
          <Badge
            variant={
              activeDoc.finalVerdict.status === 'OPTIMAL'
                ? 'lime'
                : activeDoc.finalVerdict.status === 'CRITICAL_RISK'
                ? 'red'
                : 'amber'
            }
          >
            {activeDoc.finalVerdict.status}
          </Badge>
        </div>

        <p className="text-xs font-sans text-[#F4F1E9] leading-relaxed">
          {activeDoc.finalVerdict.verdictSummary}
        </p>

        <div className="space-y-1 pt-2">
          <span className="text-[11px] font-mono text-[#A6A69A] uppercase block">
            Next Action Items:
          </span>
          {activeDoc.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-mono text-[#B6F23A]">
              <span>[{idx + 1}]</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
