import React, { useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { SAMPLE_DOCUMENTS } from '../../data/sampleDocuments';
import { FileText, Upload, Sparkles, Database, FileSpreadsheet, FileCode, Check, Eye, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const UniversalDocumentsView: React.FC<{ onNavigateToDashboard?: () => void }> = ({
  onNavigateToDashboard,
}) => {
  const documents = useDocumentStore((state) => state.documents);
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const setActiveDocument = useDocumentStore((state) => state.setActiveDocument);
  const uploadAndProcessFile = useDocumentStore((state) => state.uploadAndProcessFile);
  const loadSampleDocument = useDocumentStore((state) => state.loadSampleDocument);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const setSelectedPreviewDoc = useDocumentStore((state) => state.setSelectedPreviewDoc);
  const isProcessing = useDocumentStore((state) => state.isProcessing);
  const processingError = useDocumentStore((state) => state.processingError);

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const doc = await uploadAndProcessFile(e.dataTransfer.files[0]);
      if (doc && onNavigateToDashboard) {
        onNavigateToDashboard();
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const doc = await uploadAndProcessFile(e.target.files[0]);
      if (doc && onNavigateToDashboard) {
        onNavigateToDashboard();
      }
    }
  };

  const handleLoadSample = async (sampleId: string) => {
    const doc = await loadSampleDocument(sampleId);
    if (doc && onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF8A24]" />
            UNIVERSAL DOCUMENT INTELLIGENCE & INGESTION ENGINE
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            PDF // CSV // XLSX // JSON // TXT // MARKDOWN CLASSIFICATION & DYNAMIC DASHBOARD SYNTHESIS
          </p>
        </div>

        <span className="text-xs font-mono text-[#54E38E] bg-[#10100E] border border-[#34342B] px-3 py-1">
          PARSER ENGINE v2.4 ONLINE
        </span>
      </div>

      {processingError && (
        <div className="p-3 bg-[#FF4545]/10 border border-[#FF4545]/50 text-xs font-mono text-[#FF4545]">
          Error: {processingError}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-8 text-center transition-all cursor-pointer bg-[#171714] ${
          dragActive
            ? 'border-[#FF8A24] bg-[#FF8A24]/10'
            : 'border-[#34342B] hover:border-[#6B6B5F]'
        }`}
      >
        <input
          type="file"
          id="file-dropzone"
          accept=".csv,.xlsx,.xls,.json,.pdf,.txt,.md"
          onChange={handleFileInput}
          className="hidden"
        />
        <label htmlFor="file-dropzone" className="cursor-pointer flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-[#20201B] border border-[#34342B] flex items-center justify-center text-[#FF8A24]">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-[#FF8A24] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-heading text-lg uppercase tracking-wider text-[#F4F1E9]">
              DRAG & DROP ANY DATASET OR RESEARCH DOCUMENT
            </h3>
            <p className="text-xs font-mono text-[#A6A69A] mt-1">
              Supports CSV, Excel (XLSX/XLS), JSON, PDF, TXT, and Markdown files up to 50MB
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] font-mono text-xs uppercase font-bold transition-colors mt-2"
          >
            Browse Local File
          </button>
        </label>
      </div>

      {/* Pre-Packaged Sample Documents Catalog */}
      <div className="bg-[#171714] border border-[#34342B] p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#34342B] pb-2">
          <Sparkles className="w-4 h-4 text-[#B6F23A]" />
          <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
            INSTANT SAMPLE DATASETS & RESEARCH PAPERS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              className="p-3.5 bg-[#10100E] border border-[#34342B] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="font-mono text-xs font-bold text-[#F4F1E9] truncate" title={sample.name}>
                    {sample.name}
                  </h4>
                  <Badge variant={sample.isWearable ? 'orange' : 'neutral'}>
                    {sample.format.toUpperCase()}
                  </Badge>
                </div>

                <span className="text-[10px] font-mono text-[#FF8A24] block mb-1">
                  // {sample.category}
                </span>

                <p className="text-xs font-sans text-[#A6A69A] leading-relaxed line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <button
                onClick={() => handleLoadSample(sample.id)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#20201B] hover:bg-[#34342B] border border-[#34342B] hover:border-[#B6F23A] text-xs font-mono text-[#B6F23A] transition-colors"
              >
                <span>Analyze & Generate Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Documents Library */}
      <div className="bg-[#171714] border border-[#34342B] space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#FF8A24]" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#F4F1E9]">
              DOCUMENT INGESTION REPOSITORY ({documents.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#10100E] text-[#6B6B5F] border-b border-[#34342B]">
                <th className="p-3">DOCUMENT TITLE</th>
                <th className="p-3">DOMAIN / INDUSTRY</th>
                <th className="p-3">CONFIDENCE</th>
                <th className="p-3">SIZE / ROWS</th>
                <th className="p-3">VERDICT</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23231D]">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6B6B5F]">
                    No documents uploaded yet. Upload a file above or pick a sample dataset.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isActive = activeDocumentId === doc.id;
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-[#20201B]/50 transition-colors ${
                        isActive ? 'bg-[#FF8A24]/5 border-l-2 border-[#FF8A24]' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold text-[#F4F1E9]">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[220px]">{doc.title}</span>
                          {doc.isWearableTelemetry && <Badge variant="orange">WEARABLE</Badge>}
                        </div>
                      </td>
                      <td className="p-3 text-[#A6A69A]">
                        {doc.domain}
                      </td>
                      <td className="p-3 text-[#B6F23A]">
                        {Math.round(doc.domainConfidence * 100)}%
                      </td>
                      <td className="p-3 text-[#6B6B5F]">
                        {doc.tableData ? `${doc.tableData.rowCount} rows` : `${Math.round(doc.fileSize / 1024)} KB`}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 border text-[10px] ${
                            doc.finalVerdict.status === 'OPTIMAL'
                              ? 'bg-[#54E38E]/15 border-[#54E38E] text-[#54E38E]'
                              : doc.finalVerdict.status === 'CRITICAL_RISK'
                              ? 'bg-[#FF4545]/15 border-[#FF4545] text-[#FF4545]'
                              : 'bg-[#FFB547]/15 border-[#FFB547] text-[#FFB547]'
                          }`}
                        >
                          {doc.finalVerdict.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveDocument(doc.id);
                            if (onNavigateToDashboard) onNavigateToDashboard();
                          }}
                          className="px-2.5 py-1 bg-[#FF8A24] hover:bg-[#FF9B42] text-[#0B0B0A] font-bold text-[11px] transition-colors"
                        >
                          Open Dashboard
                        </button>
                        <button
                          onClick={() => setSelectedPreviewDoc(doc)}
                          className="p-1 text-[#A6A69A] hover:text-[#F4F1E9] bg-[#20201B] border border-[#34342B]"
                          title="Preview Raw Data"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1 text-[#FF4545] hover:bg-[#FF4545]/20 bg-[#20201B] border border-[#34342B]"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
