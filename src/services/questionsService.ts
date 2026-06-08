import { supabase } from "../lib/supabase";

export async function getQuestions() {
   const { data, error } = await supabase
      .from("questions")
      .select(`
         id,
         question,
         options (
            id,
            text
         )
      `);

   if (error) {
      console.error("getQuestions error:", error);
      return [];
   }

   return data;
}