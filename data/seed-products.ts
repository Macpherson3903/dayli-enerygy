import type { ProductCategory } from "@/lib/types";

export type SeedProduct = {
  name: string;
  slug: string;
  category: Exclude<ProductCategory, "all">;
  price: number;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  stock: number;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "Solar Panel 300W",
    slug: "solar-panel-300w",
    category: "solar",
    price: 120_000,
    image: "/solarRoof.png",
    shortDescription: "High efficiency solar panel",
    description:
      "High efficiency solar panel designed for residential and commercial usage.",
    features: [
      "High conversion efficiency",
      "Durable tempered glass",
      "Weather resistant",
      "25-year lifespan",
    ],
    stock: 50,
  },
  {
    name: "Inverter 5kVA",
    slug: "inverter-5kva",
    category: "inverter",
    price: 350_000,
    image: "/inverter.png",
    shortDescription: "Reliable inverter system",
    description:
      "Reliable pure sine wave inverter for stable and uninterrupted power supply.",
    features: [
      "Pure sine wave output",
      "Smart load management",
      "Overload protection",
      "Silent operation",
    ],
    stock: 30,
  },
  {
    name: "Lithium Battery 200Ah",
    slug: "lithium-battery-200ah",
    category: "battery",
    price: 500_000,
    image: "/battery.png",
    shortDescription: "Long-lasting battery storage",
    description: "Long-lasting lithium battery for energy storage systems.",
    features: [
      "Deep cycle performance",
      "Fast charging",
      "Lightweight design",
      "Long lifespan",
    ],
    stock: 20,
  },
];
