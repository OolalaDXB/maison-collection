import { Leaf, Baby, TreePine } from "lucide-react";
import FadeIn from "@/components/FadeIn";

import regionSustainable from "@/assets/region-sustainable-city.jpg";
import regionBiodomes from "@/assets/region-biodomes.jpg";
import regionEquestrian from "@/assets/region-equestrian.jpg";

const regionPhotos = [
  {
    src: regionSustainable,
    alt: "The Sustainable City green corridors and solar panels",
    caption: "The Sustainable City — net-zero energy",
  },
  {
    src: regionBiodomes,
    alt: "Bio-dome greenhouses in The Sustainable City",
    caption: "Bio-domes & urban farms",
  },
  {
    src: regionEquestrian,
    alt: "Equestrian center and children playing in car-free streets",
    caption: "Car-free streets — family first",
  },
];

const cards = [
  {
    icon: Leaf,
    title: "Net-Zero Energy",
    text: "Solar panels generate as much energy as the community consumes. Average water use: 162L/capita vs Dubai's 278L.",
  },
  {
    icon: Baby,
    title: "Family-First Design",
    text: "Car-free residential streets. 4 playgrounds, equestrian center, farm with animals. Children run free.",
  },
  {
    icon: TreePine,
    title: "Living Green",
    text: "11 bio-dome greenhouses, urban farms, 10,000 trees. Residents grow their own produce.",
  },
];

const links = [
  { label: "The Sustainable City", url: "https://thesustainablecity.com/cities/dubai/" },
  { label: "Instagram", url: "https://www.instagram.com/thesustainablecity" },
  { label: "SEE Institute", url: "https://www.seeinstitute.ae/" },
];

const ArabiaCommunity = () => {
  return (
    <section className="bg-[#0a1628] py-16 md:py-20 px-[5%]">
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          <p className="font-body uppercase tracking-wider text-[0.7rem] text-white/60 mb-3">
            The Community
          </p>
          <h3 className="font-display font-normal text-3xl text-white mb-2">
            The Sustainable City
          </h3>
          <p className="font-body font-light text-lg text-white/70 mb-8">
            The first net-zero energy community in the Middle East.
          </p>

          <div className="max-w-2xl mb-10">
            <p className="font-body font-light text-white/80 leading-relaxed mb-4">
              Built by Diamond Developers in 2015, this 113-acre community of 500 homes was designed around one idea: prove that sustainable living doesn't mean sacrifice. Car-free streets, solar-powered homes, urban farms, a 30-metre tree belt, and a community where neighbours actually know each other.
            </p>
            <p className="font-body font-light text-white/80 leading-relaxed">
              Awarded "Happiest Community" by the Gulf Real Estate Awards and recognised by the SEE Institute as a model for sustainable urban development. Over 60% of the city is dedicated to green spaces. 8,000+ tons of CO₂ avoided annually.
            </p>
          </div>
        </FadeIn>

        {/* Community photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {regionPhotos.map((photo, i) => (
            <FadeIn key={photo.alt} delay={i * 0.15}>
              <div className="relative overflow-hidden group">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-[220px] md:h-[260px] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                {photo.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 font-body font-light text-xs text-white/80">
                    {photo.caption}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {cards.map((card, i) => (
            <FadeIn key={card.title} delay={i * 0.2}>
              <div className="border border-white/20 px-6 py-5 h-full flex flex-col">
                <card.icon size={24} className="text-white mb-3 shrink-0" strokeWidth={1.5} />
                <h4 className="font-body font-medium text-sm text-white mb-2">{card.title}</h4>
                <p className="font-body font-light text-sm text-white/70 leading-relaxed flex-1">{card.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <div className="flex flex-wrap gap-6">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body font-light text-sm text-white/60 hover:text-white transition-colors"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ArabiaCommunity;
