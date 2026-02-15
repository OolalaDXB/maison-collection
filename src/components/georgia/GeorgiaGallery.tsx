import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import g5 from "@/assets/georgia-5.jpg";
import g6 from "@/assets/georgia-6.png";
import g7 from "@/assets/georgia-7.png";
import g8 from "@/assets/georgia-8.jpg";
import g9 from "@/assets/georgia-9.png";
import g10 from "@/assets/georgia-10.png";
import g11 from "@/assets/georgia-11.png";
import g12 from "@/assets/georgia-12.png";
import g13 from "@/assets/georgia-13.jpg";
import g14 from "@/assets/georgia-14.jpg";

const fallbackImages = [g10, g5, g6, g7, g8, g9, g11, g12, g13, g14];

interface Props {
  images: { image_url: string; alt_text: string | null }[];
}

const GeorgiaGallery = ({ images }: Props) => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = images.length > 0
    ? images.map(img => ({ src: img.image_url, alt: img.alt_text || "Maison Georgia" }))
    : fallbackImages.map((src, i) => ({ src, alt: `Maison Georgia photo ${i + 1}` }));

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null);

  return (
    <div id="georgia-gallery" className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Overview of the Property
      </h3>

      {/* Mosaic layout */}
      <div className="space-y-3">
        {photos.map((photo, i) => {
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
                  decoding="async"
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
                  decoding="async"
                />
                {nextPhoto && (
                  <img
                    src={nextPhoto.src}
                    alt={nextPhoto.alt}
                    className="w-full h-[200px] md:h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => openLightbox(i + 1)}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            );
          }

          return null;
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
            loading="lazy"
            decoding="async"
          />
          <p className="absolute bottom-6 text-white/70 font-body text-sm">{lightbox + 1} / {photos.length}</p>
        </div>
      )}
    </div>
  );
};

export default GeorgiaGallery;
