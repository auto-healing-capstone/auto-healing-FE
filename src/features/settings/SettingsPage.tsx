import { AlertCircle, Bell, CheckCircle2, Cpu, Globe, RotateCcw, Save, Shield, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";

type SettingsFormState = {
  profile: {
    name: string;
    email: string;
    role: string;
    timezone: string;
  };
  notifications: {
    critical: boolean;
    warning: boolean;
    info: boolean;
    email: boolean;
    slack: boolean;
  };
  ai: {
    autoResolve: boolean;
    predictionEnabled: boolean;
    sensitivity: string;
  };
  integrations: {
    backendBaseUrl: string;
    webhookChannel: string;
  };
};

const initialState: SettingsFormState = {
  profile: {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "System Administrator",
    timezone: "UTC",
  },
  notifications: {
    critical: true,
    warning: true,
    info: false,
    email: true,
    slack: true,
  },
  ai: {
    autoResolve: false,
    predictionEnabled: true,
    sensitivity: "75",
  },
  integrations: {
    backendBaseUrl: "http://localhost:8000/api/v1",
    webhookChannel: "#aiops-alerts",
  },
};

export function SettingsPage() {
  const [formState, setFormState] = useState<SettingsFormState>(initialState);
  const [savedState, setSavedState] = useState<SettingsFormState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const validationErrors = useMemo(() => {
    const errors: Partial<Record<"name" | "email" | "sensitivity" | "backendBaseUrl" | "webhookChannel", string>> = {};

    if (!formState.profile.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.profile.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    const sensitivity = Number(formState.ai.sensitivity);
    if (!Number.isFinite(sensitivity) || sensitivity < 0 || sensitivity > 100) {
      errors.sensitivity = "Sensitivity must be a number between 0 and 100.";
    }

    if (!formState.integrations.backendBaseUrl.trim()) {
      errors.backendBaseUrl = "Backend base URL is required.";
    }

    if (!formState.integrations.webhookChannel.trim()) {
      errors.webhookChannel = "Webhook channel is required.";
    }

    return errors;
  }, [formState]);

  const hasErrors = Object.keys(validationErrors).length > 0;
  const isDirty = JSON.stringify(formState) !== JSON.stringify(savedState);

  async function handleSave() {
    if (hasErrors) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    await new Promise((resolve) => window.setTimeout(resolve, 700));

    setSavedState(formState);
    setIsSaving(false);
    setSaveMessage("Settings saved locally. API wiring can replace this mock save flow later.");
    toast.success("Settings saved.");
  }

  function handleReset() {
    setFormState(savedState);
    setSaveMessage(null);
    toast("Unsaved changes were reset.");
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
          <p className="mt-1 text-slate-600">
            Form structure is ready so save APIs can be attached later without changing the UI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-600">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="rounded-xl border-white/70 bg-white/70"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={!isDirty || hasErrors || isSaving}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/30"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {saveMessage ? (
        <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Save Complete</AlertTitle>
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      ) : null}

      {hasErrors ? (
        <Alert className="border-amber-200 bg-amber-50/80 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Needed</AlertTitle>
          <AlertDescription>
            {Object.values(validationErrors)[0]}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.7fr]">
        <div className="rounded-2xl p-3" style={panelStyle}>
          <nav className="space-y-2">
            {[
              { icon: User, label: "Profile" },
              { icon: Bell, label: "Notifications" },
              { icon: Shield, label: "Security" },
              { icon: Cpu, label: "AI Settings" },
              { icon: Globe, label: "Integrations" },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${index === 0 ? "text-blue-600" : "text-slate-700"}`}
                style={index === 0 ? activeItemStyle : undefined}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          <FormPanel title="Profile">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input
                  value={formState.profile.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      profile: { ...current.profile, name: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
                {validationErrors.name ? <FieldError message={validationErrors.name} /> : null}
              </Field>
              <Field label="Role">
                <select
                  value={formState.profile.role}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      profile: { ...current.profile, role: event.target.value },
                    }))
                  }
                  className={inputClass}
                >
                  <option>System Administrator</option>
                  <option>DevOps Engineer</option>
                  <option>Team Lead</option>
                </select>
              </Field>
              <Field label="Email">
                <input
                  value={formState.profile.email}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      profile: { ...current.profile, email: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
                {validationErrors.email ? <FieldError message={validationErrors.email} /> : null}
              </Field>
              <Field label="Timezone">
                <select
                  value={formState.profile.timezone}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      profile: { ...current.profile, timezone: event.target.value },
                    }))
                  }
                  className={inputClass}
                >
                  <option>UTC</option>
                  <option>Asia/Seoul</option>
                  <option>America/Los_Angeles</option>
                </select>
              </Field>
            </div>
          </FormPanel>

          <FormPanel title="Notifications">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "critical", label: "Critical Alerts" },
                { key: "warning", label: "Warning Alerts" },
                { key: "info", label: "Info Alerts" },
                { key: "email", label: "Email Channel" },
                { key: "slack", label: "Slack Channel" },
              ].map((item) => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  checked={formState.notifications[item.key as keyof SettingsFormState["notifications"]]}
                  onChange={(checked) =>
                    setFormState((current) => ({
                      ...current,
                      notifications: {
                        ...current.notifications,
                        [item.key]: checked,
                      },
                    }))
                  }
                />
              ))}
            </div>
          </FormPanel>

          <FormPanel title="AI Settings">
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleRow
                label="Prediction Enabled"
                checked={formState.ai.predictionEnabled}
                onChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    ai: { ...current.ai, predictionEnabled: checked },
                  }))
                }
              />
              <ToggleRow
                label="Auto Resolve"
                checked={formState.ai.autoResolve}
                onChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    ai: { ...current.ai, autoResolve: checked },
                  }))
                }
              />
              <Field label="Sensitivity">
                <input
                  value={formState.ai.sensitivity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      ai: { ...current.ai, sensitivity: event.target.value },
                    }))
                  }
                  className={inputClass}
                />
                {validationErrors.sensitivity ? <FieldError message={validationErrors.sensitivity} /> : null}
              </Field>
            </div>
          </FormPanel>

          <FormPanel title="Integrations">
            <div className="grid gap-4">
              <Field label="Backend Base URL">
                <input
                  value={formState.integrations.backendBaseUrl}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      integrations: {
                        ...current.integrations,
                        backendBaseUrl: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
                {validationErrors.backendBaseUrl ? <FieldError message={validationErrors.backendBaseUrl} /> : null}
              </Field>
              <Field label="Webhook Channel">
                <input
                  value={formState.integrations.webhookChannel}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      integrations: {
                        ...current.integrations,
                        webhookChannel: event.target.value,
                      },
                    }))
                  }
                  className={inputClass}
                />
                {validationErrors.webhookChannel ? <FieldError message={validationErrors.webhookChannel} /> : null}
              </Field>
            </div>
          </FormPanel>
        </div>
      </div>
    </div>
  );
}

function FormPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={panelStyle}>
      <h3 className="mb-6 text-lg font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.7)",
      }}
    >
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="mt-2 text-xs font-medium text-rose-600">{message}</p>;
}

const panelStyle = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
} as const;

const activeItemStyle = {
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.15)",
} as const;

const inputClass =
  "w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
