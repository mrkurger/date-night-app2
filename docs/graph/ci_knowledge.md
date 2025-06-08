# CI Knowledge Graph

This knowledge graph is maintained by the Documentation Control & Synchronization System and is compatible with @modelcontextprotocol/servers/files/src/memory.

## Repository Context

**Project**: Date Night App 2  
**Architecture**: Monorepo with React/Next.js frontend (client_angular2/), Node.js backend (server/), and shared tooling  
**Last Updated**: 2025-06-08T23:54:45.927Z
**Documentation Coverage**: 189% (514 documented items vs 203 code elements)


## Recent Changes (2025-06-08T22:54:01.424Z)

**Files Changed**: 5
- Added: 5
- Modified: 0  
- Deleted: 0

**Documentation Actions**: 4
- Created: 4
- Updated: 0
- Archived: 0



## Recent Changes (2025-06-08T23:54:44.793Z)

**Files Changed**: 77
- Added: 0
- Modified: 77  
- Deleted: 0

**Documentation Actions**: 0
- Created: 0
- Updated: 0
- Archived: 0


## Code Structure Overview

### Frontend (client_angular2/)
- **Framework**: Next.js 15.3.3 with React 19.1.0
- **UI Framework**: Tailwind CSS + Radix UI + shadcn/ui components
- **Components**: 167 total components identified
- **Key Features**: PWA support, theme system, casino/gambling features, data visualization

### Backend (server/)
- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Key Modules**: Authentication, Location services, Travel, Verification
- **Controllers**: 13 identified
- **Services**: 8 identified

### Infrastructure
- **Build System**: Next.js, TypeScript compilation
- **Testing**: Playwright for E2E testing
- **Database**: Prisma schema generation
- **CI/CD**: GitHub Actions workflows

## Documentation Status

### Well Documented Areas
- Architecture and setup guides
- UI/UX implementation documentation
- Security best practices
- Testing strategies

### Undocumented Areas (Priority for Documentation)
1. **High Priority**:
   - Server controllers (encryption, location, travel, verification)
   - Core React components (carousel, navigation, data visualization)
   - Authentication flow implementation

2. **Medium Priority**:
   - UI components library (shadcn/ui extensions)
   - Casino/gambling feature modules
   - Performance monitoring systems

3. **Low Priority**:
   - Utility functions and configurations
   - Development tooling scripts

### Outdated Documentation
- 417 files reference deprecated client-angular/ directory
- Legacy Angular documentation needs archival
- Emerald UI references should be updated to current UI system

## Development Patterns

### Component Organization
```
client_angular2/
├── components/          # Reusable UI components
├── app/                # Next.js app directory
├── lib/                # Utility libraries
├── hooks/              # React hooks
├── styles/             # Global styles and themes
└── types/              # TypeScript type definitions
```

### Server Organization
```
server/
├── controllers/        # Request handlers
├── models/            # Database schemas
├── routes/            # API route definitions
├── services/          # Business logic
├── middleware/        # Express middleware
└── utils/             # Helper utilities
```

## Technical Decisions

### Frontend Architecture
- **Choice**: Next.js over Angular for new development
- **Rationale**: Better React ecosystem, improved performance, modern tooling
- **Impact**: Dual frontend setup during transition period

### UI System
- **Choice**: Tailwind CSS + Radix UI + shadcn/ui
- **Rationale**: Utility-first CSS, accessible components, customizable design system
- **Impact**: Consistent design language, improved developer experience

### State Management
- **Choice**: React Context + hooks pattern
- **Rationale**: Sufficient for current complexity, reduces bundle size
- **Impact**: Simpler state management, easier testing

## Known Issues & Technical Debt

### High Priority
1. Legacy client-angular/ directory still present (excluded from new documentation)
2. Inconsistent error handling across server endpoints
3. Missing type definitions for some API responses

### Medium Priority
1. Performance monitoring needs better coverage
2. Cache strategies not fully implemented
3. Mobile responsiveness gaps in some components

### Low Priority
1. Code duplication in utility functions
2. Inconsistent naming conventions across modules
3. Missing JSDoc comments in older code

## Future Improvements

### Short Term (1-2 sprints)
- Complete documentation for undocumented components
- Implement automated documentation sync
- Archive client-angular/ documentation

### Medium Term (3-6 sprints)
- Enhance knowledge graph with code relationship mapping
- Implement automated API documentation generation
- Set up performance monitoring documentation

### Long Term (6+ sprints)
- Complete migration away from client-angular/
- Implement comprehensive testing documentation
- Create developer onboarding automation

## Links & References

### Key Documentation Files
- [Architecture Overview](../ARCHITECTURE.MD)
- [Setup Guide](../SETUP.MD)
- [API Documentation](../API_DOCUMENTATION.MD)
- [Component Library](../COMPONENT_LIBRARY.MD)
- [Testing Guide](../TESTING_GUIDE.MD)

### Code References
- [Main Frontend App](../client_angular2/app/)
- [Server API](../server/)
- [Shared Types](../types/)
- [Build Scripts](../scripts/)

### External Dependencies
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Prisma](https://www.prisma.io/docs)

---

*This knowledge graph is automatically maintained by the Documentation Control & Synchronization System. Last sync: 2025-06-08T22:42:15.742Z*

## Metadata for LLM Augmentation

```json
{
  "graph_version": "1.0.0",
  "compatible_with": "@modelcontextprotocol/servers/files/src/memory",
  "last_updated": "2025-06-08T23:54:45.927Z",
  "update_frequency": "24_hours",
  "scope": "repository_excluding_client_angular",
  "maintainer": "documentation_control_system",
  "augmentation_enabled": true,
  "relationships": {
    "documented": 203,
    "undocumented": 130,
    "outdated": 417,
    "coverage_percentage": 189
  }
}
```