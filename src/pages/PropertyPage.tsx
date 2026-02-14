import { useLocation, Link } from "react-router-dom";
import { properties, reviews } from "@/data/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import { useState } from "react";
import { X } from "lucide-react";

const PropertyPage = () => {
  const location = useLocation();
  const slug = location.pathname.replace("/", "");
  const property = properties.find((p) => p.slug === slug);
  const propertyReviews = reviews.filter((r) => r.propertySlug === slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!property || property.status === "coming_soon") {
    return null;
  }

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
            {property.galleryImages.map((img, i) => (
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
            src={property.galleryImages[lightboxIndex]}
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
              <h2 className="font-display text-3xl mb-6">About this maison</h2>
              <p className="text-muted-foreground leading-relaxed font-light text-lg mb-8">
                {property.longDescription || property.description}
              </p>
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

      {/* Reviews */}
      {propertyReviews.length > 0 && (
        <section className="warm-section section-padding">
          <div className="max-container">
            <FadeIn>
              <p className="section-label">Guest Reviews</p>
              <h2 className="font-display text-3xl mb-12">What our guests say</h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {propertyReviews.map((review, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="p-8 bg-background border border-border">
                    <p className="text-muted-foreground leading-relaxed mb-6 font-light italic">
                      "{review.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {review.guestName}
                        {review.guestLocation && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            — {review.guestLocation}
                          </span>
                        )}
                      </p>
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
