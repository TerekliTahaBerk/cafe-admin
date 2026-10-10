"use client";

import { forwardRef, useEffect, useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, LogOut } from "lucide-react";
import { toast } from "sonner";

import { saveSettings } from "@/app/admin/actions/settings";
import { PageHeader } from "@/components/admin/page-header";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { Adorned, Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { SwitchTrack } from "@/components/ui/switch";
import { DAYS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { checkImageFile, prepareLogo, type PreparedImage } from "@/lib/image-client";
import type { SiteSettings } from "@/lib/types";
import { settingsSchema, type SettingsValues } from "@/lib/validation";
import { PasswordForm } from "./password-form";

function toValues(s: SiteSettings): SettingsValues {
  const hours = DAYS.map((_, day) => {
    const h = s.opening_hours.find((x) => x.day === day);
    return h ?? { day, open: day !== 0, from: day >= 5 ? "09:00" : "08:00", to: day >= 5 ? "23:00" : "22:00" };
  });
  return {
    cafe_name: s.cafe_name,
    tagline: s.tagline ?? "",
    location_label: s.location_label ?? "",
    about_text: s.about_text ?? "",
    address: s.address ?? "",
    phone: s.phone ?? "",
    instagram: s.instagram ?? "",
    wifi_password: s.wifi_password ?? "",
    map_embed_url: s.map_embed_url ?? "",
    opening_hours: hours,
  };
}

type LogoState = { kind: "keep" } | { kind: "new"; prepared: PreparedImage } | { kind: "remove" };

export function SettingsView({ settings, logoUrl }: { settings: SiteSettings; logoUrl: string | null }) {
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string>();
  const [logo, setLogo] = useState<LogoState>({ kind: "keep" });
  const [logoError, setLogoError] = useState<string>();
  const logoInput = useRef<HTMLInputElement>(null);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toValues(settings),
  });
  const { register, control, handleSubmit, formState, reset, setError } = form;
  const { fields } = useFieldArray({ control, name: "opening_hours" });
  const errors = formState.errors;
  const dirty = formState.isDirty || logo.kind !== "keep";
  const cafeName = useWatch({ control, name: "cafe_name" });

  useEffect(() => {
    const url = logo.kind === "new" ? logo.prepared.previewUrl : null;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [logo]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function pickLogo(file: File | undefined) {
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) return setLogoError(problem);
    try {
      const prepared = await prepareLogo(file);
      setLogoError(undefined);
      setLogo({ kind: "new", prepared });
    } catch {
      setLogoError(`${file.name} okunamadı.`);
    }
  }

  const onSubmit = handleSubmit(
    (values) => {
      setSummary(undefined);
      const fd = new FormData();
      fd.set("data", JSON.stringify(values));
      if (logo.kind === "new") fd.set("logo", logo.prepared.file);
      if (logo.kind === "remove") fd.set("removeLogo", "1");
      startTransition(async () => {
        const res = await saveSettings(fd);
        if (!res.ok) {
          setSummary(res.error);
          Object.entries(res.fieldErrors ?? {}).forEach(([k, message]) => {
            if (k === "logo") setLogoError(message);
            else setError(k as keyof SettingsValues, { message });
          });
          return;
        }
        reset(toValues(res.data));
        setLogo({ kind: "keep" });
        toast.success("Ayarlar kaydedildi.");
      });
    },
    (errs) => setSummary(`Kaydetmeden önce ${Object.keys(errs).length} alanı düzeltmen gerekiyor.`),
  );

  const logoPreview = logo.kind === "new" ? logo.prepared.previewUrl : logo.kind === "remove" ? null : logoUrl;
  const h3 = "border-b border-divider pb-2 text-[22px]";

  return (
    <div className="admin-page admin-settings flex flex-col gap-6 px-5 pt-[18px] pb-8 md:px-10 md:py-8">
      <form id="settings-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <PageHeader
          kicker="Kafe"
          title="Ayarlar"
          actions={
            <div className="flex items-center gap-4">
              {dirty ? (
                <span className="hidden text-[13px] text-neutral-700 md:inline" role="status">
                  Kaydedilmemiş değişiklik var
                </span>
              ) : null}
              <Button type="submit" variant="filled" loading={pending} disabled={!dirty && !pending} className="hidden px-[22px] md:inline-flex">
                Değişiklikleri kaydet
              </Button>
            </div>
          }
        />

        {summary ? <FormAlert>{summary}</FormAlert> : null}

        <div className="grid items-start gap-x-12 gap-y-7 lg:grid-cols-2">
          <div className="admin-card flex flex-col gap-3.5">
            <h2 className={h3}>Kafe bilgileri</h2>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <span className="relative grid size-[72px] flex-none place-items-center overflow-hidden rounded-full border border-accent">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                  <img src={logoPreview} alt="Logo önizlemesi" className="size-full object-contain p-2" />
                </span>
              ) : (
                <BrandMark name={cafeName || "K"} size={72} />
              )}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => logoInput.current?.click()}>
                    Logo yükle
                  </Button>
                  {logoPreview ? (
                    <Button variant="plain" size="sm" onClick={() => setLogo({ kind: "remove" })} className="text-neutral-700">
                      Kaldır
                    </Button>
                  ) : null}
                </div>
                <span className="text-[12px] text-neutral-700">Kare PNG ya da WebP, şeffaf zemin</span>
                {logoError ? (
                  <span role="alert" className="text-[12px] text-danger">
                    {logoError}
                  </span>
                ) : null}
              </div>
              <input
                ref={logoInput}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  void pickLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <Field label="Kafe adı" htmlFor="s-name" error={errors.cafe_name?.message}>
              <Input id="s-name" aria-invalid={!!errors.cafe_name || undefined} {...register("cafe_name")} />
            </Field>
            <Field label="Menü karşılama metni" htmlFor="s-tagline" error={errors.tagline?.message}>
              <Input id="s-tagline" {...register("tagline")} />
            </Field>
            <Field
              label="Menüde adın altındaki satır"
              htmlFor="s-location"
              hint="Örn. “Mahalle kafesi · Moda”"
              error={errors.location_label?.message}
            >
              <Input id="s-location" {...register("location_label")} />
            </Field>
            <Field label="Wi‑Fi şifresi" htmlFor="s-wifi" hint="Menüde görünür; boş bırakırsan gizlenir." error={errors.wifi_password?.message}>
              <Input id="s-wifi" autoComplete="off" className="font-mono text-[14px]" {...register("wifi_password")} />
            </Field>
            <Field label="Hakkımızda metni" htmlFor="s-about" hint="Ana sayfadaki “Komşu gibi bir kafe” bölümü." error={errors.about_text?.message}>
              <Textarea id="s-about" rows={5} {...register("about_text")} />
            </Field>

            <h2 className={cn(h3, "mt-3.5")}>İletişim</h2>
            <Field label="Adres" htmlFor="s-address" error={errors.address?.message}>
              <Input id="s-address" autoComplete="street-address" {...register("address")} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Telefon" htmlFor="s-phone" error={errors.phone?.message}>
                <Input id="s-phone" type="tel" inputMode="tel" className="tnum" aria-invalid={!!errors.phone || undefined} {...register("phone")} />
              </Field>
              <Field label="Instagram" htmlFor="s-ig" error={errors.instagram?.message}>
                <Adorned prefix="@" invalid={!!errors.instagram}>
                  <input
                    id="s-ig"
                    autoComplete="off"
                    aria-invalid={!!errors.instagram || undefined}
                    className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none md:text-[15px]"
                    {...register("instagram")}
                  />
                </Adorned>
              </Field>
            </div>
            <Field
              label="Harita yerleştirme bağlantısı"
              htmlFor="s-map"
              hint="Google Haritalar → Paylaş → Harita yerleştir → src bağlantısı."
              error={errors.map_embed_url?.message}
            >
              <Input
                id="s-map"
                inputMode="url"
                placeholder="https://www.google.com/maps/embed?pb=…"
                aria-invalid={!!errors.map_embed_url || undefined}
                className="font-mono text-[13px]"
                {...register("map_embed_url")}
              />
            </Field>
          </div>

          <div className="admin-card flex flex-col gap-3.5">
            <h2 className={h3}>Çalışma saatleri</h2>
            <ul className="flex flex-col">
              {fields.map((f, i) => (
                <Controller
                  key={f.id}
                  control={control}
                  name={`opening_hours.${i}.open`}
                  render={({ field }) => {
                    const dayError = errors.opening_hours?.[i]?.to?.message ?? errors.opening_hours?.[i]?.from?.message;
                    return (
                      <li className="flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-1 border-b border-divider py-1.5">
                        <span className="w-[86px] text-[14px] sm:w-[100px]">{DAYS[f.day]}</span>
                        {field.value ? (
                          <>
                            <TimeInput
                              label={`${DAYS[f.day]} açılış`}
                              {...register(`opening_hours.${i}.from`, { setValueAs: normalizeTime })}
                            />
                            <span className="text-neutral-600" aria-hidden>
                              –
                            </span>
                            <TimeInput
                              label={`${DAYS[f.day]} kapanış`}
                              invalid={!!dayError}
                              {...register(`opening_hours.${i}.to`, { setValueAs: normalizeTime })}
                            />
                          </>
                        ) : (
                          <span className="text-[14px] text-neutral-700 italic">Kapalı</span>
                        )}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          aria-label={`${DAYS[f.day]} açık`}
                          onClick={() => field.onChange(!field.value)}
                          className="ml-auto flex h-11 cursor-pointer items-center gap-2.5 rounded-md pl-1.5"
                        >
                          <span className={cn("text-[12px]", field.value ? "text-accent-800" : "text-neutral-800")}>
                            {field.value ? "Açık" : "Kapalı"}
                          </span>
                          <SwitchTrack checked={field.value} size="sm" />
                        </button>
                        {dayError ? <span className="w-full text-[12px] text-danger">{dayError}</span> : null}
                      </li>
                    );
                  }}
                />
              ))}
            </ul>
          </div>
        </div>
      </form>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <div className="hidden lg:block" />
        <PasswordForm />
      </div>

      <div className="flex flex-col gap-1 border-t border-divider pt-4 md:hidden">
        <a href="/menu" target="_blank" rel="noopener" className="flex h-11 items-center gap-1.5 text-[14px] text-accent-700 no-underline">
          Menüyü önizle <ArrowUpRight size={15} aria-hidden />
        </a>
        <form action="/admin/logout" method="post">
          <button type="submit" className="flex h-11 cursor-pointer items-center gap-2 text-[14px] text-neutral-800">
            <LogOut size={16} strokeWidth={1.75} aria-hidden /> Çıkış yap
          </button>
        </form>
      </div>

      {/* Mobile save bar, above the tab bar */}
      {dirty ? (
        <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 flex items-center gap-3 border-t border-divider bg-bg px-5 py-3 md:hidden">
          <span className="flex-1 text-[13px] text-neutral-700" role="status">
            Kaydedilmemiş değişiklik var
          </span>
          <Button type="submit" form="settings-form" variant="filled" loading={pending}>
            Kaydet
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** "8" → "08:00", "830" → "08:30", "8.30" → "08:30". Anything else is left for zod to reject. */
function normalizeTime(value: string) {
  const v = String(value ?? "").trim().replace(/[.,]/g, ":");
  const digits = v.replace(/\D/g, "");
  if (/^\d{1,2}:\d{2}$/.test(v)) return v.padStart(5, "0");
  if (/^\d{1,2}$/.test(digits) && !v.includes(":")) return `${digits.padStart(2, "0")}:00`;
  if (/^\d{3,4}$/.test(digits) && !v.includes(":")) {
    const p = digits.padStart(4, "0");
    return `${p.slice(0, 2)}:${p.slice(2)}`;
  }
  return v;
}

/** 24-hour "SS:DD" field; native time inputs show AM/PM in some locales. */
const TimeInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; invalid?: boolean }
>(function TimeInput({ label, invalid, onBlur, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={5}
      placeholder="08:00"
      aria-label={label}
      aria-invalid={invalid || undefined}
      onBlur={(e) => {
        e.target.value = normalizeTime(e.target.value);
        onBlur?.(e);
      }}
      className="tnum h-[38px] w-[84px] rounded-md border border-divider bg-transparent text-center text-[16px] focus-visible:border-accent focus-visible:outline-offset-0 aria-invalid:border-[1.5px] aria-invalid:border-danger-line md:text-[14px]"
      {...props}
    />
  );
});
