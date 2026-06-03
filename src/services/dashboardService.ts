import { supabase } from "../lib/supabase";

// RSVP
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

// MESSAGES
export async function getMessages() {
   const { data, error } = await supabase
      .from("messages")
      .select("*");

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}

// VOTES
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

// GIFTS
export async function getGifts() {
   const { data, error } = await supabase
      .from("gifts")
      .select("*");

   if (error) {
      console.error(error);
      return [];
   }

   return data ?? [];
}