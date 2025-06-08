Integrated LLM Development Protocol (ILDP)

1. Context Initialization & Retrieval
	•	At the start of every job/interaction:
	•	Retrieve relevant project context from memory using available search tools.
	•	Prioritize: active projects, recent progress, technical decisions, unresolved blockers, developer preferences.
	•	Always assume the primary interaction is with a developer unless otherwise stated.

⸻

2. Task Planning & Execution (Sequential Thinking Framework)
	•	When task complexity warrants:
	•	Break work into manageable components using structured analysis:
	•	Requirements: objectives, constraints, architecture fit.
	•	Solution Space: approaches, trade-offs, risks.
	•	Implementation: steps, order, testing, rollback plan.
	•	For every step:
	•	Update the memory graph with:
	•	Status, blockers, decisions, new milestones.
	•	New patterns, bugs and fixes, technology insights.
	•	Indicators for rethinking approach: scope changes, new constraints, emerging better solutions.

⸻

3. Coding and Quality Enforcement
	•	Always use absolute file paths in terminal commands.
	•	After code edits or implementations:
	•	Run linting tools (e.g., npm run lint)
	•	Type check TypeScript (tsc --noEmit)
	•	For frontend-related changes:
	•	Execute Playwright end-to-end tests.
	•	Ensure functionality, regression safety, UI correctness.

⸻

4. Project Structure Reference (Hardcoded Context)
**CRITICAL MONOREPO STRUCTURE AWARENESS:**

This is a monorepo with TWO DISTINCT frontend applications. Always verify which frontend you're working with:

• **client-angular/** - Angular 19 frontend (LEGACY/SECONDARY)
  - Framework: Angular 19 with PrimeNG UI components
  - Status: Legacy frontend, minimal maintenance mode
  - Build: `ng build`, `ng serve`
  - Testing: Jasmine, Karma, Cypress
  - Styling: SCSS, Angular Material/PrimeNG components
  - **DO NOT** use React/JSX syntax, hooks, or Next.js patterns here

• **client_angular2/** - React/Next.js frontend (PRIMARY/CURRENT FOCUS)  
  - Framework: Next.js 15.3.3 with React 18.3.1
  - UI: Tailwind CSS + Radix UI + shadcn/ui components
  - Build: `npm run build`, `npm run dev`
  - Testing: Playwright for E2E testing
  - Styling: Tailwind CSS classes, CSS modules
  - **DO NOT** use Angular syntax, decorators, or Angular-specific patterns here

**BEFORE MAKING ANY CHANGES:**
1. Identify the correct frontend by checking the file path
2. Use appropriate syntax, patterns, and dependencies for that frontend
3. When uncertain, ask for clarification about which frontend to target
4. Never mix Angular and React patterns between the frontends

**FILE PATH INDICATORS:**
- `/client-angular/` = Angular frontend → Use Angular patterns
- `/client_angular2/` = React/Next.js frontend → Use React/Next.js patterns

⸻

5. Developer Memory and Technical Knowledge Graph
	•	Actively store the following categories:
	•	Technical Profile: languages, frameworks, tools, standards.
	•	Project Context: repositories, architecture, dependencies, team.
	•	Problem-Solving Patterns: debug steps, solution paths, failures.
	•	Workflow Methods: CI/CD, version control, review process.

⸻

6. Adaptive Problem-Type Strategies
	•	Debugging: trace → isolate root cause → fix → verify
	•	Feature Development: requirements → design → build → test
	•	Performance: profile → identify bottlenecks → optimize → validate
	•	Integration: interface mapping → data flow → implementation → end-to-end test

⸻

7. Reasoning Capture & Documentation
	•	For any important decision:
	•	Record rationale, alternatives considered, and why the final choice was made.
	•	Validate final solution:
	•	All constraints met? Integration smooth? Regression avoided?

⸻

8. Final Checklist for Each Request
	•	Search memory for context → Plan via sequential analysis (if complex)
→ Implement → Run lint/type checks → Run tests (if needed) → Update memory with progress & knowledge

⸻

🔁 REMEMBER:
	•	Use fill prop OR define explicit width/height on all Next.js <Image> components.
	•	Capture technical insights and decisions as they happen, not just at the end.

⸻

🔄 This Protocol Enables:
	•	LLMs to operate as structured technical co-pilots
	•	Continuously improving problem-solving intelligence
	•	Transparent, traceable, and adaptive development process