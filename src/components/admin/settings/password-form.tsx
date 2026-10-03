"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { changePassword } from "@/app/admin/actions/settings";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/field";
import { passwordSchema, type PasswordValues } from "@/lib/validation";

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setErrorText] = useState<string>();
  const [done, setDone] = useState(false);
  // Arriving from the password-reset e-mail link (#sifre).
  const fromResetLink = useSyncExternalStore(
    () => () => {},
    () => window.location.hash === "#sifre",
    () => false,
  );
  const highlight = fromResetLink && !done;
  const { register, handleSubmit, formState, reset, setError } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
  });
  const errors = formState.errors;

  useEffect(() => {
    if (fromResetLink) document.getElementById("pw-new")?.focus();
  }, [fromResetLink]);

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      setErrorText(undefined);
      const res = await changePassword(values);
      if (!res.ok) {
        setErrorText(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, message]) =>
          setError(k as keyof PasswordValues, { message }),
        );
        return;
      }
      reset();
      setDone(true);
      toast.success("Şifren güncellendi.");
    }),
  );

  return (
    <form id="sifre" onSubmit={onSubmit} noValidate className="flex scroll-mt-6 flex-col gap-3.5">
      <h2 className="border-b border-divider pb-2 text-[22px]">Şifre değiştir</h2>
      {highlight ? (
        <p className="rounded-md border border-accent bg-accent-100 px-3.5 py-2.5 text-[13px] text-accent-900">
          Yeni şifreni belirle; bir sonraki girişte bu şifreyi kullanacaksın.
        </p>
      ) : null}
      {error ? <FormAlert>{error}</FormAlert> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Yeni şifre" htmlFor="pw-new" error={errors.password?.message} hint="En az 8 karakter">
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password || undefined}
            className="tracking-[0.1em]"
            {...register("password")}
          />
        </Field>
        <Field label="Yeni şifre (tekrar)" htmlFor="pw-confirm" error={errors.confirm?.message}>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirm || undefined}
            className="tracking-[0.1em]"
            {...register("confirm")}
          />
        </Field>
      </div>
      <Button type="submit" variant="primary" loading={pending} className="w-max">
        Şifreyi güncelle
      </Button>
    </form>
  );
}
