'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TokenSelector } from '@/components/TokenSelector';
import { DataDisplay } from '@/components/DataDisplay';
import { PriceChart } from '@/components/PriceChart';
import { RSIChart } from '@/components/RSIChart';
import { dataService } from '@/services/dataService';
import { TokenData, RsiMessage, ChartDataPoint } from '@/types';

export default function Dashboard() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadTokens = async (preserveSelection = false) => {
    try {
      if (!preserveSelection) setLoading(true);
      const fetchedTokens = await dataService.getTokens();
      
      // Only update tokens if the list has actually changed
      setTokens(prevTokens => {
        if (JSON.stringify(prevTokens) !== JSON.stringify(fetchedTokens)) {
          return fetchedTokens;
        }
        return prevTokens;
      });
      
      // Only auto-select first token if no token is selected and not preserving selection
      if (fetchedTokens.length > 0 && !selectedToken && !preserveSelection) {
        setSelectedToken(fetchedTokens[0]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load tokens');
      console.error('Error loading tokens:', err);
    } finally {
      if (!preserveSelection) setLoading(false);
    }
  };

  // Load data for selected token
  const loadTokenData = async (tokenAddress: string) => {
    try {
      const [summary, history] = await Promise.all([
        dataService.getTokenSummary(tokenAddress),
        dataService.getTokenHistory(tokenAddress)
      ]);
      
      if (summary) {
        setTokenData({
          address: summary.token_address,
          priceHistory: history, // Use historical data as initial chart data
          currentPrice: summary.latest_price,
          currentRsi: summary.latest_rsi,
          totalTrades: summary.total_trades,
          lastUpdated: summary.last_updated,
        });
      }
    } catch (err) {
      console.error('Error loading token data:', err);
    }
  };

  // Handle WebSocket messages
  const handleRsiMessage = useCallback((message: RsiMessage) => {
    if (selectedToken && message.token_address === selectedToken) {
      const newDataPoint: ChartDataPoint = {
        timestamp: message.timestamp,
        price: message.price,
        rsi: message.rsi_value,
        time: new Date(message.timestamp).getTime(),
      };

      setTokenData(prevData => {
        if (!prevData) return null;

        // Check if this data point already exists (to avoid duplicates)
        const existingIndex = prevData.priceHistory.findIndex(
          point => point.timestamp === newDataPoint.timestamp
        );

        let updatedHistory;
        if (existingIndex >= 0) {
          // Update existing data point
          updatedHistory = [...prevData.priceHistory];
          updatedHistory[existingIndex] = newDataPoint;
        } else {
          // Add new data point
          updatedHistory = [...prevData.priceHistory, newDataPoint];
        }
        
        // Keep only last 200 data points to prevent memory issues
        if (updatedHistory.length > 200) {
          updatedHistory = updatedHistory.slice(-200);
        }

        return {
          ...prevData,
          priceHistory: updatedHistory,
          currentPrice: message.price,
          currentRsi: message.rsi_value,
          lastUpdated: message.timestamp,
        };
      });
    }
  }, [selectedToken]);

  // Initialize connection and load data
  useEffect(() => {
    loadTokens();
    
    // Connect to WebSocket
    dataService.connectWebSocket();
    dataService.addListener(handleRsiMessage);
    
    // Check connection status periodically
    const checkConnection = () => {
      setIsConnected(dataService.isConnected());
    };
    
    // Auto-refresh token list every 5 seconds to pick up new tokens
    const tokenRefreshInterval = setInterval(() => {
      loadTokens(true); // Preserve current selection during auto-refresh
    }, 5000); // 5 seconds
    
    const connectionInterval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(connectionInterval);
      clearInterval(tokenRefreshInterval);
      dataService.removeListener(handleRsiMessage);
      dataService.disconnectWebSocket();
    };
  }, [handleRsiMessage]);

  // Load token data when selection changes
  useEffect(() => {
    if (selectedToken) {
      loadTokenData(selectedToken);
    }
  }, [selectedToken]);

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    setTokenData(null); // Clear previous data
  };

  const refreshData = () => {
    loadTokens();
    if (selectedToken) {
      loadTokenData(selectedToken);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-[--color-border] border-t-[--color-primary] animate-spin mx-auto"></div>
          <div>
            <p className="font-medium">Loading dashboard...</p>
            <p className="text-sm text-[--color-muted-foreground]">Fetching tokens & establishing WebSocket</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Crypto Trading Analytics</h1>
            <p className="text-sm text-[--color-muted-foreground] mt-1">Real-time RSI analysis for pump.fun tokens</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="btn btn-primary"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-md border border-red-300/40 bg-red-100/50 dark:bg-red-500/10 text-red-700 text-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Token Selector */}
        <TokenSelector
          tokens={tokens}
          selectedToken={selectedToken}
          onTokenSelect={handleTokenSelect}
          isConnected={isConnected}
        />

        {/* Main Content */}
        {selectedToken ? (
          <div className="space-y-6">
            <DataDisplay tokenData={tokenData} isConnected={isConnected} />
            {tokenData && tokenData.priceHistory.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceChart data={tokenData.priceHistory} tokenAddress={selectedToken} />
                <RSIChart data={tokenData.priceHistory} tokenAddress={selectedToken} />
              </div>
            )}
            {tokenData && tokenData.priceHistory.length === 0 && (
              <div className="card p-10 text-center space-y-2">
                <p className="text-sm text-[--color-muted-foreground]">No historical data available for this token yet.</p>
                <p className="text-xs text-[--color-muted-foreground]">Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-sm text-[--color-muted-foreground]">
              {tokens.length === 0
                ? 'No tokens yet. Start the RSI calculator to populate data.'
                : 'Select a token to view analytics.'}
            </p>
          </div>
        )}
        <div className="text-center text-[--color-muted-foreground] text-xs pt-4">Using 14-period RSI • Live updates via WebSocket</div>
    </div>
  );
}
