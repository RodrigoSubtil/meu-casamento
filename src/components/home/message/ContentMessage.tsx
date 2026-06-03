import type { MessageErrors } from "../../../types/message";
import { validateMessage } from "../../../utils/validators/messageValidator";

import { useState } from "react";
import { supabase } from "../../../lib/supabase.ts";

import "./contentMessage.css";

export default function ContentMessage() {
   const [name, setName] = useState<string>("");
   const [message, setMessage] = useState<string>("");

   const [loading, setLoading] = useState<boolean>(false);
   const [success, setSuccess] = useState<boolean>(false);
   const [errors, setErrors] = useState<MessageErrors>({});

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      setSuccess(false);

      const formErrors = validateMessage({ name, message });

      if (Object.keys(formErrors).length > 0) {
         setErrors(formErrors);
         return;
      }

      setErrors({});
      setLoading(true);

      const { error } = await supabase
         .from("messages")
         .insert([{ name, message }]);

      setLoading(false);

      if (error) {
         console.error(error);
         return;
      }

      setSuccess(true);

      setName("");
      setMessage("");
   }

   return (
      <section className="message-section">
         <div className="message-container">

            <div className="message-header">
               <div className="luxury-title">
                  <span>Messages</span>
               </div>

               <h2 className="message-title">
                  Leave a Message for the Couple
               </h2>

               <p className="message-subtitle">
                  Your words will become part of one of the most meaningful days of our lives.
               </p>
            </div>

            <form className="message-form" onSubmit={handleSubmit}>

               {/* SUCCESS GLOBAL */}
               {success && (
                  <div className="form-success show">
                     Your message was sent successfully
                  </div>
               )}

               {/* NAME */}
               <div className="form-group">
                  <label className="form-label">Your Name</label>

                  <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Enter your name"
                     className={`form-input ${errors.name ? "form-error-input" : ""}`}
                  />

                  <span className={`form-error ${errors.name ? "show" : ""}`}>
                     {errors.name || ""}
                  </span>
               </div>

               {/* MESSAGE */}
               <div className="form-group">
                  <label className="form-label">Your Message</label>

                  <textarea
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     placeholder="Write your message here..."
                     className={`form-textarea ${errors.message ? "form-error-input" : ""}`}
                  />

                  <span className={`form-error ${errors.message ? "show" : ""}`}>
                     {errors.message || ""}
                  </span>
               </div>

               <button className="form-button" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
               </button>

            </form>

         </div>
      </section>
   );
}