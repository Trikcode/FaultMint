# FaultMint — Product Specification

## Problem

Software teams discover what went wrong **after** a release causes an incident. Post-mortems are reactive. By the time risks are identified, the damage — downtime, data loss, broken payments, security exposure — has already happened.

There is no standard tool that forces structured risk thinking **before** shipping. Release checklists are ad-hoc, approvals are scattered across Slack threads, and no one aggregates risk signals into a single ship-or-block decision.

## Target User

- Engineering leads managing releases across teams
- QA engineers responsible for sign-off before production deploys
- Product managers who need visibility into release risk without reading code
- DevOps and SRE teams who want a pre-deployment gate

## Core User Journeys

### Journey 1: Create and Analyze a Release

1. User navigates to `/releases/new`
2. User enters a title, optional version, optional owner, and pastes release notes
3. User submits the form
4. System creates a release in `DRAFT` status with `NEEDS_ATTENTION` verdict and risk score `0`
5. System records a `CREATED` timeline event
6. User is redirected to `/releases/[id]`
7. User clicks "Run Analysis"
8. System analyzes release notes (mock or OpenAI) and generates risk items and checklist items
9. System recomputes status, verdict, and risk score
10. System records `ANALYZED`, and any `STATUS_CHANGED` / `VERDICT_CHANGED` timeline events
11. User sees predicted risks ranked by severity and a mitigation checklist

### Journey 2: Resolve Risks and Complete Checklist

1. User views a release that has been analyzed
2. User toggles a risk item from unresolved to resolved
3. System records a `RISK_RESOLVED` timeline event
4. System recomputes status, verdict, and risk score
5. User toggles a checklist item from incomplete to complete
6. System records a `CHECKLIST_COMPLETED` timeline event
7. System recomputes status, verdict, and risk score
8. User continues until all HIGH/CRITICAL risks are resolved and all checklist items are done

### Journey 3: Collect Approvals and Reach READY

1. User selects a role (ENGINEERING, QA, or PRODUCT) and a decision (APPROVED or REJECTED)
2. User optionally adds a comment
3. User submits the approval
4. System upserts the approval (one per role per release)
5. System records an `APPROVAL_UPDATED` timeline event
6. System recomputes status, verdict, and risk score
7. When all three roles approve, all risks are resolved, and all checklist items are complete, the release transitions to `READY` status and `READY` verdict

### Journey 4: Dashboard Overview

1. User navigates to `/dashboard`
2. User sees all releases with title, version, owner, status badge, verdict badge, risk score, risk counts, checklist progress, and creation date
3. User clicks a release card to view details
4. If no releases exist, user sees an empty state with a link to create one

## Business Rules

### Release Lifecycle

| Rule                          | Description                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Initial state                 | `DRAFT` status, `NEEDS_ATTENTION` verdict, risk score `0`                                       |
| After analysis                | Status moves from `DRAFT` to `ANALYZED`, `BLOCKED`, or `READY` depending on evaluation          |
| Recompute trigger             | Every mutation (analyze, risk toggle, checklist toggle, approval submit) triggers recomputation |
| Status never reverts to DRAFT | Once analyzed, a release is never `DRAFT` again                                                 |

### Verdict Evaluation

| Verdict           | Condition                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `READY`           | No unresolved HIGH or CRITICAL risks AND all checklist items completed AND all 3 required approvals are APPROVED          |
| `BLOCKED`         | Any unresolved HIGH or CRITICAL risk OR any REJECTED approval OR incomplete checklist items (when checklist is non-empty) |
| `NEEDS_ATTENTION` | All other cases                                                                                                           |

### Risk Score Computation

- Each severity has a weight: CRITICAL=40, HIGH=25, MEDIUM=10, LOW=5
- Score = round((sum of unresolved weights / sum of all weights) \* 100)
- Capped at 100
- Score is 0 when there are no risks

### Approval Rules

