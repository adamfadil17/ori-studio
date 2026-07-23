"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";

import type { LookupItem, LookupKind } from "@/lib/lookups";

/**
 * Full CRUD for one studio-managed list, kept on a single screen: adding,
 * renaming and deleting all happen inline, because these rows are one or three
 * short fields and a separate form page per entry would be more navigation
 * than editing.
 */
export default function LookupManager({
  kind,
  title,
  description,
  initialItems,
}: {
  kind: LookupKind;
  title: string;
  description: string;
  initialItems: LookupItem[];
}) {
  const isLocation = kind === "locations";

  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    city: "",
    province: "",
    country: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({
    name: "",
    city: "",
    province: "",
    country: "",
  });

  async function refresh() {
    const res = await axios.get<{ data: LookupItem[] }>(
      `/api/lookups/${kind}`,
    );
    setItems(res.data.data);
  }

  const draftBody = isLocation
    ? {
        city: draft.city.trim(),
        province: draft.province.trim(),
        country: draft.country.trim(),
      }
    : { name: draft.name.trim() };

  const draftValid = isLocation
    ? draft.city.trim() && draft.province.trim() && draft.country.trim()
    : draft.name.trim();

  async function create() {
    setBusyId("new");
    try {
      await axios.post(`/api/lookups/${kind}`, draftBody);
      await refresh();
      setDraft({ name: "", city: "", province: "", country: "" });
      setAdding(false);
      toast.success("Added");
    } catch (err) {
      toastError(err, "Could not add");
    } finally {
      setBusyId(null);
    }
  }

  async function save(id: string) {
    setBusyId(id);
    try {
      await axios.patch(
        `/api/lookups/${kind}/${id}`,
        isLocation
          ? {
              city: edit.city.trim(),
              province: edit.province.trim(),
              country: edit.country.trim(),
            }
          : { name: edit.name.trim() },
      );
      await refresh();
      setEditingId(null);
      toast.success("Saved");
    } catch (err) {
      toastError(err, "Could not save");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: LookupItem) {
    if (!window.confirm(`Delete “${item.label}”?`)) return;
    setBusyId(item.id);
    try {
      await axios.delete(`/api/lookups/${kind}/${item.id}`);
      await refresh();
      toast.success(`“${item.label}” deleted`);
    } catch (err) {
      // The API answers with the blocking count (e.g. "still used by 3
      // projects") when the row can't be deleted.
      toastError(err, "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="border border-headline/10 bg-background-main p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs tracking-widest uppercase text-eyebrow">
            {title}
          </h2>
          <p className="mt-1 text-xs text-body">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdding((v) => !v);
          }}
          className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-eyebrow transition-opacity hover:opacity-70 hover:cursor-pointer"
        >
          {adding ? <X size={12} /> : <Plus size={12} />}
          {adding ? "Cancel" : "Add"}
        </button>
      </div>

      {adding && (
        <div className="mt-4 border border-eyebrow/40 p-3">
          {isLocation ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <Field
                value={draft.city}
                onChange={(v) => setDraft({ ...draft, city: v })}
                placeholder="City"
              />
              <Field
                value={draft.province}
                onChange={(v) => setDraft({ ...draft, province: v })}
                placeholder="Province"
              />
              <Field
                value={draft.country}
                onChange={(v) => setDraft({ ...draft, country: v })}
                placeholder="Country"
              />
            </div>
          ) : (
            <Field
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
              placeholder="Name"
            />
          )}
          <button
            type="button"
            onClick={create}
            disabled={busyId === "new" || !draftValid}
            className="mt-3 bg-eyebrow px-5 py-2 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-50"
          >
            {busyId === "new" ? "Saving…" : "Add"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-4 text-xs text-body">Nothing here yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-headline/5">
          {items.map((item) => {
            const editing = editingId === item.id;
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 py-2.5"
              >
                {editing ? (
                  <div className="flex-1">
                    {isLocation ? (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Field
                          value={edit.city}
                          onChange={(v) => setEdit({ ...edit, city: v })}
                          placeholder="City"
                        />
                        <Field
                          value={edit.province}
                          onChange={(v) => setEdit({ ...edit, province: v })}
                          placeholder="Province"
                        />
                        <Field
                          value={edit.country}
                          onChange={(v) => setEdit({ ...edit, country: v })}
                          placeholder="Country"
                        />
                      </div>
                    ) : (
                      <Field
                        value={edit.name}
                        onChange={(v) => setEdit({ ...edit, name: v })}
                        placeholder="Name"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-headline">
                      {item.label}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-body">
                      {item.usageCount === 0 ? "unused" : `${item.usageCount} in use`}
                    </span>
                  </>
                )}

                <span className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <IconButton
                        label="Save"
                        onClick={() => save(item.id)}
                        disabled={busyId === item.id}
                      >
                        <Check size={14} />
                      </IconButton>
                      <IconButton
                        label="Cancel"
                        onClick={() => setEditingId(null)}
                      >
                        <X size={14} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        label="Rename"
                        onClick={() => {
                          setEditingId(item.id);
                          setEdit({
                            name: item.label,
                            city: item.city ?? "",
                            province: item.province ?? "",
                            country: item.country ?? "",
                          });
                        }}
                      >
                        <Pencil size={14} />
                      </IconButton>
                      <IconButton
                        label="Delete"
                        danger
                        onClick={() => remove(item)}
                        disabled={busyId === item.id}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Field({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-eyebrow/50 bg-transparent px-3 py-1.5 text-sm text-headline placeholder:text-body/50 focus:border-eyebrow focus-visible:outline-none"
    />
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`p-1 transition-opacity hover:opacity-60 hover:cursor-pointer disabled:opacity-40 ${
        danger ? "text-red-800" : "text-eyebrow"
      }`}
    >
      {children}
    </button>
  );
}
