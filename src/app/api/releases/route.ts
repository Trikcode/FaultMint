import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createReleaseSchema } from '@/lib/validators'

export async function GET() {
  try {
    const releases = await prisma.release.findMany({
      include: {
        risks: true,
        checklist: true,
        approvals: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(releases)
  } catch (error) {
    console.error('GET /api/releases error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const parsed = createReleaseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { title, description, releaseNotes } = parsed.data

    const release = await prisma.release.create({
      data: {
        title,
        description,
        releaseNotes,
        status: 'DRAFT',
        verdict: 'NEEDS_ATTENTION',
        riskScore: 0,
        timeline: {
          create: {
            type: 'CREATED',
            message: `Release "${title}" created`,
          },
        },
      },
      include: {
        risks: true,
        checklist: true,
        approvals: true,
        timeline: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json(release, { status: 201 })
  } catch (error) {
    console.error('POST /api/releases error:', error)
    return NextResponse.json(
      { error: 'Failed to create release' },
      { status: 500 },
    )
  }
}
