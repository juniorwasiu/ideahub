/**
 * Comprehensive Device, Browser, Network, and Visitor Details Extractor
 */

// Generate a random UUID-like ID for anonymous visitor & session tracking
export function generateUniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  return 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Deeply sanitizes an object for Firestore to guarantee no 'undefined' values exist
 * (Firestore throws fatal errors if any field is undefined)
 */
export function sanitizeForFirestore(val) {
  if (val === undefined) {
    return null;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeForFirestore(item));
  }
  // If it's a Firestore FieldValue token (like serverTimestamp), preserve it
  if (val._methodName || (val.constructor && val.constructor.name === 'FieldValue')) {
    return val;
  }
  const clean = {};
  for (const [key, v] of Object.entries(val)) {
    clean[key] = v === undefined ? null : sanitizeForFirestore(v);
  }
  return clean;
}

/**
 * Parses userAgent to extract Device Type, Operating System, and Browser details
 */
export function parseUserAgent(ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  const uaLower = ua.toLowerCase();

  // 1. Device Type Detection
  let deviceType = 'Desktop';
  const isMobileUA = /mobile|android|touch|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(uaLower);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))|silk/i.test(uaLower) || 
    (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro

  if (isTabletUA) {
    deviceType = 'Tablet';
  } else if (isMobileUA) {
    deviceType = 'Mobile';
  } else if (typeof window !== 'undefined') {
    if (window.innerWidth <= 768 && (navigator.maxTouchPoints || 0) > 0) {
      deviceType = 'Mobile';
    } else if (window.innerWidth <= 1024 && (navigator.maxTouchPoints || 0) > 0) {
      deviceType = 'Tablet';
    }
  }

  // 2. Browser Detection
  let browser = 'Unknown Browser';
  let browserVersion = '';

  if (/edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Microsoft Edge';
    browserVersion = ua.match(/edg\/([0-9.]+)/i)?.[1] || '';
  } else if (/opr\/([0-9.]+)|opera/i.test(ua)) {
    browser = 'Opera';
    browserVersion = ua.match(/opr\/([0-9.]+)/i)?.[1] || '';
  } else if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) {
    browser = 'Google Chrome';
    browserVersion = ua.match(/(?:chrome|crios)\/([0-9.]+)/i)?.[1] || '';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = 'Apple Safari';
    browserVersion = ua.match(/version\/([0-9.]+)/i)?.[1] || '';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
    browserVersion = ua.match(/(?:firefox|fxios)\/([0-9.]+)/i)?.[1] || '';
  } else if (/trident|msie/i.test(ua)) {
    browser = 'Internet Explorer';
    browserVersion = ua.match(/(?:msie |rv:)([0-9.]+)/i)?.[1] || '';
  }

  // 3. Operating System Detection
  let os = 'Unknown OS';
  if (/windows phone/i.test(ua)) {
    os = 'Windows Phone';
  } else if (/win(dows )?nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/win(dows )?nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/win(dows )?nt 6\.2/i.test(ua)) {
    os = 'Windows 8';
  } else if (/win(dows )?nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/android/i.test(ua)) {
    const ver = ua.match(/android\s([0-9.]+)/i);
    os = ver ? `Android ${ver[1]}` : 'Android';
  } else if (/ipad/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    os = 'iPadOS';
  } else if (/iphone/i.test(ua)) {
    const ver = ua.match(/os\s([0-9_]+)/i);
    os = ver ? `iOS ${ver[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/mac os x|macintosh/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  }

  return {
    deviceType,
    browser: browserVersion ? `${browser} (${browserVersion.split('.')[0]})` : browser,
    browserRaw: browser,
    browserVersion: browserVersion || null,
    os,
    rawUserAgent: ua
  };
}

/**
 * Manages persistent visitor & session identity in storage
 */
export function getVisitorIdentity() {
  const VISITOR_KEY = 'ideahub_visitor_id';
  const VISIT_COUNT_KEY = 'ideahub_visit_count';
  const FIRST_VISIT_KEY = 'ideahub_first_visit';
  const SESSION_KEY = 'ideahub_session_id';

  let visitorId = null;
  let isNewVisitor = false;
  let visitCount = 1;
  let firstVisitAt = null;

  try {
    visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = generateUniqueId();
      localStorage.setItem(VISITOR_KEY, visitorId);
      isNewVisitor = true;
      firstVisitAt = new Date().toISOString();
      localStorage.setItem(FIRST_VISIT_KEY, firstVisitAt);
      localStorage.setItem(VISIT_COUNT_KEY, '1');
    } else {
      firstVisitAt = localStorage.getItem(FIRST_VISIT_KEY) || new Date().toISOString();
      const storedCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '1', 10);
      visitCount = storedCount + 1;
      localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());
    }
  } catch {
    visitorId = visitorId || generateUniqueId();
    firstVisitAt = firstVisitAt || new Date().toISOString();
  }

  let sessionId = null;
  try {
    sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateUniqueId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
  } catch {
    sessionId = generateUniqueId();
  }

  return {
    visitorId,
    sessionId,
    isNewVisitor,
    visitCount,
    firstVisitAt
  };
}

/**
 * Fetches public IP address and geolocation with 100% open CORS endpoints & fallbacks
 */
export async function fetchClientIP(timeoutMs = 3500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Strategy 1: ipwho.is (CORS Open '*', HTTPS, Free, rich Geolocation)
  try {
    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        clearTimeout(timeoutId);
        return {
          ip: data.ip || 'Unknown IP',
          city: data.city || null,
          region: data.region || null,
          country: data.country || null,
          countryCode: data.country_code || null,
          postal: data.postal || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          org: data.connection?.org || data.connection?.isp || null,
          asn: data.connection?.asn ? String(data.connection.asn) : null,
          source: 'ipwho.is'
        };
      }
    }
  } catch {
    // Fall through to next strategy
  }

  // Strategy 2: freeipapi.com (CORS Open '*', HTTPS, Free)
  try {
    const res = await fetch('https://freeipapi.com/api/json', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ipAddress) {
        clearTimeout(timeoutId);
        return {
          ip: data.ipAddress || 'Unknown IP',
          city: data.cityName || null,
          region: data.regionName || null,
          country: data.countryName || null,
          countryCode: data.countryCode || null,
          postal: data.zipCode || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          org: null,
          asn: null,
          source: 'freeipapi.com'
        };
      }
    }
  } catch {
    // Fall through to next strategy
  }

  // Strategy 3: api64.ipify.org (CORS Open '*', pure IPv4/IPv6)
  try {
    const res = await fetch('https://api64.ipify.org?format=json', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        clearTimeout(timeoutId);
        return {
          ip: data.ip,
          city: null,
          region: null,
          country: null,
          countryCode: null,
          postal: null,
          latitude: null,
          longitude: null,
          org: null,
          asn: null,
          source: 'api64.ipify.org'
        };
      }
    }
  } catch {
    // Fall through to next strategy
  }

  // Strategy 4: api.ipify.org (CORS Open '*', pure IPv4)
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        clearTimeout(timeoutId);
        return {
          ip: data.ip,
          city: null,
          region: null,
          country: null,
          countryCode: null,
          postal: null,
          latitude: null,
          longitude: null,
          org: null,
          asn: null,
          source: 'api.ipify.org'
        };
      }
    }
  } catch {
    // Failed all lookups
  } finally {
    clearTimeout(timeoutId);
  }

  return {
    ip: 'Unknown IP',
    city: null,
    region: null,
    country: null,
    countryCode: null,
    postal: null,
    latitude: null,
    longitude: null,
    org: null,
    asn: null,
    source: 'none'
  };
}

/**
 * Gathers complete visitor telemetry payload (with 100% non-undefined guaranteed values)
 */
export async function collectVisitorData(extraData = {}) {
  const identity = getVisitorIdentity();
  const uaDetails = parseUserAgent();
  const ipDetails = await fetchClientIP();

  const now = new Date();
  const timezone = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  const timezoneOffsetMinutes = now.getTimezoneOffset();

  // Network connection info (if supported by browser)
  let networkInfo = null;
  if (typeof navigator !== 'undefined' && (navigator.connection || navigator.mozConnection || navigator.webkitConnection)) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    networkInfo = {
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: Boolean(connection.saveData)
    };
  }

  const payload = {
    // 1. Identity & Session
    visitorId: identity.visitorId || generateUniqueId(),
    sessionId: identity.sessionId || generateUniqueId(),
    isNewVisitor: Boolean(identity.isNewVisitor),
    visitCount: identity.visitCount || 1,
    firstVisitAt: identity.firstVisitAt || now.toISOString(),

    // 2. Timestamps
    clientTimestamp: now.toISOString(),
    visitedAtFormatted: now.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: timezone
    }),
    timezone,
    timezoneOffsetMinutes,

    // 3. IP & Geolocation
    ip: ipDetails.ip || 'Unknown IP',
    city: ipDetails.city || null,
    region: ipDetails.region || null,
    country: ipDetails.country || null,
    countryCode: ipDetails.countryCode || null,
    postal: ipDetails.postal || null,
    latitude: ipDetails.latitude || null,
    longitude: ipDetails.longitude || null,
    ispOrOrg: ipDetails.org || null,
    ipLookupSource: ipDetails.source || 'unknown',

    // 4. Device & Browser
    deviceType: uaDetails.deviceType || 'Desktop',
    browser: uaDetails.browser || 'Unknown Browser',
    browserName: uaDetails.browserRaw || 'Unknown',
    browserVersion: uaDetails.browserVersion || null,
    os: uaDetails.os || 'Unknown OS',
    platform: (typeof navigator !== 'undefined' && (navigator.userAgentData?.platform || navigator.platform)) || 'Unknown',
    userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || '',
    touchSupport: typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0,
    maxTouchPoints: (typeof navigator !== 'undefined' && navigator.maxTouchPoints) || 0,
    hardwareConcurrency: (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || null,
    deviceMemoryGB: (typeof navigator !== 'undefined' && navigator.deviceMemory) || null,

    // 5. Screen & Viewport Specs
    screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080',
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 1920,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 1080,
    viewportSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080',
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    colorDepth: typeof window !== 'undefined' ? (window.screen.colorDepth || 24) : 24,
    pixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
    orientation: typeof window !== 'undefined' && window.screen.orientation ? window.screen.orientation.type : 'landscape-primary',

    // 6. Page & Navigation Details
    pageUrl: typeof window !== 'undefined' ? window.location.href : '/',
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    searchParams: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    pageTitle: typeof document !== 'undefined' ? document.title : 'IdeaHub',
    referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : 'Direct / Bookmark',
    language: (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en',
    preferredLanguages: typeof navigator !== 'undefined' && Array.isArray(navigator.languages) ? [...navigator.languages] : ['en'],

    // 7. Network Quality
    network: networkInfo,

    // 8. Custom Extra Data
    ...extraData
  };

  return sanitizeForFirestore(payload);
}
