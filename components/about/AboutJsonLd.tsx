type AboutJsonLdProps = {
  organizationName: string;
  url: string;
  logo: string;
  contactEmail: string;
  telephone: string;
  address: string;
  description: string;
};

export default function AboutJsonLd({
  organizationName,
  url,
  logo,
  contactEmail,
  telephone,
  address,
  description,
}: AboutJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: organizationName,
        url: "https://daylienergy.com",
        logo,
        email: contactEmail,
        telephone,
        address: {
          "@type": "PostalAddress",
          streetAddress: address,
          addressLocality: "Port Harcourt",
          addressRegion: "Rivers State",
          addressCountry: "NG",
        },
      },
      {
        "@type": "WebPage",
        name: "About Dayli Energy Solutions",
        url,
        description,
        isPartOf: {
          "@type": "WebSite",
          name: organizationName,
          url: "https://daylienergy.com",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
