import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { VacationRentalSchema } from "@/components/StructuredData";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import GeorgiaHero from "@/components/georgia/GeorgiaHero";
import GeorgiaContent from "@/components/georgia/GeorgiaContent";
import GeorgiaBookingSidebar from "@/components/georgia/GeorgiaBookingSidebar";
import GeorgiaRooms from "@/components/georgia/GeorgiaRooms";
import PropertyServices from "@/components/PropertyServices";
import GeorgiaGoodToKnow from "@/components/georgia/GeorgiaGoodToKnow";
import GeorgiaGallery from "@/components/georgia/GeorgiaGallery";
import GeorgiaContact from "@/components/georgia/GeorgiaContact";
import GeorgiaInfo from "@/components/georgia/GeorgiaInfo";
import GeorgiaSurroundings from "@/components/georgia/GeorgiaSurroundings";
import GeorgiaCrossSell from "@/components/georgia/GeorgiaCrossSell";
import PropertyCommunity from "@/components/PropertyCommunity";
import regionCaucasus from "@/assets/region-caucasus.jpg";
import regionGergeti from "@/assets/region-gergeti.jpg";
import regionHighway from "@/assets/region-military-highway.jpg";

const regionPhotos = [
  { src: regionCaucasus, alt: "Greater Caucasus mountain range from Gudauri", caption: "The Greater Caucasus — 2,200m" },
  { src: regionGergeti, alt: "Gergeti Trinity Church with Mount Kazbek", caption: "Gergeti Trinity Church — Kazbegi" },
  { src: regionHighway, alt: "Georgian Military Highway winding through mountains", caption: "Georgian Military Highway" },
];
import GeorgiaMobileBookingBar from "@/components/georgia/GeorgiaMobileBookingBar";
// Reuse the generic reviews component
import AtlantiqueReviews from "@/components/atlantique/AtlantiqueReviews";

const PROPERTY_ID = "cdcc1fb2-d8e8-4004-a900-e196312952f9";

const GeorgiaPage = () => {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [images, setImages] = useState<{ image_url: string; alt_text: string | null }[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [availRes, imgRes, revRes] = await Promise.all([
        supabase.from("availability").select("date").eq("property_id", PROPERTY_ID).eq("available", false),
        supabase.from("property_images").select("image_url, alt_text, display_order").eq("property_id", PROPERTY_ID).order("display_order"),
        supabase.from("reviews").select("*").eq("property_id", PROPERTY_ID).order("created_at", { ascending: false }),
      ]);
      if (availRes.data) setDisabledDates(availRes.data.map(d => new Date(d.date)));
      if (imgRes.data) setImages(imgRes.data);
      if (revRes.data) setReviews(revRes.data);
    };
    loadData();
  }, []);

  const pricePerNight = 180;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * pricePerNight;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Maison Georgia"
        description="A 5-star mountain retreat in Gudauri, Georgia. Perched at 2,200m in the Greater Caucasus with panoramic views, ski-in access, and year-round adventure."
        path="/georgia"
        image="https://maisons.co/og-georgia.jpg"
      />
      <VacationRentalSchema
        name="Maison Georgia"
        description="5-star mountain retreat in Gudauri, Greater Caucasus"
        url="https://maisons.co/georgia"
        image="https://maisons.co/og-georgia.jpg"
        address={{ locality: "Gudauri", region: "Mtskheta-Mtianeti", country: "GE" }}
        pricePerNight={120}
        currency="EUR"
        rating={5.0}
        reviewCount={22}
        maxGuests={6}
        bedrooms={2}
        bathrooms={2}
      />
      <Header />

      <GeorgiaHero imageCount={images.length || 10} />

      <div className="max-w-[1200px] mx-auto px-[5%] pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <GeorgiaContent />

            <FadeIn>
              <GeorgiaRooms />
            </FadeIn>

            <FadeIn>
              <PropertyServices propertyId={PROPERTY_ID} />
            </FadeIn>

            <FadeIn>
              <GeorgiaGoodToKnow />
            </FadeIn>

            <FadeIn>
              <GeorgiaGallery images={images} />
            </FadeIn>

            <FadeIn>
              <GeorgiaContact />
            </FadeIn>

            <FadeIn>
              <GeorgiaInfo />
            </FadeIn>

            <FadeIn>
              <GeorgiaSurroundings />
            </FadeIn>

            {reviews.length > 0 && (
              <FadeIn>
                <AtlantiqueReviews reviews={reviews} />
              </FadeIn>
            )}
          </div>

          {/* Right column — sticky booking sidebar (desktop only) */}
          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-[100px]">
              <GeorgiaBookingSidebar
                checkIn={checkIn}
                checkOut={checkOut}
                setCheckIn={setCheckIn}
                setCheckOut={setCheckOut}
                guests={guests}
                setGuests={setGuests}
                disabledDates={disabledDates}
                pricePerNight={pricePerNight}
                nights={nights}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>

      <PropertyCommunity propertyId={PROPERTY_ID} photos={regionPhotos} />

      <FadeIn>
        <GeorgiaCrossSell />
      </FadeIn>

      <Footer />

      <GeorgiaMobileBookingBar
        checkIn={checkIn}
        checkOut={checkOut}
        setCheckIn={setCheckIn}
        setCheckOut={setCheckOut}
        guests={guests}
        setGuests={setGuests}
        disabledDates={disabledDates}
        pricePerNight={pricePerNight}
        nights={nights}
        total={total}
      />
    </div>
  );
};

export default GeorgiaPage;
