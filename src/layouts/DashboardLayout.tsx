import { Outlet, NavLink } from "react-router";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Bell, 
  Clock,
  Menu,
  X,
  Activity
} from "lucide-react";
import { useState } from "react";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analytics", label: "Incidents", icon: Activity },
    { to: "/reports", label: "Analytics", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{
      background: '#e8f0fe',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(147, 197, 253, 0.4) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(251, 207, 232, 0.4) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(196, 181, 253, 0.4) 0, transparent 50%), radial-gradient(at 0% 100%, rgba(252, 211, 77, 0.3) 0, transparent 50%)'
    }}>
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-lg text-slate-800">AIOps Monitor</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-700 hover:bg-white/40"
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
              } : {}}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.7)'
          }}
        >
          <p className="text-xs text-slate-600 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-800">All Systems Operational</span>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8"
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-white/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-600" />
            <select className="px-4 py-2 rounded-xl border-none font-medium text-sm text-slate-700 cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl relative"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                JD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">John Doe</p>
                <p className="text-xs text-slate-600">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
