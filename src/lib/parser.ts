import { NormalizedEvent } from './types';

export function parseFile(content: string, filename: string): NormalizedEvent[] {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'json') return parseJSON(content);
  return parseCSV(content);
}

function parseJSON(content: string): NormalizedEvent[] {
  try {
    const data = JSON.parse(content);
    const arr = Array.isArray(data) ? data : [data];
    return arr.map(normalizeEvent).filter(Boolean) as NormalizedEvent[];
  } catch {
    throw new Error('Invalid JSON format');
  }
}

function parseCSV(content: string): NormalizedEvent[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const events: NormalizedEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
    const event = normalizeEvent(obj);
    if (event) events.push(event);
  }

  return events;
}

function normalizeEvent(raw: Record<string, unknown>): NormalizedEvent | null {
  const r = raw as Record<string, string>;
  const query = r.query || r.domain || r.dns_query || r.qname || r.name || '';
  if (!query) return null;

  return {
    timestamp: r.timestamp || r.time || r.date || new Date().toISOString(),
    src_ip: r.src_ip || r.source_ip || r.client_ip || r.ip || r.src || 'unknown',
    query,
    client: r.client || r.host || r.hostname || undefined,
    event_type: r.event_type || r.type || 'DNS',
  };
}
