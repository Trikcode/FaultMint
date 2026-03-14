'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createReleaseSchema } from '@/lib/validators'
import { useToast } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'

export function CreateReleaseForm() {
  const router = useRouter()
  const { addToast } = useToast()

  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [owner, setOwner] = useState('')
  const [releaseNotes, setReleaseNotes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError('')

    const trimmedTitle = title.trim()
    const trimmedVersion = version.trim()
    const trimmedOwner = owner.trim()
    const trimmedNotes = releaseNotes.trim()

    const finalTitle = trimmedVersion
      ? `${trimmedVersion} — ${trimmedTitle}`
      : trimmedTitle

    const description = trimmedOwner ? `Owner: ${trimmedOwner}` : ''

    const parsed = createReleaseSchema.safeParse({
      title: finalTitle,
      description,
      releaseNotes: trimmedNotes,
    })

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      const mapped: Record<string, string> = {}
      for (const [key, messages] of Object.entries(flat)) {
        const first = messages?.[0]
        if (first) {
          mapped[key] = first
        }
      }
      setFieldErrors(mapped)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setSubmitError(
          data.error ?? 'Failed to create release. Please try again.',
        )
        setLoading(false)
        return
      }

      const release = (await response.json()) as { id: string }
      addToast('Release created successfully', 'success')
      router.push(`/releases/${release.id}`)
    } catch {
      setSubmitError(
        'Network error. Please check your connection and try again.',
      )
      setLoading(false)
    }
  }

  return (
    <Card padding='lg'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {submitError ? (
          <div
            role='alert'
            className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3'
          >
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
            <p className='text-sm text-red-700'>{submitError}</p>
          </div>
        ) : null}

        <Input
          label='Title'
          placeholder='Payment Gateway Migration'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={fieldErrors['title']}
          required
        />

        <div className='grid gap-5 sm:grid-cols-2'>
          <Input
            label='Version'
            placeholder='v2.4.0'
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            hint='Optional — will be prefixed to the title'
          />

          <Input
            label='Owner'
            placeholder='Jane Smith'
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            hint='Optional — person responsible for this release'
          />
        </div>

        <Textarea
          label='Release Notes'
          placeholder={`Paste your release notes here, for example:\n\n- Migrated payment processing to Stripe API v2\n- Updated webhook signature verification\n- Added retry logic for failed payment captures\n- Changed subscription billing cycle calculation`}
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
          error={fieldErrors['releaseNotes']}
          rows={8}
          required
        />

        <div className='flex items-center justify-end gap-3 border-t border-gray-100 pt-5'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            loading={loading}
            data-testid='create-release-submit'
          >
            {loading ? 'Creating…' : 'Create Release'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
