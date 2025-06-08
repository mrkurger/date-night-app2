# Documentation Control & Synchronization System

**Last Updated**: 2025-06-08T22:48:09.366Z

> **📝 Update Notice**: This documentation was automatically updated to reflect the current codebase structure. Some references to legacy technologies have been updated. Please review for accuracy.


A comprehensive automated system for maintaining documentation accuracy and synchronization with the codebase (excluding client_Next.js2/).

## Overview

This system provides automated documentation management through:

1. **Documentation Auditing** - Analyzes current documentation against the codebase
2. **Content Cleanup** - Updates or archives outdated documentation
3. **Synchronization** - Keeps documentation in sync with code changes
4. **Knowledge Graph** - Maintains a structured knowledge base for LLM augmentation
5. **Automated Workflows** - GitHub Actions for continuous documentation maintenance

## Architecture

```
docs/
├── graph/
│   └── ci_knowledge.md              # Knowledge graph compatible with @modelcontextprotocol
├── outdated/                        # Archived documentation
├── auto-generated/                  # Auto-generated documentation
└── *.md                            # Main documentation files

scripts/
├── doc_control_main.js             # Main orchestrator script
├── doc_control_audit.js            # Documentation audit functionality  
├── doc_cleanup.js                  # Cleanup and update outdated content
└── doc_sync.js                     # Synchronization with code changes

.github/workflows/
└── documentation-sync.yml          # 24-hour automated workflow
```

## Usage

### Command Line Interface

```bash
# Run complete workflow
node scripts/doc_control_main.js full

# Individual operations
node scripts/doc_control_main.js audit     # Audit documentation
node scripts/doc_control_main.js cleanup   # Clean outdated content
node scripts/doc_control_main.js sync      # Sync with code changes

# Options
node scripts/doc_control_main.js full --force    # Force execution
node scripts/doc_control_main.js audit --quiet   # Suppress verbose output
node scripts/doc_control_main.js cleanup --dry-run  # Preview changes
```

### Individual Scripts

```bash
# Direct script execution
node scripts/doc_control_audit.js          # Generate audit report
node scripts/doc_cleanup.js                # Clean up documentation
node scripts/doc_sync.js                   # Synchronize with changes
```

## Features

### 1. Documentation Auditing (`doc_control_audit.js`)

- Scans entire codebase (excluding client_Next.js2/)
- Identifies undocumented code elements
- Detects outdated documentation references
- Generates comprehensive discrepancy reports
- Calculates documentation coverage metrics

**Output**: `docs/DOCUMENTATION_DISCREPANCIES_REPORT.md`

### 2. Content Cleanup (`doc_cleanup.js`)

- Identifies documentation with outdated references
- Updates terminology (Next.js → Next.js, radix-ui → radix-ui, etc.)
- Archives heavily outdated content
- Preserves relevant information while removing obsolete references

**Output**: `docs/DOCUMENTATION_CLEANUP_REPORT.md`

### 3. Code Synchronization (`doc_sync.js`)

- Detects code changes using git diff
- Auto-generates documentation for new files
- Updates existing documentation timestamps
- Archives documentation for deleted files
- Maintains change history

**Features**:
- Smart file type detection
- Template-based documentation generation
- Non-destructive updates
- Comprehensive change tracking

### 4. Knowledge Graph (`docs/graph/ci_knowledge.md`)

Compatible with `@modelcontextprotocol/servers/files/src/memory` for LLM augmentation:

```json
{
  "graph_version": "1.0.0",
  "compatible_with": "@modelcontextprotocol/servers/files/src/memory",
  "augmentation_enabled": true,
  "relationships": {
    "documented": 203,
    "undocumented": 130,
    "coverage_percentage": 189
  }
}
```

**Contents**:
- Repository context and architecture
- Code structure overview
- Documentation status tracking
- Technical decisions and patterns
- Known issues and improvements
- Relationship mappings for LLM enhancement

### 5. Automated Workflow (`.github/workflows/documentation-sync.yml`)

**Schedule**: Every 24 hours at 2 AM UTC

**Triggers**:
- Scheduled execution (daily)
- Manual workflow dispatch
- Push to main branch (for testing)

