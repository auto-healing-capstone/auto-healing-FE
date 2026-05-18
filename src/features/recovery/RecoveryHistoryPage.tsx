import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { matchesDateRange, useDateRangeFilter } from "../../shared/api/useDateRangeFilter";
import { Clock3, PlayCircle, RefreshCcw, Search, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { getRecoveryActions } from "../../entities/dashboard/api/getRecoveryActions";
import { reviewRecoveryAction } from "../../entities/incident/api/reviewRecoveryAction";
import type { RecoveryHistoryItem } from "../../entities/dashboard/types";
import { usePollingResource } from "../../shared/api/usePollingResource";
import { recoveryHistoryMock } from "../../shared/mocks/dashboard";
import { Input } from "../../shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import { StatusBadge } from "../../shared/ui/status-badge";

function formatDateTime(value: string | null) {
  if (!value) {
    return "--";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecoveryHistoryPage() {
  const recoveryResource = usePollingResource({
    cacheKey: "recovery-history",
    fallbackData: recoveryHistoryMock,
    fallbackErrorMessage: "Recovery action API is unavailable. Showing fallback recovery history.",
    queryFn: async () => {
      const result = await getRecoveryActions();
      return {
        data: result.items,
        meta: result.meta,
      };
    },
  });
  const [items, setItems] = useState<RecoveryHistoryItem[]>(recoveryHistoryMock);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = useDateRangeFilter();

  // URL에서 Select 표시값 파생 (단일 소스)
  const rangeFilter = useMemo(() => {
    if (searchParams.get("from") && searchParams.get("to")) return "custom";
    const r = searchParams.get("range");
    return r === "24h" || r === "7d" || r === "30d" ? r : "all";
  }, [searchParams]);

  function handleRangeChange(value: string) {
    if (value === "all") setSearchParams({});
    else if (value === "24h" || value === "7d" || value === "30d") setSearchParams({ range: value });
  }

  useEffect(() => {
    setItems(recoveryResource.data);
  }, [recoveryResource.data]);

  const targetOptions = useMemo(() => Array.from(new Set(items.map((item) => item.target))), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const searchable = `${item.action} ${item.incidentName} ${item.target} ${item.summary}`.toLowerCase();
      const queryMatch = query.length === 0 || searchable.includes(query);
      const statusMatch = statusFilter === "all" || item.status === statusFilter;
      const targetMatch = targetFilter === "all" || item.target === targetFilter;
      const rangeMatch = matchesDateRange(item.startedAt, dateFilter);
      return queryMatch && statusMatch && targetMatch && rangeMatch;
    });
  }, [items, dateFilter, searchQuery, statusFilter, targetFilter]);

  const resolvedCount = filteredItems.filter((item) => item.status === "resolved").length;
  const runningCount = filteredItems.filter((item) => item.status === "running").length;
  const pendingCount = filteredItems.filter((item) => item.status === "pending").length;

  async function handleDecision(item: RecoveryHistoryItem, decision: "approve" | "reject") {
    setSubmittingId(item.id);

    try {
      const result = await reviewRecoveryAction({
        incidentId: 0,
        recoveryActionId: item.id,
        decision,
        requestedBy: "admin",
        reason:
          decision === "approve"
            ? "Approved from recovery history page."
            : "Rejected from recovery history page.",
        target: item.target,
      });

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                status: result.nextStatus,
                completedAt: result.reviewedAt,
                summary:
                  decision === "approve"
                    ? `${entry.summary} Approval recorded and ready for backend execution hookup.`
                    : `${entry.summary} Rejection recorded and kept for operator review.`,
              }
            : entry,
        ),
      );

      const notify = decision === "approve" ? toast.success : toast.error;
      notify(result.message);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Recovery History</h2>
        <p className="mt-1 text-slate-600">
          Recovery action history fetched live from the backend. Approve or reject pending actions below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard label="Resolved Actions" value={String(resolvedCount)} icon={ShieldCheck} />
        <SummaryCard label="Running Actions" value={String(runningCount)} icon={PlayCircle} />
        <SummaryCard label="Pending Approval" value={String(pendingCount)} icon={Clock3} />
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by incident, action, target, or summary"
              className="h-10 rounded-xl border-white/70 bg-white/70 pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl border-white/70 bg-white/70">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={targetFilter} onValueChange={setTargetFilter}>
            <SelectTrigger className="h-10 rounded-xl border-white/70 bg-white/70">
              <SelectValue placeholder="Target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All targets</SelectItem>
              {targetOptions.map((target) => (
                <SelectItem key={target} value={target}>
                  {target}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rangeFilter} onValueChange={handleRangeChange}>
            <SelectTrigger className="h-10 rounded-xl border-white/70 bg-white/70">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              {rangeFilter === "custom" && (
                <SelectItem value="custom">Custom range</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{filteredItems.length} results</span>
          {recoveryResource.meta ? <span>of {recoveryResource.meta.total} total</span> : null}
          {recoveryResource.loading ? <span>Refreshing...</span> : null}
          {recoveryResource.isFallback ? <span>Fallback data active</span> : null}
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setTargetFilter("all");
              handleRangeChange("all");
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="border-b border-white/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Auto-Healing Action Log</h3>
        </div>
        <div className="divide-y divide-white/50">
          {filteredItems.map((item) => (
            <div key={item.id} className="grid gap-4 p-6 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr]">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-slate-900">{item.action}</p>
                </div>
                <p className="text-sm text-slate-600">{item.summary}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Incident</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{item.incidentName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Target</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{item.target}</p>
              </div>
              <div className="space-y-2">
                <StatusBadge value={item.status} variant="status" />
                <p className="text-xs text-slate-500">
                  {formatDateTime(item.startedAt)} / {formatDateTime(item.completedAt)}
                </p>
                {item.status === "pending" ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => void handleDecision(item, "approve")}
                      disabled={submittingId === item.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {submittingId === item.id ? "Submitting..." : "Approve"}
                    </button>
                    <button
                      onClick={() => void handleDecision(item, "reject")}
                      disabled={submittingId === item.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-900">No recovery actions match this filter</p>
              <p className="mt-2 text-sm text-slate-500">
                Try a different status, target, or date range while the live or fallback history refreshes.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl border border-white/70 bg-white/70 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
