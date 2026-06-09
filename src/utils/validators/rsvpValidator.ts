import type { RsvpData, RsvpErrors } from "../../types/rsvp";

export function validateRsvp(data: RsvpData): RsvpErrors {

   const errors: RsvpErrors = {};

   if (!data.name.trim()) {
      errors.name = "O nome é obrigatório";
   }

   if (!data.attending) {
      errors.attending = "Por favor, seleciona a presença";
   }

   if (!data.category) {
      errors.category = "Por favor, seleciona uma categoria";
   }

   return errors;
}