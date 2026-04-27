"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B5D3B] text-white">
      {/* Background for mobile */}
      <div className="absolute inset-0 -z-10 md:hidden">
        <Image
          src="/heroImg.png"
          alt="Solar installation background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0B5D3B]/85 backdrop-blur-sm" />
      </div>

      {/* Background for desktop */}
      <div className="absolute inset-0 -z-10 hidden md:block">
        <Image
          src="/solar.jpg"
          alt="Solar background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0B5D3B]/80 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Text */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Power Your Life with Reliable Solar Energy
            </h1>

            <p className="mt-5 text-base text-gray-200 sm:text-lg">
              Affordable solar panels, inverters, and batteries for homes and
              businesses. Built for efficiency, reliability, and long-term
              savings.
            </p>

            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-md bg-[#38C172] px-6 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#2fa863] focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Desktop Image */}
          <div className="relative hidden w-full md:block">
            <div className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/heroImg.png"
                alt="Solar panel installation"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}