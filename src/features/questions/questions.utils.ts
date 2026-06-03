export function calculatePercentages(
   votes: { question_id: number; option_id: number }[],
   questionId: number,
   options: { id: number }[]
) {
   const filtered = votes.filter(v => v.question_id === questionId);

   const total = filtered.length;

   if (!total) {
      return options.map(() => 0);
   }

   return options.map(opt => {
      const count = filtered.filter(v => v.option_id === opt.id).length;
      return (count / total) * 100;
   });
}