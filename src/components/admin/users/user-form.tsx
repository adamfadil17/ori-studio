"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";

import {
  FieldSectionLabel,
  NativeSelectField,
  TextField,
} from "@/components/ui/form-fields";
import {
  createUserFormSchema,
  editUserFormSchema,
  type UserFormInput,
  type UserFormValues,
} from "@/lib/validators";
import type { Role } from "@/lib/types";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Everything, including submissions and user accounts." },
  { value: "editor", label: "Editor", hint: "Projects, journal and open positions. No submissions or users." },
  { value: "user", label: "User", hint: "No dashboard access at all." },
];

export interface UserFormInitial {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export default function UserForm({
  initial,
  /** Session user — used to block editing your own role. */
  currentUserId,
  /** Blocks demoting the only admin, matching the API guard. */
  isLastAdmin = false,
}: {
  initial?: UserFormInitial;
  currentUserId: string;
  isLastAdmin?: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const isSelf = initial?.id === currentUserId;
  const roleLocked = isSelf || isLastAdmin;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(isEdit ? editUserFormSchema : createUserFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      password: "",
      // New accounts default to editor — that's what this screen is for.
      role: initial?.role ?? "editor",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });
  const roleHint = ROLES.find((r) => r.value === selectedRole)?.hint;

  async function onSubmit(values: UserFormValues) {
    try {
      if (initial) {
        // A blank password field means "leave it alone" — sending "" would be
        // rejected by the API's password rules.
        const { password, ...rest } = values;
        await axios.patch(`/api/users/${initial.id}`, {
          ...rest,
          ...(password ? { password } : {}),
          // The API refuses a self role change; don't even send it.
          ...(roleLocked ? { role: undefined } : {}),
        });
      } else {
        await axios.post("/api/users", values);
      }
      toast.success(initial ? "Account updated" : "Account created");
      router.push("/dashboard/users");
      router.refresh();
    } catch (err) {
      toastError(err, "Could not save the account");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
      <section className="space-y-6">
        <FieldSectionLabel>Account</FieldSectionLabel>

        <TextField
          label="Full name"
          required
          placeholder="e.g. Ayu Pratiwi"
          error={errors.name?.message}
          {...register("name")}
        />

        <TextField
          label="Email"
          type="email"
          required
          autoComplete="off"
          placeholder="name@oristudio.co"
          error={errors.email?.message}
          {...register("email")}
        />

        {isSelf ? (
          // Your own password belongs on /dashboard/account, which asks for the
          // current one first. Offering it here would be a way around that
          // check — and this route can't re-issue the session cookie, so it
          // would sign you out mid-edit.
          <div>
            <p className="text-xs tracking-widest uppercase text-headline">
              Password
            </p>
            <p className="mt-3 text-sm text-body">
              Change your own password from{" "}
              <Link
                href="/dashboard/account"
                className="text-headline underline underline-offset-4 hover:opacity-70"
              >
                My Account
              </Link>
              , which asks for your current password first.
            </p>
          </div>
        ) : (
          <div>
            <TextField
              label={isEdit ? "New password" : "Password"}
              type="password"
              required={!isEdit}
              // Browsers offer to fill the signed-in admin's own password here,
              // which would silently overwrite someone else's.
              autoComplete="new-password"
              placeholder={
                isEdit ? "Leave blank to keep the current one" : "••••••••"
              }
              error={errors.password?.message}
              {...register("password")}
            />
            <p className="mt-2 text-xs text-body">
              At least 8 characters, with one uppercase letter and one number.
              {isEdit &&
                " Setting one here signs this person out of every device."}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <FieldSectionLabel>Access</FieldSectionLabel>

        <NativeSelectField
          label="Role"
          required
          disabled={roleLocked}
          options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
          error={errors.role?.message}
          {...register("role")}
        />

        {roleHint && <p className="text-xs text-body">{roleHint}</p>}

        {roleLocked && (
          <p className="text-xs text-eyebrow">
            {isSelf
              ? "You cannot change your own role — ask another admin to do it."
              : "This is the only admin left. Promote someone else before changing this role."}
          </p>
        )}
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/users")}
          className="text-xs tracking-widest uppercase text-body hover:opacity-70 hover:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
