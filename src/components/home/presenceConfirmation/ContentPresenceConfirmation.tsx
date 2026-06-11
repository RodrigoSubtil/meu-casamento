import "./contentPresenceConfirmation.css";

export default function ContentPresenceConfirmation() {
   return (
      <section className="presence-confirmation">
         <div className="presence-confirmation-container">
            <div className="section-header">
               <div className="luxury-title">
                  <span>Confirmação de presença</span>
               </div>

               <p className="section-subtitle">
                  Para nos ajudar na organização e garantir que tudo aconteça da melhor forma possível, contamos com a confirmação da sua presença até o dia 15 de julho. Mal podemos esperar para comemorar esse dia ao lado de vocês!
               </p>
            </div>

            <a className="presence-confirmation-button" href="/rsvp">
               Confirmar presença
            </a>
         </div>
      </section>
   );
}
