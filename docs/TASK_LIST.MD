# DateNight.io Implementation Task List

## Phase 2: Enhanced Features (Current Focus)

- A. Travel Itinerary Management

  - [x] Data Model & API
    - [x] Define TravelItinerary schema (destinations, dates, user link)
    - [x] Define TravelPlanItem sub-schema
    - [x] Add 2dsphere indices for geo-queries
    - [x] CRUD endpoints (Create/Read/Update/Delete)
    - [x] Validation middleware (Joi/express-validator)
  - [ ] Frontend UX
    - [x] “My Itineraries” list & detail pages
    - [x] Create/edit form (location, date, notes)
    - [ ] Map view enhancement (Leaflet/Google Maps)
    - [ ] Calendar widget integration
  - [ ] Location-Based Matching
    - [x] “Nearby touring advertisers” API endpoint
    - [x] Radius filter in ad browse
    - [ ] Notification banner when matches found

- B. Enhanced Chat System

  - [ ] End-to-End Encryption (E2EE)
    - [ ] Pick & integrate library (Olm/OpenPGP.js)
    - [ ] Key management (generate, store, rotate per room)
    - [ ] Encrypt/decrypt payloads in ChatService
    - [ ] Graceful fallback if unsupported
  - [ ] Message Auto-Deletion
    - [ ] Extend chat-settings API to store TTL per room
    - [ ] UI in ChatSettings to toggle & set TTL
    - [ ] Server purge job (cron/Mongo TTL)
  - [ ] Advanced Chat Features
    - [ ] Typing indicators
    - [ ] Read receipts (backend flag + UI)
    - [ ] File/image gallery preview
    - [ ] Emoji reactions picker

- C. User Interaction Features
  - [ ] Favorites System
    - [ ] Favorites schema & endpoints
    - [ ] “Add to Favorites” button on ads/users
    - [ ] Favorites list & remove UI
  - [ ] Reviews & Ratings
    - [ ] Review schema & moderation flag
    - [ ] Submit review form under profiles/ads
    - [ ] Star-rating component & aggregates
  - [ ] Enhanced Profiles
    - [ ] Add bio, socials, skills fields
    - [ ] Profile completion meter
    - [ ] Verification badges (email/ID)

## Phase 3: Monetization (Next Up)

- A. Premium Ad Features

  - [ ] Tiered placement packages (bronze/silver/gold)
  - [ ] Index by tier & adjust sort weighting
  - [ ] Admin analytics (CTR, views, spend)

- B. Camshow Integration

  - [ ] WebRTC infra (Janus/mediasoup)
  - [ ] Token/currency model & Stripe/PayPal hooks
  - [ ] Live tipping UI overlays
  - [ ] Private-show booking & payment

- C. Subscription Model
  - [ ] Creator profiles & pay-walls
  - [ ] Stripe subscriptions & webhooks
  - [ ] Pay-per-view content & DRM

## Phase 4: Optimization & Scaling

- A. Performance

  - [ ] Frontend code-splitting & lazy loading
  - [ ] Backend query profiling & Redis cache
  - [ ] Socket back-pressure & clustering

- B. Security

  - [ ] Third-party audit (Snyk/OWASP)
  - [ ] Multi-factor authentication (TOTP/SMS)
  - [ ] Anomaly detection & alerts

- C. Analytics & Monitoring
  - [ ] User behavior (GA/Mixpanel)
  - [ ] API metrics (Prometheus/Grafana)
  - [ ] Error tracking (Sentry)

## Phase 5: Mobile App

- A. Planning

  - [ ] Wireframes for core flows (browse, chat, profile)
  - [ ] Framework selection (React Native/Ionic/NativeScript)
  - [ ] Define API surface & token auth

- B. Implementation
  - [ ] Scaffold mobile project
  - [ ] Implement login, ad browse, chat, notifications
  - [ ] Ensure UI parity & responsive design

## Ongoing Tasks

- [ ] **Documentation**

  - Keep technical documentation up to date
  - Create user guides and help content
  - Document API endpoints

- [ ] **Testing**

  - Write unit tests for all components
  - Implement integration tests
  - Conduct regular security testing

- [ ] **Code Quality**
  - Maintain consistent coding standards
  - Conduct regular code reviews
  - Refactor code as needed
