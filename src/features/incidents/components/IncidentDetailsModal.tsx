import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { reviewRecoveryAction } from "../../../entities/incident/api/reviewRecoveryAction";
import type { Incident, RecoveryActionStatus } from "../../../entities/incident/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import { StatusBadge } from "../../../shared/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
import { IncidentTimeline } from "./IncidentTimeline";
import { getIncidentFlowStage } from "../../../entities/incident/status";

function formatDateTime(value: string | null) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getMetricSnapshots(incident: Incident) {
  const isCritical = incident.severity === "critical";

  return [
    {
      label: "CPU",
      value: isCritical ? "92%" : "78%",
      change: isCritical ? "+18%" : "+7%",
      tone: "text-rose-600",
    },
    {
      label: "Memory",
      value: incident.alert_name === "MemoryPressure" ? "88%" : "71%",
      change: incident.alert_name === "MemoryPressure" ? "+14%" : "+4%",
      tone: "text-amber-600",
    },
    {
      label: "Disk I/O",
      value: incident.alert_name === "DiskFull" ? "81%" : "56%",
      change: incident.alert_name === "DiskFull" ? "+11%" : "-2%",
      tone: "text-blue-600",
    },
  ];
}

function PreviewNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function getStoryEvents(incident: Incident, approvalState: RecoveryActionStatus) {
  const flowStage = getIncidentFlowStage(incident.status);
  const updatedAt = incident.updated_at ?? incident.starts_at;

  return [
    {
      title: "Incident detected",
      timestamp: formatDateTime(incident.starts_at),
      description: incident.summary ?? "Alert threshold crossed and the incident entered the dashboard flow.",
    },
    {
      title: "Analysis prepared",
      timestamp: formatDateTime(updatedAt),
      description:
        incident.description ??
        "Diagnostic context and recommended operator-facing explanation are ready for review.",
    },
    {
      title:
        approvalState === "approved"
          ? "Recovery approved"
          : approvalState === "rejected"
            ? "Recovery rejected"
            : flowStage === "awaiting_approval"
              ? "Approval requested"
              : "Recovery staged",
      timestamp: formatDateTime(updatedAt),
      description:
        approvalState === "approved"
          ? "Operator approval has been recorded and the action is ready to transition into execution."
          : approvalState === "rejected"
            ? "Operator rejected the suggested action and the incident remains available for manual follow-up."
            : "The recovery recommendation is visible to the operator and waiting for the next decision.",
    },
    {
      title:
        flowStage === "resolved"
          ? "Service stabilized"
          : flowStage === "recovering"
            ? "Recovery in progress"
            : flowStage === "failed"
              ? "Recovery failed"
              : "Resolution pending",
      timestamp: formatDateTime(incident.ends_at ?? updatedAt),
      description:
        flowStage === "resolved"
          ? "Service health returned to an acceptable range and the incident can be presented as resolved."
          : flowStage === "recovering"
            ? "The UI is holding space for live execution updates once the backend recovery stream is connected."
            : flowStage === "failed"
              ? "The current flow indicates manual intervention is still required."
              : "This final stage remains open until backend recovery execution updates are available.",
    },
  ];
}

