import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../shared/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Unexpected application error",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

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
          className="w-full max-w-xl rounded-3xl p-8"
          style={{
            background: "rgba(255, 255, 255, 0.78)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.85)",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Application Error</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Something went wrong</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A rendering error interrupted the current view. You can refresh and continue the demo without losing the overall app structure.
              </p>
              <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
                {this.state.message}
              </p>
              <div className="mt-6">
                <Button
                  type="button"
                  onClick={this.handleReload}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reload application
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
