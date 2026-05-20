import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateStand } from "../actions";
import Link from "next/link";

export default async function StandEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.stand.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div className="terminal-box max-w-2xl">
      <h2 className="text-lg terminal-prompt text-primary">edit stand · {s.code}</h2>
      <form action={updateStand} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="hidden" name="id" value={s.id} />
        <Field label="code" name="code" defaultValue={s.code} />
        <Field label="area" name="area" defaultValue={s.area} />
        <Field label="stanza" name="room" defaultValue={s.room} />
        <Field label="basePoints" name="basePoints" type="number" defaultValue={String(s.basePoints)} />
        <div className="md:col-span-2"><Field label="titolo" name="title" defaultValue={s.title} /></div>
        <div className="md:col-span-2"><Field label="descrizione" name="description" defaultValue={s.description ?? ""} /></div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={s.isActive} /> attivo
        </label>
        <div className="md:col-span-2 flex gap-2">
          <button className="btn">▶ salva</button>
          <Link href="/admin/stands" className="btn-accent">indietro</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input mt-1" type={type} defaultValue={defaultValue} />
    </div>
  );
}
