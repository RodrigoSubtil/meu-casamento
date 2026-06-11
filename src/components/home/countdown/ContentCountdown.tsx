import { useEffect, useState } from "react";
import "./contentCountdown.css";

export default function ContentCountdown() {
   const targetDate = new Date("2026-08-15T17:00:00-03:00").getTime();

   const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
   });

   useEffect(() => {
      const interval = setInterval(() => {
         const now = new Date().getTime();
         const diff = targetDate - now;

         if (diff <= 0) {
            clearInterval(interval);
            return;
         }

         setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
         });
      }, 1000);

      return () => clearInterval(interval);
   }, []);

   return (
      <section className="countdown">

         <div className="countdown-container">

            {/* HEADER LUXO (PADRÃO DO SITE) */}
            <div className="luxury-title countdown-title">
               <span>Contagem regressiva</span>
            </div>

            {/* CONTADOR (NÃO ALTERADO) */}
            <div className="countdown-grid">

               <div className="countdown-box">
                  <span>{timeLeft.days}</span>
                  <p>Dias</p>
               </div>

               <div className="countdown-box">
                  <span>{timeLeft.hours}</span>
                  <p>Horas</p>
               </div>

               <div className="countdown-box">
                  <span>{timeLeft.minutes}</span>
                  <p>Min</p>
               </div>

               <div className="countdown-box">
                  <span>{timeLeft.seconds}</span>
                  <p>Seg</p>
               </div>

            </div>

         </div>

      </section>
   );
}
