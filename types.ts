
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface MetricPoint {
  year: string;
  value: number;
}

export interface FinancialCharts {
  revenue: MetricPoint[];
  margins: MetricPoint[];
  roic: MetricPoint[];
  stockPrice: MetricPoint[];
}

export interface AnalysisResponse {
  query: string;
  text: string;
  sources: GroundingChunk[];
  charts?: FinancialCharts;
}

export interface WatchlistItem {
  id: string;
  query: string;
  verdict: string;
  timestamp: number;
  fullAnalysis?: AnalysisResponse;
}

export interface TickerInfo {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: number;
}

export interface FileRecord {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  size: number;
  type: string;
  timestamp: number;
  note?: string;
  aiSummary?: string;
}

export enum Verdict {
  ATTRACTIVE = '✅ Langfristig attraktiv',
  PATIENCE = '⚖️ Beobachten, Geduld erforderlich',
  NO_INVESTMENT = '❌ Kein Investment nach Buffett-Kriterien',
  TOO_HARD = '📦 Too-Hard-Pile (zu komplex)'
}
