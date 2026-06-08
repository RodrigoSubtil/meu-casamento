import { useEffect, useState } from "react";
import "./contentQuestions.css";
import { supabase } from "../../lib/supabase";
import { getQuestions } from "../../services/questionsService";

type QuestionUIState = {
   voted?: boolean;
   showResults?: boolean;
   selectedOption?: number;
};

type VotesMap = Record<number, Record<number, number>>;

export default function ContentQuestions() {

   const [questions, setQuestions] = useState<any[]>([]);
   const [state, setState] = useState<Record<number, QuestionUIState>>({});
   const [votes, setVotes] = useState<VotesMap>({});

   useEffect(() => {
      loadQuestions();
      loadVotes();
   }, []);

   // =========================
   // 📌 CARREGAR QUESTÕES
   // =========================
   async function loadQuestions() {
      const data = await getQuestions();
      setQuestions(data);
   }

   // =========================
   // 📌 CARREGAR VOTOS
   // =========================
   async function loadVotes() {
      const { data, error } = await supabase
         .from("votes")
         .select("question_id, option_id");

      if (error) {
         console.error(error);
         return;
      }

      const map: VotesMap = {};

      data?.forEach((v) => {
         if (!map[v.question_id]) map[v.question_id] = {};
         map[v.question_id][v.option_id] =
            (map[v.question_id][v.option_id] || 0) + 1;
      });

      setVotes(map);
   }

   // =========================
   // 📌 VOTAR
   // =========================
   async function handleVote(questionId: number, optionId: number) {

      await supabase.from("votes").insert({
         question_id: questionId,
         option_id: optionId
      });

      await loadVotes();

      setState(prev => ({
         ...prev,
         [questionId]: {
            voted: true,
            showResults: false,
            selectedOption: optionId
         }
      }));
   }

   // =========================
   // 📌 MOSTRAR RESULTADOS
   // =========================
   function showResults(questionId: number) {
      setState(prev => ({
         ...prev,
         [questionId]: {
            ...prev[questionId],
            showResults: true
         }
      }));
   }

   // =========================
   // 📌 % POR OPÇÃO
   // =========================
   function getPercent(questionId: number, optionId: number) {

      const qVotes = votes[questionId];
      if (!qVotes) return 0;

      const total = Object.values(qVotes).reduce((a, b) => a + b, 0);
      if (total === 0) return 0;

      const value = qVotes[optionId] || 0;

      return (value / total) * 100;
   }

   // =========================
   // 📌 RENDER
   // =========================
   return (
      <section className="questions">

         <div className="container">

            <div className="questions-container">

               <div className="section-header">
                  <div className="luxury-title-main">
                     <span>Interagir</span>
                  </div>

                  <p className="section-subtitle">
                     Há sempre muitas expectativas e palpites quando um casamento se aproxima, e queremos conhecer os vossos também. Por isso, reunimos aqui algumas perguntas divertidas para vocês. Façam suas apostas e se divirtam com a gente.
                  </p>
               </div>

               <div className="questions-list">

                  {questions.map((q) => {

                     const qState = state[q.id] || {};
                     const show = qState.showResults;

                     return (
                        <div className="question-block" key={q.id}>

                           <div className="question-header">
                              <span className="question-number">
                                 0{q.id}
                              </span>

                              <h3 className="question-title">
                                 {q.question}
                              </h3>
                           </div>

                           <div className="question-options">

                              {q.options.map((opt: any) => {

                                 const percent = getPercent(q.id, opt.id);
                                 const selected = qState.selectedOption === opt.id;

                                 return (
                                    <button
                                       key={opt.id}
                                       className={`option-line ${selected ? "selected" : ""}`}
                                       onClick={() => handleVote(q.id, opt.id)}
                                       disabled={qState.voted}
                                    >

                                       {show && (
                                          <div
                                             className="option-fill"
                                             style={{ width: `${percent}%` }}
                                          />
                                       )}

                                       <div className="option-left">
                                          <span className="radio-circle" />
                                          <span className="option-text">
                                             {opt.text}
                                          </span>
                                       </div>

                                       {show && (
                                          <span className="option-percent">
                                             {percent.toFixed(0)}%
                                          </span>
                                       )}

                                    </button>
                                 );
                              })}

                           </div>

                           {qState.voted && !show && (
                              <button
                                 className="show-results-btn"
                                 onClick={() => showResults(q.id)}
                              >
                                 Ver resultados
                              </button>
                           )}

                        </div>
                     );
                  })}

               </div>

            </div>

         </div>

      </section>
   );
}