import { MonitorBoard } from "./board";

export const dynamic = "force-dynamic";

// Monitor è pubblico: niente login richiesto. Decisione documentata in open_decisions.
export default function MonitorPage() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <MonitorBoard />
    </main>
  );
}
