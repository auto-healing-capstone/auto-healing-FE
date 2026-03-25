import { FileText, Download, TrendingUp, BarChart3, Activity, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const performanceData = [
  { metric: "Uptime", value: 99.9, target: 99.5 },
  { metric: "Response Time", value: 145, target: 200 },
  { metric: "Throughput", value: 850, target: 800 },
  { metric: "Error Rate", value: 0.3, target: 1.0 },
];

const incidentDistribution = [
  { name: "Infrastructure", value: 35, color: "#3b82f6" },
  { name: "Application", value: 28, color: "#8b5cf6" },
  { name: "Network", value: 22, color: "#ec4899" },
  { name: "Security", value: 15, color: "#f59e0b" },
];

const reports = [
  {
    title: "Weekly Performance Report",
    description: "System performance metrics and KPIs",
    date: "Mar 15 - Mar 22, 2026",
    type: "Performance",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Incident Analysis Report",
    description: "Detailed breakdown of all incidents",
    date: "March 2026",
    type: "Incidents",
    icon: Activity,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "AI Prediction Accuracy",
    description: "AI model performance evaluation",
    date: "Q1 2026",
    type: "Analytics",
    icon: BarChart3,
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Resource Utilization",
    description: "Server and infrastructure usage",
    date: "Last 30 days",
    type: "Infrastructure",
    icon: Clock,
    color: "from-green-500 to-emerald-500"
  },
];

export function ReportsPage() {
  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-slate-600 mt-1">Comprehensive system analytics and reports</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData} layout="vertical">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis dataKey="metric" type="category" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }}
              />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[0, 8, 8, 0]} name="Current" />
              <Bar dataKey="target" fill="#e2e8f0" radius={[0, 8, 8, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Incident Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={incidentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {incidentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {incidentDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div
            key={report.title}
            className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color} shadow-lg`}>
                <report.icon className="w-6 h-6 text-white" />
              </div>
              <button className="p-2 rounded-lg transition-all duration-200 hover:bg-white/60">
                <Download className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">{report.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{report.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/50">
              <span className="text-xs text-slate-500">{report.date}</span>
              <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 text-xs font-medium text-blue-700">
                {report.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
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
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Mean Time to Detect", value: "4.2 min", change: "-12%", trend: "down" },
            { label: "Mean Time to Resolve", value: "23.5 min", change: "-18%", trend: "down" },
            { label: "AI Accuracy Rate", value: "94.3%", change: "+5%", trend: "up" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-5 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
              }}
            >
              <p className="text-sm text-slate-600 mb-2">{kpi.label}</p>
              <p className="text-3xl font-semibold text-slate-900 mb-2">{kpi.value}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-4 h-4 ${kpi.trend === 'down' ? 'rotate-180 text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${kpi.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change} from last week
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
