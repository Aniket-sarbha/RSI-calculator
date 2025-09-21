import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '@/types';

interface PriceChartProps {
  data: ChartDataPoint[];
  tokenAddress: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, tokenAddress }) => {
  const formatPrice = (value: number) => {
    if (value < 0.0001) {
      return value.toExponential(2);
    }
    return value.toFixed(8);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[--color-background] p-3 border border-[--color-border] rounded shadow-lg backdrop-blur">
          <p className="text-sm text-[--color-muted-foreground]">{formatTime(label)}</p>
          <p className="text-sm font-medium text-blue-500 dark:text-blue-400">
            Price: {formatPrice(payload[0].value)} SOL
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="card-title">Price Chart <span className="text-[--color-muted-foreground] font-normal">{tokenAddress.slice(0,8)}...</span></h3>
        <span className="text-xs text-[--color-muted-foreground]">Last {data.length} pts</span>
      </div>
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-[--color-muted-foreground] text-sm">
          No price data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted)/0.2)" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickFormatter={formatPrice} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={["dataMin", "dataMax"]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground)/0.3)', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};