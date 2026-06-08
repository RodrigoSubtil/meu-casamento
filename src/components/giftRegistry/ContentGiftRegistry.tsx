import "./contentGiftRegistry.css";

import { useEffect, useMemo, useState } from "react";
import GiftModal from "./GiftModal";
import { getGifts, reserveGift } from "../../services/giftService";

type GiftCategory = "all" | "product" | "experience";

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
   const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
   const [loading, setLoading] = useState(false);

   const userName = "Convidado";
   const BRL_TO_EUR = 6.3;

   // =========================
   // LOAD GIFTS
   // =========================
   useEffect(() => {

      async function load() {

         try {

            const data = await getGifts();
            setGifts(data || []);

         } catch (err) {

            console.error("Erro ao buscar gifts:", err);

         }

      }

      load();

   }, []);

   // =========================
   // ABRIR MODAL
   // =========================
   function handleReserve(gift: Gift) {

      if (gift.is_reserved) return;

      setSelectedGift(gift);

   }

   // =========================
   // CONFIRMAR RESERVA
   // =========================
   async function confirmReservation(
      method: "pix" | "mbway"
   ) {

      if (!selectedGift) return;

      try {

         setLoading(true);

         await reserveGift({
            giftId: selectedGift.id,
            title: selectedGift.title,
            priceBRL: selectedGift.price,
            priceEUR: selectedGift.price / BRL_TO_EUR,
            method,
            userName
         });

         // Atualiza a UI imediatamente
         setGifts(prev =>
            prev.map(g =>
               g.id === selectedGift.id
                  ? {
                     ...g,
                     is_reserved: true,
                     reserved_by: userName
                  }
                  : g
            )
         );

      } catch (err) {

         console.error(err);
         alert("Erro ao reservar presente.");

      } finally {

         setLoading(false);

      }

   }

   // =========================
   // FILTRO
   // =========================
   const filteredGifts = useMemo(() => {

      if (filter === "all") {
         return gifts;
      }

      return gifts.filter(
         gift => gift.category === filter
      );

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
                     Ter vocês dividindo esse momento com a gente já é, sem dúvida, o nosso maior e melhor presente!
                     Aos que carinhosamente desejam nos presentear, deixamos aqui algumas opções virtuais. Como moramos em Portugal, infelizmente não teremos como levar itens físicos na viagem de regresso. Por isso, organizamos uma lista onde todos os presentes serão revertidos em dinheiro, nos ajudando no início da nossa vida a dois.
                  </p>

               </div>

               {/* FILTERS */}
               <div className="gift-filters">

                  {["all", "product", "experience"].map((cat) => (

                     <button
                        key={cat}
                        className={filter === cat ? "active" : ""}
                        onClick={() =>
                           setFilter(cat as GiftCategory)
                        }
                     >
                        {cat === "all"
                           ? "Todos"
                           : cat === "product"
                              ? "Produto"
                              : cat === "experience"
                                 ? "Experiência"
                                 : ""}
                     </button>

                  ))}

               </div>

               {/* GRID */}
               <div className="gift-grid">

                  {filteredGifts.map((gift) => {

                     const eur =
                        gift.price / BRL_TO_EUR;

                     return (

                        <div
                           className="gift-card"
                           key={gift.id}
                        >

                           <div className="gift-image">

                              <img
                                 src={gift.image}
                                 alt={gift.title}
                              />

                           </div>

                           <div className="gift-content">

                              <h3>{gift.title}</h3>

                              <span className="gift-price">

                                 R$ {gift.price
                                    .toFixed(2)
                                    .replace(".", ",")}

                                 {" • "}

                                 € {eur
                                    .toFixed(2)
                                    .replace(".", ",")}

                              </span>

                              <button
                                 className="form-button"
                                 disabled={
                                    gift.is_reserved ||
                                    loading
                                 }
                                 onClick={() =>
                                    handleReserve(gift)
                                 }
                              >
                                 {gift.is_reserved
                                    ? "Reservado"
                                    : "Presentear"}
                              </button>

                           </div>

                        </div>

                     );

                  })}

               </div>

               {filteredGifts.length === 0 && (

                  <div className="gift-empty">

                     <h3>
                        Nenhum presente encontrado
                     </h3>

                  </div>

               )}

            </div>

         </div>

         {selectedGift && (

            <GiftModal
               gift={selectedGift}
               onClose={() =>
                  setSelectedGift(null)
               }
               onConfirm={confirmReservation}
            />

         )}

      </section>
   );
}