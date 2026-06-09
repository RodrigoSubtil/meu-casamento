import "./contentRsvp.css";

import { useState } from "react";
import { supabase } from "../../lib/supabase.ts";

import type { RsvpErrors } from "../../types/rsvp";

import {
   normalizeName,
   makeNameKey
} from "../../utils/normalize/normalizeName";

export default function ContentRsvp() {

   const [name, setName] = useState<string>("");
   const [attending, setAttending] =
      useState<string>("Sim, vou estar presente");
   const [category, setCategory] = useState<string>("");

   const [loading, setLoading] = useState<boolean>(false);
   const [errors, setErrors] = useState<RsvpErrors>({});
   const [success, setSuccess] = useState<boolean>(false);

   async function handleSubmit(
      e: React.FormEvent<HTMLFormElement>
   ) {

      e.preventDefault();

      setSuccess(false);

      const formErrors: RsvpErrors = {};

      if (!name.trim()) {
         formErrors.name = "O nome é obrigatório";
      }

      if (!attending) {
         formErrors.attending = "Selecione uma opção";
      }

      if (!category) {
         formErrors.category = "Selecione uma categoria";
      }

      if (Object.keys(formErrors).length > 0) {
         setErrors(formErrors);
         return;
      }

      setErrors({});
      setLoading(true);

      const cleanName = normalizeName(name);
      const nameKey = makeNameKey(name);

      const { data: existing } = await supabase
         .from("rsvp")
         .select("id")
         .eq("name_key", nameKey)
         .maybeSingle();

      if (existing) {

         setErrors({
            name: "Este RSVP já foi registado."
         });

         setLoading(false);
         return;
      }

      const { error } = await supabase
         .from("rsvp")
         .insert([
            {
               name: cleanName,
               name_key: nameKey,
               attending,
               category
            }
         ]);

      setLoading(false);

      if (error) {
         console.error(error);
         return;
      }

      setSuccess(true);

      setName("");
      setAttending("Sim, vou estar presente");
      setCategory("");
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

                  {/* NOME */}
                  <div className="form-group">

                     <label className="form-label">
                        Nome completo
                     </label>

                     <input
                        className={`form-input ${errors.name
                              ? "form-error-input"
                              : ""
                           }`}
                        value={name}
                        onChange={(e) =>
                           setName(e.target.value)
                        }
                     />

                     <span
                        className={`form-error ${errors.name
                              ? "show"
                              : ""
                           }`}
                     >
                        {errors.name || ""}
                     </span>

                  </div>

                  {/* PRESENÇA */}
                  <div className="form-group">

                     <label className="form-label">
                        Vai comparecer?
                     </label>

                     <select
                        className={`form-select ${errors.attending
                              ? "form-error-input"
                              : ""
                           }`}
                        value={attending}
                        onChange={(e) =>
                           setAttending(e.target.value)
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
                        className={`form-error ${errors.attending
                              ? "show"
                              : ""
                           }`}
                     >
                        {errors.attending || ""}
                     </span>

                  </div>

                  {/* CATEGORIA */}
                  <div className="form-group">

                     <label className="form-label">
                        Categoria
                     </label>

                     <select
                        className={`form-select ${errors.category
                              ? "form-error-input"
                              : ""
                           }`}
                        value={category}
                        onChange={(e) =>
                           setCategory(e.target.value)
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
                        className={`form-error ${errors.category
                              ? "show"
                              : ""
                           }`}
                     >
                        {errors.category || ""}
                     </span>

                  </div>

                  <button
                     className="form-button"
                     disabled={loading}
                  >
                     {loading
                        ? "A enviar..."
                        : "Enviar"}
                  </button>

               </form>

            </div>

         </div>

      </section>
   );
}