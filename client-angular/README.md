# DateNight.io Angular Frontend

This is the main frontend application for DateNight.io, built with Angular 19.2.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4200`.

## Project Structure

```
src/
├── app/
│   ├── core/           # Singleton services and guards
│   ├── shared/        # Shared components and pipes
│   └── features/      # Feature modules
├── assets/           # Static files
└── environments/     # Environment configurations
```

## Key Features
- Multiple browsing interfaces (Grid, Tinder-style, Netflix-style)
- Real-time chat with Socket.IO
- JWT authentication with refresh tokens
- Lazy-loaded feature modules
- Comprehensive TypeScript types

## Testing

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Building for Production

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


<!-- TODO: Enhance with detailed setup, build, test, run instructions, env vars (as per DOCS_IMPROVEMENT_PLAN.md) -->
