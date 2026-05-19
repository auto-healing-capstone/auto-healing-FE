import { useState } from "react";
import { toast } from "sonner";
import { Play, RefreshCw } from "lucide-react";
import { getOverviewChart } from "../../entities/dashboard/api/getOverviewChart";
import { runPrediction } from "../../entities/dashboard/api/runPrediction";
import { usePollingResource } from "../../shared/api/usePollingResource";
import { apiClient } from "../../shared/api/client";
import { PredictionChart } from "../overview/components/PredictionChart";

interface PredictionRecord {
  id: number;
  metric_type: string;
  target_node: string;
  predicted_at: string;
  expected_breach: string | null;
  peak_yhat: number | null;
  confidence: number | null;
  is_verified: boolean;
  incident_id: number | null;
}

interface PredictionListResponse {
  items: PredictionRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

function formatDateTime(value: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function MetricBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    MEMORY_LEAK: "bg-purple-100 text-purple-700",
    FD_RATIO: "bg-orange-100 text-orange-700",
    CPU: "bg-blue-100 text-blue-700",
    MEMORY: "bg-violet-100 text-violet-700",
    DISK: "bg-green-100 text-green-700",
  };
  const color = colorMap[type.toUpperCase()] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {type}
    </span>
  );
}

function AnomalyBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700",
    WARNING: "bg-amber-100 text-amber-700",
    WATCH: "bg-yellow-100 text-yellow-700",
    CLEAR: "bg-green-100 text-green-700",
  };
  const color = colorMap[level] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {level}
    </span>
  );
}

export function PredictionsPage() {
  const [isRunning, setIsRunning] = useState(false);

  const predictionsResource = usePollingResource({
    cacheKey: "predictions-page",
    fallbackData: [] as PredictionRecord[],
    fallbackErrorMessage: "Failed to fetch predictions.",
    queryFn: async () => {
      const res = await apiClient.get<PredictionListResponse>("/predictions?page_size=50");
      return { data: res.data.items };
    },
  });

  const chartResource = usePollingResource({
    cacheKey: "predictions-chart",
    fallbackData: [],
    fallbackErrorMessage: "Failed to fetch chart data.",
    queryFn: async () => ({ data: await getOverviewChart() }),
  });

  async function handleRun() {
    setIsRunning(true);
    try {
      const result = await runPrediction();
      toast.success(result.message ?? "Prediction job completed.");
      void predictionsResource.refresh();
      void chartResource.refresh();
    } catch {
      toast.error("Prediction job failed.");
    } finally {
      setIsRunning(false);
    }
  }

  const predictions = predictionsResource.data;
  const chartData = chartResource.data;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Predictions</h2>
          <p className="mt-1 text-slate-600">
            AI-based forecast history for memory leak and FD ratio metrics.
          </p>
        </div>
        <button
          onClick={() => void handleRun()}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? "Running..." : "Run Now"}
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <PredictionChart data={chartData} />
      )}

      {/* Table */}
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
        <div className="border-b border-white/50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Prediction History</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {predictionsResource.loading ? "Loading..." : `${predictions.length} records`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Metric</th>
                <th className="px-6 py-3">Predicted At</th>
                <th className="px-6 py-3">Peak Value</th>
                <th className="px-6 py-3">Expected Breach</th>
                <th className="px-6 py-3">Confidence</th>
                <th className="px-6 py-3">Verified</th>
                <th className="px-6 py-3">Incident</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {predictionsResource.loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Loading predictions...
                  </td>
                </tr>
              ) : predictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No predictions yet. Click <strong>Run Now</strong> to trigger a job.
                  </td>
                </tr>
              ) : (
                predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-3">
                      <MetricBadge type={p.metric_type} />
                    </td>
                    <td className="px-6 py-3 text-slate-700">{formatDateTime(p.predicted_at)}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {p.peak_yhat != null ? p.peak_yhat.toFixed(1) : "--"}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{formatDateTime(p.expected_breach)}</td>
                    <td className="px-6 py-3 text-slate-700">
                      {p.confidence != null ? `${(p.confidence * 100).toFixed(0)}%` : "--"}
                    </td>
                    <td className="px-6 py-3">
                      {p.is_verified ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {p.incident_id != null ? `#${p.incident_id}` : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
