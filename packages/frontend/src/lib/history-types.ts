export interface HistoryItem {
  id: string;
  type: string;
  title: string;
  summary: string;
  score?: number;
  date: string;
  link: string;
}

export interface HistoryDetail extends HistoryItem {
  input: string;
  analysis: unknown;
  result: unknown;
}
