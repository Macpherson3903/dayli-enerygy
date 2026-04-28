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
      backgroundImageUrl="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
    />
  );
}
