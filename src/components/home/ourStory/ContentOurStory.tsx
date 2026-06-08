import "./contentOurStory.css";

export default function ContentOurStory() {
   return (
      <section className="our-story">

         <div className="our-story-container">

            {/* HEADER */}
            <div className="section-header">

               <div className="luxury-title">
                  <span>Nossa História</span>
               </div>

            </div>

            {/* TIMELINE */}
            <div className="story-timeline">

               <div className="story-item">
                  <span className="story-date">2019</span>
                  <h3>O primeiro encontro</h3>
                  <p>Um momento simples que mudou tudo.</p>
               </div>

               <div className="story-item">
                  <span className="story-date">2020</span>
                  <h3>Começamos a nos conhecer</h3>
                  <p>Conversas, risadas e conexão imediata.</p>
               </div>

               <div className="story-item">
                  <span className="story-date">2021</span>
                  <h3>O início oficial</h3>
                  <p>Decidimos viver essa história juntos.</p>
               </div>

               <div className="story-item">
                  <span className="story-date">2023</span>
                  <h3>Construindo sonhos</h3>
                  <p>Viagens, planos e momentos inesquecíveis.</p>
               </div>

               <div className="story-item highlight">
                  <span className="story-date">2026</span>
                  <h3>O casamento</h3>
                  <p>O começo da nossa vida a dois.</p>
               </div>

            </div>

         </div>

      </section>
   );
}