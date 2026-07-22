"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { FieldSectionLabel, TextField } from "@/components/ui/form-fields";
import { changePasswordSchema, type ChangePasswordDto } from "@/lib/validators";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordDto>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordDto) {
    setFormError(null);
    setDone(false);
    try {
      await axios.post("/api/auth/change-password", values);
      reset();
      setDone(true);
      // The response re-issued the session cookie; refresh so anything holding
      // the old one re-reads it.
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const fieldErrors = data?.errors
          ? Object.entries(data.errors)
              .map(([, v]) => (v as string[]).join(", "))
              .join(" · ")
          : null;
        setFormError(
          fieldErrors ?? data?.error ?? "Could not change the password",
        );
      } else {
        setFormError("Could not change the password");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
      <section className="space-y-6">
        <FieldSectionLabel>Change password</FieldSectionLabel>

        <TextField
          label="Current password"
          type="password"
          required
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />

        <TextField
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <TextField
          label="Repeat new password"
          type="password"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <p className="text-xs text-body">
          At least 8 characters, with one uppercase letter and one number.
          Changing it signs out every other device — this one stays signed in.
        </p>
      </section>

      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}

      {done && (
        <p role="status" className="text-sm text-headline">
          Password changed. Any other sessions have been signed out.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
