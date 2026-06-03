import "./giftModal.css";
import { useState } from "react";

type Gift = {
    id: number;
    title: string;
    price: number;
    image: string;
};

type Props = {
    gift: Gift;
    onClose: () => void;
    onConfirm: (method: "pix" | "mbway") => void;
};

type Step = "choose" | "pay" | "success";

export default function GiftModal({ gift, onClose, onConfirm }: Props) {

    const [step, setStep] = useState<Step>("choose");
    const [method, setMethod] = useState<"pix" | "mbway" | null>(null);

    const pix = "13715865980";
    const mbway = "935668596";

    function handleContinue() {
        if (!method) return;
        setStep("pay");
    }

    function handleConfirm() {
        if (!method) return;

        onConfirm(method);

        setStep("success");

        setTimeout(() => {
            onClose();
        }, 2500);
    }
    return (
        <div className="modal-overlay" onClick={onClose}>

            <div className="modal" onClick={(e) => e.stopPropagation()}>

                {/* =========================
               STEP 1 - CHOOSE
            ========================= */}
                {step === "choose" && (
                    <>
                        <div className="modal-header">
                            <h2>Confirmar presente</h2>
                            <p>Escolhe o método de pagamento</p>
                        </div>

                        <div className="modal-body">
                            <img src={gift.image} alt={gift.title} />

                            <div className="modal-info">
                                <h3>{gift.title}</h3>
                                <span>€{gift.price}</span>
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

                {/* =========================
               STEP 2 - PAYMENT INFO
            ========================= */}
                {step === "pay" && (
                    <>
                        <div className="modal-header">
                            <h2>Pagamento</h2>
                            <p>Finaliza via {method?.toUpperCase()}</p>
                        </div>

                        <div className="payment-box big">

                            {method === "pix" && (
                                <>
                                    <p className="payment-title">PIX (Brasil)</p>
                                    <div className="code-box">{pix}</div>
                                </>
                            )}

                            {method === "mbway" && (
                                <>
                                    <p className="payment-title">MB WAY (Portugal)</p>
                                    <div className="code-box">{mbway}</div>
                                </>
                            )}

                        </div>

                        <button className="confirm-btn" onClick={handleConfirm}>
                            Confirmar pagamento
                        </button>

                        <button className="close-btn" onClick={() => setStep("choose")}>
                            Voltar
                        </button>
                    </>
                )}

                {/* =========================
               STEP 3 - SUCCESS
            ========================= */}
                {step === "success" && (
                    <div className="success-box">
                        <div className="check">✔</div>

                        <h2>Pagamento confirmado</h2>
                        <p>Obrigado por fazer parte deste momento 💛</p>
                    </div>
                )}

            </div>

        </div>
    );
}