import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeRelease } from '@/lib/analysis'
import { evaluateRelease } from '@/lib/release-evaluator'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        approvals: true,
      },
    })

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    const analysisResult = await analyzeRelease(release.releaseNotes)

    await prisma.riskItem.deleteMany({ where: { releaseId: id } })
    await prisma.checklistItem.deleteMany({ where: { releaseId: id } })

    const createdRisks = await Promise.all(
      analysisResult.risks.map((risk) =>
        prisma.riskItem.create({
          data: {
            title: risk.title,
            description: risk.description,
            severity: risk.severity,
            resolved: false,
            releaseId: id,
          },
        }),
      ),
    )

    const createdChecklist = await Promise.all(
      analysisResult.checklist.map((item) =>
        prisma.checklistItem.create({
          data: {
            title: item.title,
            completed: false,
            releaseId: id,
          },
        }),
      ),
    )

    const evaluation = evaluateRelease(
      'ANALYZED',
      createdRisks.map((r) => ({ severity: r.severity, resolved: r.resolved })),
      createdChecklist.map((c) => ({ completed: c.completed })),
      release.approvals.map((a: (typeof release.approvals)[0]) => ({
        role: a.role,
        status: a.status,
      })),
    )

    const timelineEntries = [
      {
        type: 'ANALYZED',
        message: `Analysis complete: ${createdRisks.length} risks identified, ${createdChecklist.length} checklist items generated`,
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
    console.error('POST /api/releases/[id]/analyze error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze release' },
      { status: 500 },
    )
  }
}
