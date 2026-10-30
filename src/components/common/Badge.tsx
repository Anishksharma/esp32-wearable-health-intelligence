import React from 'react';
import { MetricTraceabilityType } from '../../types/document';
import { AlertSeverity } from '../../types/alerts';
import { TelemetryDataSource } from '../../types/telemetry';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'lime' | 'amber' | 'red' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    orange: 'bg-[#FF8A24]/15 text-[#FF8A24] border border-[#FF8A24]/40',
    lime: 'bg-[#B6F23A]/15 text-[#B6F23A] border border-[#B6F23A]/40',
    amber: 'bg-[#FFB547]/15 text-[#FFB547] border border-[#FFB547]/40',
    red: 'bg-[#FF4545]/15 text-[#FF4545] border border-[#FF4545]/40',
    neutral: 'bg-[#20201B] text-[#A6A69A] border border-[#34342B]',
    outline: 'border border-[#34342B] text-[#F4F1E9]',
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-none tracking-wider uppercase ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};

export const TraceabilityBadge: React.FC<{ type: MetricTraceabilityType }> = ({ type }) => {
  switch (type) {
    case 'DOCUMENT_FACT':
      return <Badge variant="lime">DOC FACT</Badge>;
    case 'CALCULATED_METRIC':
      return <Badge variant="orange">CALCULATED</Badge>;
    case 'FORECAST':
      return <Badge variant="amber">FORECAST</Badge>;
    case 'AI_INTERPRETATION':
      return <Badge variant="neutral">AI INTERPRETATION</Badge>;
    default:
      return <Badge variant="neutral">{type}</Badge>;
  }
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return <Badge variant="red" className="animate-pulse">CRITICAL</Badge>;
    case 'WARNING':
      return <Badge variant="amber">WARNING</Badge>;
    case 'INFO':
      return <Badge variant="neutral">INFO</Badge>;
  }
};

export const DataSourceBadge: React.FC<{ source?: TelemetryDataSource }> = ({ source }) => {
  switch (source) {
    case 'LIVE_HARDWARE':
      return <Badge variant="orange" className="font-semibold">LIVE HW</Badge>;
    case 'SD_CARD':
      return <Badge variant="amber">SD ARCHIVE</Badge>;
    case 'IMPORTED_FILE':
      return <Badge variant="lime">IMPORTED</Badge>;
    case 'DEMO':
    default:
      return <Badge variant="neutral">DEMO</Badge>;
  }
};
