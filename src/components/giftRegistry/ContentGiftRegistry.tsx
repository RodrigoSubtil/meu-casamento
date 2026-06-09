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

   // 💛 presente livre (sem alert)
   const [customGift, setCustomGift] = useState<Gift | null>(null);

   const [loading, setLoading] = useState(false);

   const userName = "Convidado";
   const BRL_TO_EUR = 6.3;

   useEffect(() => {
      async function load() {
         try {
            const data = await getGifts();
            setGifts(data || []);
         } catch (err) {
            console.error(err);
         }
      }

      load();
   }, []);

   function handleReserve(gift: Gift) {
      if (gift.is_reserved) return;
      setSelectedGift(gift);
   }

   // 💛 abre modal de contribuição livre
   function handleCustomGift() {
      setCustomGift({
         id: 999999,
         title: "Contribuição livre",
         price: 0,
         image: "https://images.unsplash.com/photo-1520975928316-7e2b5a8c3b9b",
         category: "experience",
         is_reserved: false
      });
   }

   async function confirmReservation(method: "pix" | "mbway", value?: number) {

      const gift = selectedGift || customGift;
      if (!gift) return;

      const finalValue = value ?? gift.price;

      try {

         setLoading(true);

         await reserveGift({
            giftId: gift.id,
            title: gift.title,
            priceBRL: finalValue,
            priceEUR: finalValue / BRL_TO_EUR,
            method,
            userName
         });

         setGifts(prev =>
            prev.map(g =>
               g.id === gift.id
                  ? { ...g, is_reserved: true, reserved_by: userName }
                  : g
            )
         );

      } catch (err) {
         console.error(err);
         alert("Erro ao processar contribuição.");
      } finally {
         setLoading(false);
         setSelectedGift(null);
         setCustomGift(null);
      }
   }

   const filteredGifts = useMemo(() => {

      if (filter === "all") return gifts;

      return gifts.filter(g => g.category === filter);

   }, [gifts, filter]);

   return (
      <section className="gift-section">

         <div className="container">

            <div className="gift-container">

               {/* HEADER */}
               <div className="section-header">

                  <div className="luxury-title-main">
                     <span>Presentes</span>
                  </div>

                  <p className="section-subtitle">
                     Ter vocês dividindo esse momento com a gente já é, sem dúvida, o nosso maior e melhor presente!
                     Aos que carinhosamente desejam nos presentear, deixamos aqui algumas opções virtuais. Como moramos em Portugal, infelizmente não teremos como levar itens físicos na viagem de regresso. Por isso, organizamos uma lista onde todos os presentes serão revertidos em dinheiro, nos ajudando no início da nossa vida a dois.
                  </p>

               </div>

               {/* 💛 BLOCO LIVRE */}
               <div className="gift-custom">

                  <h3>Contribuição livre</h3>

                  <p>
                     Escolhe o valor que quiseres contribuir.
                     Simples, rápido e com significado.
                  </p>

                  <button
                     className="form-button"
                     onClick={handleCustomGift}
                  >
                     Contribuir
                  </button>

               </div>

               {/* FILTERS */}
               <div className="gift-filters">

                  {["all", "product", "experience"].map(cat => (

                     <button
                        key={cat}
                        className={filter === cat ? "active" : ""}
                        onClick={() => setFilter(cat as GiftCategory)}
                     >
                        {cat === "all"
                           ? "Todos"
                           : cat === "product"
                              ? "Produto"
                              : "Experiência"}
                     </button>

                  ))}

               </div>

               {/* GRID */}
               <div className="gift-grid">

                  {filteredGifts.map(gift => {

                     const eur = gift.price / BRL_TO_EUR;

                     return (
                        <div className="gift-card" key={gift.id}>

                           <div className="gift-image">
                              <img src={gift.image} alt={gift.title} />
                           </div>

                           <div className="gift-content">

                              <h3>{gift.title}</h3>

                              <span className="gift-price">
                                 R$ {gift.price.toFixed(2).replace(".", ",")}
                                 {" • "}
                                 € {eur.toFixed(2).replace(".", ",")}
                              </span>

                              <button
                                 className="form-button"
                                 disabled={gift.is_reserved || loading}
                                 onClick={() => handleReserve(gift)}
                              >
                                 {gift.is_reserved ? "Reservado" : "Presentear"}
                              </button>

                           </div>

                        </div>
                     );

                  })}

               </div>

               {/* MODAL NORMAL + LIVRE */}
               {(selectedGift || customGift) && (

                  <GiftModal
                     gift={selectedGift || customGift!}
                     isCustom={!selectedGift}
                     onClose={() => {
                        setSelectedGift(null);
                        setCustomGift(null);
                     }}
                     onConfirm={confirmReservation}
                  />

               )}

            </div>

         </div>

      </section>
   );
}