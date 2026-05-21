"use client";
import { useTransition, useState } from "react";
import { completeOnboarding } from "./actions";
import { useRouter } from "next/navigation";

export function OnboardingForm({
  defaultName,
  defaultSurname,
  defaultClassName,
  classes,
}: {
  defaultName: string;
  defaultSurname: string;
  defaultClassName: string;
  classes: string[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const noClasses = classes.length === 0;

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
        <label className="label" htmlFor="className">classe</label>
        <select
          id="className"
          name="className"
          className="input mt-1"
          defaultValue={classes.includes(defaultClassName.toUpperCase()) ? defaultClassName.toUpperCase() : ""}
          required
          disabled={noClasses}
        >
          <option value="" disabled>— seleziona —</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="submit" className="btn w-full" disabled={pending || noClasses}>
        {pending ? "› salvataggio..." : "▶ conferma e inizia"}
      </button>
    </form>
  );
}
