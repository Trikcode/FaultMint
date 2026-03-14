import type { AnalysisResult } from './mock-analyzer'
import { mockAnalyze } from './mock-analyzer'

export type { AnalysisResult }

export async function analyzeRelease(
  releaseNotes: string,
): Promise<AnalysisResult> {
  const mode = process.env.ANALYSIS_MODE ?? 'mock'

  if (mode === 'openai') {
    try {
      const { openaiAnalyze } = await import('./openai-analyzer')
      const result = await openaiAnalyze(releaseNotes)
      return result
    } catch (error) {
      console.error(
        'OpenAI analysis failed, falling back to mock analyzer:',
        error instanceof Error ? error.message : String(error),
      )
      return mockAnalyze(releaseNotes)
    }
  }

  return mockAnalyze(releaseNotes)
}
