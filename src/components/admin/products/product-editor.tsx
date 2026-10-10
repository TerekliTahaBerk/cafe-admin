"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { saveProduct } from "@/app/admin/actions/products";
import { Button } from "@/components/ui/button";
import { Adorned, Checkbox, Field, FormAlert, Input, Select, Textarea } from "@/components/ui/field";
import { Overlay } from "@/components/ui/overlay";
import { SwitchTrack } from "@/components/ui/switch";
import { ALLERGENS, DESCRIPTION_MAX, TAGS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { publicImageUrl } from "@/lib/env";
import { accusative } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { productSchema, type ProductFormValues } from "@/lib/validation";
import { LOCALES, type Locale } from "@/lib/i18n";
import { ImageField, type ImageState } from "./image-field";

export type EditorTarget = { mode: "new" } | { mode: "edit"; product: Product };

function defaults(target: EditorTarget, categories: Category[]): ProductFormValues {
  if (target.mode === "edit") {
    const p = target.product;
    return {
      name: p.name,
      name_en: p.name_en ?? "",
      name_de: p.name_de ?? "",
      description_en: p.description_en ?? "",
      description_de: p.description_de ?? "",
      description: p.description ?? "",
      price: String(p.price).replace(".", ","),
      category_id: p.category_id,
      tags: p.tags.filter((t) => TAGS.some((x) => x.key === t)) as ProductFormValues["tags"],
      allergens: p.allergens.filter((a) => ALLERGENS.some((x) => x.key === a)) as ProductFormValues["allergens"],
      in_stock: p.in_stock,
      is_visible: p.is_visible,
      is_featured: p.is_featured,
    };
  }
  return {
    name: "",
    name_en: "",
    name_de: "",
    description_en: "",
    description_de: "",
    description: "",
    price: "",
    category_id: categories[0]?.id ?? "",
    tags: [],
    allergens: [],
    in_stock: true,
    is_visible: true,
    is_featured: false,
  };
}

export function ProductEditor({
  target,
  categories,
  onClose,
  onSaved,
  onDelete,
}: {
  target: EditorTarget | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product, isNew: boolean) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <Overlay open={!!target} onClose={onClose} variant="drawer" labelledBy="editor-title">
      {target ? (
        <EditorForm
          key={target.mode === "edit" ? target.product.id : "new"}
          target={target}
          categories={categories}
          onClose={onClose}
          onSaved={onSaved}
          onDelete={onDelete}
        />
      ) : null}
    </Overlay>
  );
}

