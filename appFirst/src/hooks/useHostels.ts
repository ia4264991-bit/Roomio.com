import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseEnvError } from "@/lib/supabase";
import { type Hostel } from "@/data/hostels";

export const useHostels = () => {
  return useQuery({
    queryKey: ["hostels"],
    queryFn: async (): Promise<Hostel[]> => {
      if (supabaseEnvError) throw new Error(supabaseEnvError);
      const { data, error } = await supabase.from("hostels").select("*");
      if (error) {
        throw new Error([error.message, error.details, error.hint, error.code].filter(Boolean).join(" | "));
      }
      return (data || []) as Hostel[];
    },
  });
};

export const useHostel = (id: string | undefined) => {
  return useQuery({
    queryKey: ["hostel", id],
    queryFn: async (): Promise<Hostel | null> => {
      if (!id) return null;
      if (supabaseEnvError) throw new Error(supabaseEnvError);
      const { data, error } = await supabase.from("hostels").select("*").eq("id", id).maybeSingle();
      if (error) {
        throw new Error([error.message, error.details, error.hint, error.code].filter(Boolean).join(" | "));
      }
      return (data as Hostel | null) ?? null;
    },
    enabled: !!id,
  });
};
