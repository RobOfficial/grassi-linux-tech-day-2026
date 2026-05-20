"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, completeAttempt } from "./actions";

type Option = { id: string; text: string; position: number };
type Q = { id: string; text: string; points: number; options: Option[] };

type AnsweredEntry = { questionId: string; score: number; attemptNumber: number };
type ErrorEntry = { questionId: string; count: number };

export function QuizRunner({
  attemptId,
  questions,
  initialAnswered,
  initialErrors,
}: {
  attemptId: string;
  questions: Q[];
  initialAnswered: AnsweredEntry[];
  initialErrors: ErrorEntry[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [answered, setAnswered] = useState<Map<string, AnsweredEntry>>(() => new Map(initialAnswered.map((a) => [a.questionId, a])));
  const [errors, setErrors] = useState<Map<string, number>>(() => new Map(initialErrors.map((e) => [e.questionId, e.count])));
  const [wrongTried, setWrongTried] = useState<Map<string, Set<string>>>(() => {
    const m = new Map<string, Set<string>>();
    for (const q of questions) m.set(q.id, new Set());
    return m;
  });
  const [flash, setFlash] = useState<{ qid: string; oid: string; correct: boolean } | null>(null);

  const currentIndex = useMemo(() => questions.findIndex((q) => !answered.has(q.id)), [questions, answered]);
  const current = currentIndex >= 0 ? questions[currentIndex] : null;
  const total = questions.length;
  const done = total - questions.filter((q) => !answered.has(q.id)).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 100;
  const cumulativeScore = Array.from(answered.values()).reduce((s, a) => s + a.score, 0);

  const allDone = currentIndex < 0;

  const handlePick = (q: Q, opt: Option) => {
    if (answered.has(q.id)) return;
    const wrongs = wrongTried.get(q.id) ?? new Set();
    if (wrongs.has(opt.id)) return;
    start(async () => {
      const res = await submitAnswer({ attemptId, questionId: q.id, optionId: opt.id });
      if (res.error) {
        alert(res.error);
        return;
      }
      setFlash({ qid: q.id, oid: opt.id, correct: res.isCorrect });
      setTimeout(() => setFlash(null), 700);
      if (res.isCorrect) {
        setAnswered((m) => {
          const n = new Map(m);
          n.set(q.id, { questionId: q.id, score: res.scoreAwarded, attemptNumber: res.attemptNumber });
          return n;
        });
      } else {
        setErrors((m) => { const n = new Map(m); n.set(q.id, (n.get(q.id) ?? 0) + 1); return n; });
        setWrongTried((m) => {
          const n = new Map(m);
          const s = new Set(n.get(q.id) ?? []);
          s.add(opt.id);
          n.set(q.id, s);
          return n;
        });
      }
    });
  };

  const handleComplete = () => {
    start(async () => {
      const res = await completeAttempt({ attemptId });
      if (res.error) { alert(res.error); return; }
      router.push(`/stand/${attemptId}/summary`);
    });
  };

  if (allDone) {
    return (
      <div className="text-center space-y-3">
        <p className="text-xs text-muted-foreground">tutte le domande risolte</p>
        <p className="text-2xl text-primary glow">{cumulativeScore} punti</p>
        <button className="btn w-full" disabled={pending} onClick={handleComplete}>
          {pending ? "› salvataggio..." : "▶ conferma completamento"}
        </button>
      </div>
    );
  }

  if (!current) return null;
  const wrongs = wrongTried.get(current.id) ?? new Set();
  const errorCount = errors.get(current.id) ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>domanda {done + 1}/{total}</span>
          <span>punti: <span className="text-primary">{cumulativeScore}</span></span>
        </div>
        <div className="h-1 mt-1 bg-border rounded overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="text-base">{current.text}</p>
      <p className="text-xs text-muted-foreground">vale {current.points} pti {errorCount > 0 && <span className="text-destructive">· retry penalizzato (20%)</span>}</p>

      <ul className="grid grid-cols-1 gap-2">
        {current.options.map((o) => {
          const tried = wrongs.has(o.id);
          const flashing = flash?.qid === current.id && flash.oid === o.id;
          return (
            <li key={o.id}>
              <button
                disabled={pending || tried}
                onClick={() => handlePick(current, o)}
                className={[
                  "w-full text-left px-4 py-3 rounded border transition-all",
                  tried
                    ? "border-destructive/60 bg-destructive/20 text-destructive line-through cursor-not-allowed"
                    : "border-border hover:border-primary hover:bg-primary/10",
                  flashing && flash?.correct ? "ring-2 ring-primary animate-pulse" : "",
                  flashing && !flash?.correct ? "ring-2 ring-destructive animate-pulse" : "",
                ].join(" ")}
              >
                <span className="text-primary mr-2">[{o.position}]</span>{o.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
