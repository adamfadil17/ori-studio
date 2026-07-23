"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { loginSchema, type LoginDto } from "@/lib/validators";
import { TextField } from "@/components/ui/form-fields";
import { toast, toastError } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginDto) {
    try {
      // The API sets an httpOnly session cookie; nothing to store client-side.
      await axios.post("/api/auth/login", values);

      // Clear any JWT left in localStorage by the old auth model — it is never
      // read now, and a token sitting in localStorage is XSS-readable.
      localStorage.removeItem("token");

      toast.success("Signed in");

      // Read ?next= straight off the URL (avoids a Suspense boundary for
      // useSearchParams) and only allow same-site paths.
      const next = new URLSearchParams(window.location.search).get("next");
      const target = next?.startsWith("/") ? next : "/dashboard";

      router.replace(target);
      router.refresh(); // re-render server components with the new session
    } catch (err) {
      toastError(err, "Unable to sign in");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-widest uppercase text-eyebrow">
          ORI Studio
        </p>
        <h1 className="mt-3 font-serif text-2xl text-headline">
          Sign in to the dashboard
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <TextField
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            error={errors.email?.message}
            {...register("email")}
          />

          <TextField
            label="Password"
            required
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}