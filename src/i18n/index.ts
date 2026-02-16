import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ru from "./locales/ru.json";

// Suppress i18next Locize promotional log
const originalLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("Locize")) return;
  originalLog(...args);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ru: { translation: ru },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "ru"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
  });

export default i18n;
