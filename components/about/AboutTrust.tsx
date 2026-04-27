type AboutTrustProps = {
  title: string;
  points: string[];
};

export default function AboutTrust({ title, points }: AboutTrustProps) {
  return (
    <section className="bg-green-50 px-6 py-16" aria-labelledby="about-trust-title">
      <div className="mx-auto max-w-7xl rounded-2xl border border-green-200 bg-white p-8">
        <h2 id="about-trust-title" className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <li key={point} className="rounded-lg bg-green-50 px-4 py-3 text-sm text-gray-700">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
