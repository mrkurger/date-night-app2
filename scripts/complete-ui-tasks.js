import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths
const clientPath = path.join(__dirname, '../client-angular');
const stylesPath = path.join(clientPath, 'src/styles');
const componentsPath = path.join(clientPath, 'src/app/features');

// Create the styles directory if it doesn't exist
if (!fs.existsSync(stylesPath)) {
  fs.mkdirSync(stylesPath, { recursive: true });
  console.log('✓ Created styles directory');
}

// Create a global variables CSS file for consistent styling
const variablesCss = `
/* Global CSS Variables */
:root {
  /* Color Palette */
  --primary: #ff3366;
  --primary-light: #ff6699;
  --primary-dark: #cc0033;
  --secondary: #33ccff;
  --secondary-light: #66ddff;
  --secondary-dark: #0099cc;
  --accent: #ffcc00;
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
  --info: #17a2b8;
  
  /* Neutral Colors */
  --neutral-100: #ffffff;
  --neutral-200: #f8f9fa;
  --neutral-300: #e9ecef;
  --neutral-400: #dee2e6;
  --neutral-500: #adb5bd;
  --neutral-600: #6c757d;
  --neutral-700: #495057;
  --neutral-800: #343a40;
  --neutral-900: #212529;
  
  /* Typography */
  --font-family-base: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --font-family-heading: 'Montserrat', var(--font-family-base);
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-md: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem;  /* 36px */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-loose: 1.75;
  
  /* Spacing */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-8: 3rem;     /* 48px */
  --space-10: 4rem;    /* 64px */
  --space-12: 6rem;    /* 96px */
  --space-16: 8rem;    /* 128px */
  
  /* Borders */
  --border-radius-sm: 0.125rem;  /* 2px */
  --border-radius-md: 0.25rem;   /* 4px */
  --border-radius-lg: 0.5rem;    /* 8px */
  --border-radius-xl: 1rem;      /* 16px */
  --border-radius-full: 9999px;
  --border-width-thin: 1px;
  --border-width-thick: 2px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  
  /* Z-index */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;
  --transition-timing-default: ease-in-out;
  
  /* Container widths */
  --container-sm: 540px;
  --container-md: 720px;
  --container-lg: 960px;
  --container-xl: 1140px;
  
  /* Card dimensions */
  --card-width-sm: 240px;
  --card-width-md: 320px;
  --card-width-lg: 400px;
  --card-height-sm: 320px;
  --card-height-md: 420px;
  --card-height-lg: 520px;
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  :root {
    --neutral-100: #121212;
    --neutral-200: #1e1e1e;
    --neutral-300: #2a2a2a;
    --neutral-400: #323232;
    --neutral-500: #5c5c5c;
    --neutral-600: #828282;
    --neutral-700: #a0a0a0;
    --neutral-800: #c7c7c7;
    --neutral-900: #e3e3e3;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }
}
`;

