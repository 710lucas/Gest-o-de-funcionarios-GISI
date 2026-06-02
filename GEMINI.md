# Project: Gestão de Funcionários

## Before You Do Anything
1. Read `.gemini/summary.md` to understand the current project state
2. Update `.gemini/summary.md` at the end of every session

---

## General Instructions

This is a CRUD application for employee management (Gestão de Funcionários) built with React and Vite. It features a dual-mode persistence system (LocalStorage and external REST API).

### 🧠 Product
1. What problem does it solve: Employee management, including registration, listing, editing, and reporting.
2. Target user: HR or department managers.
3. Success criterion: A functional, responsive web app that allows full CRUD operations and provides visual insights via a dashboard.

### 🏗️ Stack
- Frontend: React (Vite)
- Language: JavaScript (ESM)
- Routing: React Router Dom
- Icons: Lucide React
- Charts: Recharts
- PDF/CSV: html2canvas, jspdf, papaparse
- Styling: Vanilla CSS
- Backend (External): Spring Boot (see `API_CONFIG.md`)

### 🚀 Deploy & Infrastructure
- Frontend: Likely static hosting (Vercel, Netlify, or similar).
- Backend: External API (Spring Boot).

### 📄 Docs
- `API_CONFIG.md`: API format and configuration.
- `DOCUMENTACAO_CODIGO.md`: Technical documentation of the code structure.
- `README.md`: Project overview.

---

## After Discovery: What To Do
1. Replace `Project: Not Yet Defined` at the top with the actual project name
2. Fill the collected information into the relevant `.gemini/` files
3. Create `.gemini/summary.md` with the initial project state
4. Populate `.gemini/stack.md`, `.gemini/conventions.md`, and `.gemini/structure.md` based on the answers
5. Fill any gaps the user left open with sensible defaults and flag them clearly

---

## Persona & Behavior

- Be direct and concise — do not over-explain unless asked
- Prefer simple, explicit solutions over clever ones
- Ask before making assumptions on anything that affects architecture or structure
- When something is ambiguous, state your assumption clearly and proceed — do not stop and wait
- Do not repeat yourself across responses — refer back instead
- Prefer showing code over explaining it in prose

---

## Coding Principles

- No premature optimization
- No magic numbers or magic strings — use named constants
- Prefer explicit over implicit
- Keep functions small and single-purpose
- Write code that is easy to delete, not just easy to extend
- Naming should be clear enough that comments are rarely needed
- Follow the conventions defined in `.gemini/conventions.md` at all times

---

## How To Handle Uncertainty

- If you do not know something, say so — do not hallucinate
- If the user has not defined something, make a sensible default, apply it, and flag it with a `> **Assumption:**` note
- If a decision significantly affects architecture, stop and ask before proceeding
- If you are choosing between two valid approaches, briefly state both and say which you are going with and why

---

## How To Handle Large Tasks

1. Break the task into steps and list them before starting
2. Confirm with the user if the plan looks correct before executing
3. Execute one step at a time and report completion before moving to the next
4. If something unexpected comes up mid-task, stop and flag it

---

<!-- DO NOT EDIT BELOW THIS LINE -->

## Maintainability: Coding Flow (`.gemini/`)

Update the relevant file in `.gemini/` whenever the user:
- Explicitly changes a coding preference or convention
- Approves a new pattern after it has been used in the project
- Asks to stop doing something a certain way

Each file covers one concern. Create new files as new concerns emerge.
Never delete a rule — deprecate it with a strikethrough and a note explaining why.

Available files and their responsibilities:
- `summary.md` — current project state, what exists, what is working, what is pending
- `structure.md` — folder and file map with a one-line description of each part
- `decisions.md` — ADR-lite log of what was decided, why, and what was rejected
- `features.md` — list of implemented features and where to find them in the codebase
- `conventions.md` — coding style, naming rules, and patterns in use
- `testing.md` — test strategy, what is covered, and how to run tests
- `commits.md` — commit message format and branch naming rules
- `stack.md` — stack choices with a brief justification for each

## Maintainability: Project Knowledge (`.gemini/project/`)

After any session where a significant decision was made or a feature was built, update:
- `decisions.md` — what was decided and why (ADR-lite format)
- `features.md` — what the feature does and where to find it in the codebase
- `structure.md` — if the folder or file structure changed

## Maintainability: Summary (`.gemini/summary.md`)

This is the entry point for every session. It must always reflect the current state of the project.

Update it at the end of every session with:
- What was built or changed this session
- What is currently in progress or pending
- Any open questions or unresolved decisions
- Current overall project status (e.g. discovery / scaffolding / in development / MVP ready)