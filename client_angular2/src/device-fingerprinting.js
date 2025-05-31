import FingerprintJS from 'fingerprintjs';

// Initialize FingerprintJS
const fpPromise = FingerprintJS.load();

// Collect device fingerprint
export async function getDeviceFingerprint() {
  const fp = await fpPromise;
  const result = await fp.get();
  return {
    visitorId: result.visitorId,
    components: result.components,
  };
}

// Track user behavior
export function trackUserBehavior() {
  const behaviorData = [];

  // Mouse movement tracking
  document.addEventListener('mousemove', event => {
    behaviorData.push({
      type: 'mousemove',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  });

  // Click tracking
  document.addEventListener('click', event => {
    behaviorData.push({
      type: 'click',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  });

  // Navigation tracking
  window.addEventListener('popstate', () => {
    behaviorData.push({
      type: 'navigation',
      url: window.location.href,
      timestamp: Date.now(),
    });
  });

  return behaviorData;
}

// Send data to server
export async function sendDataToServer(data) {
  const response = await fetch('/api/behavior', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
