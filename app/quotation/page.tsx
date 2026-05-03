import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { quotationSeo } from "@/lib/content/quotation";

export const metadata: Metadata = {
  title: quotationSeo.title,
  description: quotationSeo.description,
  keywords: quotationSeo.keywords,
  openGraph: {
    title: "Quotation | Dayli Energy Solutions",
    description: quotationSeo.description,
    type: "website",
    url: "/quotation",
  },
};

export default function QuotationPage() {
  redirect("/installation-booking");
}
