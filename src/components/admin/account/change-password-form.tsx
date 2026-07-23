"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { FieldSectionLabel, TextField } from "@/components/ui/form-fields";
import { toast, toastError } from "@/lib/toast";
import { changePasswordSchema, type ChangePasswordDto } from "@/lib/validators";

export default function ChangePasswordForm() {
  const router = useRouter();

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
    try {
      await axios.post("/api/auth/change-password", values);
      reset();
      toast.success("Password changed. Other sessions have been signed out.");
      // The response re-issued the session cookie; refresh so anything holding
      // the old one re-reads it.
      router.refresh();
    } catch (err) {
      toastError(err, "Could not change the password");
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
