import { supabase } from "../../lib/supabase";

export async function vote(questionId: number, optionId: number) {
   return supabase.from("votes").insert({
      question_id: questionId,
      option_id: optionId
   });
}

export async function getVotes() {
   const { data, error } = await supabase
      .from("votes")
      .select("question_id, option_id");

   if (error) throw error;

   return data;
}