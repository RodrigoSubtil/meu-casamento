import "./dashboard.css";
import { useEffect, useState } from "react";

import {
   getRsvp,
   getMessages,
   getVotes,
   getGifts,
   createGift
} from "../../services/dashboardService";

type Section = "dashboard" | "gifts" | "guests" | "messages" | "votes";

export default function Dashboard() {

   const [section, setSection] = useState<Section>("dashboard");

   const [rsvp, setRsvp] = useState<any[]>([]);
   const [messages, setMessages] = useState<any[]>([]);
   const [votes, setVotes] = useState<any[]>([]);
   const [gifts, setGifts] = useState<any[]>([]);

   // FORM GIFTS
   const [title, setTitle] = useState("");
   const [price, setPrice] = useState("");
   const [image, setImage] = useState("");
   const [category, setCategory] = useState("product");
   const [loading, setLoading] = useState(false);

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
   // CREATE GIFT
   // =========================
   async function handleCreateGift(e: React.FormEvent) {
      e.preventDefault();

      if (!title || !price || !image) return;

      try {
         setLoading(true);

         await createGift({
            title,
            price: Number(price),
            image,
            category
         });

         setTitle("");
         setPrice("");
         setImage("");
         setCategory("product");

         await load();

      } catch (err) {
         console.error("Erro ao criar presente:", err);
      } finally {
         setLoading(false);
      }
   }

   return (
      <section className="dashboard">

         {/* SIDEBAR */}
         <aside className="sidebar">

            <div className="logo">
               Wedding Admin
            </div>

            <nav className="menu">

               <button onClick={() => setSection("dashboard")}>
                  Dashboard
               </button>

               <button onClick={() => setSection("guests")}>
                  Convidados
               </button>

               <button onClick={() => setSection("messages")}>
                  Mensagens
               </button>

               <button onClick={() => setSection("votes")}>
                  Votações
               </button>

               <button onClick={() => setSection("gifts")}>
                  Presentes
               </button>

            </nav>

         </aside>

         {/* MAIN */}
         <main className="main">

            {/* TOPBAR */}
            <header className="topbar">
               <h1>Dashboard</h1>
               <div className="user">Admin</div>
            </header>

            <div className="content">

               {/* =========================
                  DASHBOARD HOME
               ========================= */}
               {section === "dashboard" && (
                  <div className="card-grid">
                     <div className="card">Convidados: {rsvp.length}</div>
                     <div className="card">Mensagens: {messages.length}</div>
                     <div className="card">Votos: {votes.length}</div>
                     <div className="card">Presentes: {gifts.length}</div>
                  </div>
               )}

               {/* =========================
                  PRESENTES (FORM + LISTA)
               ========================= */}
               {section === "gifts" && (
                  <>
                     <div className="panel">

                        <h2>Criar novo presente</h2>

                        <form onSubmit={handleCreateGift} className="gift-form">

                           <input
                              placeholder="Título do presente"
                              value={title}
                              onChange={e => setTitle(e.target.value)}
                           />

                           <input
                              placeholder="Preço (BRL)"
                              type="number"
                              value={price}
                              onChange={e => setPrice(e.target.value)}
                           />

                           <input
                              placeholder="URL da imagem"
                              value={image}
                              onChange={e => setImage(e.target.value)}
                           />

                           <select
                              value={category}
                              onChange={e => setCategory(e.target.value)}
                           >
                              <option value="product">Produto</option>
                              <option value="experience">Experiência</option>
                           </select>

                           <button className="form-button" disabled={loading}>
                              {loading ? "A criar..." : "Criar presente"}
                           </button>

                        </form>

                     </div>

                     <div className="panel">

                        <h2>Presentes criados</h2>

                        <div className="table">
                           {gifts.map(g => (
                              <div className="row" key={g.id}>
                                 <div className="cell">{g.title}</div>
                                 <div className="cell">R$ {g.price}</div>
                                 <div className="cell">{g.category}</div>
                              </div>
                           ))}
                        </div>

                     </div>
                  </>
               )}

               {/* =========================
                  OUTRAS SEÇÕES (placeholder)
               ========================= */}
               {section === "guests" && (
                  <div className="panel">
                     <h2>Convidados</h2>
                     <p>Em breve...</p>
                  </div>
               )}

               {section === "messages" && (
                  <div className="panel">
                     <h2>Mensagens</h2>
                     <p>Em breve...</p>
                  </div>
               )}

               {section === "votes" && (
                  <div className="panel">
                     <h2>Votações</h2>
                     <p>Em breve...</p>
                  </div>
               )}

            </div>

         </main>

      </section>
   );
}