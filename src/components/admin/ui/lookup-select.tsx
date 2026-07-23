"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";

import Dropdown from "@/components/ui/dropdown";
import type { LookupItem, LookupKind } from "@/lib/lookups";

/**
 * Pick a studio-managed value, or create one without leaving the form.
 *
 * The whole point of moving categories and locations into the database was so
 * an editor filling in a project doesn't have to abandon a half-typed form,
 * go to a settings page, add a category, and come back. Creating one here
 * POSTs it and selects it in place.
 */
export default function LookupSelect({
  kind,
  label,
  value,
  onChange,
  options,
  onOptionsChange,
  error,
  required,
}: {
  kind: LookupKind;
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: LookupItem[];
  /** Lets the parent keep the list in sync after an inline create. */
  onOptionsChange: (next: LookupItem[]) => void;
  error?: string;
  required?: boolean;
}) {
  const isLocation = kind === "locations";

  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");

  function reset() {
    setName("");
    setCity("");
    setProvince("");
    setCountry("");
  }

  async function create() {
    setBusy(true);
    try {
      const body = isLocation
        ? { city: city.trim(), province: province.trim(), country: country.trim() }
        : { name: name.trim() };

      const res = await axios.post<{ data: { id: string } }>(
        `/api/lookups/${kind}`,
        body,
      );
      const createdId = res.data.data.id;

      // Re-fetch rather than splicing the response in: the list carries usage
      // counts and a server-derived slug, and it stays sorted the same way.
      const list = await axios.get<{ data: LookupItem[] }>(
        `/api/lookups/${kind}`,
      );
      onOptionsChange(list.data.data);
      onChange(createdId);

      reset();
      setAdding(false);
      toast.success(`${label} added`);
    } catch (err) {
      toastError(err, "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = isLocation
    ? city.trim() && province.trim() && country.trim()
    : name.trim();

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="block text-xs tracking-widest uppercase text-headline">
          {label} {required && <span className="text-eyebrow">*</span>}
        </span>
        <button
          type="button"
          onClick={() => {
            reset();
            setAdding((v) => !v);
          }}
          className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-eyebrow transition-opacity hover:opacity-70 hover:cursor-pointer"
        >
          {adding ? (
            <>
              <X size={12} strokeWidth={1.5} /> Cancel
            </>
          ) : (
            <>
              <Plus size={12} strokeWidth={1.5} /> New
            </>
          )}
        </button>
      </div>

      <div className="mt-3">
        <Dropdown
          variant="field"
          ariaLabel={label}
          value={value}
          placeholder={
            options.length === 0
              ? `No ${label.toLowerCase()} yet — add one`
              : `Select ${label.toLowerCase()}`
          }
          options={options.map((o) => ({ value: o.id, label: o.label }))}
          onChange={onChange}
        />
      </div>

      {adding && (
        <div className="mt-3 border border-eyebrow/40 p-4">
          {isLocation ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <InlineInput value={city} onChange={setCity} placeholder="City" />
              <InlineInput
                value={province}
                onChange={setProvince}
                placeholder="Province"
              />
              <InlineInput
                value={country}
                onChange={setCountry}
                placeholder="Country"
              />
            </div>
          ) : (
            <InlineInput
              value={name}
              onChange={setName}
              placeholder={`New ${label.toLowerCase()}`}
            />
          )}

          <button
            type="button"
            onClick={create}
            disabled={busy || !canSubmit}
            className="mt-3 bg-eyebrow px-5 py-2 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-50"
          >
            {busy ? "Saving…" : "Add and select"}
          </button>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function InlineInput({
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
      // Enter would otherwise submit the surrounding project/article form.
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="w-full border border-eyebrow/50 bg-transparent px-3 py-2 text-sm text-headline placeholder:text-body/50 focus:border-eyebrow focus-visible:outline-none"
    />
  );
}
