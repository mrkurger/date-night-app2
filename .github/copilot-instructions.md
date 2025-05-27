# GitHub Copilot Instructions for Date Night App

## Instruction Compliance Protocol

1. **Initial Context Retrieval**
   - Begin EVERY interaction with "Remembering..." followed by context retrieval
   - Use memory graph tools to access and update technical knowledge
   - Always validate current project state and developer context

2. **Systematic Response Process**
   - Start with sequential thinking for problem analysis
   - Break down complex tasks into manageable steps
   - Maintain clear documentation of decisions and changes
   - Update knowledge graph with new information

3. **Validation Requirements**
   - Check compliance with all standards before proceeding
   - Follow documentation format requirements
   - Verify technical decisions against existing patterns
   - Ensure proper relationship maintenance in knowledge graph

## Core Principles

1. **Technical Memory Management**
   - Begin interactions with "Remembering..." to retrieve context
   - Track and update the following categories:
     - Technical Profile (languages, frameworks, tools, standards)
     - Project Context (repositories, architecture, dependencies)
     - Problem Solutions (bugs, debug patterns, optimizations)
     - Development Workflow (methodologies, CI/CD, standards)
   - Maintain relationships between:
     - Projects ↔ Technologies
     - Issues ↔ Solutions
     - Developer ↔ Preferences
     - Components ↔ Dependencies

2. **Documentation Standards**
   - Use HTML-based documentation
   - Maintain CHANGELOG.html per folder
   - Keep component documentation in GLOSSARY.html
   - Central indexing via _docs_index.html and _glossary.html

3. **Code Organization**
   - Follow BEM naming conventions for CSS
   - Maintain clear separation of concerns
   - Use TypeScript strict mode
   - Implement proper error handling
   - Focus on maintainable, testable code

## PrimeNG Migration Guidelines

1. **Component Migration Process**
   - Identify current UI component usage
   - Research PrimeNG equivalent components
   - Update TypeScript imports and component logic
   - Modify HTML templates
   - Adjust SCSS styles while maintaining BEM methodology
   - Test functionality and accessibility
   - Document changes in appropriate HTML files

2. **Priority Components for Migration**
   - Replace Emerald UI components
   - Replace Angular Material components
   - Replace Bootstrap UI components
   - Maintain visual consistency throughout with PrimeNG

3. **Quality Standards**
   - Implement comprehensive unit tests
   - Ensure WCAG accessibility compliance
   - Optimize performance
   - Maintain security best practices
   - Document edge cases and solutions

## Development Workflow

1. **Problem Analysis**
   - Break down complex tasks into manageable components
   - Consider dependencies and potential impacts
   - Plan implementation sequence
   - Identify testing requirements
   - Document architectural decisions

2. **Implementation Approach**
   - Use TypeScript strict mode
   - Follow Angular best practices
   - Implement proper error handling
   - Write clean, maintainable code
   - Add comprehensive tests

3. **Documentation Requirements**
   - Update relevant HTML documentation files
   - Document component changes in CHANGELOG.html
   - Keep component documentation current

## Specific Component Guidelines

1. **Styling:**
   - Use BEM methodology consistently
   - Maintain design system tokens
   - Implement responsive design patterns
   - Support dark mode
   - Follow accessibility guidelines

2. **Component Structure:**
   ```typescript
   // Preferred component structure
   @Component({
     selector: 'app-feature',
     templateUrl: './feature.component.html',
     styleUrls: ['./feature.component.scss']
   })
   export class FeatureComponent {
     // Organized by:
     // 1. Input/Output decorators
     // 2. Public properties
     // 3. Private properties
     // 4. Lifecycle hooks
     // 5. Public methods
     // 6. Private methods
   }
   ```

3. **Testing Requirements:**
   - Unit tests for all components
   - Integration tests for complex features
   - E2E tests for critical paths
   - Accessibility testing
   - Performance testing

## Knowledge Integration

1. **Technical Decisions**
   - Document architectural choices
   - Explain technical trade-offs
   - Note potential future impacts

2. **Problem Solutions**
   - Document bugs and solutions
   - Record successful debugging approaches
   - Note optimization strategies

3. **Project Evolution**
   - Track feature development
   - Document breaking changes
   - Maintain migration progress

## Validation Checklist

Before completing any task:
- [ ] Code follows BEM naming conventions
- [ ] Documentation is updated in HTML format
- [ ] Unit tests are implemented
- [ ] Accessibility is maintained
- [ ] Performance is optimized
- [ ] Security best practices are followed
- [ ] Changes are documented in appropriate files
- [ ] Migration status is updated if applicable

## Specific Areas Requiring Attention

1. **AdvertiserBrowsingAlternateComponent:**
   - Address Nebular-related template errors
   - Implement proper module imports
   - Migrate to PrimeNG components

2. **Chat Feature Components:**
   - Fix TypeScript errors in models
   - Address currentUser$ handling
   - Migrate to PrimeNG components

3. **Custom Components:**
   - Replace nb-advanced-form
   - Replace nb-data-table
   - Replace nb-navigation
   - Implement PrimeNG equivalents

4. **General Improvements:**
   - Fix SCSS deprecation warnings
   - Remove unused imports
   - Address ErrorLog interface issues
   - Complete PrimeNG migration tasks
