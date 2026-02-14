import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import GeorgiaHero from "@/components/georgia/GeorgiaHero";
import GeorgiaContent from "@/components/georgia/GeorgiaContent";
import GeorgiaBookingSidebar from "@/components/georgia/GeorgiaBookingSidebar";
import GeorgiaRooms from "@/components/georgia/GeorgiaRooms";
import GeorgiaServices from "@/components/georgia/GeorgiaServices";
import GeorgiaGoodToKnow from "@/components/georgia/GeorgiaGoodToKnow";
import GeorgiaGallery from "@/components/georgia/GeorgiaGallery";
import GeorgiaContact from "@/components/georgia/GeorgiaContact";
import GeorgiaInfo from "@/components/georgia/GeorgiaInfo";
import GeorgiaSurroundings from "@/components/georgia/GeorgiaSurroundings";
import GeorgiaCrossSell from "@/components/georgia/GeorgiaCrossSell";
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
              <GeorgiaServices />
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
