import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import { ReleaseList } from '@/components/dashboard/release-list'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const releases = await prisma.release.findMany({
    include: {
      risks: true,
      checklist: true,
      approvals: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
            Releases
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Manage and monitor all your release pre-mortems.
          </p>
        </div>
        <Link
          href='/releases/new'
          className='inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-ring'
        >
          <Plus className='h-4 w-4' />
          New Release
        </Link>
      </div>

      <ReleaseList releases={releases} />
    </div>
  )
}
