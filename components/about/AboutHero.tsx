import { PageHero } from "@/components/ui/PageHero";

type AboutHeroProps = {
  title: string;
  subtitle: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
};

export default function AboutHero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: AboutHeroProps) {
  return (
    <PageHero
      eyebrow="About Dayli Energy"
      title={title}
      description={subtitle}
      backgroundImageUrl="/about-hero.jpeg"
      mobileBackgroundImageUrl="/about-hero.jpeg"
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
    />
  );
}
