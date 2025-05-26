import { NbJSThemeOptions } from '@nebular/theme';

// Base theme configuration
const dateNightThemeBase = {';
  fontMain: 'Inter, sans-serif',
  fontSecondary: 'Poppins, sans-serif',

  // Colors
  primary: '#6200EA',
  success: '#00C853',
  info: '#00B0FF',
  warning: '#FFD600',
  danger: '#FF1744',

  // Background colors
  bg1: '#FFFFFF',
  bg2: '#F5F5F5',
  bg3: '#EEEEEE',

  // Text colors
  text1: '#212121',
  text2: '#424242',
  text3: '#616161',

  // Border radius
  borderRadius: '0.5rem',
  buttonBorderRadius: '0.375rem',
  cardBorderRadius: '0.75rem',

  // Spacing
  spacing1: '0.25rem',
  spacing2: '0.5rem',
  spacing3: '1rem',
  spacing4: '1.5rem',
  spacing5: '2rem',

  // Shadows
  shadow1: '0 2px 4px rgba(0,0,0,0.1)',
  shadow2: '0 4px 8px rgba(0,0,0,0.1)',
  shadow3: '0 8px 16px rgba(0,0,0,0.1)',

  // Animation
  animationDuration: '0.2s',
  animationTiming: 'ease-in-out',
}

// Light theme
export const dateNightTheme: NbJSThemeOptions = {
  name: 'default',
  base: 'default',
  variables: {
    ...dateNightThemeBase,
  },
}

// Dark theme
export const dateNightDarkTheme: NbJSThemeOptions = {
  name: 'dark',
  base: 'dark',
  variables: {
    ...dateNightThemeBase,
    // Override colors for dark theme
    bg1: '#121212',
    bg2: '#1E1E1E',
    bg3: '#2D2D2D',
    text1: '#FFFFFF',
    text2: '#E0E0E0',
    text3: '#BDBDBD',
    shadow1: '0 2px 4px rgba(0,0,0,0.2)',
    shadow2: '0 4px 8px rgba(0,0,0,0.2)',
    shadow3: '0 8px 16px rgba(0,0,0,0.2)',
  },
}
