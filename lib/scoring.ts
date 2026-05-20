// Regole di punteggio Tech Quest:
//   - prima risposta corretta al primo tentativo: 100% punti domanda
//   - risposta corretta dopo uno o più errori: 20% punti domanda (arrotondato a int)
//   - mai assegnare punti più volte per la stessa domanda

export const PENALTY_RATIO = 0.2;

export function questionPoints(questionPoints: number | null | undefined, standBasePoints: number): number {
  return questionPoints ?? standBasePoints;
}

export function scoreForAnswer({
  isCorrect,
  attemptNumber,
  basePoints,
}: {
  isCorrect: boolean;
  attemptNumber: number;
  basePoints: number;
}): number {
  if (!isCorrect) return 0;
  if (attemptNumber <= 1) return basePoints;
  return Math.round(basePoints * PENALTY_RATIO);
}
