import { Cpu, HardDrive, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MetricItem } from "../../../entities/dashboard/types";

const metricConfig: Record<
  MetricItem["key"],
  { icon: LucideIcon; color: string; chartData: number[] }
> = {
  cpu: {
    icon: Cpu,
    color: "from-blue-500 to-cyan-500",
    chartData: [65, 68, 64, 69, 66, 70, 67],
  },
  memory: {
    icon: HardDrive,
    color: "from-purple-500 to-pink-500",
    chartData: [70, 75, 78, 76, 80, 81, 82],
  },
  disk: {
    icon: HardDrive,
    color: "from-emerald-500 to-teal-500",
    chartData: [56, 56, 57, 58, 57, 58, 58],
  },
};

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / Math.max(max - min, 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-14 w-28 overflow-visible">
      <polyline
        className="text-blue-500"
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}

export function MetricCard({ metric }: { metric: MetricItem }) {
  const config = metricConfig[metric.key];
  const Icon = config.icon;
  const isUp = metric.trend === "up";
  const statusTone =
    metric.value >= 85 ? "Critical pressure" : metric.value >= 70 ? "Elevated" : "Stable";

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] xl:p-7"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
      >
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl bg-gradient-to-br p-3 shadow-lg ${config.color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-1 text-sm">
          {metric.trend === "steady" ? null : isUp ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
          <span
            className={
              metric.trend === "steady"
                ? "text-slate-500"
                : isUp
                  ? "text-red-500"
                  : "text-green-500"
            }
          >
            {metric.change}
          </span>
        </div>
      </div>
      <p className="mb-1 text-sm text-slate-600">{metric.label}</p>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{statusTone}</p>
      <p className="mb-3 text-3xl font-semibold text-slate-900">
        {metric.value}
        {metric.unit}
      </p>
      <div className="flex items-end justify-between gap-3">
        <Sparkline values={config.chartData} />
        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Peak</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{Math.max(...config.chartData)}%</p>
        </div>
      </div>
    </div>
  );
}
