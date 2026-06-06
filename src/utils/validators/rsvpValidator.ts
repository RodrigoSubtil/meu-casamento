import type { RsvpData, RsvpErrors } from "../../types/rsvp";

export function validateRsvp(data: RsvpData): RsvpErrors {
   const errors: RsvpErrors = {};

   if (!data.name.trim()) errors.name = "O nome é obrigatório";
   if (!data.attending) errors.attending = "Por favor, seleciona a presença";
   if (!data.category) errors.category = "Por favor, seleciona uma categoria";

   if (!data.age.trim()) {
      errors.age = "A idade é obrigatória";
   } else if (isNaN(Number(data.age))) {
      errors.age = "A idade tem de ser um número";
   } else if (Number(data.age) <= 0) {
      errors.age = "A idade tem de ser válida";
   }

   return errors;
}