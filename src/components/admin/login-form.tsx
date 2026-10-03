"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { signIn } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, inputBase } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { loginSchema, type LoginValues } from "@/lib/validation";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>(notice);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const { register, handleSubmit, formState, watch, setValue } = form;
  const errors = formState.errors;
  const passwordInvalid = !!errors.password || !!serverError;

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const res = await signIn(values);
      if (!res.ok) {
        setServerError(res.error);
        setValue("password", "");
        return;
      }
      router.replace(next);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 lg:gap-[18px]">
      {serverError ? <FormAlert>{serverError}</FormAlert> : null}

      <Field label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="ornek@kafeadi.com"
          aria-invalid={!!errors.email || undefined}
          className="h-[52px] px-3.5 lg:h-12"
          {...register("email")}
        />
      </Field>

      <Field
        label="Şifre"
        htmlFor="password"
        error={errors.password?.message}
        aside={
          <Link
            href="/admin/forgot-password"
            className="hidden text-accent-700 underline underline-offset-[3px] lg:inline"
          >
            Şifremi unuttum
          </Link>
        }
      >
        <div
          aria-invalid={passwordInvalid || undefined}
          className={cn(
            inputBase,
            "flex h-[52px] items-center pr-1.5 pl-3.5 focus-within:border-accent focus-within:outline-[3px] focus-within:outline-accent-100 lg:h-12",
          )}
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={passwordInvalid || undefined}
            className="h-full min-w-0 flex-1 bg-transparent outline-none"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={showPassword}
            className="grid size-10 cursor-pointer place-items-center rounded-md text-neutral-700 hover:bg-text/7"
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.75} aria-hidden />
            ) : (
              <Eye size={18} strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
      </Field>

      <Checkbox
        checked={watch("remember")}
        onChange={(v) => setValue("remember", v)}
        label="Bu cihazda beni hatırla"
        name="remember"
      />

      <Button type="submit" variant="filled" size="xl" loading={pending} className="mt-1.5 h-[54px] lg:mt-0 lg:h-[52px]">
        Giriş Yap
      </Button>

      <Link
        href="/admin/forgot-password"
        className="flex h-11 items-center justify-center text-[14px] text-accent-700 underline underline-offset-[3px] lg:hidden"
      >
        Şifremi unuttum
      </Link>
      <p className="hidden text-center text-[12px] text-neutral-700 lg:block">
        Müşteri menüsüne mi bakıyordun?{" "}
        <Link href="/menu" className="text-accent-700 underline underline-offset-[3px]">
          Menüye git
        </Link>
      </p>
    </form>
  );
}
