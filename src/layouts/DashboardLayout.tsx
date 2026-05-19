import { Outlet, NavLink, useSearchParams } from "react-router";
import {
  Gauge,
  LayoutDashboard,
  BarChart3,
  Settings,
  Clock,
  Menu,
  X,
  Activity,
  RefreshCcw,
  CalendarRange,
  Check,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAlertFeed } from "../entities/dashboard/api/getAlertFeed";
import { toast } from "sonner";
import { NotificationCenter } from "../features/notifications/NotificationCenter";
import { usePollingResource } from "../shared/api/usePollingResource";
import { useSSE } from "../shared/api/useSSE";
import { alertFeedMock } from "../shared/mocks/dashboard";
import { StatusIcon } from "../shared/ui/status-badge";

type TimeRange = "Last 24 Hours" | "Last 7 Days" | "Last 30 Days" | "Custom Range";

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadProfileFromStorage() {
  try {
    const raw = localStorage.getItem("aiops_settings");
    if (raw) {
      const parsed = JSON.parse(raw) as { profile?: { name?: string; role?: string } };
      return {
        name: parsed.profile?.name ?? "John Doe",
        role: parsed.profile?.role ?? "Admin",
      };
    }
  } catch { /* ignore */ }
  return { name: "John Doe", role: "Admin" };
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(loadProfileFromStorage);

  useEffect(() => {
    function onSettingsChanged() { setProfile(loadProfileFromStorage()); }
    window.addEventListener("aiops_settings_changed", onSettingsChanged);
    return () => window.removeEventListener("aiops_settings_changed", onSettingsChanged);
  }, []);
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("readAlertIds") ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("readAlertIds", JSON.stringify(readAlertIds));
  }, [readAlertIds]);
  const [searchParams, setSearchParams] = useSearchParams();
  const today = toLocalDateString(new Date());

  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    if (searchParams.get("from") && searchParams.get("to")) return "Custom Range";
    const r = searchParams.get("range");
    if (r === "7d") return "Last 7 Days";
    if (r === "30d") return "Last 30 Days";
    if (r === "24h") return "Last 24 Hours";
    return "Last 24 Hours";
  });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(() => searchParams.get("from") ?? today);
  const [customEnd, setCustomEnd] = useState(() => searchParams.get("to") ?? today);
  const [appliedRange, setAppliedRange] = useState<{ start: string; end: string } | null>(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    return from && to ? { start: from, end: to } : null;
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCustomPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCustomPicker(false);
        if (!appliedRange) setTimeRange("Last 24 Hours");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustomPicker, appliedRange]);

  const RANGE_PARAM: Record<string, string> = {
    "Last 24 Hours": "24h",
    "Last 7 Days": "7d",
    "Last 30 Days": "30d",
  };

  function handleTimeRangeChange(value: TimeRange) {
    setTimeRange(value);
    if (value === "Custom Range") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setAppliedRange(null);
      setSearchParams({ range: RANGE_PARAM[value] });
    }
  }

  function handleApplyCustomRange() {
    setAppliedRange({ start: customStart, end: customEnd });
    setShowCustomPicker(false);
    setSearchParams({ from: customStart, to: customEnd });
  }

  function formatCustomLabel() {
    if (!appliedRange) return "Custom Range";
    return `${appliedRange.start} ~ ${appliedRange.end}`;
  }
  const announcedIdsRef = useRef<string[]>([]);

  const alertsResource = usePollingResource({
    cacheKey: "dashboard-alert-feed",
    fallbackData: alertFeedMock,
    fallbackErrorMessage: "Alert feed API is unavailable. Showing fallback notifications.",
    queryFn: async () => {
      const result = await getAlertFeed();
      return {
        data: result.items,
        meta: result.meta,
      };
    },
  });
  const alerts = alertsResource.data;

  const systemStatus = useMemo(() => {
    if (alerts.some((a) => a.severity === "critical" && a.status !== "resolved"))
      return { label: "Critical Alerts Active", color: "bg-red-500" };
    if (alerts.some((a) => a.severity === "warning" && a.status !== "resolved"))
      return { label: "Degraded Performance", color: "bg-yellow-400" };
    return { label: "All Systems Operational", color: "bg-green-500" };
  }, [alerts]);

  useSSE({
    onNewIncident: () => {
      void alertsResource.refresh();
    },
    onStatusChanged: () => {
      void alertsResource.refresh();
    },
    onRecoveryCompleted: () => {
      void alertsResource.refresh();
    },
  });

  const primaryNavItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analytics", label: "Incidents", icon: Activity },
    { to: "/recovery", label: "Recovery", icon: RefreshCcw },
    { to: "/predictions", label: "Predictions", icon: TrendingUp },
  ];

  const secondaryNavItems = [
    { to: "/reports", label: "Analytics", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const latestAlert = useMemo(() => alerts[0] ?? alertFeedMock[0], [alerts]);
  const unreadAlerts = useMemo(
    () => alerts.filter((alert) => !readAlertIds.includes(alert.id)).length,
    [alerts, readAlertIds],
  );

  useEffect(() => {
    const unseenAlerts = alerts.filter((alert) => !announcedIdsRef.current.includes(alert.id));
    announcedIdsRef.current = alerts.map((alert) => alert.id);

    const timers = unseenAlerts.map((alert, index) =>
      window.setTimeout(() => {
        toast(alert.title, {
          description: alert.message,
          icon: <StatusIcon value={alert.severity} variant="severity" className="h-4 w-4" />,
        });
      }, 1200 * (index + 1)),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [alerts]);

  return (
    <div className="flex h-screen overflow-hidden" style={{
      background: '#e8f0fe',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(147, 197, 253, 0.4) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(251, 207, 232, 0.4) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(196, 181, 253, 0.4) 0, transparent 50%), radial-gradient(at 0% 100%, rgba(252, 211, 77, 0.3) 0, transparent 50%)'
    }}>
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-lg text-slate-800">AIOps Monitor</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-5">
          <div>
            <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Demo Flow
            </p>
            <div className="space-y-2">
              {primaryNavItems.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-700 hover:bg-white/40"
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
                  } : {}}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[11px] font-semibold text-slate-500">
                    {index + 1}
                  </span>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Support Screens
            </p>
            <div className="space-y-2">
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-700 hover:bg-white/40"
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
                  } : {}}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="absolute bottom-6 left-4 right-4 p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.7)'
          }}
        >
          <p className="text-xs text-slate-600 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.color}`} />
            <span className="text-sm font-medium text-slate-800">{systemStatus.label}</span>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-white/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-3 rounded-2xl px-4 py-2.5"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Presentation View</p>
                <p className="text-sm font-semibold text-slate-800">Live Incident Operations Board</p>
              </div>
            </div>
            <div className="relative flex items-center gap-3" ref={pickerRef}>
              <Clock className="w-5 h-5 text-slate-600" />
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
                className="px-3 py-2 rounded-xl border-none font-medium text-sm text-slate-700 cursor-pointer md:px-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}
              >
                <option value="Last 24 Hours">Last 24 Hours</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Custom Range">{appliedRange ? formatCustomLabel() : "Custom Range"}</option>
              </select>

              {showCustomPicker && (
                <div
                  className="absolute top-full left-0 mt-2 z-50 rounded-2xl p-4 shadow-xl flex flex-col gap-3 min-w-[280px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarRange className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">Custom Date Range</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 font-medium">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      max={customEnd}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      style={{ background: 'rgba(248, 250, 252, 0.8)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 font-medium">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart}
                      max={today}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      style={{ background: 'rgba(248, 250, 252, 0.8)' }}
                    />
                  </div>
                  <button
                    onClick={handleApplyCustomRange}
                    disabled={!customStart || !customEnd || customStart > customEnd}
                    className="mt-1 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <NotificationCenter
              alerts={alerts}
              unreadCount={unreadAlerts}
              readAlertIds={readAlertIds}
              onMarkRead={(alertId) =>
                setReadAlertIds((current) => (current.includes(alertId) ? current : [...current, alertId]))
              }
              onMarkAllRead={() =>
                setReadAlertIds((current) => Array.from(new Set([...current, ...alerts.map((alert) => alert.id)])))
              }
            />
            <div className="hidden xl:flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <StatusIcon value={latestAlert?.severity ?? "info"} variant="severity" className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-slate-500">Live Alert Feed</p>
                <p className="text-sm font-medium text-slate-800">
                  {latestAlert?.title ?? (alertsResource.loading ? "Loading alerts..." : "No alerts")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                {profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">{profile.name}</p>
                <p className="text-xs text-slate-600">{profile.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 2xl:px-10 2xl:py-8">
          <div className="mx-auto w-full max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
