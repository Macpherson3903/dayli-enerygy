import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import AboutHero from "@/components/about/AboutHero";
import AboutMission from "@/components/about/AboutMission";
import AboutValues from "@/components/about/AboutValues";
import AboutStory from "@/components/about/AboutStory";
import AboutTrust from "@/components/about/AboutTrust";
import AboutJsonLd from "@/components/about/AboutJsonLd";
import {
  aboutHero,
  aboutJsonLd,
  aboutMilestones,
  aboutMission,
  aboutSeo,
  aboutStory,
  aboutTrust,
  aboutValues,
} from "@/lib/content/about";

export const metadata: Metadata = {
  title: aboutSeo.title,
  description: aboutSeo.description,
  keywords: aboutSeo.keywords,
  openGraph: {
    title: "About | Dayli Energy Solutions",
    description: aboutSeo.openGraphDescription,
    type: "website",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-gray-800">
        <AboutJsonLd
          organizationName={aboutJsonLd.organizationName}
          url={aboutJsonLd.url}
          logo={aboutJsonLd.logo}
          contactEmail={aboutJsonLd.contactEmail}
          telephone={aboutJsonLd.telephone}
          address={aboutJsonLd.address}
          description={aboutSeo.description}
        />
        <AboutHero
          title={aboutHero.title}
          subtitle={aboutHero.subtitle}
          primaryCta={aboutHero.primaryCta}
          secondaryCta={aboutHero.secondaryCta}
        />
        <AboutMission heading={aboutMission.heading} paragraphs={aboutMission.paragraphs} />
        <AboutValues values={aboutValues} />
        <AboutStory
          heading={aboutStory.heading}
          paragraphs={aboutStory.paragraphs}
          milestones={aboutMilestones}
        />
        <AboutTrust title={aboutTrust.title} points={aboutTrust.points} />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}