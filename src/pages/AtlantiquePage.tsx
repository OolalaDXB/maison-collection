import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import AtlantiqueHero from "@/components/atlantique/AtlantiqueHero";
import AtlantiqueContent from "@/components/atlantique/AtlantiqueContent";
import AtlantiqueBookingSidebar from "@/components/atlantique/AtlantiqueBookingSidebar";
import AtlantiqueRooms from "@/components/atlantique/AtlantiqueRooms";
import AtlantiqueServices from "@/components/atlantique/AtlantiqueServices";
import AtlantiqueGoodToKnow from "@/components/atlantique/AtlantiqueGoodToKnow";
import AtlantiqueGallery from "@/components/atlantique/AtlantiqueGallery";
import AtlantiqueContact from "@/components/atlantique/AtlantiqueContact";
import AtlantiqueInfo from "@/components/atlantique/AtlantiqueInfo";
import AtlantiqueSurroundings from "@/components/atlantique/AtlantiqueSurroundings";
import AtlantiqueArchitecture from "@/components/atlantique/AtlantiqueArchitecture";
import AtlantiqueReviews from "@/components/atlantique/AtlantiqueReviews";
import AtlantiqueCrossSell from "@/components/atlantique/AtlantiqueCrossSell";
import AtlantiqueMobileBookingBar from "@/components/atlantique/AtlantiqueMobileBookingBar";

const PROPERTY_ID = "e514d218-0cdc-43cd-a97b-061132976bfb";

const AtlantiquePage = () => {
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

  const pricePerNight = 250;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * pricePerNight;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <AtlantiqueHero imageCount={images.length || 10} />

      <div className="max-w-[1200px] mx-auto px-[5%] pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <AtlantiqueContent />

            <FadeIn>
              <AtlantiqueRooms />
            </FadeIn>

            <FadeIn>
              <AtlantiqueServices />
            </FadeIn>

            <FadeIn>
              <AtlantiqueGoodToKnow />
            </FadeIn>

            <FadeIn>
              <AtlantiqueGallery images={images} />
            </FadeIn>

            <FadeIn>
              <AtlantiqueContact />
            </FadeIn>

            <FadeIn>
              <AtlantiqueInfo />
            </FadeIn>

            <FadeIn>
              <AtlantiqueSurroundings />
            </FadeIn>

            <FadeIn>
              <AtlantiqueArchitecture />
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
              <AtlantiqueBookingSidebar
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
        <AtlantiqueCrossSell />
      </FadeIn>

      <Footer />

      {/* Mobile fixed bottom bar */}
      <AtlantiqueMobileBookingBar
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

export default AtlantiquePage;
