export type SeedPackage = {
  name: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  typicalAppliances: string[];
  stock: number;
  featured: boolean;
};

export const SEED_PACKAGES: SeedPackage[] = [
  {
    name: "Solar package — small home",
    slug: "solar-package-small-home",
    category: "residential",
    price: 890_000,
    image: "/solarRoof.png",
    shortDescription: "Essential backup for lights, TV, and a fridge.",
    description:
      "A balanced entry package for modest daily loads. Typical use: LED lighting, television, small fridge, phone charging, and fans — ideal for apartments or compact homes.",
    features: [
      "Sized for essential circuits",
      "Expandable later",
      "Professional installation available",
    ],
    typicalAppliances: [
      "LED lighting",
      "Television",
      "Small refrigerator",
      "Fans",
      "Mobile device charging",
    ],
    stock: 12,
    featured: true,
  },
  {
    name: "Solar package — family home",
    slug: "solar-package-family-home",
    category: "residential",
    price: 1_650_000,
    image: "/inverter.png",
    shortDescription: "More capacity for larger fridges, pumps, and mixed loads.",
    description:
      "For households that need reliable power across more circuits. Marketing guidance: suitable for larger fridge/freezer, additional lighting zones, small water pump, and entertainment equipment.",
    features: [
      "Higher daily energy budget",
      "Room for surge loads",
      "Battery-focused resilience",
    ],
    typicalAppliances: [
      "Large refrigerator / freezer",
      "Extended lighting",
      "Entertainment center",
      "Small water pump",
      "Fans and routers",
    ],
    stock: 8,
    featured: true,
  },
];
