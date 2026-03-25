import { User, Bell, Shield, Palette, Globe, Cpu, Mail, Smartphone } from "lucide-react";
import { useState } from "react";

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    critical: true,
    warning: true,
    info: false,
    email: true,
    sms: false,
  });

  const [aiSettings, setAiSettings] = useState({
    autoResolve: false,
    predictionEnabled: true,
    sensitivity: 75
  });

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-slate-600 mt-1">Configure your AIOps monitoring preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-3"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <nav className="space-y-2">
              {[
                { icon: User, label: "Profile", active: true, color: "from-blue-500 to-cyan-500" },
                { icon: Bell, label: "Notifications", active: false, color: "from-purple-500 to-pink-500" },
                { icon: Shield, label: "Security", active: false, color: "from-orange-500 to-red-500" },
                { icon: Cpu, label: "AI Settings", active: false, color: "from-green-500 to-emerald-500" },
                { icon: Palette, label: "Appearance", active: false, color: "from-indigo-500 to-purple-500" },
                { icon: Globe, label: "Integration", active: false, color: "from-pink-500 to-rose-500" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    item.active
                      ? "text-blue-600"
                      : "text-slate-700 hover:bg-white/40"
                  }`}
                  style={item.active ? {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
                  } : {}}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} ${item.active ? 'shadow-lg' : 'opacity-60'}`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Profile Information</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                  JD
                </div>
                <div>
                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105">
                    Change Avatar
                  </button>
                  <p className="text-sm text-slate-600 mt-2">PNG, JPG or GIF. Max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John"
                    className="w-full px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    className="w-full px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@company.com"
                  className="w-full px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                >
                  <option>System Administrator</option>
                  <option>DevOps Engineer</option>
                  <option>Team Lead</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Alert Notifications</h3>
            <div className="space-y-4">
              {[
                { id: "critical", label: "Critical Alerts", description: "Immediate notification for critical incidents", icon: Shield },
                { id: "warning", label: "Warning Alerts", description: "Get notified about warning-level events", icon: Bell },
                { id: "info", label: "Info Alerts", description: "Informational messages and updates", icon: Mail },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.id as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, [item.id]: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/50">
              <h4 className="font-medium text-slate-900 mb-4">Notification Channels</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "email", label: "Email", icon: Mail },
                  { id: "sms", label: "SMS", icon: Smartphone },
                ].map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <channel.icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">{channel.label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[channel.id as keyof typeof notifications]}
                        onChange={(e) =>
                          setNotifications((prev) => ({ ...prev, [channel.id]: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">AI Configuration</h3>
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Auto-resolve Incidents</p>
                  <p className="text-sm text-slate-600 mt-1">Allow AI to automatically resolve low-risk incidents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.autoResolve}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, autoResolve: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                </label>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Predictive Analysis</p>
                  <p className="text-sm text-slate-600 mt-1">Enable AI-powered anomaly prediction</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.predictionEnabled}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, predictionEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                </label>
              </div>

              <div>
                <label className="block font-medium text-slate-900 mb-3">
                  Detection Sensitivity: {aiSettings.sensitivity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiSettings.sensitivity}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, sensitivity: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${aiSettings.sensitivity}%, #e2e8f0 ${aiSettings.sensitivity}%, #e2e8f0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2.5 rounded-xl font-medium text-slate-700 transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.9)'
              }}
            >
              Cancel
            </button>
            <button className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
