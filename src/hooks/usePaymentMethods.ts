import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethodConfig {
  email?: string;
  publishable_key?: string;
  wallet_address?: string;
  network?: string;
  [key: string]: string | undefined;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  config: PaymentMethodConfig;
  display_order: number;
  currencies: string[];
}

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods" as any)
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        description: m.description,
        icon: m.icon,
        active: m.active ?? false,
        config: (m.config || {}) as PaymentMethodConfig,
        display_order: m.display_order ?? 0,
        currencies: m.currencies || ["EUR"],
      })) as PaymentMethod[];
    },
  });
}
