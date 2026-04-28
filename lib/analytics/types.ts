export type TimeSeriesPoint = {
  label: string;
  value: number;
};

export type MultiSeriesPoint = {
  label: string;
  orders: number;
  customers: number;
};

export type BreakdownPoint = {
  label: string;
  value: number;
};
