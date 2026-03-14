import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    return NextResponse.json(release)
  } catch (error) {
    console.error('GET /api/releases/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch release' },
      { status: 500 },
    )
  }
}
