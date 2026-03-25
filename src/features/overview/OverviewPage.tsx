import { 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  Brain,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

// KPI data
const kpiCards = [
  {
    title: "CPU Usage",
    value: "67.3%",
    change: "+5.2%",
    trend: "up",
    icon: Cpu,
    color: "from-blue-500 to-cyan-500",
    chartData: [65, 68, 64, 69, 66, 70, 67]
  },
  {
    title: "Memory Usage",
    value: "82.1%",
    change: "+12.4%",
    trend: "up",
    icon: HardDrive,
    color: "from-purple-500 to-pink-500",
    chartData: [70, 75, 78, 76, 80, 81, 82]
  },
  {
    title: "Error Rate",
    value: "2.4%",
    change: "-0.8%",
    trend: "down",
    icon: AlertTriangle,
    color: "from-orange-500 to-red-500",
    chartData: [3.2, 3.0, 2.8, 2.9, 2.6, 2.5, 2.4]
  },
  {
    title: "AI Risk Score",
    value: "78/100",
    change: "+8",
    trend: "up",
    icon: Brain,
    color: "from-emerald-500 to-teal-500",
    chartData: [65, 68, 72, 70, 75, 76, 78]
  },
];

// Time series data for main chart
const timeSeriesData = [
  { time: "00:00", actual: 65, predicted: 64 },
  { time: "02:00", actual: 68, predicted: 67 },
  { time: "04:00", actual: 62, predicted: 63 },
  { time: "06:00", actual: 70, predicted: 69 },
  { time: "08:00", actual: 75, predicted: 74 },
  { time: "10:00", actual: 78, predicted: 76 },
  { time: "12:00", actual: 82, predicted: 80 },
  { time: "14:00", actual: 85, predicted: 83 },
  { time: "16:00", actual: 88, predicted: 86 },
  { time: "18:00", actual: 85, predicted: 85 },
  { time: "20:00", actual: 80, predicted: 82 },
  { time: "22:00", actual: 75, predicted: 78 },
];

// AI Analysis findings
const aiFindings = [
  {
    issue: "High CPU Usage Detected",
    severity: "warning",
    cause: "Potential memory leak in service worker",
    action: "Restart worker service and monitor for 1 hour",
    confidence: 87
  },
  {
    issue: "Memory Pressure Increasing",
    severity: "critical",
    cause: "Cache growth exceeding 80% threshold",
    action: "Clear cache and optimize retention policy",
    confidence: 92
  },
  {
    issue: "Unusual Traffic Pattern",
    severity: "info",
    cause: "Seasonal spike in API requests",
    action: "Scale up infrastructure by 20%",
    confidence: 78
  }
];

// Incident timeline steps
const incidentSteps = [
  { label: "Detection", status: "completed", time: "14:23" },
  { label: "AI Analysis", status: "completed", time: "14:24" },
  { label: "User Approval", status: "current", time: "14:25" },
  { label: "Resolution", status: "pending", time: "-" },
];

// Mini trend chart component
function MiniChart({ data }: { data: number[] }) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#miniGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div 
            key={card.title} 
            className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {card.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={card.trend === "up" ? "text-red-500" : "text-green-500"}>
                  {card.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{card.title}</p>
              <p className="text-3xl font-semibold text-slate-900 mb-3">{card.value}</p>
              <MiniChart data={card.chartData} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Performance Overview</h3>
            <p className="text-sm text-slate-600 mt-1">Actual vs AI Predicted Values</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-700">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-700">AI Predicted</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fill="url(#colorActual)"
              name="Actual"
            />
            <Area 
              type="monotone" 
              dataKey="predicted" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              strokeDasharray="5 5"
              fill="url(#colorPredicted)"
              name="Predicted"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Analysis Panel */}
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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Analysis & Insights</h3>
            <p className="text-sm text-slate-600">Intelligent anomaly detection and recommendations</p>
          </div>
        </div>

        <div className="space-y-4">
          {aiFindings.map((finding, index) => (
            <div 
              key={index}
              className="p-5 rounded-xl transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {finding.severity === "critical" ? (
                    <div className="p-2 rounded-lg bg-red-100">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                  ) : finding.severity === "warning" ? (
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-blue-100">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900">{finding.issue}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-medium">Possible cause:</span> {finding.cause}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                  <Brain className="w-4 h-4 text-purple-700" />
                  <span className="text-sm font-semibold text-purple-700">{finding.confidence}%</span>
                </div>
              </div>
              
              <div className="pl-11">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-blue-700">Recommended:</span> {finding.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Timeline */}
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
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Current Incident Timeline</h3>
        
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 rounded-full">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" 
              style={{ width: '66%' }}
            />
          </div>

          {incidentSteps.map((step, index) => (
            <div key={index} className="flex-1 relative z-10 flex flex-col items-center">
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                  step.status === 'completed' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' 
                    : step.status === 'current'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30 animate-pulse'
                    : 'bg-white border-2 border-slate-200'
                }`}
                style={step.status === 'pending' ? {
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                } : {}}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : step.status === 'current' ? (
                  <Play className="w-7 h-7 text-white" />
                ) : (
                  <Clock className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <p className="font-semibold text-sm text-slate-900 mb-1">{step.label}</p>
              <p className="text-xs text-slate-600">{step.time}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-200">
          <button className="px-6 py-2.5 rounded-xl font-medium text-slate-700 transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.9)'
            }}
          >
            Reject
          </button>
          <button className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40">
            Approve & Execute
          </button>
        </div>
      </div>
    </div>
  );
}