- Three required roles: ENGINEERING, QA, PRODUCT
- One approval per role per release (unique constraint)
- Resubmission overwrites the previous decision for that role
- All three must be APPROVED for the release to be READY

### Timeline Events

Events are created for:

- `CREATED` — release created
- `ANALYZED` — analysis completed
- `RISK_RESOLVED` — risk marked as resolved
- `RISK_UNRESOLVED` — risk reopened
- `CHECKLIST_COMPLETED` — checklist item completed
- `CHECKLIST_UNCHECKED` — checklist item unchecked
- `APPROVAL_UPDATED` — approval submitted or changed
- `STATUS_CHANGED` — release status changed
- `VERDICT_CHANGED` — release verdict changed

Timeline events are immutable and ordered chronologically.

### Analysis

- Default mode is deterministic mock analysis
- Mock analyzer parses release notes for keywords (auth, payment, migration, database, cache, queue, webhook, search, email, infra, analytics, permissions, rate limit, rollback, mobile, notification) and returns matching risks and checklist items
- OpenAI mode is optional and requires `OPENAI_API_KEY`
- If OpenAI fails, system falls back to mock mode silently
- Re-running analysis clears all previous risks and checklist items and generates fresh ones

## Acceptance Criteria

### Create Release

- [ ] Title is required, max 200 characters
- [ ] Release notes are required, max 10,000 characters
- [ ] Description is optional, max 1,000 characters
- [ ] New release starts as DRAFT / NEEDS_ATTENTION / score 0
- [ ] Timeline event CREATED is recorded
- [ ] User is redirected to the release detail page

### Run Analysis

- [ ] Clears previous risks and checklist items
- [ ] Generates new risks with title, description, severity
- [ ] Generates new checklist items
- [ ] All generated risks start as unresolved
- [ ] All generated checklist items start as incomplete
- [ ] Recomputes status, verdict, and risk score
- [ ] Records ANALYZED timeline event
- [ ] Records STATUS_CHANGED and VERDICT_CHANGED if they differ from previous values

### Toggle Risk

- [ ] Flips resolved state
- [ ] Recomputes status, verdict, and risk score
- [ ] Records RISK_RESOLVED or RISK_UNRESOLVED timeline event
- [ ] Risk must belong to the specified release

### Toggle Checklist Item

- [ ] Flips completed state
- [ ] Recomputes status, verdict, and risk score
- [ ] Records CHECKLIST_COMPLETED or CHECKLIST_UNCHECKED timeline event
- [ ] Item must belong to the specified release

### Submit Approval

- [ ] Role must be ENGINEERING, QA, or PRODUCT
- [ ] Status must be APPROVED or REJECTED
- [ ] Comment is optional, max 1,000 characters
- [ ] Upserts by releaseId + role
- [ ] Recomputes status, verdict, and risk score
- [ ] Records APPROVAL_UPDATED timeline event

### Dashboard

- [ ] Lists all releases ordered by creation date (newest first)
- [ ] Shows title, status badge, verdict badge, risk score, risk counts, checklist progress, creation date
- [ ] Shows empty state when no releases exist
- [ ] Each release links to its detail page

### Release Detail

- [ ] Shows release header with title, version, owner, status, verdict, risk score
- [ ] Shows release notes
- [ ] Shows Run Analysis / Re-run Analysis button
- [ ] Shows draft empty state before analysis
- [ ] Shows loading state during analysis
- [ ] Shows risks sorted by severity (unresolved first)
- [ ] Shows checklist with progress bar
- [ ] Shows approval cards for all three roles
- [ ] Shows approval submission form
- [ ] Shows timeline in reverse chronological order
- [ ] All badges and toggles update in real-time after mutations

## Recommended Test Scenarios

### API Tests

