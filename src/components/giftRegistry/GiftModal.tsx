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
   onClose: () => void;
   onConfirm: (method: "pix" | "mbway") => Promise<void>;
};

type Step = "choose" | "pay" | "success";

const BRL_TO_EUR = 6.3;

export default function GiftModal({
   gift,
   onClose,
   onConfirm
}: Props) {

   const [step, setStep] = useState<Step>("choose");
   const [method, setMethod] = useState<"pix" | "mbway" | null>(null);
   const [copied, setCopied] = useState(false);
   const [loading, setLoading] = useState(false);

   const lock = useRef(false);

   const pix = "13715865980";
   const mbway = "935668596";

   const brl = gift.price;
   const eur = gift.price / BRL_TO_EUR;

   useEffect(() => {
      setStep("choose");
      setMethod(null);
      setCopied(false);
      setLoading(false);
      lock.current = false;
   }, [gift.id]);

   function handleCopy() {

      const value = method === "pix"
         ? pix
         : mbway;

      navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
         setCopied(false);
      }, 1200);
   }

   function handleContinue() {
      if (!method) return;
      setStep("pay");
   }

   async function handleConfirm() {

      if (!method) return;

      if (lock.current) return;

      lock.current = true;
      setLoading(true);

      try {

         await onConfirm(method);

         setStep("success");

         setTimeout(() => {
            onClose();
         }, 3000);

      } catch (err) {

         console.error(err);

         alert(
            "Erro ao reservar presente."
         );

         lock.current = false;

      } finally {

         setLoading(false);

      }
   }

   return (
      <div
         className="modal-overlay"
         onClick={onClose}
      >

         <div
            className="modal"
            onClick={(e) =>
               e.stopPropagation()
            }
         >

            <button
               className="modal-close"
               onClick={onClose}
               aria-label="Fechar"
            >
               ×
            </button>

            {step === "choose" && (
               <>


                  <div className="modal-header">
                     <h2>
                        Confirmar presente
                     </h2>

                     <p>
                        Escolhe o método de pagamento
                     </p>
                  </div>

                  <div className="modal-body">

                     <img
                        src={gift.image}
                        alt={gift.title}
                     />

                     <div className="modal-info">

                        <h3>
                           {gift.title}
                        </h3>

                        <span>
                           R$ {brl
                              .toFixed(2)
                              .replace(".", ",")}
                           {" • "}
                           € {eur
                              .toFixed(2)
                              .replace(".", ",")}
                        </span>

                     </div>

                  </div>

                  <div className="payment-options">

                     <button
                        className={`payment-card ${method === "pix"
                              ? "active"
                              : ""
                           }`}
                        onClick={() =>
                           setMethod("pix")
                        }
                     >
                        <span className="tag">
                           PIX
                        </span>

                        <p>Brasil</p>
                     </button>

                     <button
                        className={`payment-card ${method === "mbway"
                              ? "active"
                              : ""
                           }`}
                        onClick={() =>
                           setMethod("mbway")
                        }
                     >
                        <span className="tag">
                           MB WAY
                        </span>

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

            {step === "pay" && (
               <>

                  <div className="modal-header">
                     <h2>Pagamento</h2>

                     <p>
                        Finaliza via{" "}
                        {method?.toUpperCase()}
                     </p>
                  </div>

                  <div className="payment-box big">

                     <div
                        style={{
                           marginBottom: "10px"
                        }}
                     >
                        {gift.title}
                     </div>

                     <div
                        style={{
                           marginBottom: "14px",
                           color:
                              "var(--color-gold)"
                        }}
                     >
                        R$ {brl
                           .toFixed(2)
                           .replace(".", ",")}
                        {" • "}
                        € {eur
                           .toFixed(2)
                           .replace(".", ",")}
                     </div>

                     <p className="payment-title">

                        {method === "pix"
                           ? "PIX (Brasil)"
                           : "MB WAY (Portugal)"}

                     </p>

                     <div className="code-input">

                        <span className="code-value">

                           {method === "pix"
                              ? pix
                              : mbway}

                        </span>

                        <button
                           className={`copy-text-btn ${copied
                                 ? "copied"
                                 : ""
                              }`}
                           onClick={handleCopy}
                        >
                           {copied
                              ? "Copiado"
                              : "Copiar"}
                        </button>

                     </div>

                  </div>

                  <button
                     className="confirm-btn"
                     onClick={handleConfirm}
                     disabled={loading}
                  >
                     {loading
                        ? "A processar..."
                        : "Confirmar pagamento"}
                  </button>

                  <button
                     className="close-btn"
                     onClick={() =>
                        setStep("choose")
                     }
                  >
                     Voltar
                  </button>

               </>
            )}

            {step === "success" && (

               <div className="success-box">

                  <div className="check">
                     ✔
                  </div>

                  <h2>
                     Pagamento confirmado
                  </h2>

                  <p>
                     Reserva feita com sucesso
                  </p>

               </div>

            )}

         </div>

      </div>
   );
}