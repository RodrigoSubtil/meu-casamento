import "./contentLocations.css";

export default function ContentLocations() {

   const weather = [
      { date: "2026-09-10", temp: "24°", label: "Light Clouds" },
      { date: "2026-09-11", temp: "25°", label: "Sunny" },
      { date: "2026-09-12", temp: "26°", label: "Wedding Day · Clear Sky", highlight: true },
      { date: "2026-09-13", temp: "24°", label: "Soft Breeze" },
      { date: "2026-09-14", temp: "23°", label: "Partly Cloudy" }
   ];

   return (
      <>

         {/* =========================
            LOCATIONS
         ========================= */}

         <section className="locations">

            <div className="locations-container">

               <div className="luxury-title">
                  <span>Locations</span>

                  <p className="locations-subtitle">
                     Para que vocês cheguem com tranquilidade e não percam nenhum momento da nossa celebração, reunimos aqui os endereços do nosso grande dia. Logo abaixo, vocês encontrarão os mapas com a localização exata da Igreja e do local da festa. Basta clicar para abrir o GPS no celular e traçar a melhor rota. Esperamos vocês lá!
                  </p>
               </div>

               {/* CEREMONY */}
               <div className="location-block">

                  <div className="location-info">

                     <h2 className="location-title">
                        Ceremony
                     </h2>

                     <p className="location-text">
                        Igreja Santa Rita de Cássia<br />
                        17:00 — 15 · 08 · 2026
                     </p>

                     <p className="location-desc">
                        A sacred moment surrounded by family and faith.
                     </p>

                  </div>

                  <div className="location-map">
                     <iframe
                        src="https://www.google.com/maps?q=Paróquia+Santa+Rita+de+Cássia+Presidente+Prudente&output=embed"
                        loading="lazy"
                     />
                  </div>

               </div>

               {/* PARTY */}
               <div className="location-block reverse">

                  <div className="location-info">

                     <h2 className="location-title">
                        Party
                     </h2>

                     <p className="location-text">
                        Funny Eventos<br />
                        19:00 — 15 · 08 · 2026
                     </p>

                     <p className="location-desc">
                        A night of celebration, music and joy.
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
            WEATHER
         ========================= */}

         <section className="weather">

            <div className="weather-container">

               <div className="luxury-title">
                  <span>Weather</span>
               </div>

               <h2 className="weather-title">
                  Wedding Week Forecast
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
                              {day.label.includes("Sunny") && "☀"}
                              {day.label.includes("Cloud") && "☁"}
                              {day.label.includes("Breeze") && "〰"}

                              {!day.label.includes("Sunny") &&
                                 !day.label.includes("Cloud") &&
                                 !day.label.includes("Breeze") &&
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