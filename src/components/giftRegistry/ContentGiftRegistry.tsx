import "./contentGiftRegistry.css";

import { useEffect, useMemo, useState } from "react";
import { getGifts, reserveGift } from "../../services/giftService";

type GiftCategory = "all" | "product" | "experience";

type Gift = {
   id: number;
   title: string;
   price: number;
   image?: string;
   category: GiftCategory;
   is_reserved: boolean;
   reserved_by?: string;
};

const FALLBACK_BRL_TO_EUR_RATE = 1 / 6.3;

export default function ContentGiftRegistry() {
   const [gifts, setGifts] = useState<Gift[]>([]);
   const [filter, setFilter] = useState<GiftCategory>("all");
   const [brlToEurRate, setBrlToEurRate] = useState(FALLBACK_BRL_TO_EUR_RATE);
   const [exchangeDate, setExchangeDate] = useState<string | null>(null);
   const [exchangeFallback, setExchangeFallback] = useState(false);

   const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
   const [modalOpen, setModalOpen] = useState(false);

   const [step, setStep] = useState(1);
   const [method, setMethod] = useState<"pix" | "mbway" | "">("");
   const [customAmount, setCustomAmount] = useState<number>(0);

   const [loading, setLoading] = useState(false);
   const [copied, setCopied] = useState<"pix" | "mbway" | null>(null);

   const userName = "Convidado";

   useEffect(() => {
      getGifts()
         .then((data) => setGifts(data || []))
         .catch(console.error);
   }, []);

   useEffect(() => {
      const controller = new AbortController();

      async function loadExchangeRate() {
         try {
            const response = await fetch(
               "https://api.frankfurter.dev/v2/rates?base=BRL&quotes=EUR",
               { signal: controller.signal }
            );

            if (!response.ok) throw new Error("Erro ao buscar cotacao");

            const data = await response.json();
            const rate = Number(data?.rates?.EUR);

            if (!Number.isFinite(rate) || rate <= 0) {
               throw new Error("Cotacao invalida");
            }

            setBrlToEurRate(rate);
            setExchangeDate(data?.date || null);
            setExchangeFallback(false);
         } catch (error) {
            if (controller.signal.aborted) return;

            setBrlToEurRate(FALLBACK_BRL_TO_EUR_RATE);
            setExchangeFallback(true);
         }
      }

      loadExchangeRate();

      return () => controller.abort();
   }, []);

   useEffect(() => {
      if (!modalOpen) return;

      const scrollY = window.scrollY;
      const previousOverflow = document.body.style.overflow;
      const previousPosition = document.body.style.position;
      const previousTop = document.body.style.top;
      const previousWidth = document.body.style.width;
      const previousHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
         document.documentElement.style.overflow = previousHtmlOverflow;
         document.body.style.overflow = previousOverflow;
         document.body.style.position = previousPosition;
         document.body.style.top = previousTop;
         document.body.style.width = previousWidth;
         window.scrollTo(0, scrollY);
      };
   }, [modalOpen]);

   function openModal(gift: Gift) {
      if (gift.is_reserved) return;

      setSelectedGift(gift);
      setModalOpen(true);
      setStep(1);
      setMethod("");
      setCustomAmount(0);
      setCopied(null);
   }

   function closeModal() {
      setModalOpen(false);
      setSelectedGift(null);
      setStep(1);
      setMethod("");
      setCustomAmount(0);
      setLoading(false);
      setCopied(null);
   }

   function copy(text: string, type: "pix" | "mbway") {
      navigator.clipboard.writeText(text);
      setCopied(type);

      setTimeout(() => setCopied(null), 1800);
   }

   function getSelectedAmount() {
      if (!selectedGift) return 0;
      return isCustom ? customAmount : selectedGift.price;
   }

   function convertBRLToEUR(value: number) {
      return value * brlToEurRate;
   }

   function convertEURToBRL(value: number) {
      return value / brlToEurRate;
   }

   function getSelectedPaymentAmount() {
      const amount = getSelectedAmount();

      if (isCustom) return amount;
      if (method === "mbway") return convertBRLToEUR(amount);
      return amount;
   }

   function formatAmount(value: number, currency: "BRL" | "EUR" = method === "mbway" ? "EUR" : "BRL") {
      return new Intl.NumberFormat(currency === "EUR" ? "pt-PT" : "pt-BR", {
         style: "currency",
         currency
      }).format(value);
   }

   async function confirmReservation() {
      if (!selectedGift || !method) return;

      const price = selectedGift.id === 999999 ? customAmount : selectedGift.price;
      const priceBRL = isCustom && method === "mbway" ? convertEURToBRL(price) : price;
      const priceEUR = isCustom && method === "mbway" ? price : convertBRLToEUR(price);

      try {
         setLoading(true);

         await reserveGift({
            giftId: selectedGift.id,
            title: selectedGift.title,
            priceBRL,
            priceEUR,
            method,
            userName
         });

         setGifts((prev) =>
            prev.map((g) =>
               g.id === selectedGift.id
                  ? { ...g, is_reserved: true, reserved_by: userName }
                  : g
            )
         );

         setStep(3);
      } catch (e) {
         alert("Erro ao reservar presente.");
      } finally {
         setLoading(false);
      }
   }

   const filteredGifts = useMemo(() => {
      if (filter === "all") return gifts;
      return gifts.filter((g) => g.category === filter);
   }, [gifts, filter]);

   const isCustom = selectedGift?.id === 999999;

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

               <div className="gift-hero">
                  <div className="gift-hero-content">
                     <h3>Contribuição livre</h3>
                     <p>Aqui você pode nos presentear com o valor que desejar.</p>

                     <button
                        className="form-button"
                        onClick={() =>
                           openModal({
                              id: 999999,
                              title: "Contribuição livre",
                              price: 0,
                              category: "experience",
                              is_reserved: false
                           })
                        }
                     >
                        Contribuir
                     </button>
                  </div>
               </div>

               <div className="gift-filters">
                  {["all", "product", "experience"].map((cat) => (
                     <button
                        key={cat}
                        className={filter === cat ? "active" : ""}
                        onClick={() => setFilter(cat as GiftCategory)}
                     >
                        {cat === "all"
                           ? "Todos"
                           : cat === "product"
                              ? "Produtos"
                              : "Experiências"}
                     </button>
                  ))}
               </div>

               <div className="gift-grid">
                  {filteredGifts.map((gift) => (
                     <div className="gift-card" key={gift.id}>
                        <div className="gift-image">
                           <img src={gift.image} alt={gift.title} />
                        </div>

                        <div className="gift-content">
                           <h3>{gift.title}</h3>

                           <span className="gift-price">
                              {formatAmount(gift.price, "BRL")}
                              <small>{formatAmount(convertBRLToEUR(gift.price), "EUR")}</small>
                           </span>

                           <button
                              className="form-button"
                              disabled={gift.is_reserved}
                              onClick={() => openModal(gift)}
                           >
                              {gift.is_reserved ? "Reservado" : "Presentear"}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>

               {modalOpen && selectedGift && (
                  <div className="gift-overlay" onClick={closeModal}>
                     <div className="gift-modal" onClick={(e) => e.stopPropagation()}>

                        <div className="gift-header">
                           <div>
                              <span className="gift-modal-kicker">Presente escolhido</span>
                              <h2>{selectedGift.title}</h2>
                           </div>

                           <button
                              className="gift-close-btn"
                              type="button"
                              aria-label="Fechar modal"
                              onClick={closeModal}
                           >
                              &times;
                           </button>
                        </div>

                        <div className="gift-progress" aria-label={`Passo ${step} de 3`}>
                           {[1, 2, 3].map((item) => (
                              <span
                                 key={item}
                                 className={item <= step ? "active" : ""}
                              />
                           ))}
                        </div>

                        {step === 1 && (
                           <div className="gift-step">
                              {!isCustom && (
                                 <div className="gift-modal-summary">
                                    <span>Valor do presente</span>
                                    <strong>
                                       {formatAmount(selectedGift.price, "BRL")}
                                       <small>{formatAmount(convertBRLToEUR(selectedGift.price), "EUR")}</small>
                                    </strong>
                                 </div>
                              )}

                              {!isCustom && (
                                 <p className="gift-exchange-note">
                                    {exchangeFallback
                                       ? "Valor em euro estimado com a ultima cotacao salva."
                                       : `Valor em euro com cotacao atual${exchangeDate ? ` de ${exchangeDate}` : ""}.`}
                                 </p>
                              )}

                              {isCustom && (
                                 <label className="gift-amount-field">
                                    <span>Quanto gostarias de contribuir?</span>
                                    <input
                                       className="form-input"
                                       type="number"
                                       min={1}
                                       placeholder="Ex.: 100"
                                       value={customAmount || ""}
                                       onChange={(e) =>
                                          setCustomAmount(Number(e.target.value))
                                       }
                                    />
                                 </label>
                              )}

                              <div className="gift-step-copy">
                                 <h3>Como prefere presentear?</h3>
                                 <p>Escolhe a forma de pagamento e depois confirma a reserva do presente.</p>
                              </div>

                              <div className="gift-methods">
                                 <button
                                    className={method === "pix" ? "active" : ""}
                                    type="button"
                                    onClick={() => setMethod("pix")}
                                 >
                                    <strong>PIX</strong>
                                    <span>Brasil</span>
                                 </button>

                                 <button
                                    className={method === "mbway" ? "active" : ""}
                                    type="button"
                                    onClick={() => setMethod("mbway")}
                                 >
                                    <strong>MB WAY</strong>
                                    <span>Portugal</span>
                                 </button>
                              </div>

                              <button
                                 className="gift-btn"
                                 type="button"
                                 disabled={!method || (isCustom && customAmount <= 0)}
                                 onClick={() => setStep(2)}
                              >
                                 Continuar
                              </button>
                           </div>
                        )}

                        {step === 2 && (
                           <div className="gift-step">
                              <div className="gift-step-copy">
                                 <h3>Dados para pagamento</h3>
                                 <p>Copia os dados abaixo e, quando enviares, confirma para marcarmos o presente como reservado.</p>
                              </div>

                              {method === "pix" && (
                                 <div className="gift-payment-card">
                                    <span className="gift-payment-label">Chave PIX</span>
                                    <div className="gift-account-details">
                                       <span>Rodrigo Freitas Subtil</span>
                                       <span>Banco Nubank</span>
                                    </div>
                                    <div className="gift-info-row">
                                       <span>137.153.359-80</span>

                                       <button
                                          className="copy-btn"
                                          type="button"
                                          onClick={() => copy("13715335980", "pix")}
                                       >
                                          {copied === "pix" ? "Copiado" : "Copiar"}
                                       </button>
                                    </div>
                                 </div>
                              )}

                              {method === "mbway" && (
                                 <div className="gift-payment-card">
                                    <span className="gift-payment-label">Número MB WAY</span>
                                    <div className="gift-account-details">
                                       <span>Rodrigo Freitas Subtil</span>
                                       <span>Banco Millenium</span>
                                    </div>
                                    <div className="gift-info-row">
                                       <span>+351 935 664 162</span>

                                       <button
                                          className="copy-btn"
                                          type="button"
                                          onClick={() => copy("+351935664162", "mbway")}
                                       >
                                          {copied === "mbway" ? "Copiado" : "Copiar"}
                                       </button>
                                    </div>
                                 </div>
                              )}

                              <div className="gift-total">
                                 <span>Total</span>
                                 <strong>{formatAmount(getSelectedPaymentAmount())}</strong>
                              </div>

                              <button
                                 className="gift-btn"
                                 type="button"
                                 disabled={loading}
                                 onClick={confirmReservation}
                              >
                                 {loading ? "A confirmar..." : "Confirmar presente"}
                              </button>
                           </div>
                        )}

                        {step === 3 && (
                           <div className="gift-step center">
                              <div className="success-icon">&#10003;</div>
                              <h3>Presente reservado</h3>
                              <p className="gift-success-text">Obrigado pelo carinho. A tua confirmação ficou guardada para os noivos.</p>

                              <button className="gift-btn" type="button" onClick={closeModal}>
                                 Fechar
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               )}

            </div>
         </div>
      </section>
   );
}
