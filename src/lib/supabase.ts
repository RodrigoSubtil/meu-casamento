import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rqczehhgvgeqywfxnjid.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxY3plaGhndmdlcXl3ZnhuamlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTc0MzMsImV4cCI6MjA5NDY5MzQzM30._uNn-3FD_aDEsuetjieul-ddxAAUNKuHZgcsGpExQfA";

if (!supabaseUrl) {
  throw new Error("Supabase URL não definida");
}

if (!supabaseKey) {
  throw new Error("Supabase Key não definida");
}

export const supabase = createClient(supabaseUrl, supabaseKey);