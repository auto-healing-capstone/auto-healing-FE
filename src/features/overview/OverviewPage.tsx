import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ServerCrash } from "lucide-react";
import { getIncidentFlowStage } from "../../entities/incident/status";
import { getIncidents } from "../../entities/incident/api/getIncidents";
import type { DashboardState } from "../../entities/dashboard/types";
import type { Incident } from "../../entities/incident/types";
import { IncidentTable } from "./components/IncidentTable";
import { MetricCard } from "./components/MetricCard";
import { OverviewChart } from "./components/OverviewChart";
import { IncidentDetailsModal } from "../incidents/components/IncidentDetailsModal";
import {
  fallbackIncidentMock,
  initialDashboardState,
} from "../../shared/mocks/dashboard";

export function OverviewPage() {
  const [dashboardState, setDashboardState] = useState<DashboardState>(initialDashboardState);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadIncidents() {
      try {
        const data = await getIncidents();
        if (!isMounted) {
          return;
        }
        setDashboardState((currentState) => ({
          ...currentState,
          incidents: data,
          loading: false,
          error: null,
        }));
      } catch {
        if (!isMounted) {
          return;
        }
        setDashboardState((currentState) => ({
          ...currentState,
          incidents: fallbackIncidentMock,
          loading: false,
          error: "Incident API is unavailable. Showing fallback incidents while metric cards and charts continue using mock data.",
        }));
      }
    }

    loadIncidents();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCount = dashboardState.incidents.filter((incident) => {
    const stage = getIncidentFlowStage(incident.status);
    return stage === "incident" || stage === "awaiting_approval" || stage === "recovering";
  }).length;
  const resolvedCount = dashboardState.incidents.filter((incident) => getIncidentFlowStage(incident.status) === "resolved").length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-slate-600">
          Live incident logs come from the backend API, while metric cards and charts are mocked
          until metric endpoints are ready.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {dashboardState.metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <OverviewChart data={dashboardState.chartData} />

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
          <h3 className="text-lg font-semibold text-slate-900">Incident Snapshot</h3>
          <p className="mt-1 text-sm text-slate-600">
            Status cards reflect the presentation flow used across the dashboard.
          </p>

          <div className="mt-6 space-y-4">
            <SummaryCard
              label="Total Incidents"
              value={dashboardState.loading ? "--" : String(dashboardState.incidents.length)}
              icon={ServerCrash}
              tone="text-slate-900"
              isLoading={dashboardState.loading}
            />
            <SummaryCard
              label="Active Flow"
              value={dashboardState.loading ? "--" : String(activeCount)}
              icon={AlertCircle}
              tone="text-red-600"
              isLoading={dashboardState.loading}
            />
            <SummaryCard
              label="Resolved"
              value={dashboardState.loading ? "--" : String(resolvedCount)}
              icon={CheckCircle2}
              tone="text-green-600"
              isLoading={dashboardState.loading}
            />
          </div>
        </div>
      </div>

      <IncidentTable
        incidents={dashboardState.incidents}
        isLoading={dashboardState.loading}
        errorMessage={dashboardState.error}
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  isLoading,
}: {
  label: string;
  value: string;
  icon: typeof ServerCrash;
  tone: string;
  isLoading: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.7)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-9 w-20 animate-pulse rounded-md bg-slate-200/80" />
          ) : (
            <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p>
          )}
        </div>
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
    </div>
  );
}
