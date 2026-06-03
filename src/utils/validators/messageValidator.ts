import type { MessageData, MessageErrors } from "../../types/message";

export function validateMessage(data: MessageData): MessageErrors {
   const errors: MessageErrors = {};

   if (!data.name.trim()) {
      errors.name = "Name is required";
   }

   if (!data.message.trim()) {
      errors.message = "Message is required";
   } else if (data.message.trim().length < 5) {
      errors.message = "Message is too short";
   }

   return errors;
}