import { NormalizedEvent } from './types';

export const sampleEvents: NormalizedEvent[] = [
  // --- DNS exfiltration events ---
  { timestamp: '2024-01-15T10:00:12Z', src_ip: '192.168.1.105', query: '70617373776f72643d736563726574.exfil.attacker.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:00:30Z', src_ip: '192.168.1.105', query: 'www.google.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:00:45Z', src_ip: '192.168.1.200', query: 'mail.office365.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:01:23Z', src_ip: '192.168.1.105', query: '63726564656e7469616c733d61646d696e3a726f6f74.exfil.attacker.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:01:50Z', src_ip: '192.168.1.200', query: 'cdn.microsoft.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:02:33Z', src_ip: '192.168.1.105', query: '7365637265742d6170692d6b65793d414243313233.data.attacker.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:03:15Z', src_ip: '192.168.1.105', query: 'a1b2c3.a1b2c3.a1b2c3.a1b2c3.a1b2c3.a1b2c3.tunnel.evil.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:03:50Z', src_ip: '192.168.1.200', query: 'github.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:04:22Z', src_ip: '192.168.1.150', query: '746f702d7365637265742d646f63756d656e74.leak.badsite.org', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:05:00Z', src_ip: '192.168.1.105', query: 'verylongsubdomainthatisdesignedtocarrydatainsidednslookupqueriesthataredefinitelysuspiciousandshouldbeflagged.tunnel.evil.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:05:30Z', src_ip: '192.168.1.200', query: 'api.slack.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:06:11Z', src_ip: '192.168.1.150', query: '6461746162617365.leak.badsite.org', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:06:45Z', src_ip: '192.168.1.105', query: 'fonts.googleapis.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:07:30Z', src_ip: '192.168.1.200', query: 'analytics.google.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:08:45Z', src_ip: '192.168.1.105', query: '757365723d6a6f686e26726f6c653d61646d696e.c2.attacker.com', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:09:10Z', src_ip: '192.168.1.150', query: '636f6e666964656e7469616c.leak.badsite.org', event_type: 'DNS' },
  { timestamp: '2024-01-15T10:10:00Z', src_ip: '192.168.1.105', query: 'update.windows.com', event_type: 'DNS' },

  // --- Brute force login attempts (same IP, rapid failures) ---
  { timestamp: '2024-01-15T10:12:01Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'admin' },
  { timestamp: '2024-01-15T10:12:05Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'admin' },
  { timestamp: '2024-01-15T10:12:09Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'root' },
  { timestamp: '2024-01-15T10:12:14Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'administrator' },
  { timestamp: '2024-01-15T10:12:18Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'admin' },
  { timestamp: '2024-01-15T10:12:22Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'test' },
  { timestamp: '2024-01-15T10:12:26Z', src_ip: '10.0.0.50', query: 'login.corp.local', event_type: 'AUTH', status: 'failed', username: 'user' },

  // --- Port scanning (same IP, many different ports rapidly) ---
  { timestamp: '2024-01-15T10:15:01Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 22 },
  { timestamp: '2024-01-15T10:15:02Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 23 },
  { timestamp: '2024-01-15T10:15:03Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 80 },
  { timestamp: '2024-01-15T10:15:04Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 443 },
  { timestamp: '2024-01-15T10:15:05Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 3306 },
  { timestamp: '2024-01-15T10:15:06Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 5432 },
  { timestamp: '2024-01-15T10:15:07Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 8080 },
  { timestamp: '2024-01-15T10:15:08Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 8443 },
  { timestamp: '2024-01-15T10:15:09Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 1433 },
  { timestamp: '2024-01-15T10:15:10Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 6379 },
  { timestamp: '2024-01-15T10:15:11Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 27017 },
  { timestamp: '2024-01-15T10:15:12Z', src_ip: '172.16.0.99', query: '192.168.1.10', event_type: 'CONNECTION', dest_port: 9200 },
];
