import { ExternalLink } from "lucide-react";

const links = [
  { label: "Anthropie Studio", url: "https://anthropie-studio.com/architecture-s/maison-du-helleguy/" },
  { label: "Archibien", url: "https://www.archibien.com/project/france/quistinic/le-helleguy/" },
  { label: "Houzz", url: "https://www.houzz.fr/professionnels/architecte/anthropie-architectures-pfvwfr-pf~599273598" },
];

const AtlantiqueArchitecture = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-4">
        Architecture
      </h3>
      <p className="font-body font-light text-sm text-[hsl(0,0%,27%)] leading-relaxed mb-2">
        <span className="font-medium">Anthropie Architecture</span> — Quistinic, Morbihan — 2020–2022
      </p>
      <p className="font-body font-light text-sm text-[hsl(0,0%,27%)] leading-relaxed mb-4">
        Renovation of a 19th-century penty in stone masonry with a
        contemporary extension in Douglas fir frame and black pigmented cladding.
        160m² · 12-month construction.
      </p>
      <p className="font-body font-light text-xs text-muted-foreground mb-5">
        Photography: my-linh tôn
      </p>
      <div className="flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            {link.label}
            <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default AtlantiqueArchitecture;
