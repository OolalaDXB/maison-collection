import { useTranslation } from "react-i18next";

const langs = ["en", "fr", "ru"] as const;

interface LanguageSwitcherProps {
  transparent?: boolean;
}

const LanguageSwitcher = ({ transparent = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || "en";

  return (
    <div className="flex items-center gap-0">
      {langs.map((lang, i) => (
        <span key={lang} className="flex items-center">
          {i > 0 && (
            <span
              className={`mx-1.5 text-[0.6rem] select-none ${
                transparent ? "text-white/30" : "text-muted-foreground/40"
              }`}
            >
              |
            </span>
          )}
          <button
            onClick={() => i18n.changeLanguage(lang)}
            className={`font-body text-[0.7rem] uppercase tracking-wider transition-colors ${
              current === lang
                ? transparent
                  ? "text-white font-medium"
                  : "text-foreground font-medium"
                : transparent
                  ? "text-white/60 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
