import { create } from 'zustand';
import { ParsedDocument } from '../types/document';
import { DocumentParser } from '../services/documentParser';
import { DashboardGenerator } from '../services/dashboardGenerator';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

export interface DocumentState {
  documents: ParsedDocument[];
  activeDocumentId?: string;
  selectedPreviewDoc?: ParsedDocument;
  columnMapperDoc?: ParsedDocument;
  isProcessing: boolean;
  processingError?: string;

  // Actions
  uploadAndProcessFile: (file: File) => Promise<ParsedDocument | null>;
  loadSampleDocument: (sampleId: string) => Promise<ParsedDocument | null>;
  setActiveDocument: (docId: string) => void;
  setSelectedPreviewDoc: (doc?: ParsedDocument) => void;
  setColumnMapperDoc: (doc?: ParsedDocument) => void;
  deleteDocument: (docId: string) => void;
  initializeDefaultSamples: () => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  activeDocumentId: undefined,
  selectedPreviewDoc: undefined,
  columnMapperDoc: undefined,
  isProcessing: false,
  processingError: undefined,

  uploadAndProcessFile: async (file: File) => {
    set({ isProcessing: true, processingError: undefined });
    try {
      const raw = await DocumentParser.parseFile(file);
      if (raw.error) {
        set({ isProcessing: false, processingError: raw.error });
        return null;
      }

      const generated = DashboardGenerator.generate(raw);
      set((state) => ({
        documents: [generated, ...state.documents],
        activeDocumentId: generated.id,
        isProcessing: false,
      }));
      return generated;
    } catch (err: any) {
      set({ isProcessing: false, processingError: err.message || 'Error processing document' });
      return null;
    }
  },

  loadSampleDocument: async (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return null;

    set({ isProcessing: true, processingError: undefined });
    try {
      let raw;
      if (sample.format === 'csv') {
        raw = DocumentParser.parseCsv(sample.content, sample.name);
      } else if (sample.format === 'json') {
        raw = DocumentParser.parseJson(sample.content, sample.name);
      } else {
        raw = DocumentParser.parseText(sample.content, sample.name, 0, sample.format);
      }

      const generated = DashboardGenerator.generate(raw);
      set((state) => ({
        documents: [generated, ...state.documents.filter((d) => d.id !== generated.id)],
        activeDocumentId: generated.id,
        isProcessing: false,
      }));
      return generated;
    } catch (err: any) {
      set({ isProcessing: false, processingError: err.message });
      return null;
    }
  },

  setActiveDocument: (docId) => set({ activeDocumentId: docId }),

  setSelectedPreviewDoc: (doc) => set({ selectedPreviewDoc: doc }),

  setColumnMapperDoc: (doc) => set({ columnMapperDoc: doc }),

  deleteDocument: (docId) => {
    set((state) => {
      const remaining = state.documents.filter((d) => d.id !== docId);
      return {
        documents: remaining,
        activeDocumentId: state.activeDocumentId === docId ? remaining[0]?.id : state.activeDocumentId,
      };
    });
  },

  initializeDefaultSamples: async () => {
    const current = get().documents;
    if (current.length > 0) return;

    // Load first two samples initially
    const sample1 = SAMPLE_DOCUMENTS[0]; // ESP32 Wearable CSV
    const sample2 = SAMPLE_DOCUMENTS[1]; // ICU Vitals CSV
    const sample3 = SAMPLE_DOCUMENTS[3]; // Clinical Trial Paper MD

    const docs: ParsedDocument[] = [];
    if (sample1) {
      const raw1 = DocumentParser.parseCsv(sample1.content, sample1.name);
      docs.push(DashboardGenerator.generate(raw1));
    }
    if (sample2) {
      const raw2 = DocumentParser.parseCsv(sample2.content, sample2.name);
      docs.push(DashboardGenerator.generate(raw2));
    }
    if (sample3) {
      const raw3 = DocumentParser.parseText(sample3.content, sample3.name, 0, 'md');
      docs.push(DashboardGenerator.generate(raw3));
    }

    set({
      documents: docs,
      activeDocumentId: docs[0]?.id,
    });
  },
}));
