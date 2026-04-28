import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
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
import { Skeleton } from "../../shared/ui/skeleton";
import { getIncidents } from "../../entities/incident/api/getIncidents";
import { getIncidentFlowChartData, getIncidentFlowStage } from "../../entities/incident/status";
import type { Incident } from "../../entities/incident/types";
import { fallbackIncidentMock } from "../../shared/mocks/dashboard";
import { IncidentTable } from "../overview/components/IncidentTable";
import { IncidentDetailsModal } from "./components/IncidentDetailsModal";

const severityColors = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  none: "#94a3b8",
};

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadIncidents() {
      try {
        const result = await getIncidents();
        if (!isMounted) {
          return;
        }
        setIncidents(result.items);
        setErrorMessage(null);
      } catch {
        if (!isMounted) {
          return;
        }
        setIncidents(fallbackIncidentMock);
        setErrorMessage("Incident API is unavailable. Showing fallback incidents for the analytics view.");
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

  const summary = useMemo(() => {
    const active = incidents.filter((incident) => {
      const stage = getIncidentFlowStage(incident.status);
      return stage === "incident" || stage === "awaiting_approval" || stage === "recovering";
    }).length;
    const resolved = incidents.filter((incident) => getIncidentFlowStage(incident.status) === "resolved").length;
    const critical = incidents.filter((incident) => incident.severity === "critical").length;
    const failed = incidents.filter((incident) => getIncidentFlowStage(incident.status) === "failed").length;

    return {
      total: incidents.length,
      active,
      resolved,
      critical,
      failed,
    };
  }, [incidents]);

  const severityData = useMemo(() => {
    const counts = new Map<string, number>();

    for (const incident of incidents) {
      counts.set(incident.severity, (counts.get(incident.severity) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
      color: severityColors[name as keyof typeof severityColors] ?? severityColors.none,
    }));
  }, [incidents]);

  const statusData = useMemo(() => {
    return getIncidentFlowChartData(incidents.map((incident) => incident.status)).filter((item) => item.value > 0);
  }, [incidents]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Incidents</h2>
        <p className="mt-1 text-slate-600">
          Backend incident data with status and severity views derived from the same API response.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatsCard label="Total Incidents" value={isLoading ? "--" : String(summary.total)} icon={Activity} />
        <StatsCard label="Critical" value={isLoading ? "--" : String(summary.critical)} icon={AlertTriangle} tone="text-red-600" />
        <StatsCard label="Resolved" value={isLoading ? "--" : String(summary.resolved)} icon={CheckCircle2} tone="text-green-600" />
        <StatsCard label="Failed" value={isLoading ? "--" : String(summary.failed)} icon={Clock3} tone="text-slate-700" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
          <h3 className="text-lg font-semibold text-slate-900">Status Distribution</h3>
          <p className="mt-1 text-sm text-slate-600">
            Current breakdown by presentation status flow
          </p>
          {isLoading ? (
            <div className="space-y-4 pt-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-[260px] w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={statusData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" strokeOpacity={0.5} />
                <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

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
          <h3 className="text-lg font-semibold text-slate-900">Severity Mix</h3>
          <p className="mt-1 text-sm text-slate-600">
            Derived from `severity` in the incident response
          </p>
          {isLoading ? (
            <div className="space-y-4 pt-6">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-[260px] w-full" />
            </div>
          ) : severityData.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
              No incident data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>

      <IncidentTable
        incidents={incidents}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSelectIncident={setSelectedIncident}
      />
      <IncidentDetailsModal
        incident={selectedIncident}
        open={Boolean(selectedIncident)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIncident(null);
          }
        }}
      />
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  tone = "text-slate-900",
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  tone?: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.85)",
          }}
        >
          <Icon className={`h-5 w-5 ${tone}`} />
        </div>
      </div>
      <p className="mb-1 text-sm text-slate-600">{label}</p>
      <p className={`text-3xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
