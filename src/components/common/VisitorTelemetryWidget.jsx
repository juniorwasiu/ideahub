import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Shield,
  Database,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import { subscribeToVisitorLogs, trackVisitor } from '../../services/visitorTracker';
import { isFirebaseConfigured } from '../../services/firebase';

export function VisitorTelemetryWidget({ currentVisitorData, isTracking, onOpenFullAnalytics }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'live_logs' | 'setup'
  const [liveLogs, setLiveLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualStatus, setManualStatus] = useState(null);

  // Subscribe to live logs when widget is opened
  useEffect(() => {
    if (!isOpen || !isFirebaseConfigured) return;

    const unsubscribe = subscribeToVisitorLogs((logs) => {
      setLiveLogs(logs);
    }, 25);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  const handleManualTrack = async () => {
    setIsRefreshing(true);
    setManualStatus(null);
    try {
      const res = await trackVisitor({ manualTrigger: true, triggeredAt: new Date().toISOString() });
      if (res.success) {
        setManualStatus({ type: 'success', text: 'Visit recorded successfully!' });
      } else {
        setManualStatus({ type: 'error', text: res.error || 'Failed to record' });
      }
    } catch (e) {
      setManualStatus({ type: 'error', text: e.message });
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setManualStatus(null), 4000);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-amber-400" />;
      default:
        return <Monitor className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <aside className="telemetry-widget-container" aria-label="Visitor Tracking and Analytics">
      {/* Floating Pill Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="telemetry-pill-btn"
          title="Open Visitor Telemetry & Firebase Analytics"
          aria-expanded={isOpen}
          aria-controls="telemetry-drawer-panel"
        >
          <span className="telemetry-pulse-dot"></span>
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="telemetry-pill-text">
            {isFirebaseConfigured ? 'Firebase Tracker Active' : 'Visitor Tracker (Local)'}
          </span>
          {currentVisitorData?.ip && (
            <span className="telemetry-ip-badge">{currentVisitorData.ip}</span>
          )}
        </button>
      )}

      {/* Expanded Telemetry Drawer */}
      {isOpen && (
        <div id="telemetry-drawer-panel" className="telemetry-modal-overlay">
          <div className="telemetry-modal-card">
            {/* Header */}
            <div className="telemetry-card-header">
              <div className="telemetry-header-left">
                <div className="telemetry-icon-box">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="telemetry-title">Visitor Telemetry & Database Hub</h3>
                  <p className="telemetry-subtitle">
                    Real-time IP, device, browser & Firestore visit logger
                  </p>
                </div>
              </div>
              <div className="telemetry-header-right">
                {onOpenFullAnalytics && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenFullAnalytics();
                    }}
                    className="telemetry-action-btn highlight-analytics-btn"
                    title="Open Full Analytics Dashboard (/analytics/overview)"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Full Analytics (/analytics/overview)</span>
                  </button>
                )}
                <button
                  onClick={handleManualTrack}
                  disabled={isRefreshing}
                  className="telemetry-action-btn"
                  title="Send another test tracking ping"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Ping Visit</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="telemetry-close-btn"
                  aria-label="Close telemetry widget"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`telemetry-status-banner ${isFirebaseConfigured ? 'status-connected' : 'status-demo'}`}>
              <div className="status-banner-content">
                {isFirebaseConfigured ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Firestore Connected:</strong> Tracking records are being committed to Cloud Firestore (collection: <code>visitor_logs</code>).
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      <strong>Local Telemetry Engine:</strong> Capturing complete device/IP payload. Add your Firebase keys in <code>.env</code> to stream to Cloud Firestore.
                    </span>
                  </>
                )}
              </div>
            </div>

            {manualStatus && (
              <div className={`manual-status-toast status-${manualStatus.type}`}>
                {manualStatus.text}
              </div>
            )}

            {/* Tabs */}
            <div className="telemetry-tabs">
              <button
                className={`telemetry-tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                <UserCheck className="w-4 h-4" />
                Current Visitor Details
              </button>
              <button
                className={`telemetry-tab-btn ${activeTab === 'live_logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('live_logs')}
              >
                <Eye className="w-4 h-4" />
                Recent Database Logs {liveLogs.length > 0 && `(${liveLogs.length})`}
              </button>
              <button
                className={`telemetry-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
                onClick={() => setActiveTab('setup')}
              >
                <Database className="w-4 h-4" />
                Firebase Setup
              </button>
            </div>

            {/* Tab Contents */}
            <div className="telemetry-tab-body">
              {/* TAB 1: Current Visitor Info */}
              {activeTab === 'current' && (
                <div className="telemetry-grid">
                  {/* IP & Location */}
                  <div className="telemetry-data-card">
                    <div className="data-card-title">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Network & Geolocation</span>
                    </div>
                    <div className="data-rows">
                      <div className="data-row">
                        <span className="row-label">Public IP</span>
                        <span className="row-value highlight-ip">
                          {currentVisitorData?.ip || (isTracking ? 'Detecting...' : 'Fetching IP...')}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">City / Country</span>
                        <span className="row-value">
                          {currentVisitorData?.city
                            ? `${currentVisitorData.city}, ${currentVisitorData.country || ''}`
                            : currentVisitorData?.country || 'Detecting Geolocation...'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">ISP / Org</span>
                        <span className="row-value">{currentVisitorData?.ispOrOrg || 'N/A'}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Timezone</span>
                        <span className="row-value">{currentVisitorData?.timezone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Device & Hardware */}
                  <div className="telemetry-data-card">
                    <div className="data-card-title">
                      {getDeviceIcon(currentVisitorData?.deviceType)}
                      <span>Device & Hardware</span>
                    </div>
                    <div className="data-rows">
                      <div className="data-row">
                        <span className="row-label">Device Type</span>
                        <span className="row-value badge-pill">
                          {currentVisitorData?.deviceType || 'Desktop'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Operating System</span>
                        <span className="row-value">{currentVisitorData?.os || 'Detecting...'}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Browser</span>
                        <span className="row-value">{currentVisitorData?.browser || 'Detecting...'}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Screen Resolution</span>
                        <span className="row-value">{currentVisitorData?.screenResolution || `${window.screen.width}x${window.screen.height}`}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Viewport Size</span>
                        <span className="row-value">{currentVisitorData?.viewportSize || `${window.innerWidth}x${window.innerHeight}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Session & Timestamp */}
                  <div className="telemetry-data-card">
                    <div className="data-card-title">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Visit Time & Session</span>
                    </div>
                    <div className="data-rows">
                      <div className="data-row">
                        <span className="row-label">Visited At</span>
                        <span className="row-value font-mono text-xs">
                          {currentVisitorData?.visitedAtFormatted || 'Recorded on load'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Visitor ID</span>
                        <span className="row-value font-mono text-xs truncate max-w-[180px]" title={currentVisitorData?.visitorId}>
                          {currentVisitorData?.visitorId || 'Generating...'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Visit Count</span>
                        <span className="row-value badge-pill">
                          {currentVisitorData?.visitCount ? `#${currentVisitorData.visitCount}` : '#1 (New)'}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Referrer</span>
                        <span className="row-value">{currentVisitorData?.referrer || 'Direct'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Page & Navigation */}
                  <div className="telemetry-data-card">
                    <div className="data-card-title">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>Page & System Features</span>
                    </div>
                    <div className="data-rows">
                      <div className="data-row">
                        <span className="row-label">Pathname</span>
                        <span className="row-value font-mono">{currentVisitorData?.pathname || window.location.pathname}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Browser Language</span>
                        <span className="row-value">{currentVisitorData?.language || navigator.language}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">Touch Support</span>
                        <span className="row-value">{currentVisitorData?.touchSupport ? 'Yes (Touchscreen)' : 'No (Mouse / Trackpad)'}</span>
                      </div>
                      <div className="data-row">
                        <span className="row-label">CPU Cores</span>
                        <span className="row-value">{navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Live Logs in Firebase */}
              {activeTab === 'live_logs' && (
                <div className="telemetry-logs-view">
                  {!isFirebaseConfigured ? (
                    <div className="empty-logs-state">
                      <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                      <h4>Firebase Credentials Required for Live Cloud Stream</h4>
                      <p>
                        Fill in your Firebase credentials in <code>.env</code> to stream real-time visit logs from Cloud Firestore.
                      </p>
                      <button
                        onClick={() => setActiveTab('setup')}
                        className="telemetry-btn-primary mt-3"
                      >
                        View Firebase Setup Guide
                      </button>
                    </div>
                  ) : liveLogs.length === 0 ? (
                    <div className="empty-logs-state">
                      <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-2" />
                      <p>Listening to Firestore <code>visitor_logs</code> collection...</p>
                    </div>
                  ) : (
                    <div className="logs-table-wrapper">
                      <table className="logs-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>IP Address</th>
                            <th>Location</th>
                            <th>Device / OS</th>
                            <th>Browser</th>
                            <th>Page</th>
                            <th>Visits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="font-mono text-xs text-slate-300">
                                {log.visitedAtFormatted || log.clientTimestamp?.split('T')[1]?.split('.')[0] || 'Just now'}
                              </td>
                              <td className="font-mono font-medium text-emerald-400">
                                {log.ip || 'Unknown'}
                              </td>
                              <td className="text-slate-300 text-xs">
                                {log.city ? `${log.city}, ${log.countryCode || log.country}` : log.country || '—'}
                              </td>
                              <td>
                                <span className="device-tag">
                                  {log.deviceType || 'Desktop'} · {log.os || 'OS'}
                                </span>
                              </td>
                              <td className="text-xs text-slate-300">{log.browser || '—'}</td>
                              <td className="font-mono text-xs text-indigo-300">{log.pathname || '/'}</td>
                              <td>
                                <span className="visit-badge">#{log.visitCount || 1}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Firebase Setup Instructions */}
              {activeTab === 'setup' && (
                <div className="telemetry-setup-view">
                  <h4 className="setup-heading">How to connect your Firebase Database:</h4>
                  <ol className="setup-steps">
                    <li>
                      <strong>1. Create/Open a Firebase Project:</strong>
                      <p>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">Firebase Console</a>, create or select your project.</p>
                    </li>
                    <li>
                      <strong>2. Create Firestore Database:</strong>
                      <p>Navigate to <em>Build → Firestore Database</em> and click <strong>Create database</strong> (choose your closest region).</p>
                    </li>
                    <li>
                      <strong>3. Register Web App & Copy Keys:</strong>
                      <p>In Project Settings &gt; General &gt; Your apps &gt; Web app (<code>&lt;/&gt;</code>), copy the config object.</p>
                    </li>
                    <li>
                      <strong>4. Add Keys to your <code>.env</code> file:</strong>
                      <pre className="setup-code-block">
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456`}
                      </pre>
                    </li>
                    <li>
                      <strong>5. Apply Firestore Security Rules:</strong>
                      <p>We created a pre-configured <code className="text-emerald-400">firestore.rules</code> file in your project root ready to deploy or paste into the Firebase Rules tab.</p>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="telemetry-card-footer">
              <span className="text-xs text-slate-400">
                Data fields tracked: <code>ip</code>, <code>visitedAt</code>, <code>deviceType</code>, <code>browser</code>, <code>os</code>, <code>screenResolution</code>, <code>city</code>, <code>country</code>, <code>visitorId</code>, <code>sessionId</code>
              </span>
              <button onClick={() => setIsOpen(false)} className="telemetry-btn-secondary">
                Minimize
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
