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
 * Parses userAgent to extract Device Type, Operating System, and Browser details
 */
export function parseUserAgent(ua = navigator.userAgent) {
  const uaLower = ua.toLowerCase();

  // 1. Device Type Detection
  let deviceType = 'Desktop';
  const isMobileUA = /mobile|android|touch|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(uaLower);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))|silk/i.test(uaLower) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro

  if (isTabletUA) {
    deviceType = 'Tablet';
  } else if (isMobileUA) {
    deviceType = 'Mobile';
  } else if (window.innerWidth <= 768 && navigator.maxTouchPoints > 0) {
    deviceType = 'Mobile';
  } else if (window.innerWidth <= 1024 && navigator.maxTouchPoints > 0) {
    deviceType = 'Tablet';
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
  } else if (/ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
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
    browserVersion,
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
 * Fetches public IP address and geolocation with fast fallbacks & timeouts
 */
export async function fetchClientIP(timeoutMs = 3500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Strategy 1: ipapi.co (Returns IP + City + Country + Region + Org)
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      clearTimeout(timeoutId);
      return {
        ip: data.ip || 'Unknown IP',
        city: data.city || null,
        region: data.region || null,
        country: data.country_name || data.country || null,
        countryCode: data.country_code || null,
        postal: data.postal || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        org: data.org || null,
        asn: data.asn || null,
        source: 'ipapi.co'
      };
    }
  } catch {
    // Proceed to fallback
  }

  // Strategy 2: ipify.org (Reliable pure IP fallback)
  try {
    const res = await fetch('https://api64.ipify.org?format=json', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      clearTimeout(timeoutId);
      return {
        ip: data.ip || 'Unknown IP',
        city: null,
        region: null,
        country: null,
        countryCode: null,
        org: null,
        source: 'ipify.org'
      };
    }
  } catch {
    // Proceed to fallback
  }

  // Strategy 3: api.ipify.org IPv4
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      clearTimeout(timeoutId);
      return {
        ip: data.ip || 'Unknown IP',
        city: null,
        region: null,
        country: null,
        countryCode: null,
        org: null,
        source: 'api.ipify.org'
      };
    }
  } catch {
    // Both failed or timed out
  } finally {
    clearTimeout(timeoutId);
  }

  return {
    ip: 'Unknown (Client-side lookup restricted or offline)',
    city: null,
    region: null,
    country: null,
    countryCode: null,
    org: null,
    source: 'none'
  };
}

/**
 * Gathers complete visitor telemetry payload
 */
export async function collectVisitorData(extraData = {}) {
  const identity = getVisitorIdentity();
  const uaDetails = parseUserAgent();
  const ipDetails = await fetchClientIP();

  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const timezoneOffsetMinutes = now.getTimezoneOffset();

  // Network connection info (if supported by browser)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const networkInfo = connection ? {
    effectiveType: connection.effectiveType || null,
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
    saveData: connection.saveData || false
  } : null;

  return {
    // 1. Identity & Session
    visitorId: identity.visitorId,
    sessionId: identity.sessionId,
    isNewVisitor: identity.isNewVisitor,
    visitCount: identity.visitCount,
    firstVisitAt: identity.firstVisitAt,

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
    ip: ipDetails.ip,
    city: ipDetails.city,
    region: ipDetails.region,
    country: ipDetails.country,
    countryCode: ipDetails.countryCode,
    postal: ipDetails.postal,
    latitude: ipDetails.latitude,
    longitude: ipDetails.longitude,
    ispOrOrg: ipDetails.org,
    ipLookupSource: ipDetails.source,

    // 4. Device & Browser
    deviceType: uaDetails.deviceType,
    browser: uaDetails.browser,
    browserName: uaDetails.browserRaw,
    browserVersion: uaDetails.browserVersion,
    os: uaDetails.os,
    platform: navigator.userAgentData?.platform || navigator.platform || 'Unknown',
    userAgent: navigator.userAgent,
    touchSupport: (navigator.maxTouchPoints || 0) > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemoryGB: navigator.deviceMemory || null,

    // 5. Screen & Viewport Specs
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    colorDepth: window.screen.colorDepth || 24,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: window.screen.orientation ? window.screen.orientation.type : (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'),

    // 6. Page & Navigation Details
    pageUrl: window.location.href,
    pathname: window.location.pathname,
    searchParams: window.location.search,
    hash: window.location.hash,
    pageTitle: document.title,
    referrer: document.referrer ? document.referrer : 'Direct / Bookmark',
    language: navigator.language || navigator.userLanguage || 'en',
    preferredLanguages: Array.isArray(navigator.languages) ? [...navigator.languages] : [navigator.language],

    // 7. Network Quality
    network: networkInfo,

    // 8. Custom Extra Data (e.g. actions, tags, UTM campaign params)
    ...extraData
  };
}
