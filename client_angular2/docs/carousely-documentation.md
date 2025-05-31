# Carousely PWA Project Documentation

## Overview

Carousely is a Tinder-like carousel component implemented as a Progressive Web Application (PWA) in Next.js. The carousel displays advertiser cards in a 3D wheel-style interface, allowing users to navigate through profiles by swiping left/right or flicking up (like in Tinder).

## Architecture

### Frontend Framework
- **Next.js** with React 18 for server components and client-side interactions
- **TypeScript** for type safety and better developer experience
- **TailwindCSS** for responsive styling

### Key Components

1. **`CarouselWheel`**: The core UI component that implements the 3D wheel rotation and card swiping functionality.
2. **`BlurImage`**: Progressive image loading component with blur-up effect.
3. **`Swiper`**: Touch/drag gesture handler for smooth swiping actions.
4. **`PWAService`**: Service manager for PWA features like service worker registration.
5. **`Image Optimization API`**: Server-side API for image compression and format conversion.

### PWA Features

- **Service Worker**: Handles offline caching and background operations
- **Web App Manifest**: Enables "Add to Home Screen" functionality
- **Offline Support**: Fallback page and cached content for offline use
- **Geolocation**: Integration for location-based matching
- **Push Notifications**: User engagement through match notifications

## Implementation Details

### Carousel Implementation

The carousel is implemented as a 3D wheel using CSS 3D transforms. Key features:

- **3D Positioning**: Cards are placed around a virtual wheel in 3D space
- **Dynamic Card Visibility**: Only cards in the visible arc are rendered
- **Performance Optimization**: Lazy loading and visibility calculations
- **Smooth Animations**: Framer Motion for fluid transitions

### Image Processing

Images are optimized through a multi-stage process:

1. **Server-side Optimization**: Resizing, compression, and format conversion
2. **Blurhash Placeholders**: Low-resolution previews while loading
3. **Progressive Loading**: Blur-up effect for smooth transitions
4. **Lazy Loading**: Only load images when cards become visible

### PWA Integration

The PWA implementation follows best practices for offline support:

1. **Service Worker Registration**: Handled in the PWA service
2. **Caching Strategies**:
   - Network-first for fresh data
   - Cache-first for static assets
   - Stale-while-revalidate for balance
3. **Local Storage**: For offline data persistence
4. **Installation Prompt**: Custom UI for app installation

## Data Flow

```
┌─────────────────┐     ┌────────────────┐     ┌────────────────────┐
│                 │     │                │     │                    │
│  CarouselyPage  │─────►  CarouselWheel  │─────►  Data Persistence  │
│                 │     │                │     │                    │
└─────────────────┘     └────────────────┘     └────────────────────┘
        │                       │                      │
        ▼                       ▼                      ▼
┌─────────────────┐     ┌────────────────┐     ┌────────────────────┐
│                 │     │                │     │                    │
│ PWA Service     │     │ Swipe Actions  │     │ Local Storage      │
│                 │     │                │     │                    │
└─────────────────┘     └────────────────┘     └────────────────────┘
        │                       │                      │
        ▼                       ▼                      ▼
┌─────────────────┐     ┌────────────────┐     ┌────────────────────┐
│                 │     │                │     │                    │
│ Service Worker  │     │ Notifications  │     │ Offline Support    │
│                 │     │                │     │                    │
└─────────────────┘     └────────────────┘     └────────────────────┘
```

## Performance Considerations

The carousel is optimized for performance in several ways:

1. **Wheel Visibility Algorithm**:
   - Only visible cards (±90° from front) are rendered
   - Cards update position on wheel rotation

2. **Image Optimization**:
   - Server-side image processing reduces size by ~70%
   - Dynamic quality based on card position
   - Blurhash placeholders for instant loading feedback

3. **Animation Performance**:
   - Hardware-accelerated transforms
   - Throttled event handlers
   - Optimized render cycles

4. **Memory Management**:
   - Cleanup of off-screen content
   - Limited concurrent image loading
   - Garbage collection hints

## Testing Strategy

1. **Component Tests**:
   - Unit tests for individual components
   - Integration tests for carousel behavior

2. **Performance Tests**:
   - Lighthouse benchmarks for PWA compliance
   - Frame rate monitoring during interactions
   - Memory usage profiling

3. **Compatibility Tests**:
   - Cross-browser testing
   - Device-specific tests for touch gestures
   - Varied network condition testing

## Future Roadmap

1. **Q3 2025**:
   - Implement advanced matching algorithm
   - Add chat functionality for matches
   - Improve offline experience with better sync

2. **Q4 2025**:
   - Implement WebGL acceleration for smoother animations
   - Add AR features for enhanced profiles
   - Integrate with payment gateway for premium features

3. **Q1 2026**:
   - Machine learning for personalized recommendations
   - Enhanced analytics and user insights
   - Expanded PWA capabilities with newer web standards

## References

- [Next.js PWA Documentation](https://nextjs.org/docs)
- [Progressive Web Apps (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web App Manifest (W3C)](https://www.w3.org/TR/appmanifest/)
- [Service Workers API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
