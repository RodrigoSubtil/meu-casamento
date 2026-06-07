import { supabase } from "../lib/supabase";

/* =========================
   TYPES
========================= */
export type ReserveGiftParams = {
   giftId: number;
   title: string;
   priceBRL: number;
   priceEUR: number;
   method: "pix" | "mbway";
   userName?: string;
};

/* =========================
   GET GIFTS
========================= */
export async function getGifts() {
   const { data, error } = await supabase
      .from("gifts")
      .select("*")
      .order("id", { ascending: true });

   if (error) throw error;

   return data || [];
}

/* =========================
   RESERVA SEGURA (ANTI DUPLICADO)
========================= */
export async function reserveGift(data: ReserveGiftParams) {

   // 🔥 1. verifica se já existe reserva
   const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("gift_id", data.giftId)
      .maybeSingle();

   if (existing) {
      throw new Error("Gift já reservado");
   }

   // 🔥 2. cria purchase
   const { error: insertError } = await supabase
      .from("purchases")
      .insert([
         {
            gift_id: data.giftId,
            title: data.title,
            price_brl: data.priceBRL,
            price_eur: data.priceEUR,
            method: data.method,
            status: "reserved",
            created_at: new Date().toISOString()
         }
      ]);

   if (insertError) throw insertError;

   // 🔥 3. marca gift como reservado
   const { error: updateError } = await supabase
      .from("gifts")
      .update({
         is_reserved: true,
         reserved_by: data.userName || "Convidado"
      })
      .eq("id", data.giftId);

   if (updateError) throw updateError;
}

/* =========================
   RESERVAS
========================= */
export async function getReservedGifts() {
   const { data, error } = await supabase
      .from("purchases")
      .select("gift_id, status");

   if (error) return [];

   return data || [];
}