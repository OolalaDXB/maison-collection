import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProperty } from "@/hooks/useProperty";
import SEO from "@/components/SEO";
import { VacationRentalSchema } from "@/components/StructuredData";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import AtlantiqueHero from "@/components/atlantique/AtlantiqueHero";
import AtlantiqueContent from "@/components/atlantique/AtlantiqueContent";
import AtlantiqueBookingSidebar from "@/components/atlantique/AtlantiqueBookingSidebar";
import AtlantiqueRooms from "@/components/atlantique/AtlantiqueRooms";
import PropertyServices from "@/components/PropertyServices";
import AtlantiqueGoodToKnow from "@/components/atlantique/AtlantiqueGoodToKnow";
import AtlantiqueGallery from "@/components/atlantique/AtlantiqueGallery";
import AtlantiqueContact from "@/components/atlantique/AtlantiqueContact";
import AtlantiqueInfo from "@/components/atlantique/AtlantiqueInfo";
import AtlantiqueSurroundings from "@/components/atlantique/AtlantiqueSurroundings";
import AtlantiqueArchitecture from "@/components/atlantique/AtlantiqueArchitecture";
import AtlantiqueReviews from "@/components/atlantique/AtlantiqueReviews";
import AtlantiqueCrossSell from "@/components/atlantique/AtlantiqueCrossSell";
import PropertyCommunity from "@/components/PropertyCommunity";
import regionGolfe from "@/assets/region-golfe-morbihan.jpg";
import regionCarnac from "@/assets/region-carnac.jpg";
import regionPoulfetan from "@/assets/region-poulfetan.jpg";
import regionBlavet from "@/assets/region-blavet.jpg";

const regionPhotos = [
  { src: regionGolfe, alt: "Golfe du Morbihan — turquoise waters and islands seen from above", caption: "Gulf of Morbihan — 30 min" },
  { src: regionCarnac, alt: "Carnac megalithic alignments — thousands of standing stones at sunset", caption: "Carnac Alignments — 50 min" },
  { src: regionPoulfetan, alt: "Poul Fétan — restored medieval Breton village with thatched stone houses", caption: "Poul Fétan — 5 min" },
  { src: regionBlavet, alt: "Blavet river valley — lush green hills and calm water winding through the Morbihan countryside", caption: "Blavet Valley — 5 min" },
];
import AtlantiqueMobileBookingBar from "@/components/atlantique/AtlantiqueMobileBookingBar";

const PROPERTY_ID = "e514d218-0cdc-43cd-a97b-061132976bfb";

const AtlantiquePage = () => {
  const { data: property } = useProperty(PROPERTY_ID);
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

  const pricePerNight = property?.price_per_night ?? 250;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * pricePerNight;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={property?.name ?? "Maison Atlantique"}
        description={property?.description ?? "A restored Breton stone house near the Blavet valley in Quistinic, Brittany."}
        path="/atlantique"
        image="https://maisons.co/og-atlantique.jpg"
      />
      <VacationRentalSchema
        name={property?.name ?? "Maison Atlantique"}
        description={property?.description ?? "Restored Breton stone house near the Golfe du Morbihan"}
        url="https://maisons.co/atlantique"
        image="https://maisons.co/og-atlantique.jpg"
        address={{ locality: property?.location ?? "Quistinic", region: property?.region ?? "Brittany", country: "FR" }}
        pricePerNight={pricePerNight}
        currency="EUR"
        maxGuests={property?.capacity ?? 6}
        bedrooms={property?.bedrooms ?? 3}
        bathrooms={property?.bathrooms ?? 2}
      />
      <Header />

      <AtlantiqueHero property={property ?? null} imageCount={images.length || 10} />

      <div className="max-w-[1200px] mx-auto px-[5%] pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <AtlantiqueContent property={property ?? null} />

            <FadeIn>
              <AtlantiqueRooms />
            </FadeIn>

            <FadeIn>
              <PropertyServices propertyId={PROPERTY_ID} />
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
              <AtlantiqueInfo property={property ?? null} />
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

          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-[100px]">
              <AtlantiqueBookingSidebar
                property={property ?? null}
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
        <AtlantiqueCrossSell />
      </FadeIn>

      <Footer />

      <AtlantiqueMobileBookingBar
        property={property ?? null}
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
