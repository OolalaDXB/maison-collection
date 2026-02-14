import { Waves, TreePine, Landmark } from "lucide-react";
import FadeIn from "@/components/FadeIn";

const cards = [
  {
    icon: TreePine,
    title: "Deep Brittany",
    text: "Quistinic sits in the heart of the Morbihan, surrounded by bocage countryside, ancient forests, and the Blavet river valley. Absolute tranquility, 30 minutes from the coast.",
  },
  {
    icon: Waves,
    title: "The Morbihan Coast",
    text: "The Gulf of Morbihan, Quiberon peninsula, Belle-Île, Carnac's megaliths — all within an hour. Some of Brittany's most beautiful beaches are 30 minutes away.",
  },
  {
    icon: Landmark,
    title: "Heritage & Culture",
    text: "The medieval village of Poul Fétan (5 min), the historic city of Vannes, Lorient's maritime heritage, and the standing stones of Carnac — 5,000 years of history.",
  },
];

const links = [
  { label: "Morbihan Tourisme", url: "https://www.morbihan.com/" },
  { label: "Golfe du Morbihan", url: "https://www.golfedumorbihan.bzh/" },
  { label: "Poul Fétan", url: "https://www.poulfetan.com/" },
];

const AtlantiqueCommunity = () => {
  return (
    <section className="bg-[#0a1628] py-16 md:py-20 px-[5%]">
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          <p className="font-body uppercase tracking-wider text-[0.7rem] text-white/60 mb-3">
            The Region
          </p>
          <h3 className="font-display font-normal text-3xl text-white mb-2">
            Quistinic & the Morbihan
          </h3>
          <p className="font-body font-light text-lg text-white/70 mb-8">
            Deep Brittany — where the land meets the Atlantic.
          </p>

          <div className="max-w-2xl mb-10">
            <p className="font-body font-light text-white/80 leading-relaxed mb-4">
              Maison Atlantique sits outside the village of Quistinic, in the Morbihan department of Brittany. This is inland Brittany at its purest — rolling countryside, ancient stone walls, oak forests, and a stillness you won't find on the coast. The Blavet river valley runs nearby, offering kayaking, cycling, and long walks through unspoiled nature.
            </p>
            <p className="font-body font-light text-white/80 leading-relaxed">
              But the coast is never far. The Gulf of Morbihan — one of the most beautiful bays in the world — is 30 minutes south. The wild beaches of the Quiberon peninsula, the standing stones of Carnac (the largest megalithic site in Europe), and the islands of Belle-Île and Houat are all within easy reach.
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

export default AtlantiqueCommunity;
