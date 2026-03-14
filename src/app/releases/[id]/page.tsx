import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ReleaseDetailClient } from '@/components/releases/release-detail-client'

export const dynamic = 'force-dynamic'

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const release = await prisma.release.findUnique({
    where: { id },
    include: {
      risks: { orderBy: { createdAt: 'asc' } },
      checklist: { orderBy: { createdAt: 'asc' } },
      approvals: { orderBy: { createdAt: 'asc' } },
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!release) {
    notFound()
  }

  const serialized = {
    ...release,
    createdAt: release.createdAt.toISOString(),
    updatedAt: release.updatedAt.toISOString(),
    risks: release.risks.map((r: (typeof release.risks)[number]) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    checklist: release.checklist.map(
      (c: (typeof release.checklist)[number]) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }),
    ),
    approvals: release.approvals.map(
      (a: (typeof release.approvals)[number]) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }),
    ),
    timeline: release.timeline.map((t: (typeof release.timeline)[number]) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })),
  }

  return <ReleaseDetailClient initialRelease={serialized} />
}
