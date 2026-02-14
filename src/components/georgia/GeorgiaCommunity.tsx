import { Mountain, Snowflake, Church } from "lucide-react";
import FadeIn from "@/components/FadeIn";

const cards = [
  {
    icon: Mountain,
    title: "The Greater Caucasus",
    text: "Gudauri sits at 2,200m on the southern slopes of the Greater Caucasus, one of Europe's last wild mountain ranges. Peaks above 4,000m, deep gorges, and alpine meadows.",
  },
  {
    icon: Snowflake,
    title: "Year-Round Adventure",
    text: "Winter: 57km of pistes, off-piste freeride, heliskiing. Summer: paragliding, hiking the Caucasus Trail, mountain biking. Gudauri has 300 days of sunshine a year.",
  },
  {
    icon: Church,
    title: "Kazbegi & Beyond",
    text: "The iconic Gergeti Trinity Church (2,170m) and Mount Kazbek (5,047m) are 1h30 north. The Georgian Military Highway is one of the world's most scenic drives.",
  },
];

const links = [
  { label: "Visit Georgia", url: "https://www.georgia.travel/" },
  { label: "Gudauri Ski Resort", url: "https://gudauri.info/" },
  { label: "Kazbegi National Park", url: "https://www.georgia.travel/destinations/kazbegi" },
];

const GeorgiaCommunity = () => {
  return (
    <section className="bg-[#0a1628] py-16 md:py-20 px-[5%]">
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          <p className="font-body uppercase tracking-wider text-[0.7rem] text-white/60 mb-3">
            The Region
          </p>
          <h3 className="font-display font-normal text-3xl text-white mb-2">
            Gudauri & Kazbegi
          </h3>
          <p className="font-body font-light text-lg text-white/70 mb-8">
            Where Europe meets Asia, on the roof of the Caucasus.
          </p>

          <div className="max-w-2xl mb-10">
            <p className="font-body font-light text-white/80 leading-relaxed mb-4">
              Gudauri is Georgia's premier mountain resort, perched on the Greater Caucasus range along the ancient Georgian Military Highway — the route that once connected empires. In winter, it's one of Europe's best-kept skiing secrets. In summer, it transforms into a base for hiking, paragliding, and exploring one of the world's most dramatic landscapes.
            </p>
            <p className="font-body font-light text-white/80 leading-relaxed">
              Just 90 minutes north lies Kazbegi (Stepantsminda), a village at the foot of Mount Kazbek (5,047m) and the legendary Gergeti Trinity Church. The drive there — through the Jvari Pass at 2,379m — is unforgettable. Tbilisi, Georgia's vibrant capital, is 2 hours south.
            </p>
          </div>
        </FadeIn>

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

export default GeorgiaCommunity;