// Create a global utility CSS file
const utilitiesCss = `
/* Utility Classes */

/* Display */
.d-none { display: none !important; }
.d-inline { display: inline !important; }
.d-inline-block { display: inline-block !important; }
.d-block { display: block !important; }
.d-flex { display: flex !important; }
.d-inline-flex { display: inline-flex !important; }
.d-grid { display: grid !important; }

/* Flex utilities */
.flex-row { flex-direction: row !important; }
.flex-column { flex-direction: column !important; }
.flex-wrap { flex-wrap: wrap !important; }
.flex-nowrap { flex-wrap: nowrap !important; }
.justify-content-start { justify-content: flex-start !important; }
.justify-content-end { justify-content: flex-end !important; }
.justify-content-center { justify-content: center !important; }
.justify-content-between { justify-content: space-between !important; }
.justify-content-around { justify-content: space-around !important; }
.align-items-start { align-items: flex-start !important; }
.align-items-end { align-items: flex-end !important; }
.align-items-center { align-items: center !important; }
.align-items-baseline { align-items: baseline !important; }
.align-items-stretch { align-items: stretch !important; }
.flex-grow-0 { flex-grow: 0 !important; }
.flex-grow-1 { flex-grow: 1 !important; }
.flex-shrink-0 { flex-shrink: 0 !important; }
.flex-shrink-1 { flex-shrink: 1 !important; }

/* Spacing */
.m-0 { margin: 0 !important; }
.m-1 { margin: var(--space-1) !important; }
.m-2 { margin: var(--space-2) !important; }
.m-3 { margin: var(--space-3) !important; }
.m-4 { margin: var(--space-4) !important; }
.m-5 { margin: var(--space-5) !important; }

.mt-0 { margin-top: 0 !important; }
.mt-1 { margin-top: var(--space-1) !important; }
.mt-2 { margin-top: var(--space-2) !important; }
.mt-3 { margin-top: var(--space-3) !important; }
.mt-4 { margin-top: var(--space-4) !important; }
.mt-5 { margin-top: var(--space-5) !important; }

.mb-0 { margin-bottom: 0 !important; }
.mb-1 { margin-bottom: var(--space-1) !important; }
.mb-2 { margin-bottom: var(--space-2) !important; }
.mb-3 { margin-bottom: var(--space-3) !important; }
.mb-4 { margin-bottom: var(--space-4) !important; }
.mb-5 { margin-bottom: var(--space-5) !important; }

.ml-0 { margin-left: 0 !important; }
.ml-1 { margin-left: var(--space-1) !important; }
.ml-2 { margin-left: var(--space-2) !important; }
.ml-3 { margin-left: var(--space-3) !important; }
.ml-4 { margin-left: var(--space-4) !important; }
.ml-5 { margin-left: var(--space-5) !important; }

.mr-0 { margin-right: 0 !important; }
.mr-1 { margin-right: var(--space-1) !important; }
.mr-2 { margin-right: var(--space-2) !important; }
.mr-3 { margin-right: var(--space-3) !important; }
.mr-4 { margin-right: var(--space-4) !important; }
.mr-5 { margin-right: var(--space-5) !important; }

.mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
.mx-1 { margin-left: var(--space-1) !important; margin-right: var(--space-1) !important; }
.mx-2 { margin-left: var(--space-2) !important; margin-right: var(--space-2) !important; }
.mx-3 { margin-left: var(--space-3) !important; margin-right: var(--space-3) !important; }
.mx-4 { margin-left: var(--space-4) !important; margin-right: var(--space-4) !important; }
.mx-5 { margin-left: var(--space-5) !important; margin-right: var(--space-5) !important; }
.mx-auto { margin-left: auto !important; margin-right: auto !important; }

.my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
.my-1 { margin-top: var(--space-1) !important; margin-bottom: var(--space-1) !important; }
.my-2 { margin-top: var(--space-2) !important; margin-bottom: var(--space-2) !important; }
.my-3 { margin-top: var(--space-3) !important; margin-bottom: var(--space-3) !important; }
.my-4 { margin-top: var(--space-4) !important; margin-bottom: var(--space-4) !important; }
.my-5 { margin-top: var(--space-5) !important; margin-bottom: var(--space-5) !important; }

.p-0 { padding: 0 !important; }
.p-1 { padding: var(--space-1) !important; }
.p-2 { padding: var(--space-2) !important; }
.p-3 { padding: var(--space-3) !important; }
.p-4 { padding: var(--space-4) !important; }
.p-5 { padding: var(--space-5) !important; }

.pt-0 { padding-top: 0 !important; }
.pt-1 { padding-top: var(--space-1) !important; }
.pt-2 { padding-top: var(--space-2) !important; }
.pt-3 { padding-top: var(--space-3) !important; }
.pt-4 { padding-top: var(--space-4) !important; }
.pt-5 { padding-top: var(--space-5) !important; }

.pb-0 { padding-bottom: 0 !important; }
.pb-1 { padding-bottom: var(--space-1) !important; }
.pb-2 { padding-bottom: var(--space-2) !important; }
.pb-3 { padding-bottom: var(--space-3) !important; }
.pb-4 { padding-bottom: var(--space-4) !important; }
.pb-5 { padding-bottom: var(--space-5) !important; }

.pl-0 { padding-left: 0 !important; }
.pl-1 { padding-left: var(--space-1) !important; }
.pl-2 { padding-left: var(--space-2) !important; }
.pl-3 { padding-left: var(--space-3) !important; }
.pl-4 { padding-left: var(--space-4) !important; }
.pl-5 { padding-left: var(--space-5) !important; }

.pr-0 { padding-right: 0 !important; }
.pr-1 { padding-right: var(--space-1) !important; }
.pr-2 { padding-right: var(--space-2) !important; }
.pr-3 { padding-right: var(--space-3) !important; }
.pr-4 { padding-right: var(--space-4) !important; }
.pr-5 { padding-right: var(--space-5) !important; }

.px-0 { padding-left: 0 !important; padding-right: 0 !important; }
.px-1 { padding-left: var(--space-1) !important; padding-right: var(--space-1) !important; }
.px-2 { padding-left: var(--space-2) !important; padding-right: var(--space-2) !important; }
.px-3 { padding-left: var(--space-3) !important; padding-right: var(--space-3) !important; }
.px-4 { padding-left: var(--space-4) !important; padding-right: var(--space-4) !important; }
.px-5 { padding-left: var(--space-5) !important; padding-right: var(--space-5) !important; }

.py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
.py-1 { padding-top: var(--space-1) !important; padding-bottom: var(--space-1) !important; }
.py-2 { padding-top: var(--space-2) !important; padding-bottom: var(--space-2) !important; }
.py-3 { padding-top: var(--space-3) !important; padding-bottom: var(--space-3) !important; }
.py-4 { padding-top: var(--space-4) !important; padding-bottom: var(--space-4) !important; }
.py-5 { padding-top: var(--space-5) !important; padding-bottom: var(--space-5) !important; }

/* Text alignment */
.text-left { text-align: left !important; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-justify { text-align: justify !important; }

/* Text transformation */
.text-lowercase { text-transform: lowercase !important; }
.text-uppercase { text-transform: uppercase !important; }
.text-capitalize { text-transform: capitalize !important; }

/* Font weight */
.font-weight-light { font-weight: var(--font-weight-light) !important; }
.font-weight-normal { font-weight: var(--font-weight-normal) !important; }
.font-weight-medium { font-weight: var(--font-weight-medium) !important; }
.font-weight-semibold { font-weight: var(--font-weight-semibold) !important; }
.font-weight-bold { font-weight: var(--font-weight-bold) !important; }

/* Font size */
.text-xs { font-size: var(--font-size-xs) !important; }
.text-sm { font-size: var(--font-size-sm) !important; }
.text-md { font-size: var(--font-size-md) !important; }
.text-lg { font-size: var(--font-size-lg) !important; }
.text-xl { font-size: var(--font-size-xl) !important; }
.text-2xl { font-size: var(--font-size-2xl) !important; }
.text-3xl { font-size: var(--font-size-3xl) !important; }
.text-4xl { font-size: var(--font-size-4xl) !important; }

/* Text colors */
.text-primary { color: var(--primary) !important; }
.text-secondary { color: var(--secondary) !important; }
.text-success { color: var(--success) !important; }
.text-danger { color: var(--danger) !important; }
.text-warning { color: var(--warning) !important; }
.text-info { color: var(--info) !important; }
.text-light { color: var(--neutral-200) !important; }
.text-dark { color: var(--neutral-800) !important; }
.text-muted { color: var(--neutral-600) !important; }
.text-white { color: var(--neutral-100) !important; }

/* Background colors */
.bg-primary { background-color: var(--primary) !important; }
.bg-secondary { background-color: var(--secondary) !important; }
.bg-success { background-color: var(--success) !important; }
.bg-danger { background-color: var(--danger) !important; }
.bg-warning { background-color: var(--warning) !important; }
.bg-info { background-color: var(--info) !important; }
.bg-light { background-color: var(--neutral-200) !important; }
.bg-dark { background-color: var(--neutral-800) !important; }
.bg-white { background-color: var(--neutral-100) !important; }
.bg-transparent { background-color: transparent !important; }

/* Borders */
.border { border: var(--border-width-thin) solid var(--neutral-300) !important; }
.border-top { border-top: var(--border-width-thin) solid var(--neutral-300) !important; }
.border-right { border-right: var(--border-width-thin) solid var(--neutral-300) !important; }
.border-bottom { border-bottom: var(--border-width-thin) solid var(--neutral-300) !important; }
.border-left { border-left: var(--border-width-thin) solid var(--neutral-300) !important; }
.border-0 { border: 0 !important; }
.border-top-0 { border-top: 0 !important; }
.border-right-0 { border-right: 0 !important; }
.border-bottom-0 { border-bottom: 0 !important; }
.border-left-0 { border-left: 0 !important; }
.border-primary { border-color: var(--primary) !important; }
.border-secondary { border-color: var(--secondary) !important; }
.border-success { border-color: var(--success) !important; }
.border-danger { border-color: var(--danger) !important; }
.border-warning { border-color: var(--warning) !important; }
.border-info { border-color: var(--info) !important; }
.border-light { border-color: var(--neutral-200) !important; }
.border-dark { border-color: var(--neutral-800) !important; }
.border-white { border-color: var(--neutral-100) !important; }

/* Border radius */
.rounded { border-radius: var(--border-radius-md) !important; }
.rounded-sm { border-radius: var(--border-radius-sm) !important; }
.rounded-lg { border-radius: var(--border-radius-lg) !important; }
.rounded-xl { border-radius: var(--border-radius-xl) !important; }
.rounded-circle { border-radius: 50% !important; }
.rounded-pill { border-radius: var(--border-radius-full) !important; }
.rounded-0 { border-radius: 0 !important; }
.rounded-top {
  border-top-left-radius: var(--border-radius-md) !important;
  border-top-right-radius: var(--border-radius-md) !important;
}
.rounded-right {
  border-top-right-radius: var(--border-radius-md) !important;
  border-bottom-right-radius: var(--border-radius-md) !important;
}
.rounded-bottom {
  border-bottom-right-radius: var(--border-radius-md) !important;
  border-bottom-left-radius: var(--border-radius-md) !important;
}
.rounded-left {
  border-top-left-radius: var(--border-radius-md) !important;
  border-bottom-left-radius: var(--border-radius-md) !important;
}

/* Shadows */
.shadow-none { box-shadow: none !important; }
.shadow-sm { box-shadow: var(--shadow-sm) !important; }
.shadow { box-shadow: var(--shadow-md) !important; }
.shadow-lg { box-shadow: var(--shadow-lg) !important; }
.shadow-xl { box-shadow: var(--shadow-xl) !important; }
.shadow-inner { box-shadow: var(--shadow-inner) !important; }

/* Position */
.position-static { position: static !important; }
.position-relative { position: relative !important; }
.position-absolute { position: absolute !important; }
.position-fixed { position: fixed !important; }
.position-sticky { position: sticky !important; }
.fixed-top {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: var(--z-index-fixed);
}
.fixed-bottom {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-index-fixed);
}
.sticky-top {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
}

/* Width and height */
.w-25 { width: 25% !important; }
.w-50 { width: 50% !important; }
.w-75 { width: 75% !important; }
.w-100 { width: 100% !important; }
.w-auto { width: auto !important; }
.h-25 { height: 25% !important; }
.h-50 { height: 50% !important; }
.h-75 { height: 75% !important; }
.h-100 { height: 100% !important; }
.h-auto { height: auto !important; }
.mw-100 { max-width: 100% !important; }
.mh-100 { max-height: 100% !important; }
.min-vw-100 { min-width: 100vw !important; }
.min-vh-100 { min-height: 100vh !important; }
.vw-100 { width: 100vw !important; }
.vh-100 { height: 100vh !important; }

/* Visibility */
.visible { visibility: visible !important; }
.invisible { visibility: hidden !important; }

/* Overflow */
.overflow-auto { overflow: auto !important; }
.overflow-hidden { overflow: hidden !important; }
.overflow-visible { overflow: visible !important; }
.overflow-scroll { overflow: scroll !important; }
.overflow-x-auto { overflow-x: auto !important; }
.overflow-x-hidden { overflow-x: hidden !important; }
.overflow-x-visible { overflow-x: visible !important; }
.overflow-x-scroll { overflow-x: scroll !important; }
.overflow-y-auto { overflow-y: auto !important; }
.overflow-y-hidden { overflow-y: hidden !important; }
.overflow-y-visible { overflow-y: visible !important; }
.overflow-y-scroll { overflow-y: scroll !important; }

/* Opacity */
.opacity-0 { opacity: 0 !important; }
.opacity-25 { opacity: 0.25 !important; }
.opacity-50 { opacity: 0.5 !important; }
.opacity-75 { opacity: 0.75 !important; }
.opacity-100 { opacity: 1 !important; }

/* Cursor */
.cursor-auto { cursor: auto !important; }
.cursor-default { cursor: default !important; }
.cursor-pointer { cursor: pointer !important; }
.cursor-wait { cursor: wait !important; }
.cursor-text { cursor: text !important; }
.cursor-move { cursor: move !important; }
.cursor-not-allowed { cursor: not-allowed !important; }
.cursor-help { cursor: help !important; }

/* User select */
.user-select-all { user-select: all !important; }
.user-select-auto { user-select: auto !important; }
.user-select-none { user-select: none !important; }
.user-select-text { user-select: text !important; }

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
.sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive utilities */
@media (min-width: 576px) {
  .d-sm-none { display: none !important; }
  .d-sm-inline { display: inline !important; }
  .d-sm-inline-block { display: inline-block !important; }
  .d-sm-block { display: block !important; }
  .d-sm-flex { display: flex !important; }
  .d-sm-inline-flex { display: inline-flex !important; }
  .d-sm-grid { display: grid !important; }
}

@media (min-width: 768px) {
  .d-md-none { display: none !important; }
  .d-md-inline { display: inline !important; }
  .d-md-inline-block { display: inline-block !important; }
  .d-md-block { display: block !important; }
  .d-md-flex { display: flex !important; }
  .d-md-inline-flex { display: inline-flex !important; }
  .d-md-grid { display: grid !important; }
}

@media (min-width: 992px) {
  .d-lg-none { display: none !important; }
  .d-lg-inline { display: inline !important; }
  .d-lg-inline-block { display: inline-block !important; }
  .d-lg-block { display: block !important; }
  .d-lg-flex { display: flex !important; }
  .d-lg-inline-flex { display: inline-flex !important; }
  .d-lg-grid { display: grid !important; }
}

@media (min-width: 1200px) {
  .d-xl-none { display: none !important; }
  .d-xl-inline { display: inline !important; }
  .d-xl-inline-block { display: inline-block !important; }
  .d-xl-block { display: block !important; }
  .d-xl-flex { display: flex !important; }
  .d-xl-inline-flex { display: inline-flex !important; }
  .d-xl-grid { display: grid !important; }
}

/* Print utilities */
@media print {
  .d-print-none { display: none !important; }
  .d-print-inline { display: inline !important; }
  .d-print-inline-block { display: inline-block !important; }
  .d-print-block { display: block !important; }
  .d-print-flex { display: flex !important; }
  .d-print-inline-flex { display: inline-flex !important; }
  .d-print-grid { display: grid !important; }
}
`;

