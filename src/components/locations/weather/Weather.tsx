import "./weather.css";

import { useEffect, useMemo, useState } from "react";
import {
   FaCloud,
   FaCloudRain,
   FaCloudSun,
   FaQuestion,
   FaSun
} from "react-icons/fa";
import { PORTFOLIO_MODE } from "../../../config/portfolio";
import { HISTORICAL_WEATHER } from "./historicalWeather";

const WEDDING_DATE = "2026-08-15";
const DAYS_BEFORE_AND_AFTER = 2;
const LOCATION = {
   latitude: -22.12,
   longitude: -51.39,
   timezone: "America/Sao_Paulo"
};

type ForecastDay = {
   date: string;
   condition: string;
   temp: string;
   weatherCode?: number;
   highlight: boolean;
   live: boolean;
};

type OpenMeteoDailyResponse = {
   daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
   };
};

function addDays(date: Date, days: number) {
   const nextDate = new Date(date);
   nextDate.setDate(nextDate.getDate() + days);
   return nextDate;
}

function toDateInputValue(date: Date) {
   return date.toISOString().slice(0, 10);
}

function getConfiguredDates() {
   const weddingDate = new Date(`${WEDDING_DATE}T12:00:00`);

   return Array.from({ length: DAYS_BEFORE_AND_AFTER * 2 + 1 }, (_, index) => {
      const offset = index - DAYS_BEFORE_AND_AFTER;
      const date = addDays(weddingDate, offset);

      return {
         iso: toDateInputValue(date),
         highlight: offset === 0
      };
   });
}

function isForecastAvailable(dates: { iso: string }[]) {
   const today = new Date();
   today.setHours(0, 0, 0, 0);

   const forecastLimit = addDays(today, 16);
   const firstDate = new Date(`${dates[0].iso}T12:00:00`);
   const lastDate = new Date(`${dates[dates.length - 1].iso}T12:00:00`);

   return firstDate >= today && lastDate <= forecastLimit;
}

function formatDateLabel(date: string) {
   return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short"
   })
      .format(new Date(`${date}T12:00:00`))
      .replace(".", "");
}

function getWeatherCondition(code?: number) {
   if (code === undefined) return "Aguardando previsão";
   if (code === 0) return "Ensolarado";
   if ([1, 2].includes(code)) return "Parcialmente nublado";
   if ([3, 45, 48].includes(code)) return "Nublado";
   if ([51, 53, 55, 56, 57].includes(code)) return "Garoa";
   if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Chuva";
   if ([95, 96, 99].includes(code)) return "Trovoadas";

   return "Tempo instável";
}

function getWeatherIcon(code?: number) {
   if (code === undefined) return <FaQuestion />;
   if (code === 0) return <FaSun />;
   if ([1, 2].includes(code)) return <FaCloudSun />;
   if ([3, 45, 48].includes(code)) return <FaCloud />;
   if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
      return <FaCloudRain />;
   }

   return <FaCloudSun />;
}

function buildWaitingForecast(): ForecastDay[] {
   return getConfiguredDates().map(({ iso, highlight }) => ({
      date: iso,
      condition: "Aguardando previsão",
      temp: "--°C",
      highlight,
      live: false
   }));
}

function buildHistoricalForecast(): ForecastDay[] {
   return HISTORICAL_WEATHER.map((day) => ({
      date: day.date,
      condition: getWeatherCondition(day.weatherCode),
      temp: `${Math.round(day.min)}° / ${Math.round(day.max)}°C`,
      weatherCode: day.weatherCode,
      highlight: day.date === WEDDING_DATE,
      live: false
   }));
}

