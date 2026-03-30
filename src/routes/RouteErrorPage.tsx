import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "../shared/ui/button";

function getErrorCopy(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      description:
        typeof error.data === "string"
          ? error.data
          : "The requested route could not be loaded. This fallback keeps the presentation flow recoverable.",
    };
  }

  if (error instanceof Error) {
    return {
      title: "Route failed to load",
      description: error.message,
    };
  }

  return {
    title: "Unexpected routing error",
    description: "An unknown route error occurred while preparing this screen.",
  };
}

export function RouteErrorPage() {
  const error = useRouteError();
  const { title, description } = getErrorCopy(error);

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
        className="w-full max-w-2xl rounded-3xl p-8"
        style={{
          background: "rgba(255, 255, 255, 0.78)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.85)",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Route Error</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry route
              </Button>
              <Button asChild type="button" variant="outline" className="rounded-xl border-white/70 bg-white/70">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
