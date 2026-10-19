import type { MessageErrors } from "../../../types/message";
import { validateMessage } from "../../../utils/validators/messageValidator";

import { useState } from "react";
import { supabase } from "../../../lib/supabase.ts";
import ModalConfirmation from "../../modalConfirmation/ModalConfirmation";
import PortfolioNotice from "../../portfolioNotice/PortfolioNotice";
import { PORTFOLIO_MODE } from "../../../config/portfolio";

import "./contentMessage.css";

export default function ContentMessage() {
   const [name, setName] = useState<string>("");
   const [message, setMessage] = useState<string>("");

   const [loading, setLoading] = useState<boolean>(false);
   const [success, setSuccess] = useState<boolean>(false);
   const [errors, setErrors] = useState<MessageErrors>({});

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (PORTFOLIO_MODE) return;

      setSuccess(false);

      const formErrors = validateMessage({ name, message });

      if (Object.keys(formErrors).length > 0) {
         setErrors(formErrors);
         return;
      }

      setErrors({});
      setLoading(true);

      const { error } = await supabase
         .from("messages")
         .insert([{ name, message }]);

      setLoading(false);

      if (error) {
         console.error(error);
         return;
      }

      setSuccess(true);

      setName("");
      setMessage("");
   }

   return (
      <section className="message-section" id="mensagem">
         <div className="message-container">

            <div className="section-header">

               <div className="luxury-title">
                  <span>Mensagens</span>
               </div>

            </div>

            <form
               className="message-form"
               onSubmit={handleSubmit}
               aria-describedby={PORTFOLIO_MODE ? "messages-closed-notice" : undefined}
            >
               {PORTFOLIO_MODE && (
                  <PortfolioNotice id="messages-closed-notice">
                     Já não é possível enviar mensagens. Você pode escrever nos campos
                     para conhecer o formulário, mas o envio está encerrado.
                  </PortfolioNotice>
               )}

               <div className="form-group">
                  <label className="form-label">Seu nome</label>

                  <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Digite seu nome"
                     className={`form-input ${errors.name ? "form-error-input" : ""}`}
                  />

                  <span className={`form-error ${errors.name ? "show" : ""}`}>
                     {errors.name || ""}
                  </span>
               </div>

               <div className="form-group">
                  <label className="form-label">Sua mensagem</label>

                  <textarea
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     placeholder="Escreva sua mensagem aqui..."
                     className={`form-textarea ${errors.message ? "form-error-input" : ""}`}
                  />

                  <span className={`form-error ${errors.message ? "show" : ""}`}>
                     {errors.message || ""}
                  </span>
               </div>

               <button
                  className={`form-button${PORTFOLIO_MODE ? " portfolio-action" : ""}`}
                  type="submit"
                  disabled={PORTFOLIO_MODE || loading}
                  aria-describedby={PORTFOLIO_MODE ? "messages-closed-notice" : undefined}
               >
                  {loading ? "Enviando..." : "Enviar Mensagem"}
               </button>

            </form>

         </div>

         <ModalConfirmation
            open={success}
            eyebrow="Mensagem enviada"
            title="Recebemos o seu carinho"
            description="Obrigado por deixar uma mensagem para nós, ficamos muito felizes."
            onClose={() => setSuccess(false)}
         />
      </section>
   );
}
