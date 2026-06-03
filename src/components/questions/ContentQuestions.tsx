import { useEffect, useState } from "react";
import "./contentQuestions.css";
import { supabase } from "../../lib/supabase";

type QuestionUIState = {
   voted?: boolean;
   showResults?: boolean;
   selectedOption?: number;
};

type VotesMap = Record<number, Record<number, number>>;

export default function ContentQuestions() {

   const questions = [
      {
         id: 1,
         question: "Who will arrive first at the wedding?",
         options: ["Bride", "Groom", "Both on time"]
      },
      {
         id: 2,
         question: "Who will cry first?",
         options: ["Bride", "Groom", "Both"]
      },
      {
         id: 3,
         question: "Who is more likely to forget something important?",
         options: ["Bride", "Groom", "Neither"]
      },
      {
         id: 4,
         question: "What will be the best moment?",
         options: ["Ceremony", "Dinner", "Party"]
      },
      {
         id: 5,
         question: "Who will dance more?",
         options: ["Bride", "Groom", "Both equally"]
      }
   ];

   const [state, setState] = useState<Record<number, QuestionUIState>>({});
   const [votes, setVotes] = useState<VotesMap>({});

   // 🔥 carregar votos
   useEffect(() => {
      loadVotes();
   }, []);

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

   // 🔥 votar
   async function handleVote(questionId: number, optionIndex: number) {

      await supabase.from("votes").insert({
         question_id: questionId,
         option_id: optionIndex + 1 // importante: options começam em 1 no banco
      });

      await loadVotes();

      setState(prev => ({
         ...prev,
         [questionId]: {
            voted: true,
            showResults: false,
            selectedOption: optionIndex
         }
      }));
   }

   // 🔥 mostrar resultados
   function showResults(questionId: number) {
      setState(prev => ({
         ...prev,
         [questionId]: {
            ...prev[questionId],
            showResults: true
         }
      }));
   }

   // 🔥 calcular %
   function getPercent(questionId: number, optionId: number) {

      const qVotes = votes[questionId];
      if (!qVotes) return 0;

      const total = Object.values(qVotes).reduce((a, b) => a + b, 0);
      if (total === 0) return 0;

      const value = qVotes[optionId] || 0;

      return (value / total) * 100;
   }

   return (
      <section className="questions">

         <div className="questions-container">

            <div className="luxury-title">
               <span>Questions</span>
            </div>

            <h2 className="questions-title">
               Guests Predictions
            </h2>

            <p className="questions-subtitle">
               Vote first, then reveal results.
            </p>

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

                           {q.options.map((opt, index) => {

                              const percent = getPercent(q.id, index + 1);
                              const selected = qState.selectedOption === index;

                              return (
                                 <button
                                    key={index}
                                    className={`option-line ${selected ? "selected" : ""}`}
                                    onClick={() => handleVote(q.id, index)}
                                    disabled={qState.voted}
                                 >

                                    {/* BAR */}
                                    {show && (
                                       <div
                                          className="option-fill"
                                          style={{ width: `${percent}%` }}
                                       />
                                    )}

                                    <div className="option-left">
                                       <span className="radio-circle" />
                                       <span className="option-text">
                                          {opt}
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

                        {/* botão só depois do voto */}
                        {qState.voted && !show && (
                           <button
                              className="show-results-btn"
                              onClick={() => showResults(q.id)}
                           >
                              Show results
                           </button>
                        )}

                     </div>
                  );
               })}

            </div>

         </div>

      </section>
   );
}