import React from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { useAlertStore } from '../../store/useAlertStore';
import { KpiCard } from '../common/KpiCard';
import { Heart, Droplet, Thermometer, Wifi, ShieldAlert, Radio, Clock, BatteryCharging } from 'lucide-react';

export const VitalsOverview: React.FC<{ onNavigateToAlerts?: () => void }> = ({ onNavigateToAlerts }) => {
  const currentPacket = useHealthStore((state) => state.currentPacket);
  const previousPacket = useHealthStore((state) => state.previousPacket);
  const deviceInfo = useHealthStore((state) => state.deviceInfo);
  const alerts = useAlertStore((state) => state.alerts);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  // Compute status for HR
  let hrStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (currentPacket.heart_rate_bpm > 130 || (currentPacket.heart_rate_bpm < 45 && currentPacket.heart_rate_bpm > 0)) {
    hrStatus = 'critical';
  } else if (currentPacket.heart_rate_bpm > 100 || (currentPacket.heart_rate_bpm < 60 && currentPacket.heart_rate_bpm > 0)) {
    hrStatus = 'warning';
  }

  // Compute status for SpO2
  let spo2Status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (currentPacket.spo2_percent <= 90 && currentPacket.spo2_percent > 0) {
    spo2Status = 'critical';
  } else if (currentPacket.spo2_percent <= 95 && currentPacket.spo2_percent > 0) {
    spo2Status = 'warning';
  }

  // Compute status for Temp
  let tempStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (currentPacket.temperature_c >= 38.5) {
    tempStatus = 'critical';
  } else if (currentPacket.temperature_c >= 37.5 || currentPacket.temperature_c <= 35.5) {
    tempStatus = 'warning';
  }

  const hrDiff = previousPacket ? currentPacket.heart_rate_bpm - previousPacket.heart_rate_bpm : 0;
  const hrTrend = hrDiff > 0 ? 'up' : hrDiff < 0 ? 'down' : 'neutral';

  const spo2Diff = previousPacket ? currentPacket.spo2_percent - previousPacket.spo2_percent : 0;
  const spo2Trend = spo2Diff > 0 ? 'up' : spo2Diff < 0 ? 'down' : 'neutral';

  const tempDiff = previousPacket ? Number((currentPacket.temperature_c - previousPacket.temperature_c).toFixed(1)) : 0;
  const tempTrend = tempDiff > 0 ? 'up' : tempDiff < 0 ? 'down' : 'neutral';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current Heart Rate */}
      <KpiCard
        label="Heart Rate"
        value={currentPacket.heart_rate_bpm > 0 ? currentPacket.heart_rate_bpm : '--'}
        unit="BPM"
        previousValue={previousPacket?.heart_rate_bpm}
        trend={hrTrend}
        status={hrStatus}
        timestamp={currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel="Optical PPG"
        icon={Heart}
      />

      {/* 2. Current SpO2 */}
      <KpiCard
        label="Blood Oxygen (SpO2)"
        value={currentPacket.spo2_percent > 0 ? currentPacket.spo2_percent : '--'}
        unit="%"
        previousValue={previousPacket?.spo2_percent}
        trend={spo2Trend}
        status={spo2Status}
        timestamp={currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel="Pulse Oximetry"
        icon={Droplet}
      />

      {/* 3. Temperature */}
      <KpiCard
        label="Skin Temperature"
        value={currentPacket.temperature_c.toFixed(1)}
        unit="°C"
        previousValue={previousPacket?.temperature_c.toFixed(1)}
        trend={tempTrend}
        status={tempStatus}
        timestamp={currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel="DS18B20 Contact"
        icon={Thermometer}
      />

      {/* 4. Device Connection */}
      <KpiCard
        label="Connectivity"
        value={currentPacket.connection_status}
        unit={deviceInfo.connection_type}
        previousValue={deviceInfo.wifi_rssi !== undefined ? `${deviceInfo.wifi_rssi} dBm` : undefined}
        trend="neutral"
        status={currentPacket.connection_status === 'CONNECTED' ? 'healthy' : 'critical'}
        timestamp={deviceInfo.last_heartbeat}
        dataSource={currentPacket.data_source}
        subLabel={deviceInfo.ip_address || 'Channel Active'}
        icon={Wifi}
      />

      {/* 5. Active Alerts */}
      <KpiCard
        label="Active Alerts"
        value={activeAlerts.length}
        unit="UNRESOLVED"
        trend={activeAlerts.length > 0 ? 'up' : 'neutral'}
        status={activeAlerts.length > 0 ? 'critical' : 'healthy'}
        timestamp={activeAlerts[0]?.timestamp || currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel={activeAlerts.length > 0 ? 'Action Required' : 'All Nominal'}
        icon={ShieldAlert}
        onClick={onNavigateToAlerts}
      />

      {/* 6. Sensor Signal Quality */}
      <KpiCard
        label="Optical Signal"
        value={currentPacket.signal_quality}
        unit="Q-SCORE"
        trend="neutral"
        status={
          currentPacket.signal_quality === 'EXCELLENT' || currentPacket.signal_quality === 'GOOD'
            ? 'healthy'
            : currentPacket.signal_quality === 'FAIR'
            ? 'warning'
            : 'critical'
        }
        timestamp={currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel="MAX30100 Perfusion"
        icon={Radio}
      />

      {/* 7. Last Telemetry Update */}
      <KpiCard
        label="Telemetry Monotonicity"
        value={`#${deviceInfo.packets_received}`}
        unit="PKTS"
        trend="neutral"
        status="healthy"
        timestamp={currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel={`Uptime: ${Math.floor(deviceInfo.uptime_seconds / 60)}m ${deviceInfo.uptime_seconds % 60}s`}
        icon={Clock}
      />

      {/* 8. Battery Status */}
      <KpiCard
        label="LiPo Cell Potential"
        value={deviceInfo.battery_voltage.toFixed(2)}
        unit="V"
        trend="neutral"
        status={deviceInfo.battery_voltage < 3.6 ? 'warning' : 'healthy'}
        timestamp={currentPacket.timestamp}
        dataSource={currentPacket.data_source}
        subLabel={`${deviceInfo.battery_percent}% Remaining`}
        icon={BatteryCharging}
      />
    </div>
  );
};