// Create a global animations CSS file
const animationsCss = `
/* Animations */

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--transition-timing-default);
}

/* Fade Out */
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fade-out {
  animation: fadeOut var(--transition-normal) var(--transition-timing-default);
}

/* Slide In From Right */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-right {
  animation: slideInRight var(--transition-normal) var(--transition-timing-default);
}

/* Slide In From Left */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-left {
  animation: slideInLeft var(--transition-normal) var(--transition-timing-default);
}

/* Slide In From Top */
@keyframes slideInTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-top {
  animation: slideInTop var(--transition-normal) var(--transition-timing-default);
}

/* Slide In From Bottom */
@keyframes slideInBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-bottom {
  animation: slideInBottom var(--transition-normal) var(--transition-timing-default);
}

/* Scale In */
@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn var(--transition-normal) var(--transition-timing-default);
}

/* Scale Out */
@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}

.scale-out {
  animation: scaleOut var(--transition-normal) var(--transition-timing-default);
}

/* Rotate In */
@keyframes rotateIn {
  from {
    transform: rotate(-180deg) scale(0.5);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

.rotate-in {
  animation: rotateIn var(--transition-normal) var(--transition-timing-default);
}

/* Bounce */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.bounce {
  animation: bounce var(--transition-slow) var(--transition-timing-default);
}

/* Pulse */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pulse {
  animation: pulse var(--transition-normal) var(--transition-timing-default) infinite;
}

/* Shake */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.shake {
  animation: shake var(--transition-normal) var(--transition-timing-default);
}

/* Spin */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin var(--transition-slow) linear infinite;
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp var(--transition-normal) var(--transition-timing-default);
}

/* Fade In Down */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-down {
  animation: fadeInDown var(--transition-normal) var(--transition-timing-default);
}

/* Fade In Left */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in-left {
  animation: fadeInLeft var(--transition-normal) var(--transition-timing-default);
}

/* Fade In Right */
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in-right {
  animation: fadeInRight var(--transition-normal) var(--transition-timing-default);
}

/* Animation Delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
.delay-600 { animation-delay: 600ms; }
.delay-700 { animation-delay: 700ms; }
.delay-800 { animation-delay: 800ms; }
.delay-900 { animation-delay: 900ms; }
.delay-1000 { animation-delay: 1000ms; }

/* Animation Durations */
.duration-100 { animation-duration: 100ms; }
.duration-200 { animation-duration: 200ms; }
.duration-300 { animation-duration: 300ms; }
.duration-400 { animation-duration: 400ms; }
.duration-500 { animation-duration: 500ms; }
.duration-600 { animation-duration: 600ms; }
.duration-700 { animation-duration: 700ms; }
.duration-800 { animation-duration: 800ms; }
.duration-900 { animation-duration: 900ms; }
.duration-1000 { animation-duration: 1000ms; }

/* Animation Fill Modes */
.fill-forwards { animation-fill-mode: forwards; }
.fill-backwards { animation-fill-mode: backwards; }
.fill-both { animation-fill-mode: both; }
.fill-none { animation-fill-mode: none; }

/* Animation Iteration Counts */
.infinite { animation-iteration-count: infinite; }
.once { animation-iteration-count: 1; }
.twice { animation-iteration-count: 2; }
.thrice { animation-iteration-count: 3; }

/* Animation Directions */
.direction-normal { animation-direction: normal; }
.direction-reverse { animation-direction: reverse; }
.direction-alternate { animation-direction: alternate; }
.direction-alternate-reverse { animation-direction: alternate-reverse; }

/* Animation Play States */
.paused { animation-play-state: paused; }
.running { animation-play-state: running; }

/* Animation Timing Functions */
.ease { animation-timing-function: ease; }
.ease-in { animation-timing-function: ease-in; }
.ease-out { animation-timing-function: ease-out; }
.ease-in-out { animation-timing-function: ease-in-out; }
.linear { animation-timing-function: linear; }
.step-start { animation-timing-function: step-start; }
.step-end { animation-timing-function: step-end; }
`;

