import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B5D3B] text-white">
      {/* Mobile Background */}
      <div className="absolute inset-0 -z-10 md:hidden">
        <Image
          src="/heroImg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0B5D3B]/85" />
      </div>

      {/* Desktop Background */}
      <div className="absolute inset-0 -z-10 hidden md:block">
        <Image
          src="/solarRoof.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0B5D3B]/80" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 md:py-32 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Power Your Life with Reliable Solar Energy
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:mt-7 sm:text-lg">
            Affordable solar panels, inverters, and batteries for homes and
            businesses. Built for efficiency, reliability, and long-term
            savings.
          </p>

          <div className="mt-10 sm:mt-12">
            <Link
              href="/order"
              className="inline-flex min-h-11 min-w-[10rem] items-center justify-center rounded-md bg-[#38C172] px-8 py-3.5 text-sm font-medium shadow-lg shadow-black/15 transition hover:bg-[#2fa863] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0B5D3B]"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
