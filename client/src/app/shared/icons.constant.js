angular.module('classifiedsApp').constant('icons', {
  next: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  prev: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  login: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  logout: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  add: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  tinder: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM8 12h8" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  netflix: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M4 5h16v14H4V5zm0 4h16M8 5v14" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  location: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
      stroke="currentColor" fill="none" stroke-width="2"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" fill="none" stroke-width="2"/>
  </svg>`,
  github: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
  </svg>`,
  google: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.84 8.52c0 3.37-2.36 5.76-5.84 5.76-3.37 0-6.12-2.75-6.12-6.12s2.75-6.12 6.12-6.12c1.59 0 2.92.58 3.94 1.54l-1.6 1.54c-.44-.42-1.21-.91-2.34-.91-2.01 0-3.64 1.66-3.64 3.95s1.63 3.95 3.64 3.95c2.32 0 3.19-1.67 3.33-2.53h-3.33v-2.03h5.57c.05.3.09.6.09.91z" fill="currentColor"/>
  </svg>`,
  reddit: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.84 11.52c-.62.42-1.4.66-2.24.66-1.84 0-3.36-1.5-3.36-3.34s1.52-3.34 3.36-3.34c.84 0 1.62.24 2.24.66l1.44-1.44C16.76 5.56 15.44 5 14 5c-2 0-3.8.8-5.12 2.12C7.68 8.8 7 10.6 7 12s.68 3.2 1.88 4.88C10.2 18.2 12 19 14 19c1.44 0 2.76-.56 3.76-1.44l-1.44-1.44c-.62.42-1.4.66-2.24.66z" fill="currentColor"/>
  </svg>`,
  apple: `<svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="currentColor"/>
  </svg>`
});

angular.module('dateNightApp.shared', [])
  .constant('ICONS', {
    DEFAULT_PROFILE: '/assets/images/default-profile.png',
    LOADING: '/assets/images/loading.gif',
    CHAT: '/assets/images/chat-icon.png'
  });
