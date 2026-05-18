import { useMemo, useState } from "react";
import { matchesDateRange, useDateRangeFilter } from "../../shared/api/useDateRangeFilter";
import { AlertCircle, CheckCircle2, ServerCrash } from "lucide-react";
import { getMetricCards } from "../../entities/dashboard/api/getMetricCards";
import { getIncidentFlowStage } from "../../entities/incident/status";
import { getIncidents } from "../../entities/incident/api/getIncidents";
import type { Incident } from "../../entities/incident/types";
import { usePollingResource } from "../../shared/api/usePollingResource";
import { useMetricHistory } from "../../shared/api/useMetricHistory";
import { IncidentTable } from "./components/IncidentTable";
import { MetricCard } from "./components/MetricCard";
import { OverviewChart } from "./components/OverviewChart";
import { IncidentDetailsModal } from "../incidents/components/IncidentDetailsModal";
import {
  fallbackIncidentMock,
  metricCardsMock,
  overviewChartMock,
} from "../../shared/mocks/dashboard";

export function OverviewPage() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const incidentsResource = usePollingResource({
    cacheKey: "overview-incidents",
    fallbackData: fallbackIncidentMock,
    fallbackErrorMessage:
      "Incident API is unavailable. Showing fallback incidents while metric cards and charts continue using mock data.",
    queryFn: async () => {
      const result = await getIncidents();
      return {
        data: result.items,
        meta: result.meta,
      };
    },
  });

  const metricsResource = usePollingResource({
    cacheKey: "overview-metrics",
    fallbackData: metricCardsMock,
    fallbackErrorMessage: "Metric card API is unavailable. Showing fallback metric cards.",
    queryFn: async () => ({
      data: await getMetricCards(),
    }),
  });

  const { history: liveChartData, isFallback: chartIsFallback } = useMetricHistory();

  const dateFilter = useDateRangeFilter();

  const incidentSummary = useMemo(() => {
    const all = incidentsResource.data;
    const isLoading = incidentsResource.loading;
    const incidents = all.filter((i) => matchesDateRange(i.starts_at, dateFilter));

    const activeCount = incidents.filter((incident) => {
      const stage = getIncidentFlowStage(incident.status);
      return stage === "incident" || stage === "awaiting_approval" || stage === "recovering";
    }).length;
    const resolvedCount = incidents.filter((incident) => getIncidentFlowStage(incident.status) === "resolved").length;

    return { incidents, isLoading, activeCount, resolvedCount };
  }, [incidentsResource.data, incidentsResource.loading, dateFilter]);
  const metrics = metricsResource.data;
  const chartData = liveChartData.length > 0 ? liveChartData : overviewChartMock;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-slate-600">
          Incidents, metrics, and charts are fetched live from the backend and updated every 10 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <OverviewChart data={chartData} isFallback={chartIsFallback} />

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
            Live summary of active, recovering, and resolved incidents.
          </p>

          <div className="mt-6 space-y-4">
            <SummaryCard
              label="Total Incidents"
              value={incidentSummary.isLoading ? "--" : String(incidentSummary.incidents.length)}
              icon={ServerCrash}
              tone="text-slate-900"
              isLoading={incidentSummary.isLoading}
            />
            <SummaryCard
              label="Active Flow"
              value={incidentSummary.isLoading ? "--" : String(incidentSummary.activeCount)}
              icon={AlertCircle}
              tone="text-red-600"
              isLoading={incidentSummary.isLoading}
            />
            <SummaryCard
              label="Resolved"
              value={incidentSummary.isLoading ? "--" : String(incidentSummary.resolvedCount)}
              icon={CheckCircle2}
              tone="text-green-600"
              isLoading={incidentSummary.isLoading}
            />
          </div>
        </div>
      </div>

      <IncidentTable
        incidents={incidentSummary.incidents}
        isLoading={incidentsResource.loading}
        errorMessage={incidentsResource.error}
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
