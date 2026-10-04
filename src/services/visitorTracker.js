import {
  db,
  isFirebaseConfigured,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs
} from './firebase';
import { collectVisitorData } from '../utils/deviceInfo';

// Throttle check to avoid duplicate recordings on rapid React re-renders
let lastTrackedUrl = '';
let lastTrackedTime = 0;
const THROTTLE_MS = 3000; // 3 seconds throttle for same exact URL in same session

/**
 * Tracks and logs visitor details into Firebase Firestore
 * @param {Object} extraData Optional custom metadata to attach to the log
 * @returns {Promise<{success: boolean, logId?: string, data: Object, error?: any}>}
 */
export async function trackVisitor(extraData = {}) {
  const currentUrl = window.location.href;
  const now = Date.now();

  // Deduplicate rapid duplicate calls on the exact same page within short interval
  if (lastTrackedUrl === currentUrl && now - lastTrackedTime < THROTTLE_MS) {
    return { success: true, deduplicated: true };
  }
  lastTrackedUrl = currentUrl;
  lastTrackedTime = now;

  try {
    // 1. Gather all hardware, IP, geolocation, browser, and navigation info
    const visitorData = await collectVisitorData(extraData);

    console.groupCollapsed(`[VisitorTracker] 📡 Tracked Visit: ${visitorData.ip} (${visitorData.deviceType} - ${visitorData.browser})`);
    console.log('Telemetry payload:', visitorData);
    console.groupEnd();

    // 2. If Firebase is configured and initialized, write to Firestore
    if (isFirebaseConfigured && db) {
      // 2a. Add an immutable visit log record to `visitor_logs`
      const logPayload = {
        ...visitorData,
        createdAt: serverTimestamp(),
        recordedVia: 'web_sdk_v9'
      };

      const logDocRef = await addDoc(collection(db, 'visitor_logs'), logPayload);

      // 2b. Upsert aggregate visitor profile in `visitors/{visitorId}`
      try {
        const visitorProfileRef = doc(db, 'visitors', visitorData.visitorId);
        await setDoc(
          visitorProfileRef,
          {
            visitorId: visitorData.visitorId,
            lastSeen: serverTimestamp(),
            lastSeenIso: visitorData.clientTimestamp,
            lastIp: visitorData.ip,
            lastCity: visitorData.city,
            lastCountry: visitorData.country,
            lastDevice: visitorData.deviceType,
            lastBrowser: visitorData.browser,
            lastOs: visitorData.os,
            lastPathname: visitorData.pathname,
            totalVisits: visitorData.visitCount,
            firstVisitAt: visitorData.firstVisitAt,
            screenResolution: visitorData.screenResolution,
            language: visitorData.language
          },
          { merge: true }
        );
      } catch (profileErr) {
        console.warn('[VisitorTracker] Profile aggregation note:', profileErr?.message);
      }

      return {
        success: true,
        logId: logDocRef.id,
        visitorData,
        isConfigured: true
      };
    } else {
      // Fallback mode when Firebase credentials are pending
      console.warn(
        '[VisitorTracker] Firebase credentials not configured yet. Telemetry recorded locally in memory/console. Set up .env with Firebase keys to persist to Firestore.'
      );
      return {
        success: true,
        logId: 'local_preview_' + Date.now(),
        visitorData,
        isConfigured: false
      };
    }
  } catch (err) {
    console.error('[VisitorTracker] Failed to record visitor:', err);
    return {
      success: false,
      error: err?.message || 'Unknown tracking error'
    };
  }
}

/**
 * Real-time listener for recent visitor logs (for admin/monitoring dashboards)
 * @param {Function} callback Callback receiving the logs array
 * @param {number} maxEntries Maximum logs to stream (default: 50)
 * @returns {Function} Unsubscribe function
 */
export function subscribeToVisitorLogs(callback, maxEntries = 50) {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'visitor_logs'),
      orderBy('createdAt', 'desc'),
      limit(maxEntries)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        callback(logs);
      },
      (error) => {
        console.error('[VisitorTracker] Firestore subscription error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('[VisitorTracker] Error setting up logs listener:', err);
    return () => {};
  }
}

/**
 * Fetch one-time snapshot of recent logs
 */
export async function getRecentVisitorLogs(maxEntries = 50) {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'visitor_logs'),
      orderBy('createdAt', 'desc'),
      limit(maxEntries)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (err) {
    console.error('[VisitorTracker] Error fetching visitor logs:', err);
    return [];
  }
}
