export interface NormalizedEvent {
  timestamp: string;
  src_ip: string;
  query: string;
  client?: string;
  event_type: string;
}

export interface SuspiciousEvent extends NormalizedEvent {
  id: string;
  reasons: string[];
  decoded_payload?: string;
  score: number;
}

export interface Incident {
  incident_id: string;
  time_range: { start: string; end: string };
  src_ip: string;
  detections: string[];
  mitre_tags: string[];
  severity_score: number;
  severity_label: 'Low' | 'Medium' | 'High' | 'Critical';
  timeline_events: SuspiciousEvent[];
  decoded_payloads: string[];
  ai_summary?: string;
}

export interface UploadResult {
  upload_id: string;
  events: NormalizedEvent[];
  filename: string;
  event_count: number;
}
