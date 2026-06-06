import type { MessageData, MessageErrors } from "../../types/message";

export function validateMessage(data: MessageData): MessageErrors {
   const errors: MessageErrors = {};

   if (!data.name.trim()) {
      errors.name = "O nome é obrigatório";
   }

   if (!data.message.trim()) {
      errors.message = "A mensagem é obrigatória";
   } else if (data.message.trim().length < 5) {
      errors.message = "A mensagem é muito curta";
   }

   return errors;
}