import "./contentGiftRegistry.css";

import { useEffect, useMemo, useState } from "react";
import { getGifts, reserveGift } from "../../services/giftService";

type GiftCategory = "all" | "kitchen" | "travel" | "home";

type Gift = {
   id: number;
   title: string;
   price: number;
   image: string;
   category: GiftCategory;
   is_reserved: boolean;
   reserved_by?: string;
};

export default function ContentGiftRegistry() {

   const [gifts, setGifts] = useState<Gift[]>([]);
   const [filter, setFilter] = useState<GiftCategory>("all");
   const [loading, setLoading] = useState(false);

   const userName = "Convidado"; // depois podes ligar ao RSVP

   useEffect(() => {
      load();
   }, []);

   async function load() {
      const data = await getGifts();
      setGifts(data);
   }

   async function handleReserve(id: number) {
      setLoading(true);

      const success = await reserveGift(id, userName);

      if (success) {
         await load();
      }

      setLoading(false);
   }

   const filteredGifts = useMemo(() => {
      if (filter === "all") return gifts;
      return gifts.filter(g => g.category === filter);
   }, [gifts, filter]);

   return (
      <section className="gift-section">

         <div className="gift-container">

            <div className="luxury-title">
               <span>Lista de Presentes</span>
            </div>

            <h2 className="gift-title">
               Escolhe uma memória para oferecer
            </h2>

            <p className="gift-subtitle">
               Ter vocês connosco neste momento já é, sem dúvida, o nosso maior presente!
               Para quem quiser oferecer algo especial, deixámos aqui algumas opções.
               Como vivemos em Portugal, não conseguiremos levar presentes físicos na viagem de regresso.
               Por isso, organizámos uma lista onde todos os presentes serão convertidos em ajuda monetária para o início da nossa vida a dois.
            </p>

            {/* FILTERS */}
            <div className="gift-filters">

               {["all", "kitchen", "travel", "home"].map((cat) => (
                  <button
                     key={cat}
                     className={filter === cat ? "active" : ""}
                     onClick={() => setFilter(cat as GiftCategory)}
                  >
                     {cat === "all"
                        ? "Todos"
                        : cat === "kitchen"
                        ? "Cozinha"
                        : cat === "travel"
                        ? "Viagem"
                        : "Casa"}
                  </button>
               ))}

            </div>

            {/* GRID */}
            <div className="gift-grid">

               {filteredGifts.map((gift) => (
                  <div className="gift-card" key={gift.id}>

                     <div className="gift-image">
                        <img src={gift.image} alt={gift.title} />
                     </div>

                     <div className="gift-content">

                        <h3>{gift.title}</h3>

                        <span className="gift-price">
                           €{gift.price}
                        </span>

                        <button
                           className="form-button"
                           disabled={gift.is_reserved || loading}
                           onClick={() => handleReserve(gift.id)}
                        >
                           {gift.is_reserved
                              ? `Reservado por ${gift.reserved_by}`
                              : "Escolher presente"}
                        </button>

                     </div>

                  </div>
               ))}

            </div>

            {filteredGifts.length === 0 && (
               <div className="gift-empty">
                  <h3>Nenhum presente encontrado</h3>
               </div>
            )}

         </div>

      </section>
   );
}