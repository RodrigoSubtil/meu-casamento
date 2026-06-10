import { supabase } from "../lib/supabase";

/* =========================
   RSVP
========================= */
export async function getRsvp() {
   const { data, error } = await supabase
      .from("rsvp")
      .select("*");

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}

/* =========================
   MESSAGES
========================= */
export async function getMessages() {
   const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}

/* =========================
   VOTES
========================= */
export async function getVotes() {
   const { data, error } = await supabase
      .from("votes")
      .select(`
         id,
         question_id,
         option_id,
         questions:question_id ( id, question ),
         options:option_id ( id, text )
      `);

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}

/* =========================
   GIFTS (SEM CAMPOS FALSOS)
========================= */
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

/* =========================
   CRIAR PRESENTE (NOVO)
========================= */
export async function createGift(gift: {
   title: string;
   price: number;
   image: string;
   category: string;
}) {
   const { data, error } = await supabase
      .from("gifts")
      .insert([
         {
            title: gift.title,
            price: gift.price,
            image: gift.image,
            category: gift.category
         }
      ])
      .select();

   if (error) {
      console.error("ERRO SUPABASE:", error);
      throw error;
   }

   return data;
}

/* =========================
   PURCHASES
========================= */
export async function getPurchases() {
   const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false });

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}
