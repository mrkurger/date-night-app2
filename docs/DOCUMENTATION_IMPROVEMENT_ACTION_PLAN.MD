# Documentation Improvement Action Plan

This action plan outlines the prioritized steps to implement the documentation improvements based on the detailed plan in `docs/temp/DOCS_tmp.md`. It provides a structured approach to ensure all aspects of the documentation improvement plan are completed efficiently.

## Priority 1: Critical Foundation (Week 1)

### 1.1 Update README Files

These are the entry points to the project and should be addressed first:

- Update root README.md with project overview, tech stack, links to key docs
- Update client-angular/README.md with detailed setup, build, testing instructions
- Update server/README.md with detailed setup, build, testing instructions

### 1.2 Verify & Update Core Guides

These guides are essential for developers to get started:

- Update ARCHITECTURE.MD, SETUP.MD, NODEJS-INSTALLATION-GUIDE.MD
- Update SPECIFIC-VERSION-INSTALLATION-GUIDE.MD, MONGODB_TROUBLESHOOTING.MD
- Update ANGULAR_BUILD_OPTIMIZATION.MD, CODE_FORMATTING.MD

### 1.3 Update Meta-Documentation

These documents help maintain the documentation system itself:

- Update DEPRECATED.MD (review timelines, verify "Deprecated Dependencies" section removal)
- Update DUPLICATES.MD (update "Status" column for each duplication)
- Update DOCUMENTATION_STYLE_GUIDE.MD (add rule about UPPERCASE.md filenames)

## Priority 2: Content Consolidation (Week 2)

### 2.1 Regenerate Configuration Documentation

- Run scripts to update CONFIG_INDEX.MD
- Verify CUSTOMIZATION_GUIDE.MD process description accuracy

### 2.2 Consolidate Overlapping Content

- Merge and synthesize content for DEPENDENCY_MANAGEMENT.MD
- Merge and synthesize content for CI_CD_GUIDE.MD
- Merge and synthesize content for THEMING_GUIDE.MD

### 2.3 Merge Specific Topic Content

- Integrate key information into ERRORHANDLINGTELEMETRY.MD
- Integrate key information into TESTING_GUIDE.MD
- Integrate key information into ANGULAR_TESTING_LESSONS.MD
- Integrate key information into SECURITY_BEST_PRACTICES.MD

## Priority 3: Core Technical Documentation (Week 3)

### 3.1 Enhance ARCHITECTURE.MD

- Detail high-level structure, key technologies, core libraries
- Document main data flows, authentication mechanism, key design patterns
- Verify/update/create architecture diagrams
- Ensure link to DATABASE_SCHEMA_DETAIL.MD is present

### 3.2 Implement API Documentation

- Integrate Swagger/OpenAPI tools into server project
- Annotate Express routes, controllers, and models
- Configure swagger-ui-express to serve interactive docs
- Update API_DOCUMENTATION.MD and server/README.md

### 3.3 Implement Component Library Documentation

- Set up Storybook or Compodoc for client-angular project
- Create documentation for shared/Emerald UI components
- Update COMPONENT_LIBRARY.MD and client-angular/README.md

### 3.4 Generate Database Schema Documentation

- Generate schema documentation from Mongoose models
- Update DATABASE_SCHEMA_DETAIL.MD

## Priority 4: Feature Documentation (Week 4)

### 4.1 Create Feature Documentation

Create or update documentation for each major feature:

- ADS.MD, AUTH.MD, CHAT.MD
- FAVORITES.MD, PROFILE.MD, REVIEWS.MD
- TEMPORARY_MESSAGES.MD, TOURING.MD
- USER_PREFS.MD, WALLET.MD

### 4.2 Update Implementation Summary

- Write concise summary of key implemented features in IMPLEMENTATION_SUMMARY.MD
- Ensure links to detailed feature docs are correct

## Priority 5: Developer Experience (Week 5)

### 5.1 Create/Update Contribution & Deployment Guides

- Create CONTRIBUTING.MD with code style, branching strategy, PR process
- Create DEPLOYMENT.MD with deployment process for different environments

### 5.2 Update Emerald UI / Theming Content

- Update EMERALD-COMPONENTS.MD with current state
- Update EMERALD-COMPONENTS-CHANGELOG.MD
- Update THEMING_GUIDE.MD

### 5.3 Curate AILESSONS.MD

- Identify stable, important patterns sections
- Ensure concise summaries with links to canonical docs
- Mark obsolete sections clearly or move to appendix/outdated

## Priority 6: Refinement & Finalization (Week 6)

### 6.1 Apply Conciseness Strategy

Apply to lengthy documents:

- AILESSONS.MD, ERRORHANDLINGTELEMETRY.MD
- ANGULAR_TESTING_LESSONS.MD, CUSTOMIZATION_GUIDE.MD
- EMERALD-COMPONENTS.MD

### 6.2 Integrate AI Lessons

- Review curated AILESSONS.MD
- Copy or synthesize insights into relevant canonical documents

### 6.3 Update Internal Links & TOCs

- Update all internal links to use UPPERCASE.md format
- Update Tables of Contents in all modified files

### 6.4 Finalize DOCUMENTATION_INDEX.MD

- Ensure all current documentation files are listed
- Ensure all filenames use UPPERCASE.md format
- Verify descriptions and links are accurate

## Implementation Approach

For each task:

1. **Review**: Examine the current state of the document
2. **Plan**: Outline the changes needed
3. **Implement**: Make the necessary updates
4. **Verify**: Check for accuracy, consistency, and completeness
5. **Remove TODOs**: Remove any TODO comments
6. **Update Checklist**: Mark as complete in DOCUMENTATION_IMPROVEMENT_CHECKLIST.md

## Tracking Progress

Use the DOCUMENTATION_IMPROVEMENT_CHECKLIST.md to track progress on individual tasks. Update it as tasks are completed.

## Final Review

Before committing the final changes:

1. Review all changes with git status and git diff
2. Ensure all TODOs have been addressed
3. Verify all internal links work correctly
4. Check that all filenames use the UPPERCASE.md format
5. Commit with a descriptive message
