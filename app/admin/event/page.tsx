import { prisma } from "@/lib/prisma";
import { toggleEventClosed } from "./actions";

export default async function EventPage() {
  const ev = await prisma.eventSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, isClosed: false } });
  return (
    <div className="terminal-box max-w-xl">
      <h2 className="text-lg terminal-prompt text-primary">stato evento</h2>
      <p className="mt-2 text-sm">
        Stato attuale: {ev.isClosed ? <span className="text-destructive">CHIUSO</span> : <span className="text-primary">APERTO</span>}.
        Quando l'evento è chiuso gli studenti non possono iniziare nuovi tentativi, ma la classifica resta consultabile.
      </p>
      <form action={toggleEventClosed} className="mt-4">
        <button className={ev.isClosed ? "btn" : "btn-danger"}>
          {ev.isClosed ? "▶ riapri evento" : "■ chiudi evento"}
        </button>
      </form>
    </div>
  );
}
