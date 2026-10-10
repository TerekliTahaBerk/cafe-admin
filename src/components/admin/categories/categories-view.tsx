"use client";

import { useId, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
} from "@/app/admin/actions/categories";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { MenuButton } from "@/components/ui/menu-button";
import { cn } from "@/lib/cn";
import type { CategoryWithCount } from "@/lib/admin-data";

export function CategoriesView({ initial }: { initial: CategoryWithCount[] }) {
  const [items, setItems] = useState(initial);
  const [synced, setSynced] = useState(initial);
  if (initial !== synced) {
    setSynced(initial);
    setItems(initial);
  }

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CategoryWithCount | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [deleting, startDelete] = useTransition();
  // Stable id so server and client render the same aria-describedby.
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nameOf = (id: string | number) => items.find((c) => c.id === id)?.name ?? "";
  const positionOf = (id: string | number) => items.findIndex((c) => c.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${nameOf(active.id)} tutuldu. Konum ${positionOf(active.id)} / ${items.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)}, ${positionOf(over.id)}. sıraya taşındı.` : `${nameOf(active.id)} liste dışında.`,
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(active.id)} ${positionOf(over.id)}. sıraya bırakıldı.` : `${nameOf(active.id)} bırakıldı.`,
    onDragCancel: ({ active }) => `Taşıma iptal edildi. ${nameOf(active.id)} yerinde kaldı.`,
  };

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    setEditingId(null);
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const before = items;
    const next = arrayMove(
      items,
      items.findIndex((c) => c.id === active.id),
      items.findIndex((c) => c.id === over.id),
    );
    setItems(next);
    const res = await reorderCategories(next.map((c) => c.id));
    if (!res.ok) {
      setItems(before);
      toast.error(`Sıralama kaydedilemedi. ${res.error}`);
    } else {
      toast.success("Kategori sırası kaydedildi.", { id: "category-order" });
    }
  }

  async function add(name: string) {
    const res = await createCategory(name);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setItems((list) => [...list, { ...res.data, product_count: 0 }]);
    toast.success(`“${res.data.name}” eklendi.`);
    return true;
  }

  async function rename(id: string, name: string, nameEn: string, nameDe: string) {
    const prev = items.find((c) => c.id === id);
    if (!prev || (prev.name === name.trim() && (prev.name_en ?? "") === nameEn.trim() && (prev.name_de ?? "") === nameDe.trim())) {
      setEditingId(null);
      return true;
    }
    const res = await renameCategory(id, name, nameEn, nameDe);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setItems((list) => list.map((c) => (c.id === id ? { ...c, name: name.trim(), name_en: nameEn.trim() || null, name_de: nameDe.trim() || null } : c)));
    setEditingId(null);
    toast.success("Kategori adı güncellendi.");
    return true;
  }

  function openDelete(c: CategoryWithCount) {
    setToDelete(c);
    setMoveTo(items.find((x) => x.id !== c.id)?.id ?? "");
  }

  function confirmDelete() {
    const target = toDelete;
    if (!target) return;
    startDelete(async () => {
      const res = await deleteCategory(target.id, target.product_count > 0 ? moveTo : null);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setItems((list) =>
        list
          .filter((c) => c.id !== target.id)
          .map((c) => (c.id === moveTo ? { ...c, product_count: c.product_count + res.data.moved } : c)),
      );
      setToDelete(null);
      toast.success(
        res.data.moved
          ? `“${target.name}” silindi, ${res.data.moved} ürün taşındı.`
          : `“${target.name}” silindi.`,
      );
    });
  }

  const active = items.find((c) => c.id === activeId);
  const others = toDelete ? items.filter((c) => c.id !== toDelete.id) : [];

  return (
    <div className="admin-page admin-categories flex flex-col gap-3.5 px-5 pt-[18px] md:gap-6 md:px-10 md:py-8">
      <div>
        <PageHeader kicker="Menü yönetimi" title="Kategoriler" />
        <p className="text-[13px] text-neutral-700 md:hidden">Sıralamak için tutamaçtan sürükle</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <div className="flex flex-col">
          <AddCategory onAdd={add} />

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-400 px-6 py-12 text-center">
              <h2 className="text-[24px] font-normal">Henüz kategori yok</h2>
              <p className="mt-2 text-[14px] text-neutral-700">
                “Sıcak İçecekler” gibi bir kategoriyle başla; ürünleri sonra eklersin.
              </p>
            </div>
          ) : (
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={() => setActiveId(null)}
              accessibility={{
                announcements,
                screenReaderInstructions: {
                  draggable:
                    "Taşımak için Boşluk tuşuna bas, ok tuşlarıyla yerini değiştir, bırakmak için tekrar Boşluk, vazgeçmek için Esc.",
                },
              }}
            >
              <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <ol className="border-t border-divider">
                  {items.map((c, i) => (
                    <SortableRow
                      key={c.id}
                      category={c}
                      index={i}
                      editing={editingId === c.id}
                      onEdit={() => setEditingId(c.id)}
                      onCancelEdit={() => setEditingId(null)}
                      onRename={(name, en, de) => rename(c.id, name, en, de)}
                      onDelete={() => openDelete(c)}
                    />
                  ))}
                </ol>
              </SortableContext>
              <DragOverlay>
                {active ? (
                  <div className="flex h-16 -rotate-[0.6deg] items-center gap-3.5 rounded-md border border-accent bg-bg px-2 shadow-lg">
                    <span className="grid h-11 w-7 place-items-center text-accent-700">
                      <GripVertical size={16} aria-hidden />
                    </span>
                    <span className="tnum w-[22px] text-[12px] text-neutral-600">
                      {String(items.indexOf(active) + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-heading text-[19px] font-semibold">{active.name}</span>
                    <span className="pr-4 text-[13px] text-neutral-700">{active.product_count} ürün</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <aside className="hidden flex-col gap-2.5 rounded-lg border border-divider p-5 lg:flex">
          <span className="kicker">İpucu</span>
          <p className="text-[14px] leading-[1.55]">
            Menüdeki sırayı buradan belirlersin. Tutamaçtan tutup sürükle; müşteri menüsü anında güncellenir.
          </p>
          <p className="text-[13px] leading-[1.55] text-neutral-700">
            Klavyeyle: tutamaca odaklan, Boşluk ile tut, ok tuşlarıyla taşı.
          </p>
        </aside>
      </div>

      {toDelete && toDelete.product_count > 0 ? (
        <ConfirmDialog
          open
          icon="warning"
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
          loading={deleting}
          confirmDisabled={!moveTo}
          confirmLabel="Taşı ve sil"
          title={`“${toDelete.name}” içinde ${toDelete.product_count} ürün var`}
        >
          <p>Kategoriyi silmeden önce bu ürünleri başka bir kategoriye taşıman gerekiyor. Ürünler silinmez.</p>
          {others.length ? (
            <Field label="Ürünleri şuraya taşı" htmlFor="move-to">
              <Select id="move-to" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="bg-bg">
                {others.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <p className="text-danger">Önce taşınacak başka bir kategori oluştur.</p>
          )}
        </ConfirmDialog>
      ) : (
        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
          loading={deleting}
          title={toDelete ? `“${toDelete.name}” silinsin mi?` : ""}
        >
          <p>Kategori boş; menüden kaldırılır.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

function SortableRow({
  category,
  index,
  editing,
  onEdit,
  onCancelEdit,
  onRename,
  onDelete,
}: {
  category: CategoryWithCount;
  index: number;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onRename: (name: string, en: string, de: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id, disabled: editing });
  const no = String(index + 1).padStart(2, "0");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative flex h-[60px] items-center gap-2.5 border-b border-divider md:h-16 md:gap-3.5 md:px-2",
        isDragging && "bg-accent-100/60 before:absolute before:inset-x-0 before:-top-px before:h-[3px] before:bg-accent",
        editing && "bg-accent-100 h-auto md:h-auto py-4",
      )}
    >
      {editing ? (
        <RenameRow no={no} initial={category} onSave={onRename} onCancel={onCancelEdit} />
      ) : (
        <>
          <button
            ref={setActivatorNodeRef}
            type="button"
            aria-label={`${category.name} kategorisini taşı`}
            className={cn(
              "grid h-11 w-9 flex-none cursor-grab touch-none place-items-center rounded-md text-neutral-600 hover:bg-text/7 active:cursor-grabbing md:w-7",
              isDragging && "opacity-0",
            )}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} aria-hidden />
          </button>
          <span className={cn("tnum hidden w-[22px] text-[12px] text-neutral-600 md:inline", isDragging && "opacity-0")}>
            {no}
          </span>
          <span className={cn("min-w-0 flex-1 truncate font-heading text-[18px] font-semibold md:text-[19px]", isDragging && "opacity-0")}>
            {category.name}
          </span>
          <span className={cn("tnum text-[12px] text-neutral-700 md:text-[13px]", isDragging && "opacity-0")}>
            {category.product_count}
            <span className="hidden md:inline"> ürün</span>
          </span>
          <div className={cn("hidden md:flex", isDragging && "opacity-0")}>
            <button
              type="button"
              aria-label={`${category.name} yeniden adlandır`}
              onClick={onEdit}
              className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-accent/10"
            >
              <Pencil size={17} strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`${category.name} sil`}
              onClick={onDelete}
              className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-accent/10"
            >
              <Trash size={17} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <MenuButton
            className="md:hidden"
            label={`${category.name} işlemleri`}
            items={[
              { label: "Yeniden adlandır", onSelect: onEdit, icon: <Pencil size={16} aria-hidden /> },
              { label: "Sil", onSelect: onDelete, danger: true, icon: <Trash size={16} aria-hidden /> },
            ]}
          />
        </>
      )}
    </li>
  );
}

function RenameRow({
  no,
  initial,
  onSave,
  onCancel,
}: {
  no: string;
  initial: CategoryWithCount;
  onSave: (name: string, en: string, de: string) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial.name);
  const [en, setEn] = useState(initial.name_en ?? "");
  const [de, setDe] = useState(initial.name_de ?? "");
  const [pending, start] = useTransition();
  const id = useId();
  const submit = () => start(async () => void (await onSave(value, en, de)));

  return (
    <form
      className="flex flex-1 flex-wrap items-center gap-2 md:gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <span className="hidden w-7 md:block" />
      <span className="tnum hidden w-[22px] text-[12px] text-neutral-600 md:inline">{no}</span>
      <label htmlFor={id} className="sr-only">
        Kategori adı
      </label>
      <input
        id={id}
        autoFocus
        value={value}
        maxLength={40}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        className="h-11 min-w-0 flex-1 rounded-md border border-accent bg-bg px-3 font-heading text-[18px] font-semibold outline-none focus-visible:outline-[3px] focus-visible:outline-accent-100 md:text-[19px]"
      />
      <label className="flex w-full items-center gap-3 text-[12px]">English<Input value={en} maxLength={40} lang="en" onChange={(e) => setEn(e.target.value)} /></label>
      <label className="flex w-full items-center gap-3 text-[12px]">Deutsch<Input value={de} maxLength={40} lang="de" onChange={(e) => setDe(e.target.value)} /></label>
      <Button type="submit" variant="primary" size="sm" loading={pending}>
        Kaydet
      </Button>
      <Button variant="plain" size="sm" onClick={onCancel} className="px-2.5">
        Vazgeç
      </Button>
    </form>
  );
}

function AddCategory({ onAdd }: { onAdd: (name: string) => Promise<boolean> }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () =>
    start(async () => {
      if (await onAdd(value)) {
        setValue("");
        inputRef.current?.focus();
      }
    });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn("order-last mt-2 gap-2.5 pb-0 md:order-none md:mt-0 md:flex md:pb-[18px]", open ? "flex" : "hidden")}
      >
        <label htmlFor="new-category" className="sr-only">
          Yeni kategori adı
        </label>
        <Input
          ref={inputRef}
          id="new-category"
          value={value}
          maxLength={40}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Yeni kategori adı, örn. “Kahvaltılık”"
          className="flex-1 md:text-[14px]"
        />
        <Button type="submit" variant="primary" loading={pending} disabled={!value.trim()} className="h-12 md:h-11">
          <Plus size={16} strokeWidth={2} aria-hidden /> Ekle
        </Button>
      </form>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="order-last mt-2 flex h-14 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-accent font-heading text-[16px] font-semibold text-accent-700 hover:bg-accent/10 md:hidden"
        >
          <Plus size={16} strokeWidth={2} aria-hidden /> Kategori ekle
        </button>
      ) : null}
    </>
  );
}
