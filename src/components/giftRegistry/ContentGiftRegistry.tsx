import "./contentGiftRegistry.css";

import { useEffect, useMemo, useState } from "react";
import GiftModal from "./GiftModal";

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
   const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

   const userName = "Convidado";

   useEffect(() => {

      const titles = [
         "Jantar romântico",
         "Malas de viagem premium",
         "Conjunto de panelas",
         "Noite em hotel de luxo",
         "Decoração elegante",
         "Experiência spa relaxante",
         "Café da manhã especial",
         "Jantar gourmet",
         "Viagem surpresa",
         "Tábua de cozinha artesanal",
         "Set de copos cristal",
         "Passeio romântico",
         "Colcha premium",
         "Acessórios de cozinha",
         "Férias relaxantes",
         "Smart speaker",
         "Kit vinho premium",
         "Experiência aventura",
         "Mesa de jantar",
         "Luzes decorativas"
      ];

      const categories: GiftCategory[] = ["kitchen", "travel", "home"];

      const mock: Gift[] = Array.from({ length: 20 }).map((_, i) => {
         const category = categories[i % categories.length];

         return {
            id: i + 1,
            title: titles[i],
            price: Math.floor(Math.random() * 250) + 25,
            image: `https://picsum.photos/seed/gift-${i}/600/400`,
            category,
            is_reserved: false
         };
      });

      setGifts(mock);

   }, []);

   async function handleReserve(gift: Gift) {
      setSelectedGift(gift);
   }

   function confirmReservation() {
      if (!selectedGift) return;

      setLoading(true);

      setGifts(prev =>
         prev.map(g =>
            g.id === selectedGift.id
               ? { ...g, is_reserved: true, reserved_by: userName }
               : g
         )
      );

      setLoading(false);
      setSelectedGift(null);
   }

   const filteredGifts = useMemo(() => {
      if (filter === "all") return gifts;
      return gifts.filter(g => g.category === filter);
   }, [gifts, filter]);

   return (
      <section className="gift-section">

         <div className="container">

            <div className="gift-container">

               <div className="section-header">
                  <div className="luxury-title-main">
                     <span>Lista de Presentes</span>
                  </div>

                  <p className="section-subtitle">
                     Queremos viver este dia com muito carinho e partilha…
                  </p>
               </div>

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
                              onClick={() => handleReserve(gift)}
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

         </div>

         {selectedGift && (
            <GiftModal
               gift={selectedGift}
               onClose={() => setSelectedGift(null)}
               onConfirm={confirmReservation}
            />
         )}

      </section>
   );
}