import React from 'react';
import { TokenData } from '@/types';
import { Activity, Signal, Radio, Clock } from 'lucide-react';

interface DataDisplayProps {
  tokenData: TokenData | null;
  isConnected: boolean;
}

export const DataDisplay: React.FC<DataDisplayProps> = ({ tokenData, isConnected }) => {
  const formatPrice = (value: number) => {
    if (value < 0.0001) {
      return value.toExponential(4);
    }
    return value.toFixed(8);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getRSIStatus = (rsi: number | null) => {
    if (rsi === null) return { text: 'N/A', color: 'text-gray-500' };
    if (rsi >= 70) return { text: 'Overbought', color: 'text-red-600' };
    if (rsi <= 30) return { text: 'Oversold', color: 'text-red-600' };
    return { text: 'Neutral', color: 'text-green-600' };
  };

  if (!tokenData) {
    return (
      <div className="card p-6">
        <div className="card-header p-0 mb-4">
          <h3 className="card-title">Token Data</h3>
        </div>
        <p className="text-sm text-[--color-muted-foreground]">Select a token to view data</p>
      </div>
    );
  }

  const rsiStatus = getRSIStatus(tokenData.currentRsi);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="card-title flex items-center gap-2">Token Data
            <span className="badge ml-2 text-[10px] normal-case">Live Feed</span>
          </h3>
          <p className="text-xs text-[--color-muted-foreground]">Real-time updates streamed via WebSocket</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-[--color-muted-foreground] mb-1 font-medium">Token Address</h4>
            <p className="text-xs font-mono break-all bg-[--color-muted]/40 rounded-md px-2 py-1 border border-[--color-border]">
              {tokenData.address}
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-[--color-muted-foreground] mb-1 font-medium flex items-center gap-1"><Activity className="h-3 w-3" />Current Price</h4>
            <p className="text-2xl font-semibold tracking-tight">
              {formatPrice(tokenData.currentPrice)} <span className="text-sm font-normal text-[--color-muted-foreground]">SOL</span>
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-[--color-muted-foreground] mb-1 font-medium flex items-center gap-1"><Signal className="h-3 w-3" />RSI Value</h4>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-semibold tracking-tight">
                {tokenData.currentRsi?.toFixed(2) || 'N/A'}
              </p>
              <span className={`text-xs font-medium px-2 py-1 rounded-md border ${rsiStatus.color.includes('red') ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' : rsiStatus.color.includes('green') ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' : 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-300'}`}>{rsiStatus.text}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <h4 className="text-xs uppercase tracking-wide text-[--color-muted-foreground] mb-1 font-medium flex items-center gap-1"><Radio className="h-3 w-3" />Total Trades</h4>
              <p className="text-lg font-semibold">{tokenData.totalTrades.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wide text-[--color-muted-foreground] mb-1 font-medium flex items-center gap-1"><Clock className="h-3 w-3" />Last Updated</h4>
              <p className="text-xs text-[--color-muted-foreground]">{formatTime(tokenData.lastUpdated)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
        <div className="bg-[--color-muted]/40 rounded-lg p-3 border border-[--color-border]">
          <p className="font-medium mb-1">Data Points</p>
          <p className="text-[--color-muted-foreground]">{tokenData.priceHistory.length} collected</p>
        </div>
        <div className="bg-[--color-muted]/40 rounded-lg p-3 border border-[--color-border]">
          <p className="font-medium mb-1">RSI Window</p>
          <p className="text-[--color-muted-foreground]">14 periods</p>
        </div>
      </div>
    </div>
  );
};