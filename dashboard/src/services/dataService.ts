import { TokenSummary, RsiMessage, HistoricalData, ChartDataPoint } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001/ws';

export class DataService {
  private ws: WebSocket | null = null;
  private listeners: ((message: RsiMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // REST API Methods
  async getTokens(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`);
      if (!response.ok) throw new Error('Failed to fetch tokens');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
  }

  async getTokenSummary(tokenAddress: string): Promise<TokenSummary | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/token/${tokenAddress}`);
      if (!response.ok) throw new Error('Failed to fetch token summary');
      const data = await response.json();
      
      if (data.error) {
        console.error('Token not found:', tokenAddress);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching token summary:', error);
      return null;
    }
  }

  async getAllSummaries(): Promise<TokenSummary[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/summaries`);
      if (!response.ok) throw new Error('Failed to fetch summaries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching summaries:', error);
      return [];
    }
  }

  async getTokenHistory(tokenAddress: string): Promise<ChartDataPoint[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${tokenAddress}`);
      if (!response.ok) throw new Error('Failed to fetch token history');
      const data: HistoricalData = await response.json();
      
      if ('error' in data) {
        console.error('Token history not found:', tokenAddress);
        return [];
      }
      
      // Convert historical data points to chart data points
      return data.data_points.map(point => ({
        timestamp: point.timestamp,
        price: point.price,
        rsi: point.rsi,
        time: new Date(point.timestamp).getTime(),
      }));
    } catch (error) {
      console.error('Error fetching token history:', error);
      return [];
    }
  }

  // WebSocket Methods
  connectWebSocket(): void {
    // Don't create multiple connections
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    // Clear any pending reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      console.log('Connecting to WebSocket...');
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RsiMessage = JSON.parse(event.data);
          this.listeners.forEach(listener => listener(message));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.ws = null;
        
        // Only attempt to reconnect if we haven't exceeded max attempts and it's not a manual close
        if (this.reconnectAttempts < this.maxReconnectAttempts && event.code !== 1000) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect WebSocket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.reconnectTimeout = setTimeout(() => {
            this.connectWebSocket();
          }, 3000 * this.reconnectAttempts); // Exponential backoff
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('Max reconnection attempts reached. Please refresh the page.');
        }
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket connection failed. Is the RSI calculator service running on localhost:3001?');
        // Don't log the full error object to reduce console noise
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  disconnectWebSocket(): void {
    // Clear any pending reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('Disconnecting WebSocket...');
      this.ws.close(1000, 'Manual disconnect'); // Use code 1000 for normal closure
      this.ws = null;
    }
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;
  }

  addListener(listener: (message: RsiMessage) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (message: RsiMessage) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Check if the backend service is available
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export a singleton instance
export const dataService = new DataService();