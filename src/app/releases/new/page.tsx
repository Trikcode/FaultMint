import { CreateReleaseForm } from '@/components/releases/create-release-form'

export default function NewReleasePage() {
  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
          Create Release
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Add a new release and paste your release notes for AI pre-mortem
          analysis.
        </p>
      </div>

      <CreateReleaseForm />
    </div>
  )
}
