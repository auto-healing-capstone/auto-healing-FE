import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { executeHeal } from "../../../entities/incident/api/executeHeal";
import { getIncidentRecoveryActions } from "../../../entities/incident/api/getIncidentRecoveryActions";
import { reviewRecoveryAction } from "../../../entities/incident/api/reviewRecoveryAction";
import type { Incident, RecoveryActionStatus } from "../../../entities/incident/types";
import type { RecoveryHistoryItem } from "../../../entities/dashboard/types";
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


function getStoryEvents(incident: Incident, approvalState: RecoveryActionStatus) {
  const flowStage = getIncidentFlowStage(incident.status);
  const updatedAt = incident.updated_at ?? incident.starts_at;

  return [
    {
      title: "Incident detected",
      timestamp: formatDateTime(incident.starts_at),
    },
    {
      title: "Analysis prepared",
      timestamp: formatDateTime(updatedAt),
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
  const [fetchedActions, setFetchedActions] = useState<RecoveryHistoryItem[]>([]);
  const [approvalState, setApprovalState] = useState<RecoveryActionStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // 모달이 열릴 때 해당 incident의 실제 recovery actions 조회
  useEffect(() => {
    if (!incident || !open) {
      setFetchedActions([]);
      return;
    }
    getIncidentRecoveryActions(incident.id)
      .then((result) => setFetchedActions(result.items))
      .catch(() => setFetchedActions([]));
  }, [incident?.id, open]);

  const recommendedAction = useMemo((): RecoveryHistoryItem => {
    // 백엔드에서 받아온 실제 action이 있으면 첫 번째 사용
    if (fetchedActions.length > 0) {
      const action = fetchedActions[0];
      const incidentTarget = incident?.instance ?? "unknown target";
      return {
        ...action,
        target: !action.target || action.target === "unknown" ? incidentTarget : action.target,
      };
    }

    // fallback: incident 데이터로 생성
    if (!incident) {
      return {
        id: "recovery-preview",
        incidentName: "Unknown Incident",
        action: "Restart affected service",
        target: "unknown target",
        status: "pending",
        startedAt: new Date().toISOString(),
        completedAt: null,
        summary: "Recommended action generated from the incident severity and AI analysis.",
      };
    }
    return {
      id: `recovery-${incident.id}`,
      incidentName: incident.alert_name,
      action: incident.alert_name === "MemoryPressure" ? "Increase cache limit" : "Restart affected service",
      target: incident.instance ?? "unknown target",
      status: (incident.status === "pending" ? "pending" : "approved") as RecoveryActionStatus,
      startedAt: incident.starts_at,
      completedAt: null,
      summary: "Recommended action generated from the incident severity and current incident state.",
    };
  }, [fetchedActions, incident]);

  useEffect(() => {
    setApprovalState(recommendedAction.status);
    setIsSubmitting(false);
    setIsExecuting(false);
  }, [recommendedAction.status, incident?.id]);

  if (!incident) {
    return null;
  }

  const storyEvents = getStoryEvents(incident, approvalState);

  async function handleDecision(decision: "approve" | "reject") {
    setIsSubmitting(true);

    try {
      const result = await reviewRecoveryAction({
        incidentId: incident!.id,
        recoveryActionId: recommendedAction.id,
        decision,
        requestedBy: "admin",
        reason:
          decision === "approve"
            ? "Approved from incident detail modal."
            : "Rejected from incident detail modal.",
        fingerprint: incident!.fingerprint,
        target: recommendedAction.target,
      });

      setApprovalState(result.nextStatus);
      const notify = decision === "approve" ? toast.success : toast.error;
      notify(result.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExecute() {
    setIsExecuting(true);
    try {
      await executeHeal(recommendedAction.id);
      toast.success("Heal execution triggered.");
      setApprovalState("running");
    } catch {
      toast.error("Failed to trigger heal execution.");
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col sm:max-w-5xl bg-sky-50/95 backdrop-blur-none">
        <DialogHeader className="shrink-0">
          <DialogTitle>{incident.alert_name}</DialogTitle>
          <DialogDescription>
            {incident.instance ?? "Unknown target"} · {formatDateTime(incident.starts_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-6 overflow-hidden lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4 overflow-y-auto pr-1">
            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge value={incident.severity} variant="severity" />
                <StatusBadge value={incident.status} variant="status" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {incident.fingerprint && <Meta label="Fingerprint" value={incident.fingerprint} />}
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

              <TabsContent value="analysis" className="mt-4">
                <section className="space-y-4">
                  <h4 className="font-semibold text-slate-900">AI Analysis</h4>
                  {incident.description ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                      <p className="text-sm leading-6 text-slate-600">{incident.description}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">AI analysis is not available for this incident.</p>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="recovery" className="mt-4">
                <section className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">Recovery Plan</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{recommendedAction.summary}</p>
                  </div>
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

          <div className="space-y-4 overflow-y-auto pl-1">
            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">Incident Timeline</h4>
              <IncidentTimeline status={incident.status} />
            </section>

            <section className="rounded-xl border border-slate-200/70 bg-white/60 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">Story Flow</h4>
              <div className="space-y-2">
                {storyEvents.map((event) => (
                  <div key={event.title} className="flex items-center justify-between gap-3 rounded-lg border border-white/70 bg-white/80 px-3 py-2">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    <span className="shrink-0 text-xs text-slate-500">{event.timestamp}</span>
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
                {approvalState === "pending" && (
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
                )}
                {approvalState === "approved" && (
                  <button
                    onClick={() => void handleExecute()}
                    disabled={isExecuting}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isExecuting ? "Executing..." : "Execute Heal"}
                  </button>
                )}
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
