import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Activity, AlertTriangle, CheckCircle, Clock, Server } from "lucide-react";

const incidentData = [
  { date: "Mar 15", critical: 2, warning: 5, resolved: 12 },
  { date: "Mar 16", critical: 1, warning: 8, resolved: 15 },
  { date: "Mar 17", critical: 3, warning: 6, resolved: 10 },
  { date: "Mar 18", critical: 0, warning: 4, resolved: 18 },
  { date: "Mar 19", critical: 2, warning: 7, resolved: 14 },
  { date: "Mar 20", critical: 1, warning: 5, resolved: 16 },
  { date: "Mar 21", critical: 2, warning: 6, resolved: 13 },
];

const serverMetrics = [
  { time: "00:00", server1: 65, server2: 58, server3: 72 },
  { time: "04:00", server1: 68, server2: 62, server3: 70 },
  { time: "08:00", server1: 75, server2: 68, server3: 78 },
  { time: "12:00", server1: 82, server2: 75, server3: 85 },
  { time: "16:00", server1: 78, server2: 72, server3: 80 },
  { time: "20:00", server1: 70, server2: 65, server3: 75 },
];

const incidents = [
  {
    id: "INC-2024-001",
    title: "High CPU Usage on Server 3",
    severity: "critical",
    status: "active",
    time: "2h ago",
    server: "prod-server-03"
  },
  {
    id: "INC-2024-002",
    title: "Memory Leak Detected",
    severity: "warning",
    status: "investigating",
    time: "5h ago",
    server: "prod-server-01"
  },
  {
    id: "INC-2024-003",
    title: "Network Latency Spike",
    severity: "warning",
    status: "monitoring",
    time: "8h ago",
    server: "prod-server-02"
  },
  {
    id: "INC-2024-004",
    title: "Disk Space Warning",
    severity: "info",
    status: "resolved",
    time: "12h ago",
    server: "prod-server-04"
  },
];

export function IncidentsPage() {
  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Incidents</h2>
        <p className="text-slate-600 mt-1">Track and manage system incidents</p>
      </div>

      {/* Incident Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Incidents", value: "3", icon: Activity, color: "from-red-500 to-orange-500" },
          { label: "Critical", value: "1", icon: AlertTriangle, color: "from-purple-500 to-pink-500" },
          { label: "Resolved Today", value: "16", icon: CheckCircle, color: "from-green-500 to-emerald-500" },
          { label: "Avg Response Time", value: "8m", icon: Clock, color: "from-blue-500 to-cyan-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Incident Trends */}
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Incident Trends</h3>
          <p className="text-sm text-slate-600 mt-1">Weekly incident overview by severity</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={incidentData}>
            <defs>
              <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="warningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
            />
            <Bar dataKey="critical" fill="url(#criticalGrad)" radius={[8, 8, 0, 0]} name="Critical" />
            <Bar dataKey="warning" fill="url(#warningGrad)" radius={[8, 8, 0, 0]} name="Warning" />
            <Bar dataKey="resolved" fill="url(#resolvedGrad)" radius={[8, 8, 0, 0]} name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Server Performance */}
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Server Performance</h3>
          <p className="text-sm text-slate-600 mt-1">Real-time server resource utilization</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={serverMetrics}>
            <defs>
              <linearGradient id="server1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="server2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="server3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
            />
            <Area type="monotone" dataKey="server1" stroke="#3b82f6" strokeWidth={2} fill="url(#server1)" name="Server 1" />
            <Area type="monotone" dataKey="server2" stroke="#8b5cf6" strokeWidth={2} fill="url(#server2)" name="Server 2" />
            <Area type="monotone" dataKey="server3" stroke="#ec4899" strokeWidth={2} fill="url(#server3)" name="Server 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Active Incidents List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="p-6 border-b border-white/50">
          <h3 className="text-lg font-semibold text-slate-900">Recent Incidents</h3>
        </div>
        <div className="p-6 space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="p-5 rounded-xl transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl ${
                    incident.severity === 'critical' 
                      ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                      : incident.severity === 'warning'
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  } shadow-lg`}>
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-slate-900">{incident.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                        incident.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : incident.severity === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {incident.id} · {incident.server}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">{incident.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    incident.status === 'active'
                      ? 'bg-red-100 text-red-700'
                      : incident.status === 'investigating'
                      ? 'bg-yellow-100 text-yellow-700'
                      : incident.status === 'monitoring'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
