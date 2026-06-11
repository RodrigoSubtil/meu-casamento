import "./contentRsvp.css";

import { useState } from "react";
import { supabase } from "../../lib/supabase.ts";

import type { RsvpErrors } from "../../types/rsvp";

import {
   normalizeName,
   makeNameKey
} from "../../utils/normalize/normalizeName";

type Guest = {
   id: number;
   name: string;
   attending: string;
   category: string;
};

function createGuest(): Guest {
   return {
      id: Date.now() + Math.random(),
      name: "",
      attending: "Sim, vou estar presente",
      category: ""
   };
}

export default function ContentRsvp() {
   const [guests, setGuests] = useState<Guest[]>([createGuest()]);
   const [loading, setLoading] = useState<boolean>(false);
   const [errors, setErrors] = useState<RsvpErrors[]>([{}]);
   const [success, setSuccess] = useState<boolean>(false);

   function updateGuest(
      guestId: number,
      field: keyof Omit<Guest, "id">,
      value: string
   ) {
      setGuests((current) =>
         current.map((guest) =>
            guest.id === guestId
               ? { ...guest, [field]: value }
               : guest
         )
      );
   }

   function addGuest() {
      setGuests((current) => [...current, createGuest()]);
      setErrors((current) => [...current, {}]);
   }

   function removeGuest(guestId: number) {
      if (guests.length === 1) return;

      const nextGuests = guests.filter((guest) => guest.id !== guestId);
      const nextErrors = errors.filter((_, index) => guests[index]?.id !== guestId);

      setGuests(nextGuests);
      setErrors(nextErrors.length ? nextErrors : [{}]);
   }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setSuccess(false);

      const formErrors: RsvpErrors[] = guests.map(() => ({}));
      const usedNames = new Set<string>();

      guests.forEach((guest, index) => {
         const nameKey = makeNameKey(guest.name);

         if (!guest.name.trim()) {
            formErrors[index].name = "O nome é obrigatório";
         } else if (usedNames.has(nameKey)) {
            formErrors[index].name = "Este nome já foi adicionado.";
         } else {
            usedNames.add(nameKey);
         }

         if (!guest.attending) {
            formErrors[index].attending = "Selecione uma opção";
         }

         if (!guest.category) {
            formErrors[index].category = "Selecione uma categoria";
         }
      });

      if (formErrors.some((item) => Object.keys(item).length > 0)) {
         setErrors(formErrors);
         return;
      }

      const guestsToSave = guests.map((guest) => ({
         name: normalizeName(guest.name),
         name_key: makeNameKey(guest.name),
         attending: guest.attending,
         category: guest.category
      }));

      setErrors(guests.map(() => ({})));
      setLoading(true);

      const { data: existingGuests, error: existingError } = await supabase
         .from("rsvp")
         .select("name_key")
         .in("name_key", guestsToSave.map((guest) => guest.name_key));

      if (existingError) {
         console.error(existingError);
         setLoading(false);
         return;
      }

      if (existingGuests && existingGuests.length > 0) {
         const existingKeys = new Set(
            existingGuests.map((guest) => guest.name_key)
         );

         setErrors(
            guestsToSave.map((guest) => ({
               name: existingKeys.has(guest.name_key)
                  ? "Este RSVP já foi registado."
                  : undefined
            }))
         );

         setLoading(false);
         return;
      }

      const { error } = await supabase
         .from("rsvp")
         .insert(guestsToSave);

      setLoading(false);

      if (error) {
         console.error(error);
         return;
      }

      setSuccess(true);
      setGuests([createGuest()]);
      setErrors([{}]);
   }

   return (
      <section className="rsvp">
         <div className="container">
            <div className="rsvp-container">
               <div className="section-header">
                  <div className="luxury-title-main">
                     <span>Convidados</span>
                  </div>

                  <p className="section-subtitle">
                     Cada detalhe da nossa festa está sendo preparado com muito carinho para tornar este dia ainda mais especial. Para nos ajudar na organização e garantir que tudo aconteça da melhor forma possível, contamos com a confirmação da sua presença até o dia 15 de julho. Mal podemos esperar para celebrar esse dia ao lado de vocês!
                  </p>
               </div>

               <form
                  className="rsvp-form"
                  onSubmit={handleSubmit}
               >
                  {success && (
                     <div className="form-success show">
                        Enviado com sucesso!
                     </div>
                  )}

                  <div className="rsvp-guests">
                     {guests.map((guest, index) => {
                        const guestErrors = errors[index] || {};

                        return (
                           <div className="rsvp-person" key={guest.id}>
                              <div className="rsvp-person-header">
                                 <span>Pessoa {index + 1}</span>

                                 {guests.length > 1 && (
                                    <button
                                       type="button"
                                       className="rsvp-remove"
                                       onClick={() => removeGuest(guest.id)}
                                    >
                                       Remover
                                    </button>
                                 )}
                              </div>

                              <div className="form-group">
                                 <label className="form-label">
                                    Nome completo
                                 </label>

                                 <input
                                    className={`form-input ${guestErrors.name
                                          ? "form-error-input"
                                          : ""
                                       }`}
                                    value={guest.name}
                                    onChange={(event) =>
                                       updateGuest(guest.id, "name", event.target.value)
                                    }
                                 />

                                 <span
                                    className={`form-error ${guestErrors.name
                                          ? "show"
                                          : ""
                                       }`}
                                 >
                                    {guestErrors.name || ""}
                                 </span>
                              </div>

                              <div className="rsvp-grid">
                                 <div className="form-group">
                                    <label className="form-label">
                                       Vai comparecer?
                                    </label>

                                    <select
                                       className={`form-select ${guestErrors.attending
                                             ? "form-error-input"
                                             : ""
                                          }`}
                                       value={guest.attending}
                                       onChange={(event) =>
                                          updateGuest(guest.id, "attending", event.target.value)
                                       }
                                    >
                                       <option>
                                          Sim, vou estar presente
                                       </option>

                                       <option>
                                          Desculpe, não vou poder ir
                                       </option>
                                    </select>

                                    <span
                                       className={`form-error ${guestErrors.attending
                                             ? "show"
                                             : ""
                                          }`}
                                    >
                                       {guestErrors.attending || ""}
                                    </span>
                                 </div>

                                 <div className="form-group">
                                    <label className="form-label">
                                       Categoria
                                    </label>

                                    <select
                                       className={`form-select ${guestErrors.category
                                             ? "form-error-input"
                                             : ""
                                          }`}
                                       value={guest.category}
                                       onChange={(event) =>
                                          updateGuest(guest.id, "category", event.target.value)
                                       }
                                    >
                                       <option value="">
                                          Selecione uma opção
                                       </option>

                                       <option value="adulto">
                                          Adulto
                                       </option>

                                       <option value="crianca">
                                          Criança (até 7 anos)
                                       </option>
                                    </select>

                                    <span
                                       className={`form-error ${guestErrors.category
                                             ? "show"
                                             : ""
                                          }`}
                                    >
                                       {guestErrors.category || ""}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  <button
                     className="rsvp-add"
                     type="button"
                     onClick={addGuest}
                  >
                     Adicionar familiares
                  </button>

                  <button
                     className="form-button"
                     disabled={loading}
                  >
                     {loading
                        ? "A enviar..."
                        : guests.length > 1
                           ? "Enviar confirmações"
                           : "Enviar"}
                  </button>
               </form>
            </div>
         </div>
      </section>
   );
}