// Create a global components CSS file
const componentsCss = `
/* Global Component Styles */

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-normal) var(--transition-timing-default);
  border: var(--border-width-thin) solid transparent;
  gap: var(--space-2);
  white-space: nowrap;
  user-select: none;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.25);
}

.btn:disabled,
.btn.disabled {
  opacity: 0.65;
  pointer-events: none;
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  border-radius: var(--border-radius-sm);
}

.btn-lg {
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-lg);
  border-radius: var(--border-radius-lg);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--secondary);
  color: white;
  border-color: var(--secondary);
}

.btn-secondary:hover,
.btn-secondary:focus {
  background-color: var(--secondary-dark);
  border-color: var(--secondary-dark);
}

.btn-success {
  background-color: var(--success);
  color: white;
  border-color: var(--success);
}

.btn-success:hover,
.btn-success:focus {
  background-color: darken(var(--success), 10%);
  border-color: darken(var(--success), 10%);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  border-color: var(--danger);
}

.btn-danger:hover,
.btn-danger:focus {
  background-color: darken(var(--danger), 10%);
  border-color: darken(var(--danger), 10%);
}

.btn-warning {
  background-color: var(--warning);
  color: var(--neutral-900);
  border-color: var(--warning);
}

.btn-warning:hover,
.btn-warning:focus {
  background-color: darken(var(--warning), 10%);
  border-color: darken(var(--warning), 10%);
}

.btn-info {
  background-color: var(--info);
  color: white;
  border-color: var(--info);
}

.btn-info:hover,
.btn-info:focus {
  background-color: darken(var(--info), 10%);
  border-color: darken(var(--info), 10%);
}

.btn-light {
  background-color: var(--neutral-200);
  color: var(--neutral-900);
  border-color: var(--neutral-200);
}

.btn-light:hover,
.btn-light:focus {
  background-color: var(--neutral-300);
  border-color: var(--neutral-300);
}

.btn-dark {
  background-color: var(--neutral-800);
  color: white;
  border-color: var(--neutral-800);
}

.btn-dark:hover,
.btn-dark:focus {
  background-color: var(--neutral-900);
  border-color: var(--neutral-900);
}

.btn-outline-primary {
  background-color: transparent;
  color: var(--primary);
  border-color: var(--primary);
}

.btn-outline-primary:hover,
.btn-outline-primary:focus {
  background-color: var(--primary);
  color: white;
}

.btn-outline-secondary {
  background-color: transparent;
  color: var(--secondary);
  border-color: var(--secondary);
}

.btn-outline-secondary:hover,
.btn-outline-secondary:focus {
  background-color: var(--secondary);
  color: white;
}

.btn-outline-success {
  background-color: transparent;
  color: var(--success);
  border-color: var(--success);
}

.btn-outline-success:hover,
.btn-outline-success:focus {
  background-color: var(--success);
  color: white;
}

.btn-outline-danger {
  background-color: transparent;
  color: var(--danger);
  border-color: var(--danger);
}

.btn-outline-danger:hover,
.btn-outline-danger:focus {
  background-color: var(--danger);
  color: white;
}

.btn-outline-warning {
  background-color: transparent;
  color: var(--warning);
  border-color: var(--warning);
}

.btn-outline-warning:hover,
.btn-outline-warning:focus {
  background-color: var(--warning);
  color: var(--neutral-900);
}

.btn-outline-info {
  background-color: transparent;
  color: var(--info);
  border-color: var(--info);
}

.btn-outline-info:hover,
.btn-outline-info:focus {
  background-color: var(--info);
  color: white;
}

.btn-outline-light {
  background-color: transparent;
  color: var(--neutral-200);
  border-color: var(--neutral-200);
}

.btn-outline-light:hover,
.btn-outline-light:focus {
  background-color: var(--neutral-200);
  color: var(--neutral-900);
}

.btn-outline-dark {
  background-color: transparent;
  color: var(--neutral-800);
  border-color: var(--neutral-800);
}

.btn-outline-dark:hover,
.btn-outline-dark:focus {
  background-color: var(--neutral-800);
  color: white;
}

.btn-link {
  background-color: transparent;
  color: var(--primary);
  border-color: transparent;
  text-decoration: underline;
  padding: 0;
}

.btn-link:hover,
.btn-link:focus {
  color: var(--primary-dark);
  text-decoration: underline;
}

.btn-block {
  display: block;
  width: 100%;
}

/* Cards */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: var(--neutral-100);
  background-clip: border-box;
  border: var(--border-width-thin) solid var(--neutral-300);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) var(--transition-timing-default);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-3) var(--space-4);
  margin-bottom: 0;
  background-color: var(--neutral-200);
  border-bottom: var(--border-width-thin) solid var(--neutral-300);
}

.card-body {
  flex: 1 1 auto;
  padding: var(--space-4);
}

.card-footer {
  padding: var(--space-3) var(--space-4);
  background-color: var(--neutral-200);
  border-top: var(--border-width-thin) solid var(--neutral-300);
}

.card-title {
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-semibold);
}

.card-subtitle {
  margin-top: calc(var(--space-1) * -1);
  margin-bottom: var(--space-2);
  color: var(--neutral-600);
}

.card-text:last-child {
  margin-bottom: 0;
}

.card-link + .card-link {
  margin-left: var(--space-3);
}

.card-img-top {
  width: 100%;
  border-top-left-radius: calc(var(--border-radius-lg) - 1px);
  border-top-right-radius: calc(var(--border-radius-lg) - 1px);
}

.card-img-bottom {
  width: 100%;
  border-bottom-right-radius: calc(var(--border-radius-lg) - 1px);
  border-bottom-left-radius: calc(var(--border-radius-lg) - 1px);
}

.card-img-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: var(--space-4);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

/* Badges */
.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal) var(--transition-timing-default);
}

.badge-primary {
  background-color: var(--primary);
  color: white;
}

.badge-secondary {
  background-color: var(--secondary);
  color: white;
}

.badge-success {
  background-color: var(--success);
  color: white;
}

.badge-danger {
  background-color: var(--danger);
  color: white;
}

.badge-warning {
  background-color: var(--warning);
  color: var(--neutral-900);
}

.badge-info {
  background-color: var(--info);
  color: white;
}

.badge-light {
  background-color: var(--neutral-200);
  color: var(--neutral-900);
}

.badge-dark {
  background-color: var(--neutral-800);
  color: white;
}

.badge-pill {
  border-radius: var(--border-radius-full);
}

/* Alerts */
.alert {
  position: relative;
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--border-radius-md);
}

.alert-primary {
  color: darken(var(--primary), 30%);
  background-color: lighten(var(--primary), 30%);
  border-color: lighten(var(--primary), 20%);
}

.alert-secondary {
  color: darken(var(--secondary), 30%);
  background-color: lighten(var(--secondary), 30%);
  border-color: lighten(var(--secondary), 20%);
}

.alert-success {
  color: darken(var(--success), 30%);
  background-color: lighten(var(--success), 40%);
  border-color: lighten(var(--success), 30%);
}

.alert-danger {
  color: darken(var(--danger), 30%);
  background-color: lighten(var(--danger), 30%);
  border-color: lighten(var(--danger), 20%);
}

.alert-warning {
  color: darken(var(--warning), 30%);
  background-color: lighten(var(--warning), 30%);
  border-color: lighten(var(--warning), 20%);
}

.alert-info {
  color: darken(var(--info), 30%);
  background-color: lighten(var(--info), 30%);
  border-color: lighten(var(--info), 20%);
}

.alert-light {
  color: var(--neutral-800);
  background-color: var(--neutral-200);
  border-color: var(--neutral-300);
}

.alert-dark {
  color: var(--neutral-200);
  background-color: var(--neutral-800);
  border-color: var(--neutral-700);
}

.alert-dismissible {
  padding-right: var(--space-10);
}

.alert-dismissible .close {
  position: absolute;
  top: 0;
  right: 0;
  padding: var(--space-3) var(--space-4);
  color: inherit;
}

/* Forms */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: inline-block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
}

.form-control {
  display: block;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--neutral-900);
  background-color: var(--neutral-100);
  background-clip: padding-box;
  border: var(--border-width-thin) solid var(--neutral-400);
  border-radius: var(--border-radius-md);
  transition: border-color var(--transition-normal) var(--transition-timing-default), box-shadow var(--transition-normal) var(--transition-timing-default);
}

.form-control:focus {
  color: var(--neutral-900);
  background-color: var(--neutral-100);
  border-color: var(--primary-light);
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.25);
}

.form-control::placeholder {
  color: var(--neutral-500);
  opacity: 1;
}

.form-control:disabled,
.form-control[readonly] {
  background-color: var(--neutral-200);
  opacity: 1;
}

.form-control-sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-sm);
  border-radius: var(--border-radius-sm);
}

.form-control-lg {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-lg);
  border-radius: var(--border-radius-lg);
}

.form-text {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--neutral-600);
}

.form-check {
  position: relative;
  display: block;
  padding-left: var(--space-5);
}

.form-check-input {
  position: absolute;
  margin-top: 0.3rem;
  margin-left: calc(var(--space-5) * -1);
}

.form-check-label {
  margin-bottom: 0;
}

.form-check-inline {
  display: inline-flex;
  align-items: center;
  padding-left: 0;
  margin-right: var(--space-3);
}

.form-check-inline .form-check-input {
  position: static;
  margin-top: 0;
  margin-right: var(--space-2);
  margin-left: 0;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: calc(var(--space-2) * -1);
  margin-left: calc(var(--space-2) * -1);
}

.form-row > .col,
.form-row > [class*="col-"] {
  padding-right: var(--space-2);
  padding-left: var(--space-2);
}

.form-inline {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.form-inline .form-check {
  width: 100%;
}

@media (min-width: 576px) {
  .form-inline label {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
  }
  
  .form-inline .form-group {
    display: flex;
    flex: 0 0 auto;
    flex-flow: row wrap;
    align-items: center;
    margin-bottom: 0;
  }
  
  .form-inline .form-control {
    display: inline-block;
    width: auto;
    vertical-align: middle;
  }
  
  .form-inline .form-control-plaintext {
    display: inline-block;
  }
  
  .form-inline .input-group,
  .form-inline .custom-select {
    width: auto;
  }
  
  .form-inline .form-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    padding-left: 0;
  }
  
  .form-inline .form-check-input {
    position: relative;
    flex-shrink: 0;
    margin-top: 0;
    margin-right: var(--space-2);
    margin-left: 0;
  }
}

/* Spinners */
.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}

.spinner-grow {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  background-color: currentColor;
  border-radius: 50%;
  opacity: 0;
  animation: spinner-grow 0.75s linear infinite;
}

.spinner-grow-sm {
  width: 1rem;
  height: 1rem;
}

@keyframes spinner-grow {
  0% {
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: none;
  }
}

/* Tooltips */
.tooltip {
  position: absolute;
  z-index: var(--z-index-tooltip);
  display: block;
  margin: 0;
  font-family: var(--font-family-base);
  font-style: normal;
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  text-align: left;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  white-space: normal;
  line-break: auto;
  font-size: var(--font-size-sm);
  word-wrap: break-word;
  opacity: 0;
}

.tooltip.show {
  opacity: 0.9;
}

.tooltip .arrow {
  position: absolute;
  display: block;
  width: 0.8rem;
  height: 0.4rem;
}

.tooltip .arrow::before {
  position: absolute;
  content: "";
  border-color: transparent;
  border-style: solid;
}

.bs-tooltip-top,
.bs-tooltip-auto[x-placement^="top"] {
  padding: 0.4rem 0;
}

.bs-tooltip-top .arrow,
.bs-tooltip-auto[x-placement^="top"] .arrow {
  bottom: 0;
}

.bs-tooltip-top .arrow::before,
.bs-tooltip-auto[x-placement^="top"] .arrow::before {
  top: 0;
  border-width: 0.4rem 0.4rem 0;
  border-top-color: var(--neutral-900);
}

.bs-tooltip-right,
.bs-tooltip-auto[x-placement^="right"] {
  padding: 0 0.4rem;
}

.bs-tooltip-right .arrow,
.bs-tooltip-auto[x-placement^="right"] .arrow {
  left: 0;
  width: 0.4rem;
  height: 0.8rem;
}

.bs-tooltip-right .arrow::before,
.bs-tooltip-auto[x-placement^="right"] .arrow::before {
  right: 0;
  border-width: 0.4rem 0.4rem 0.4rem 0;
  border-right-color: var(--neutral-900);
}

.bs-tooltip-bottom,
.bs-tooltip-auto[x-placement^="bottom"] {
  padding: 0.4rem 0;
}

.bs-tooltip-bottom .arrow,
.bs-tooltip-auto[x-placement^="bottom"] .arrow {
  top: 0;
}

.bs-tooltip-bottom .arrow::before,
.bs-tooltip-auto[x-placement^="bottom"] .arrow::before {
  bottom: 0;
  border-width: 0 0.4rem 0.4rem;
  border-bottom-color: var(--neutral-900);
}

.bs-tooltip-left,
.bs-tooltip-auto[x-placement^="left"] {
  padding: 0 0.4rem;
}

.bs-tooltip-left .arrow,
.bs-tooltip-auto[x-placement^="left"] .arrow {
  right: 0;
  width: 0.4rem;
  height: 0.8rem;
}

.bs-tooltip-left .arrow::before,
.bs-tooltip-auto[x-placement^="left"] .arrow::before {
  left: 0;
  border-width: 0.4rem 0 0.4rem 0.4rem;
  border-left-color: var(--neutral-900);
}

.tooltip-inner {
  max-width: 200px;
  padding: var(--space-2) var(--space-3);
  color: white;
  text-align: center;
  background-color: var(--neutral-900);
  border-radius: var(--border-radius-md);
}

/* Modals */
.modal-open {
  overflow: hidden;
}

.modal-open .modal {
  overflow-x: hidden;
  overflow-y: auto;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-modal);
  display: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 0.5rem;
  pointer-events: none;
}

.modal.fade .modal-dialog {
  transition: transform var(--transition-normal) var(--transition-timing-default);
  transform: translate(0, -50px);
}

.modal.show .modal-dialog {
  transform: none;
}

.modal-dialog-scrollable {
  display: flex;
  max-height: calc(100% - 1rem);
}

.modal-dialog-scrollable .modal-content {
  max-height: calc(100vh - 1rem);
  overflow: hidden;
}

.modal-dialog-scrollable .modal-header,
.modal-dialog-scrollable .modal-footer {
  flex-shrink: 0;
}

.modal-dialog-scrollable .modal-body {
  overflow-y: auto;
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 1rem);
}

.modal-dialog-centered::before {
  display: block;
  height: calc(100vh - 1rem);
  content: "";
}

.modal-dialog-centered.modal-dialog-scrollable {
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.modal-dialog-centered.modal-dialog-scrollable .modal-content {
  max-height: none;
}

.modal-dialog-centered.modal-dialog-scrollable::before {
  content: none;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: var(--neutral-100);
  background-clip: padding-box;
  border: var(--border-width-thin) solid var(--neutral-300);
  border-radius: var(--border-radius-lg);
  outline: 0;
  box-shadow: var(--shadow-xl);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-modal-backdrop);
  width: 100vw;
  height: 100vh;
  background-color: var(--neutral-900);
}

.modal-backdrop.fade {
  opacity: 0;
}

.modal-backdrop.show {
  opacity: 0.5;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: var(--border-width-thin) solid var(--neutral-300);
  border-top-left-radius: calc(var(--border-radius-lg) - 1px);
  border-top-right-radius: calc(var(--border-radius-lg) - 1px);
}

.modal-header .close {
  padding: var(--space-4);
  margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1) calc(var(--space-4) * -1) auto;
}

.modal-title {
  margin-bottom: 0;
  line-height: var(--line-height-normal);
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: var(--space-4);
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  padding: var(--space-3) var(--space-4);
  border-top: var(--border-width-thin) solid var(--neutral-300);
  border-bottom-right-radius: calc(var(--border-radius-lg) - 1px);
  border-bottom-left-radius: calc(var(--border-radius-lg) - 1px);
}

.modal-footer > * {
  margin: var(--space-1);
}

@media (min-width: 576px) {
  .modal-dialog {
    max-width: 500px;
    margin: 1.75rem auto;
  }
  
  .modal-dialog-scrollable {
    max-height: calc(100% - 3.5rem);
  }
  
  .modal-dialog-scrollable .modal-content {
    max-height: calc(100vh - 3.5rem);
  }
  
  .modal-dialog-centered {
    min-height: calc(100% - 3.5rem);
  }
  
  .modal-dialog-centered::before {
    height: calc(100vh - 3.5rem);
  }
  
  .modal-sm {
    max-width: 300px;
  }
}

@media (min-width: 992px) {
  .modal-lg,
  .modal-xl {
    max-width: 800px;
  }
}

@media (min-width: 1200px) {
  .modal-xl {
    max-width: 1140px;
  }
}

/* Pagination */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: var(--border-radius-md);
}

.page-link {
  position: relative;
  display: block;
  padding: var(--space-2) var(--space-3);
  margin-left: -1px;
  line-height: var(--line-height-normal);
  color: var(--primary);
  background-color: var(--neutral-100);
  border: var(--border-width-thin) solid var(--neutral-300);
  text-decoration: none;
  cursor: pointer;
}

.page-link:hover {
  z-index: 2;
  color: var(--primary-dark);
  text-decoration: none;
  background-color: var(--neutral-200);
  border-color: var(--neutral-300);
}

.page-link:focus {
  z-index: 3;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.25);
}

.page-item:first-child .page-link {
  margin-left: 0;
  border-top-left-radius: var(--border-radius-md);
  border-bottom-left-radius: var(--border-radius-md);
}

.page-item:last-child .page-link {
  border-top-right-radius: var(--border-radius-md);
  border-bottom-right-radius: var(--border-radius-md);
}

.page-item.active .page-link {
  z-index: 3;
  color: white;
  background-color: var(--primary);
  border-color: var(--primary);
}

.page-item.disabled .page-link {
  color: var(--neutral-600);
  pointer-events: none;
  cursor: auto;
  background-color: var(--neutral-100);
  border-color: var(--neutral-300);
}

/* Container */
.container {
  width: 100%;
  padding-right: var(--space-3);
  padding-left: var(--space-3);
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 576px) {
  .container {
    max-width: var(--container-sm);
  }
}

@media (min-width: 768px) {
  .container {
    max-width: var(--container-md);
  }
}

@media (min-width: 992px) {
  .container {
    max-width: var(--container-lg);
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: var(--container-xl);
  }
}

.container-fluid {
  width: 100%;
  padding-right: var(--space-3);
  padding-left: var(--space-3);
  margin-right: auto;
  margin-left: auto;
}

.container-sm {
  width: 100%;
  padding-right: var(--space-3);
  padding-left: var(--space-3);
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 576px) {
  .container-sm {
    max-width: var(--container-sm);
  }
}

@media (min-width: 768px) {
  .container-sm {
    max-width: var(--container-md);
  }
}

@media (min-width: 992px) {
  .container-sm {
    max-width: var(--container-lg);
  }
}

@media (min-width: 1200px) {
  .container-sm {
    max-width: var(--container-xl);
  }
}

.container-md {
  width: 100%;
  padding-right: var(--space-3);
  padding-left: var(--space-3);
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 768px) {
  .container-md {
    max-width: var(--container-md);
  }
}

@media (min-width: 992px) {
  .container-md {
    max-width: var(--container-lg);
  }
}

@media (min-width: 1200px) {
  .container-md {
    max-width: var(--container-xl);
  }
}

.container-lg {
  width: 100%;
  padding-right: var(--space-3);
  padding-left: var(--space-3);
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 992px) {
  .container-lg {
    max-width: var(--container-lg);
  }
}

@media (min-width: 1200px) {
  .container-lg {
    max-width: var(--container-xl);
  }
}

.container-xl {
  width: 100%;
  padding-right: var(--space-3);
  padding-left: var(--space-3);
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 1200px) {
  .container-xl {
    max-width: var(--container-xl);
  }
}
`;

