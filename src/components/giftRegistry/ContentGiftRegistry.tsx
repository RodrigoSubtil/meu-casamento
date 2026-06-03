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

   const userName = "Guest"; // depois podes ligar ao RSVP

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
               <span>Gift Registry</span>
            </div>

            <h2 className="gift-title">
               Choose a Memory to Give
            </h2>

            <p className="gift-subtitle">
               Ter vocês dividindo esse momento com a gente já é, sem dúvida, o nosso maior e melhor presente!
               Aos que carinhosamente desejam nos presentear, deixamos aqui algumas opções virtuais. Como moramos em Portugal, infelizmente não teremos como levar itens físicos na viagem de regresso. Por isso, organizamos uma lista onde todos os presentes serão revertidos em dinheiro, nos ajudando no início da nossa vida a dois.
            </p>

            {/* FILTERS */}
            <div className="gift-filters">

               {["all", "kitchen", "travel", "home"].map((cat) => (
                  <button
                     key={cat}
                     className={filter === cat ? "active" : ""}
                     onClick={() => setFilter(cat as GiftCategory)}
                  >
                     {cat.toUpperCase()}
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
                              ? `Reserved by ${gift.reserved_by}`
                              : "Choose Gift"}
                        </button>

                     </div>

                  </div>
               ))}

            </div>

            {filteredGifts.length === 0 && (
               <div className="gift-empty">
                  <h3>No gifts found</h3>
               </div>
            )}

         </div>

      </section>
   );
}