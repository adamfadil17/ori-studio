"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";

import {
  FieldSectionLabel,
  NativeSelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/form-fields";
import { humanizeEnum } from "@/lib/format";
import {
  createOpenPositionSchema,
  type OpenPositionFormInput,
  type OpenPositionFormValues,
} from "@/lib/validators";
import type { EmploymentType, PositionLevel } from "@/lib/types";

const TYPES: EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME_FREELANCE",
  "CONTRACT",
  "INTERNSHIP",
];

const LEVELS: PositionLevel[] = ["ENTRY", "MID_SENIOR", "SENIOR", "ALL_LEVELS"];

export interface PositionFormInitial {
  id: string;
  title: string;
  type: EmploymentType;
  level: PositionLevel;
  description: string;
  isActive: boolean;
}

export default function PositionForm({
  initial,
}: {
  initial?: PositionFormInitial;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OpenPositionFormInput, unknown, OpenPositionFormValues>({
    resolver: zodResolver(createOpenPositionSchema),
    defaultValues: {
      title: initial?.title ?? "",
      type: initial?.type ?? "FULL_TIME",
      level: initial?.level ?? "MID_SENIOR",
      description: initial?.description ?? "",
      // New roles default to active so they show on the careers page at once.
      isActive: initial?.isActive ?? true,
    },
  });

  async function onSubmit(values: OpenPositionFormValues) {
    try {
      if (initial) {
        await axios.patch(`/api/open-positions/${initial.id}`, values);
      } else {
        await axios.post("/api/open-positions", values);
      }
      toast.success(initial ? "Position updated" : "Position created");
      router.push("/dashboard/positions");
      router.refresh();
    } catch (err) {
      toastError(err, "Could not save the position");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
      <section className="space-y-6">
        <FieldSectionLabel>Role</FieldSectionLabel>

        <TextField
          label="Title"
          required
          placeholder="e.g. Junior Architect"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <NativeSelectField
            label="Employment type"
            required
            options={TYPES.map((t) => ({ value: t, label: humanizeEnum(t) }))}
            error={errors.type?.message}
            {...register("type")}
          />
          <NativeSelectField
            label="Level"
            required
            options={LEVELS.map((l) => ({ value: l, label: humanizeEnum(l) }))}
            error={errors.level?.message}
            {...register("level")}
          />
        </div>

        <TextAreaField
          label="Description"
          hint="Shown in the position detail modal on the contact page."
          error={errors.description?.message}
          {...register("description")}
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
          <input type="checkbox" {...register("isActive")} />
          Active — listed on the public careers section
        </label>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create position"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/positions")}
          className="text-xs tracking-widest uppercase text-body hover:opacity-70 hover:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
