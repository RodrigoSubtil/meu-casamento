import { supabase } from "../lib/supabase";

export type GalleryAlbum = "ceremony" | "party";

export type GalleryPhoto = {
   id: number;
   image_url: string;
   album: GalleryAlbum;
   created_at: string;
};

export async function uploadGalleryPhoto(file: File, album: GalleryAlbum) {

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

   return (data || []) as GalleryPhoto[];
}

function getGalleryStoragePath(imageUrl: string) {
   const publicPathMarker = "/storage/v1/object/public/gallery/";

   try {
      const pathname = new URL(imageUrl).pathname;
      const markerIndex = pathname.indexOf(publicPathMarker);

      if (markerIndex === -1) return null;

      return decodeURIComponent(
         pathname.slice(markerIndex + publicPathMarker.length)
      );
   } catch {
      return null;
   }
}

export async function deleteGalleryPhoto(photo: GalleryPhoto) {
   const { error: databaseError } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", photo.id);

   if (databaseError) throw databaseError;

   const storagePath = getGalleryStoragePath(photo.image_url);

   if (!storagePath) return;

   const { error: storageError } = await supabase
      .storage
      .from("gallery")
      .remove([storagePath]);

   if (storageError) {
      console.error("Não foi possível remover o arquivo do Storage:", storageError);
   }
}
