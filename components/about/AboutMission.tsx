type AboutMissionProps = {
  heading: string;
  paragraphs: string[];
};

export default function AboutMission({ heading, paragraphs }: AboutMissionProps) {
  return (
    <section className="bg-white px-6 py-16" aria-labelledby="about-mission-title">
      <div className="mx-auto max-w-4xl">
        <h2 id="about-mission-title" className="text-3xl font-bold text-[#0B5D3B]">
          {heading}
        </h2>
        <div className="mt-5 space-y-4 text-gray-700 leading-relaxed">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