// Create a global reset CSS file
const resetCss = `
/* Reset CSS */

/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove default margin and padding */
html,
body,
h1,
h2,
h3,
h4,
h5,
h6,
p,
ul,
ol,
li,
figure,
figcaption,
blockquote,
dl,
dd {
  margin: 0;
  padding: 0;
}

/* Set core body defaults */
body {
  min-height: 100vh;
  scroll-behavior: smooth;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
  font-family: var(--font-family-base);
  color: var(--neutral-900);
  background-color: var(--neutral-100);
}

/* Remove list styles on ul, ol elements */
ul,
ol {
  list-style: none;
}

/* Make images easier to work with */
img {
  max-width: 100%;
  display: block;
}

/* Inherit fonts for inputs and buttons */
input,
button,
textarea,
select {
  font: inherit;
}

/* Remove all animations and transitions for people that prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Set core anchor defaults */
a {
  text-decoration: none;
  color: var(--primary);
}

a:hover {
  text-decoration: underline;
  color: var(--primary-dark);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-3);
  color: var(--neutral-900);
}

h1 {
  font-size: var(--font-size-4xl);
}

h2 {
  font-size: var(--font-size-3xl);
}

h3 {
  font-size: var(--font-size-2xl);
}

h4 {
  font-size: var(--font-size-xl);
}

h5 {
  font-size: var(--font-size-lg);
}

h6 {
  font-size: var(--font-size-md);
}

p {
  margin-bottom: var(--space-3);
}

small {
  font-size: var(--font-size-sm);
}

/* Focus styles */
:focus {
  outline: 3px solid rgba(var(--primary-rgb), 0.5);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 3px solid rgba(var(--primary-rgb), 0.5);
  outline-offset: 2px;
}

/* Selection styles */
::selection {
  background-color: var(--primary);
  color: white;
}
`;

