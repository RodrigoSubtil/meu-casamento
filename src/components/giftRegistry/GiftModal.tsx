import "./giftModal.css";
import { useState, useEffect, useRef } from "react";

type Gift = {
   id: number;
   title: string;
   price: number;
   image: string;
};

type Props = {
   gift: Gift;
   isCustom?: boolean;
   onClose: () => void;
   onConfirm: (method: "pix" | "mbway", value: number) => Promise<void>;
};

type Step = "choose" | "pay" | "success";

const BRL_TO_EUR = 6.3;

export default function GiftModal({
   gift,
   isCustom = false,
   onClose,
   onConfirm
}: Props) {

   const [step, setStep] = useState<Step>("choose");
   const [method, setMethod] = useState<"pix" | "mbway" | null>(null);
   const [copied, setCopied] = useState(false);
   const [loading, setLoading] = useState(false);

   const [customValue, setCustomValue] = useState<string>("");

   const lock = useRef(false);

   const pix = "13715335980";
   const mbway = "935664162";

   // 💛 valor final SEM conversão
   const value = isCustom ? Number(customValue) : gift.price;

   const validValue =
      Number.isFinite(value) && value > 0 ? value : 0;

   useEffect(() => {
      setStep("choose");
      setMethod(null);
      setCopied(false);
      setLoading(false);
      lock.current = false;
      setCustomValue("");
   }, [gift.id]);

   function handleCopy() {
      const v = method === "pix" ? pix : mbway;
      navigator.clipboard.writeText(v);

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
   }

   function handleContinue() {
      if (!method) return;

      if (isCustom && validValue <= 0) {
         alert("Por favor, insere um valor válido.");
         return;
      }

      setStep("pay");
   }

   async function handleConfirm() {

      if (!method) return;

      if (isCustom && validValue <= 0) {
         alert("Valor inválido.");
         return;
      }

      if (lock.current) return;

      lock.current = true;
      setLoading(true);

      try {
         await onConfirm(method, validValue);

         setStep("success");

         setTimeout(() => {
            onClose();
         }, 3000);

      } catch (err) {

         console.error(err);
         alert("Erro ao processar contribuição.");

         lock.current = false;

      } finally {
         setLoading(false);
      }
   }

   return (
      <div className="modal-overlay" onClick={onClose}>

         <div className="modal" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close" onClick={onClose}>
               ×
            </button>

            {/* =======================
                STEP 1 - CHOOSE
            ======================= */}
            {step === "choose" && (
               <>
                  <div className="modal-header">
                     <h2>Confirmar presente</h2>
                     <p>Escolhe o método de pagamento</p>
                  </div>

                  <div className="modal-body">

                     {/* 🟣 só mostra imagem se NÃO for contribuição livre */}
                     {!isCustom && (
                        <img src={gift.image} alt={gift.title} />
                     )}

                     <div className="modal-info">

                        <h3>{gift.title}</h3>

                        {isCustom ? (
                           <input
                              type="number"
                              placeholder="Valor"
                              value={customValue}
                              onChange={(e) =>
                                 setCustomValue(e.target.value)
                              }
                              className="form-input"
                           />
                        ) : (
                           <span>
                              R$ {gift.price.toFixed(2).replace(".", ",")}
                              {" • "}
                              € {(gift.price / BRL_TO_EUR).toFixed(2).replace(".", ",")}
                           </span>
                        )}

                     </div>

                  </div>

                  <div className="payment-options">

                     <button
                        className={`payment-card ${method === "pix" ? "active" : ""}`}
                        onClick={() => setMethod("pix")}
                     >
                        <span className="tag">PIX</span>
                        <p>Brasil</p>
                     </button>

                     <button
                        className={`payment-card ${method === "mbway" ? "active" : ""}`}
                        onClick={() => setMethod("mbway")}
                     >
                        <span className="tag">MB WAY</span>
                        <p>Portugal</p>
                     </button>

                  </div>

                  <button
                     className="confirm-btn"
                     disabled={!method}
                     onClick={handleContinue}
                  >
                     Continuar
                  </button>
               </>
            )}

            {/* =======================
                STEP 2 - PAY
            ======================= */}
            {step === "pay" && (
               <>
                  <div className="modal-header">
                     <h2>Pagamento</h2>
                     <p>Finaliza via {method?.toUpperCase()}</p>
                  </div>

                  <div className="payment-box big">

                     <div style={{ marginBottom: 10 }}>
                        {gift.title}
                     </div>

                     {/* 💰 VALOR */}
                     <div style={{ marginBottom: 14, color: "var(--color-gold)" }}>
                        {isCustom ? (
                           <>
                              {method === "pix"
                                 ? `R$ ${validValue.toFixed(2).replace(".", ",")}`
                                 : `€ ${validValue.toFixed(2).replace(".", ",")}`}
                           </>
                        ) : (
                           <>
                              R$ {gift.price.toFixed(2).replace(".", ",")}
                              {" • "}
                              € {(gift.price / BRL_TO_EUR).toFixed(2).replace(".", ",")}
                           </>
                        )}
                     </div>

                     <p className="payment-title">
                        {method === "pix"
                           ? "PIX (Brasil)"
                           : "MB WAY (Portugal)"}
                     </p>

                     {/* 💳 INFO BANCÁRIA NOVA */}
                     {/* 💳 INFO BANCÁRIA (AJUSTADO) */}
                     <div className="bank-info">

                        {method === "pix" && (
                           <div className="bank-card">
                              <h4>Dados para pagamento</h4>
                              <p><strong>Nome:</strong> Rodrigo Freitas Subtil</p>
                              <p><strong>Banco:</strong> Nubank</p>
                           </div>
                        )}

                        {method === "mbway" && (
                           <div className="bank-card">
                              <h4>Dados para pagamento</h4>
                              <p><strong>Nome:</strong> Rodrigo Freitas Subtil</p>
                              <p><strong>Banco:</strong> Millennium BCP</p>
                           </div>
                        )}

                     </div>

                     {/* CÓDIGO */}
                     <div className="code-input">

                        <span className="code-value">
                           {method === "pix" ? pix : mbway}
                        </span>

                        <button
                           className={`copy-text-btn ${copied ? "copied" : ""}`}
                           onClick={handleCopy}
                        >
                           {copied ? "Copiado" : "Copiar"}
                        </button>

                     </div>

                  </div>

                  <button
                     className="confirm-btn"
                     onClick={handleConfirm}
                     disabled={loading || validValue <= 0}
                  >
                     {loading ? "A processar..." : "Confirmar pagamento"}
                  </button>

                  <button
                     className="close-btn"
                     onClick={() => setStep("choose")}
                  >
                     Voltar
                  </button>
               </>
            )}

            {/* =======================
                STEP 3 - SUCCESS
            ======================= */}
            {step === "success" && (
               <div className="success-box">
                  <div className="check">✔</div>
                  <h2>Pagamento confirmado</h2>
                  <p>Reserva feita com sucesso</p>
               </div>
            )}

         </div>
      </div>
   );
}