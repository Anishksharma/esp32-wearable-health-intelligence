import React, { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useDocumentStore } from './store/useDocumentStore';
import { useSimulationStore } from './store/useSimulationStore';
import { useHealthStore } from './store/useHealthStore';
import { WifiService } from './services/wifiService';

export const App: React.FC = () => {
  const initializeDefaultSamples = useDocumentStore((state) => state.initializeDefaultSamples);
  const startSimulation = useSimulationStore((state) => state.startSimulation);
  const pauseSimulation = useSimulationStore((state) => state.pauseSimulation);
  const ingestPacket = useHealthStore((state) => state.ingestPacket);

  useEffect(() => {
    // 1. Initialize sample datasets
    initializeDefaultSamples();

    // 2. Initialize Wi-Fi broadcast channel / window message receiver
    WifiService.initReceiver((packet) => {
      ingestPacket(packet);
    });

    // 3. Start simulated telemetry loop
    startSimulation();

    return () => {
      pauseSimulation();
    };
  }, []);

  return <AppLayout />;
};

export default App;
