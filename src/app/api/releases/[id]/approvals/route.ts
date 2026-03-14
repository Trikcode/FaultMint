import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { approvalSubmitSchema } from '@/lib/validators'
import { evaluateRelease } from '@/lib/release-evaluator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const release = await prisma.release.findUnique({
      where: { id },
    })

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    const body: unknown = await request.json()
    const parsed = approvalSubmitSchema.safeParse({
      ...(typeof body === 'object' && body !== null ? body : {}),
      releaseId: id,
    })

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { role, status, comment } = parsed.data

    const existing = await prisma.approval.findUnique({
      where: { releaseId_role: { releaseId: id, role } },
    })

    let approval

    if (existing) {
      approval = await prisma.approval.update({
        where: { id: existing.id },
        data: { status, comment },
      })
    } else {
      approval = await prisma.approval.create({
        data: {
          releaseId: id,
          role,
          status,
          comment,
        },
      })
    }

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
        type: 'APPROVAL_UPDATED',
        message: `${role} approval set to ${status}${comment ? `: ${comment}` : ''}`,
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

    return NextResponse.json({ approval, release: updated })
  } catch (error) {
    console.error('POST /api/releases/[id]/approvals error:', error)
    return NextResponse.json(
      { error: 'Failed to submit approval' },
      { status: 500 },
    )
  }
}
