interface RiskResult {
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface ChecklistResult {
  title: string
}

export interface AnalysisResult {
  risks: RiskResult[]
  checklist: ChecklistResult[]
}

interface KeywordRule {
  keywords: string[]
  risks: RiskResult[]
  checklist: ChecklistResult[]
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    keywords: ['auth', 'authentication', 'login', 'oauth', 'sso', 'session'],
    risks: [
      {
        title: 'Authentication bypass vulnerability',
        description:
          'Changes to authentication flows may introduce bypass vectors if token validation or session handling is altered without comprehensive security testing.',
        severity: 'CRITICAL',
      },
      {
        title: 'Session expiration regression',
        description:
          'Modified session logic could cause sessions to persist beyond intended TTL, creating a security exposure for shared or public devices.',
        severity: 'HIGH',
      },
    ],
    checklist: [
      { title: 'Verify authentication flow end-to-end on staging' },
      { title: 'Run security scan against auth endpoints' },
      { title: 'Test session expiration and renewal behavior' },
    ],
  },
  {
    keywords: [
      'payment',
      'charge',
      'stripe',
      'billing',
      'invoice',
      'subscription',
    ],
    risks: [
      {
        title: 'Duplicate charge risk on retry',
        description:
          'Payment retry logic without idempotency keys may result in customers being charged multiple times for the same transaction during transient failures.',
        severity: 'CRITICAL',
      },
      {
        title: 'Billing cycle miscalculation at month boundaries',
        description:
          'Subscription billing changes may produce off-by-one errors around months with varying day counts, particularly February and months with 30 vs 31 days.',
        severity: 'HIGH',
      },
      {
        title: 'Currency rounding inconsistency',
        description:
          'Floating-point arithmetic on monetary values can produce rounding discrepancies that accumulate over high transaction volumes.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Verify idempotency keys on all payment operations' },
      { title: 'Test billing cycle edge cases for month boundaries' },
      { title: 'Validate currency rounding in transaction summaries' },
      { title: 'Confirm refund flow works with updated payment logic' },
    ],
  },
  {
    keywords: ['migration', 'migrate', 'schema', 'alter table', 'column'],
    risks: [
      {
        title: 'Data loss during schema migration',
        description:
          'Destructive schema changes such as column drops or type alterations may cause irreversible data loss if the migration is not backward-compatible.',
        severity: 'CRITICAL',
      },
      {
        title: 'Migration lock contention on large tables',
        description:
          'ALTER TABLE operations on large tables can acquire locks that block read and write queries, causing downtime proportional to table size.',
        severity: 'HIGH',
      },
    ],
    checklist: [
      { title: 'Test migration on production-size dataset copy' },
      { title: 'Prepare rollback migration script' },
      { title: 'Schedule migration during low-traffic maintenance window' },
      { title: 'Back up affected tables before migration' },
    ],
  },
  {
    keywords: [
      'database',
      'db',
      'query',
      'sql',
      'index',
      'postgres',
      'mysql',
      'sqlite',
    ],
    risks: [
      {
        title: 'Slow query regression from missing index',
        description:
          'New query patterns introduced without corresponding indexes may degrade database performance under production load, causing cascading timeouts.',
        severity: 'HIGH',
      },
      {
        title: 'Connection pool exhaustion under load',
        description:
          'Increased query volume or long-running transactions may exhaust the database connection pool, causing request failures across the application.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Review query execution plans for new or changed queries' },
      { title: 'Verify database indexes cover new query patterns' },
      { title: 'Load test database under expected peak traffic' },
    ],
  },
  {
    keywords: ['cache', 'redis', 'memcached', 'caching', 'ttl', 'invalidation'],
    risks: [
      {
        title: 'Stale cache serving outdated data',
        description:
          'Cache invalidation gaps may cause users to see outdated data after writes, leading to confusion or incorrect downstream decisions.',
        severity: 'HIGH',
      },
      {
        title: 'Cache stampede on cold start or expiration',
        description:
          'Simultaneous cache misses for a popular key can trigger a stampede of identical backend queries, overwhelming the database.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Verify cache invalidation triggers on all write paths' },
      { title: 'Test cache miss behavior under concurrent load' },
      {
        title:
          'Confirm TTL values are appropriate for data freshness requirements',
      },
    ],
  },
  {
    keywords: [
      'queue',
      'worker',
      'job',
      'background',
      'async',
      'rabbitmq',
      'sqs',
    ],
    risks: [
      {
        title: 'Message loss on queue processing failure',
        description:
          'If workers crash mid-processing without acknowledgment controls, messages may be lost permanently, causing silent data inconsistencies.',
        severity: 'HIGH',
      },
      {
        title: 'Queue backlog growth during peak hours',
        description:
          'Insufficient worker concurrency or slow consumers can cause queue depth to grow unboundedly, delaying time-sensitive operations.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Verify dead-letter queue configuration for failed messages' },
      { title: 'Test worker crash recovery and message redelivery' },
      { title: 'Set up monitoring alerts for queue depth thresholds' },
    ],
  },
  {
    keywords: ['webhook', 'callback', 'hook', 'event-driven'],
    risks: [
      {
        title: 'Webhook signature verification bypass',
        description:
          'Changes to webhook handling without proper signature verification allow attackers to forge webhook payloads and trigger unauthorized actions.',
        severity: 'CRITICAL',
      },
      {
        title: 'Webhook delivery failure without retry',
        description:
          'Transient network failures on outbound webhooks without retry logic cause downstream integrations to miss critical events permanently.',
        severity: 'HIGH',
      },
    ],
    checklist: [
      { title: 'Verify webhook signature validation is enforced' },
      { title: 'Test webhook retry behavior on delivery failure' },
      { title: 'Add logging for webhook delivery success and failure' },
    ],
  },
  {
    keywords: [
      'search',
      'elasticsearch',
      'solr',
      'algolia',
      'fulltext',
      'indexing',
    ],
    risks: [
      {
        title: 'Search index drift from primary data',
        description:
          'If index updates lag behind database writes, search results become inconsistent with actual data, eroding user trust in search functionality.',
        severity: 'MEDIUM',
      },
      {
        title: 'Search query timeout on complex filters',
        description:
          'Unbounded or poorly optimized search queries with multiple filters and aggregations may time out under production data volumes.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Verify search index stays in sync with source data' },
      { title: 'Load test search with production-scale index' },
      { title: 'Test search with complex filter combinations' },
    ],
  },
  {
    keywords: [
      'email',
      'smtp',
      'sendgrid',
      'ses',
      'mail',
      'notification template',
    ],
    risks: [
      {
        title: 'Email delivery failure goes undetected',
        description:
          'Without delivery status monitoring, failed transactional emails for password resets or confirmations go unnoticed, locking users out of critical flows.',
        severity: 'HIGH',
      },
      {
        title: 'Email template rendering error',
        description:
          'Dynamic template variables that are undefined or mistyped cause broken email content or blank emails being sent to customers.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Test all email templates with sample data' },
      { title: 'Verify email delivery monitoring and bounce handling' },
      { title: 'Send test emails through staging environment' },
    ],
  },
  {
    keywords: [
      'infra',
      'infrastructure',
      'deploy',
      'docker',
      'kubernetes',
      'k8s',
      'terraform',
      'ci/cd',
      'pipeline',
    ],
    risks: [
      {
        title: 'Deployment rollback not tested',
        description:
          'Infrastructure changes without a verified rollback plan risk extended downtime if the deployment introduces a critical failure in production.',
        severity: 'HIGH',
      },
      {
        title: 'Configuration drift between environments',
        description:
          'Environment-specific configuration that is not parameterized may cause the application to behave differently in production than in staging.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Test deployment rollback procedure' },
      { title: 'Verify configuration parity between staging and production' },
      {
        title: 'Confirm health check endpoints respond correctly after deploy',
      },
    ],
  },
  {
    keywords: [
      'analytics',
      'tracking',
      'metrics',
      'telemetry',
      'events',
      'amplitude',
      'mixpanel',
    ],
    risks: [
      {
        title: 'Analytics event schema mismatch',
        description:
          'Modified event payloads that do not match the analytics platform schema cause dropped events, creating gaps in product usage data.',
        severity: 'MEDIUM',
      },
      {
        title: 'PII leakage in analytics events',
        description:
          'New tracking events may inadvertently include personally identifiable information, creating compliance exposure under GDPR or CCPA.',
        severity: 'HIGH',
      },
    ],
    checklist: [
      { title: 'Audit analytics events for PII exposure' },
      { title: 'Verify event schema matches analytics platform expectations' },
      { title: 'Test analytics event capture in staging' },
    ],
  },
  {
    keywords: [
      'permission',
      'permissions',
      'role',
      'rbac',
      'acl',
      'access control',
      'authorization',
    ],
    risks: [
      {
        title: 'Privilege escalation through role misconfiguration',
        description:
          'Changes to role or permission logic may inadvertently grant elevated access to lower-privilege users, exposing sensitive operations or data.',
        severity: 'CRITICAL',
      },
      {
        title: 'Missing authorization check on new endpoint',
        description:
          'Newly added endpoints may lack proper authorization middleware, allowing unauthenticated or unauthorized users to access protected resources.',
        severity: 'HIGH',
      },
    ],
    checklist: [
      { title: 'Test all permission boundaries with each user role' },
      { title: 'Verify authorization middleware is applied to new endpoints' },
      { title: 'Review role hierarchy for unintended privilege inheritance' },
    ],
  },
  {
    keywords: [
      'rate limit',
      'ratelimit',
      'throttle',
      'throttling',
      'rate-limit',
    ],
    risks: [
      {
        title: 'Rate limit bypass through header manipulation',
        description:
          'Rate limiting based on client-supplied headers like X-Forwarded-For can be bypassed by attackers rotating header values on each request.',
        severity: 'HIGH',
      },
      {
        title: 'Legitimate users blocked by aggressive rate limits',
        description:
          'Rate limit thresholds set too low may block legitimate power users or API integrations, degrading their experience without meaningful security benefit.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Verify rate limit key derivation uses trusted identifiers' },
      { title: 'Test rate limit thresholds under expected usage patterns' },
      { title: 'Confirm rate limit responses include Retry-After headers' },
    ],
  },
  {
    keywords: [
      'rollback',
      'revert',
      'undo',
      'backward compatible',
      'backwards compatible',
    ],
    risks: [
      {
        title: 'Rollback causes data format incompatibility',
        description:
          'If the release introduces a new data format, rolling back to the previous version may fail to read data written in the new format, causing errors.',
        severity: 'HIGH',
      },
    ],
    checklist: [
      { title: 'Verify rollback procedure preserves data integrity' },
      { title: 'Test previous version against data created by new version' },
      { title: 'Document rollback steps in runbook' },
    ],
  },
  {
    keywords: [
      'mobile',
      'ios',
      'android',
      'app store',
      'react native',
      'flutter',
    ],
    risks: [
      {
        title: 'API breaking change affects older mobile clients',
        description:
          'Backend API changes without versioning may break mobile clients that have not been updated, as app store update adoption is gradual and uncontrollable.',
        severity: 'HIGH',
      },
      {
        title: 'Platform-specific rendering regression',
        description:
          'UI changes tested on one platform may render incorrectly on the other due to platform-specific layout engine differences.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      {
        title:
          'Test API compatibility with minimum supported mobile app version',
      },
      { title: 'Verify UI on both iOS and Android devices' },
      {
        title: 'Confirm API versioning strategy covers backward compatibility',
      },
    ],
  },
  {
    keywords: ['notification', 'push', 'fcm', 'apns', 'alert', 'sms'],
    risks: [
      {
        title: 'Notification spam from misconfigured triggers',
        description:
          'Changes to notification trigger conditions may cause users to receive excessive or duplicate notifications, leading to opt-outs and trust erosion.',
        severity: 'HIGH',
      },
      {
        title: 'Silent notification delivery failure',
        description:
          'Push notification delivery failures that are not logged or monitored cause critical alerts to be silently dropped without user or operator awareness.',
        severity: 'MEDIUM',
      },
    ],
    checklist: [
      { title: 'Test notification triggers for duplicate prevention' },
      { title: 'Verify push notification delivery on staging devices' },
      { title: 'Set up delivery failure monitoring and alerting' },
    ],
  },
]

