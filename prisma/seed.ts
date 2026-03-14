import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.timelineEvent.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.riskItem.deleteMany()
  await prisma.release.deleteMany()

  const blockedRelease = await prisma.release.create({
    data: {
      title: 'v2.4.0 — Payment Gateway Migration',
      description: 'Migrate from Stripe v1 to v2 API with new webhook handling',
      releaseNotes: `- Migrated payment processing to Stripe API v2\n- Updated webhook signature verification\n- Added retry logic for failed payment captures\n- Changed subscription billing cycle calculation\n- Removed deprecated /v1/charge endpoint`,
      status: 'BLOCKED',
      verdict: 'BLOCKED',
      riskScore: 78,
      risks: {
        create: [
          {
            title: 'Breaking change in webhook payload structure',
            description:
              'The Stripe v2 webhook payload uses a different event schema. Existing webhook handlers will fail silently if not updated, potentially losing payment confirmations.',
            severity: 'CRITICAL',
            resolved: false,
          },
          {
            title: 'Subscription billing cycle off-by-one',
            description:
              'The new billing cycle calculation may charge customers one day early during month boundaries. Needs edge-case testing around Feb 28/29 and month-end dates.',
            severity: 'HIGH',
            resolved: false,
          },
          {
            title: 'Deprecated endpoint removal may break mobile clients',
            description:
              "Mobile app versions 3.1 and below still call /v1/charge. Removing it without a deprecation period could break payments for users who haven't updated.",
            severity: 'HIGH',
            resolved: true,
          },
          {
            title: 'Retry logic may cause duplicate charges',
            description:
              'The retry mechanism for failed captures should use idempotency keys. Without them, transient network errors could result in double charges.',
            severity: 'MEDIUM',
            resolved: false,
          },
        ],
      },
      checklist: {
        create: [
          {
            title: 'Update webhook handlers to v2 event schema',
            completed: false,
          },
          {
            title: 'Add idempotency keys to payment capture retries',
            completed: false,
          },
          {
            title: 'Test billing cycle calculation for edge-case dates',
            completed: true,
          },
          {
            title: 'Set up monitoring alerts for failed webhook deliveries',
            completed: false,
          },
          {
            title: 'Communicate /v1/charge deprecation to mobile team',
            completed: true,
          },
        ],
      },
      approvals: {
        create: [
          {
            role: 'ENGINEERING',
            status: 'APPROVED',
            comment:
              'Code reviewed, retry logic needs idempotency fix before deploy.',
          },
          {
            role: 'QA',
            status: 'REJECTED',
            comment:
              'Webhook integration tests are failing on staging. Cannot approve until resolved.',
          },
          { role: 'PRODUCT', status: 'PENDING', comment: '' },
        ],
      },
      timeline: {
        create: [
          {
            type: 'CREATED',
            message: 'Release v2.4.0 — Payment Gateway Migration created',
          },
          {
            type: 'ANALYZED',
            message:
              'Analysis complete: 4 risks identified, 5 checklist items generated',
          },
          {
            type: 'APPROVAL_UPDATED',
            message: 'ENGINEERING approval set to APPROVED',
          },
          { type: 'APPROVAL_UPDATED', message: 'QA approval set to REJECTED' },
          { type: 'STATUS_CHANGED', message: 'Status changed to BLOCKED' },
          { type: 'VERDICT_CHANGED', message: 'Verdict changed to BLOCKED' },
        ],
      },
    },
  })

  const readyRelease = await prisma.release.create({
    data: {
      title: 'v2.3.1 — Search Performance Hotfix',
      description: 'Optimize Elasticsearch queries and add response caching',
      releaseNotes: `- Added Redis caching layer for search results\n- Optimized Elasticsearch aggregation queries\n- Reduced search API p95 latency from 1200ms to 180ms\n- Added cache invalidation on document index updates`,
      status: 'READY',
      verdict: 'READY',
      riskScore: 12,
      risks: {
        create: [
          {
            title: 'Cache invalidation race condition',
            description:
              'If a document is re-indexed while a search is in flight, stale results could be served from cache. Low probability in practice due to TTL.',
            severity: 'LOW',
            resolved: true,
          },
          {
            title: 'Redis connection pool exhaustion under load',
            description:
              'High-traffic bursts could exhaust the Redis connection pool if max connections are set too low. Current config uses default pool size of 10.',
            severity: 'MEDIUM',
            resolved: true,
          },
        ],
      },
      checklist: {
        create: [
          {
            title: 'Load test search API with caching enabled',
            completed: true,
          },
          { title: 'Verify cache invalidation on re-index', completed: true },
          {
            title: 'Increase Redis connection pool size to 50',
            completed: true,
          },
          { title: 'Add cache hit/miss ratio monitoring', completed: true },
        ],
      },
      approvals: {
        create: [
          {
            role: 'ENGINEERING',
            status: 'APPROVED',
            comment: 'Performance gains confirmed. Redis config looks solid.',
          },
          {
            role: 'QA',
            status: 'APPROVED',
            comment:
              'Load tests passed. Cache invalidation verified on staging.',
          },
          {
            role: 'PRODUCT',
            status: 'APPROVED',
            comment: 'Search latency improvement is significant. Ship it.',
          },
        ],
      },
      timeline: {
        create: [
          {
            type: 'CREATED',
            message: 'Release v2.3.1 — Search Performance Hotfix created',
          },
          {
            type: 'ANALYZED',
            message:
              'Analysis complete: 2 risks identified, 4 checklist items generated',
          },
          {
            type: 'RISK_RESOLVED',
            message: 'Risk resolved: Cache invalidation race condition',
          },
          {
            type: 'RISK_RESOLVED',
            message:
              'Risk resolved: Redis connection pool exhaustion under load',
          },
          {
            type: 'CHECKLIST_COMPLETED',
            message: 'All checklist items completed',
          },
          {
            type: 'APPROVAL_UPDATED',
            message: 'ENGINEERING approval set to APPROVED',
          },
          { type: 'APPROVAL_UPDATED', message: 'QA approval set to APPROVED' },
          {
            type: 'APPROVAL_UPDATED',
            message: 'PRODUCT approval set to APPROVED',
          },
          { type: 'STATUS_CHANGED', message: 'Status changed to READY' },
          { type: 'VERDICT_CHANGED', message: 'Verdict changed to READY' },
        ],
      },
    },
  })

  console.warn(`Seeded blocked release: ${blockedRelease.id}`)
  console.warn(`Seeded ready release: ${readyRelease.id}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
