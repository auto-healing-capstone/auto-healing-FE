import { getIncidentFlowStage } from "../../../entities/incident/status";

const steps = [
  { key: "incident", label: "Incident Detected" },
  { key: "awaiting_approval", label: "Awaiting Approval" },
  { key: "recovering", label: "Recovery In Progress" },
  { key: "resolved", label: "Resolved" },
];

export function IncidentTimeline({ status }: { status: string }) {
  const stage = getIncidentFlowStage(status);
  const currentIndex =
    stage === "resolved"
      ? 3
      : stage === "recovering"
        ? 2
        : stage === "awaiting_approval"
          ? 1
          : 0;
  const isFailed = stage === "failed";

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isBlocked = isFailed && index >= currentIndex;

        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  isFailed && isCurrent
                    ? "bg-rose-500"
                    : isComplete
                      ? "bg-green-500"
                      : isCurrent
                        ? "bg-blue-500"
                        : isBlocked
                          ? "bg-rose-200"
                          : "bg-slate-300"
                }`}
              />
              {index < steps.length - 1 ? (
                <div
                  className={`mt-1 h-8 w-px ${
                    isFailed && index >= currentIndex ? "bg-rose-200" : isComplete ? "bg-green-400" : "bg-slate-200"
                  }`}
                />
              ) : null}
            </div>
            <div className="pb-3">
              <p className={`text-sm font-medium ${isCurrent ? "text-slate-900" : "text-slate-700"}`}>
                {step.label}
              </p>
              <p className="text-xs text-slate-500">
                {isFailed && isCurrent ? "Failed at this step" : isComplete ? "Completed" : isCurrent ? "Current step" : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
      {stage === "normal" || stage === "warning" ? (
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
          Current flow stage: {stage === "normal" ? "Normal monitoring" : "Warning detected and under observation"}.
        </div>
      ) : null}
    </div>
  );
}
