import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NormalizedEvent, Incident, UploadResult } from '@/lib/types';
import { parseFile } from '@/lib/parser';
import { detectSuspicious } from '@/lib/detector';
import { correlateIncidents } from '@/lib/correlator';
import { generateMockSummary } from '@/lib/mockSummary';
import { sampleEvents } from '@/lib/sampleData';

interface HexGuardState {
  uploadResult: UploadResult | null;
  incidents: Incident[];
  isUploading: boolean;
  isDetecting: boolean;
  detectionRun: boolean;
  handleUpload: (file: File) => Promise<void>;
  runDetection: () => void;
  generateSummary: (incidentId: string) => void;
  getIncident: (incidentId: string) => Incident | undefined;
  loadSampleData: () => void;
  reset: () => void;
}

const HexGuardContext = createContext<HexGuardState | null>(null);

export const useHexGuard = () => {
  const ctx = useContext(HexGuardContext);
  if (!ctx) throw new Error('useHexGuard must be used within HexGuardProvider');
  return ctx;
};

export const HexGuardProvider = ({ children }: { children: ReactNode }) => {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionRun, setDetectionRun] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setDetectionRun(false);
    setIncidents([]);
    try {
      const text = await file.text();
      const events = parseFile(text, file.name);
      setUploadResult({
        upload_id: crypto.randomUUID(),
        events,
        filename: file.name,
        event_count: events.length,
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const runDetection = useCallback(() => {
    if (!uploadResult) return;
    setIsDetecting(true);
    // Simulate brief processing delay for visual effect
    setTimeout(() => {
      const suspicious = detectSuspicious(uploadResult.events);
      const correlated = correlateIncidents(suspicious);
      setIncidents(correlated);
      setDetectionRun(true);
      setIsDetecting(false);
    }, 1500);
  }, [uploadResult]);

  const generateSummary = useCallback((incidentId: string) => {
    setIncidents(prev => prev.map(inc =>
      inc.incident_id === incidentId
        ? { ...inc, ai_summary: generateMockSummary(inc) }
        : inc
    ));
  }, []);

  const getIncident = useCallback((incidentId: string) => {
    return incidents.find(i => i.incident_id === incidentId);
  }, [incidents]);

  const loadSampleData = useCallback(() => {
    setDetectionRun(false);
    setIncidents([]);
    setUploadResult({
      upload_id: crypto.randomUUID(),
      events: sampleEvents,
      filename: 'sample_dns_logs.csv',
      event_count: sampleEvents.length,
    });
  }, []);

  const reset = useCallback(() => {
    setUploadResult(null);
    setIncidents([]);
    setDetectionRun(false);
  }, []);

  return (
    <HexGuardContext.Provider value={{
      uploadResult, incidents, isUploading, isDetecting, detectionRun,
      handleUpload, runDetection, generateSummary, getIncident, loadSampleData, reset,
    }}>
      {children}
    </HexGuardContext.Provider>
  );
};
