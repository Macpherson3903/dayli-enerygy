export type QuotationAppliance = {
  id: string;
  name: string;
  watts: number;
  defaultHoursPerDay: number;
};

export type QuotationComputedRow = QuotationAppliance & {
  quantity: number;
  peakLoad: number;
  dailyEnergy: number;
};

export const quotationSeo = {
  title: "Solar Quotation",
  description:
    "Estimate your peak load and daily energy usage by entering appliance quantities for your home or business.",
  keywords: [
    "solar quotation",
    "load calculator",
    "energy consumption calculator",
    "dayli energy quotation",
    "peak load estimate",
  ],
};

export const quotationHeader = {
  title: "Solar Quotation Calculator",
  description:
    "Enter only appliance quantity. Peak load and daily energy are calculated automatically.",
};

export const quotationAppliances: QuotationAppliance[] = [
  { id: "led-bulbs", name: "LED Bulbs", watts: 15, defaultHoursPerDay: 4 },
  {
    id: "cfl-bulb-old",
    name: "CFL bulb (Old Houses)",
    watts: 60,
    defaultHoursPerDay: 4,
  },
  {
    id: "security-lights",
    name: "Security/Outdoor lights",
    watts: 50,
    defaultHoursPerDay: 12,
  },
  { id: "standing-fans", name: "Standing Fans", watts: 60, defaultHoursPerDay: 8 },
  { id: "ceiling-fans", name: "Ceiling Fans", watts: 60, defaultHoursPerDay: 12 },
  { id: "table-fans", name: "Table fans", watts: 60, defaultHoursPerDay: 0.5 },
  {
    id: "air-conditioner-split",
    name: "Air Conditioner (Split)",
    watts: 1500,
    defaultHoursPerDay: 7,
  },
  {
    id: "air-conditioner-window",
    name: "Air Conditioner (Window 1.HP)",
    watts: 1000,
    defaultHoursPerDay: 4,
  },
  {
    id: "refrigerator",
    name: "Refrigerator",
    watts: 300,
    defaultHoursPerDay: 12,
  },
  { id: "freezer", name: "Freezer", watts: 300, defaultHoursPerDay: 12 },
  { id: "microwave", name: "Microwave", watts: 1500, defaultHoursPerDay: 0 },
  {
    id: "electric-kettle",
    name: "Electric kettle",
    watts: 2000,
    defaultHoursPerDay: 0,
  },
  { id: "blender", name: "Blender", watts: 500, defaultHoursPerDay: 0.5 },
  { id: "toaster", name: "Toaster", watts: 1500, defaultHoursPerDay: 0 },
  { id: "television", name: "Television", watts: 100, defaultHoursPerDay: 6 },
  { id: "decoder-dstv", name: "Decoder (DSTV)", watts: 25, defaultHoursPerDay: 12 },
  {
    id: "home-theater-speaker",
    name: "Home Theater/Speaker",
    watts: 150,
    defaultHoursPerDay: 4,
  },
  {
    id: "game-console",
    name: "Game Console (Play Station)",
    watts: 150,
    defaultHoursPerDay: 0,
  },
  { id: "laptops", name: "Laptops", watts: 90, defaultHoursPerDay: 4 },
  { id: "desktop-computer", name: "Desktop Computer", watts: 200, defaultHoursPerDay: 0 },
  { id: "monitor", name: "Monitor", watts: 60, defaultHoursPerDay: 0 },
  { id: "printer", name: "Printer", watts: 500, defaultHoursPerDay: 0 },
  { id: "wifi-router", name: "Wifi Router", watts: 15, defaultHoursPerDay: 12 },
  { id: "phone-charger", name: "Phone Charger", watts: 15, defaultHoursPerDay: 5 },
  { id: "bore-hole-pump", name: "Bore hole pump", watts: 2000, defaultHoursPerDay: 0.5 },
  {
    id: "electric-pressing-iron",
    name: "Electric Pressing Iron",
    watts: 1500,
    defaultHoursPerDay: 1,
  },
  { id: "washing-machine", name: "Washing machine", watts: 800, defaultHoursPerDay: 2 },
  { id: "hair-dryer", name: "Hair Dryer", watts: 2000, defaultHoursPerDay: 0 },
];

export function computeQuotationRow(
  appliance: QuotationAppliance,
  quantity: number
): QuotationComputedRow {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
  const peakLoad = safeQuantity * appliance.watts;
  const dailyEnergy = peakLoad * appliance.defaultHoursPerDay;

  return {
    ...appliance,
    quantity: safeQuantity,
    peakLoad,
    dailyEnergy,
  };
}
