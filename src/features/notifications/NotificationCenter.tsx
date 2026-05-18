import { Bell, CheckCheck, Circle, Filter, ShieldAlert } from "lucide-react";
import { memo, useMemo, useState } from "react";
import type { AlertFeedItem } from "../../entities/dashboard/types";
import { ScrollArea } from "../../shared/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../shared/ui/sheet";
import { StatusBadge, StatusIcon } from "../../shared/ui/status-badge";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationCenterComponent({
  alerts,
  unreadCount,
  readAlertIds,
  onMarkRead,
  onMarkAllRead,
}: {
  alerts: AlertFeedItem[];
  unreadCount: number;
  readAlertIds: string[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => (showUnreadOnly ? !readAlertIds.includes(a.id) : true)),
    [alerts, readAlertIds, showUnreadOnly],
  );

  function handleMarkAllRead() {
    onMarkAllRead();
    if (showUnreadOnly) setShowUnreadOnly(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative p-2.5 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          aria-label="Open notification center"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full border-l border-white/60 bg-white/80 p-0 backdrop-blur-2xl sm:max-w-lg flex flex-col"
      >
        {/* 헤더 */}
        <SheetHeader className="shrink-0 gap-3 border-b border-slate-200/70 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl text-slate-900">Notification Center</SheetTitle>
              <SheetDescription className="mt-1 text-slate-600">
                Real-time alert feed from Prometheus Alertmanager.
              </SheetDescription>
            </div>
            <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !showUnreadOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showUnreadOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white leading-[1.6]">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>
        </SheetHeader>

        {/* 요약 카드 */}
        <div className="shrink-0 grid grid-cols-3 gap-3 border-b border-slate-200/60 px-6 py-4">
          <SummaryCard label="Total" value={String(alerts.length)} />
          <SummaryCard label="Unread" value={String(unreadCount)} highlight={unreadCount > 0} />
          <SummaryCard
            label="Critical"
            value={String(alerts.filter((a) => a.severity === "critical").length)}
            highlight={alerts.some((a) => a.severity === "critical")}
          />
        </div>

        {/* 알림 목록 */}
        <ScrollArea className="flex-1 min-h-0 overflow-hidden">
          <div className="space-y-2 p-4">
            {visibleAlerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
                <Filter className="mx-auto h-5 w-5 text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-900">No alerts in this view</p>
                <p className="mt-1 text-sm text-slate-500">
                  Switch to All to see all alerts, or new alerts will appear automatically.
                </p>
              </div>
            ) : (
              visibleAlerts.map((alert) => {
                const isRead = readAlertIds.includes(alert.id);
                return (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    isRead={isRead}
                    onMarkRead={onMarkRead}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function AlertCard({
  alert,
  isRead,
  onMarkRead,
}: {
  alert: AlertFeedItem;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}) {
  return (
    <button
      onClick={() => !isRead && onMarkRead(alert.id)}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
        isRead
          ? "border-slate-200/60 bg-white/50 opacity-70"
          : "border-blue-200/80 bg-blue-50/70 shadow-sm hover:shadow-md hover:bg-blue-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 읽음/안읽음 인디케이터 */}
        <div className="mt-1 shrink-0">
          {isRead ? (
            <div className="h-2 w-2 rounded-full bg-slate-300" />
          ) : (
            <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
          )}
        </div>

        <div className="mt-0.5 rounded-xl bg-white/80 p-2 shrink-0">
          <StatusIcon value={alert.severity} variant="severity" className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-semibold ${isRead ? "text-slate-500" : "text-slate-900"}`}>
              {alert.title}
            </p>
            <StatusBadge value={alert.severity} variant="severity" />
            {alert.status && (
              <StatusBadge
                value={
                  alert.status === "new"
                    ? "pending"
                    : alert.status === "acknowledged"
                      ? "approved"
                      : "resolved"
                }
                variant="status"
              />
            )}
          </div>

          <p className={`mt-1.5 text-sm leading-6 ${isRead ? "text-slate-400" : "text-slate-600"}`}>
            {alert.message}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>{formatDateTime(alert.timestamp)}</span>
            {alert.source && <span>{alert.source}</span>}
            {alert.target && <span>{alert.target}</span>}
            {!isRead && (
              <span className="font-semibold text-blue-500 flex items-center gap-1">
                <Circle className="h-1.5 w-1.5 fill-current" />
                Unread
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export const NotificationCenter = memo(NotificationCenterComponent);

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${highlight ? "text-red-500" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}
