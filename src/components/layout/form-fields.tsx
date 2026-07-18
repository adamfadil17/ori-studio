import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// ------------------------------------------------------------
// SECTION LABEL — heading kecil dengan garis bawah tipis
// (mis. "CONTACT INFORMATION", "SERVICE TYPE")
// ------------------------------------------------------------

export function FieldSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b border-headline/15 pb-3 text-xs tracking-widest uppercase text-headline">
      {children}
    </p>
  );
}

// ------------------------------------------------------------
// TEXT INPUT
// ------------------------------------------------------------

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export function TextField({
  label,
  required,
  error,
  id,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-xs tracking-widest uppercase text-headline"
      >
        {label} {required && <span className="text-eyebrow">*</span>}
      </label>
      <input
        id={fieldId}
        {...props}
        className="mt-3 w-full border border-eyebrow/50 bg-transparent px-4 py-3 text-sm text-headline placeholder:text-body/50 focus:border-eyebrow focus-visible:outline-none"
      />
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}

// ------------------------------------------------------------
// TEXTAREA
// ------------------------------------------------------------

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

export function TextAreaField({
  label,
  hint,
  required,
  error,
  id,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div>
      <p className="border-b border-headline/15 pb-3 text-xs tracking-widest uppercase text-headline">
        {label}
      </p>
      {hint && <p className="mt-3 text-xs text-body">{hint}</p>}
      <textarea
        id={fieldId}
        rows={5}
        {...props}
        className="mt-3 w-full border border-eyebrow/50 bg-transparent px-4 py-3 text-sm text-headline placeholder:text-body/50 focus:border-eyebrow focus-visible:outline-none"
      />
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}

// ------------------------------------------------------------
// RADIO GROUP (opsional dengan "Other" free-text)
// ------------------------------------------------------------

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupFieldProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherPlaceholder?: string;
}

export function RadioGroupField({
  label,
  name,
  options,
  value,
  onChange,
  error,
  otherValue,
  onOtherChange,
  otherPlaceholder,
}: RadioGroupFieldProps) {
  const hasOther = options.some((opt) => opt.value === "OTHER");

  return (
    <div>
      <FieldSectionLabel>{label}</FieldSectionLabel>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 text-xs tracking-widest uppercase text-headline"
          >
            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-eyebrow/60">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span className="h-2 w-2 rounded-full bg-eyebrow opacity-0 transition-opacity peer-checked:opacity-100" />
            </span>
            {option.label}
            {option.value === "OTHER" && value === "OTHER" && onOtherChange && (
              <input
                type="text"
                value={otherValue ?? ""}
                onChange={(e) => onOtherChange(e.target.value)}
                placeholder={otherPlaceholder}
                onClick={(e) => e.stopPropagation()}
                className="ml-2 flex-1 border border-eyebrow/50 bg-transparent px-3 py-1.5 text-xs normal-case text-headline placeholder:text-body/50 focus-visible:outline-none"
              />
            )}
          </label>
        ))}
      </div>
      {hasOther && value !== "OTHER" && null}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

// ------------------------------------------------------------
// SELECT (dropdown)
// ------------------------------------------------------------

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <FieldSectionLabel>{label}</FieldSectionLabel>
      <div className="relative mt-4">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border border-eyebrow/50 bg-transparent px-4 py-3 pr-10 text-sm text-headline focus-visible:outline-none"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-headline"
        >
          <path
            d="M3 5.5L7 9.5L11 5.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}
