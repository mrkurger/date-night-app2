Phase 1: Foundational Cleanup & Accuracy (Short Term)

Goal: Ensure existing core documentation is accurate, up-to-date, and easy to navigate. Fix immediate issues and handle outdated content.
Actions:
Fix Test Report Generation:
Verify/Update scripts/combine-test-reports.js to correctly parse coverage-summary.json (if not already done as part of the report migration fixes).
Ensure test runners (Karma, Jest) output coverage-summary.json.
Result: downloaded-reports/testing/coverage-summary.md becomes accurate and reliable.
Update All READMEs:
Enhance root README.md: Project overview, tech stack, clear links to key docs (Architecture, Setup, Contribution, Deployment), basic setup/run commands.
Enhance client-angular/README.md & server/README.md: Detailed, specific instructions for setup, build, testing, running each part. Include environment variable requirements.
Identify & Archive Outdated Documentation:
Formally review all files in docs/ (excluding downloaded-reports/).
Identify entire files or specific sections that are purely historical, superseded, or no longer relevant (referencing lists generated in initial analysis, e.g., CHANGELOG_REPORTS_MIGRATION.md, Example_UnitStrat.md, UnitTestLessons.md, HTTP_ERROR_HANDLING.md, etc., if they weren't already moved).
Create docs/outdated/ if it doesn't exist.
Move identified outdated files/content to docs/outdated/ using git mv. Add a README.md in docs/outdated/ explaining its purpose.
Reframe Historical Docs:
Add a clear preamble to docs/ui-ux-implementation-plan.md stating it's a historical record of the 2024/2025 refactor. Mark other historical planning docs similarly (ui-ux-roadmap.md, etc.).
Review & Curate AILessons.md:
Perform a thorough review. Identify sections detailing stable, important patterns (Error Handling, Theme System, Testing Strategies, Security Practices, etc.) vs. specific fixed bugs or obsolete approaches.
Mark or archive obsolete sections. Prepare for extraction/integration in later phases.
Goal: Improve navigability and focus on currently relevant best practices.
Verify & Update Core Guides:
Review and update docs/ARCHITECTURE.md (or create if missing - see Phase 2), SETUP.md, nodejs-installation-guide.md, specific-version-installation-guide.md, MONGODB_TROUBLESHOOTING.md, docs/ANGULAR_BUILD_OPTIMIZATION.md, docs/CODE_FORMATTING.md for current project state, tech stack (Angular ~19, Node ~22), and structure.
Verify/Regenerate Configuration Docs:
Verify scripts/update_config_index.py and scripts/update_customization_headers.py work.
Run scripts to regenerate docs/CONFIG_INDEX.md and update headers. Add a CI check for staleness.
Review docs/CUSTOMIZATION_GUIDE.md for process accuracy.
Review Meta-Docs:
Update docs/DEPRECATED.md (review timelines, ensure dependency info is consolidated if DEPENDENCY_MANAGEMENT.md was created).
Update docs/DUPLICATES.md status based on refactoring progress.
Update docs/DOCUMENTATION_INDEX.md and docs/DOCUMENTATION_STYLE_GUIDE.md to reflect all Phase 1 changes.
Phase 2: Consolidation & Core Content Creation (Medium Term)

Goal: Reduce information overlap, create essential missing architectural, API, and component documentation.
Actions:
Consolidate Overlapping Information:
Execute the consolidation plan developed during analysis (e.g., merge testing docs into TESTING_GUIDE.md/ANGULAR_TESTING_LESSONS.md, security docs under SECURITY_BEST_PRACTICES.md, create DEPENDENCY_MANAGEMENT.md, CI_CD_GUIDE.md, THEMING_GUIDE.md etc.).
Merge content, update internal links, update TOCs, and delete the source files that were merged.
Prune AILessons.md significantly, replacing detailed sections with summaries and links to the canonical documents.
Create/Enhance docs/ARCHITECTURE.md:
Describe high-level structure (client-server), key technologies, core libraries, main data flows, authentication, key design patterns.
Include or link to architecture diagrams (verify/update existing docs/images/\*).
Implement API Documentation (Backend):
Integrate Swagger/OpenAPI into the server/ project (e.g., using swagger-jsdoc or tsoa).
Annotate existing Express routes, controllers, and models.
Configure swagger-ui-express to serve interactive docs (e.g., at /api-docs).
Add access instructions to server/README.md.
Implement Component Library Documentation (Frontend):
Set up Storybook or Compodoc for the client-angular/ project.
Create stories/documentation for shared/Emerald UI components (src/app/shared/emerald/components/). Focus on props, events, usage examples, variants.
Add run/view instructions to client-angular/README.md.
Generate Database Schema Documentation:
Generate detailed schema documentation from Mongoose models. Explore tools or use a custom script.
Add as docs/DATABASE_SCHEMA_DETAIL.md and link from docs/ARCHITECTURE.md.
Phase 3: Refinement, Feature Docs & Developer Experience (Medium Term)

Goal: Make docs more concise, document specific features, and add guides for contribution and deployment.
Actions:
Improve Conciseness:
Execute the conciseness strategy: Target long files (AILessons.md, ErrorHandlingTelemetry.md, etc.), remove redundancy, trim intros/conclusions, leverage code examples, use lists/tables, apply brevity principles.
Create Feature Documentation:
For each major feature (Ads, Auth, Chat, Favorites, Profile, Reviews, Wallet, Touring, User Prefs, etc.): Create docs/features/<feature-name>.md.
Document client/server components, services, models, API endpoints, data flow, and key logic.
Update docs/IMPLEMENTATION_SUMMARY.md to link to these detailed docs.
Update Emerald UI / Theming Documentation:
Review docs/emerald-components.md against current code. Update props, events, examples.
Ensure docs/emerald-components-changelog.md is current.
Review/update docs/THEMING_GUIDE.md (or equivalent).
Create CONTRIBUTING.md:
Detail code style (link ESLint/Prettier), branch strategy, commit message format, PR process, testing requirements.
Create docs/DEPLOYMENT.md:
Describe deployment process for different environments. Include steps, required env vars, build commands, platform specifics.
Integrate AILessons.md:
Continue extracting stable, valuable patterns from the curated AILessons.md into relevant canonical documents. AILessons.md remains the detailed log.
Phase 4: Ongoing Maintenance (Continuous)

Goal: Ensure documentation remains accurate, relevant, and discoverable over time.
Actions:
Maintain Generated Docs:
Periodically check the reports in downloaded-reports/ to ensure workflows are running correctly and the information remains useful. Prune old/irrelevant reports if necessary.
Update Documentation Index:
Keep docs/DOCUMENTATION_INDEX.md up-to-date as documentation is added, removed, or restructured.
Follow Style Guide:
Ensure all new and updated documentation adheres to docs/DOCUMENTATION_STYLE_GUIDE.md.
Regular Reviews:
Periodically review documentation alongside code changes to prevent drift.
Link Checking:
Run link checking tools periodically to find and fix broken links within the documentation.

**_ IMPORTANT _** RENAME ALL DOCUMENTATION FILES SO THE FILENAMES ARE IN CAPITALIZED LETTERS FOR CONSISTENCY AND READABILITY.
