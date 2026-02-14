import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import ArabiaHero from "@/components/arabia/ArabiaHero";
import ArabiaContent from "@/components/arabia/ArabiaContent";
import ArabiaBookingSidebar from "@/components/arabia/ArabiaBookingSidebar";
import ArabiaCommunity from "@/components/arabia/ArabiaCommunity";
import ArabiaRooms from "@/components/arabia/ArabiaRooms";
import ArabiaServices from "@/components/arabia/ArabiaServices";
import ArabiaGoodToKnow from "@/components/arabia/ArabiaGoodToKnow";
import ArabiaGallery from "@/components/arabia/ArabiaGallery";
import ArabiaContact from "@/components/arabia/ArabiaContact";
import ArabiaInfo from "@/components/arabia/ArabiaInfo";
import ArabiaSurroundings from "@/components/arabia/ArabiaSurroundings";
import ArabiaCrossSell from "@/components/arabia/ArabiaCrossSell";
import ArabiaMobileBookingBar from "@/components/arabia/ArabiaMobileBookingBar";
import AtlantiqueReviews from "@/components/atlantique/AtlantiqueReviews";

const PROPERTY_ID = "2cded4d5-47f4-4168-9b0e-824891c3c69e";

const hardcodedReviews = [
  {
    id: "arabia-r1",
    guest_name: "Kunal",
    guest_location: null,
    rating: 5,
    review_text: "Great place to stay, extremely clean, well equipped, the in-house help was discreet and helpful, we found the place always clean. Darya was a perfect host, very responsive. Even arranged toys for our kids to play with. We loved Sustainable City, great for kids. Would definitely stay there again.",
    stay_date: "2025-11-01",
    created_at: "2025-11-15",
    property_id: PROPERTY_ID,
    updated_at: "2025-11-15",
  },
  {
    id: "arabia-r2",
    guest_name: "Minna",
    guest_location: null,
    rating: 5,
    review_text: "Beautiful, modern, large and stylish family home. A bathroom with every bedroom and a well-equipped kitchen. Great neighbourhood, a gated community with a lot of green, no cars and excellent facilities — swimming pool, tennis court, football pitch, restaurants, shops. An excellent host and warm welcome.",
    stay_date: "2025-12-01",
    created_at: "2025-12-15",
    property_id: PROPERTY_ID,
    updated_at: "2025-12-15",
  },
];

const ArabiaPage = () => {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [images, setImages] = useState<{ image_url: string; alt_text: string | null }[]>([]);
  const [reviews, setReviews] = useState<any[]>(hardcodedReviews);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [availRes, imgRes, revRes, propRes] = await Promise.all([
        supabase.from("availability").select("date").eq("property_id", PROPERTY_ID).eq("available", false),
        supabase.from("property_images").select("image_url, alt_text, display_order").eq("property_id", PROPERTY_ID).order("display_order"),
        supabase.from("reviews").select("*").eq("property_id", PROPERTY_ID).order("created_at", { ascending: false }),
        supabase.from("properties").select("hero_image").eq("id", PROPERTY_ID).single(),
      ]);
      if (availRes.data) setDisabledDates(availRes.data.map(d => new Date(d.date)));
      if (imgRes.data) setImages(imgRes.data);
      if (revRes.data && revRes.data.length > 0) setReviews(revRes.data);
      if (propRes.data?.hero_image) setHeroImage(propRes.data.hero_image);
    };
    loadData();
  }, []);

  const pricePerNight = 350;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * pricePerNight;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ArabiaHero heroImage={heroImage} imageCount={images.length} />

      <div className="max-w-[1200px] mx-auto px-[5%] pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <ArabiaContent />

            <FadeIn>
              <ArabiaRooms />
            </FadeIn>

            <FadeIn>
              <ArabiaServices />
            </FadeIn>

            <FadeIn>
              <ArabiaGoodToKnow />
            </FadeIn>

            <FadeIn>
              <ArabiaGallery images={images} />
            </FadeIn>

            <FadeIn>
              <ArabiaContact />
            </FadeIn>

            <FadeIn>
              <ArabiaInfo />
            </FadeIn>

            <FadeIn>
              <ArabiaSurroundings />
            </FadeIn>

            <FadeIn>
              <div id="reviews">
                <AtlantiqueReviews reviews={reviews} />
              </div>
            </FadeIn>
          </div>

          {/* Right column — sticky booking sidebar (desktop only) */}
          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-[100px]">
              <ArabiaBookingSidebar
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

      {/* Community section — full-bleed */}
      <ArabiaCommunity />

      <FadeIn>
        <ArabiaCrossSell />
      </FadeIn>

      <Footer />

      <ArabiaMobileBookingBar
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

export default ArabiaPage;
