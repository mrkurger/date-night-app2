1. File Creation & Editing
    * New scripts must use the ESModules syntax.
	•	Do NOT convert any code to CommonJS unless explicitly asked.
	•	When editing existing files, update them in place.
	•	If you cannot open/edit a file, return its full updated contents so the user can apply them. !!!DO NOT CREATE DUPLICATE FILES WITHOUT CHECKING FOR AUtHORiZATION FIRST!!!

2. Documentation & Decentralization
	•	Every code folder must contain at least three HTML docs:
	•	CHANGELOG.html
	•	AILESSONS.html
	•	GLOSSARY.html (auto-generated entries for functions/methods in that folder)
	•	No Markdown docs: retire all .md under /docs in favor of HTML.
	•	Follow the component-library HTML template exactly (structure, CSS, navigation).
	•	Central index: maintain _docs_index.html (table of contents) and _glossary.html (global glossary) in repo root.
	•	Tooltips & links: every function/method name in any HTML must hyperlink to its GLOSSARY.html entry and show a brief tooltip on hover.

3. Automation Hooks
	•	GitHub Actions .github/workflows/generate-docs.yml will run on push/PR to:
	1.	Ensure each folder has the three HTML docs (create stubs if missing).
	2.	Parse source to update each GLOSSARY.html and the global _glossary.html.
	3.	Rebuild _docs_index.html with summaries and links.
	4.	Commit changes (HTML only; never modify code).
	•	AI: When asked to develop or update docs, integrate hooks or comments for this script; do not duplicate content.

4. Code Quality & Style
	•	Maintain a CHANGELOG.html in the same folder for every code change.
	•	Comment complex functions: purpose, parameters, return values, edge cases.
	•	Document deprecated code in /docs/DEPRECATED.html and duplicates in /docs/DUPLICATES.html, then hyperlink from relevant folder-level docs.
	•	Follow existing repo organization and naming conventions (PEP 8 for Python; Airbnb/Google for JS; BEM for CSS).
	•	Break large functions into smaller ones; extract reusable components.
	•	Use meaningful, intention-revealing names.
	•	Apply design patterns appropriately.

5. Testing & Validation
	•	Add unit tests for all new functionality; place tests alongside code.
	•	Document testing insights in AILESSONS.html under a “Testing” section.
	•	Ensure config files align with code changes.
	•	Test edge cases and realistic scenarios.

6. Error Handling & Logging
	•	Use consistent error patterns; meaningful messages.
	•	Appropriate logging levels with context.
	•	Avoid silent failures; propagate errors.

7. Performance & Security
	•	Identify and address bottlenecks; consider algorithmic complexity.
	•	Optimize heavy operations; add caching as needed.
	•	Validate inputs; protect sensitive data; follow least-privilege.

8. Dependencies & Environment
	•	Use Python 3 and pip3.
	•	Document dependencies in each folder’s AILESSONS.html with purpose/categories.
	•	Use stable, secure versions.
	•	For local dev servers, choose non-standard random ports.

9. UX & Accessibility
	•	Provide feedback for long operations (e.g. spinners).
	•	Consistent UI patterns; design for varied skill levels.
	•	Follow WCAG guidelines.
	•	Progressive enhancement where applicable.

10. Monitoring & Deployment
	•	Add metrics/tracing; health checks.
	•	Document troubleshooting and rollback in root _docs_index.html.
	•	Plan graceful degradation.

11. SEO (public-facing only)
	•	Implement best practices: metadata, semantic HTML, responsive design.
	•	Track performance via analytics.

12. Industry Standards
	•	Semantic versioning.
	•	Internationalization support as needed.

13. Documentation Resources
	•	Use component-library HTML as your template.
	•	Consult CUSTOMIZATION_GUIDE.html before code searches.
	•	Record AI-learned patterns in each folder’s AILESSONS.html.
