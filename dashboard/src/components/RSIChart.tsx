import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ChartDataPoint } from '@/types';

interface RSIChartProps {
  data: ChartDataPoint[];
  tokenAddress: string;
}

export const RSIChart: React.FC<RSIChartProps> = ({ data, tokenAddress }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rsiValue = payload[0].value;
      return (
        <div className="bg-[--color-background] p-3 border border-[--color-border] rounded shadow-lg backdrop-blur">
          <p className="text-sm text-[--color-muted-foreground]">{formatTime(label)}</p>
          <p className="text-sm font-medium text-purple-500 dark:text-purple-400">
            RSI: {rsiValue ? rsiValue.toFixed(2) : 'N/A'}
          </p>
          {rsiValue && (
            <p className="text-xs text-[--color-muted-foreground]">
              {rsiValue >= 70 ? 'Overbought' : rsiValue <= 30 ? 'Oversold' : 'Neutral'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Filter data to only include points with RSI values
  const filteredData = data.filter(point => point.rsi !== null);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="card-title">RSI Chart <span className="text-[--color-muted-foreground] font-normal">{tokenAddress.slice(0,8)}...</span></h3>
        <span className="text-xs text-[--color-muted-foreground]">{filteredData.length} pts</span>
      </div>
      {filteredData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-[--color-muted-foreground] text-sm">
          No RSI data yet. Gathering price history...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted)/0.2)" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 100]} tickFormatter={(value: any) => value.toString()} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground)/0.3)', strokeWidth: 1 }} />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-[--color-muted-foreground]">
        <div>
          <p>Data points: {filteredData.length}</p>
          {filteredData.length > 0 && (
            <p>Current RSI: {filteredData[filteredData.length - 1].rsi?.toFixed(2) || 'N/A'}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-red-400">RSI &gt; 70: Overbought</p>
          <p className="text-red-400">RSI &lt; 30: Oversold</p>
        </div>
      </div>
    </div>
  );
};