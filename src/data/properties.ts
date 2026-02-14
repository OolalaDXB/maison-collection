import property1 from "@/assets/property-1.avif";
import property2 from "@/assets/property-2.avif";
import property3 from "@/assets/property-3.avif";
import property4 from "@/assets/property-4.avif";
import property5 from "@/assets/property-5.avif";
import property6 from "@/assets/property-6.avif";
import property7 from "@/assets/property-7.avif";
import property8 from "@/assets/property-8.avif";
import atlantiqueHero from "@/assets/atlantique-hero.png";
import atlantique1 from "@/assets/atlantique-1.avif";
import atlantique2 from "@/assets/atlantique-2.avif";
import atlantique3 from "@/assets/atlantique-3.avif";
import atlantique4 from "@/assets/atlantique-4.avif";
import atlantique5 from "@/assets/atlantique-5.avif";
import atlantique6 from "@/assets/atlantique-6.avif";
import atlantique7 from "@/assets/atlantique-7.avif";
import atlantique8 from "@/assets/atlantique-8.avif";
import atlantique9 from "@/assets/atlantique-9.avif";
import atlantique10 from "@/assets/atlantique-10.avif";
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
  atlantique: [atlantique1, atlantique2, atlantique3, atlantique4, atlantique5, atlantique6, atlantique7, atlantique8, atlantique9, atlantique10],
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
      "Ski duplex 100m² at 200m from the gondola in New Gudauri. Two levels, two private bedrooms, sleeps 6, three bathrooms. Wood fireplace with unlimited supply, equipped kitchen, panoramic Caucasus views, balcony, fast WiFi and Smart TV.\n\nLevel 1: Open studio with sofa bed, kitchen, fireplace, bathroom with tub. Level 2: Bedroom with queen bed, second bedroom with two singles, two private bathrooms.\n\nWhy guests love it: Optimal ski location — literally 4 minutes walk to the gondola. Panoramic double-height bay windows with sunrise over the peaks. Guaranteed comfort even at −15°C. Three bathrooms means zero morning wait. Self check-in 24/7 via secure lockbox. Ski lockers in basement, rental shop 50m away. SPA in basement available for a fee. Free parking in front of building.",
    pricePerNight: 180,
    currency: "EUR",
    capacity: 6,
    bedrooms: 2,
    bathrooms: 3,
    areaSqm: 100,
    amenities: [
      "Fireplace (unlimited wood)",
      "Hi-Fi system",
      "Ski storage (basement lockers)",
      "Panoramic balcony",
      "200m from gondola",
      "Starlink WiFi",
      "Smart TV",
      "Equipped kitchen",
      "SPA (basement, fee)",
      "Free parking",
      "Self check-in 24/7",
      "Washer",
      "Elevator",
    ],
    airbnbLink: "https://www.airbnb.com/h/gudaurichalet",
    airbnbRating: 5.0,
    airbnbReviewsCount: 20,
    status: "active",
    tags: ["Ski Season", "Superhost", "Guest Favourite"],
    heroImage: georgia10,
    galleryImages: [georgia5, georgia6, georgia7, georgia8, georgia9, georgia10, georgia11, georgia12, georgia13, georgia14, property1, property3, property4, property2, property5, property6, property7, property8],
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
    tags: ["Architecture 2023", "Pool", "Superhost"],
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
    heroImage: atlantiqueHero,
    galleryImages: [atlantique1, atlantique2, atlantique3, atlantique4, atlantique5, atlantique6, atlantique7, atlantique8, atlantique9, atlantique10],
  },
  {
    name: "Maison Arabia",
    slug: "arabia",
    location: "The Sustainable City, Dubai",
    region: "Dubai",
    country: "UAE",
    description: "A family townhouse in Dubai's first net-zero energy community. Car-free streets, live-in helper, community pool, and a different way of living.",
    pricePerNight: 350,
    currency: "EUR",
    capacity: 6,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: null,
    amenities: ["Live-in helper", "Community pool", "Fitness center", "Tennis court", "Car-free streets", "Solar powered", "Fast WiFi", "Air conditioning", "Washer & dryer", "Rooftop terrace"],
    airbnbLink: null,
    airbnbRating: 5.0,
    airbnbReviewsCount: 2,
    status: "active",
    tags: ["Superhost", "Sustainable"],
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
    text: "I had a wonderful stay! The place was very clean, comfortable, and exactly as described. Special thanks to Darya for being such a kind and responsive host. I would definitely stay here again!",
    date: "2025-08-15",
    propertySlug: "georgia",
  },
  {
    guestName: "Marcos Simon",
    guestLocation: null,
    rating: 5,
    text: "Great and luxurious apartment, 3 min walking from the lifts. Very comfortable and even featuring a beautiful Hi-Fi system. Will probably book again when returning to Gudauri!",
    date: "2026-02-01",
    propertySlug: "georgia",
  },
  {
    guestName: "Abdulaziz",
    guestLocation: "Riyadh",
    rating: 5,
    text: "The place is absolutely fantastic — cozy, comfortable, and perfect. The stunning sunrise views from the balcony were unforgettable. Darya was incredibly friendly and accommodating. Everything about our stay was perfect!",
    date: "2025-09-15",
    propertySlug: "georgia",
  },
  {
    guestName: "Maria",
    guestLocation: "Dubai",
    rating: 5,
    text: "We had a fantastic stay at this ski loft in Gudauri. The apartment is in a great location, very close to the slopes, and is well-equipped and comfortable. Darya was very helpful and responsive. Highly recommended!",
    date: "2025-03-10",
    propertySlug: "georgia",
  },
  {
    guestName: "Wayne",
    guestLocation: "Ar-Rayyan, Qatar",
    rating: 5,
    text: "Darya's apartment is perfect for a trip with family or friends to Gudauri. Extremely helpful host who went above and beyond. Little touches like the blackout blinds were well thought out without ruining the gorgeous views. We will definitely be back!",
    date: "2025-03-15",
    propertySlug: "georgia",
  },
  {
    guestName: "Piotr",
    guestLocation: null,
    rating: 5,
    text: "The apartment feels welcoming, nicely designed, and very spacious — perfect for a family of 5–6 people. The kitchen is large and well equipped, and having a private bathroom for each bedroom is a huge plus. Overall, a great apartment that we highly recommend for families.",
    date: "2026-02-01",
    propertySlug: "georgia",
  },
  {
    guestName: "Adrianne",
    guestLocation: "Chapel Hill, NC",
    rating: 5,
    text: "Fantastic stay in Gudauri at the loft. Great location and superb views.",
    date: "2025-12-15",
    propertySlug: "georgia",
  },
  {
    guestName: "Abdull",
    guestLocation: "Kuwait City",
    rating: 5,
    text: "A wonderful place in New Gudauri for ski in/ski out. The apartment is a stunner. The host was incredibly helpful with airport transport, restaurant recommendations and more. For a ski holiday… this place is tops!",
    date: "2025-02-10",
    propertySlug: "georgia",
  },
  {
    guestName: "Daniel",
    guestLocation: "Israel",
    rating: 5,
    text: "Everything worked perfectly. A loft with a perfect layout for 2 families. Very beautiful view from the window, gorgeous fireplace, 2 excellent bedrooms with their own bathrooms. Perfectly located with restaurants, supermarkets and lift nearby.",
    date: "2026-01-20",
    propertySlug: "georgia",
  },
  {
    guestName: "Irina",
    guestLocation: null,
    rating: 5,
    text: "This place is absolutely amazing! The location is perfect, offering stunning views and being just steps away from the cable car and ski rentals. Darya and Mickael were wonderful hosts, always responsive and accommodating. Highly recommend!",
    date: "2025-02-15",
    propertySlug: "georgia",
  },
  {
    guestName: "Kevin",
    guestLocation: "Dubai",
    rating: 5,
    text: "The highlight of this loft is of course the fireplace! Lighting a fireplace on a cold snowy evening was just great! Communication with the hosts is fast and hassle-free. Conveniently located almost in the center of the ski resort.",
    date: "2025-12-20",
    propertySlug: "georgia",
  },
  {
    guestName: "Artem",
    guestLocation: "Almaty",
    rating: 5,
    text: "Darya's place was absolutely amazing and we had a very relaxing weekend with our friends! It's a walking distance to ski lifts and bars. The house is well equipped with everything we needed. Darya is a great host!",
    date: "2025-01-20",
    propertySlug: "georgia",
  },
];
