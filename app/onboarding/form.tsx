"use client";
import { useTransition, useState } from "react";
import { completeOnboarding } from "./actions";
import { useRouter } from "next/navigation";

export function OnboardingForm({
  defaultName,
  defaultSurname,
  defaultClassName,
}: {
  defaultName: string;
  defaultSurname: string;
  defaultClassName: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await completeOnboarding(fd);
          if (res?.error) setError(res.error);
          else router.push("/app");
        });
      }}
    >
      <div>
        <label className="label" htmlFor="name">nome</label>
        <input className="input mt-1" id="name" name="name" defaultValue={defaultName} required maxLength={64} />
      </div>
      <div>
        <label className="label" htmlFor="surname">cognome</label>
        <input className="input mt-1" id="surname" name="surname" defaultValue={defaultSurname} required maxLength={64} />
      </div>
      <div>
        <label className="label" htmlFor="className">classe (es. 5AI)</label>
        <input className="input mt-1" id="className" name="className" defaultValue={defaultClassName} required maxLength={16} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? "› salvataggio..." : "▶ conferma e inizia"}
      </button>
    </form>
  );
}
