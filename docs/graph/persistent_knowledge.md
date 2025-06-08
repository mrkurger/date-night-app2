# Persistent Knowledge Graph

This knowledge graph is maintained for MCP Memory server integration and provides
comprehensive project context for AI systems and GitHub Copilot.

## Metadata

```json
{
  "generatedAt": "2025-06-08T23:35:09.430Z",
  "version": "1.0.0",
  "source": "mcp-knowledge-sync",
  "compatibleWith": "@modelcontextprotocol/server-memory",
  "scope": "repository_excluding_client_angular",
  "extractionConfig": {
    "excludeDirs": [
      "client-angular",
      "node_modules",
      ".git",
      "dist",
      "build",
      "coverage",
      ".next",
      "logs",
      "backup-*",
      ".vscode",
      ".husky"
    ],
    "includePatterns": [
      "**/*.js",
      "**/*.ts",
      "**/*.jsx",
      "**/*.tsx",
      "**/*.md",
      "**/*.json",
      "**/*.yml",
      "**/*.yaml",
      "**/*.html",
      "**/*.css",
      "**/*.scss"
    ],
    "maxFileSize": 1048576
  },
  "lastSyncAt": "2025-06-08T23:35:09.714Z",
  "sources": [
    "codebase_extraction",
    "ci_knowledge"
  ]
}
```

## Project Structure

**Total Files**: 1692
**Directories**: 206

### Key Configuration Files

- `client_angular2/.eslintrc.json` (other) - 42 Bytes
- `client_angular2/README.md` (documentation) - 1.09 KB
- `client_angular2/components/carousely/README.md` (documentation) - 2.99 KB
- `client_angular2/next.config.js` (config) - 2.62 KB
- `client_angular2/package-lock.json` (package) - 514.34 KB
- `client_angular2/package.json` (package) - 3.29 KB
- `client_angular2/playwright.config.ts` (config) - 2.16 KB
- `client_angular2/tailwind.config.js` (config) - 5.95 KB
- `client_angular2/tsconfig.json` (config) - 1009 Bytes
- `design/mockups/README.md` (documentation) - 3.96 KB
- `design/screenshots/README.md` (documentation) - 4.61 KB
- `docs/design_system/README.md` (documentation) - 4.1 KB
- `docs/outdated/2025-06-08/README.md` (documentation) - 576 Bytes
- `docs/outdated/README.md` (documentation) - 232 Bytes
- `docs/ui-docs/README.md` (documentation) - 2.42 KB
- `generated/prisma/package.json` (package) - 3.81 KB
- `monitoring/README.md` (documentation) - 7.96 KB
- `monitoring/package.json` (package) - 819 Bytes
- `scripts/README.md` (documentation) - 3.14 KB
- `server/.eslintrc.json` (other) - 1.18 KB
- `server/README.md` (documentation) - 7.57 KB
- `server/config/README.md` (documentation) - 1.96 KB
- `server/package-lock.json` (package) - 498.16 KB
- `server/package.json` (package) - 4.63 KB
- `server/tests/README.md` (documentation) - 3.53 KB
- `server/tsconfig.json` (config) - 848 Bytes
- `src/app/features/advertiser-browsing/2/z/README.md` (documentation) - 1016 Bytes
- `src/app/features/advertiser-browsing/2/z/package.json` (package) - 2.18 KB
- `src/app/features/advertiser-browsing/package.json` (package) - 2.18 KB
- `src/app/features/advertiser-browsing/tsconfig.json` (config) - 595 Bytes
- `tests/e2e/README.md` (documentation) - 3.06 KB

## Components

- **EnhancedLiveCasinoPage** (angular) - `client_angular2/app/2live-casino/page.tsx:85`
- **AdminDashboardPage** (angular) - `client_angular2/app/admin-dashboard/page.tsx:26`
- **AdvertiserDetailClient** (angular) - `client_angular2/app/advertiser/[id]/client.tsx:10`
- **AdvertiserNotFound** (angular) - `client_angular2/app/advertiser/[id]/not-found.tsx:4`
- **async** (angular) - `client_angular2/app/advertiser/[id]/page.tsx:7`
- **AdvertiserDetailWrapper** (angular) - `client_angular2/app/advertiser/[id]/wrapper.tsx:12`
- **async** (angular) - `client_angular2/app/api/image-optimize/route.ts:23`
- **BrowseLoading** (angular) - `client_angular2/app/browse/loading.tsx:4`
- **BrowsePage** (angular) - `client_angular2/app/browse/page.tsx:23`
- **CarouselDemoPage** (angular) - `client_angular2/app/carousel-demo/page.tsx:6`
- **CarouselyPage** (angular) - `client_angular2/app/carousely/page.tsx:13`
- **CasinoPage** (angular) - `client_angular2/app/casino/page.tsx:4`
- **InfiniteScrollMasonryDemo** (angular) - `client_angular2/app/components/grid_v_2.tsx:164`
- **ComponentDemoPage** (angular) - `client_angular2/app/components-demo/page.tsx:6`
- **MasonryShowcase** (angular) - `client_angular2/app/demo/components/masonry/page.tsx:179`
- **ComponentDemoPage** (angular) - `client_angular2/app/demo/components/page.tsx:105`
- **ReviewRankingShowcase** (angular) - `client_angular2/app/demo/components/review-ranking/page.tsx:33`
- **EnhancedCasinoPage** (angular) - `client_angular2/app/enhanced-casino/page.tsx:3`
- **class** (angular) - `client_angular2/app/image-carousel/image-carousel.component.ts:17`
- **RootLayout** (angular) - `client_angular2/app/layout.tsx:33`

