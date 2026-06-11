import { useEffect } from "react";
import { FaCheck } from "react-icons/fa";

import "./modalConfirmation.css";

type ModalAction = {
   label: string;
   href: string;
   variant?: "primary" | "secondary";
};

type ModalConfirmationProps = {
   open: boolean;
   eyebrow: string;
   title: string;
   description: string;
   actions: ModalAction[];
   onClose: () => void;
};

export default function ModalConfirmation({
   open,
   eyebrow,
   title,
   description,
   actions,
   onClose
}: ModalConfirmationProps) {
   useEffect(() => {
      if (!open) return;

      function handleKeyDown(event: KeyboardEvent) {
         if (event.key === "Escape") onClose();
      }

      document.addEventListener("keydown", handleKeyDown);

      return () => document.removeEventListener("keydown", handleKeyDown);
   }, [open, onClose]);

   if (!open) return null;

   return (
      <div className="confirmation-overlay" role="presentation" onClick={onClose}>
         <div
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            onClick={(event) => event.stopPropagation()}
         >
            <button
               className="confirmation-close"
               type="button"
               aria-label="Fechar confirmação"
               onClick={onClose}
            >
               &times;
            </button>

            <div className="confirmation-icon" aria-hidden="true">
               <FaCheck />
            </div>

            <span className="confirmation-eyebrow">{eyebrow}</span>

            <h2 id="confirmation-title">{title}</h2>

            <p>{description}</p>

            <div className="confirmation-actions">
               {actions.map((action) => (
                  <a
                     key={action.href}
                     className={`confirmation-action ${action.variant === "primary"
                           ? "primary"
                           : ""
                        }`}
                     href={action.href}
                  >
                     {action.label}
                  </a>
               ))}
            </div>
         </div>
      </div>
   );
}