const BASELINE_RISKS: RiskResult[] = [
  {
    title: 'Insufficient error handling for edge cases',
    description:
      'Release changes may introduce code paths that lack proper error handling, causing unhandled exceptions to surface as 500 errors to end users.',
    severity: 'LOW',
  },
]

const BASELINE_CHECKLIST: ChecklistResult[] = [
  { title: 'Review and update relevant documentation' },
  { title: 'Verify logging covers new and changed code paths' },
  { title: 'Run full regression test suite on staging' },
]

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ')
}

function matchesKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

function deduplicateByTitle<T extends { title: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.title)) return false
    seen.add(item.title)
    return true
  })
}

export function mockAnalyze(releaseNotes: string): AnalysisResult {
  const normalized = normalizeText(releaseNotes)

  const matchedRisks: RiskResult[] = []
  const matchedChecklist: ChecklistResult[] = []

  for (const rule of KEYWORD_RULES) {
    if (matchesKeyword(normalized, rule.keywords)) {
      matchedRisks.push(...rule.risks)
      matchedChecklist.push(...rule.checklist)
    }
  }

  const risks = deduplicateByTitle([...matchedRisks, ...BASELINE_RISKS])
  const checklist = deduplicateByTitle([
    ...matchedChecklist,
    ...BASELINE_CHECKLIST,
  ])

  risks.sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
  })

  return { risks, checklist }
}
