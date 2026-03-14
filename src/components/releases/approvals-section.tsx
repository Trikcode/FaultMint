'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { approvalStatusColor, formatRelativeTime } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react'

interface Approval {
  id: string
  role: string
  status: string
  comment: string
  createdAt: string
  updatedAt: string
}

interface ApprovalsSectionProps {
  approvals: Approval[]
  onSubmit: (role: string, status: string, comment: string) => Promise<void>
}

const ROLES = ['ENGINEERING', 'QA', 'PRODUCT'] as const

const roleOptions = ROLES.map((r) => ({ value: r, label: r }))

const statusOptions = [
  { value: 'APPROVED', label: 'Approve' },
  { value: 'REJECTED', label: 'Reject' },
]

const statusIcons: Record<string, React.ReactNode> = {
  APPROVED: <CheckCircle2 className='h-4 w-4 text-green-500' />,
  REJECTED: <XCircle className='h-4 w-4 text-red-500' />,
  PENDING: <Clock className='h-4 w-4 text-yellow-500' />,
}

function ApprovalCard({ approval }: { approval: Approval }) {
  return (
    <div className='flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4'>
      <div className='mt-0.5 flex-shrink-0'>
        {statusIcons[approval.status] ?? statusIcons['PENDING']}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-gray-900'>
            {approval.role}
          </span>
          <Badge
            variant='custom'
            size='sm'
            className={approvalStatusColor(approval.status)}
          >
            {approval.status}
          </Badge>
        </div>
        {approval.comment ? (
          <p className='mt-1.5 text-sm text-gray-600'>{approval.comment}</p>
        ) : null}
        <p className='mt-1 text-xs text-gray-400'>
          {formatRelativeTime(approval.updatedAt)}
        </p>
      </div>
    </div>
  )
}

function MissingApprovalCard({ role }: { role: string }) {
  return (
    <div className='flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4'>
      <Clock className='h-4 w-4 flex-shrink-0 text-gray-300' />
      <div>
        <span className='text-sm font-medium text-gray-500'>{role}</span>
        <p className='text-xs text-gray-400'>Awaiting approval</p>
      </div>
    </div>
  )
}

export function ApprovalsSection({
  approvals,
  onSubmit,
}: ApprovalsSectionProps) {
  const [role, setRole] = useState<string>(ROLES[0])
  const [status, setStatus] = useState<string>('APPROVED')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!role || !status) return

    setSubmitting(true)
    await onSubmit(role, status, comment.trim())
    setComment('')
    setSubmitting(false)
  }

  const approvalMap = new Map(approvals.map((a) => [a.role, a]))

  return (
    <div className='space-y-6'>
      {/* Current Approvals */}
      <div className='space-y-3'>
        <h4 className='text-sm font-medium text-gray-700'>Current Status</h4>
        <div className='grid gap-3 sm:grid-cols-3'>
          {ROLES.map((r) => {
            const approval = approvalMap.get(r)
            return approval ? (
              <ApprovalCard key={r} approval={approval} />
            ) : (
              <MissingApprovalCard key={r} role={r} />
            )
          })}
        </div>
      </div>

      {/* Submit Form */}
      <div className='border-t border-gray-100 pt-5'>
        <h4 className='text-sm font-medium text-gray-700'>Submit Approval</h4>
        <form onSubmit={handleSubmit} className='mt-3 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Select
              label='Role'
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Select
              label='Decision'
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          <Textarea
            label='Comment'
            placeholder='Optional — add context for your decision'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <Button
            type='submit'
            loading={submitting}
            icon={<UserCheck className='h-4 w-4' />}
            data-testid='approval-submit'
          >
            {submitting ? 'Submitting…' : 'Submit Approval'}
          </Button>
        </form>
      </div>
    </div>
  )
}
