# Documentation Style Guide

This document provides guidelines for writing and formatting documentation in the Date Night App project. Following these guidelines ensures consistency across all documentation and makes it easier for developers to find and understand information.

## Table of Contents

- [General Guidelines](#general-guidelines)
- [Document Structure](#document-structure)
- [Formatting](#formatting)
  - [Headings](#headings)
  - [Lists](#lists)
  - [Code Blocks](#code-blocks)
  - [Tables](#tables)
  - [Links](#links)
  - [Images](#images)
  - [Blockquotes](#blockquotes)
- [Language and Style](#language-and-style)
- [File Organization](#file-organization)
- [Versioning](#versioning)
- [Examples](#examples)

## General Guidelines

1. **Clarity**: Write clear, concise documentation that's easy to understand.
2. **Audience**: Consider the audience when writing documentation. Technical documentation should be written for developers, while user documentation should be written for end users.
3. **Completeness**: Include all necessary information, but avoid unnecessary details.
4. **Consistency**: Use consistent terminology, formatting, and structure across all documentation.
5. **Accuracy**: Ensure all information is accurate and up to date.
6. **Examples**: Include examples to illustrate concepts.
7. **Accessibility**: Write documentation that's accessible to all users, including those with disabilities.

## Document Structure

All documentation files should include the following sections:

1. **Title**: Use a descriptive title that clearly indicates the content of the document.
   ```markdown
   # Document Title
   ```

2. **Brief Description**: Provide a brief description of the document's purpose and content.
   ```markdown
   This document provides guidelines for writing and formatting documentation in the Date Night App project.
   ```

3. **Table of Contents**: Include a table of contents for documents with multiple sections.
   ```markdown
   ## Table of Contents
   
   - [Section 1](#section-1)
   - [Section 2](#section-2)
   ```

4. **Main Content**: Organize the main content into logical sections with clear headings.
   ```markdown
   ## Section 1
   
   Content for section 1.
   
   ## Section 2
   
   Content for section 2.
   ```

5. **Conclusion or Summary**: Summarize the key points of the document (if applicable).
   ```markdown
   ## Conclusion
   
   This document provides guidelines for writing and formatting documentation in the Date Night App project.
   ```

## Formatting

### Headings

Use Markdown headings to structure your document:

```markdown
# Level 1 Heading (Document Title)
## Level 2 Heading (Main Sections)
### Level 3 Heading (Subsections)
#### Level 4 Heading (Sub-subsections)
```

- Use sentence case for headings (capitalize only the first word and proper nouns).
- Do not skip heading levels (e.g., don't go from Level 2 to Level 4).
- Keep headings concise and descriptive.

### Lists

Use unordered lists for items that don't have a specific order:

```markdown
- Item 1
- Item 2
- Item 3
```

Use ordered lists for sequential steps or prioritized items:

```markdown
1. First step
2. Second step
3. Third step
```

Use nested lists for hierarchical information:

```markdown
- Parent item 1
  - Child item 1
  - Child item 2
- Parent item 2
  - Child item 1
  - Child item 2
```

### Code Blocks

Use code blocks for code examples:

````markdown
```javascript
function example() {
  console.log('This is an example');
}
```
````

Specify the language for syntax highlighting:

````markdown
```typescript
function example(): void {
  console.log('This is an example');
}
```
````

For inline code, use backticks:

```markdown
Use the `example()` function to display an example.
```

### Tables

Use tables for structured data:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
```

Align columns for better readability:

```markdown
| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:-------------:|-------------:|
| Left         | Center        | Right        |
| Left         | Center        | Right        |
```

### Links

Use descriptive link text:

```markdown
[Documentation Style Guide](DOCUMENTATION_STYLE_GUIDE.md)
```

Use relative links for files in the same directory:

```markdown
[Documentation Style Guide](DOCUMENTATION_STYLE_GUIDE.md)
```

Use absolute links for files in different directories:

```markdown
[Documentation Style Guide](/docs/DOCUMENTATION_STYLE_GUIDE.md)
```

Use absolute links for external resources:

```markdown
[Angular Documentation](https://angular.io/docs)
```

### Images

Include images with descriptive alt text:

```markdown
![Alt text describing the image](/docs/images/example.png)
```

Specify image dimensions if necessary:

```markdown
<img src="images/example.png" alt="Alt text describing the image" width="300" height="200">
```

### Blockquotes

Use blockquotes for important notes, warnings, or quotes:

```markdown
> **Note**: This is an important note.

> **Warning**: This is a warning.

> This is a quote from a source.
```

## Language and Style

1. **Voice**: Use active voice instead of passive voice.
   - Active: "Click the button to save your changes."
   - Passive: "The button should be clicked to save your changes."

2. **Tense**: Use present tense.
   - Present: "The function returns a value."
   - Past: "The function returned a value."

3. **Person**: Use second person ("you") for instructions.
   - "You can configure the settings in the config file."
   - "The developer can configure the settings in the config file."

4. **Tone**: Use a professional, friendly tone.
   - Professional: "Configure the settings according to your requirements."
   - Too casual: "Just play around with the settings until it works."

5. **Terminology**: Use consistent terminology throughout the documentation.
   - Define technical terms when they're first used.
   - Use the same term for the same concept throughout the documentation.

6. **Abbreviations**: Define abbreviations when they're first used.
   - "Content Security Policy (CSP) is a security feature that helps prevent cross-site scripting (XSS) attacks."

7. **Numbers**: Spell out numbers less than 10, use numerals for 10 and above.
   - "There are five steps in the process."
   - "There are 15 configuration options."

## File Organization

1. **File Names**: Use descriptive file names that clearly indicate the content of the file.
   - Use `.md` extension for all documentation files.
   - Use uppercase for main documentation files (e.g., README.md, SETUP.md).
   - Use lowercase with hyphens for specific documentation files (e.g., ui-ux-roadmap.md).

2. **Directory Structure**: Organize documentation files in a logical directory structure.
   - Store general documentation in the root directory (e.g., README.md, SETUP.md).
   - Store detailed documentation in the `/docs` directory.
   - Store component-specific documentation in the component's directory.

3. **Documentation Index**: Maintain a documentation index that lists all documentation files with descriptions and links.
   - [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

## Versioning

1. **Version Numbers**: Include version numbers in documentation when applicable.
   - "This guide applies to version 1.0.0 of the application."

2. **Change Log**: Maintain a change log that documents changes to the application.
   - [ChangeLog.md](ChangeLog.md)

3. **Documentation Updates**: Update documentation when the application changes.
   - Add a note indicating when the documentation was last updated.
   - "Last updated: 2025-04-19"

## Examples

### Example Document Structure

```markdown
# Document Title

This document provides guidelines for writing and formatting documentation in the Date Night App project.

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content for section 1.

### Subsection 1.1

Content for subsection 1.1.

## Section 2

Content for section 2.

### Subsection 2.1

Content for subsection 2.1.

## Conclusion

This document provides guidelines for writing and formatting documentation in the Date Night App project.
```

### Example Code Block

````markdown
```typescript
/**
 * Example function that demonstrates documentation style.
 * @param param1 - Description of param1
 * @param param2 - Description of param2
 * @returns Description of return value
 */
function example(param1: string, param2: number): boolean {
  console.log(`Param1: ${param1}, Param2: ${param2}`);
  return true;
}
```
````

### Example Table

```markdown
| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| port | Server port number | 3000 | Development |
| mongoUri | MongoDB connection string | mongodb://localhost:27017/datenight_dev | Development |
| jwtSecret | Secret key for JWT | random string | All |
```

### Example Note

```markdown
> **Note**: This is an important note that provides additional information.
```

### Example Warning

```markdown
> **Warning**: This is a warning that alerts the reader to potential issues.
```

## Conclusion

Following these guidelines ensures consistency across all documentation in the Date Night App project. Consistent documentation is easier to read, understand, and maintain, which benefits both developers and users of the application.