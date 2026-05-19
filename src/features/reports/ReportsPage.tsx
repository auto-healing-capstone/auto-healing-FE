import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { matchesDateRange, useDateRangeFilter } from "../../shared/api/useDateRangeFilter";
import { Activity, CalendarRange, CheckCircle2, Clock, Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getIncidents } from "../../entities/incident/api/getIncidents";
import { getIncidentFlowChartData, getIncidentFlowStage } from "../../entities/incident/status";
import type { Incident } from "../../entities/incident/types";
import { fallbackIncidentMock } from "../../shared/mocks/dashboard";
import { Alert, AlertDescription, AlertTitle } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { EmptyState, InlineError } from "../../shared/ui/state-blocks";
import { Skeleton } from "../../shared/ui/skeleton";

const performanceData = [
  { metric: "Uptime", value: 99.9, target: 99.5 },
  { metric: "Response Time", value: 145, target: 200 },
  { metric: "Throughput", value: 850, target: 800 },
  { metric: "Error Rate", value: 0.3, target: 1.0 },
];

const severityColors: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  none: "#94a3b8",
};

export function ReportsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = useDateRangeFilter();

  const rangeFilter = useMemo(() => {
    if (searchParams.get("from") && searchParams.get("to")) return "custom";
    const r = searchParams.get("range");
    return r === "24h" || r === "7d" || r === "30d" ? r : "all";
  }, [searchParams]);

  function handleRangeChange(value: string) {
    if (value === "all") setSearchParams({});
    else if (value === "24h" || value === "7d" || value === "30d") setSearchParams({ range: value });
  }
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadIncidents() {
      try {
        const result = await getIncidents();
        if (!isMounted) return;
        setIncidents(result.items);
        setErrorMessage(null);
      } catch {
        if (!isMounted) return;
        setIncidents(fallbackIncidentMock);
        setErrorMessage("Incident API is unavailable. Reports are using fallback incident analytics.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadIncidents();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const severityMatch = severityFilter === "all" || incident.severity === severityFilter;
      const rangeMatch = matchesDateRange(incident.starts_at, dateFilter);
      return severityMatch && rangeMatch;
    });
  }, [incidents, dateFilter, severityFilter]);

  const severityData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const incident of filteredIncidents) {
      counts.set(incident.severity, (counts.get(incident.severity) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
      color: severityColors[name] ?? severityColors.none,
    }));
  }, [filteredIncidents]);

  const statusSummary = useMemo(
    () => [
      { metric: "Active Flow", value: filteredIncidents.filter((item) => {
        const stage = getIncidentFlowStage(item.status);
        return stage === "incident" || stage === "awaiting_approval" || stage === "recovering";
      }).length },
      { metric: "Resolved", value: filteredIncidents.filter((item) => getIncidentFlowStage(item.status) === "resolved").length },
      { metric: "Failed", value: filteredIncidents.filter((item) => getIncidentFlowStage(item.status) === "failed").length },
      { metric: "Total", value: filteredIncidents.length },
    ],
    [filteredIncidents],
  );

  const flowData = useMemo(
    () => getIncidentFlowChartData(filteredIncidents.map((incident) => incident.status)).filter((item) => item.value > 0),
    [filteredIncidents],
  );

  function handleExport(format: "pdf" | "csv") {
    setExportFormat(format);
    setIsExporting(true);
    setLastExportMessage(null);

    if (format === "csv") {
      const headers = ["ID", "Alert Name", "Severity", "Status", "Instance", "Summary", "Starts At", "Ends At"];
      const csvRows = filteredIncidents.map((inc) =>
        [inc.id, inc.alert_name, inc.severity, inc.status, inc.instance ?? "", inc.summary ?? "", inc.starts_at ?? "", inc.ends_at ?? ""]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      );
      const csvContent = [headers.map((h) => `"${h}"`).join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `incidents_${rangeFilter}_${severityFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setLastExportMessage(`CSV downloaded — ${filteredIncidents.length} incidents.`);
    } else {
      const esc = (v: unknown) => String(v ?? "--").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const tableRows = filteredIncidents
        .map(
          (inc) =>
            `<tr><td>${esc(inc.id)}</td><td>${esc(inc.alert_name)}</td><td>${esc(inc.severity)}</td><td>${esc(inc.status)}</td><td>${esc(inc.instance)}</td><td>${esc(inc.summary)}</td><td>${esc(inc.starts_at)}</td></tr>`,
        )
        .join("");
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Incident Report</title>
<style>body{font-family:sans-serif;padding:24px}h1{font-size:18px;margin-bottom:4px}p.meta{font-size:12px;color:#666;margin:0 0 16px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f1f5f9;text-align:left;padding:8px 12px;border-bottom:2px solid #e2e8f0}td{padding:6px 12px;border-bottom:1px solid #e2e8f0}</style>
</head><body>
<h1>Incident Report</h1>
<p class="meta">Range: ${esc(rangeFilter)} &bull; Severity: ${esc(severityFilter)} &bull; Total: ${filteredIncidents.length} &bull; Generated: ${new Date().toLocaleString()}</p>
<table><thead><tr><th>ID</th><th>Alert Name</th><th>Severity</th><th>Status</th><th>Instance</th><th>Summary</th><th>Starts At</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
      setIsExporting(false);
      setLastExportMessage(`PDF print dialog opened — ${filteredIncidents.length} incidents.`);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
          <p className="mt-1 text-slate-600">
            Incident-derived analytics with filters ready for future reporting flows.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            icon={Filter}
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { label: "All Severity", value: "all" },
              { label: "Critical", value: "critical" },
              { label: "Warning", value: "warning" },
              { label: "Info", value: "info" },
            ]}
          />
          <FilterSelect
            icon={CalendarRange}
            value={rangeFilter}
            onChange={handleRangeChange}
            options={[
              { label: "All Time", value: "all" },
              { label: "Last 24 Hours", value: "24h" },
              { label: "Last 7 Days", value: "7d" },
              { label: "Last 30 Days", value: "30d" },
              ...(rangeFilter === "custom" ? [{ label: "Custom range", value: "custom" }] : []),
            ]}
          />
        </div>
      </div>

      {errorMessage ? <InlineError message={errorMessage} /> : null}

      <GlassCard title="Export Report">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Download filtered incidents as CSV or open a print-ready PDF. Filters above are applied to the export.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
                {filteredIncidents.length} incidents selected
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
                Range: {rangeFilter === "all" ? "All Time" : rangeFilter}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
                Severity: {severityFilter === "all" ? "All" : severityFilter}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleExport("pdf")}
              disabled={isExporting}
              className="rounded-xl border-white/70 bg-white/70"
            >
              <FileText className="h-4 w-4" />
              {isExporting && exportFormat === "pdf" ? "Preparing PDF..." : "Export PDF"}
            </Button>
            <Button
              type="button"
              onClick={() => void handleExport("csv")}
              disabled={isExporting}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting && exportFormat === "csv" ? "Preparing CSV..." : "Export CSV"}
            </Button>
          </div>
        </div>
        {lastExportMessage ? (
          <div className="mt-4">
            <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Export Ready</AlertTitle>
              <AlertDescription>{lastExportMessage}</AlertDescription>
            </Alert>
          </div>
        ) : null}
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard title="Performance vs Target">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} layout="vertical">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis dataKey="metric" type="category" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard title="Incident Severity Mix">
          {isLoading ? (
            <ChartSkeleton />
          ) : severityData.length === 0 ? (
            <EmptyState
              title="No incidents match this filter"
              description="Try widening the date range or severity filter."
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={severityData} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={3}>
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {severityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm capitalize text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.value} incidents</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Filtered Incidents", value: filteredIncidents.length, icon: Activity },
          { label: "Active Flow", value: statusSummary[0].value, icon: Clock },
          { label: "Reports Ready", value: 4, icon: Download },
        ].map((item) => (
          <GlassCard key={item.label} title={item.label}>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
              <item.icon className="h-5 w-5 text-slate-500" />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard title="Incident Status Summary">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis allowDecimals={false} stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {flowData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
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
      <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: typeof Filter;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Icon className="h-4 w-4 text-slate-500" />
      <select
        className="bg-transparent text-sm text-slate-700 outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-[250px] w-full rounded-xl" />
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
};