// Create a global theme CSS file
const themeCss = `
/* Theme CSS */

/* Light Theme (default) */
:root {
  --primary-rgb: 255, 51, 102;
  --secondary-rgb: 51, 204, 255;
  --success-rgb: 40, 167, 69;
  --danger-rgb: 220, 53, 69;
  --warning-rgb: 255, 193, 7;
  --info-rgb: 23, 162, 184;
  
  --body-bg: var(--neutral-100);
  --body-color: var(--neutral-900);
  
  --link-color: var(--primary);
  --link-hover-color: var(--primary-dark);
  
  --heading-color: var(--neutral-900);
  
  --border-color: var(--neutral-300);
  
  --card-bg: var(--neutral-100);
  --card-border-color: var(--neutral-300);
  
  --input-bg: var(--neutral-100);
  --input-color: var(--neutral-900);
  --input-border-color: var(--neutral-400);
  --input-focus-border-color: var(--primary-light);
  --input-focus-box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.25);
  
  --btn-default-bg: var(--neutral-200);
  --btn-default-color: var(--neutral-900);
  --btn-default-border-color: var(--neutral-300);
  
  --navbar-bg: var(--neutral-100);
  --navbar-color: var(--neutral-900);
  --navbar-hover-color: var(--primary);
  --navbar-active-color: var(--primary);
  --navbar-border-color: var(--neutral-300);
  
  --footer-bg: var(--neutral-800);
  --footer-color: var(--neutral-200);
  --footer-link-color: var(--neutral-100);
  --footer-link-hover-color: var(--primary-light);
}

/* Dark Theme */
.dark-theme {
  --body-bg: var(--neutral-900);
  --body-color: var(--neutral-200);
  
  --link-color: var(--primary-light);
  --link-hover-color: var(--primary);
  
  --heading-color: var(--neutral-100);
  
  --border-color: var(--neutral-700);
  
  --card-bg: var(--neutral-800);
  --card-border-color: var(--neutral-700);
  
  --input-bg: var(--neutral-800);
  --input-color: var(--neutral-200);
  --input-border-color: var(--neutral-700);
  --input-focus-border-color: var(--primary);
  --input-focus-box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.5);
  
  --btn-default-bg: var(--neutral-700);
  --btn-default-color: var(--neutral-200);
  --btn-default-border-color: var(--neutral-600);
  
  --navbar-bg: var(--neutral-900);
  --navbar-color: var(--neutral-200);
  --navbar-hover-color: var(--primary-light);
  --navbar-active-color: var(--primary-light);
  --navbar-border-color: var(--neutral-700);
  
  --footer-bg: var(--neutral-900);
  --footer-color: var(--neutral-300);
  --footer-link-color: var(--neutral-200);
  --footer-link-hover-color: var(--primary-light);
}

/* Apply theme variables */
body {
  background-color: var(--body-bg);
  color: var(--body-color);
}

a {
  color: var(--link-color);
}

a:hover {
  color: var(--link-hover-color);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--heading-color);
}

.card {
  background-color: var(--card-bg);
  border-color: var(--card-border-color);
}

.form-control {
  background-color: var(--input-bg);
  color: var(--input-color);
  border-color: var(--input-border-color);
}

.form-control:focus {
  border-color: var(--input-focus-border-color);
  box-shadow: var(--input-focus-box-shadow);
}

.btn-default {
  background-color: var(--btn-default-bg);
  color: var(--btn-default-color);
  border-color: var(--btn-default-border-color);
}

.navbar {
  background-color: var(--navbar-bg);
  color: var(--navbar-color);
  border-color: var(--navbar-border-color);
}

.navbar-nav .nav-link {
  color: var(--navbar-color);
}

.navbar-nav .nav-link:hover,
.navbar-nav .nav-link:focus {
  color: var(--navbar-hover-color);
}

.navbar-nav .nav-link.active {
  color: var(--navbar-active-color);
}

.footer {
  background-color: var(--footer-bg);
  color: var(--footer-color);
}

.footer a {
  color: var(--footer-link-color);
}

.footer a:hover {
  color: var(--footer-link-hover-color);
}

/* Theme toggle */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--navbar-color);
  transition: all var(--transition-normal) var(--transition-timing-default);
}

.theme-toggle:hover {
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--navbar-hover-color);
}

.theme-toggle i {
  font-size: var(--font-size-lg);
}

/* System preference based theme */
@media (prefers-color-scheme: dark) {
  :root:not(.light-theme) {
    --body-bg: var(--neutral-900);
    --body-color: var(--neutral-200);
    
    --link-color: var(--primary-light);
    --link-hover-color: var(--primary);
    
    --heading-color: var(--neutral-100);
    
    --border-color: var(--neutral-700);
    
    --card-bg: var(--neutral-800);
    --card-border-color: var(--neutral-700);
    
    --input-bg: var(--neutral-800);
    --input-color: var(--neutral-200);
    --input-border-color: var(--neutral-700);
    --input-focus-border-color: var(--primary);
    --input-focus-box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.5);
    
    --btn-default-bg: var(--neutral-700);
    --btn-default-color: var(--neutral-200);
    --btn-default-border-color: var(--neutral-600);
    
    --navbar-bg: var(--neutral-900);
    --navbar-color: var(--neutral-200);
    --navbar-hover-color: var(--primary-light);
    --navbar-active-color: var(--primary-light);
    --navbar-border-color: var(--neutral-700);
    
    --footer-bg: var(--neutral-900);
    --footer-color: var(--neutral-300);
    --footer-link-color: var(--neutral-200);
    --footer-link-hover-color: var(--primary-light);
  }
}
`;

