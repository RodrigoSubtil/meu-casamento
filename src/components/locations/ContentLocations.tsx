import "./contentLocations.css";

export default function ContentLocations() {

   const weather = [
      { date: "2026-09-10", temp: "24°", label: "Nuvens leves" },
      { date: "2026-09-11", temp: "25°", label: "Ensolarado" },
      { date: "2026-09-12", temp: "26°", label: "Dia do casamento · Céu limpo", highlight: true },
      { date: "2026-09-13", temp: "24°", label: "Brisa suave" },
      { date: "2026-09-14", temp: "23°", label: "Parcialmente nublado" }
   ];

   return (
      <>

         {/* =========================
            LOCALIZAÇÕES
         ========================= */}

         <section className="locations">

            <div className="locations-container">

               <div className="luxury-title">
                  <span>Localizações</span>

                  <p className="locations-subtitle">
                     Para que vocês cheguem com tranquilidade e não percam nenhum momento da nossa celebração,
                     reunimos aqui os endereços do nosso grande dia. Logo abaixo, vocês encontrarão os mapas
                     com a localização exata da igreja e do local da festa. Basta clicar para abrir o GPS no
                     celular e traçar a melhor rota. Esperamos vocês lá!
                  </p>
               </div>

               {/* CERIMÓNIA */}
               <div className="location-block">

                  <div className="location-info">

                     <h2 className="location-title">
                        Cerimónia
                     </h2>

                     <p className="location-text">
                        Igreja Santa Rita de Cássia<br />
                        17:00 — 15 · 08 · 2026
                     </p>

                     <p className="location-desc">
                        Um momento sagrado rodeado de família e fé.
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

                     <h2 className="location-title">
                        Festa
                     </h2>

                     <p className="location-text">
                        Funny Eventos<br />
                        19:00 — 15 · 08 · 2026
                     </p>

                     <p className="location-desc">
                        Uma noite de celebração, música e alegria.
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

         </section>

         {/* =========================
            PREVISÃO DO TEMPO
         ========================= */}

         <section className="weather">

            <div className="weather-container">

               <div className="luxury-title">
                  <span>Previsão do Tempo</span>
               </div>

               <h2 className="weather-title">
                  Previsão da semana do casamento
               </h2>

               <div className="weather-table-wrapper">

                  <div className="weather-table">

                     {weather.map((day) => (

                        <div
                           key={day.date}
                           className={`weather-row ${day.highlight ? "highlight" : ""}`}
                        >

                           <span className="date">
                              {new Date(day.date).toLocaleDateString("pt-PT", {
                                 day: "2-digit",
                                 month: "2-digit",
                              })}
                           </span>

                           <span className="icon">
                              {day.label.includes("Ensolarado") && "☀"}
                              {day.label.includes("nublado") && "☁"}
                              {day.label.includes("Brisa") && "〰"}

                              {!day.label.includes("Ensolarado") &&
                                 !day.label.includes("nublado") &&
                                 !day.label.includes("Brisa") &&
                                 "◌"}
                           </span>

                           <span className="temp">
                              {day.temp}
                           </span>

                        </div>

                     ))}

                  </div>

               </div>

            </div>

         </section>

      </>
   );
}