1. **POST /api/releases** — valid payload creates release with correct defaults
2. **POST /api/releases** — missing title returns 400 with field errors
3. **POST /api/releases** — empty release notes returns 400
4. **GET /api/releases** — returns all releases with included relations
5. **GET /api/releases/[id]** — returns release with all relations
6. **GET /api/releases/[id]** — nonexistent ID returns 404
7. **POST /api/releases/[id]/analyze** — generates risks and checklist items
8. **POST /api/releases/[id]/analyze** — clears previous risks and checklist on re-analysis
9. **POST /api/releases/[id]/analyze** — updates status from DRAFT to ANALYZED or BLOCKED
10. **POST /api/releases/[id]/analyze** — creates ANALYZED timeline event
11. **PATCH /api/releases/[id]/risks/[riskId]/toggle** — toggles resolved state
12. **PATCH /api/releases/[id]/risks/[riskId]/toggle** — recomputes risk score
13. **PATCH /api/releases/[id]/risks/[riskId]/toggle** — returns 404 for wrong release
14. **PATCH /api/releases/[id]/checklist/[itemId]/toggle** — toggles completed state
15. **PATCH /api/releases/[id]/checklist/[itemId]/toggle** — recomputes status and verdict
16. **POST /api/releases/[id]/approvals** — creates new approval
17. **POST /api/releases/[id]/approvals** — upserts existing approval for same role
18. **POST /api/releases/[id]/approvals** — invalid role returns 400
19. **POST /api/releases/[id]/approvals** — all approvals + resolved risks + done checklist → READY

### UI / E2E Tests

1. Landing page renders hero, feature cards, and CTA links
2. Dashboard shows empty state when no releases exist
3. Dashboard shows release cards with correct badges
4. Create release form validates required fields
5. Create release form submits and redirects to detail page
6. Release detail page shows DRAFT empty state before analysis
7. Run Analysis button triggers analysis and shows results
8. Risk toggle updates resolved state and risk score
9. Checklist toggle updates progress bar and completion count
10. Approval form submits and updates approval cards
11. All three approvals + resolved risks + done checklist → status and verdict update to READY
12. Timeline shows events in reverse chronological order
13. Re-running analysis clears old data and generates new risks

### Business Logic Tests

1. `computeRiskScore` returns 0 for empty risks
2. `computeRiskScore` returns 0 when all risks are resolved
3. `computeRiskScore` returns 100 when all risks are unresolved
4. `computeRiskScore` returns correct weighted percentage for mixed states
5. `computeVerdict` returns READY when all conditions met
6. `computeVerdict` returns BLOCKED when unresolved CRITICAL risk exists
7. `computeVerdict` returns BLOCKED when approval is REJECTED
8. `computeVerdict` returns NEEDS_ATTENTION when approvals are PENDING
9. `computeStatus` returns DRAFT when current status is DRAFT
10. `computeStatus` returns READY/BLOCKED/ANALYZED based on verdict after analysis
11. Mock analyzer returns deterministic output for same input
12. Mock analyzer matches keyword rules correctly
13. Mock analyzer includes baseline risks and checklist items

## Edge Cases

1. Release notes with no matching keywords — should still return baseline risks and checklist
2. Release notes with all keywords — should return deduplicated risks and checklist items
3. Re-analysis after approvals exist — approvals are preserved, only risks and checklist are regenerated
4. Toggling the last unresolved HIGH risk to resolved when all other conditions are met — should flip to READY
5. Rejecting one approval after all were approved — should flip from READY to BLOCKED
6. Approving an already-approved role — should be idempotent
7. Toggling a risk that does not belong to the release — should return 404
8. Submitting an approval for a nonexistent release — should return 404
9. Creating a release with maximum length title (200 chars) and notes (10,000 chars)
10. Empty checklist after analysis (unlikely but possible) — should not block READY verdict
11. Concurrent toggles on the same risk — should not corrupt state
12. OpenAI returns malformed JSON — should fall back to mock mode
13. OpenAI API key is missing — should fall back to mock mode without error to the user
