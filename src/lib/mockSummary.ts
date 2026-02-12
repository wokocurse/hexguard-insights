import { Incident } from './types';

export function generateMockSummary(incident: Incident): string {
  const payloadInfo = incident.decoded_payloads.length > 0
    ? `Notably, hex-encoded subdomains were decoded to reveal sensitive content: "${incident.decoded_payloads[0]}"${incident.decoded_payloads.length > 1 ? ` and ${incident.decoded_payloads.length - 1} additional payload(s)` : ''}. This is a strong indicator of intentional data exfiltration via DNS tunnelling.`
    : 'While no readable payload was decoded, the DNS query patterns exhibit characteristics consistent with covert channel communication.';

  return `## SOC Investigation Summary

**Incident ${incident.incident_id}** — ${incident.severity_label} Severity

### Analyst Assessment

Between ${new Date(incident.time_range.start).toLocaleString()} and ${new Date(incident.time_range.end).toLocaleString()}, ${incident.timeline_events.length} suspicious DNS queries were observed originating from \`${incident.src_ip}\`. The queries triggered ${incident.detections.length} detection rule(s): ${incident.detections.map(d => `**${d.replace(/_/g, ' ')}**`).join(', ')}.

${payloadInfo}

### MITRE ATT&CK Context

This activity maps to ${incident.mitre_tags.map(t => `**${t}** (TA${t === 'Exfiltration' ? '0010' : t === 'Command and Control' ? '0011' : '0007'})`).join(' and ')} tactics. The use of DNS as a covert channel is a well-documented technique (T1071.004 — Application Layer Protocol: DNS) commonly associated with advanced persistent threats.

### Risk Assessment

The severity score of **${incident.severity_score}/100** reflects ${incident.severity_score >= 70 ? 'a high-confidence detection with strong indicators of malicious activity' : 'moderate confidence in the detection, warranting further investigation'}. ${incident.decoded_payloads.length > 0 ? 'The presence of decoded sensitive data significantly increases the risk classification.' : ''}

### Recommended Actions

1. **Immediate:** Quarantine \`${incident.src_ip}\` and preserve volatile forensic evidence
2. **Short-term:** Analyze historical DNS logs for ${incident.src_ip} over the past 30 days
3. **Medium-term:** Deploy enhanced DNS monitoring rules for the identified patterns
4. **Long-term:** Review data loss prevention controls and DNS security architecture`;
}