export function IncidentDetailsModal({
  incident,
  open,
  onOpenChange,
}: {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recommendedAction = useMemo(() => {
    if (!incident) {
      return {
        id: "recovery-preview",
        incidentName: "Unknown Incident",
        action: "Restart affected service",
        target: "unknown target",
        status: "pending" as const,
        startedAt: new Date().toISOString(),
        completedAt: null,
        summary: "Recommended action generated from the incident severity and mock analysis.",
      };
    }

    return {
      id: `recovery-${incident.id}`,
      incidentName: incident.alert_name,
      action: incident.alert_name === "MemoryPressure" ? "Increase cache limit" : "Restart affected service",
      target: incident.instance ?? "unknown target",
      status: incident.status === "pending" ? "pending" : "approved",
      startedAt: incident.starts_at,
      completedAt: null,
      summary: "Recommended action generated from the incident severity and current incident state.",
    };
  }, [incident]);

  const [approvalState, setApprovalState] = useState<RecoveryActionStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setApprovalState(recommendedAction.status);
    setIsSubmitting(false);
  }, [recommendedAction.status, incident?.id]);

  if (!incident) {
    return null;
  }

  const metricSnapshots = getMetricSnapshots(incident);
  const storyEvents = getStoryEvents(incident, approvalState);

  async function handleDecision(decision: "approve" | "reject") {
    setIsSubmitting(true);

    try {
      const result = await reviewRecoveryAction({
        incidentId: incident.id,
        recoveryActionId: recommendedAction.id,
        decision,
        requestedBy: "demo.admin",
        reason:
          decision === "approve"
            ? "Approved from incident detail modal."
            : "Rejected from incident detail modal.",
        fingerprint: incident.fingerprint,
        target: recommendedAction.target,
      });

      setApprovalState(result.nextStatus);
      const notify = decision === "approve" ? toast.success : toast.error;
      notify(result.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{incident.alert_name}</DialogTitle>
          <DialogDescription>
            {incident.instance ?? "Unknown target"} · {formatDateTime(incident.starts_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge value={incident.severity} variant="severity" />
                <StatusBadge value={incident.status} variant="status" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Meta label="Fingerprint" value={incident.fingerprint ?? "--"} />
                <Meta label="Instance" value={incident.instance ?? "--"} />
                <Meta label="Started At" value={formatDateTime(incident.starts_at)} />
                <Meta label="Ended At" value={formatDateTime(incident.ends_at)} />
              </div>
            </section>

            <Tabs defaultValue="summary" className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-slate-100/80 p-1">
                <TabsTrigger value="summary" className="flex-none px-3 py-2">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex-none px-3 py-2">
                  Logs
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex-none px-3 py-2">
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex-none px-3 py-2">
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value="recovery" className="flex-none px-3 py-2">
                  Recovery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <section className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">Incident Summary</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {incident.summary ?? "No summary provided."}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoCard label="Severity" value={incident.severity} />
                    <InfoCard label="Current Status" value={incident.status} />
                    <InfoCard label="Target" value={incident.instance ?? "--"} />
                  </div>
                  <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {incident.description ?? "Detailed incident description is not available yet."}
                    </p>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <section className="space-y-4">
                  <h4 className="mb-3 font-semibold text-slate-900">Raw Logs</h4>
                  <PreviewNotice
                    title="Frontend Preview"
                    description="This tab currently formats incident summary fields into a readable log preview until the backend incident detail API provides raw log lines."
                  />
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                    <p>[INFO] Alert received for {incident.alert_name}</p>
                    <p>[WARN] Instance: {incident.instance ?? "unknown"}</p>
                    <p>[INFO] Summary: {incident.summary ?? "n/a"}</p>
                    <p>[INFO] Fingerprint: {incident.fingerprint ?? "n/a"}</p>
                    <p>[ERROR] {incident.description ?? "Detailed log snippet not available yet."}</p>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                <section className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">Metric Snapshot</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Demo-only metric panel prepared for backend chart integration.
                    </p>
                  </div>
                  <PreviewNotice
                    title="Frontend Preview"
                    description="Metric values in this tab are presentation-safe placeholders derived from the selected incident until live detail metrics are wired in."
                  />
                  <div className="grid gap-4 md:grid-cols-3">
                    {metricSnapshots.map((metric) => (
                      <div key={metric.label} className="rounded-xl border border-slate-200/70 bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                        <p className={`mt-3 text-3xl font-semibold ${metric.tone}`}>{metric.value}</p>
                        <p className="mt-2 text-sm text-slate-500">Change: {metric.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                    Live metric API and sparkline rendering can plug into this tab later without changing the modal layout.
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <section className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">AI Analysis</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Potential cause: resource contention detected around{" "}
                      <span className="font-medium text-slate-900">{incident.instance ?? "this target"}</span>.
                    </p>
                  </div>
                  <PreviewNotice
                    title="Frontend Preview"
                    description="AI findings shown here are narrative placeholders so the diagnostic UI can be reviewed before backend LLM analysis responses are connected."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard label="Confidence" value="87%" />
                    <InfoCard label="Priority" value={incident.severity === "critical" ? "Immediate" : "Monitor"} />
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-sm font-semibold text-slate-900">Recommended next step</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Review service health, validate recent deploy changes, and approve automated recovery if alerts persist.
                    </p>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="recovery" className="mt-4">
                <section className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">Recovery Plan</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{recommendedAction.summary}</p>
                  </div>
                  <PreviewNotice
                    title="Frontend Preview"
                    description="Recovery action details are currently inferred from incident severity and status so the operator approval UX can be tested before full backend action history is attached."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard label="Action" value={recommendedAction.action} />
                    <InfoCard label="Target" value={recommendedAction.target} />
                  </div>
                  <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Decision State</p>
                    <div className="mt-3">
                      <StatusBadge value={approvalState} variant="status" />
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">Incident Timeline</h4>
              <IncidentTimeline status={incident.status} />
            </section>

            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">Story Flow</h4>
              <div className="space-y-3">
                {storyEvents.map((event) => (
                  <div key={event.title} className="rounded-xl border border-white/70 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                      <span className="text-xs text-slate-500">{event.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">Recommended Recovery Action</h4>
              <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">{recommendedAction.action}</p>
                <p className="text-sm text-slate-600">Target: {recommendedAction.target}</p>
                <p className="text-sm text-slate-600">{recommendedAction.summary}</p>
                <StatusBadge value={approvalState} variant="status" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void handleDecision("approve")}
                    disabled={isSubmitting}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Approve"}
                  </button>
                  <button
                    onClick={() => void handleDecision("reject")}
                    disabled={isSubmitting}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-500">Current decision state: {approvalState}</p>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
