import { Helmet } from "react-helmet-async";

interface VacationRentalProps {
  name: string;
  description: string;
  url: string;
  image: string;
  address: {
    locality: string;
    region: string;
    country: string;
  };
  pricePerNight: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
}

export const VacationRentalSchema = ({
  name, description, url, image, address,
  pricePerNight, currency, rating, reviewCount,
  maxGuests, bedrooms, bathrooms,
}: VacationRentalProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name,
    description,
    url,
    image,
    address: {
      "@type": "PostalAddress",
      addressLocality: address.locality,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    numberOfRooms: bedrooms,
    numberOfBathroomsTotal: bathrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: maxGuests,
    },
    priceRange: `From ${pricePerNight} ${currency}/night`,
    ...(rating && reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
          },
        }
      : {}),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface OrganizationProps {
  name: string;
  url: string;
  logo?: string;
  email: string;
}

export const OrganizationSchema = ({ name, url, logo, email }: OrganizationProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo ? { logo } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      email,
      contactType: "reservations",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
