// Presidente Prudente, SP; fuso America/Sao_Paulo. Consulta em 19/10/2026.
// Histórico por reanálise da Open-Meteo, preservado localmente (sem consulta em runtime).
// https://archive-api.open-meteo.com/v1/archive?latitude=-22.12&longitude=-51.39&start_date=2026-08-13&end_date=2026-08-17&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo
export const HISTORICAL_WEATHER = [
   { date: "2026-08-13", min: 20.3, max: 33.2, weatherCode: 3 },
   { date: "2026-08-14", min: 20.8, max: 33.3, weatherCode: 51 },
   { date: "2026-08-15", min: 21.5, max: 33.7, weatherCode: 2 },
   { date: "2026-08-16", min: 21.3, max: 34.8, weatherCode: 3 },
   { date: "2026-08-17", min: 22.4, max: 35.2, weatherCode: 1 }
];
