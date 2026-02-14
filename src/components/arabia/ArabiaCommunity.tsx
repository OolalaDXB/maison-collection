import { Leaf, Baby, TreePine } from "lucide-react";
import FadeIn from "@/components/FadeIn";

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
  { label: "World Bank Case Study", url: "https://blogs.worldbank.org/en/arabvoices/sustainable-city-dubai-dream-reality" },
  { label: "Diamond Developers", url: "https://www.diamonddevelopers.ae/" },
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
              Awarded "Happiest Community" by the Gulf Real Estate Awards and visited by the World Bank as a model for sustainable urban development. Over 60% of the city is dedicated to green spaces. 8,000+ tons of CO₂ avoided annually.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {cards.map((card, i) => (
            <FadeIn key={card.title} delay={i * 0.2}>
              <div className="border border-white/20 px-6 py-5">
                <card.icon size={24} className="text-white mb-3" strokeWidth={1.5} />
                <h4 className="font-body font-medium text-sm text-white mb-2">{card.title}</h4>
                <p className="font-body font-light text-sm text-white/70 leading-relaxed">{card.text}</p>
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
