import "./contentOurStory.css";

export default function ContentOurStory() {
   return (
      <section className="our-story">

         <div className="our-story-container">

            {/* HEADER */}
            <div className="section-header">

               <div className="luxury-title-main">
                  <span>Nossa História</span>
               </div>

            </div>

            {/* TIMELINE */}
            <div className="story-timeline">

               <div className="story-item">
                  <span className="story-date">2021</span>
                  <h3>O primeiro encontro</h3>
                  <p>Um olhar, uma conversa e a sensação de que algo especial estava para começar.</p>
               </div>

               <div className="story-item">
                  <span className="story-date">2022</span>
                  <h3>O início oficial</h3>
                  <p>Entre saidas, risos e mensagens, nasceu o nosso namoro.</p>
               </div>

                <div className="story-item">
                  <span className="story-date">2023</span>
                  <h3>A distância</h3>
                  <p>O ano em que a distância começa ser uma realidade entre nós. A Duda embarca para o outro lado do oceâno, rumo a Portugal.</p>
               </div>

               <div className="story-item">
                  <span className="story-date">2024</span>
                  <h3>O rencontro</h3>
                  <p>Depois de um ano e meio namorando a distância, Rodrigo enfim se muda para Portugal.</p>
               </div>

               <div className="story-item">
                  <span className="story-date">2025</span>
                  <h3>Um passo à frente</h3>
                  <p>Decidimos dar mais um passo e construir um futuro juntos.</p>
               </div>

               <div className="story-item highlight">
                  <span className="story-date">2026</span>
                  <h3>O casamento</h3>
                  <p>O dia do nosso sim, para sempre!</p>
               </div>

            </div>

         </div>

      </section>
   );
}
