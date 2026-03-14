interface RiskInput {
  severity: string
  resolved: boolean
}

interface ChecklistInput {
  completed: boolean
}

interface ApprovalInput {
  role: string
  status: string
}

type ReleaseStatus = 'DRAFT' | 'ANALYZED' | 'BLOCKED' | 'READY'
type ReleaseVerdict = 'NEEDS_ATTENTION' | 'BLOCKED' | 'READY'

const REQUIRED_APPROVAL_ROLES = ['ENGINEERING', 'QA', 'PRODUCT']

const SEVERITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 10,
  LOW: 5,
}

export function computeRiskScore(risks: RiskInput[]): number {
  if (risks.length === 0) return 0

  const totalWeight = risks.reduce((sum, risk) => {
    const weight = SEVERITY_WEIGHTS[risk.severity] ?? 0
    return sum + weight
  }, 0)

  const unresolvedWeight = risks
    .filter((r) => !r.resolved)
    .reduce((sum, risk) => {
      const weight = SEVERITY_WEIGHTS[risk.severity] ?? 0
      return sum + weight
    }, 0)

  if (totalWeight === 0) return 0

  const score = Math.round((unresolvedWeight / totalWeight) * 100)
  return Math.min(score, 100)
}

export function hasUnresolvedHighOrCritical(risks: RiskInput[]): boolean {
  return risks.some(
    (r) => !r.resolved && (r.severity === 'HIGH' || r.severity === 'CRITICAL'),
  )
}

export function allChecklistCompleted(checklist: ChecklistInput[]): boolean {
  if (checklist.length === 0) return true
  return checklist.every((item) => item.completed)
}

export function allApprovalsGranted(approvals: ApprovalInput[]): boolean {
  return REQUIRED_APPROVAL_ROLES.every((role) => {
    const approval = approvals.find((a) => a.role === role)
    return approval !== undefined && approval.status === 'APPROVED'
  })
}

export function hasRejectedApproval(approvals: ApprovalInput[]): boolean {
  return approvals.some((a) => a.status === 'REJECTED')
}

export function hasMissingApprovals(approvals: ApprovalInput[]): boolean {
  return REQUIRED_APPROVAL_ROLES.some((role) => {
    const approval = approvals.find((a) => a.role === role)
    return approval === undefined || approval.status === 'PENDING'
  })
}

export function computeVerdict(
  risks: RiskInput[],
  checklist: ChecklistInput[],
  approvals: ApprovalInput[],
): ReleaseVerdict {
  const noUnresolvedHighCritical = !hasUnresolvedHighOrCritical(risks)
  const checklistDone = allChecklistCompleted(checklist)
  const approvalsGranted = allApprovalsGranted(approvals)

  if (noUnresolvedHighCritical && checklistDone && approvalsGranted) {
    return 'READY'
  }

  const hasBlocker =
    hasUnresolvedHighOrCritical(risks) ||
    hasRejectedApproval(approvals) ||
    (!checklistDone && checklist.length > 0)

  if (hasBlocker) {
    return 'BLOCKED'
  }

  return 'NEEDS_ATTENTION'
}

export function computeStatus(
  currentStatus: string,
  risks: RiskInput[],
  checklist: ChecklistInput[],
  approvals: ApprovalInput[],
): ReleaseStatus {
  if (currentStatus === 'DRAFT') {
    return 'DRAFT'
  }

  const verdict = computeVerdict(risks, checklist, approvals)

  if (verdict === 'READY') return 'READY'
  if (verdict === 'BLOCKED') return 'BLOCKED'
  return 'ANALYZED'
}

export interface EvaluationResult {
  status: ReleaseStatus
  verdict: ReleaseVerdict
  riskScore: number
}

export function evaluateRelease(
  currentStatus: string,
  risks: RiskInput[],
  checklist: ChecklistInput[],
  approvals: ApprovalInput[],
): EvaluationResult {
  const riskScore = computeRiskScore(risks)
  const verdict = computeVerdict(risks, checklist, approvals)
  const status = computeStatus(currentStatus, risks, checklist, approvals)

  return { status, verdict, riskScore }
}
