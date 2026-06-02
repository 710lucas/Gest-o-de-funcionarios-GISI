---
name: planner
description: Plan vague ideas
---

# Skill: Plan

## When To Use This
Use this skill when the user wants to implement something but hasn't fully articulated it.
Triggers: "I want to add X", "let's build Y", "how would we implement Z", or any vague feature request.

## Step 1 — Orient
Before asking anything, read:
- `.gemini/summary.md` — current project state
- `.gemini/structure.md` — where things live
- `.gemini/features.md` — what already exists
- `.gemini/stack.md` — tech constraints

## Step 2 — Infer
Based on what you read, infer:
- What the user most likely wants
- Which parts of the codebase are affected
- What already exists that can be reused
- What is missing that needs to be built

## Step 3 — Ask (if needed)
If after reading you are still uncertain about scope or approach, ask up to 3 questions.
Prioritize questions that affect architecture or scope over implementation details.
Do not ask about things you can infer or decide with a sensible default.

## Step 4 — Flag Assumptions & Risks
Before the task list, output a short block:
> **Assumed:** [what you inferred that might be wrong]
> **Risk:** [what could block or complicate this]
> **Open:** [anything still unresolved]

## Step 5 — Build the Plan
Break the feature into atomic tasks. Each task should touch one layer and take no more than 30 minutes.
Order by: dependencies first, visible value early, polish last.

### Task format
\`\`\`
- [ ] **Title**
      Layer: data | logic | api | ui | test | docs
      Effort: S | M | L
      Depends on: [task title or "nothing"]
\`\`\`

### Default layer order
1. Data (schema, models, migrations)
2. Logic (services, business rules, calculations)
3. API (endpoints, validation, error handling)
4. UI (components, wiring, state)
5. Tests (unit → integration → e2e)
6. Docs (update features.md, decisions.md, summary.md)

## Step 6 — Confirm Before Executing
Present the plan and ask: "Does this look right, or do you want to adjust anything before I start?"
Do not begin implementation until the user confirms.

## Step 7 — Update Docs After Execution
When the plan is complete, update:
- `.gemini/summary.md` with what was built
- `.gemini/features.md` with the new feature
- `.gemini/decisions.md` with any decisions made during planning