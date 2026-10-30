import React from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { Modal } from './Modal';
import { FileText, Database, Layers } from 'lucide-react';
import { Badge } from './Badge';

export const DocumentPreviewModal: React.FC = () => {
  const selectedPreviewDoc = useDocumentStore((state) => state.selectedPreviewDoc);
  const setSelectedPreviewDoc = useDocumentStore((state) => state.setSelectedPreviewDoc);

  if (!selectedPreviewDoc) return null;

  return (
    <Modal
      isOpen={!!selectedPreviewDoc}
      onClose={() => setSelectedPreviewDoc(undefined)}
      title={`DOCUMENT INSPECTOR // ${selectedPreviewDoc.title}`}
      subtitle={`FORMAT: ${selectedPreviewDoc.format.toUpperCase()} | DOMAIN: ${selectedPreviewDoc.domain}`}
      maxWidth="4xl"
    >
      <div className="space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between p-3 bg-[#10100E] border border-[#34342B]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#FF8A24]" />
            <span className="text-[#F4F1E9] font-bold">{selectedPreviewDoc.fileName}</span>
          </div>
          <span className="text-[#A6A69A]">
            SIZE: {Math.round(selectedPreviewDoc.fileSize / 1024)} KB // {selectedPreviewDoc.tableData ? `${selectedPreviewDoc.tableData.rowCount} Rows` : 'Text stream'}
          </span>
        </div>

        {selectedPreviewDoc.rawTextPreview && (
          <div>
            <span className="text-[#6B6B5F] uppercase block mb-1">RAW DECODED TEXT PREVIEW:</span>
            <div className="p-3 bg-[#0B0B0A] border border-[#34342B] max-h-60 overflow-y-auto text-[#A6A69A]">
              <pre>{selectedPreviewDoc.rawTextPreview}</pre>
            </div>
          </div>
        )}

        {selectedPreviewDoc.tableData && (
          <div>
            <span className="text-[#6B6B5F] uppercase block mb-1">
              EXTRACTED TABULAR MATRIX (FIRST 10 ROWS):
            </span>
            <div className="overflow-x-auto border border-[#34342B]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#10100E] text-[#6B6B5F] border-b border-[#34342B]">
                    {selectedPreviewDoc.tableData.headers.map((h) => (
                      <th key={h} className="p-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23231D]">
                  {selectedPreviewDoc.tableData.rows.slice(0, 10).map((r, i) => (
                    <tr key={i}>
                      {selectedPreviewDoc.tableData?.headers.map((h) => (
                        <td key={h} className="p-2 text-[#F4F1E9]">{String(r[h] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
