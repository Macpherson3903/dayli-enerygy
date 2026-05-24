import Image from "next/image";
import Link from "next/link";

type HeroCta = {
  label: string;
  href: string;
};

type PageHeroProps = {
  title: string;
  description: string;
  /** Desktop / default hero background (local path or URL). */
  backgroundImageUrl: string;
  /** Optional mobile background — matches home hero when set. */
  mobileBackgroundImageUrl?: string;
  eyebrow?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
};

export function PageHero({
  title,
  description,
  backgroundImageUrl,
  mobileBackgroundImageUrl,
  eyebrow,
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  const useLocalImages =
    backgroundImageUrl.startsWith("/") &&
    (!mobileBackgroundImageUrl || mobileBackgroundImageUrl.startsWith("/"));

  return (
    <section
      className="relative overflow-hidden bg-[#0B5D3B] text-white"
      aria-label={`${title} hero`}
    >
      {useLocalImages ? (
        <>
          <div className="absolute inset-0 z-0 md:hidden">
            <Image
              src={mobileBackgroundImageUrl ?? backgroundImageUrl}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 z-0 hidden md:block">
            <Image
              src={backgroundImageUrl}
              alt=""
              fill
              unoptimized
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
          <div
            className="absolute inset-0 z-[1] bg-[#0B5D3B]/85 md:bg-[#0B5D3B]/80"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
          />
          <div className="absolute inset-0 z-[1] bg-[#0B5D3B]/75" aria-hidden />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base text-white/90 sm:text-lg">{description}</p>
          {primaryCta || secondaryCta ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center rounded-md bg-[#38C172] px-6 py-3 text-sm font-medium shadow-md transition hover:bg-[#2fa863] focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-md border border-white/60 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
