import { supabase } from "../lib/supabase";

export async function uploadGalleryPhoto(file: File, album: string) {

   // 🔥 GARANTE NOME ÚNICO (MUITO IMPORTANTE)
   const fileExt = file.name.split(".").pop();
   const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

   const filePath = `${album}/${fileName}`;

   // UPLOAD STORAGE
   const { error: uploadError } = await supabase
      .storage
      .from("gallery")
      .upload(filePath, file);

   if (uploadError) throw uploadError;

   // PEGAR URL PÚBLICA
   const { data } = supabase
      .storage
      .from("gallery")
      .getPublicUrl(filePath);

   const imageUrl = data.publicUrl;

   // INSERIR NO BANCO
   const { error: dbError } = await supabase
      .from("gallery_photos")
      .insert([
         {
            image_url: imageUrl,
            album
         }
      ]);

   if (dbError) throw dbError;

   return imageUrl;
}

export async function getGalleryPhotos() {

   const { data, error } =
      await supabase
         .from("gallery_photos")
         .select("*")
         .order("created_at", {
            ascending: false
         });

   if (error) {
      throw error;
   }

   return data;
}