**Actions**:
1. Documentation audit
2. Change detection since last sync
3. Documentation synchronization
4. Outdated content archival
5. Knowledge graph updates
6. Status reporting
7. Issue creation for significant problems

## Configuration

### Monitored Directories

The system monitors these directories for changes:
- `server/` - Backend code
- `client_Next.js2/` - Next.js frontend
- `scripts/` - Build and utility scripts
- `prisma/` - Database schemas
- `.github/` - CI/CD configurations

### Excluded Patterns

These patterns are excluded from documentation control:
- `client_Next.js2/` - Legacy Next.js frontend (per requirements)
- `node_modules/` - Dependencies
- `logs/`, `coverage/`, `dist/`, `build/` - Generated files
- `.next/`, `temp/`, `tmp/` - Temporary files

### File Types

**Documentable Extensions**: `.js`, `.ts`, `.jsx`, `.tsx`
**Documentation Extensions**: `.md`, `.markdown`, `.html`

## Reports

### 1. Audit Report (`DOCUMENTATION_DISCREPANCIES_REPORT.md`)

- Executive summary with coverage metrics
- List of undocumented code elements by category
- Outdated documentation identification
- Prioritized recommendations
- Implementation roadmap

### 2. Cleanup Report (`DOCUMENTATION_CLEANUP_REPORT.md`)

- Summary of files processed
- Updated files with change details
- Archived files with reasons
- Recommendations for follow-up actions

### 3. Summary Report (`DOCUMENTATION_CONTROL_SUMMARY.md`)

- Overall system status
- Operation results and metrics
- Performance data
- Next scheduled actions

## Integration

### With Development Workflow

1. **Pre-commit**: Run `doc_control_main.js audit` to check documentation status
2. **CI/CD**: Automated daily synchronization via GitHub Actions
3. **Code Reviews**: Include documentation updates in PR checklist
4. **Release Process**: Generate updated documentation before releases

### With LLM Systems

The knowledge graph is designed for augmentation by Language Learning Models:

```javascript
// Example integration with @modelcontextprotocol
import { KnowledgeGraph } from '@modelcontextprotocol/servers/files/src/memory';

const graph = new KnowledgeGraph('docs/graph/ci_knowledge.md');
await graph.augment(codeContext);
```

## Maintenance

### Daily Operations (Automated)

- Documentation synchronization
- Change detection and updates
- Knowledge graph maintenance
- Status reporting

### Weekly Operations (Manual)

- Review generated issues
- Update documentation priorities
- Validate auto-generated content
- Archive irrelevant documentation

### Monthly Operations (Manual)

- System configuration review
- Performance optimization
- Coverage goal assessment
- Process improvements

## Troubleshooting

### Common Issues

1. **Script Execution Errors**
   ```bash
   # Check Node.js version (requires 18+)
   node --version
   
   # Verify script permissions
   chmod +x scripts/doc_control_main.js
   ```

2. **Git Integration Issues**
   ```bash
   # Ensure git history is available
   git fetch --unshallow
   
   # Check git configuration
   git config user.name
   git config user.email
   ```

3. **Missing Dependencies**
   ```bash
   # Install required packages
   npm install
   
   # Verify ES modules support
   node --experimental-modules scripts/doc_control_main.js
   ```

### Debug Mode

Enable verbose output for troubleshooting:

```bash
node scripts/doc_control_main.js full --verbose
```

## Contributing

### Adding New Documentation Patterns

1. Update `config.documentableExtensions` in relevant scripts
2. Add pattern recognition in `analyzeFileContent()`
3. Create appropriate documentation templates
4. Test with sample files

### Extending Knowledge Graph

1. Add new relationship types in `ci_knowledge.md`
2. Update metadata schema
3. Enhance LLM augmentation compatibility
4. Document integration examples

### Improving Automation

1. Enhance change detection algorithms
2. Add more sophisticated content analysis
3. Implement smarter archival decisions
4. Optimize performance for large repositories

## License

This documentation control system is part of the Date Night App project and follows the same licensing terms.

---

*Documentation Control & Synchronization System v1.0.0*  
*Compatible with @modelcontextprotocol/servers/files/src/memory*