export default function Weather() {
   const configuredDates = useMemo(() => getConfiguredDates(), []);
   const [forecast, setForecast] = useState<ForecastDay[]>(() =>
      PORTFOLIO_MODE ? buildHistoricalForecast() : buildWaitingForecast()
   );
   const [status, setStatus] = useState<"historical" | "waiting" | "loading" | "live" | "error">(
      PORTFOLIO_MODE ? "historical" : isForecastAvailable(configuredDates) ? "loading" : "waiting"
   );

   useEffect(() => {
      if (PORTFOLIO_MODE) return;

      if (!isForecastAvailable(configuredDates)) return;

      const controller = new AbortController();

      async function loadForecast() {
         try {
            setStatus("loading");

            const startDate = configuredDates[0].iso;
            const endDate = configuredDates[configuredDates.length - 1].iso;
            const params = new URLSearchParams({
               latitude: String(LOCATION.latitude),
               longitude: String(LOCATION.longitude),
               start_date: startDate,
               end_date: endDate,
               timezone: LOCATION.timezone,
               daily: "weather_code,temperature_2m_max,temperature_2m_min"
            });

            const response = await fetch(
               `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
               { signal: controller.signal }
            );

            if (!response.ok) throw new Error("Erro ao buscar previsão");

            const data = (await response.json()) as OpenMeteoDailyResponse;
            const daily = data.daily;

            if (!daily?.time?.length) throw new Error("Previsão indisponível");

            const nextForecast = configuredDates.map(({ iso, highlight }) => {
               const weatherIndex = daily.time?.indexOf(iso) ?? -1;
               const maxTemp = daily.temperature_2m_max?.[weatherIndex];
               const minTemp = daily.temperature_2m_min?.[weatherIndex];
               const weatherCode = daily.weather_code?.[weatherIndex];

               return {
                  date: iso,
                  condition: getWeatherCondition(weatherCode),
                  temp:
                     Number.isFinite(maxTemp) && Number.isFinite(minTemp)
                        ? `${Math.round(minTemp as number)}° / ${Math.round(maxTemp as number)}°C`
                        : "--°C",
                  weatherCode,
                  highlight,
                  live: true
               };
            });

            setForecast(nextForecast);
            setStatus("live");
         } catch {
            if (controller.signal.aborted) return;

            setForecast(buildWaitingForecast());
            setStatus("error");
         }
      }

      loadForecast();

      return () => controller.abort();
   }, [configuredDates]);

   return (
      <section className="weather">
         <div className="container">
            <div className="weather-container">
               <div className="section-header">
                  <div className="luxury-title">
                     <span>{PORTFOLIO_MODE ? "Clima nos dias do casamento" : "Previsão do Tempo"}</span>
                  </div>

                  <p className="weather-note">
                     {status === "historical" && (
                        <>
                           Presidente Prudente · 13 a 17 de agosto de 2026.
                           {" "}Histórico do período, com mínimas e máximas diárias.
                           {" "}Fonte: <a href="https://open-meteo.com/en/docs/historical-weather-api"
                              target="_blank" rel="noreferrer">Open-Meteo</a>.
                        </>
                     )}
                     {status === "live" &&
                        "Previsão atualizada automaticamente pela Open-Meteo."}
                     {status === "loading" && "Buscando a previsão mais recente..."}
                     {status === "waiting" &&
                        "A previsão ao vivo aparece automaticamente quando a data entrar na janela de 16 dias."}
                     {status === "error" &&
                        "Não conseguimos carregar a previsão agora. Vamos tentar novamente quando a página for aberta."}
                  </p>
               </div>

               <div className="weather-timeline">
                  {forecast.map((day) => (
                     <div
                        key={day.date}
                        className={`weather-card ${day.highlight ? "highlight" : ""}`}
                     >
                        <span className="weather-date">{formatDateLabel(day.date)}</span>

                        <div className="weather-icon" aria-hidden="true">
                           {getWeatherIcon(day.weatherCode)}
                        </div>

                        <span className="weather-temp">{day.temp}</span>

                        <span className="weather-condition">{day.condition}</span>

                        <span className="weather-source">
                           {status === "historical" ? "histórico" : day.live ? "ao vivo" : "em breve"}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}
