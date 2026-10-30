import React from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { Sliders, CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react';
import { Badge } from '../common/Badge';

export const SensorManagementView: React.FC = () => {
  const sensors = useHealthStore((state) => state.sensors);

  return (
    <div className="space-y-6">
      <div className="bg-[#171714] border border-[#34342B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider text-[#F4F1E9] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#FF8A24]" />
            SENSOR MATRIX & TRANSDUCER DIAGNOSTICS
          </h2>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            I2C // 1-WIRE DIGITAL // ANALOG RESISTOR DIVIDER HARDWARE INTERFACES
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const isOperational = sensor.status === 'OPERATIONAL';
          const isDisconnected = sensor.status === 'DISCONNECTED';

          return (
            <div key={sensor.id} className="bg-[#171714] border border-[#34342B] p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#34342B] pb-3 mb-3">
                  <div>
                    <h3 className="font-heading text-base uppercase text-[#F4F1E9]">{sensor.name}</h3>
                    <p className="text-[11px] font-mono text-[#A6A69A]">{sensor.model}</p>
                  </div>
                  <Badge variant={isOperational ? 'lime' : isDisconnected ? 'red' : 'amber'}>
                    {sensor.status}
                  </Badge>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-[#23231D]">
                    <span className="text-[#6B6B5F]">HARDWARE BUS:</span>
                    <span className="text-[#F4F1E9] font-bold">{sensor.bus}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#23231D]">
                    <span className="text-[#6B6B5F]">PIN / ADDRESS:</span>
                    <span className="text-[#FF8A24] font-bold">{sensor.addressOrPin}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#23231D]">
                    <span className="text-[#6B6B5F]">LIVE VALUE:</span>
                    <span className="text-[#B6F23A] font-bold">{sensor.reading}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#23231D]">
                    <span className="text-[#6B6B5F]">SIGNAL QUALITY:</span>
                    <span className="text-[#F4F1E9]">{sensor.signal_quality}</span>
                  </div>
                  {sensor.last_calibrated && (
                    <div className="flex justify-between py-1 border-b border-[#23231D]">
                      <span className="text-[#6B6B5F]">CALIBRATED:</span>
                      <span className="text-[#A6A69A]">{sensor.last_calibrated}</span>
                    </div>
                  )}
                </div>

                {sensor.notes && (
                  <p className="mt-3 text-xs font-sans text-[#A6A69A] leading-relaxed bg-[#10100E] p-2.5 border border-[#34342B]">
                    {sensor.notes}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#34342B] flex items-center justify-between text-xs font-mono">
                <span className="text-[#54E38E] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>BUS PROBED OK</span>
                </span>
                <span className="text-[#6B6B5F]">POLL: 1000ms</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
