import { z } from 'zod'

export const createReleaseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer')
    .default(''),
  releaseNotes: z
    .string()
    .min(1, 'Release notes are required')
    .max(10000, 'Release notes must be 10000 characters or fewer'),
})

export type CreateReleaseInput = z.infer<typeof createReleaseSchema>

export const analyzeReleaseSchema = z.object({
  releaseId: z.string().min(1, 'Release ID is required'),
})

export type AnalyzeReleaseInput = z.infer<typeof analyzeReleaseSchema>

export const approvalSubmitSchema = z.object({
  releaseId: z.string().min(1, 'Release ID is required'),
  role: z.enum(['ENGINEERING', 'QA', 'PRODUCT'], {
    errorMap: () => ({ message: 'Role must be ENGINEERING, QA, or PRODUCT' }),
  }),
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
  }),
  comment: z
    .string()
    .max(1000, 'Comment must be 1000 characters or fewer')
    .default(''),
})

export type ApprovalSubmitInput = z.infer<typeof approvalSubmitSchema>
