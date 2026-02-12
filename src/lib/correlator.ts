import { SuspiciousEvent, Incident } from './types';

function getMitreTags(detections: string[]): string[] {
  const tags = new Set<string>();
  for (const d of detections) {
    if (['HEX_SUBDOMAIN_DECODED', 'LONG_QUERY', 'LONG_LABEL'].includes(d)) {
      tags.add('Exfiltration');
      tags.add('Command and Control');
    }
    if (d === 'EXCESSIVE_SUBDOMAINS') {
      tags.add('Command and Control');
      tags.add('Discovery');
    }
  }
  return Array.from(tags);
}

function getSeverityLabel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

export function correlateIncidents(events: SuspiciousEvent[]): Incident[] {
  const groups = new Map<string, SuspiciousEvent[]>();
  for (const e of events) {
    const key = e.src_ip || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  const incidents: Incident[] = [];
  const WINDOW_MS = 15 * 60 * 1000;

  for (const [ip, ipEvents] of groups) {
    const sorted = [...ipEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let windowStart = new Date(sorted[0].timestamp).getTime();
    let currentWindow: SuspiciousEvent[] = [];

    for (const event of sorted) {
      const eventTime = new Date(event.timestamp).getTime();
      if (eventTime - windowStart > WINDOW_MS && currentWindow.length > 0) {
        incidents.push(createIncident(ip, currentWindow));
        currentWindow = [];
        windowStart = eventTime;
      }
      currentWindow.push(event);
    }

    if (currentWindow.length > 0) {
      incidents.push(createIncident(ip, currentWindow));
    }
  }

  return incidents.sort((a, b) => b.severity_score - a.severity_score);
}

function createIncident(ip: string, events: SuspiciousEvent[]): Incident {
  const allDetections = [...new Set(events.flatMap(e => e.reasons))];
  const allPayloads = events.map(e => e.decoded_payload).filter(Boolean) as string[];
  const maxScore = Math.max(...events.map(e => e.score));
  const avgScore = Math.round(events.reduce((s, e) => s + e.score, 0) / events.length);
  const finalScore = Math.min(Math.round((maxScore + avgScore) / 2 + events.length * 5), 100);

  return {
    incident_id: `INC-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    time_range: {
      start: events[0].timestamp,
      end: events[events.length - 1].timestamp,
    },
    src_ip: ip,
    detections: allDetections,
    mitre_tags: getMitreTags(allDetections),
    severity_score: finalScore,
    severity_label: getSeverityLabel(finalScore),
    timeline_events: events,
    decoded_payloads: allPayloads,
  };
}
