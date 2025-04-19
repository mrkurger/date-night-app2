# Configuration Settings Index

This document serves as a central reference for all customizable settings in the Date Night App. Settings are organized by category and include links to their specific locations in the codebase.

## Table of Contents

- [Client Configuration](#client-configuration)
  - [environment.development.ts](#environment-development-ts)
  - [environment.prod.ts](#environment-prod-ts)
- [Feature Modules](#feature-modules)
  - [ad-browser.component.ts](#ad-browser-component-ts)
  - [ad-browser.module.ts](#ad-browser-module-ts)
  - [ad-details.component.ts](#ad-details-component-ts)
  - [ad-details.module.ts](#ad-details-module-ts)
  - [ad-form.component.ts](#ad-form-component-ts)
  - [ad-list.component.ts](#ad-list-component-ts)
  - [ad-management.component.ts](#ad-management-component-ts)
  - [ad-management.module.ts](#ad-management-module-ts)
  - [ad-stats.component.ts](#ad-stats-component-ts)
  - [travel-itinerary.component.ts](#travel-itinerary-component-ts)
  - [content-moderation.component.spec.ts](#content-moderation-component-spec-ts)
  - [content-moderation.component.ts](#content-moderation-component-ts)
  - [content-moderation.module.ts](#content-moderation-module-ts)
  - [moderation-modal.component.spec.ts](#moderation-modal-component-spec-ts)
  - [moderation-modal.component.ts](#moderation-modal-component-ts)
  - [ads.module.ts](#ads-module-ts)
  - [ad-create.component.ts](#ad-create-component-ts)
  - [ad-detail.component.ts](#ad-detail-component-ts)
  - [ad-list.component.ts](#ad-list-component-ts)
  - [swipe-view.component.ts](#swipe-view-component-ts)
  - [advertiser-profile.component.spec.ts](#advertiser-profile-component-spec-ts)
  - [advertiser-profile.component.ts](#advertiser-profile-component-ts)
  - [auth.module.ts](#auth-module-ts)
  - [login.component.ts](#login-component-ts)
  - [register.component.ts](#register-component-ts)
  - [login.component.ts](#login-component-ts)
  - [register.component.ts](#register-component-ts)
  - [browse.component.ts](#browse-component-ts)
  - [chat.component.ts](#chat-component-ts)
  - [chat.module.ts](#chat-module-ts)
  - [features.module.ts](#features-module-ts)
  - [gallery-management.component.ts](#gallery-management-component-ts)
  - [gallery.component.ts](#gallery-component-ts)
  - [list-view.component.ts](#list-view-component-ts)
  - [netflix-view.component.ts](#netflix-view-component-ts)
  - [payment.component.ts](#payment-component-ts)
  - [payment.module.ts](#payment-module-ts)
  - [edit-profile.component.ts](#edit-profile-component-ts)
  - [profile.component.ts](#profile-component-ts)
  - [profile.module.ts](#profile-module-ts)
  - [tinder-card.component.ts](#tinder-card-component-ts)
  - [tinder.component.spec.ts](#tinder-component-spec-ts)
  - [tinder.component.ts](#tinder-component-ts)
  - [touring.component.ts](#touring-component-ts)
  - [touring.module.ts](#touring-module-ts)
  - [user-settings.component.spec.ts](#user-settings-component-spec-ts)
  - [user-settings.component.ts](#user-settings-component-ts)
  - [add-payment-method-dialog.component.ts](#add-payment-method-dialog-component-ts)
  - [deposit-dialog.component.ts](#deposit-dialog-component-ts)
  - [transaction-details-dialog.component.ts](#transaction-details-dialog-component-ts)
  - [transfer-dialog.component.ts](#transfer-dialog-component-ts)
  - [withdraw-dialog.component.ts](#withdraw-dialog-component-ts)
  - [wallet.component.ts](#wallet-component-ts)
  - [wallet.module.ts](#wallet-module-ts)
- [Other Configuration](#other-configuration)
  - [app-routing.module.ts](#app-routing-module-ts)
  - [app.component.spec.ts](#app-component-spec-ts)
  - [app.component.ts](#app-component-ts)
  - [app.config.ts](#app-config-ts)
  - [app.module.ts](#app-module-ts)
  - [login.component.spec.ts](#login-component-spec-ts)
  - [core.module.ts](#core-module-ts)
  - [ad.service.spec.ts](#ad-service-spec-ts)
  - [auth.service.spec.ts](#auth-service-spec-ts)
  - [auth.service.ts](#auth-service-ts)
  - [caching.service.spec.ts](#caching-service-spec-ts)
  - [chat.service.ts](#chat-service-ts)
  - [content-sanitizer.service.spec.ts](#content-sanitizer-service-spec-ts)
  - [location.service.spec.ts](#location-service-spec-ts)
  - [media.service.spec.ts](#media-service-spec-ts)
  - [notification.service.spec.ts](#notification-service-spec-ts)
  - [notification.service.ts](#notification-service-ts)
  - [payment.service.ts](#payment-service-ts)
  - [travel.service.spec.ts](#travel-service-spec-ts)
  - [wallet.service.ts](#wallet-service-ts)
  - [environment.ts](#environment-ts)
  - [csp-config.js](#csp-config-js)
  - [SCHEMA_REFACTOR_NEEDED.js](#schema_refactor_needed-js)
  - [ad.controller.js](#ad-controller-js)
  - [ad.model.js](#ad-model-js)
  - [ad.routes.js](#ad-routes-js)
  - [index.js](#index-js)
  - [auth.controller.js](#auth-controller-js)
  - [auth.routes.js](#auth-routes-js)
  - [index.js](#index-js)
  - [chat-message.model.js](#chat-message-model-js)
  - [chat.controller.js](#chat-controller-js)
  - [chat.routes.js](#chat-routes-js)
  - [chat.socket.js](#chat-socket-js)
  - [index.js](#index-js)
  - [index.js](#index-js)
  - [index.js](#index-js)
  - [user.controller.js](#user-controller-js)
  - [user.model.js](#user-model-js)
  - [user.routes.js](#user-routes-js)
  - [payment.controller.js](#payment-controller-js)
  - [safety.controller.js](#safety-controller-js)
  - [verification.controller.js](#verification-controller-js)
  - [wallet.controller.js](#wallet-controller-js)
  - [norway-locations.js](#norway-locations-js)
  - [ad.model.js](#ad-model-js)
  - [chat-message.model.js](#chat-message-model-js)
  - [chat-room.model.js](#chat-room-model-js)
  - [paymentMethod.model.js](#paymentmethod-model-js)
  - [review.model.js](#review-model-js)
  - [safety-checkin.model.js](#safety-checkin-model-js)
  - [token-blacklist.model.js](#token-blacklist-model-js)
  - [transaction.model.js](#transaction-model-js)
  - [user.model.js](#user-model-js)
  - [verification.model.js](#verification-model-js)
  - [wallet.model.js](#wallet-model-js)
  - [index.js](#index-js)
  - [location.routes.js](#location-routes-js)
  - [media.routes.js](#media-routes-js)
  - [payment.routes.js](#payment-routes-js)
  - [review.routes.js](#review-routes-js)
  - [safety.routes.js](#safety-routes-js)
  - [travel.routes.js](#travel-routes-js)
  - [verification.routes.js](#verification-routes-js)
  - [wallet.routes.js](#wallet-routes-js)
  - [server.js](#server-js)
  - [helpers.js](#helpers-js)
  - [auth.controller.test.js](#auth-controller-test-js)
  - [api.performance.test.js](#api-performance-test-js)
  - [setup.js](#setup-js)
  - [auth.middleware.test.js](#auth-middleware-test-js)
  - [security.test.js](#security-test-js)
  - [ad.model.test.js](#ad-model-test-js)
  - [chat-message.model.test.js](#chat-message-model-test-js)
  - [chat-room.model.test.js](#chat-room-model-test-js)
  - [paymentMethod.model.test.js](#paymentmethod-model-test-js)
  - [user.model.test.js](#user-model-test-js)
  - [wallet.model.test.js](#wallet-model-test-js)
  - [auth.service.test.js](#auth-service-test-js)
  - [wallet.service.test.js](#wallet-service-test-js)
  - [authHelpers.js](#authhelpers-js)
  - [cryptoHelpers.js](#cryptohelpers-js)
  - [logger.js](#logger-js)
  - [messageCleanup.js](#messagecleanup-js)
  - [pagination.js](#pagination-js)
- [Server Configuration](#server-configuration)
  - [database.js](#database-js)
  - [index.js](#index-js)
  - [oauth.js](#oauth-js)
  - [passport.js](#passport-js)
- [Server Middleware](#server-middleware)
  - [asyncHandler.js](#asynchandler-js)
  - [auth.js](#auth-js)
  - [authenticateToken.js](#authenticatetoken-js)
  - [cache.js](#cache-js)
  - [csp.middleware.js](#csp-middleware-js)
  - [cspNonce.js](#cspnonce-js)
  - [csrf.js](#csrf-js)
  - [errorHandler.js](#errorhandler-js)
  - [fileAccess.js](#fileaccess-js)
  - [index.js](#index-js)
  - [rateLimiter.js](#ratelimiter-js)
  - [securityHeaders.js](#securityheaders-js)
  - [upload.js](#upload-js)
  - [validator.js](#validator-js)
- [Server Services](#server-services)
  - [ad.service.js](#ad-service-js)
  - [auth.service.js](#auth-service-js)
  - [auth.service.test.js](#auth-service-test-js)
  - [chat.service.js](#chat-service-js)
  - [media.service.js](#media-service-js)
  - [payment.service.js](#payment-service-js)
  - [socket.service.js](#socket-service-js)
  - [travel.service.js](#travel-service-js)
  - [wallet.service.js](#wallet-service-js)
- [UI Components](#ui-components)
  - [ad-card.component.ts](#ad-card-component-ts)
  - [debug-info.component.ts](#debug-info-component-ts)
  - [error-message.component.ts](#error-message-component-ts)
  - [image-gallery.component.ts](#image-gallery-component-ts)
  - [loading-spinner.component.ts](#loading-spinner-component-ts)
  - [main-layout.component.ts](#main-layout-component-ts)
  - [notification.component.spec.ts](#notification-component-spec-ts)
  - [notification.component.ts](#notification-component-ts)
  - [optimized-image.component.ts](#optimized-image-component-ts)
  - [app-card.component.spec.ts](#app-card-component-spec-ts)
  - [app-card.component.ts](#app-card-component-ts)
  - [card-grid.component.spec.ts](#card-grid-component-spec-ts)
  - [card-grid.component.ts](#card-grid-component-ts)
  - [app-card.component.spec.ts](#app-card-component-spec-ts)
  - [app-card.component.ts](#app-card-component-ts)
  - [app-card.component.unit.spec.ts](#app-card-component-unit-spec-ts)
  - [avatar.component.ts](#avatar-component-ts)
  - [card-grid.component.spec.ts](#card-grid-component-spec-ts)
  - [card-grid.component.ts](#card-grid-component-ts)
  - [carousel.component.ts](#carousel-component-ts)
  - [floating-action-button.component.ts](#floating-action-button-component-ts)
  - [label.component.ts](#label-component-ts)
  - [page-header.component.ts](#page-header-component-ts)
  - [pager.component.ts](#pager-component-ts)
  - [skeleton-loader.component.ts](#skeleton-loader-component-ts)
  - [toggle.component.ts](#toggle-component-ts)
  - [emerald.module.ts](#emerald-module-ts)
  - [tinder-card.component.ts](#tinder-card-component-ts)
  - [material.module.ts](#material-module-ts)

## Client Configuration

### environment.development.ts

**File**: [client-angular/src/environments/environment.development.ts](/Users/oivindlund/date-night-app/client-angular/src/environments/environment.development.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### environment.prod.ts

**File**: [client-angular/src/environments/environment.prod.ts](/Users/oivindlund/date-night-app/client-angular/src/environments/environment.prod.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

## Feature Modules

### ad-browser.component.ts

**File**: [client-angular/src/app/features/ad-browser/ad-browser.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-browser/ad-browser.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-browser.module.ts

**File**: [client-angular/src/app/features/ad-browser/ad-browser.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-browser/ad-browser.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-details.component.ts

**File**: [client-angular/src/app/features/ad-details/ad-details.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-details/ad-details.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-details.module.ts

**File**: [client-angular/src/app/features/ad-details/ad-details.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-details/ad-details.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-form.component.ts

**File**: [client-angular/src/app/features/ad-management/ad-form/ad-form.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-form/ad-form.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-list.component.ts

**File**: [client-angular/src/app/features/ad-management/ad-list/ad-list.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-list/ad-list.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-management.component.ts

**File**: [client-angular/src/app/features/ad-management/ad-management.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-management.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-management.module.ts

**File**: [client-angular/src/app/features/ad-management/ad-management.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-management.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-stats.component.ts

**File**: [client-angular/src/app/features/ad-management/ad-stats/ad-stats.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-stats/ad-stats.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### travel-itinerary.component.ts

**File**: [client-angular/src/app/features/ad-management/travel-itinerary/travel-itinerary.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/travel-itinerary/travel-itinerary.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### content-moderation.component.spec.ts

**File**: [client-angular/src/app/features/admin/content-moderation/content-moderation.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/admin/content-moderation/content-moderation.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_MEDIA | Mock media data for testing | N/A | Test |

### content-moderation.component.ts

**File**: [client-angular/src/app/features/admin/content-moderation/content-moderation.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/admin/content-moderation/content-moderation.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### content-moderation.module.ts

**File**: [client-angular/src/app/features/admin/content-moderation/content-moderation.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/admin/content-moderation/content-moderation.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### moderation-modal.component.spec.ts

**File**: [client-angular/src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_MEDIA | Mock media data for testing | N/A | Test |

### moderation-modal.component.ts

**File**: [client-angular/src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ads.module.ts

**File**: [client-angular/src/app/features/ads/ads.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ads/ads.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-create.component.ts

**File**: [client-angular/src/app/features/ads/components/ad-create/ad-create.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ads/components/ad-create/ad-create.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-detail.component.ts

**File**: [client-angular/src/app/features/ads/components/ad-detail/ad-detail.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ads/components/ad-detail/ad-detail.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad-list.component.ts

**File**: [client-angular/src/app/features/ads/components/ad-list/ad-list.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ads/components/ad-list/ad-list.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### swipe-view.component.ts

**File**: [client-angular/src/app/features/ads/components/swipe-view/swipe-view.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/ads/components/swipe-view/swipe-view.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### advertiser-profile.component.spec.ts

**File**: [client-angular/src/app/features/advertiser-profile/advertiser-profile.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/advertiser-profile/advertiser-profile.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### advertiser-profile.component.ts

**File**: [client-angular/src/app/features/advertiser-profile/advertiser-profile.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/advertiser-profile/advertiser-profile.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### auth.module.ts

**File**: [client-angular/src/app/features/auth/auth.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/auth/auth.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### login.component.ts

**File**: [client-angular/src/app/features/auth/components/login/login.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/auth/components/login/login.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### register.component.ts

**File**: [client-angular/src/app/features/auth/components/register/register.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/auth/components/register/register.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### login.component.ts

**File**: [client-angular/src/app/features/auth/login/login.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/auth/login/login.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### register.component.ts

**File**: [client-angular/src/app/features/auth/register/register.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/auth/register/register.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### browse.component.ts

**File**: [client-angular/src/app/features/browse/browse.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/browse/browse.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat.component.ts

**File**: [client-angular/src/app/features/chat/chat.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/chat/chat.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MESSAGE_BUBBLE_COLORS | Colors for message bubbles | see below | All |
| MAX_ATTACHMENT_SIZE | Maximum size for attachments in bytes | 10MB | All |

### chat.module.ts

**File**: [client-angular/src/app/features/chat/chat.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/chat/chat.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| ENABLE_REAL_TIME_FEATURES | Enable real-time chat features | true | All |
| ENABLE_EMOJI_PICKER | Enable emoji picker in chat | true | All |

### features.module.ts

**File**: [client-angular/src/app/features/features.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/features.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### gallery-management.component.ts

**File**: [client-angular/src/app/features/gallery/gallery-management/gallery-management.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/gallery/gallery-management/gallery-management.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### gallery.component.ts

**File**: [client-angular/src/app/features/gallery/gallery.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/gallery/gallery.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### list-view.component.ts

**File**: [client-angular/src/app/features/list-view/list-view.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/list-view/list-view.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| DEFAULT_VIEW_MODE | Default view mode for the list | 'grid' | All |
| DEFAULT_SORT | Default sort option | 'newest' | All |
| DEFAULT_PAGE_SIZE | Default number of items per page | 20 | All |
| ENABLE_SAVED_FILTERS | Enable saved filter functionality | true | All |

### netflix-view.component.ts

**File**: [client-angular/src/app/features/netflix-view/netflix-view.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/netflix-view/netflix-view.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| HERO_SECTION_HEIGHT | Height of the hero section | 70vh | All |
| CARD_ANIMATION_DURATION | Duration of card hover animations | 300ms | All |

### payment.component.ts

**File**: [client-angular/src/app/features/payment/payment.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/payment/payment.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### payment.module.ts

**File**: [client-angular/src/app/features/payment/payment.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/payment/payment.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### edit-profile.component.ts

**File**: [client-angular/src/app/features/profile/edit-profile.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/profile/edit-profile.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### profile.component.ts

**File**: [client-angular/src/app/features/profile/profile.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/profile/profile.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### profile.module.ts

**File**: [client-angular/src/app/features/profile/profile.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/profile/profile.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### tinder-card.component.ts

**File**: [client-angular/src/app/features/tinder-card/tinder-card.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/tinder-card/tinder-card.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### tinder.component.spec.ts

**File**: [client-angular/src/app/features/tinder/tinder.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/tinder/tinder.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### tinder.component.ts

**File**: [client-angular/src/app/features/tinder/tinder.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/tinder/tinder.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### touring.component.ts

**File**: [client-angular/src/app/features/touring/touring.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/touring/touring.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### touring.module.ts

**File**: [client-angular/src/app/features/touring/touring.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/touring/touring.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### user-settings.component.spec.ts

**File**: [client-angular/src/app/features/user-settings/user-settings.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/user-settings/user-settings.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### user-settings.component.ts

**File**: [client-angular/src/app/features/user-settings/user-settings.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/user-settings/user-settings.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### add-payment-method-dialog.component.ts

**File**: [client-angular/src/app/features/wallet/dialogs/add-payment-method-dialog.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/dialogs/add-payment-method-dialog.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### deposit-dialog.component.ts

**File**: [client-angular/src/app/features/wallet/dialogs/deposit-dialog.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/dialogs/deposit-dialog.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### transaction-details-dialog.component.ts

**File**: [client-angular/src/app/features/wallet/dialogs/transaction-details-dialog.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/dialogs/transaction-details-dialog.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### transfer-dialog.component.ts

**File**: [client-angular/src/app/features/wallet/dialogs/transfer-dialog.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/dialogs/transfer-dialog.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### withdraw-dialog.component.ts

**File**: [client-angular/src/app/features/wallet/dialogs/withdraw-dialog.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/dialogs/withdraw-dialog.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.component.ts

**File**: [client-angular/src/app/features/wallet/wallet.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/wallet.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.module.ts

**File**: [client-angular/src/app/features/wallet/wallet.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/wallet.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

## Other Configuration

### app-routing.module.ts

**File**: [client-angular/src/app/app-routing.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/app-routing.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### app.component.spec.ts

**File**: [client-angular/src/app/app.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/app.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_SERVICES | Mock service configurations | N/A | All |

### app.component.ts

**File**: [client-angular/src/app/app.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/app.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### app.config.ts

**File**: [client-angular/src/app/app.config.ts](/Users/oivindlund/date-night-app/client-angular/src/app/app.config.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### app.module.ts

**File**: [client-angular/src/app/app.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/app.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### login.component.spec.ts

**File**: [client-angular/src/app/components/login/login.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/components/login/login.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_AUTH_SERVICE | Mock authentication service configuration | N/A | All |

### core.module.ts

**File**: [client-angular/src/app/core/core.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/core.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad.service.spec.ts

**File**: [client-angular/src/app/core/services/ad.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/ad.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_ADS | Mock ad data for testing | N/A | Test |

### auth.service.spec.ts

**File**: [client-angular/src/app/core/services/auth.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/auth.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_USER_DATA | Test user data for auth service tests | N/A | Test |

### auth.service.ts

**File**: [client-angular/src/app/core/services/auth.service.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/auth.service.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### caching.service.spec.ts

**File**: [client-angular/src/app/core/services/caching.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/caching.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat.service.ts

**File**: [client-angular/src/app/core/services/chat.service.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/chat.service.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MAX_ATTACHMENT_SIZE | Maximum size for attachments in bytes | 10MB | All |
| ENABLE_MESSAGE_ENCRYPTION | Enable end-to-end encryption for messages | false | All |

### content-sanitizer.service.spec.ts

**File**: [client-angular/src/app/core/services/content-sanitizer.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/content-sanitizer.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_SERVICES | Mock service configurations | N/A | All |

### location.service.spec.ts

**File**: [client-angular/src/app/core/services/location.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/location.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_DATA | Mock location data for testing | N/A | Test |
| API_RESPONSES | Mock API responses for testing | N/A | Test |

### media.service.spec.ts

**File**: [client-angular/src/app/core/services/media.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/media.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_MEDIA | Mock media data for testing | N/A | Test |

### notification.service.spec.ts

**File**: [client-angular/src/app/core/services/notification.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/notification.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| NOTIFICATION_DURATION | Duration for notifications in milliseconds | N/A | All |

### notification.service.ts

**File**: [client-angular/src/app/core/services/notification.service.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/notification.service.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### payment.service.ts

**File**: [client-angular/src/app/core/services/payment.service.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/payment.service.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### travel.service.spec.ts

**File**: [client-angular/src/app/core/services/travel.service.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/travel.service.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.service.ts

**File**: [client-angular/src/app/core/services/wallet.service.ts](/Users/oivindlund/date-night-app/client-angular/src/app/core/services/wallet.service.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### environment.ts

**File**: [client-angular/src/app/environments/environment.ts](/Users/oivindlund/date-night-app/client-angular/src/app/environments/environment.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### csp-config.js

**File**: [client-angular/src/csp-config.js](/Users/oivindlund/date-night-app/client-angular/src/csp-config.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### SCHEMA_REFACTOR_NEEDED.js

**File**: [server/components/SCHEMA_REFACTOR_NEEDED.js](/Users/oivindlund/date-night-app/server/components/SCHEMA_REFACTOR_NEEDED.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad.controller.js

**File**: [server/components/ads/ad.controller.js](/Users/oivindlund/date-night-app/server/components/ads/ad.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad.model.js

**File**: [server/components/ads/ad.model.js](/Users/oivindlund/date-night-app/server/components/ads/ad.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### ad.routes.js

**File**: [server/components/ads/ad.routes.js](/Users/oivindlund/date-night-app/server/components/ads/ad.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/components/ads/index.js](/Users/oivindlund/date-night-app/server/components/ads/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### auth.controller.js

**File**: [server/components/auth/auth.controller.js](/Users/oivindlund/date-night-app/server/components/auth/auth.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### auth.routes.js

**File**: [server/components/auth/auth.routes.js](/Users/oivindlund/date-night-app/server/components/auth/auth.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/components/auth/index.js](/Users/oivindlund/date-night-app/server/components/auth/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat-message.model.js

**File**: [server/components/chat/chat-message.model.js](/Users/oivindlund/date-night-app/server/components/chat/chat-message.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat.controller.js

**File**: [server/components/chat/chat.controller.js](/Users/oivindlund/date-night-app/server/components/chat/chat.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat.routes.js

**File**: [server/components/chat/chat.routes.js](/Users/oivindlund/date-night-app/server/components/chat/chat.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat.socket.js

**File**: [server/components/chat/chat.socket.js](/Users/oivindlund/date-night-app/server/components/chat/chat.socket.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/components/chat/index.js](/Users/oivindlund/date-night-app/server/components/chat/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/components/index.js](/Users/oivindlund/date-night-app/server/components/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/components/users/index.js](/Users/oivindlund/date-night-app/server/components/users/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### user.controller.js

**File**: [server/components/users/user.controller.js](/Users/oivindlund/date-night-app/server/components/users/user.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### user.model.js

**File**: [server/components/users/user.model.js](/Users/oivindlund/date-night-app/server/components/users/user.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### user.routes.js

**File**: [server/components/users/user.routes.js](/Users/oivindlund/date-night-app/server/components/users/user.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### payment.controller.js

**File**: [server/controllers/payment.controller.js](/Users/oivindlund/date-night-app/server/controllers/payment.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### safety.controller.js

**File**: [server/controllers/safety.controller.js](/Users/oivindlund/date-night-app/server/controllers/safety.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### verification.controller.js

**File**: [server/controllers/verification.controller.js](/Users/oivindlund/date-night-app/server/controllers/verification.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.controller.js

**File**: [server/controllers/wallet.controller.js](/Users/oivindlund/date-night-app/server/controllers/wallet.controller.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### norway-locations.js

**File**: [server/data/norway-locations.js](/Users/oivindlund/date-night-app/server/data/norway-locations.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| NORWAY_COUNTIES | Description of setting | value | All |

### ad.model.js

**File**: [server/models/ad.model.js](/Users/oivindlund/date-night-app/server/models/ad.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| R | Description of setting | value | All |

### chat-message.model.js

**File**: [server/models/chat-message.model.js](/Users/oivindlund/date-night-app/server/models/chat-message.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### chat-room.model.js

**File**: [server/models/chat-room.model.js](/Users/oivindlund/date-night-app/server/models/chat-room.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### paymentMethod.model.js

**File**: [server/models/paymentMethod.model.js](/Users/oivindlund/date-night-app/server/models/paymentMethod.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| PAYMENT_METHOD_TYPES | List of supported payment method types | ['card', 'bank_account', 'crypto_address'] | All |

### review.model.js

**File**: [server/models/review.model.js](/Users/oivindlund/date-night-app/server/models/review.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### safety-checkin.model.js

**File**: [server/models/safety-checkin.model.js](/Users/oivindlund/date-night-app/server/models/safety-checkin.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### token-blacklist.model.js

**File**: [server/models/token-blacklist.model.js](/Users/oivindlund/date-night-app/server/models/token-blacklist.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### transaction.model.js

**File**: [server/models/transaction.model.js](/Users/oivindlund/date-night-app/server/models/transaction.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TRANSACTION_TYPES | List of supported transaction types | ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'fee'] | All |

### user.model.js

**File**: [server/models/user.model.js](/Users/oivindlund/date-night-app/server/models/user.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### verification.model.js

**File**: [server/models/verification.model.js](/Users/oivindlund/date-night-app/server/models/verification.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.model.js

**File**: [server/models/wallet.model.js](/Users/oivindlund/date-night-app/server/models/wallet.model.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SUPPORTED_CURRENCIES | List of supported fiat currencies | ['NOK', 'USD', 'EUR', 'GBP'] | All |
| SUPPORTED_CRYPTOCURRENCIES | List of supported cryptocurrencies | ['BTC', 'ETH', 'USDT', 'USDC'] | All |
| MINIMUM_WITHDRAWAL | Minimum withdrawal amount in smallest currency unit | 10000 = 100 NOK | All |

### index.js

**File**: [server/routes/index.js](/Users/oivindlund/date-night-app/server/routes/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### location.routes.js

**File**: [server/routes/location.routes.js](/Users/oivindlund/date-night-app/server/routes/location.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### media.routes.js

**File**: [server/routes/media.routes.js](/Users/oivindlund/date-night-app/server/routes/media.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### payment.routes.js

**File**: [server/routes/payment.routes.js](/Users/oivindlund/date-night-app/server/routes/payment.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### review.routes.js

**File**: [server/routes/review.routes.js](/Users/oivindlund/date-night-app/server/routes/review.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### safety.routes.js

**File**: [server/routes/safety.routes.js](/Users/oivindlund/date-night-app/server/routes/safety.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### travel.routes.js

**File**: [server/routes/travel.routes.js](/Users/oivindlund/date-night-app/server/routes/travel.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### verification.routes.js

**File**: [server/routes/verification.routes.js](/Users/oivindlund/date-night-app/server/routes/verification.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.routes.js

**File**: [server/routes/wallet.routes.js](/Users/oivindlund/date-night-app/server/routes/wallet.routes.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### server.js

**File**: [server/server.js](/Users/oivindlund/date-night-app/server/server.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| PORT | Description of setting | value | All |

### helpers.js

**File**: [server/tests/helpers.js](/Users/oivindlund/date-night-app/server/tests/helpers.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_USER_DATA | Default test user data | see object below | Test |
| MOCK_TOKEN_GENERATION | Settings for token generation in tests | N/A | Test |

### auth.controller.test.js

**File**: [server/tests/integration/controllers/auth.controller.test.js](/Users/oivindlund/date-night-app/server/tests/integration/controllers/auth.controller.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_USER_DATA | Test user data | imported from helpers | Test |

### api.performance.test.js

**File**: [server/tests/performance/api.performance.test.js](/Users/oivindlund/date-night-app/server/tests/performance/api.performance.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| PERFORMANCE_THRESHOLDS | Response time thresholds | see constants below | All |
| REQUEST_COUNTS | Number of requests to make for load testing | N/A | Test |

### setup.js

**File**: [server/tests/setup.js](/Users/oivindlund/date-night-app/server/tests/setup.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_MONGODB_URI | MongoDB connection string for tests | mongodb://localhost:27017/datenight_test | Test |
| MOCK_JWT_SECRET | Secret used for JWT in tests | 'test_jwt_secret' | Test |

### auth.middleware.test.js

**File**: [server/tests/unit/middleware/auth.middleware.test.js](/Users/oivindlund/date-night-app/server/tests/unit/middleware/auth.middleware.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_TOKEN_GENERATION | Settings for token generation in tests | N/A | Test |
| MOCK_USER_DATA | Test user data for auth middleware tests | N/A | Test |

### security.test.js

**File**: [server/tests/unit/middleware/security.test.js](/Users/oivindlund/date-night-app/server/tests/unit/middleware/security.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| CSP_TEST_SETTINGS | Content Security Policy test settings | N/A | Test |

### ad.model.test.js

**File**: [server/tests/unit/models/ad.model.test.js](/Users/oivindlund/date-night-app/server/tests/unit/models/ad.model.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_AD_DATA | Test ad data | imported from helpers | Test |

### chat-message.model.test.js

**File**: [server/tests/unit/models/chat-message.model.test.js](/Users/oivindlund/date-night-app/server/tests/unit/models/chat-message.model.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_MESSAGE_DATA | Test message data | imported from helpers | Test |

### chat-room.model.test.js

**File**: [server/tests/unit/models/chat-room.model.test.js](/Users/oivindlund/date-night-app/server/tests/unit/models/chat-room.model.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_USER_DATA | Test user data | imported from helpers | Test |

### paymentMethod.model.test.js

**File**: [server/tests/unit/models/paymentMethod.model.test.js](/Users/oivindlund/date-night-app/server/tests/unit/models/paymentMethod.model.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_PAYMENT_METHOD_DATA | Test payment method data | defined in this file | Test |

### user.model.test.js

**File**: [server/tests/unit/models/user.model.test.js](/Users/oivindlund/date-night-app/server/tests/unit/models/user.model.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_USER_DATA | Test user data | imported from helpers | Test |

### wallet.model.test.js

**File**: [server/tests/unit/models/wallet.model.test.js](/Users/oivindlund/date-night-app/server/tests/unit/models/wallet.model.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| TEST_WALLET_DATA | Test wallet data | defined in this file | Test |

### auth.service.test.js

**File**: [server/tests/unit/services/auth.service.test.js](/Users/oivindlund/date-night-app/server/tests/unit/services/auth.service.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_USER_DATA | Test user data for auth service tests | N/A | Test |
| MOCK_TOKEN_GENERATION | Settings for token generation in tests | N/A | Test |

### wallet.service.test.js

**File**: [server/tests/unit/services/wallet.service.test.js](/Users/oivindlund/date-night-app/server/tests/unit/services/wallet.service.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_WALLET_DATA | Test wallet data for wallet service tests | N/A | Test |
| MOCK_PAYMENT_METHOD_DATA | Test payment method data for wallet service tests | N/A | Test |

### authHelpers.js

**File**: [server/utils/authHelpers.js](/Users/oivindlund/date-night-app/server/utils/authHelpers.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### cryptoHelpers.js

**File**: [server/utils/cryptoHelpers.js](/Users/oivindlund/date-night-app/server/utils/cryptoHelpers.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### logger.js

**File**: [server/utils/logger.js](/Users/oivindlund/date-night-app/server/utils/logger.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### messageCleanup.js

**File**: [server/utils/messageCleanup.js](/Users/oivindlund/date-night-app/server/utils/messageCleanup.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### pagination.js

**File**: [server/utils/pagination.js](/Users/oivindlund/date-night-app/server/utils/pagination.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

## Server Configuration

### database.js

**File**: [server/config/database.js](/Users/oivindlund/date-night-app/server/config/database.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/config/index.js](/Users/oivindlund/date-night-app/server/config/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### oauth.js

**File**: [server/config/oauth.js](/Users/oivindlund/date-night-app/server/config/oauth.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### passport.js

**File**: [server/config/passport.js](/Users/oivindlund/date-night-app/server/config/passport.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

## Server Middleware

### asyncHandler.js

**File**: [server/middleware/asyncHandler.js](/Users/oivindlund/date-night-app/server/middleware/asyncHandler.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### auth.js

**File**: [server/middleware/auth.js](/Users/oivindlund/date-night-app/server/middleware/auth.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### authenticateToken.js

**File**: [server/middleware/authenticateToken.js](/Users/oivindlund/date-night-app/server/middleware/authenticateToken.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### cache.js

**File**: [server/middleware/cache.js](/Users/oivindlund/date-night-app/server/middleware/cache.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### csp.middleware.js

**File**: [server/middleware/csp.middleware.js](/Users/oivindlund/date-night-app/server/middleware/csp.middleware.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### cspNonce.js

**File**: [server/middleware/cspNonce.js](/Users/oivindlund/date-night-app/server/middleware/cspNonce.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### csrf.js

**File**: [server/middleware/csrf.js](/Users/oivindlund/date-night-app/server/middleware/csrf.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### errorHandler.js

**File**: [server/middleware/errorHandler.js](/Users/oivindlund/date-night-app/server/middleware/errorHandler.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### fileAccess.js

**File**: [server/middleware/fileAccess.js](/Users/oivindlund/date-night-app/server/middleware/fileAccess.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### index.js

**File**: [server/middleware/index.js](/Users/oivindlund/date-night-app/server/middleware/index.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### rateLimiter.js

**File**: [server/middleware/rateLimiter.js](/Users/oivindlund/date-night-app/server/middleware/rateLimiter.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### securityHeaders.js

**File**: [server/middleware/securityHeaders.js](/Users/oivindlund/date-night-app/server/middleware/securityHeaders.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### upload.js

**File**: [server/middleware/upload.js](/Users/oivindlund/date-night-app/server/middleware/upload.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### validator.js

**File**: [server/middleware/validator.js](/Users/oivindlund/date-night-app/server/middleware/validator.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

## Server Services

### ad.service.js

**File**: [server/services/ad.service.js](/Users/oivindlund/date-night-app/server/services/ad.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### auth.service.js

**File**: [server/services/auth.service.js](/Users/oivindlund/date-night-app/server/services/auth.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### auth.service.test.js

**File**: [server/services/auth.service.test.js](/Users/oivindlund/date-night-app/server/services/auth.service.test.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_USER_DATA | Test user data for auth service tests | N/A | Test |
| JWT_EXPIRY | Token expiration settings for tests | '1h' for access, '7d' for refresh | Test |

### chat.service.js

**File**: [server/services/chat.service.js](/Users/oivindlund/date-night-app/server/services/chat.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### media.service.js

**File**: [server/services/media.service.js](/Users/oivindlund/date-night-app/server/services/media.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### payment.service.js

**File**: [server/services/payment.service.js](/Users/oivindlund/date-night-app/server/services/payment.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### socket.service.js

**File**: [server/services/socket.service.js](/Users/oivindlund/date-night-app/server/services/socket.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### travel.service.js

**File**: [server/services/travel.service.js](/Users/oivindlund/date-night-app/server/services/travel.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### wallet.service.js

**File**: [server/services/wallet.service.js](/Users/oivindlund/date-night-app/server/services/wallet.service.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SUPPORTED_CURRENCIES | List of supported fiat currencies | ['NOK', 'USD', 'EUR', 'GBP'] | All |
| SUPPORTED_CRYPTOCURRENCIES | List of supported cryptocurrencies | ['BTC', 'ETH', 'USDT', 'USDC'] | All |
| MINIMUM_WITHDRAWAL | Minimum withdrawal amount in smallest currency unit | 10000 = 100 NOK | All |
| WITHDRAWAL_FEE_PERCENTAGE | Fee percentage for withdrawals | 2.5 | All |
| CRYPTO_WITHDRAWAL_FEE | Fixed fee for crypto withdrawals in smallest currency unit | 5000 = 50 NOK | All |

## UI Components

### ad-card.component.ts

**File**: [client-angular/src/app/shared/components/ad-card/ad-card.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/ad-card/ad-card.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### debug-info.component.ts

**File**: [client-angular/src/app/shared/components/debug-info/debug-info.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/debug-info/debug-info.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### error-message.component.ts

**File**: [client-angular/src/app/shared/components/error-message/error-message.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/error-message/error-message.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### image-gallery.component.ts

**File**: [client-angular/src/app/shared/components/image-gallery/image-gallery.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/image-gallery/image-gallery.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### loading-spinner.component.ts

**File**: [client-angular/src/app/shared/components/loading-spinner/loading-spinner.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/loading-spinner/loading-spinner.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### main-layout.component.ts

**File**: [client-angular/src/app/shared/components/main-layout/main-layout.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/main-layout/main-layout.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### notification.component.spec.ts

**File**: [client-angular/src/app/shared/components/notification/notification.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/notification/notification.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_NOTIFICATION_SERVICE | Mock notification service configuration | N/A | All |

### notification.component.ts

**File**: [client-angular/src/app/shared/components/notification/notification.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/notification/notification.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### optimized-image.component.ts

**File**: [client-angular/src/app/shared/components/optimized-image/optimized-image.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/components/optimized-image/optimized-image.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### app-card.component.spec.ts

**File**: [client-angular/src/app/shared/emerald/app-card/app-card.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/app-card/app-card.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_ITEM | Mock item data for testing | N/A | Test |

### app-card.component.ts

**File**: [client-angular/src/app/shared/emerald/app-card/app-card.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/app-card/app-card.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### card-grid.component.spec.ts

**File**: [client-angular/src/app/shared/emerald/card-grid/card-grid.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/card-grid/card-grid.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_ITEMS | Mock items data for testing | N/A | Test |

### card-grid.component.ts

**File**: [client-angular/src/app/shared/emerald/card-grid/card-grid.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/card-grid/card-grid.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### app-card.component.spec.ts

**File**: [client-angular/src/app/shared/emerald/components/app-card/app-card.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/app-card/app-card.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MOCK_AD | Mock ad data for testing | N/A | Test |

### app-card.component.ts

**File**: [client-angular/src/app/shared/emerald/components/app-card/app-card.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/app-card/app-card.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### app-card.component.unit.spec.ts

**File**: [client-angular/src/app/shared/emerald/components/app-card/app-card.component.unit.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/app-card/app-card.component.unit.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### avatar.component.ts

**File**: [client-angular/src/app/shared/emerald/components/avatar/avatar.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/avatar/avatar.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### card-grid.component.spec.ts

**File**: [client-angular/src/app/shared/emerald/components/card-grid/card-grid.component.spec.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/card-grid/card-grid.component.spec.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### card-grid.component.ts

**File**: [client-angular/src/app/shared/emerald/components/card-grid/card-grid.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/card-grid/card-grid.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| GRID_GAP | Gap between grid items in pixels | 16 | All |
| GRID_COLUMNS | Number of columns in the grid | responsive | All |

### carousel.component.ts

**File**: [client-angular/src/app/shared/emerald/components/carousel/carousel.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/carousel/carousel.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### floating-action-button.component.ts

**File**: [client-angular/src/app/shared/emerald/components/floating-action-button/floating-action-button.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/floating-action-button/floating-action-button.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| BUTTON_SIZE | Size of the button in pixels | varies by size prop | All |
| ANIMATION_DURATION | Duration of animations in milliseconds | 300 | All |

### label.component.ts

**File**: [client-angular/src/app/shared/emerald/components/label/label.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/label/label.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### page-header.component.ts

**File**: [client-angular/src/app/shared/emerald/components/page-header/page-header.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/page-header/page-header.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### pager.component.ts

**File**: [client-angular/src/app/shared/emerald/components/pager/pager.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/pager/pager.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| MAX_VISIBLE_PAGES | Maximum number of page buttons to show | 5 | All |
| SHOW_FIRST_LAST | Whether to show first/last page buttons | true | All |

### skeleton-loader.component.ts

**File**: [client-angular/src/app/shared/emerald/components/skeleton-loader/skeleton-loader.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/skeleton-loader/skeleton-loader.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### toggle.component.ts

**File**: [client-angular/src/app/shared/emerald/components/toggle/toggle.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/components/toggle/toggle.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### emerald.module.ts

**File**: [client-angular/src/app/shared/emerald/emerald.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/emerald.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| NOTIFICATION_DURATION | Duration for notifications in milliseconds | 3000 | All |

### tinder-card.component.ts

**File**: [client-angular/src/app/shared/emerald/tinder-card/tinder-card.component.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/emerald/tinder-card/tinder-card.component.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

### material.module.ts

**File**: [client-angular/src/app/shared/material.module.ts](/Users/oivindlund/date-night-app/client-angular/src/app/shared/material.module.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| SETTING_NAME | Description of setting | value | All |

---

*This index was automatically generated on 2025-04-16 08:50:02. Do not edit manually.*

<!-- TODO: Manually verify scripts/update_config_index.py and run it. Add CI check. (as per DOCS_IMPROVEMENT_PLAN.md) -->
