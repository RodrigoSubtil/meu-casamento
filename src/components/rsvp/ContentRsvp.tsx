import "./contentRsvp.css";

import { useState } from "react";
import { supabase } from "../../lib/supabase.ts";

import { validateRsvp } from "../../utils/validators/rsvpValidator";
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
   const [age, setAge] = useState<string>("");

   const [loading, setLoading] = useState<boolean>(false);
   const [errors, setErrors] = useState<RsvpErrors>({});
   const [success, setSuccess] = useState<boolean>(false);

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      setSuccess(false);

      const formErrors = validateRsvp({
         name,
         attending,
         category,
         age
      });

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
               category,
               age: Number(age)
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
      setAge("");
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

               <form className="rsvp-form form-separar" onSubmit={handleSubmit}>

                  {success && (
                     <div className="form-success show">
                        Enviado com sucesso!
                     </div>
                  )}

                  <div className="rsvp-grid">

                     {/* NAME */}
                     <div className="form-group">
                        <label className="form-label">Nome completo</label>

                        <input
                           className={`form-input ${errors.name ? "form-error-input" : ""}`}
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                        />

                        <span className={`form-error ${errors.name ? "show" : ""}`}>
                           {errors.name || ""}
                        </span>
                     </div>

                     {/* ATTENDING */}
                     <div className="form-group">
                        <label className="form-label">Vai comparecer?</label>

                        <select
                           className={`form-select ${errors.attending ? "form-error-input" : ""}`}
                           value={attending}
                           onChange={(e) => setAttending(e.target.value)}
                        >
                           <option>Sim, vou estar presente</option>
                           <option>Desculpe, não vou poder ir</option>
                        </select>

                        <span className={`form-error ${errors.attending ? "show" : ""}`}>
                           {errors.attending || ""}
                        </span>
                     </div>

                     {/* CATEGORY */}
                     <div className="form-group">
                        <label className="form-label">Categoria</label>

                        <select
                           className={`form-select ${errors.category ? "form-error-input" : ""}`}
                           value={category}
                           onChange={(e) => setCategory(e.target.value)}
                        >
                           <option value="">Selecione uma opção</option>
                           <option value="family">Família</option>
                           <option value="friend">Amigo(a)</option>
                        </select>

                        <span className={`form-error ${errors.category ? "show" : ""}`}>
                           {errors.category || ""}
                        </span>
                     </div>

                     {/* AGE */}
                     <div className="form-group">
                        <label className="form-label">Idade</label>

                        <input
                           type="number"
                           className={`form-input ${errors.age ? "form-error-input" : ""}`}
                           value={age}
                           onChange={(e) => setAge(e.target.value)}
                        />

                        <span className={`form-error ${errors.age ? "show" : ""}`}>
                           {errors.age || ""}
                        </span>
                     </div>

                  </div>

                  <button className="form-button" disabled={loading}>
                     {loading ? "A enviar..." : "Enviar"}
                  </button>

               </form>

            </div>

         </div>

      </section>
   );
}