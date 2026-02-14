import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Fallback to local assets if no DB images
import a1 from "@/assets/atlantique-1.avif";
import a2 from "@/assets/atlantique-2.avif";
import a3 from "@/assets/atlantique-3.avif";
import a4 from "@/assets/atlantique-4.avif";
import a5 from "@/assets/atlantique-5.avif";
import a6 from "@/assets/atlantique-6.avif";
import a7 from "@/assets/atlantique-7.avif";
import a8 from "@/assets/atlantique-8.avif";
import a9 from "@/assets/atlantique-9.avif";
import a10 from "@/assets/atlantique-10.avif";

const fallbackImages = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10];

interface Props {
  images: { image_url: string; alt_text: string | null }[];
}

const AtlantiqueGallery = ({ images }: Props) => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = images.length > 0
    ? images.map(img => ({ src: img.image_url, alt: img.alt_text || "Maison Atlantique" }))
    : fallbackImages.map((src, i) => ({ src, alt: `Maison Atlantique photo ${i + 1}` }));

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null);

  return (
    <div id="atlantique-gallery" className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Overview of the House
      </h3>

      {/* Mosaic layout */}
      <div className="space-y-3">
        {photos.map((photo, i) => {
          // Alternate: full width, then 2-up
          const row = Math.floor(i / 3);
          const posInRow = i % 3;

          if (posInRow === 0) {
            return (
              <div key={i} className="w-full">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-[300px] md:h-[450px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openLightbox(i)}
                  loading="lazy"
                />
              </div>
            );
          }

          if (posInRow === 1) {
            const nextPhoto = photos[i + 1];
            return (
              <div key={i} className="grid grid-cols-2 gap-3">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-[200px] md:h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openLightbox(i)}
                  loading="lazy"
                />
                {nextPhoto && (
                  <img
                    src={nextPhoto.src}
                    alt={nextPhoto.alt}
                    className="w-full h-[200px] md:h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => openLightbox(i + 1)}
                    loading="lazy"
                  />
                )}
              </div>
            );
          }

          return null; // posInRow === 2 is handled above
        })}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.92)] flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-6 right-6 text-white" onClick={closeLightbox}><X size={24} /></button>
          <button className="absolute left-4 text-white p-2" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft size={32} /></button>
          <button className="absolute right-4 text-white p-2" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight size={32} /></button>
          <img
            src={photos[lightbox].src}
            alt={photos[lightbox].alt}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-white/70 font-body text-sm">{lightbox + 1} / {photos.length}</p>
        </div>
      )}
    </div>
  );
};

export default AtlantiqueGallery;
