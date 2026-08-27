/**
 * These are UI-boundary resilience payloads, not a real SQLi/XSS exploit
 * chain - see tests/security/SignUpSecurity.test.ts for what this suite can
 * and can't actually prove.
 */
export const sqlInjectionPayloads = [`' OR '1'='1`, `'; DROP TABLE users; --`, `admin'--`];

export const xssPayloads = [
  `<script>alert('xss')</script>`,
  `"><img src=x onerror=alert(1)>`,
  `<svg onload=alert(1)>`,
];