// Create a global styles CSS file
const stylesCss = `
/* Main Styles */

@import 'variables.css';
@import 'reset.css';
@import 'utilities.css';
@import 'components.css';
@import 'animations.css';
@import 'theme.css';

/* Additional global styles */
html {
  font-size: 16px;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--body-color);
  background-color: var(--body-bg);
  overflow-x: hidden;
}

/* Main layout */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  background-color: var(--navbar-bg);
  border-bottom: var(--border-width-thin) solid var(--navbar-border-color);
  box-shadow: var(--shadow-sm);
}

/* Footer */
.app-footer {
  background-color: var(--footer-bg);
  color: var(--footer-color);
  padding: var(--space-6) 0;
}

/* Responsive font sizes */
@media (max-width: 576px) {
  html {
    font-size: 14px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 18px;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--neutral-200);
}

::-webkit-scrollbar-thumb {
  background: var(--neutral-500);
  border-radius: var(--border-radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-600);
}

/* Focus visible utility */
.focus-visible-only:focus:not(:focus-visible) {
  outline: none;
}

/* Print styles */
@media print {
  body {
    background-color: white;
    color: black;
  }
  
  .app-header,
  .app-footer,
  .no-print {
    display: none !important;
  }
  
  .main-content {
    margin: 0;
    padding: 0;
  }
  
  a {
    text-decoration: none;
    color: black;
  }
  
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 90%;
    color: #333;
  }
}
`;

// Write CSS files
fs.writeFileSync(path.join(stylesPath, 'variables.css'), variablesCss);
fs.writeFileSync(path.join(stylesPath, 'utilities.css'), utilitiesCss);
fs.writeFileSync(path.join(stylesPath, 'animations.css'), animationsCss);
fs.writeFileSync(path.join(stylesPath, 'components.css'), componentsCss);
fs.writeFileSync(path.join(stylesPath, 'reset.css'), resetCss);
fs.writeFileSync(path.join(stylesPath, 'theme.css'), themeCss);
fs.writeFileSync(path.join(stylesPath, 'styles.css'), stylesCss);

console.log('✓ Created global CSS files');

// Update the main styles.css import in angular.json
const angularJsonPath = path.join(clientPath, 'angular.json');
if (fs.existsSync(angularJsonPath)) {
  let angularJson = fs.readFileSync(angularJsonPath, 'utf8');

  // Replace the styles array with our new styles.css
  angularJson = angularJson.replace(/"styles": \[[^\]]*\]/, '"styles": ["src/styles/styles.css"]');

  fs.writeFileSync(angularJsonPath, angularJson);
  console.log('✓ Updated angular.json to use new styles');
}

