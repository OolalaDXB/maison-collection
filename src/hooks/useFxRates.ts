import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FxRate {
  target_currency: string;
  rate: number;
  fetched_at: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  AED: "AED",
  GEL: "₾",
};

export const useFxRates = () => {
  const query = useQuery({
    queryKey: ["fx-rates"],
    queryFn: async (): Promise<FxRate[]> => {
      const { data, error } = await supabase
        .from("fx_rates")
        .select("target_currency, rate, fetched_at")
        .eq("base_currency", "EUR");
      if (error) throw error;
      return (data as FxRate[]) || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const convertFromEur = (amountEur: number, currency: string): number => {
    if (currency === "EUR") return amountEur;
    const rate = query.data?.find((r) => r.target_currency === currency);
    if (!rate) return 0;
    return Math.round(amountEur * rate.rate);
  };

  const convertToEur = (amount: number, currency: string): number => {
    if (currency === "EUR") return amount;
    const rate = query.data?.find((r) => r.target_currency === currency);
    if (!rate || rate.rate === 0) return 0;
    return Math.round((amount / rate.rate) * 100) / 100;
  };

  const getRate = (currency: string): number | null => {
    if (currency === "EUR") return 1;
    const rate = query.data?.find((r) => r.target_currency === currency);
    return rate ? rate.rate : null;
  };

  const formatPrice = (amount: number, currency: string): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    if (currency === "EUR") return `${amount}€`;
    if (currency === "GBP") return `£${amount}`;
    if (currency === "USD") return `$${amount}`;
    return `${amount} ${symbol}`;
  };

  const getMultiCurrencyDisplay = (
    amountEur: number,
    currencies: string[]
  ): string => {
    if (!query.data || query.data.length === 0) return "";
    return currencies
      .filter((c) => c !== "EUR")
      .map((c) => {
        const converted = convertFromEur(amountEur, c);
        if (!converted) return null;
        return `~${formatPrice(converted, c)}`;
      })
      .filter(Boolean)
      .join(" · ");
  };

  return {
    rates: query.data || [],
    isLoading: query.isLoading,
    convertFromEur,
    convertToEur,
    getRate,
    formatPrice,
    getMultiCurrencyDisplay,
    lastUpdated: query.data?.[0]?.fetched_at || null,
  };
};
