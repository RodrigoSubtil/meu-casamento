import "./weather.css";

import {
   FaSun,
   FaCloud,
   FaCloudSun,
   FaCloudRain,
   FaGlassCheers
} from "react-icons/fa";

export default function Weather() {

   const forecast = [
      {
         date: "13 Ago",
         icon: <FaCloud />,
         condition: "Nublado",
         temp: "24°C"
      },
      {
         date: "14 Ago",
         icon: <FaCloudSun />,
         condition: "Parcialmente nublado",
         temp: "26°C"
      },
      {
         date: "15 Ago",
         icon: <FaGlassCheers />,
         condition: "Ensolarado",
         temp: "27°C",
         highlight: true
      },
      {
         date: "16 Ago",
         icon: <FaSun />,
         condition: "Ensolarado",
         temp: "26°C"
      },
      {
         date: "17 Ago",
         icon: <FaCloudRain />,
         condition: "Levemente nublado",
         temp: "24°C"
      }
   ];

   return (
      <section className="weather">

         <div className="container">

            <div className="weather-container">

               <div className="section-header">

                  <div className="luxury-title">
                     <span>Previsão do Tempo</span>
                  </div>

               </div>

               <div className="weather-timeline">

                  {forecast.map((day) => (

                     <div
                        key={day.date}
                        className={`weather-card ${day.highlight ? "highlight" : ""}`}
                     >

                        <span className="weather-date">
                           {day.date}
                        </span>

                        <div className="weather-icon">
                           {day.icon}
                        </div>

                        <span className="weather-temp">
                           {day.temp}
                        </span>

                        <span className="weather-condition">
                           {day.condition}
                        </span>

                     </div>

                  ))}

               </div>

            </div>

         </div>

      </section>
   );
}