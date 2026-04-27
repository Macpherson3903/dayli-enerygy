import { Leaf, ShieldCheck, Users } from "lucide-react";
import type { AboutValue } from "@/lib/content/about";

type AboutValuesProps = {
  values: AboutValue[];
};

const iconMap = {
  shield: ShieldCheck,
  leaf: Leaf,
  users: Users,
};

export default function AboutValues({ values }: AboutValuesProps) {
  return (
    <section className="bg-green-50 px-6 py-16" aria-labelledby="about-values-title">
      <div className="mx-auto max-w-7xl">
        <h2 id="about-values-title" className="text-3xl font-bold text-gray-900">
          Our values
        </h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          The principles that guide how we serve customers and deliver solar solutions.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = iconMap[value.icon];
            return (
              <article
                key={value.title}
                className="rounded-xl border border-green-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-full bg-green-100 p-3 text-green-700">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{value.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
