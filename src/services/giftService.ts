import { supabase } from "../lib/supabase";

export async function getGifts() {
   const { data, error } = await supabase
      .from("gifts")
      .select("*")
      .order("id", { ascending: true });

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}

export async function reserveGift(id: number, name: string) {
   const { error } = await supabase
      .from("gifts")
      .update({
         is_reserved: true,
         reserved_by: name
      })
      .eq("id", id)
      .eq("is_reserved", false);

   if (error) {
      console.error(error);
      return false;
   }

   return true;
}