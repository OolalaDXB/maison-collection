import { useLocation, Link } from "react-router-dom";
import { properties, reviews } from "@/data/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import { useState, useEffect } from "react";
import { X, Clock, Car } from "lucide-react";
import PropertyMap from "@/components/PropertyMap";
import { supabase } from "@/integrations/supabase/client";

interface DbReview {
  id: string;
  guest_name: string;
  guest_location: string | null;
  rating: number;
  review_text: string;
  stay_date: string | null;
}

interface DbPoi {
  id: string;
  label: string;
  emoji: string;
  latitude: number;
  longitude: number;
}

const PropertyPage = () => {
  const location = useLocation();
  const slug = location.pathname.replace("/", "");
  const property = properties.find((p) => p.slug === slug);
  const staticReviews = reviews.filter((r) => r.propertySlug === slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dbReviews, setDbReviews] = useState<DbReview[]>([]);
  const [dbPois, setDbPois] = useState<DbPoi[]>([]);
  const [dbPropertyId, setDbPropertyId] = useState<string | null>(null);
  const [dbLat, setDbLat] = useState<number | null>(null);
  const [dbLng, setDbLng] = useState<number | null>(null);
  const [dbImages, setDbImages] = useState<string[]>([]);

  useEffect(() => {
    if (!property) return;
    const loadData = async () => {
      const { data: props } = await supabase
        .from("properties")
        .select("id, latitude, longitude")
        .eq("slug", slug)
        .limit(1);
      if (props && props.length > 0) {
        const propId = props[0].id;
        setDbPropertyId(propId);
        setDbLat(props[0].latitude);
        setDbLng(props[0].longitude);

        const [reviewsRes, poisRes, imagesRes] = await Promise.all([
          supabase.from("reviews").select("*").eq("property_id", propId).order("stay_date", { ascending: false }),
          supabase.from("property_pois").select("*").eq("property_id", propId).order("display_order"),
          supabase.from("property_images").select("image_url").eq("property_id", propId).order("display_order"),
        ]);
        if (reviewsRes.data && reviewsRes.data.length > 0) setDbReviews(reviewsRes.data as DbReview[]);
        if (poisRes.data) setDbPois(poisRes.data as DbPoi[]);
        if (imagesRes.data && imagesRes.data.length > 0) setDbImages(imagesRes.data.map((i: any) => i.image_url));
      }
    };
    loadData();
  }, [slug, property]);

  if (!property || property.status === "coming_soon") {
    return null;
  }

  // Use DB images if available, otherwise static
  const galleryImages = dbImages.length > 0 ? dbImages : property.galleryImages;

  // Use DB reviews if available, otherwise static
  const displayReviews = dbReviews.length > 0
    ? dbReviews.map((r) => ({
        guestName: r.guest_name,
        guestLocation: r.guest_location,
        text: r.review_text,
        rating: r.rating,
      }))
    : staticReviews.map((r) => ({
        guestName: r.guestName,
        guestLocation: r.guestLocation,
        text: r.text,
        rating: r.rating,
      }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-end">
        <div className="absolute inset-0">
          <img
            src={property.heroImage}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,0%,0.6)] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-container px-[5%] pb-16 md:pb-20 w-full">
          <FadeIn>
            <p className="text-sm uppercase tracking-[0.15em] text-terra-cotta-light mb-3">
              {property.location}
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-[hsl(0,0%,100%)] mb-4">
              {property.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-[hsl(0,0%,80%)]">
              {property.areaSqm && <span>{property.areaSqm}m²</span>}
              {property.capacity && <span>{property.capacity} guests</span>}
              {property.bathrooms && (
                <span>{property.bathrooms} bathrooms</span>
              )}
              {property.airbnbRating && (
                <span>
                  ★ {property.airbnbRating}
                  {property.airbnbReviewsCount &&
                    ` · ${property.airbnbReviewsCount}+ reviews`}
                </span>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding">
        <div className="max-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`overflow-hidden cursor-pointer ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={img}
                  alt={`${property.name} — Photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  style={{ minHeight: i === 0 ? "400px" : "200px" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[hsl(0,0%,0%,0.9)] flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-[hsl(0,0%,100%)]"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={32} />
          </button>
          <img
            src={galleryImages[lightboxIndex]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Description */}
      <section className="section-padding pt-0">
        <div className="max-container grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <FadeIn>
              <h2 className="font-display text-3xl mb-6">About {property.name}</h2>
              <p className="text-muted-foreground leading-relaxed font-light text-lg mb-8">
                {property.longDescription || property.description}
              </p>
            </FadeIn>

            {/* Layout section for Georgia */}
            {property.slug === "georgia" && (
              <FadeIn delay={0.05}>
                <div className="border-t border-border pt-8 mt-8">
                  <p className="section-label mb-6">Layout</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-display rounded-full">1</span>
                        <h3 className="font-display text-lg">Level 1</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Open studio living</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Sofa bed 160×200</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Equipped kitchen</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Wood fireplace</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Bathroom with bathtub & WC</li>
                      </ul>
                    </div>
                    <div className="border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-display rounded-full">2</span>
                        <h3 className="font-display text-lg">Level 2</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Bedroom 1 — Queen 160×200</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />Bedroom 2 — Two singles 90×200</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full" />2 private bathrooms with WC</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Practical Info */}
            <FadeIn delay={0.08}>
              <div className="border-t border-border pt-8 mt-8">
                <p className="section-label mb-6">Practical Information</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Check-in</p>
                      <p className="text-sm text-muted-foreground">From 3:00 PM</p>
                      <p className="text-xs text-muted-foreground mt-1">Free early check-in if available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Check-out</p>
                      <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                      <p className="text-xs text-muted-foreground mt-1">Late checkout possible on request</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car size={20} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Parking</p>
                      <p className="text-sm text-muted-foreground">Free parking in front of building</p>
                      <p className="text-xs text-muted-foreground mt-1">Non-reserved</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Architecture credits */}
            {property.architectureCredits && (
              <FadeIn delay={0.1}>
                <div className="border-t border-border pt-8 mt-8">
                  <p className="section-label">Architecture</p>
                  <p className="text-foreground font-medium mb-2">
                    {property.architectureCredits.architect},{" "}
                    {property.architectureCredits.location} —{" "}
                    {property.architectureCredits.year}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {property.architectureCredits.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline underline-offset-4"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <FadeIn delay={0.2}>
              <div className="border border-border p-8 sticky top-24">
                <p className="section-label mb-4">Amenities</p>
                <ul className="space-y-3 mb-8">
                  {property.amenities.map((a) => (
                    <li
                      key={a}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-primary rounded-full" />
                      {a}
                    </li>
                  ))}
                </ul>

                {property.pricePerNight && (
                  <div className="border-t border-border pt-6 mb-6">
                    <p className="text-2xl font-display text-foreground">
                      €{property.pricePerNight}
                      <span className="text-sm text-muted-foreground font-body">
                        /night
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {property.airbnbLink && (
                    <a
                      href={property.airbnbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity"
                    >
                      Book on Airbnb
                    </a>
                  )}
                  <a
                    href="mailto:contact@maisons.co"
                    className="block w-full text-center px-6 py-3 border border-border text-foreground text-sm uppercase tracking-[0.1em] hover:border-primary hover:text-primary transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section-padding pt-0">
        <div className="max-container">
          <FadeIn>
            <p className="section-label mb-6">Location</p>
            {(() => {
              // Determine center coordinates
              const fallbackCoords: Record<string, [number, number]> = {
                georgia: [44.4735, 42.4575],
                atlantique: [-3.3455, 47.9135],
              };
              const fallbackPois: Record<string, { label: string; coords: [number, number]; emoji: string }[]> = {
                georgia: [
                  { label: "Gondola", coords: [44.4710, 42.4560], emoji: "🎿" },
                  { label: "Ski Rental", coords: [44.4725, 42.4570], emoji: "⛷️" },
                  { label: "Restaurants", coords: [44.4745, 42.4580], emoji: "🍽️" },
                  { label: "Supermarket", coords: [44.4750, 42.4565], emoji: "🛒" },
                ],
                atlantique: [
                  { label: "Atlantic Coast", coords: [-3.3600, 47.7200], emoji: "🌊" },
                  { label: "Lorient", coords: [-3.3600, 47.7500], emoji: "🏙️" },
                ],
              };

              const center: [number, number] | null =
                (dbLng && dbLat) ? [dbLng, dbLat] : fallbackCoords[property.slug] || null;

              const pois = dbPois.length > 0
                ? dbPois.map((p) => ({ label: p.label, coords: [p.longitude, p.latitude] as [number, number], emoji: p.emoji }))
                : fallbackPois[property.slug] || [];

              if (!center) {
                return (
                  <div className="border border-border p-12 flex flex-col items-center justify-center text-center bg-muted/30">
                    <p className="font-display text-xl text-foreground mb-2">Location</p>
                    <p className="text-sm text-muted-foreground">{property.location}, {property.country}</p>
                  </div>
                );
              }

              return (
                <PropertyMap
                  center={center}
                  zoom={14}
                  propertyName={property.name}
                  pois={pois}
                />
              );
            })()}
          </FadeIn>
        </div>
      </section>

      {/* Reviews */}
      {displayReviews.length > 0 && (
        <section className="warm-section section-padding">
          <div className="max-container">
            <FadeIn>
              <p className="section-label">Guest Reviews</p>
              <h2 className="font-display text-3xl mb-12">
                What our guests say
                <span className="text-lg text-muted-foreground font-body ml-3">
                  ({displayReviews.length} reviews)
                </span>
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayReviews.map((review, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="p-6 bg-background border border-border flex flex-col h-full">
                    <p className="text-muted-foreground leading-relaxed font-light italic flex-1 mb-6 line-clamp-5">
                      "{review.text}"
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {review.guestName}
                        </p>
                        {review.guestLocation && (
                          <p className="text-xs text-muted-foreground">
                            {review.guestLocation}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-primary">★★★★★</span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to collection */}
      <section className="section-padding text-center">
        <FadeIn>
          <Link
            to="/"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            ← Back to the Collection
          </Link>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyPage;
