import { Bell, CheckCheck, Filter, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
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

export function NotificationCenter({
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

  const visibleAlerts = useMemo(() => {
    return alerts.filter((alert) => (showUnreadOnly ? !readAlertIds.includes(alert.id) : true));
  }, [alerts, readAlertIds, showUnreadOnly]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      onMarkAllRead();
    }
  }

  function handleMarkAllRead() {
    onMarkAllRead();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          className="p-2.5 rounded-xl relative"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          aria-label="Open notification center"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 ? (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full border-l border-white/60 bg-white/80 p-0 backdrop-blur-2xl sm:max-w-lg"
      >
        <SheetHeader className="gap-3 border-b border-slate-200/70 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl text-slate-900">Notification Center</SheetTitle>
              <SheetDescription className="mt-1 text-slate-600">
                Mock alert history prepared for demo flows before websocket integration.
              </SheetDescription>
            </div>
            <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                !showUnreadOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                showUnreadOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600"
              }`}
            >
              Unread
            </button>
            <button
              onClick={handleMarkAllRead}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-3 border-b border-slate-200/60 px-6 py-4">
          <SummaryCard label="Total" value={String(alerts.length)} />
          <SummaryCard label="Unread" value={String(unreadCount)} />
          <SummaryCard label="Critical" value={String(alerts.filter((item) => item.severity === "critical").length)} />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-3 p-4">
            {visibleAlerts.map((alert) => {
              const isRead = readAlertIds.includes(alert.id);

              return (
                <button
                  key={alert.id}
                  onClick={() => onMarkRead(alert.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isRead
                      ? "border-slate-200/70 bg-white/60"
                      : "border-blue-200/80 bg-blue-50/70 shadow-[0_12px_30px_rgba(59,130,246,0.08)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-white/80 p-2">
                      <StatusIcon value={alert.severity} variant="severity" className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{alert.title}</p>
                        <StatusBadge value={alert.severity} variant="severity" />
                        {alert.status ? <StatusBadge value={alert.status === "new" ? "pending" : alert.status === "acknowledged" ? "approved" : "resolved"} variant="status" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{alert.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span>{formatDateTime(alert.timestamp)}</span>
                        {alert.source ? <span>{alert.source}</span> : null}
                        {alert.target ? <span>{alert.target}</span> : null}
                        {!isRead ? <span className="font-semibold text-blue-600">Unread</span> : <span>Read</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {visibleAlerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
                <Filter className="mx-auto h-5 w-5 text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-900">No alerts in this view</p>
                <p className="mt-1 text-sm text-slate-500">Switch back to all alerts or wait for the next mock event.</p>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
