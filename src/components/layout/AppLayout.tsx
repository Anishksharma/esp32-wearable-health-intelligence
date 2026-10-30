import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';
import { ToastContainer } from '../common/ToastContainer';
import { AlertDetailModal } from '../alerts/AlertDetailModal';
import { DocumentPreviewModal } from '../common/DocumentPreviewModal';
import { PrintReportModal } from '../common/PrintReportModal';

// Feature Views
import { VitalsOverview } from '../commandCenter/VitalsOverview';
import { SynchronizedCharts } from '../commandCenter/SynchronizedCharts';
import { QuickControls } from '../commandCenter/QuickControls';
import { EducationalNotice } from '../commandCenter/EducationalNotice';
import { LiveMonitoringView } from '../liveMonitoring/LiveMonitoringView';
import { DeviceConnectivityView } from '../deviceConnectivity/DeviceConnectivityView';
import { SensorManagementView } from '../sensorManagement/SensorManagementView';
import { AlertsView } from '../alerts/AlertsView';
import { HealthHistoryView } from '../healthHistory/HealthHistoryView';
import { SimulationLabView } from '../simulationLab/SimulationLabView';
import { UniversalDocumentsView } from '../universalDocuments/UniversalDocumentsView';
import { GeneratedDashboardView } from '../generatedDashboard/GeneratedDashboardView';
import { ReportsAnalyticsView } from '../reportsAnalytics/ReportsAnalyticsView';
import { SettingsView } from '../settings/SettingsView';
import { TestResultsDashboard } from '../testSuite/TestResultsDashboard';

export const AppLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('command-center');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'command-center':
        return (
          <div className="space-y-6">
            <VitalsOverview onNavigateToAlerts={() => setActiveView('alerts')} />
            <SynchronizedCharts />
            <QuickControls />
            <EducationalNotice />
          </div>
        );
      case 'live-monitoring':
        return <LiveMonitoringView />;
      case 'device-connectivity':
        return <DeviceConnectivityView />;
      case 'sensor-management':
        return <SensorManagementView />;
      case 'alerts':
        return <AlertsView />;
      case 'health-history':
        return <HealthHistoryView onOpenPrintReport={() => setIsPrintModalOpen(true)} />;
      case 'simulation-lab':
        return <SimulationLabView />;
      case 'universal-docs':
        return <UniversalDocumentsView onNavigateToDashboard={() => setActiveView('generated-dashboard')} />;
      case 'generated-dashboard':
        return <GeneratedDashboardView onOpenPrintReport={() => setIsPrintModalOpen(true)} />;
      case 'reports-analytics':
        return <ReportsAnalyticsView />;
      case 'tests':
        return <TestResultsDashboard />;
      case 'settings':
        return <SettingsView />;
      default:
        return <VitalsOverview />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0B0A] text-[#F4F1E9] font-sans">
      {/* Collapsible Industrial Obsidian Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Compact Status Bar */}
        <TopStatusBar activeView={activeView} setActiveView={setActiveView} />

        {/* View Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-tech-dots">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <AlertDetailModal />
      <DocumentPreviewModal />
      <PrintReportModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} />
    </div>
  );
};
