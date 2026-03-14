import type { AnalysisResult } from './mock-analyzer'

interface OpenAIRiskItem {
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface OpenAIChecklistItem {
  title: string
}

interface OpenAIAnalysisResponse {
  risks: OpenAIRiskItem[]
  checklist: OpenAIChecklistItem[]
}

const SYSTEM_PROMPT = `You are a senior software reliability engineer performing a pre-mortem analysis on a software release. Given the release notes, identify potential failure risks and generate a mitigation checklist.

Respond ONLY with valid JSON matching this exact schema:
{
  "risks": [
    {
      "title": "Short risk title",
      "description": "Detailed explanation of the risk, why it matters, and its potential impact",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW"
    }
  ],
  "checklist": [
    {
      "title": "Actionable checklist item"
    }
  ]
}

Rules:
- Identify 3-8 risks depending on complexity
- Generate 4-10 checklist items
- Severity guide: CRITICAL = data loss or security breach, HIGH = significant user impact, MEDIUM = moderate impact with workaround, LOW = minor or cosmetic
- Be specific and technical, not generic
- Checklist items must be actionable and verifiable
- Do not wrap JSON in markdown code blocks`

function parseAnalysisResponse(content: string): OpenAIAnalysisResponse {
  const cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()
  const parsed = JSON.parse(cleaned) as OpenAIAnalysisResponse

  if (!Array.isArray(parsed.risks) || !Array.isArray(parsed.checklist)) {
    throw new Error(
      'Invalid response structure: missing risks or checklist arrays',
    )
  }

  const validSeverities = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

  for (const risk of parsed.risks) {
    if (typeof risk.title !== 'string' || risk.title.length === 0) {
      throw new Error('Invalid risk: missing title')
    }
    if (typeof risk.description !== 'string' || risk.description.length === 0) {
      throw new Error('Invalid risk: missing description')
    }
    if (!validSeverities.has(risk.severity)) {
      throw new Error(`Invalid risk severity: ${String(risk.severity)}`)
    }
  }

  for (const item of parsed.checklist) {
    if (typeof item.title !== 'string' || item.title.length === 0) {
      throw new Error('Invalid checklist item: missing title')
    }
  }

  return parsed
}

export async function openaiAnalyze(
  releaseNotes: string,
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const { default: OpenAI } = await import('openai')

  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze these release notes for potential failure risks:\n\n${releaseNotes}`,
      },
    ],
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI returned an empty response')
  }

  const parsed = parseAnalysisResponse(content)

  return {
    risks: parsed.risks,
    checklist: parsed.checklist,
  }
}
