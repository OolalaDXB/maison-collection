import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import community1 from "@/assets/arabia-community-1.jpeg";
import community2 from "@/assets/arabia-community-2.jpeg";
import community3 from "@/assets/arabia-community-3.jpeg";
import community4 from "@/assets/arabia-community-4.jpeg";
import community5 from "@/assets/arabia-community-5.jpeg";
import community6 from "@/assets/arabia-community-6.jpeg";
import interior1 from "@/assets/arabia-interior-1.jpeg";
import interior2 from "@/assets/arabia-interior-2.avif";
import interior3 from "@/assets/arabia-interior-3.jpeg";

const fallbackImages = [
  { src: interior2, alt: "Maison Arabia — living area" },
  { src: community5, alt: "The Sustainable City — community pool" },
  { src: interior1, alt: "Maison Arabia — walk-in closet" },
  { src: community1, alt: "The Sustainable City — bio-domes aerial view" },
  { src: interior3, alt: "Maison Arabia — bathroom" },
  { src: community4, alt: "The Sustainable City — cycling track" },
  { src: community2, alt: "The Sustainable City — entrance" },
  { src: community3, alt: "The Sustainable City — fitness center" },
  { src: community6, alt: "The Sustainable City — gardens & walkways" },
];

interface Props {
  images: { image_url: string; alt_text: string | null }[];
}

const ArabiaGallery = ({ images }: Props) => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = images.length > 0
    ? images.map(img => ({ src: img.image_url, alt: img.alt_text || "Maison Arabia" }))
    : fallbackImages;

  if (photos.length === 0) {
    return (
      <div id="arabia-gallery" className="border-t border-border pt-10 mb-10">
        <div className="bg-[#f8f8f8] py-16 px-8 text-center">
          <p className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-4">
            Photos Coming Soon
          </p>
          <p className="font-body font-light text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            We're preparing the gallery for Maison Arabia. In the meantime, contact us for more details.
          </p>
          <a
            href="mailto:chez@maisons.co?subject=Photos request — Maison Arabia"
            className="inline-block bg-foreground text-background font-body uppercase text-xs tracking-[0.1em] px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Contact us
          </a>
        </div>
      </div>
    );
  }

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null);

  return (
    <div id="arabia-gallery" className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Overview of the Property
      </h3>

      <div className="space-y-3">
        {photos.map((photo, i) => {
          const posInRow = i % 3;
          if (posInRow === 0) {
            return (
              <div key={i} className="w-full">
                <img src={photo.src} alt={photo.alt} className="w-full h-[300px] md:h-[450px] object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(i)} loading="lazy" decoding="async" />
              </div>
            );
          }
          if (posInRow === 1) {
            const nextPhoto = photos[i + 1];
            return (
              <div key={i} className="grid grid-cols-2 gap-3">
                <img src={photo.src} alt={photo.alt} className="w-full h-[200px] md:h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(i)} loading="lazy" decoding="async" />
                {nextPhoto && (
                  <img src={nextPhoto.src} alt={nextPhoto.alt} className="w-full h-[200px] md:h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(i + 1)} loading="lazy" decoding="async" />
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.92)] flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-6 right-6 text-white" onClick={closeLightbox}><X size={24} /></button>
          <button className="absolute left-4 text-white p-2" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft size={32} /></button>
          <button className="absolute right-4 text-white p-2" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight size={32} /></button>
          <img src={photos[lightbox].src} alt={photos[lightbox].alt} className="max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} loading="lazy" decoding="async" />
          <p className="absolute bottom-6 text-white/70 font-body text-sm">{lightbox + 1} / {photos.length}</p>
        </div>
      )}
    </div>
  );
};

export default ArabiaGallery;
