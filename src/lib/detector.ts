import { NormalizedEvent, SuspiciousEvent } from './types';

function isHexString(s: string): boolean {
  return s.length >= 6 && s.length % 2 === 0 && /^[0-9a-f]+$/i.test(s);
}

function decodeHex(hex: string): string {
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substring(i, i + 2), 16);
    if (code < 32 || code > 126) return '';
    result += String.fromCharCode(code);
  }
  return result;
}

/**
 * Detect brute force attempts: multiple failed logins from the same IP.
 * Flags individual events that are part of a burst of ≥ 5 failures within 5 min.
 */
function detectBruteForce(events: NormalizedEvent[]): Map<NormalizedEvent, string[]> {
  const results = new Map<NormalizedEvent, string[]>();
  const WINDOW_MS = 5 * 60 * 1000;
  const THRESHOLD = 5;

  // Group auth failures by src_ip
  const authFailures = events.filter(
    e => e.event_type?.toLowerCase() === 'auth' && e.status?.toLowerCase() === 'failed'
  );

  const byIp = new Map<string, NormalizedEvent[]>();
  for (const e of authFailures) {
    const key = e.src_ip || 'unknown';
    if (!byIp.has(key)) byIp.set(key, []);
    byIp.get(key)!.push(e);
  }

  for (const [, ipEvents] of byIp) {
    const sorted = [...ipEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const windowEnd = new Date(sorted[i].timestamp).getTime() + WINDOW_MS;
      let count = 0;
      for (let j = i; j < sorted.length && new Date(sorted[j].timestamp).getTime() <= windowEnd; j++) {
        count++;
      }
      if (count >= THRESHOLD) {
        // Mark all events in this burst
        for (let j = i; j < sorted.length && new Date(sorted[j].timestamp).getTime() <= windowEnd; j++) {
          if (!results.has(sorted[j])) results.set(sorted[j], []);
          if (!results.get(sorted[j])!.includes('BRUTE_FORCE')) {
            results.get(sorted[j])!.push('BRUTE_FORCE');
          }
        }
        break; // already marked everything in this window
      }
    }
  }

  return results;
}

/**
 * Detect port scanning: same src_ip hitting ≥ 10 distinct dest_ports in 2 min.
 */
function detectPortScan(events: NormalizedEvent[]): Map<NormalizedEvent, string[]> {
  const results = new Map<NormalizedEvent, string[]>();
  const WINDOW_MS = 2 * 60 * 1000;
  const PORT_THRESHOLD = 10;

  const connEvents = events.filter(
    e => e.event_type?.toLowerCase() === 'connection' && e.dest_port != null
  );

  const byIp = new Map<string, NormalizedEvent[]>();
  for (const e of connEvents) {
    const key = e.src_ip || 'unknown';
    if (!byIp.has(key)) byIp.set(key, []);
    byIp.get(key)!.push(e);
  }

  for (const [, ipEvents] of byIp) {
    const sorted = [...ipEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const windowEnd = new Date(sorted[i].timestamp).getTime() + WINDOW_MS;
      const ports = new Set<number>();
      const windowEvents: NormalizedEvent[] = [];
      for (let j = i; j < sorted.length && new Date(sorted[j].timestamp).getTime() <= windowEnd; j++) {
        ports.add(sorted[j].dest_port!);
        windowEvents.push(sorted[j]);
      }
      if (ports.size >= PORT_THRESHOLD) {
        for (const evt of windowEvents) {
          if (!results.has(evt)) results.set(evt, []);
          if (!results.get(evt)!.includes('PORT_SCAN')) {
            results.get(evt)!.push('PORT_SCAN');
          }
        }
        break;
      }
    }
  }

  return results;
}

export function detectSuspicious(events: NormalizedEvent[]): SuspiciousEvent[] {
  const results: SuspiciousEvent[] = [];
  const eventReasons = new Map<NormalizedEvent, { reasons: string[]; decoded_payload?: string; score: number }>();

  // --- DNS-based detections ---
  for (const event of events) {
    if (event.event_type?.toLowerCase() !== 'dns' && event.query && !event.dest_port) {
      // treat as DNS if it has a query
    }

    const reasons: string[] = [];
    let decoded_payload: string | undefined;
    let score = 0;

    if (event.query) {
      const labels = event.query.split('.');
      const leftmost = labels[0];

      if (isHexString(leftmost)) {
        const decoded = decodeHex(leftmost);
        if (decoded.length > 2) {
          reasons.push('HEX_SUBDOMAIN_DECODED');
          decoded_payload = decoded;
          score += 40;
        }
      }

      if (event.query.length > 80) {
        reasons.push('LONG_QUERY');
        score += 20;
      }

      if (labels.length > 5) {
        reasons.push('EXCESSIVE_SUBDOMAINS');
        score += 15;
      }

      if (labels.some(l => l.length > 50)) {
        reasons.push('LONG_LABEL');
        score += 25;
      }
    }

    if (reasons.length > 0) {
      eventReasons.set(event, { reasons, decoded_payload, score });
    }
  }

  // --- Brute force detection ---
  const bruteForceHits = detectBruteForce(events);
  for (const [event, reasons] of bruteForceHits) {
    if (eventReasons.has(event)) {
      const existing = eventReasons.get(event)!;
      existing.reasons.push(...reasons);
      existing.score = Math.min(existing.score + 35, 100);
    } else {
      eventReasons.set(event, { reasons, score: 35 });
    }
  }

  // --- Port scan detection ---
  const portScanHits = detectPortScan(events);
  for (const [event, reasons] of portScanHits) {
    if (eventReasons.has(event)) {
      const existing = eventReasons.get(event)!;
      existing.reasons.push(...reasons);
      existing.score = Math.min(existing.score + 30, 100);
    } else {
      eventReasons.set(event, { reasons, score: 30 });
    }
  }

  // Build results
  for (const [event, data] of eventReasons) {
    results.push({
      ...event,
      id: crypto.randomUUID(),
      reasons: data.reasons,
      decoded_payload: data.decoded_payload,
      score: Math.min(data.score, 100),
    });
  }

  return results;
}
