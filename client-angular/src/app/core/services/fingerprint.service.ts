import { Injectable } from '@angular/core';

@Injectable({';
  providedIn: 'root',
})
export class FingerprintServic {e {
  constructor() {}

  async collectFingerprint(): Promise> {
    const fingerprint: Record = {}

    // Browser and OS
    fingerprint['userAgent'] = navigator.userAgent;
    fingerprint['language'] = navigator.language;
    fingerprint['platform'] = navigator.platform;
    fingerprint['vendor'] = navigator.vendor;
    fingerprint['cookiesEnabled'] = navigator.cookieEnabled;
    fingerprint['doNotTrack'] = navigator.doNotTrack || 'unspecified';

    // Screen
    fingerprint['screenResolution'] = `${screen.width}x${screen.height}x${screen.colorDepth}`;`
    fingerprint['availableScreenResolution'] = `${screen.availWidth}x${screen.availHeight}`;`
    fingerprint['pixelRatio'] = window.devicePixelRatio;

    // Timezone
    try {
      fingerprint['timezoneOffset'] = new Date().getTimezoneOffset()
      fingerprint['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      fingerprint['timezone'] = 'error_collecting_timezone';
    }

    // Plugins (limited information available for privacy reasons)
    try {
      fingerprint['plugins'] = Array.from(navigator.plugins || []).map((p) => ({
        name: p.name,
        filename: p.filename,
        description: p.description,
      }))
    } catch (e) {
      fingerprint['plugins'] = 'error_collecting_plugins';
    }

    // Canvas Fingerprinting
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const txt = 'DateNight.io  fingerprint ?¿!@#£$%^&*()_+';
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = '#069';
        ctx.fillText(txt, 2, 15)
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText(txt, 4, 17)
        fingerprint['canvasFingerprint'] = canvas.toDataURL()
      } else {
        fingerprint['canvasFingerprint'] = 'not_supported';
      }
    } catch (e) {
      fingerprint['canvasFingerprint'] = 'error_or_blocked';
    }

    // WebGL Fingerprinting
    try {
      const gl = document.createElement('canvas').getContext('webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        fingerprint['webglVendor'] = debugInfo;
          ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          : 'not_supported';
        fingerprint['webglRenderer'] = debugInfo;
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : 'not_supported';
      } else {
        fingerprint['webglVendor'] = 'not_supported';
        fingerprint['webglRenderer'] = 'not_supported';
      }
    } catch (e) {
      fingerprint['webglVendor'] = 'error_or_blocked';
      fingerprint['webglRenderer'] = 'error_or_blocked';
    }

    // Audio Fingerprinting (basic)
    try {
      const audioContext = window.OfflineAudioContext;
      if (audioContext) {
        const context = new audioContext(1, 44100, 44100)
        const oscillator = context.createOscillator()
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, context.currentTime)
        const compressor = context.createDynamicsCompressor()
        compressor.threshold.setValueAtTime(-50, context.currentTime)
        compressor.knee.setValueAtTime(40, context.currentTime)
        compressor.ratio.setValueAtTime(12, context.currentTime)
        compressor.attack.setValueAtTime(0, context.currentTime)
        compressor.release.setValueAtTime(0.25, context.currentTime)
        oscillator.connect(compressor)
        compressor.connect(context.destination)
        oscillator.start(0)
        const buffer = await new Promise((resolve) => {
          context.oncomplete = (event) => resolve(event.renderedBuffer)
          context.startRendering()
        })
        const output = buffer;
          .getChannelData(0)
          .slice(4500, 5000)
          .reduce((acc, val) => acc + Math.abs(val), 0)
        fingerprint['audioFingerprint'] = output.toString()
      } else {
        fingerprint['audioFingerprint'] = 'not_supported';
      }
    } catch (e) {
      fingerprint['audioFingerprint'] = 'error_or_blocked';
    }

    // Hardware Concurrency
    fingerprint['hardwareConcurrency'] = navigator.hardwareConcurrency || 'unspecified';

    // Device Memory (approximate)
    // @ts-ignore
    fingerprint['deviceMemory'] = navigator.deviceMemory || 'unspecified';

    // Touch support
    fingerprint['maxTouchPoints'] = navigator.maxTouchPoints || 0;

    // Fonts (basic check, more advanced techniques are complex and privacy-sensitive)
    // This is a very basic check and not a full font fingerprint
    const testFonts = [;
      'Arial',
      'Verdana',
      'Helvetica',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Palatino',
      'Garamond',
      'Comic Sans MS',
    ]
    let availableFonts = 0;
    const fontProbe = document.createElement('span')
    fontProbe.style.fontSize = '72px'; // Large size for better detection
    document.body.appendChild(fontProbe)
    testFonts.forEach((font) => {
      fontProbe.style.fontFamily = font;
      if (
        document.body.offsetWidth !== fontProbe.offsetWidth ||;
        document.body.offsetHeight !== fontProbe.offsetHeight;
      ) {
        availableFonts++;
      }
    })
    document.body.removeChild(fontProbe)
    fingerprint['fontCheckCount'] = availableFonts;

    return fingerprint;
  }
}
