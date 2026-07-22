"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

/**
 * Select-like dropdown built from a button + listbox.
 *
 * A native `<select>` can't be styled inside its popup — Chrome and Edge ignore
 * `padding` on `<option>` — so this renders its own panel to get consistent
 * spacing across browsers.
 *
 * That means re-implementing what the native control gave us for free, so it
 * follows the ARIA listbox pattern: focus stays on the trigger and the active
 * option is announced via `aria-activedescendant`, arrows move, Enter/Space
 * selects, Escape and outside clicks close.
 */
export default function Dropdown({
  value,
  options,
  onChange,
  ariaLabel,
  variant = "inline",
  placeholder,
  className = "",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  /**
   * `inline` — bare text + chevron, for filter bars.
   * `field`  — bordered box matching TextField, for forms.
   * Only the trigger differs; the option panel is identical in both.
   */
  variant?: "inline" | "field";
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matchedIndex = options.findIndex((o) => o.value === value);
  const selectedIndex = Math.max(0, matchedIndex);
  const hasSelection = matchedIndex >= 0;
  const selectedLabel = hasSelection
    ? options[selectedIndex].label
    : (placeholder ?? options[0]?.label ?? "");

  const isField = variant === "field";

  // Close on outside pointer or focus leaving the widget. Subscribing to a
  // document-level event, so setState happens in the callback — not in the
  // effect body.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted option in view when arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openAt(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openAt(selectedIndex);
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openAt(selectedIndex);
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(activeIndex);
        else openAt(selectedIndex);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false); // let focus move on naturally
        break;
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${isField ? "block" : "inline-block"} ${className}`}
    >
      <button
        type="button"
        // WAI-ARIA "select-only combobox": a plain button role would make
        // aria-activedescendant invalid, so screen readers wouldn't announce
        // the highlighted option while arrowing.
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex))}
        onKeyDown={onKeyDown}
        className={
          isField
            ? "flex w-full items-center justify-between gap-2 border border-eyebrow/50 bg-transparent px-4 py-3 text-left text-sm text-eyebrow hover:cursor-pointer focus-visible:border-eyebrow focus-visible:outline-none"
            : "flex max-w-44 items-center gap-1.5 text-xs tracking-widest uppercase text-eyebrow hover:cursor-pointer focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-eyebrow"
        }
      >
        <span className={`truncate ${!hasSelection ? "text-body/50" : ""}`}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`${isField ? "h-3.5 w-3.5" : "h-3 w-3"} shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute left-0 top-full z-30 max-h-64 overflow-y-auto border border-headline/15 bg-background-main py-1 shadow-lg ${
            isField ? "mt-1 w-full" : "mt-2 min-w-full"
          }`}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${id}-opt-${index}`}
                data-index={index}
                role="option"
                aria-selected={selected}
                onClick={() => choose(index)}
                onMouseEnter={() => setActiveIndex(index)}
                // px-4 is the whole point: the spacing a native <option> refuses.
                className={`cursor-pointer px-4 py-2 transition-colors ${
                  isField
                    ? "text-sm"
                    : "whitespace-nowrap text-xs tracking-widest uppercase"
                } ${
                  selected
                    ? "bg-eyebrow text-background-main"
                    : active
                      ? "bg-eyebrow/10 text-eyebrow"
                      : "text-body"
                }`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
