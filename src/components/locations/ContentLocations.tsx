import "./contentLocations.css";
import Weather from "./weather/Weather";

export default function ContentLocations() {
   return (
      <>
         {/* =========================
            LOCALIZAÇÕES
         ========================= */}
         <section className="locations">

            <div className="container">

               <div className="locations-container">

                  <div className="section-header">
                     <div className="luxury-title-main">
                        <span>Localizações</span>
                     </div>

                     <p className="section-subtitle">
                        Para que vocês cheguem com tranquilidade e não percam nenhum momento da nossa celebração, reunimos aqui os endereços do nosso grande dia. Logo abaixo, vocês encontrarão os mapas com a localização exata da Igreja e do local da festa. Basta clicar para abrir o GPS no celular e traçar a melhor rota. Esperamos vocês lá!
                     </p>
                  </div>

                  {/* CERIMÓNIA */}
                  <div className="location-block">

                     <div className="location-info">
                        <h2 className="location-title">Cerimônia</h2>
                        <p className="location-text">
                           Igreja Santa Rita de Cássia
                           <br />
                           17:00 — 15 · 08 · 2026
                        </p>
                     </div>

                     <div className="location-map">
                        <iframe
                           src="https://www.google.com/maps?q=Paróquia+Santa+Rita+de+Cássia+Presidente+Prudente&output=embed"
                           loading="lazy"
                        />
                     </div>

                  </div>

                  {/* FESTA */}
                  <div className="location-block reverse">

                     <div className="location-info">
                        <h2 className="location-title">Festa</h2>
                        <p className="location-text">
                           Funny Eventos
                           <br />
                           Após a cerimônia — 15 · 08 · 2026
                        </p>
                     </div>

                     <div className="location-map">
                        <iframe
                           src="https://www.google.com/maps?q=Funny+Eventos+Presidente+Prudente&output=embed"
                           loading="lazy"
                        />
                     </div>

                  </div>

               </div>

            </div>

         </section>

         {/* =========================
            WEATHER
         ========================= */}
         <Weather />
      </>
   );
}
