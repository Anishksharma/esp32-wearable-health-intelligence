import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';
import { DataSourceBadge } from './Badge';
import { TelemetryDataSource } from '../../types/telemetry';

export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  timestamp?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'neutral';
  dataSource?: TelemetryDataSource;
  subLabel?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  previousValue,
  trend = 'neutral',
  changePercent,
  timestamp,
  status = 'healthy',
  dataSource = 'DEMO',
  subLabel,
  icon: Icon,
  onClick,
  className = '',
}) => {
  const statusColors = {
    healthy: 'border-[#34342B] hover:border-[#54E38E]/50',
    warning: 'border-[#FFB547]/50 bg-[#FFB547]/5',
    critical: 'border-[#FF4545] bg-[#FF4545]/10 animate-pulse',
    neutral: 'border-[#34342B]',
  }[status];

  const valueColors = {
    healthy: 'text-[#F4F1E9]',
    warning: 'text-[#FFB547]',
    critical: 'text-[#FF4545]',
    neutral: 'text-[#F4F1E9]',
  }[status];

  return (
    <div
      onClick={onClick}
      className={`relative bg-[#171714] border p-4 transition-all duration-200 ${statusColors} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top row: Label, Icon, and Data Source Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#FF8A24]" />}
          <span className="font-sans text-xs uppercase tracking-wider text-[#A6A69A] font-semibold">
            {label}
          </span>
        </div>
        <DataSourceBadge source={dataSource} />
      </div>

      {/* Main Value & Unit */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`font-mono text-3xl font-bold tracking-tight ${valueColors}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-sm text-[#A6A69A]">{unit}</span>}
      </div>

      {/* Trend indicator & Previous Reading */}
      <div className="flex items-center justify-between text-xs font-mono text-[#A6A69A] pt-2 border-t border-[#34342B]">
        <div className="flex items-center gap-1.5">
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-[#FF8A24]" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-[#B6F23A]" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-[#6B6B5F]" />}

          {changePercent !== undefined ? (
            <span
              className={
                trend === 'up'
                  ? 'text-[#FF8A24]'
                  : trend === 'down'
                  ? 'text-[#B6F23A]'
                  : 'text-[#6B6B5F]'
              }
            >
              {changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`}
            </span>
          ) : previousValue !== undefined ? (
            <span>Prev: {previousValue} {unit}</span>
          ) : (
            <span>{subLabel || 'Nominal'}</span>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-[11px] text-[#6B6B5F] truncate max-w-[110px]" title={timestamp}>
            {timestamp.includes('T') ? timestamp.split('T')[1].slice(0, 8) : timestamp}
          </span>
        )}
      </div>

      {/* Subtle corner accent for Industrial look */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#FF8A24]/40" />
    </div>
  );
};
