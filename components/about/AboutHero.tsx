import Link from "next/link";

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
    <section
      className="bg-gradient-to-b from-[#0B5D3B] to-[#06442B] px-6 py-20 text-white"
      aria-labelledby="about-hero-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h1 id="about-hero-title" className="text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base text-white/85 sm:text-lg">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-md bg-[#38C172] px-6 py-3 text-sm font-medium shadow-md transition hover:bg-[#2fa863] focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-md border border-white/60 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
