import React from 'react';
import { AlertCircle, ThermometerSnowflake, ShieldAlert } from 'lucide-react';

export const EducationalNotice: React.FC = () => {
  return (
    <div className="bg-[#171714] border border-[#34342B] p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#FFB547]">
        <ShieldAlert className="w-4 h-4 text-[#FFB547]" />
        <span>Hardware & Clinical Advisory Framework</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-[#A6A69A] leading-relaxed">
        {/* Contact vs Core Body Temperature */}
        <div className="flex items-start gap-2.5 p-3 bg-[#10100E] border border-[#34342B]">
          <ThermometerSnowflake className="w-4 h-4 text-[#FF8A24] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#F4F1E9] block font-mono text-[11px] uppercase mb-1">
              Sensor-Contact Skin vs Internal Core Temperature:
            </strong>
            The DS18B20 digital thermal probe records direct peripheral skin temperature. Skin temperature is naturally 0.5°C to 0.8°C lower than internal core body temperature under ambient 22°C conditions and varies with vasoconstriction, perspiration, and wrist strap tightness.
          </div>
        </div>

        {/* Non-Diagnostic Prototype Notice */}
        <div className="flex items-start gap-2.5 p-3 bg-[#10100E] border border-[#34342B]">
          <AlertCircle className="w-4 h-4 text-[#B6F23A] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#F4F1E9] block font-mono text-[11px] uppercase mb-1">
              Non-Diagnostic Educational Prototype:
            </strong>
            This software and associated ESP32 hardware constitute an engineering demonstration and telemetry platform. It does NOT claim clinical accuracy, FDA/CE medical clearance, diagnostic capability, or disease prediction. Readings must never replace clinical assessment by certified healthcare personnel.
          </div>
        </div>
      </div>
    </div>
  );
};
