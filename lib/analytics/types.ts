export type TimeSeriesPoint = {
  label: string;
  value: number;
};

export type MultiSeriesPoint = {
  label: string;
  orders: number;
  customers: number;
  /** Installation bookings created that day (Mongo). */
  bookings: number;
};

export type BreakdownPoint = {
  label: string;
  value: number;
};