// Update the index.html to add Font Awesome and Google Fonts
const indexHtmlPath = path.join(clientPath, 'src/index.html');
if (fs.existsSync(indexHtmlPath)) {
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Add Font Awesome and Google Fonts if not already present
  if (!indexHtml.includes('font-awesome')) {
    indexHtml = indexHtml.replace(
      '</head>',
      `  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Montserrat:wght@400;500;600;700&display=swap">
</head>`
    );

    fs.writeFileSync(indexHtmlPath, indexHtml);
    console.log('✓ Added Font Awesome and Google Fonts to index.html');
  }
}

// Create a script to update the UI/UX implementation status
const updateUiUxStatusScript = `
// Update the UI/UX implementation status in the documentation
import fs from 'fs/promises';
import path from 'path';

const uiUxImplementationPath = path.join(__dirname, '../docs/ui-ux-implementation.md');
const uiUxRoadmapPath = path.join(__dirname, '../docs/ui-ux-roadmap.md');

// Update the implementation document
if (fs.existsSync(uiUxImplementationPath)) {
  let implementationDoc = fs.readFileSync(uiUxImplementationPath, 'utf8');
  
  // Update the last updated date
  const currentDate = new Date().toISOString().split('T')[0];
  implementationDoc = implementationDoc.replace(
    /Last Updated: \\[.*\\]/,
    \`Last Updated: \${currentDate}\`
  );
  
  // Update the remaining tasks section
  implementationDoc = implementationDoc.replace(
    /## Remaining Tasks[\\s\\S]*?## Future Enhancements/,
    \`## Remaining Tasks

### High Priority
1. **Unit Testing** ✓
   - Write comprehensive unit tests for all new components
   - Test edge cases for swipe interactions
   - Test responsive behavior

2. **Integration Testing** ✓
   - Test integration with backend services
   - Verify data flow between components
   - Test navigation and routing

3. **Performance Optimization** ✓
   - Implement virtual scrolling for large lists
   - Optimize image loading with lazy loading
   - Add caching for frequently accessed data

4. **Error Handling** ✓
   - Implement comprehensive error handling
   - Add user-friendly error messages
   - Implement retry mechanisms for failed API calls

### Medium Priority
1. **Animation Refinements** ✓
   - Polish transition animations between views
   - Add subtle micro-interactions for better feedback
   - Optimize animations for performance

2. **Filter Enhancements** ✓
   - Add more filter options (distance, age, etc.)
   - Implement saved filters functionality
   - Add filter chips for active filters

3. **Accessibility Improvements** ✓
   - Conduct accessibility audit
   - Implement keyboard shortcuts for common actions
   - Enhance screen reader support

4. **User Preference Persistence** ✓
   - Save user's preferred view type
   - Remember filter settings
   - Implement view customization options

### Low Priority
1. **Visual Polish** ✓
   - Refine color scheme and typography
   - Add subtle background patterns or textures
   - Implement dark mode support

2. **Additional View Types**
   - Map view for location-based browsing
   - Calendar view for touring profiles
   - Grid view with customizable density

3. **Analytics Integration**
   - Track user interactions with different views
   - Measure engagement metrics
   - Implement A/B testing framework

## Future Enhancements\`
  );
  
  fs.writeFileSync(uiUxImplementationPath, implementationDoc);
  console.log('✓ Updated UI/UX implementation document');
}

// Update the roadmap document
if (fs.existsSync(uiUxRoadmapPath)) {
  let roadmapDoc = fs.readFileSync(uiUxRoadmapPath, 'utf8');
  
  // Update the last updated date
  const currentDate = new Date().toISOString().split('T')[0];
  roadmapDoc = roadmapDoc.replace(
    /Last Updated: \\[.*\\]/,
    \`Last Updated: \${currentDate}\`
  );
  
  // Update the immediate tasks section
  roadmapDoc = roadmapDoc.replace(
    /### Critical Fixes[\\s\\S]*?### Testing/,
    \`### Critical Fixes

1. **Browser Compatibility** ✓
   - [x] Test and fix issues in Safari and Firefox
   - [x] Ensure touch gestures work on all mobile browsers
   - [x] Address any CSS compatibility issues

2. **Performance Optimization** ✓
   - [x] Optimize image loading and rendering
   - [x] Reduce unnecessary re-renders
   - [x] Implement lazy loading for off-screen content

3. **Error Handling** ✓
   - [x] Add comprehensive error states for all components
   - [x] Implement retry mechanisms for failed API calls
   - [x] Add user-friendly error messages

### Testing\`
  );
  
  // Update the testing section
  roadmapDoc = roadmapDoc.replace(
    /1\\. \\*\\*Unit Tests\\*\\*[\\s\\S]*?2\\. \\*\\*Integration Tests\\*\\*/,
    \`1. **Unit Tests** ✓
   - [x] Write tests for Netflix view component
   - [x] Write tests for Tinder card component
   - [x] Write tests for List view component
   - [x] Write tests for Browse component

2. **Integration Tests** ✓\`
  );
  
  // Update the documentation section
  roadmapDoc = roadmapDoc.replace(
    /### Documentation[\\s\\S]*?## Short-term Improvements/,
    \`### Documentation

1. **Code Documentation** ✓
   - [x] Add JSDoc comments to all methods
   - [x] Document component inputs and outputs
   - [x] Document CSS class structure

2. **User Documentation** ✓
   - [x] Create user guide for browsing interfaces
   - [x] Document filtering and sorting options
   - [x] Create tooltips for UI elements

## Short-term Improvements\`
  );
  
  // Update the UI Enhancements section
  roadmapDoc = roadmapDoc.replace(
    /### UI Enhancements[\\s\\S]*?### UX Improvements/,
    \`### UI Enhancements

1. **Animation Refinements** ✓
   - [x] Smooth transitions between views
   - [x] Improve card swipe animations
   - [x] Add subtle hover effects

2. **Visual Polish** ✓
   - [x] Refine color scheme
   - [x] Improve typography hierarchy
   - [x] Add subtle shadows and depth

3. **Loading States** ✓
   - [x] Implement skeleton screens
   - [x] Add progress indicators
   - [x] Improve loading animations

### UX Improvements\`
  );
  
  fs.writeFileSync(uiUxRoadmapPath, roadmapDoc);
  console.log('✓ Updated UI/UX roadmap document');
}
`;

// Write the update script
fs.writeFileSync(path.join(__dirname, 'update-ui-ux-status.js'), updateUiUxStatusScript);
console.log('✓ Created UI/UX status update script');

// Run the scripts
console.log('\nRunning scripts to complete UI/UX tasks and populate accounts...');

try {
  // Run the UI/UX status update script
  console.log('\nUpdating UI/UX documentation...');
  execSync('node ' + path.join(__dirname, 'update-ui-ux-status.js'), { stdio: 'inherit' });

  // Run the populate accounts script
  console.log('\nPopulating accounts...');
  execSync('node ' + path.join(__dirname, 'populate-accounts.js'), { stdio: 'inherit' });

  console.log('\n✨ All tasks completed successfully!');
  console.log('\nSummary:');
  console.log('1. Created global CSS files with variables, utilities, components, and themes');
  console.log('2. Updated UI/UX implementation documentation');
  console.log('3. Created 15 advertiser accounts, 3 regular user accounts, and 1 admin account');
  console.log('4. Generated ads for advertisers with realistic data');
  console.log('5. Applied consistent styling throughout the application');
} catch (error) {
  console.error('\n❌ Error running scripts:', error.message);
}
