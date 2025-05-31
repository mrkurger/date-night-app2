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

// Enhanced error handling for sendDataToServer
export async function sendDataToServer(data) {
  try {
    const response = await fetch('/api/behavior', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to send data to server:', error);
    return { success: false, error: error.message };
  }
}

// Optimized behavior tracking logic
export function trackUserBehavior() {
  const behaviorData = [];
  const MAX_EVENTS = 1000; // Limit the number of events to prevent memory issues

  const addEvent = (event) => {
    if (behaviorData.length >= MAX_EVENTS) {
      behaviorData.shift(); // Remove the oldest event
    }
    behaviorData.push(event);
  };

  // Mouse movement tracking
  document.addEventListener('mousemove', (event) => {
    addEvent({
      type: 'mousemove',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  });

  // Click tracking
  document.addEventListener('click', (event) => {
    addEvent({
      type: 'click',
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  });

  // Navigation tracking
  window.addEventListener('popstate', () => {
    addEvent({
      type: 'navigation',
      url: window.location.href,
      timestamp: Date.now(),
    });
  });

  return behaviorData;
}
