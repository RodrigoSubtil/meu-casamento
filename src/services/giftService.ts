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
COMPRA (SEM BLOQUEIO / SEM DUPLICADO)
========================= */
export async function reserveGift(data: ReserveGiftParams) {

   // cria a compra SEM verificar se já existe
   const { error } = await supabase
      .from("purchases")
      .insert([
         {
            gift_id: data.giftId,
            title: data.title,
            price_brl: data.priceBRL,
            price_eur: data.priceEUR,
            method: data.method,
            status: "paid",
            created_at: new Date().toISOString()
         }
      ]);

   if (error) {
      throw error;
   }
}

/* =========================
RESERVAS (LISTAGEM OPCIONAL)
========================= */
export async function getReservedGifts() {

   const { data, error } = await supabase
      .from("purchases")
      .select("gift_id, status");

   if (error) {
      return [];
   }

   return data || [];
}   