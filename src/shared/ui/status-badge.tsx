import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  LoaderCircle,
  ShieldAlert,
  Siren,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getIncidentFlowLabel, getIncidentFlowStage } from "../../entities/incident/status";

type StatusVariant = "severity" | "status";

const severityMap: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700",
    icon: ShieldAlert,
  },
  warning: {
    label: "Warning",
    className: "bg-yellow-100 text-yellow-700",
    icon: AlertTriangle,
  },
  normal: {
    label: "Normal",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  info: {
    label: "Info",
    className: "bg-blue-100 text-blue-700",
    icon: Info,
  },
};

const statusMap: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  normal: {
    label: "Normal",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  warning: {
    label: "Warning",
    className: "bg-yellow-100 text-yellow-700",
    icon: AlertTriangle,
  },
  firing: {
    label: "Incident",
    className: "bg-red-100 text-red-700",
    icon: Siren,
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  pending: {
    label: "Awaiting Approval",
    className: "bg-orange-100 text-orange-700",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    className: "bg-cyan-100 text-cyan-700",
    icon: CheckCircle2,
  },
  running: {
    label: "Recovering",
    className: "bg-indigo-100 text-indigo-700",
    icon: LoaderCircle,
  },
  failed: {
    label: "Failed",
    className: "bg-rose-100 text-rose-700",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    className: "bg-slate-200 text-slate-700",
    icon: XCircle,
  },
};

const fallback = {
  label: "Unknown",
  className: "bg-slate-100 text-slate-700",
  icon: AlertCircle,
};

export function StatusBadge({
  value,
  variant,
}: {
  value: string;
  variant: StatusVariant;
}) {
  const config =
    variant === "severity"
      ? severityMap[value] ?? fallback
      : statusMap[value] ??
        ({
          ...fallback,
          label: getIncidentFlowLabel(value),
          className:
            getIncidentFlowStage(value) === "incident"
              ? "bg-red-100 text-red-700"
              : getIncidentFlowStage(value) === "awaiting_approval"
                ? "bg-orange-100 text-orange-700"
                : getIncidentFlowStage(value) === "approved"
                  ? "bg-cyan-100 text-cyan-700"
                : getIncidentFlowStage(value) === "recovering"
                  ? "bg-indigo-100 text-indigo-700"
                  : getIncidentFlowStage(value) === "resolved"
                    ? "bg-green-100 text-green-700"
                    : getIncidentFlowStage(value) === "warning"
                      ? "bg-yellow-100 text-yellow-700"
                      : getIncidentFlowStage(value) === "normal"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700",
        });
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className={`h-3.5 w-3.5 ${value === "running" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}

export function StatusIcon({
  value,
  variant,
  className = "",
}: {
  value: string;
  variant: StatusVariant;
  className?: string;
}) {
  const config =
    variant === "severity" ? severityMap[value] ?? fallback : statusMap[value] ?? fallback;
  const Icon = config.icon;

  return <Icon className={`${className} ${value === "running" ? "animate-spin" : ""}`.trim()} />;
}
