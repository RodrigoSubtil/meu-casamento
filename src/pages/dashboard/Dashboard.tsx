import "./dashboard.css";
import { useEffect, useMemo, useState } from "react";

import {
   getRsvp,
   getMessages,
   getVotes,
   getGifts
} from "../../services/dashboardService";

export default function Dashboard() {

   const [rsvp, setRsvp] = useState<any[]>([]);
   const [messages, setMessages] = useState<any[]>([]);
   const [votes, setVotes] = useState<any[]>([]);
   const [gifts, setGifts] = useState<any[]>([]);
   const [filter, setFilter] = useState<"all" | "yes" | "no">("all");

   useEffect(() => {
      load();
   }, []);

   async function load() {
      const [r, m, v, g] = await Promise.all([
         getRsvp(),
         getMessages(),
         getVotes(),
         getGifts()
      ]);

      setRsvp(r);
      setMessages(m);
      setVotes(v);
      setGifts(g);
   }

   // =========================
   // KPIs RSVP
   // =========================

   const total = rsvp.length;

   const attending = rsvp.filter(r =>
      r.attending === "Yes, I will be there"
   ).length;

   const notAttending = total - attending;

   const kids = rsvp.filter(r => Number(r.age) < 12).length;

   const attendanceRate = total
      ? Math.round((attending / total) * 100)
      : 0;

   // =========================
   // FILTER RSVP
   // =========================

   const filteredRsvp = useMemo(() => {
      if (filter === "all") return rsvp;
      if (filter === "yes") return rsvp.filter(r => r.attending === "Yes, I will be there");
      return rsvp.filter(r => r.attending !== "Yes, I will be there");
   }, [rsvp, filter]);

   // =========================
   // VOTES ANALYSIS (🔥 NOVO)
   // =========================

   const voteStats = useMemo(() => {

      if (!votes.length) return [];

      const grouped: Record<string, any> = {};

      votes.forEach((v: any) => {

         const question = v.questions?.question || "Question";
         const option = v.options?.text || "Option";

         if (!grouped[question]) {
            grouped[question] = {
               total: 0,
               options: {}
            };
         }

         grouped[question].total += 1;

         if (!grouped[question].options[option]) {
            grouped[question].options[option] = 0;
         }

         grouped[question].options[option] += 1;
      });

      return Object.entries(grouped).map(([question, data]: any) => {

         const options = Object.entries(data.options).map(([option, count]: any) => {
            return {
               option,
               count,
               percent: Math.round((count / data.total) * 100)
            };
         });

         return {
            question,
            total: data.total,
            options
         };
      });

   }, [votes]);

   return (
      <section className="dashboard">

         <div className="dashboard-container">

            {/* HEADER */}
            <header className="dashboard-header">

               <div className="luxury-title">
                  <span>Admin Panel</span>
               </div>

               <h1>Wedding Control Center</h1>

               <p>
                  Overview completo em tempo real: convidados, votos, mensagens e presentes.
               </p>

            </header>

            {/* =========================
                KPI GRID
            ========================= */}

            <div className="kpi-grid">

               <div className="kpi-card">
                  <span>Total convidados</span>
                  <strong>{total}</strong>
               </div>

               <div className="kpi-card highlight">
                  <span>Confirmados</span>
                  <strong>{attending}</strong>
               </div>

               <div className="kpi-card danger">
                  <span>Não vão</span>
                  <strong>{notAttending}</strong>
               </div>

               <div className="kpi-card">
                  <span>Crianças</span>
                  <strong>{kids}</strong>
               </div>

               <div className="kpi-card">
                  <span>Taxa presença</span>
                  <strong>{attendanceRate}%</strong>
               </div>

               <div className="kpi-card">
                  <span>Mensagens</span>
                  <strong>{messages.length}</strong>
               </div>

            </div>

            {/* =========================
                RSVP PANEL
            ========================= */}

            <div className="panel">

               <div className="panel-header">
                  <h2>Lista de Convidados</h2>

                  <div className="panel-actions">
                     <button onClick={() => setFilter("all")}>Todos</button>
                     <button onClick={() => setFilter("yes")}>Vão</button>
                     <button onClick={() => setFilter("no")}>Não vão</button>
                  </div>

               </div>

               <div className="table">

                  {filteredRsvp.map((r) => (
                     <div className="row" key={r.id}>

                        <div className="cell name">{r.name}</div>

                        <div className="cell">
                           <span className={r.attending === "Yes, I will be there" ? "tag yes" : "tag no"}>
                              {r.attending}
                           </span>
                        </div>

                        <div className="cell">{r.category}</div>

                        <div className="cell">{r.age} anos</div>

                     </div>
                  ))}

               </div>

            </div>

            {/* =========================
                MESSAGES
            ========================= */}

            <div className="panel">

               <div className="panel-header">
                  <h2>Mensagens</h2>
               </div>

               <div className="table">

                  {messages.map((m) => (
                     <div className="row" key={m.id}>
                        <div className="cell name">{m.name}</div>
                        <div className="cell message">{m.message}</div>
                     </div>
                  ))}

               </div>

            </div>

            {/* =========================
                VOTES (🔥 NOVO COMPLETO)
            ========================= */}

            <div className="panel">

               <div className="panel-header">
                  <h2>Resultados das Votações</h2>
               </div>

               <div className="vote-container">

                  {voteStats.map((q, i) => (
                     <div className="vote-card" key={i}>

                        <h3>{q.question}</h3>

                        <div className="vote-options">

                           {q.options.map((opt: any, idx: number) => (
                              <div className="vote-option" key={idx}>

                                 <div className="vote-label">
                                    {opt.option}
                                 </div>

                                 <div className="vote-bar-wrapper">
                                    <div
                                       className="vote-bar"
                                       style={{ width: `${opt.percent}%` }}
                                    />
                                 </div>

                                 <div className="vote-percent">
                                    {opt.percent}%
                                 </div>

                              </div>
                           ))}

                        </div>

                        <small>Total votos: {q.total}</small>

                     </div>
                  ))}

               </div>

            </div>

            {/* =========================
                GIFTS
            ========================= */}

            <div className="panel">

               <div className="panel-header">
                  <h2>Presentes</h2>
               </div>

               <div className="table">

                  {gifts.map((g) => (
                     <div className="row" key={g.id}>
                        <div className="cell">{g.name}</div>
                        <div className="cell">{g.title}</div>
                     </div>
                  ))}

               </div>

            </div>

         </div>

      </section>
   );
}