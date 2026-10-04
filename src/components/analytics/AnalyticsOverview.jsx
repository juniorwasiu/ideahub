import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  ArrowLeft,
  Check,
  Copy,
  Database,
  Download,
  Eye,
  Filter,
  Globe,
  HardDrive,
  Maximize2,
  Monitor,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Tablet,
  Users,
  X,
  Zap
} from 'lucide-react';
import { subscribeToVisitorLogs, trackVisitor } from '../../services/visitorTracker';
import { isFirebaseConfigured } from '../../services/firebase';

export function AnalyticsOverview({ onNavigateHome }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(() => isFirebaseConfigured);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | '30DAYS'
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState(null);

  // Set document title
  useEffect(() => {
    document.title = 'Analytics Overview — IdeaHub Visitor Intelligence';
    return () => {
      document.title = 'HUAWEI IdeaHub: Next-Gen Smart Boards for Business & Education';
    };
  }, []);

  // Listen to Firestore real-time visitor logs
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToVisitorLogs((newLogs) => {
      setLogs(newLogs);
      setLoading(false);
    }, 150);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Copy helper
  const handleCopy = useCallback((text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  // Manual test ping
  const handlePingTestVisit = async () => {
    setIsPinging(true);
    setPingMessage(null);
    try {
      const res = await trackVisitor({
        source: 'analytics_overview_manual_ping',
        triggeredFrom: '/analytics/overview'
      });
      if (res.success) {
        setPingMessage({ type: 'success', text: 'Test visit recorded in Firestore!' });
      } else {
        setPingMessage({ type: 'error', text: res.error || 'Failed to record test visit' });
      }
    } catch (e) {
      setPingMessage({ type: 'error', text: e?.message || 'Error executing ping' });
    } finally {
      setIsPinging(false);
      setTimeout(() => setPingMessage(null), 4000);
    }
  };

  // Time filter check
  const matchesTimeFilter = useCallback((log) => {
    if (timeFilter === 'ALL') return true;
    const logDate = log.clientTimestamp ? new Date(log.clientTimestamp) : null;
    if (!logDate || isNaN(logDate.getTime())) return true;

    const now = new Date();
    const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);

    if (timeFilter === 'TODAY') return diffHours <= 24;
    if (timeFilter === '7DAYS') return diffHours <= 24 * 7;
    if (timeFilter === '30DAYS') return diffHours <= 24 * 30;
    return true;
  }, [timeFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Time filter
      if (!matchesTimeFilter(log)) return false;

      // 2. Device filter
      if (deviceFilter !== 'ALL') {
        if ((log.deviceType || '').toUpperCase() !== deviceFilter) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ip = (log.ip || '').toLowerCase();
        const city = (log.city || '').toLowerCase();
        const country = (log.country || '').toLowerCase();
        const os = (log.os || '').toLowerCase();
        const browser = (log.browser || '').toLowerCase();
        const path = (log.pathname || '').toLowerCase();
        const visitorId = (log.visitorId || '').toLowerCase();
        const org = (log.ispOrOrg || '').toLowerCase();

        return (
          ip.includes(q) ||
          city.includes(q) ||
          country.includes(q) ||
          os.includes(q) ||
          browser.includes(q) ||
          path.includes(q) ||
          visitorId.includes(q) ||
          org.includes(q)
        );
      }

      return true;
    });
  }, [logs, matchesTimeFilter, deviceFilter, searchQuery]);

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    const totalVisits = filteredLogs.length;
    const uniqueVisitors = new Set(filteredLogs.map((l) => l.visitorId).filter(Boolean)).size;

    // Device breakdown
    const devices = { Desktop: 0, Mobile: 0, Tablet: 0, Other: 0 };
    const browsers = {};
    const oss = {};
    const countries = {};
    const resolutions = {};

    filteredLogs.forEach((l) => {
      // Device
      const dev = l.deviceType || 'Desktop';
      if (devices[dev] !== undefined) devices[dev]++;
      else devices.Other++;

      // Browser
      const b = l.browserName || l.browser?.split(' ')[0] || 'Other';
      browsers[b] = (browsers[b] || 0) + 1;

      // OS
      const o = l.os?.split(' ')[0] || 'Other';
      oss[o] = (oss[o] || 0) + 1;

      // Country
      const c = l.country || 'Unknown';
      countries[c] = (countries[c] || 0) + 1;

      // Resolution
      const res = l.screenResolution || 'Unknown';
      resolutions[res] = (resolutions[res] || 0) + 1;
    });

    const topBrowser = Object.entries(browsers).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const topCountry = Object.entries(countries).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const topResolution = Object.entries(resolutions).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const desktopPct = totalVisits ? Math.round((devices.Desktop / totalVisits) * 100) : 0;
    const mobilePct = totalVisits ? Math.round((devices.Mobile / totalVisits) * 100) : 0;
    const tabletPct = totalVisits ? Math.round((devices.Tablet / totalVisits) * 100) : 0;

    return {
      totalVisits,
      uniqueVisitors,
      desktopPct,
      mobilePct,
      tabletPct,
      devices,
      browsers,
      oss,
      countries,
      topBrowser,
      topCountry,
      topResolution,
      avgVisitsPerUser: uniqueVisitors ? (totalVisits / uniqueVisitors).toFixed(1) : '1.0'
    };
  }, [filteredLogs]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Timestamp (ISO)',
      'Timestamp (Local)',
      'IP Address',
      'Country',
      'City',
      'Region',
      'ISP / Org',
      'Device Type',
      'Operating System',
      'Browser',
      'Browser Version',
      'Screen Resolution',
      'Viewport Size',
      'Visitor ID',
      'Session ID',
      'Visit Count',
      'Pathname',
      'Referrer',
      'Language'
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.clientTimestamp || ''}"`,
      `"${log.visitedAtFormatted || ''}"`,
      `"${log.ip || ''}"`,
      `"${log.country || ''}"`,
      `"${log.city || ''}"`,
      `"${log.region || ''}"`,
      `"${log.ispOrOrg || ''}"`,
      `"${log.deviceType || ''}"`,
      `"${log.os || ''}"`,
      `"${log.browserName || log.browser || ''}"`,
      `"${log.browserVersion || ''}"`,
      `"${log.screenResolution || ''}"`,
      `"${log.viewportSize || ''}"`,
      `"${log.visitorId || ''}"`,
      `"${log.sessionId || ''}"`,
      log.visitCount || 1,
      `"${log.pathname || ''}"`,
      `"${log.referrer || ''}"`,
      `"${log.language || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ideahub_visitor_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredLogs]);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    if (filteredLogs.length === 0) return;
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ideahub_visitor_analytics_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredLogs]);

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
    <div className="analytics-dashboard-root">
      {/* Top Navigation Bar */}
      <header className="analytics-navbar">
        <div className="analytics-nav-container">
          <div className="analytics-brand-area">
            <button
              onClick={onNavigateHome}
              className="analytics-back-btn"
              title="Return to IdeaHub Homepage"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Website</span>
            </button>
            <div className="analytics-brand-divider"></div>
            <div className="analytics-title-group">
              <div className="analytics-logo-badge">
                <Database className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h1 className="analytics-header-title">IdeaHub Visitor Intelligence</h1>
                <span className="analytics-route-tag">/analytics/overview</span>
              </div>
            </div>
          </div>

          <div className="analytics-actions-area">
            {/* Live Firestore Connection Status */}
            <div className={`analytics-live-status ${isFirebaseConfigured ? 'status-live' : 'status-demo'}`}>
              <span className="live-dot"></span>
              <span>{isFirebaseConfigured ? 'Live Cloud Firestore' : 'Demo Mode (Local)'}</span>
            </div>

            {/* Test Ping Button */}
            <button
              onClick={handlePingTestVisit}
              disabled={isPinging}
              className="analytics-btn-ping"
              title="Record a test visit entry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Ping Test Visit</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="analytics-export-group">
              <button
                onClick={exportToCSV}
                disabled={filteredLogs.length === 0}
                className="analytics-btn-export"
                title="Download records as CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={exportToJSON}
                disabled={filteredLogs.length === 0}
                className="analytics-btn-export"
                title="Download records as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="analytics-content-container">
        {/* Ping Toast Banner */}
        {pingMessage && (
          <div className={`analytics-toast-banner toast-${pingMessage.type}`}>
            {pingMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{pingMessage.text}</span>
          </div>
        )}

        {/* Hero Section & Filter Bar */}
        <section className="analytics-controls-card">
          <div className="controls-left">
            <h2 className="controls-heading">Traffic & Visitor Telemetry Overview</h2>
            <p className="controls-description">
              Real-time telemetry capturing IP addresses, timestamps, hardware devices, operating systems, browsers, and geolocation from Cloud Firestore.
            </p>
          </div>

          <div className="controls-right">
            {/* Search Box */}
            <div className="analytics-search-box">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IP, Country, City, Browser, OS..."
                className="analytics-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-clear-btn" aria-label="Clear search">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Time Filter Buttons */}
            <div className="analytics-filter-pills">
              <button
                onClick={() => setTimeFilter('ALL')}
                className={`filter-pill ${timeFilter === 'ALL' ? 'active' : ''}`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter('TODAY')}
                className={`filter-pill ${timeFilter === 'TODAY' ? 'active' : ''}`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter('7DAYS')}
                className={`filter-pill ${timeFilter === '7DAYS' ? 'active' : ''}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeFilter('30DAYS')}
                className={`filter-pill ${timeFilter === '30DAYS' ? 'active' : ''}`}
              >
                30 Days
              </button>
            </div>

            {/* Device Filter Dropdown */}
            <div className="analytics-device-filter">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="device-select"
                aria-label="Filter by device type"
              >
                <option value="ALL">All Devices</option>
                <option value="DESKTOP">Desktop Only</option>
                <option value="MOBILE">Mobile Only</option>
                <option value="TABLET">Tablet Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* KPI Metrics Cards */}
        <section className="analytics-kpi-grid">
          {/* Card 1: Total Visits */}
          <div className="kpi-card kpi-card-gradient-1">
            <div className="kpi-card-header">
              <span className="kpi-title">Total Page Visits</span>
              <div className="kpi-icon-wrapper icon-blue">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-main-number">{stats.totalVisits}</span>
              <span className="kpi-trend-tag">Live Stream</span>
            </div>
            <p className="kpi-footnote">Recorded visits across all pages</p>
          </div>

          {/* Card 2: Unique Visitors */}
          <div className="kpi-card kpi-card-gradient-2">
            <div className="kpi-card-header">
              <span className="kpi-title">Unique Visitors</span>
              <div className="kpi-icon-wrapper icon-emerald">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-main-number">{stats.uniqueVisitors}</span>
              <span className="kpi-secondary-badge">
                {stats.avgVisitsPerUser} visits/user
              </span>
            </div>
            <p className="kpi-footnote">Identified by persistent visitor IDs</p>
          </div>

          {/* Card 3: Device Split */}
          <div className="kpi-card kpi-card-gradient-3">
            <div className="kpi-card-header">
              <span className="kpi-title">Device Breakdown</span>
              <div className="kpi-icon-wrapper icon-purple">
                <Monitor className="w-5 h-5" />
              </div>
            </div>
            <div className="kpi-device-progress">
              <div className="device-progress-bar">
                <div
                  className="bar-segment bar-desktop"
                  style={{ width: `${stats.desktopPct}%` }}
                  title={`Desktop: ${stats.desktopPct}%`}
                ></div>
                <div
                  className="bar-segment bar-mobile"
                  style={{ width: `${stats.mobilePct}%` }}
                  title={`Mobile: ${stats.mobilePct}%`}
                ></div>
                <div
                  className="bar-segment bar-tablet"
                  style={{ width: `${stats.tabletPct}%` }}
                  title={`Tablet: ${stats.tabletPct}%`}
                ></div>
              </div>
              <div className="device-legend-row">
                <span>💻 {stats.desktopPct}% Desktop</span>
                <span>📱 {stats.mobilePct}% Mobile</span>
                <span>📟 {stats.tabletPct}% Tablet</span>
              </div>
            </div>
          </div>

          {/* Card 4: Top Country / Location */}
          <div className="kpi-card kpi-card-gradient-4">
            <div className="kpi-card-header">
              <span className="kpi-title">Top Geographic Origin</span>
              <div className="kpi-icon-wrapper icon-amber">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-main-string">{stats.topCountry}</span>
            </div>
            <p className="kpi-footnote">Leading source of visitor traffic</p>
          </div>
        </section>

        {/* Analytics Breakdown Charts & Distributions */}
        <section className="analytics-breakdown-grid">
          {/* Top Operating Systems */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <h3 className="breakdown-title">Operating Systems</h3>
            </div>
            <div className="breakdown-list">
              {Object.entries(stats.oss).length === 0 ? (
                <p className="empty-subtext">No OS data recorded yet</p>
              ) : (
                Object.entries(stats.oss)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([osName, count]) => {
                    const pct = stats.totalVisits ? Math.round((count / stats.totalVisits) * 100) : 0;
                    return (
                      <div key={osName} className="breakdown-item">
                        <div className="breakdown-item-label">
                          <span>{osName}</span>
                          <span className="breakdown-count">{count} visits ({pct}%)</span>
                        </div>
                        <div className="breakdown-mini-bar">
                          <div className="mini-fill fill-sky" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Top Browsers */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="breakdown-title">Browsers Distribution</h3>
            </div>
            <div className="breakdown-list">
              {Object.entries(stats.browsers).length === 0 ? (
                <p className="empty-subtext">No browser data recorded yet</p>
              ) : (
                Object.entries(stats.browsers)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([browserName, count]) => {
                    const pct = stats.totalVisits ? Math.round((count / stats.totalVisits) * 100) : 0;
                    return (
                      <div key={browserName} className="breakdown-item">
                        <div className="breakdown-item-label">
                          <span>{browserName}</span>
                          <span className="breakdown-count">{count} visits ({pct}%)</span>
                        </div>
                        <div className="breakdown-mini-bar">
                          <div className="mini-fill fill-emerald" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Top Countries */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <Globe className="w-4 h-4 text-purple-400" />
              <h3 className="breakdown-title">Top Countries</h3>
            </div>
            <div className="breakdown-list">
              {Object.entries(stats.countries).length === 0 ? (
                <p className="empty-subtext">No geolocation data recorded yet</p>
              ) : (
                Object.entries(stats.countries)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([countryName, count]) => {
                    const pct = stats.totalVisits ? Math.round((count / stats.totalVisits) * 100) : 0;
                    return (
                      <div key={countryName} className="breakdown-item">
                        <div className="breakdown-item-label">
                          <span>{countryName}</span>
                          <span className="breakdown-count">{count} visits ({pct}%)</span>
                        </div>
                        <div className="breakdown-mini-bar">
                          <div className="mini-fill fill-purple" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </section>

        {/* Real-time Detailed Visitor Logs Table */}
        <section className="analytics-table-section">
          <div className="table-section-header">
            <div className="table-header-left">
              <Eye className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="table-title">Live Visitor Telemetry Feed</h3>
                <p className="table-subtitle">
                  Showing {filteredLogs.length} of {logs.length} total database records
                </p>
              </div>
            </div>
            <div className="table-header-right">
              <span className="auto-refresh-indicator">
                <span className="ping-dot"></span>
                Auto-syncing with Cloud Firestore
              </span>
            </div>
          </div>

          {loading ? (
            <div className="table-loading-state">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-3" />
              <h4>Loading Firestore logs...</h4>
              <p>Fetching real-time records from collection <code>visitor_logs</code></p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="table-empty-state">
              <Database className="w-12 h-12 text-slate-500 mb-3" />
              <h4>No Visitor Logs Found</h4>
              <p>
                {searchQuery || deviceFilter !== 'ALL' || timeFilter !== 'ALL'
                  ? 'Try clearing your search query or adjusting your filters.'
                  : 'No visits have been recorded yet. Click below to record a test visit or open the main landing page!'}
              </p>
              <button onClick={handlePingTestVisit} className="analytics-btn-primary mt-4">
                <Zap className="w-4 h-4" />
                <span>Send First Test Visit</span>
              </button>
            </div>
          ) : (
            <div className="table-scroll-container">
              <table className="analytics-data-table">
                <thead>
                  <tr>
                    <th>Visit Time</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Device & OS</th>
                    <th>Browser</th>
                    <th>Screen & Viewport</th>
                    <th>Page / Referrer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="table-data-row">
                      {/* 1. Time */}
                      <td>
                        <div className="time-cell">
                          <span className="time-formatted">
                            {log.visitedAtFormatted || log.clientTimestamp?.split('T')[1]?.split('.')[0] || 'Just now'}
                          </span>
                          <span className="time-relative">
                            {log.timezone || 'UTC'}
                          </span>
                        </div>
                      </td>

                      {/* 2. IP Address */}
                      <td>
                        <div className="ip-cell">
                          <span className="ip-text">{log.ip || 'Unknown IP'}</span>
                          <button
                            onClick={() => handleCopy(log.ip, `ip-${log.id}`)}
                            className="ip-copy-btn"
                            title="Copy IP Address"
                          >
                            {copiedId === `ip-${log.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="visitor-badge-row">
                          <span className="visitor-id-tag truncate" title={log.visitorId}>
                            {log.visitorId?.slice(0, 10)}...
                          </span>
                          <span className="visit-counter">
                            {log.visitCount > 1 ? `Visit #${log.visitCount}` : 'New Visitor'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Location */}
                      <td>
                        <div className="location-cell">
                          <span className="country-name">
                            {log.country ? `${log.city ? log.city + ', ' : ''}${log.country}` : '—'}
                          </span>
                          {log.ispOrOrg && (
                            <span className="isp-text truncate max-w-[160px]" title={log.ispOrOrg}>
                              {log.ispOrOrg}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Device & OS */}
                      <td>
                        <div className="device-cell">
                          <div className="device-badge">
                            {getDeviceIcon(log.deviceType)}
                            <span>{log.deviceType || 'Desktop'}</span>
                          </div>
                          <span className="os-text">{log.os || 'Unknown OS'}</span>
                        </div>
                      </td>

                      {/* 5. Browser */}
                      <td>
                        <div className="browser-cell">
                          <span className="browser-title">{log.browser || 'Unknown'}</span>
                          <span className="lang-tag">{log.language || 'en'}</span>
                        </div>
                      </td>

                      {/* 6. Screen & Viewport */}
                      <td>
                        <div className="screen-cell font-mono text-xs">
                          <span>📺 {log.screenResolution || 'N/A'}</span>
                          <span className="text-slate-400">📐 {log.viewportSize || 'N/A'}</span>
                        </div>
                      </td>

                      {/* 7. Page & Referrer */}
                      <td>
                        <div className="page-cell">
                          <span className="page-path font-mono">{log.pathname || '/'}</span>
                          <span className="referrer-text truncate max-w-[140px]" title={log.referrer}>
                            Ref: {log.referrer || 'Direct'}
                          </span>
                        </div>
                      </td>

                      {/* 8. Inspect Action */}
                      <td>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn-inspect-row"
                          title="View Full Raw Telemetry"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Raw Telemetry Inspector Modal */}
      {selectedLog && (
        <div className="inspect-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="inspect-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="inspect-modal-header">
              <div className="inspect-header-left">
                <Shield className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="inspect-modal-title">Visitor Telemetry Inspector</h3>
                  <p className="inspect-modal-subtitle">
                    Document ID: <code className="font-mono">{selectedLog.id}</code>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="inspect-close-btn" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="inspect-modal-body">
              <div className="inspect-grid">
                {/* Section 1: Network & Identity */}
                <div className="inspect-section">
                  <h4 className="section-title">🌐 Network & Identity</h4>
                  <div className="inspect-kv-list">
                    <div className="inspect-kv">
                      <span className="kv-key">Public IP:</span>
                      <span className="kv-val text-emerald-400 font-mono font-bold">{selectedLog.ip || 'Unknown'}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Visitor ID:</span>
                      <span className="kv-val font-mono text-xs">{selectedLog.visitorId}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Session ID:</span>
                      <span className="kv-val font-mono text-xs">{selectedLog.sessionId}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Total Visits:</span>
                      <span className="kv-val badge-pill">#{selectedLog.visitCount || 1}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">ISP / Org:</span>
                      <span className="kv-val">{selectedLog.ispOrOrg || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Location & Timing */}
                <div className="inspect-section">
                  <h4 className="section-title">📍 Geolocation & Time</h4>
                  <div className="inspect-kv-list">
                    <div className="inspect-kv">
                      <span className="kv-key">Country / City:</span>
                      <span className="kv-val">{selectedLog.city ? `${selectedLog.city}, ` : ''}{selectedLog.country || 'N/A'}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Coordinates:</span>
                      <span className="kv-val font-mono text-xs">
                        {selectedLog.latitude && selectedLog.longitude ? `${selectedLog.latitude}, ${selectedLog.longitude}` : 'N/A'}
                      </span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Visited Time:</span>
                      <span className="kv-val font-mono text-xs">{selectedLog.visitedAtFormatted || selectedLog.clientTimestamp}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Timezone:</span>
                      <span className="kv-val">{selectedLog.timezone} (Offset: {selectedLog.timezoneOffsetMinutes}m)</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Device & Hardware */}
                <div className="inspect-section">
                  <h4 className="section-title">💻 Device & Hardware Specs</h4>
                  <div className="inspect-kv-list">
                    <div className="inspect-kv">
                      <span className="kv-key">Device Type:</span>
                      <span className="kv-val badge-pill">{selectedLog.deviceType}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Operating System:</span>
                      <span className="kv-val">{selectedLog.os}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Browser:</span>
                      <span className="kv-val">{selectedLog.browser} ({selectedLog.browserVersion || ''})</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Screen Resolution:</span>
                      <span className="kv-val font-mono">{selectedLog.screenResolution}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Viewport Size:</span>
                      <span className="kv-val font-mono">{selectedLog.viewportSize}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">CPU Cores / Concurrency:</span>
                      <span className="kv-val">{selectedLog.hardwareConcurrency || 'N/A'} Cores</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Device Memory (RAM):</span>
                      <span className="kv-val">{selectedLog.deviceMemoryGB ? `${selectedLog.deviceMemoryGB} GB` : 'N/A'}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Touch Support:</span>
                      <span className="kv-val">{selectedLog.touchSupport ? 'Yes (Touchscreen)' : 'No (Mouse)'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Page & Navigation */}
                <div className="inspect-section">
                  <h4 className="section-title">🔗 Navigation & Session</h4>
                  <div className="inspect-kv-list">
                    <div className="inspect-kv">
                      <span className="kv-key">Page URL:</span>
                      <span className="kv-val font-mono text-xs break-all">{selectedLog.pageUrl}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Pathname:</span>
                      <span className="kv-val font-mono">{selectedLog.pathname}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Referrer:</span>
                      <span className="kv-val">{selectedLog.referrer || 'Direct'}</span>
                    </div>
                    <div className="inspect-kv">
                      <span className="kv-key">Language:</span>
                      <span className="kv-val">{selectedLog.language}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div className="raw-json-block mt-4">
                <div className="raw-json-header">
                  <span>Raw Firestore Payload JSON</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), 'raw-json')}
                    className="copy-json-btn"
                  >
                    {copiedId === 'raw-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'raw-json' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="json-pre">{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>

            <div className="inspect-modal-footer">
              <button onClick={() => setSelectedLog(null)} className="analytics-btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
