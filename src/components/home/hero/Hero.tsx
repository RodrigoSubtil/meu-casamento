import "./hero.css";

export default function Hero() {
   return (
      <section className="hero">

         <div className="hero-container">


            <h2 className="hero-title">
               Maria Eduarda & Rodrigo
            </h2>

            <p className="hero-subtitle">
               Sejam muito bem-vindos!
               Reunimos aqui todos os detalhes do nosso casamento para que vocês já entrem no clima com a gente. A contagem regressiva começou e a alegria de viver isso de perto está cada dia maior. Saber que vamos cruzar o oceano para celebrar o nosso amor, rodeados pelas pessoas que mais importam para nós, é o que faz o coração bater ainda mais forte.
            </p>

            <div className="hero-actions" aria-label="Ações importantes">
               <a className="hero-action" href="/rsvp">
                  Confirmar presença
               </a>

               <a className="hero-action" href="/#mensagem">
                  Mandar mensagem
               </a>

               <a className="hero-action" href="/gift-registry">
                  Presentear-nos
               </a>
            </div>

         </div>

      </section>
   );
}
