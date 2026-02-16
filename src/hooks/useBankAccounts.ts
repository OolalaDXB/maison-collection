import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BankAccount {
  id: string;
  bank_name: string;
  iban: string;
  bic: string;
  currency: string;
  is_default: boolean;
}

export function useDefaultBankAccount(currency: string) {
  return useQuery({
    queryKey: ["bank-accounts", "default", currency],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts" as any)
        .select("*")
        .eq("currency", currency)
        .eq("is_default", true)
        .maybeSingle();

      if (error) return null;
      return data as unknown as BankAccount;
    },
    enabled: !!currency,
  });
}
