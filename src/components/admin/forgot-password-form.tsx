"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import type { z } from "zod";

import { requestPasswordReset } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/field";
import { forgotPasswordSchema } from "@/lib/validation";

type Values = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      setError(undefined);
      const res = await requestPasswordReset(values);
      if (res.ok) setSent(true);
      else setError(res.error);
    }),
  );

  if (sent) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <div className="flex gap-3 rounded-md border border-accent bg-accent-100 px-3.5 py-3 text-[14px] text-accent-900">
          <MailCheck size={18} strokeWidth={1.75} className="mt-0.5 flex-none" aria-hidden />
          <span>Bu adres kayıtlıysa birkaç dakika içinde bir bağlantı gelecek. Gelen kutunu ve spam klasörünü kontrol et.</span>
        </div>
        <Link href="/admin/login" className="text-[14px] text-accent-700 underline underline-offset-[3px]">
          Girişe dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field label="E-posta" htmlFor="email" error={formState.errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={!!formState.errors.email || undefined}
          className="h-[52px] px-3.5 lg:h-12"
          {...register("email")}
        />
      </Field>
      <Button type="submit" variant="filled" size="xl" loading={pending}>
        Bağlantı gönder
      </Button>
      <Link
        href="/admin/login"
        className="flex h-11 items-center justify-center text-[14px] text-accent-700 underline underline-offset-[3px]"
      >
        Girişe dön
      </Link>
    </form>
  );
}