function EditorForm({
  target,
  categories,
  onClose,
  onSaved,
  onDelete,
}: {
  target: EditorTarget;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product, isNew: boolean) => void;
  onDelete: (product: Product) => void;
}) {
  const formId = useId();
  const [pending, startTransition] = useTransition();
  const [language, setLanguage] = useState<Locale>("tr");
  const [summary, setSummary] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  const [image, setImage] = useState<ImageState>(() =>
    target.mode === "edit"
      ? { kind: "existing", url: publicImageUrl(target.product.image_path) }
      : { kind: "existing", url: null },
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaults(target, categories),
  });
  const { register, control, handleSubmit, formState, setError } = form;
  const errors = formState.errors;
  const translatedNames = { tr: "name", en: "name_en", de: "name_de" } as const;
  const translatedDescriptions = { tr: "description", en: "description_en", de: "description_de" } as const;
  const description = useWatch({ control, name: translatedDescriptions[language] }) ?? "";
  const categoryId = useWatch({ control, name: "category_id" });
  const isNew = target.mode === "new";

  // Revoke blob previews when they are replaced or the editor closes.
  useEffect(() => {
    const url = image.kind === "new" ? image.prepared.previewUrl : null;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [image]);

  const title = isNew ? "Yeni ürün" : `${accusative(target.product.name)} düzenle`;
  const kicker = categories.find((c) => c.id === categoryId)?.name ?? "Ürün";

  const onInvalid = (errs: typeof errors) => {
    const firstInvalidLanguage = LOCALES.find((l) => errs[translatedNames[l]] || errs[translatedDescriptions[l]]);
    if (firstInvalidLanguage) setLanguage(firstInvalidLanguage);
    const n = Object.keys(errs).length + (imageError ? 1 : 0);
    setSummary(`Kaydetmeden önce ${n} alanı düzeltmen gerekiyor.`);
  };

  const onSubmit = handleSubmit((values) => {
    if (imageError) {
      setSummary("Kaydetmeden önce 1 alanı düzeltmen gerekiyor.");
      return;
    }
    setSummary(undefined);
    const fd = new FormData();
    fd.set("data", JSON.stringify(values));
    if (!isNew) fd.set("id", target.product.id);
    if (image.kind === "new") fd.set("image", image.prepared.file);
    if (image.kind === "removed") fd.set("removeImage", "1");

    startTransition(async () => {
      const res = await saveProduct(fd);
      if (!res.ok) {
        setSummary(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([key, message]) => {
          if (key === "image") setImageError(message);
          else setError(key as keyof ProductFormValues, { message });
        });
        return;
      }
      onSaved(res.data, isNew);
      toast.success(isNew ? `“${res.data.name}” menüye eklendi.` : "Ürün kaydedildi.");
    });
  }, onInvalid);

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="flex h-full min-h-0 flex-col">
      {/* Mobile header: İptal · title · Kaydet */}
      <div className="flex h-[60px] flex-none items-center border-b border-divider px-2 md:hidden">
        <Button variant="plain" onClick={onClose}>
          İptal
        </Button>
        <h2 id="editor-title" className="flex-1 truncate text-center text-[18px]">
          {isNew ? "Yeni ürün" : "Ürünü düzenle"}
        </h2>
        <Button type="submit" variant="ghost" className="px-3" loading={pending}>
          Kaydet
        </Button>
      </div>

      {/* Desktop header */}
      <div className="hidden flex-none items-center gap-3 border-b border-divider px-7 py-[22px] md:flex">
        <div className="min-w-0 flex-1">
          <span className="kicker">{kicker}</span>
          <h2 className="truncate text-[28px] font-normal" aria-hidden>
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-divider hover:bg-text/7"
        >
          <X size={17} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-[18px] md:gap-[18px] md:px-7 md:py-[22px]">
        {summary ? <FormAlert>{summary}</FormAlert> : null}

        <ImageField value={image} onChange={setImage} error={imageError} onError={setImageError} />

        <div role="tablist" aria-label="Ürün dili" className="flex gap-2 border-b border-divider pb-2">
          {LOCALES.map((l, i) => <button key={l} id={`product-tab-${l}`} type="button" role="tab" aria-selected={language === l} aria-controls={`product-panel-${l}`} tabIndex={language === l ? 0 : -1} onClick={() => setLanguage(l)} onKeyDown={(e) => {
            const next = e.key === 'ArrowRight' ? LOCALES[(i + 1) % 3] : e.key === 'ArrowLeft' ? LOCALES[(i + 2) % 3] : e.key === 'Home' ? 'tr' : e.key === 'End' ? 'de' : null;
            if (next) { e.preventDefault(); setLanguage(next); document.getElementById(`product-tab-${next}`)?.focus(); }
          }} className={cn("min-h-11 rounded-full px-4 text-[13px]", language === l ? "bg-accent-800 text-surface" : "hover:bg-text/5")}>
            {{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[l]}{(errors[translatedNames[l]] || errors[translatedDescriptions[l]]) ? ' •' : ''}
          </button>)}
        </div>
        <p className="text-[12px] text-neutral-700">Ürün adı ve açıklama her dil için ayrıdır. Boş çevirilerde Türkçe metin gösterilir. Fiyat, fotoğraf ve aşağıdaki seçimler tüm dillerde ortaktır.</p>
        {LOCALES.map((l) => <div key={l} id={`product-panel-${l}`} role="tabpanel" aria-labelledby={`product-tab-${l}`} hidden={language !== l} className={cn("flex flex-col gap-4", language !== l && "hidden")}>
          <Field label={`Ürün adı · ${{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[l]}`} htmlFor={`p-name-${l}`} error={errors[translatedNames[l]]?.message}>
            <Input id={`p-name-${l}`} lang={l} autoComplete="off" aria-invalid={!!errors[translatedNames[l]] || undefined} {...register(translatedNames[l])} />
          </Field>
          <Field label={`Kısa açıklama · ${{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[l]}`} htmlFor={`p-desc-${l}`} error={errors[translatedDescriptions[l]]?.message} aside={language === l ? <span className={cn("tnum", description.length > DESCRIPTION_MAX ? "text-danger" : "text-neutral-700")}>{description.length}/{DESCRIPTION_MAX}</span> : null}>
            <Textarea id={`p-desc-${l}`} lang={l} rows={3} maxLength={DESCRIPTION_MAX + 20} aria-invalid={!!errors[translatedDescriptions[l]] || undefined} {...register(translatedDescriptions[l])} />
          </Field>
        </div>)}

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-3.5">
          <Field label="Fiyat" htmlFor="p-price" error={errors.price?.message}>
            <Adorned prefix="₺" invalid={!!errors.price}>
              <input
                id="p-price"
                inputMode="decimal"
                autoComplete="off"
                placeholder="150"
                aria-invalid={!!errors.price || undefined}
                className="tnum h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none md:text-[15px]"
                {...register("price")}
              />
            </Adorned>
          </Field>
          <Field label="Kategori" htmlFor="p-cat" error={errors.category_id?.message}>
            <Select id="p-cat" aria-invalid={!!errors.category_id || undefined} {...register("category_id")}>
              {categories.length === 0 ? <option value="">Önce kategori ekle</option> : null}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[12px] text-neutral-800">Etiketler</legend>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => {
                  const on = field.value.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        field.onChange(on ? field.value.filter((k) => k !== t.key) : [...field.value, t.key])
                      }
                      className={cn(
                        "flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors md:h-9",
                        on
                          ? "border-accent bg-accent-100 text-accent-800"
                          : "border-divider hover:bg-text/5",
                      )}
                    >
                      {on ? <Check size={13} strokeWidth={2.25} aria-hidden /> : null}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="allergens"
          render={({ field }) => (
            <fieldset className="flex flex-col">
              <legend className="mb-2 text-[12px] text-neutral-800">Alerjenler</legend>
              <div className="grid grid-cols-2 gap-x-3 md:grid-cols-3 md:gap-y-1.5">
                {ALLERGENS.map((a) => (
                  <Checkbox
                    key={a.key}
                    checked={field.value.includes(a.key)}
                    onChange={(on) =>
                      field.onChange(on ? [...field.value, a.key] : field.value.filter((k) => k !== a.key))
                    }
                    label={a.label}
                  />
                ))}
              </div>
            </fieldset>
          )}
        />

        <div className="flex flex-col border-t border-divider">
          <ToggleRow
            control={control}
            name="in_stock"
            label="Stok durumu"
            help="Tükendiğinde menüde soluk görünür, gizlenmez."
            on="Stokta"
            off="Tükendi"
          />
          <ToggleRow
            control={control}
            name="is_visible"
            label="Menüde göster"
            help="Kapalıyken müşteriler bu ürünü hiç görmez."
            on="Açık"
            off="Kapalı"
          />
          <ToggleRow
            control={control}
            name="is_featured"
            label="Öne çıkar"
            help="Ana sayfadaki “Mahallenin favorileri” bölümünde gösterilir."
            on="Evet"
            off="Hayır"
            last
          />
        </div>

        {!isNew ? (
          <Button
            variant="plain"
            className="h-12 text-danger hover:bg-danger-hover md:hidden"
            onClick={() => onDelete(target.product)}
          >
            Ürünü sil
          </Button>
        ) : null}
      </div>

      <div className="hidden flex-none justify-end gap-2.5 border-t border-divider px-7 py-4 md:flex">
        <Button variant="secondary" onClick={onClose} className="px-5">
          İptal
        </Button>
        <Button type="submit" variant="filled" loading={pending} className="px-6">
          Kaydet
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  control,
  name,
  label,
  help,
  on,
  off,
  last,
}: {
  control: ReturnType<typeof useForm<ProductFormValues>>["control"];
  name: "in_stock" | "is_visible" | "is_featured";
  label: string;
  help: string;
  on: string;
  off: string;
  last?: boolean;
}) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn("flex items-center gap-3 py-2.5", !last && "border-b border-divider")}>
          <div className="flex flex-1 flex-col">
            <span id={`${id}-l`} className="text-[15px] md:text-[14px]">
              {label}
            </span>
            <span id={`${id}-h`} className="text-[12px] text-neutral-700">
              {help}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={field.value}
            aria-labelledby={`${id}-l`}
            aria-describedby={`${id}-h`}
            onClick={() => field.onChange(!field.value)}
            className="flex h-11 cursor-pointer items-center gap-3 rounded-md pl-1.5"
          >
            <span className={cn("text-[13px]", field.value ? "text-accent-800" : "text-neutral-800")}>
              {field.value ? on : off}
            </span>
            <SwitchTrack checked={field.value} size="md" />
          </button>
        </div>
      )}
    />
  );
}
