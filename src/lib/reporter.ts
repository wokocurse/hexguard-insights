import { Incident } from './types';

export function generateJSONReport(incident: Incident) {
  const report = {
    report_id: `RPT-${Date.now().toString(36).toUpperCase()}`,
    generated_at: new Date().toISOString(),
    incident_id: incident.incident_id,
    executive_summary: `A ${incident.severity_label.toLowerCase()}-severity security incident was detected involving ${incident.detections.length} distinct detection pattern(s) from source IP ${incident.src_ip}. ${incident.decoded_payloads.length > 0 ? 'Decoded payloads indicate potential data exfiltration containing sensitive information.' : 'Suspicious DNS patterns suggest possible covert channel activity.'}`,
    findings: {
      source_ip: incident.src_ip,
      time_range: incident.time_range,
      severity: { score: incident.severity_score, label: incident.severity_label },
      detection_types: incident.detections,
      mitre_tags: incident.mitre_tags,
      decoded_payloads: incident.decoded_payloads,
      event_count: incident.timeline_events.length,
      events: incident.timeline_events.map(e => ({
        timestamp: e.timestamp,
        query: e.query,
        reasons: e.reasons,
        score: e.score,
        decoded_payload: e.decoded_payload || null,
      })),
    },
    recommendations: [
      'Immediately isolate the affected host for forensic analysis',
      'Review DNS logs for additional indicators of compromise',
      'Block the identified exfiltration domains at the DNS resolver level',
      'Conduct a full memory dump of the affected system',
      'Update detection rules to flag similar patterns across the network',
    ],
  };
  return JSON.stringify(report, null, 2);
}

export function generateMarkdownReport(incident: Incident): string {
  const lines = [
    `# Incident Report: ${incident.incident_id}`,
    '',
    `**Generated:** ${new Date().toLocaleString()}`,
    `**Severity:** ${incident.severity_label} (${incident.severity_score}/100)`,
    `**Source IP:** \`${incident.src_ip}\``,
    `**Time Range:** ${new Date(incident.time_range.start).toLocaleString()} — ${new Date(incident.time_range.end).toLocaleString()}`,
    '',
    '## Executive Summary',
    '',
    `A ${incident.severity_label.toLowerCase()}-severity security incident was detected involving suspicious DNS activity from source IP \`${incident.src_ip}\`. The activity comprised ${incident.timeline_events.length} suspicious event(s) triggering ${incident.detections.length} detection rule(s).`,
    '',
    '## Findings',
    '',
    ...incident.detections.map(d => `- **${d.replace(/_/g, ' ')}**`),
    `- Total suspicious events: ${incident.timeline_events.length}`,
    '',
  ];

  if (incident.decoded_payloads.length > 0) {
    lines.push('## Decoded Payloads', '');
    incident.decoded_payloads.forEach(p => lines.push(`- \`${p}\``));
    lines.push('');
  }

  lines.push(
    '## Why This Is Suspicious',
    '',
    ...incident.detections.map(d => {
      switch (d) {
        case 'HEX_SUBDOMAIN_DECODED': return '- DNS query contains hex-encoded data that decodes to readable text, indicating DNS tunnelling for data exfiltration';
        case 'LONG_QUERY': return '- Abnormally long DNS query string, commonly used to smuggle data through DNS';
        case 'EXCESSIVE_SUBDOMAINS': return '- Excessive number of subdomain labels, a hallmark of DNS-based C2 channels';
        case 'LONG_LABEL': return '- Individual DNS label exceeds normal length, suggesting encoded payload';
        default: return `- ${d}`;
      }
    }),
    '',
    '## MITRE ATT&CK Mapping',
    '',
    ...incident.mitre_tags.map(t => `- ${t}`),
    '',
    '## Recommended Next Steps',
    '',
    '1. Immediately isolate the affected host for forensic analysis',
    '2. Review DNS logs for additional indicators of compromise',
    '3. Block the identified exfiltration domains at the DNS resolver level',
    '4. Conduct a full memory dump of the affected system',
    '5. Update detection rules to flag similar patterns across the network',
  );

  return lines.join('\n');
}
