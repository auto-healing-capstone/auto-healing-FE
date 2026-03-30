import { Inbox, OctagonAlert } from "lucide-react";
import { Skeleton } from "./skeleton";

export function LoadingTableBlock() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center text-slate-500">
      <Inbox className="h-8 w-8" />
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        <p className="mt-1 text-sm">{description}</p>
      </div>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
      <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function RouteLoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{
        background: "#e8f0fe",
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(147, 197, 253, 0.4) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(251, 207, 232, 0.4) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(196, 181, 253, 0.4) 0, transparent 50%), radial-gradient(at 0% 100%, rgba(252, 211, 77, 0.3) 0, transparent 50%)",
      }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-8"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.85)",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">AIOps Monitor</p>
        <p className="mt-3 text-2xl font-semibold text-slate-900">Loading route</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Preparing incident analytics, recovery history, and demo data for the selected view.
        </p>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-3/4 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
