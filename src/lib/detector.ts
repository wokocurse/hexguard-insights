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

export function detectSuspicious(events: NormalizedEvent[]): SuspiciousEvent[] {
  const results: SuspiciousEvent[] = [];

  for (const event of events) {
    const reasons: string[] = [];
    let decoded_payload: string | undefined;
    let score = 0;

    const labels = event.query.split('.');
    const leftmost = labels[0];

    // HEX-encoded subdomain detection
    if (isHexString(leftmost)) {
      const decoded = decodeHex(leftmost);
      if (decoded.length > 2) {
        reasons.push('HEX_SUBDOMAIN_DECODED');
        decoded_payload = decoded;
        score += 40;
      }
    }

    // Long query (>80 chars)
    if (event.query.length > 80) {
      reasons.push('LONG_QUERY');
      score += 20;
    }

    // Excessive subdomains (>5 labels)
    if (labels.length > 5) {
      reasons.push('EXCESSIVE_SUBDOMAINS');
      score += 15;
    }

    // Long label (any label >50 chars)
    if (labels.some(l => l.length > 50)) {
      reasons.push('LONG_LABEL');
      score += 25;
    }

    if (reasons.length > 0) {
      results.push({
        ...event,
        id: crypto.randomUUID(),
        reasons,
        decoded_payload,
        score: Math.min(score, 100),
      });
    }
  }

  return results;
}
