import { useState, useRef, useEffect } from "react";

interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Progressive hero image with shimmer placeholder + blur-up reveal.
 * Shows an animated gradient placeholder, then fades in the full image.
 */
const HeroImage = ({ src, alt, className = "" }: HeroImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the image is already cached, mark as loaded immediately
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <>
      {/* Shimmer placeholder */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
        aria-hidden
      >
        <div className="w-full h-full bg-gradient-to-br from-[hsl(30,15%,88%)] via-[hsl(30,10%,82%)] to-[hsl(30,15%,88%)] animate-[shimmer_2s_ease-in-out_infinite]" />
      </div>

      {/* Actual image with blur-up */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} transition-all duration-700 ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"}`}
        fetchPriority="high"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
};

export default HeroImage;