## Functions

- **AdvertiserDetailWrapper** (exported) - `client_angular2/app/advertiser/[id]/wrapper.tsx:12`
- **GET** (exported, async) - `client_angular2/app/api/image-optimize/route.ts:23`
- **InfiniteScrollMasonryDemo** (exported) - `client_angular2/app/components/grid_v_2.tsx:164`
- **RankedAdvertiserCard** - `client_angular2/app/rankings/page.tsx:23`
- **loadAdvertisers** (async) - `client_angular2/app/rankings/page.tsx:178`
- **EnhancedProfileCarousel** (exported) - `client_angular2/components/EnhancedProfileCarousel.tsx:162`
- **GamifiedContentHub** (exported) - `client_angular2/components/GamifiedContentHub.tsx:128`

## Documentation

### Guides
- [Untitled Document](advertiser-browsing/index.html) - 
- [Untitled Document](client_angular2/app/image-carousel/image-carousel.component.html) - 
- [Carousely Implementation Checklist](client_angular2/docs/IMPLEMENTATION_CHECKLIST.md) - - [x] 3D wheel carousel component - [x] Left/right swipe gestures - [x] "Flick up" Tinder-style gesture - [x] Card rotation animations - [x] Visibility calculation for performance - [x] Active card hi
- [Carousely Implementation Summary](client_angular2/docs/IMPLEMENTATION_SUMMARY.md) - The Tinder-like carousel for the `/carousely` page has been implemented with the following features: - 3D wheel-style carousel with smooth rotation - Swipe left/right and flick-up gestures like Tinder
- [Untitled Document](client_angular2/src/index.html) - 
- [Untitled Document](design/prototype/emerald-index.html) - 
- [Untitled Document](design/prototype/emerald-netflix-view.html) - 
- [Untitled Document](design/prototype/emerald-prototype/index.html) - 
- [Untitled Document](design/prototype/index.html) - 
- [Documentation Control & Synchronization Summary](docs/DOCUMENTATION_CONTROL_SUMMARY.md) - **Generated**: 2025-06-08T22:48:09.431Z **Duration**: 277ms **Status**: ✅ Success - **Status**: ✅ Success - **Duration**: 145ms - **Undocumented Elements**: 130 - **Outdated Documentation**: 419 - **S
- [Documentation Status Report](docs/DOCUMENTATION_STATUS.md) - **Generated**: 2025-06-08T22:54:01Z **Workflow Run**: [\#1](https://github.com/mrkurger/date-night-app2/actions/runs/15523341630) - **Undocumented Elements**: 130 - **Outdated Documentation**: 419 - *
- [Untitled Document](docs/NEBULAR_TO_PRIMENG_MIGRATION.html) - 
- [doc_cleanup Documentation](docs/auto-generated/scripts/doc_cleanup.md) - **File**: `scripts/doc_cleanup.js` **Type**: Module **Last Updated**: 2025-06-08T22:54:01.420Z TODO: Add description of what this Module does. - `fs` - `path` - `url` TODO: Document this function. ```
- [doc_control_audit Documentation](docs/auto-generated/scripts/doc_control_audit.md) - **File**: `scripts/doc_control_audit.js` **Type**: Module **Last Updated**: 2025-06-08T22:54:01.422Z TODO: Add description of what this Module does. - `fs` - `path` - `url` TODO: Document this functio
- [doc_control_main Documentation](docs/auto-generated/scripts/doc_control_main.md) - **File**: `scripts/doc_control_main.js` **Type**: Module **Last Updated**: 2025-06-08T22:54:01.423Z TODO: Add description of what this Module does. - `fs` - `path` - `url` - `child_process` TODO: Docu
- [doc_sync Documentation](docs/auto-generated/scripts/doc_sync.md) - **File**: `scripts/doc_sync.js` **Type**: Module **Last Updated**: 2025-06-08T22:54:01.424Z TODO: Add description of what this Module does. - `fs` - `path` - `url` - `child_process` TODO: Document thi
- [Untitled Document](docs/competitor_data/Massasje & Eskortetjenester i Norge_ Jenter, Gutter, Klinikker - Tilgjengelig på RealEscort.eu.html) - 
- [Untitled Document](docs/competitor_data/Massasje & Eskortetjenester i Norge_ Jenter, Gutter, Klinikker - Tilgjengelig på RealEscort.eu_files/saved_resource(1).html) - 
- [Untitled Document](docs/competitor_data/Massasje & Eskortetjenester i Norge_ Jenter, Gutter, Klinikker - Tilgjengelig på RealEscort.eu_files/saved_resource.html) - 
- [Untitled Document](docs/component-library/components/AdBrowserComponent.html) - 
- [Untitled Document](docs/component-library/components/AdCardComponent.html) - 
- [Untitled Document](docs/component-library/components/AdCreateComponent.html) - type&#x3D;&quot;file&quot; accept&#x3D;&quot;image/*&quot; multiple (change)&#x3D;&quot;onFileSelected($event)&quot; style&#x3D;&quot;display: none&quot; /&gt; &lt;/label&gt; &lt;mat-hint&gt;Maximum 5
- [Untitled Document](docs/component-library/components/AdDetailComponent.html) - 
- [Untitled Document](docs/component-library/components/AdDetailsComponent.html) - 
- [Untitled Document](docs/component-library/components/AdListComponent-1.html) - 
- [Untitled Document](docs/component-library/components/AdListComponent.html) - 
- [Untitled Document](docs/component-library/components/AdManagementComponent.html) - [active]&#x3D;&quot;rla1.isActive&quot; &gt; &lt;i class&#x3D;&quot;fas fa-ad&quot;&gt;&lt;/i&gt; My Ads &lt;/a&gt; &lt;a mat-tab-link routerLink&#x3D;&quot;create&quot; routerLinkActive [active]&#x3D
- [Untitled Document](docs/component-library/components/AdStatsComponent.html) - 
- [Untitled Document](docs/component-library/components/AddPaymentMethodDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/AdvertiserProfileComponent.html) - 
- [Untitled Document](docs/component-library/components/AlertNotificationsComponent.html) - 
- [Untitled Document](docs/component-library/components/AvatarComponent.html) - 
- [Untitled Document](docs/component-library/components/BreadcrumbsComponent.html) - 
- [Untitled Document](docs/component-library/components/ButtonComponent.html) - 
- [Untitled Document](docs/component-library/components/CardComponent.html) - 
- [Untitled Document](docs/component-library/components/CardGridComponent.html) - 
- [Untitled Document](docs/component-library/components/ChatListComponent.html) - 
- [Untitled Document](docs/component-library/components/ChatMessageComponent.html) - 
- [Untitled Document](docs/component-library/components/ChatRoomComponent.html) - [(ngModel)]&#x3D;&quot;newMessage&quot; placeholder&#x3D;&quot;Type a message...&quot; (keydown.enter)&#x3D;&quot;$event.preventDefault(); sendMessage()&quot; (input)&#x3D;&quot;onTyping()&quot; &gt;&
- [Untitled Document](docs/component-library/components/CheckboxComponent.html) - 
- [Untitled Document](docs/component-library/components/ContextualHelpComponent.html) - 
- [Untitled Document](docs/component-library/components/DebugInfoComponent.html) - 
- [Untitled Document](docs/component-library/components/DepositDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/DesignSystemDemoComponent.html) - 
- [Untitled Document](docs/component-library/components/EditProfileComponent.html) - 
- [Untitled Document](docs/component-library/components/ErrorDashboardComponent-1.html) - 
- [Untitled Document](docs/component-library/components/ErrorDashboardComponent.html) - 
- [Untitled Document](docs/component-library/components/ErrorMessageComponent.html) - 
- [Untitled Document](docs/component-library/components/FavoriteButtonComponent.html) - 
- [Untitled Document](docs/component-library/components/FavoriteDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/FavoritesComponent.html) - 
- [Untitled Document](docs/component-library/components/FavoritesListComponent.html) - 
- [Untitled Document](docs/component-library/components/FloatingActionButtonComponent.html) - 
- [Untitled Document](docs/component-library/components/GalleryComponent.html) - 
- [Untitled Document](docs/component-library/components/GalleryManagementComponent.html) - 
- [Untitled Document](docs/component-library/components/IconComponent.html) - 
- [Untitled Document](docs/component-library/components/ImageGalleryComponent.html) - 
- [Untitled Document](docs/component-library/components/InfoPanelComponent.html) - 
- [Untitled Document](docs/component-library/components/InputComponent.html) - 
- [Untitled Document](docs/component-library/components/LabelComponent.html) - 
- [Untitled Document](docs/component-library/components/LoadingSpinnerComponent.html) - 
- [Untitled Document](docs/component-library/components/LoginComponent-1.html) - 
- [Untitled Document](docs/component-library/components/LoginComponent.html) - 
- [Untitled Document](docs/component-library/components/MainLayoutComponent.html) - 
- [Untitled Document](docs/component-library/components/MockAppCardComponent.html) - 
- [Untitled Document](docs/component-library/components/MockMainLayoutComponent.html) - 
- [Untitled Document](docs/component-library/components/MockSkeletonLoaderComponent.html) - 
- [Untitled Document](docs/component-library/components/NetflixViewComponent.html) - 
- [Untitled Document](docs/component-library/components/NotesDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/NotificationComponent.html) - 
- [Untitled Document](docs/component-library/components/OnboardingChecklistComponent.html) - 
- [Untitled Document](docs/component-library/components/OnboardingComponent.html) - 
- [Untitled Document](docs/component-library/components/OptimizedImageComponent.html) - 
- [Untitled Document](docs/component-library/components/PageHeaderComponent.html) - 
- [Untitled Document](docs/component-library/components/PaymentComponent.html) - padding: 1rem; border: 1px solid #ddd; border-radius: 5px; background-color: #fff; } .card-errors { margin-top: 0.5rem; font-size: 0.9rem; } .btn-success { background-color: #28a745; border-color: #28
- [Untitled Document](docs/component-library/components/PerformanceDashboardComponent-1.html) - 
- [Untitled Document](docs/component-library/components/PerformanceDashboardComponent.html) - 
- [Untitled Document](docs/component-library/components/ProfileComponent.html) - 
- [Untitled Document](docs/component-library/components/RegisterComponent-1.html) - 
- [Untitled Document](docs/component-library/components/RegisterComponent.html) - 
- [Untitled Document](docs/component-library/components/ResponseDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewDisplayComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewFormComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewListComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewSummaryComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewsListComponent.html) - 
- [Untitled Document](docs/component-library/components/ReviewsPageComponent.html) - 
- [Untitled Document](docs/component-library/components/SelectComponent.html) - 
- [Untitled Document](docs/component-library/components/SkeletonLoaderComponent.html) - 
- [Untitled Document](docs/component-library/components/StarRatingComponent.html) - 
- [Untitled Document](docs/component-library/components/SwipeViewComponent.html) - 
- [Untitled Document](docs/component-library/components/TagsDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/TelemetryDashboardComponent-1.html) - 
- [Untitled Document](docs/component-library/components/TelemetryDashboardComponent-2.html) - 
- [Untitled Document](docs/component-library/components/ThemeToggleComponent.html) - 
- [Untitled Document](docs/component-library/components/ToggleComponent.html) - 
- [Untitled Document](docs/component-library/components/TouringComponent.html) - 
- [Untitled Document](docs/component-library/components/TransactionDetailsDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/TransferDialogComponent.html) - 
- [Untitled Document](docs/component-library/components/TravelItineraryComponent.html) - [height]&#x3D;&quot;&#x27;400px&#x27;&quot; [initialLatitude]&#x3D;&quot;59.9139&quot; [initialLongitude]&#x3D;&quot;10.7522&quot; [initialZoom]&#x3D;&quot;6&quot; [selectable]&#x3D;&quot;true&quot; (
- [Untitled Document](docs/component-library/components/WalletComponent.html) - 
- [Untitled Document](docs/component-library/components/WithdrawDialogComponent.html) - 
- [Untitled Document](docs/component-library/coverage.html) - 
- [Untitled Document](docs/component-library/dependencies.html) - 
- [Untitled Document](docs/component-library/guards/AuthGuard.html) - 
- [Untitled Document](docs/component-library/injectables/AuthService-1.html) - 
- [Untitled Document](docs/component-library/injectables/AuthService.html) - 
- [Untitled Document](docs/component-library/injectables/ContentSanitizerService.html) - 
- [Untitled Document](docs/component-library/injectables/CryptoService.html) - 
- [Untitled Document](docs/component-library/injectables/CsrfService.html) - 
- [Untitled Document](docs/component-library/injectables/DialogService.html) - 
- [Untitled Document](docs/component-library/injectables/GlobalErrorHandler.html) - 
- [Untitled Document](docs/component-library/injectables/ImageOptimizationService.html) - 
- [Untitled Document](docs/component-library/injectables/LoggingService.html) - 
- [Untitled Document](docs/component-library/injectables/MapMonitoringService.html) - 
- [Untitled Document](docs/component-library/injectables/MediaService.html) - 
- [Untitled Document](docs/component-library/injectables/MockTelemetryService.html) - 
- [Untitled Document](docs/component-library/injectables/NotificationService.html) - 
- [Untitled Document](docs/component-library/injectables/OnboardingService.html) - 
- [Untitled Document](docs/component-library/injectables/PaymentService.html) - 
- [Untitled Document](docs/component-library/injectables/ProfileService.html) - 
- [Untitled Document](docs/component-library/injectables/PwaService.html) - 
- [Untitled Document](docs/component-library/injectables/RoleGuard.html) - 
- [Untitled Document](docs/component-library/injectables/SelectivePreloadingStrategy.html) - 
- [Untitled Document](docs/component-library/injectables/TelemetryService.html) - 
- [Untitled Document](docs/component-library/injectables/ThemeServiceMock.html) - 
- [Untitled Document](docs/component-library/injectables/TravelService.html) - 
- [Untitled Document](docs/component-library/injectables/UserPreferencesService.html) - 
- [Untitled Document](docs/component-library/injectables/UserPreferencesServiceMock.html) - 
- [Untitled Document](docs/component-library/injectables/UserService.html) - 
- [Untitled Document](docs/component-library/injectables/WalletService.html) - 
- [Untitled Document](docs/component-library/interceptors/AuthInterceptor.html) - 
- [Untitled Document](docs/component-library/interceptors/CSPInterceptor.html) - 
- [Untitled Document](docs/component-library/interceptors/CsrfInterceptor.html) - 
- [Untitled Document](docs/component-library/interceptors/ErrorInterceptor.html) - 
- [Untitled Document](docs/component-library/interceptors/HttpErrorInterceptor-1.html) - 
- [Untitled Document](docs/component-library/interceptors/HttpErrorInterceptor-2.html) - 
- [Untitled Document](docs/component-library/interfaces/AddressVerificationData.html) - 
- [Untitled Document](docs/component-library/interfaces/AdvertiserRatings.html) - 
- [Untitled Document](docs/component-library/interfaces/AuthResponse-1.html) - 
- [Untitled Document](docs/component-library/interfaces/AuthResponse.html) - 
- [Untitled Document](docs/component-library/interfaces/BoostAdResult.html) - 
- [Untitled Document](docs/component-library/interfaces/Breadcrumb-1.html) - 
- [Untitled Document](docs/component-library/interfaces/Breadcrumb.html) - 
- [Untitled Document](docs/component-library/interfaces/CardSize.html) - 
- [Untitled Document](docs/component-library/interfaces/Chainable.html) - 
- [Untitled Document](docs/component-library/interfaces/ChatSettings.html) - 
- [Untitled Document](docs/component-library/interfaces/CheckInResponse.html) - 
- [Untitled Document](docs/component-library/interfaces/ChecklistItem.html) - 
- [Untitled Document](docs/component-library/interfaces/ContentDensity.html) - 
- [Untitled Document](docs/component-library/interfaces/CryptoDepositAddress.html) - 
- [Untitled Document](docs/component-library/interfaces/DropdownItem.html) - 
- [Untitled Document](docs/component-library/interfaces/EmailVerificationData.html) - 
- [Untitled Document](docs/component-library/interfaces/EmailVerificationResponse.html) - 
- [Untitled Document](docs/component-library/interfaces/EmergencyContact.html) - 
- [Untitled Document](docs/component-library/interfaces/ErrorTelemetry.html) - 
- [Untitled Document](docs/component-library/interfaces/ExchangeRate.html) - 
- [Untitled Document](docs/component-library/interfaces/Favorite-2.html) - 
- [Untitled Document](docs/component-library/interfaces/Favorite.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteBatchResult.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteCreateData.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteDialogData.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteDialogResult.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteFilterOptions.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteTag.html) - 
- [Untitled Document](docs/component-library/interfaces/FavoriteUpdateData.html) - 
- [Untitled Document](docs/component-library/interfaces/FeatureAdResult.html) - 
- [Untitled Document](docs/component-library/interfaces/HammerManager.html) - 
- [Untitled Document](docs/component-library/interfaces/HeaderAction-1.html) - 
- [Untitled Document](docs/component-library/interfaces/HelpItem.html) - 
- [Untitled Document](docs/component-library/interfaces/HttpErrorInterceptorConfig-2.html) - 
- [Untitled Document](docs/component-library/interfaces/HttpErrorInterceptorConfig-3.html) - 
- [Untitled Document](docs/component-library/interfaces/HttpErrorInterceptorConfig.html) - 
- [Untitled Document](docs/component-library/interfaces/IdentityVerificationData.html) - 
- [Untitled Document](docs/component-library/interfaces/ImagePreview.html) - 
- [Untitled Document](docs/component-library/interfaces/InfoPanelItem.html) - 
- [Untitled Document](docs/component-library/interfaces/LocationMatchResult.html) - 
- [Untitled Document](docs/component-library/interfaces/LoginCredentials.html) - 
- [Untitled Document](docs/component-library/interfaces/LoginDTO.html) - 
- [Untitled Document](docs/component-library/interfaces/Media.html) - 
- [Untitled Document](docs/component-library/interfaces/ModerationRequest.html) - 
- [Untitled Document](docs/component-library/interfaces/NotesDialogData.html) - 
- [Untitled Document](docs/component-library/interfaces/OAuthProvider.html) - 
- [Untitled Document](docs/component-library/interfaces/OnboardingStep.html) - 
- [Untitled Document](docs/component-library/interfaces/PaymentIntent.html) - 
- [Untitled Document](docs/component-library/interfaces/PaymentMethod-1.html) - 
- [Untitled Document](docs/component-library/interfaces/PaymentMethod.html) - 
- [Untitled Document](docs/component-library/interfaces/PendingMedia.html) - 
- [Untitled Document](docs/component-library/interfaces/PendingVerification.html) - 
- [Untitled Document](docs/component-library/interfaces/PerformanceTelemetry.html) - 
- [Untitled Document](docs/component-library/interfaces/PhoneVerificationData.html) - 
- [Untitled Document](docs/component-library/interfaces/PhoneVerificationResponse.html) - 
- [Untitled Document](docs/component-library/interfaces/PhotoVerificationData.html) - 
- [Untitled Document](docs/component-library/interfaces/Profile.html) - 
- [Untitled Document](docs/component-library/interfaces/ProfileUpdateDTO.html) - 
- [Untitled Document](docs/component-library/interfaces/PublicProfile.html) - 
- [Untitled Document](docs/component-library/interfaces/RegisterDTO.html) - 
- [Untitled Document](docs/component-library/interfaces/RegisterData.html) - 
- [Untitled Document](docs/component-library/interfaces/ResponseDialogData.html) - 
- [Untitled Document](docs/component-library/interfaces/Review-1.html) - 
- [Untitled Document](docs/component-library/interfaces/Review-2.html) - 
- [Untitled Document](docs/component-library/interfaces/Review.html) - 
- [Untitled Document](docs/component-library/interfaces/ReviewCreateData.html) - 
- [Untitled Document](docs/component-library/interfaces/ReviewData.html) - 
- [Untitled Document](docs/component-library/interfaces/ReviewDialogData.html) - 
- [Untitled Document](docs/component-library/interfaces/ReviewReport.html) - 
- [Untitled Document](docs/component-library/interfaces/ReviewResponse.html) - 
- [Untitled Document](docs/component-library/interfaces/ReviewUpdateData.html) - 
- [Untitled Document](docs/component-library/interfaces/SafetyCheckin.html) - 
- [Untitled Document](docs/component-library/interfaces/SafetyCheckinCreateData.html) - 
- [Untitled Document](docs/component-library/interfaces/SafetyCheckinUpdateData.html) - 
- [Untitled Document](docs/component-library/interfaces/SafetySettings.html) - 
- [Untitled Document](docs/component-library/interfaces/SafetySettingsUpdateData.html) - 
- [Untitled Document](docs/component-library/interfaces/SelectOption.html) - 
- [Untitled Document](docs/component-library/interfaces/Subscription.html) - 
- [Untitled Document](docs/component-library/interfaces/SubscriptionPrice.html) - 
- [Untitled Document](docs/component-library/interfaces/TagsDialogData.html) - 
- [Untitled Document](docs/component-library/interfaces/ToastNotification-1.html) - 
- [Untitled Document](docs/component-library/interfaces/ToastNotification.html) - 
- [Untitled Document](docs/component-library/interfaces/TokenPayload.html) - 
- [Untitled Document](docs/component-library/interfaces/TopRatedAdvertiser.html) - 
- [Untitled Document](docs/component-library/interfaces/TouringAd.html) - 
- [Untitled Document](docs/component-library/interfaces/TransactionFilters.html) - 
- [Untitled Document](docs/component-library/interfaces/TransactionResponse.html) - 
- [Untitled Document](docs/component-library/interfaces/TravelItinerary.html) - 
- [Untitled Document](docs/component-library/interfaces/TravelPlanItem.html) - 
- [Untitled Document](docs/component-library/interfaces/User.html) - 
- [Untitled Document](docs/component-library/interfaces/UserPreferences.html) - 
- [Untitled Document](docs/component-library/interfaces/UserProfile.html) - 
- [Untitled Document](docs/component-library/interfaces/UserSearchResult.html) - 
- [Untitled Document](docs/component-library/interfaces/UserVerificationStatus.html) - 
- [Untitled Document](docs/component-library/interfaces/VerificationStatus.html) - 
- [Untitled Document](docs/component-library/interfaces/VerificationType.html) - 
- [Untitled Document](docs/component-library/interfaces/Wallet.html) - 
- [Untitled Document](docs/component-library/interfaces/WalletBalance.html) - 
- [Untitled Document](docs/component-library/interfaces/WalletSettings.html) - 
- [Untitled Document](docs/component-library/interfaces/WalletTransaction.html) - 
- [Untitled Document](docs/component-library/interfaces/Window.html) - 
- [Untitled Document](docs/component-library/miscellaneous/enumerations.html) - 
- [Untitled Document](docs/component-library/miscellaneous/typealiases.html) - 
- [Untitled Document](docs/component-library/modules/AdBrowserModule.html) - 
- [Untitled Document](docs/component-library/modules/AdDetailsModule.html) - 
- [Untitled Document](docs/component-library/modules/AdManagementModule.html) - 
- [Untitled Document](docs/component-library/modules/AdminModule.html) - 
- [Untitled Document](docs/component-library/modules/AdminRoutingModule.html) - 
- [Untitled Document](docs/component-library/modules/AdsModule.html) - 
- [Untitled Document](docs/component-library/modules/AppModule.html) - 
- [Untitled Document](docs/component-library/modules/AppRoutingModule.html) - 
- [Untitled Document](docs/component-library/modules/AuthModule.html) - 
- [Untitled Document](docs/component-library/modules/ChatModule.html) - 
- [Untitled Document](docs/component-library/modules/CommonTestModule.html) - 
- [Untitled Document](docs/component-library/modules/ContentModerationModule.html) - 
- [Untitled Document](docs/component-library/modules/CoreModule.html) - 
- [Untitled Document](docs/component-library/modules/EmeraldModule.html) - 
- [Untitled Document](docs/component-library/modules/FavoritesModule.html) - 
- [Untitled Document](docs/component-library/modules/FavoritesRoutingModule.html) - 
- [Untitled Document](docs/component-library/modules/FeaturesModule.html) - 
- [Untitled Document](docs/component-library/modules/MaterialModule.html) - 
- [Untitled Document](docs/component-library/modules/MockTelemetryModule.html) - 
- [Untitled Document](docs/component-library/modules/PaymentModule.html) - 
- [Untitled Document](docs/component-library/modules/ProfileModule.html) - 
- [Untitled Document](docs/component-library/modules/QRCodeModule.html) - 
- [Untitled Document](docs/component-library/modules/ReviewModule.html) - 
- [Untitled Document](docs/component-library/modules/SharedModule.html) - 
- [Untitled Document](docs/component-library/modules/TouringModule.html) - 
- [Untitled Document](docs/component-library/modules/WalletModule.html) - 
- [Untitled Document](docs/component-library/modules.html) - 
- [Untitled Document](docs/component-library/overview.html) - 
- [Untitled Document](docs/component-library/pipes/FileSizePipe.html) - 
- [Untitled Document](docs/component-library/pipes/LinkifyPipe.html) - 
- [Untitled Document](docs/component-library/pipes/TimeAgoPipe.html) - 
- [Untitled Document](docs/component-library/properties.html) - 
- [CI Knowledge Graph](docs/graph/ci_knowledge.md) - This knowledge graph is maintained by the Documentation Control & Synchronization System and is compatible with @modelcontextprotocol/servers/files/src/memory. **Project**: Date Night App 2 **Architec
- [Untitled Document](docs/html/ANGULAR_BUILD_OPTIMIZATION.html) - 
- [Untitled Document](docs/html/CODE_FORMATTING.html) - 
- [Untitled Document](docs/html/CONFIG_INDEX.html) - 
- [Untitled Document](docs/html/DATABASE_SCHEMA_DETAIL.html) - 
- [Untitled Document](docs/html/DECENTRALIZED_DOCUMENTATION_SUMMARY.html) - 
- [Untitled Document](docs/html/DEPENDENCY_UPDATE_SUMMARY.html) - 
- [Untitled Document](docs/html/DOCUMENTATION-IMPROVEMENTS.html) - 
- [Untitled Document](docs/html/DOCUMENTATION_IMPROVEMENT_REVIEW.html) - 
- [Untitled Document](docs/html/FIXES.html) - 
- [Untitled Document](docs/html/LintingIssues.html) - 
- [Untitled Document](docs/html/REPORTS_MIGRATION_GUIDE.html) - 
- [Untitled Document](docs/html/SNYK_WORKFLOW_IMPROVEMENTS.html) - 
- [Untitled Document](docs/html/UI_UX_DOCUMENTATION.html) - 
- [Untitled Document](docs/html/WORKFLOW_FIXES.html) - 
- [Untitled Document](docs/html/WORKFLOW_LOGS_CHANGES.html) - 
- [Untitled Document](docs/html-docs/sample/SAMPLE_COMPONENT.html) - 
- [Untitled Document](docs/index.html) - 
- [Documentation Cleanup Report](docs/outdated/2025-06-08/DOCUMENTATION_CLEANUP_REPORT.md) - **Generated**: 2025-06-08T22:48:09.368Z **Scope**: Cleanup of outdated documentation references - **Total Files Processed**: 5 - **Files Updated**: 1 - **Files Archived**: 4 - **Files Skipped**: 0 The
- [UI Implementation Guide](docs/outdated/2025-06-08-2025-06-08-IMPLEMENTATION_GUIDE.md) - This guide provides step-by-step instructions for implementing the remaining UI fixes to make the web app styling follow the UI documentation guidelines 100%. 1. [Fixing Unused Components](#1-fixing-u
- [Documentation Cleanup Report](docs/outdated/2025-06-08-DOCUMENTATION_CLEANUP_REPORT.md) - **Generated**: 2025-06-08T22:46:34.544Z **Scope**: Cleanup of outdated documentation references - **Total Files Processed**: 8 - **Files Updated**: 5 - **Files Archived**: 3 - **Files Skipped**: 0 The
- [UI Implementation Status](docs/ui-docs/IMPLEMENTATION_STATUS.md) - **Last Updated**: 2025-06-08T22:46:34.542Z > **📝 Update Notice**: This documentation was automatically updated to reflect the current codebase structure. Some references to legacy technologies have b
- [Untitled Document](docs-html/general/angular-build-optimization.html) - 
- [Untitled Document](docs-html/general/authentication-flow.html) - 
- [Untitled Document](docs-html/general/codebase-analysis.html) - 
- [Untitled Document](docs-html/general/data-protection.html) - 
- [Untitled Document](docs-html/general/database-schema-detail.html) - 
- [Untitled Document](docs-html/general/deprecated.html) - 
- [Untitled Document](docs-html/general/documentation-link-check-report.html) - 
- [Untitled Document](docs-html/general/documentation-restructuring-summary.html) - 
- [Untitled Document](docs-html/general/emerald-implementation-summary.html) - 
- [Untitled Document](docs-html/general/emerald-ui-integration-guide.html) - 
- [Untitled Document](docs-html/general/end-to-end-encryption.html) - 
- [Untitled Document](docs-html/general/implementation-plan.html) - 
- [Untitled Document](docs-html/general/implementation-status.html) - 
- [Duplication Prioritization Matrix](phase1-assessment/duplication-prioritization.md) - This document prioritizes the identified code duplications based on frequency, complexity, risk, and potential maintenance benefits. Each duplication is rated on a scale of 1-5 (1 = Low, 5 = High) for
- [Code Duplication Cleanup: Executive Summary](phase1-assessment/executive-summary.md) - This document provides an executive summary of the code duplication assessment and cleanup plan for the Date Night App. The project aims to systematically identify, prioritize, and refactor duplicated
- [Phase 1 Assessment Summary](phase1-assessment/phase1-summary.md) - This document summarizes the findings from Phase 1 of the code duplication cleanup plan. We have analyzed the codebase to identify, verify, and prioritize code duplications for refactoring. 1. **Signi
- [Phase 2 Implementation Plan: Low-Risk Refactorings](phase1-assessment/phase2-implementation-plan.md) - This document outlines the detailed implementation plan for Phase 2 of the code duplication cleanup, focusing on low-risk refactorings. Extract duplicated validation functions into a shared utility li
- [Phase 5 Implementation Plan: Testing and Validation](phase1-assessment/phase5-implementation-plan.md) - This document outlines the detailed implementation plan for Phase 5 of the code duplication cleanup, focusing on comprehensive testing and validation of the refactored code. Ensure all refactored code
- [Untitled Document](scripts/templates/doc_template.html) - 
- [Untitled Document](server/components/ads/GLOSSARY.html) - 
- [Untitled Document](server/components/auth/GLOSSARY.html) - 
- [Untitled Document](server/components/location/GLOSSARY.html) - 
- [Untitled Document](server/components/travel/GLOSSARY.html) - 
- [Untitled Document](server/components/users/GLOSSARY.html) - 
- [Untitled Document](server/docs/database-architecture-diagram.md) - 
- [Untitled Document](server/middleware/validators/GLOSSARY.html) - 
- [Untitled Document](server/services/GLOSSARY.html) - 
- [Untitled Document](server/tests/GLOSSARY.html) - 
- [Untitled Document](server/tests/integration/controllers/AILESSONS.html) - 
- [Untitled Document](server/tests/integration/controllers/GLOSSARY.html) - 
- [Untitled Document](server/tests/unit/services/AILESSONS.html) - 
- [Untitled Document](server/tests/unit/services/GLOSSARY.html) - 
- [Untitled Document](server/tests/unit/validators/AILESSONS.html) - 
- [Untitled Document](server/tests/unit/validators/GLOSSARY.html) - 
- [Untitled Document](server/utils/GLOSSARY.html) - 
- [Untitled Document](src/app/app.component.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/AILESSONS.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/GLOSSARY.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/advertiser-dashboard-analytics.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/advertiser-profile.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/browse.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/favorites.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/index.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/rankings.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/user-profile.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/wallet.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/AILESSONS.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/GLOSSARY.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/advertiser-dashboard-analytics.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/browse.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/favorites.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/index.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/user-profile.html) - 
- [Untitled Document](src/app/features/advertiser-browsing/2/z/wallet.html) - 

---

*Last synchronized: 2025-06-08T23:35:09.714Z*
*Compatible with: @modelcontextprotocol/server-memory*
*Generated by MCP Knowledge Synchronization System*