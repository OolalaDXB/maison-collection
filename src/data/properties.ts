import property1 from "@/assets/property-1.avif";
import property2 from "@/assets/property-2.avif";
import property3 from "@/assets/property-3.avif";
import property4 from "@/assets/property-4.avif";
import property5 from "@/assets/property-5.avif";
import property6 from "@/assets/property-6.avif";
import property7 from "@/assets/property-7.avif";
import property8 from "@/assets/property-8.avif";
import georgia5 from "@/assets/georgia-5.jpg";
import georgia6 from "@/assets/georgia-6.png";
import georgia7 from "@/assets/georgia-7.png";
import georgia8 from "@/assets/georgia-8.jpg";
import georgia9 from "@/assets/georgia-9.png";
import georgia10 from "@/assets/georgia-10.png";
import georgia11 from "@/assets/georgia-11.png";
import georgia12 from "@/assets/georgia-12.png";
import georgia13 from "@/assets/georgia-13.jpg";
import georgia14 from "@/assets/georgia-14.jpg";

export const propertyImages = {
  georgia: [property1, property2, property3, property4, georgia5, georgia6, georgia7, georgia8, georgia9, georgia10, georgia11, georgia12, georgia13, georgia14],
  atlantique: [property5, property6, property7, property8],
};

export interface Property {
  name: string;
  slug: string;
  location: string;
  region: string;
  country: string;
  description: string;
  longDescription?: string;
  pricePerNight: number | null;
  currency: string;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  amenities: string[];
  airbnbLink: string | null;
  airbnbRating: number | null;
  airbnbReviewsCount: number | null;
  status: "active" | "coming_soon";
  tags: string[];
  architectureCredits?: {
    architect: string;
    location: string;
    year: number;
    links: { label: string; url: string }[];
  };
  heroImage: string;
  galleryImages: string[];
}

export const properties: Property[] = [
  {
    name: "Maison Georgia",
    slug: "georgia",
    location: "Gudauri, Caucasus",
    region: "Greater Caucasus",
    country: "Georgia",
    description:
      "Mountain duplex at the crossroads of Europe and Asia. Double-height windows framing the Caucasus. Fireplace, panoramic views, 200m from the gondola.",
    longDescription:
      "Perched in the heart of the Greater Caucasus, this mountain duplex offers an immersive alpine experience where Europe meets Asia. Double-height windows flood the living space with natural light and frame sweeping panoramic views of snow-capped peaks. The fireplace anchors the open-plan living area, while the Hi-Fi system fills the space with warmth. Step outside onto the panoramic balcony, or walk 200 meters to the gondola for world-class skiing.",
    pricePerNight: 180,
    currency: "EUR",
    capacity: 6,
    bedrooms: 2,
    bathrooms: 3,
    areaSqm: 100,
    amenities: [
      "Fireplace",
      "Hi-Fi system",
      "Ski storage",
      "Panoramic balcony",
      "200m from gondola",
      "Starlink",
    ],
    airbnbLink: "https://www.airbnb.com/h/gudaurichalet",
    airbnbRating: 5.0,
    airbnbReviewsCount: 20,
    status: "active",
    tags: ["Ski Season", "Superhost", "Guest Favourite"],
    heroImage: georgia10,
    galleryImages: [property2, georgia5, georgia6, georgia7, georgia8, georgia9, georgia10, georgia11, georgia12, georgia13, georgia14, property1, property3, property4],
  },
  {
    name: "Maison Atlantique",
    slug: "atlantique",
    location: "Quistinic, Morbihan",
    region: "Brittany",
    country: "France",
    description:
      "19th century Breton penty reimagined by Anthropie Architecture. Stone, contemporary extension, covered heated pool. Bocage silence, 20 minutes from the coast.",
    longDescription:
      "A 19th century Breton penty, meticulously reimagined by Anthropie Architecture in 2023. The original stone structure meets a bold contemporary extension, creating 120m² of refined living space plus a 20m² covered terrace. The heated pool is sheltered beneath an elegant covering, extending the swimming season from April through September. Set in the peaceful bocage countryside of Morbihan, the property offers complete serenity just 20 minutes from the Atlantic coast.",
    pricePerNight: 250,
    currency: "EUR",
    capacity: 6,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 120,
    amenities: [
      "Heated pool",
      "Covered terrace (20m²)",
      "Contemporary architecture",
      "Stone construction",
      "Bocage countryside",
      "20 min from coast",
    ],
    airbnbLink: "https://www.airbnb.com/l/LEHC2J81",
    airbnbRating: 5.0,
    airbnbReviewsCount: null,
    status: "active",
    tags: ["Architecture 2023", "Pool"],
    architectureCredits: {
      architect: "Anthropie Architecture",
      location: "Vannes",
      year: 2023,
      links: [
        {
          label: "Anthropie Studio",
          url: "https://anthropie-studio.com/architecture-s/maison-du-helleguy/",
        },
        {
          label: "Archibien",
          url: "https://www.archibien.com/project/france/quistinic/le-helleguy/",
        },
        {
          label: "Houzz",
          url: "https://www.houzz.fr/professionnels/architecte/anthropie-architectures-pfvwfr-pf~599273598",
        },
      ],
    },
    heroImage: property5,
    galleryImages: [property5, property6, property7, property8],
  },
  {
    name: "Maison Arabia",
    slug: "arabia",
    location: "Dubai",
    region: "Gulf",
    country: "UAE",
    description: "Coming soon. Our next chapter unfolds in the Gulf.",
    pricePerNight: null,
    currency: "EUR",
    capacity: null,
    bedrooms: null,
    bathrooms: null,
    areaSqm: null,
    amenities: [],
    airbnbLink: null,
    airbnbRating: null,
    airbnbReviewsCount: null,
    status: "coming_soon",
    tags: ["Opening 2026"],
    heroImage: "",
    galleryImages: [],
  },
];

export interface Review {
  guestName: string;
  guestLocation: string | null;
  rating: number;
  text: string;
  date: string;
  propertySlug: string;
}

export const reviews: Review[] = [
  {
    guestName: "Anastasia",
    guestLocation: "Tbilisi",
    rating: 5,
    text: "This is truly the best holiday apartment in whole Gudauri! It's worth every dollar. We never wanted to leave.",
    date: "2026-01-15",
    propertySlug: "georgia",
  },
  {
    guestName: "Marcos Simon",
    guestLocation: null,
    rating: 5,
    text: "Great and luxurious apartment, 3 min walking from the lifts. Very comfortable and even featuring a beautiful Hi-Fi system. Will probably book again!",
    date: "2026-02-01",
    propertySlug: "georgia",
  },
  {
    guestName: "Artem",
    guestLocation: "Almaty",
    rating: 5,
    text: "The place is absolutely fantastic — cozy, comfortable, and perfect. The stunning sunrise views from the balcony were unforgettable. Darya was incredibly friendly.",
    date: "2025-01-20",
    propertySlug: "georgia",
  },
  {
    guestName: "Maria",
    guestLocation: "Dubai",
    rating: 5,
    text: "Darya's apartment is perfect for a trip with family or friends. Extremely helpful host who went above and beyond.",
    date: "2025-03-10",
    propertySlug: "georgia",
  },
];
