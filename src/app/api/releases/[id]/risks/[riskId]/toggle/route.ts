import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { evaluateRelease } from '@/lib/release-evaluator'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string; riskId: string }> },
) {
  try {
    const { id, riskId } = await params

    const release = await prisma.release.findUnique({
      where: { id },
    })

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    const risk = await prisma.riskItem.findUnique({
      where: { id: riskId },
    })

    if (!risk || risk.releaseId !== id) {
      return NextResponse.json(
        { error: 'Risk item not found for this release' },
        { status: 404 },
      )
    }

    const updatedRisk = await prisma.riskItem.update({
      where: { id: riskId },
      data: { resolved: !risk.resolved },
    })

    const allRisks = await prisma.riskItem.findMany({
      where: { releaseId: id },
    })
    const allChecklist = await prisma.checklistItem.findMany({
      where: { releaseId: id },
    })
    const allApprovals = await prisma.approval.findMany({
      where: { releaseId: id },
    })

    const evaluation = evaluateRelease(
      release.status,
      allRisks.map((r) => ({ severity: r.severity, resolved: r.resolved })),
      allChecklist.map((c) => ({ completed: c.completed })),
      allApprovals.map((a) => ({ role: a.role, status: a.status })),
    )

    const timelineEntries = [
      {
        type: updatedRisk.resolved ? 'RISK_RESOLVED' : 'RISK_UNRESOLVED',
        message: updatedRisk.resolved
          ? `Risk resolved: ${updatedRisk.title}`
          : `Risk reopened: ${updatedRisk.title}`,
        releaseId: id,
      },
    ]

    if (release.status !== evaluation.status) {
      timelineEntries.push({
        type: 'STATUS_CHANGED',
        message: `Status changed from ${release.status} to ${evaluation.status}`,
        releaseId: id,
      })
    }

    if (release.verdict !== evaluation.verdict) {
      timelineEntries.push({
        type: 'VERDICT_CHANGED',
        message: `Verdict changed from ${release.verdict} to ${evaluation.verdict}`,
        releaseId: id,
      })
    }

    await prisma.timelineEvent.createMany({ data: timelineEntries })

    const updated = await prisma.release.update({
      where: { id },
      data: {
        status: evaluation.status,
        verdict: evaluation.verdict,
        riskScore: evaluation.riskScore,
      },
      include: {
        risks: { orderBy: { createdAt: 'asc' } },
        checklist: { orderBy: { createdAt: 'asc' } },
        approvals: { orderBy: { createdAt: 'asc' } },
        timeline: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(
      'PATCH /api/releases/[id]/risks/[riskId]/toggle error:',
      error,
    )
    return NextResponse.json(
      { error: 'Failed to toggle risk' },
      { status: 500 },
    )
  }
}
