import type { AboutMilestone } from "@/lib/content/about";

type AboutStoryProps = {
  heading: string;
  paragraphs: string[];
  milestones: AboutMilestone[];
};

export default function AboutStory({ heading, paragraphs, milestones }: AboutStoryProps) {
  return (
    <section className="bg-white px-6 py-16" aria-labelledby="about-story-title">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl">
          <h2 id="about-story-title" className="text-3xl font-bold text-[#0B5D3B]">
            {heading}
          </h2>
          <div className="mt-5 space-y-4 text-gray-700 leading-relaxed">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
          <ol className="mt-5 space-y-5">
            {milestones.map((milestone) => (
              <li key={milestone.year + milestone.title} className="border-l-2 border-green-400 pl-4">
                <p className="text-sm font-semibold text-green-700">{milestone.year}</p>
                <p className="mt-1 font-medium text-gray-900">{milestone.title}</p>
                <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
