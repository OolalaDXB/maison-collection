import { useMemo } from "react";

interface AvailabilityDay {
  date: string;
  price_override: number | null;
  available: boolean | null;
}

interface SeasonalPrice {
  start_date: string;
  end_date: string;
  price_per_night: number;
}

interface PriceCalcParams {
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  defaultPrice: number;
  weekendPrice: number | null;
  cleaningFee: number;
  touristTaxPerPerson: number;
  availability: AvailabilityDay[];
  seasonalPricing: SeasonalPrice[];
  promoPercent?: number | null;
  promoAmount?: number | null;
}

export interface PriceBreakdown {
  nights: number;
  nightlyPrices: { date: string; price: number }[];
  avgNightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  touristTax: number;
  promoDiscount: number;
  total: number;
}

export const usePriceCalculation = (params: PriceCalcParams): PriceBreakdown | null => {
  return useMemo(() => {
    if (!params.checkIn || !params.checkOut) return null;
    const start = new Date(params.checkIn);
    const end = new Date(params.checkOut);
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (nights < 1) return null;

    const nightlyPrices: { date: string; price: number }[] = [];
    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dow = d.getDay(); // 0=Sun, 5=Fri, 6=Sat

      // 1. Check availability price_override
      const avail = params.availability.find((a) => a.date === dateStr);
      if (avail?.price_override) {
        nightlyPrices.push({ date: dateStr, price: avail.price_override });
        continue;
      }

      // 2. Check seasonal pricing
      const season = params.seasonalPricing.find((s) => dateStr >= s.start_date && dateStr <= s.end_date);
      if (season) {
        nightlyPrices.push({ date: dateStr, price: season.price_per_night });
        continue;
      }

      // 3. Weekend price
      if (params.weekendPrice && (dow === 0 || dow === 5 || dow === 6)) {
        nightlyPrices.push({ date: dateStr, price: params.weekendPrice });
        continue;
      }

      // 4. Default
      nightlyPrices.push({ date: dateStr, price: params.defaultPrice });
    }

    const subtotal = nightlyPrices.reduce((s, n) => s + n.price, 0);
    const cleaningFee = params.cleaningFee;
    const touristTax = params.touristTaxPerPerson * params.guestsCount * nights;

    let promoDiscount = 0;
    if (params.promoPercent) promoDiscount = Math.round(subtotal * params.promoPercent / 100);
    if (params.promoAmount) promoDiscount = params.promoAmount;

    const total = subtotal + cleaningFee + touristTax - promoDiscount;

    return {
      nights,
      nightlyPrices,
      avgNightlyRate: Math.round(subtotal / nights),
      subtotal,
      cleaningFee,
      touristTax,
      promoDiscount,
      total: Math.max(0, total),
    };
  }, [params.checkIn, params.checkOut, params.guestsCount, params.defaultPrice, params.weekendPrice, params.cleaningFee, params.touristTaxPerPerson, params.availability, params.seasonalPricing, params.promoPercent, params.promoAmount]);
};
