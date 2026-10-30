import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Wifi,
  Sliders,
  Bell,
  History,
  FlaskConical,
  FileText,
  LineChart,
  BarChart3,
  Settings,
  TestTube2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';

export interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  category: 'HEALTH' | 'INTELLIGENCE' | 'SYSTEM';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isCollapsed,
  setIsCollapsed,
}) => {
  const alerts = useAlertStore((state) => state.alerts);
  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const navItems: NavItem[] = [
    // Health Wearable Core
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, category: 'HEALTH' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Activity, category: 'HEALTH' },
    { id: 'device-connectivity', label: 'Device Connectivity', icon: Wifi, category: 'HEALTH' },
    { id: 'sensor-management', label: 'Sensor Management', icon: Sliders, category: 'HEALTH' },
    { id: 'alerts', label: 'Alerts & Early Warning', icon: Bell, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined, category: 'HEALTH' },
    { id: 'health-history', label: 'Health History & SD', icon: History, category: 'HEALTH' },
    { id: 'simulation-lab', label: 'Simulation Lab', icon: FlaskConical, badge: 'DEMO', category: 'HEALTH' },

    // Universal Document Intelligence
    { id: 'universal-docs', label: 'Document Engine', icon: FileText, category: 'INTELLIGENCE' },
    { id: 'generated-dashboard', label: 'Generated Dashboards', icon: LineChart, category: 'INTELLIGENCE' },
    { id: 'reports-analytics', label: 'Analytics & Insights', icon: BarChart3, category: 'INTELLIGENCE' },

    // System & Validation
    { id: 'tests', label: 'Automated Suite (127)', icon: TestTube2, badge: '127', category: 'SYSTEM' },
    { id: 'settings', label: 'System Settings', icon: Settings, category: 'SYSTEM' },
  ];

  return (
    <aside
      className={`bg-[#10100E] border-r border-[#34342B] flex flex-col justify-between transition-all duration-300 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="h-14 border-b border-[#34342B] flex items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 bg-[#FF8A24] text-[#0B0B0A] flex items-center justify-center font-bold text-xs font-mono">
                Ω
              </div>
              <span className="font-heading tracking-widest text-base text-[#F4F1E9] uppercase font-bold truncate">
                INDUSTRIAL OBSIDIAN
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto bg-[#FF8A24] text-[#0B0B0A] flex items-center justify-center font-bold text-sm font-mono">
              Ω
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[#A6A69A] hover:text-[#F4F1E9] hover:bg-[#20201B] border border-transparent hover:border-[#34342B] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-[#6B6B5F] uppercase">
              Wearable Health System
            </div>
          )}
          {navItems
            .filter((item) => item.category === 'HEALTH')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono transition-colors text-left relative ${
                    isActive
                      ? 'bg-[#171714] text-[#FF8A24] font-semibold border-l-2 border-[#FF8A24]'
                      : 'text-[#A6A69A] hover:text-[#F4F1E9] hover:bg-[#171714] border-l-2 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF8A24]' : 'text-[#A6A69A]'}`} />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 border ${
                        typeof item.badge === 'number' && item.badge > 0
                          ? 'bg-[#FF4545]/20 border-[#FF4545] text-[#FF4545] animate-pulse'
                          : 'bg-[#20201B] border-[#34342B] text-[#A6A69A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

          {!isCollapsed && (
            <div className="px-3 pt-4 pb-1.5 text-[10px] font-mono tracking-widest text-[#6B6B5F] uppercase">
              Document Intelligence
            </div>
          )}
          {navItems
            .filter((item) => item.category === 'INTELLIGENCE')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono transition-colors text-left relative ${
                    isActive
                      ? 'bg-[#171714] text-[#B6F23A] font-semibold border-l-2 border-[#B6F23A]'
                      : 'text-[#A6A69A] hover:text-[#F4F1E9] hover:bg-[#171714] border-l-2 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#B6F23A]' : 'text-[#A6A69A]'}`} />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                </button>
              );
            })}

          {!isCollapsed && (
            <div className="px-3 pt-4 pb-1.5 text-[10px] font-mono tracking-widest text-[#6B6B5F] uppercase">
              Assurance & Settings
            </div>
          )}
          {navItems
            .filter((item) => item.category === 'SYSTEM')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono transition-colors text-left relative ${
                    isActive
                      ? 'bg-[#171714] text-[#FFB547] font-semibold border-l-2 border-[#FFB547]'
                      : 'text-[#A6A69A] hover:text-[#F4F1E9] hover:bg-[#171714] border-l-2 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFB547]' : 'text-[#A6A69A]'}`} />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!isCollapsed && item.badge !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#B6F23A]/15 border border-[#B6F23A]/40 text-[#B6F23A]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Bottom non-diagnostic label */}
      <div className="p-3 border-t border-[#34342B] bg-[#0B0B0A]/60">
        {!isCollapsed ? (
          <div className="flex items-start gap-2 text-[10px] font-mono text-[#6B6B5F] leading-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-[#54E38E] shrink-0 mt-0.5" />
            <span>NON-DIAGNOSTIC PROTOTYPE // RESEARCH & TELEMETRY ONLY</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Non-diagnostic Prototype">
            <ShieldCheck className="w-4 h-4 text-[#54E38E]" />
          </div>
        )}
      </div>
    </aside>
  );
};
