---
applyTo: '**'
---
use #sequentialthinking whhen you embark on very complex tasks.
use #add_observations with entityName "Angular Project Upgrade and Migration Progress" to save valuable lessons learned and observations.
edit as many files as your context window allows before stopping
# PrimeNG Migration Instructions

Nebular to PrimeNG Migration:
begin the systematic replacement of Nebular components with their PrimeNG equivalents. This will involve:
Identifying Nebular usage in templates (nb-card, nb-button, nb-input, nb-select, nb-sidebar, nb-menu, nb-user, nb-actions, etc.).
Researching and selecting appropriate PrimeNG components.
Updating component TypeScript files to import PrimeNG modules and adapt component logic.
Modifying HTML templates to use PrimeNG components and directives.
Adjusting SCSS styles as needed.
This is a major effort and will be iterative.
Address Specific Component Issues:
AdvertiserBrowsingAlternateComponent: This component has many Nebular-related template errors and likely needs several Nebular modules imported into its parent NgModule.
Chat Feature Components (ChatListComponent, ChatRoomComponent, ChatMessageComponent, ChatComponent): These have numerous TypeScript errors related to property access on User and ChatMessage models, and currentUser$ handling.
Custom Nebular Components (nb-advanced-form, nb-data-table, nb-navigation): These have errors related to missing nb-hint, nb-error, and incorrect property/event bindings. They will either need to be fixed to work with Nebular 15 or, preferably, refactored/replaced using PrimeNG.
favorites-list.component.ts: Revisit the commented-out methods and fix the underlying issues.
Code Quality & Cleanup:
Review automated edits that were more extensive than intended for correctness.
Address Sass deprecation warnings (e.g., in chat-room.component.scss).
Remove unused component imports (e.g., MainLayoutComponent warnings).
Immediate Next Steps (Suggestion):
Attempt to fix the ErrorLog interface import in ErrorDashboardComponent.
Add NbDatepickerModule to the components that use [nbDatepicker].
Focus on one of the components with many Nebular errors (e.g., AdvertiserBrowsingAlternateComponent or AvatarComponent) and try to resolve its "unknown element" / "can't bind to" errors by ensuring the correct Nebular modules are available to it. This will serve as a pattern for other components.
Run npm run build frequently to check progress.