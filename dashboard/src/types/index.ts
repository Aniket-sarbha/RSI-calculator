export interface TokenSummary {
  token_address: string;
  latest_price: number;
  latest_rsi: number | null;
  total_trades: number;
  last_updated: string;
}

export interface RsiMessage {
  token_address: string;
  rsi_value: number;
  price: number;
  timestamp: string;
  period_used: number;
}

export interface HistoricalDataPoint {
  timestamp: string;
  price: number;
  rsi: number | null;
}

export interface HistoricalData {
  token_address: string;
  data_points: HistoricalDataPoint[];
}

export interface ChartDataPoint {
  timestamp: string;
  price: number;
  rsi: number | null;
  time: number; // Unix timestamp for easier manipulation
}

export interface TokenData {
  address: string;
  priceHistory: ChartDataPoint[];
  currentPrice: number;
  currentRsi: number | null;
  totalTrades: number;
  lastUpdated: string;
}