import type { RsvpData, RsvpErrors } from "../../types/rsvp";

export function validateRsvp(data: RsvpData): RsvpErrors {
   const errors: RsvpErrors = {};

   if (!data.name.trim()) errors.name = "Name is required";
   if (!data.attending) errors.attending = "Please select attendance";
   if (!data.category) errors.category = "Please select a category";

   if (!data.age.trim()) {
      errors.age = "Age is required";
   } else if (isNaN(Number(data.age))) {
      errors.age = "Age must be a number";
   } else if (Number(data.age) <= 0) {
      errors.age = "Age must be valid";
   }

   return errors;
}