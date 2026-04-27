import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daylienergy.com"), // update when domain is ready

  title: {
    default: "Dayli Energy Solutions | Solar Panels, Inverters & Batteries",
    template: "%s | Dayli Energy Solutions",
  },

  description:
    "Dayli Energy Solutions provides high-quality solar panels, inverters, and battery systems for reliable and sustainable energy across Nigeria.",

  keywords: [
    "solar panels Nigeria",
    "inverters",
    "solar batteries",
    "renewable energy",
    "Dayli Energy",
    "solar installation",
    "energy solutions Nigeria",
  ],

  authors: [{ name: "Dayli Energy Solutions" }],

  creator: "Dayli Energy Solutions",
  publisher: "Dayli Energy Solutions",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://daylienergy.com",
    title: "Dayli Energy Solutions | Solar Energy Store",
    description:
      "Shop premium solar panels, inverters, and batteries for reliable energy solutions in Nigeria.",
    siteName: "Dayli Energy Solutions",
    images: [
      {
        url: "/og-image.jpg", // place in /public
        width: 1200,
        height: 630,
        alt: "Dayli Energy Solutions",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Dayli Energy Solutions",
    description:
      "Solar panels, inverters & batteries for sustainable energy solutions in Nigeria.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}