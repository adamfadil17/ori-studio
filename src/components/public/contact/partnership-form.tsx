"use client";

import { useState } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PartnershipFormValues, partnershipSchema } from "@/lib/validators";
import {
  RadioGroupField,
  TextAreaField,
  TextField,
} from "../../ui/form-fields";
import RecaptchaCheckbox, { RECAPTCHA_ENABLED } from "./recaptcha-checkbox";

interface PartnershipDict {
  eyebrow: string;
  headline: string;
  subheadline: string;
  fields: {
    companyName: string;
    role: string;
    email: string;
    phone: string;
    partnershipType: string;
    vision: string;
    visionHint: string;
    otherPlaceholder: string;
  };
  partnershipTypeOptions: Record<string, string>;
  submit: string;
  successMessage: string;
  errorMessage: string;
}

export default function PartnershipForm({ dict }: { dict: PartnershipDict }) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: { partnershipType: "DEVELOPER_COLLABORATION" },
  });

  // Own the outcome rather than RHF's isSubmitSuccessful: a failed request must
  // NOT read as success (the callback completing without a throw isn't enough).
  const [submitState, setSubmitState] = useState<"idle" | "ok" | "error">(
    "idle",
  );
  const [recaptchaToken, setRecaptchaToken] = useState("");
  // Bumping this remounts the checkbox, clearing it (the token is single-use).
  const [recaptchaKey, setRecaptchaKey] = useState(0);

  async function onSubmit(values: PartnershipFormValues) {
    setSubmitState("idle");
    // When enabled, the box must be ticked. Skip the round-trip if it isn't.
    if (RECAPTCHA_ENABLED && !recaptchaToken) {
      setSubmitState("error");
      return;
    }
    try {
      await axios.post("/api/contact/partnership", {
        ...values,
        recaptchaToken,
      });
      reset();
      setRecaptchaToken("");
      setRecaptchaKey((k) => k + 1);
      setSubmitState("ok");
    } catch {
      setSubmitState("error");
    }
  }

  const partnershipOptions = Object.entries(dict.partnershipTypeOptions).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-eyebrow">
        {dict.eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl leading-snug text-headline md:text-3xl">
        {dict.headline}
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-body">
        {dict.subheadline}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
        <TextField
          label={dict.fields.companyName}
          required
          placeholder="Enter here..."
          error={errors.companyName?.message}
          {...register("companyName")}
        />

        <TextField
          label={dict.fields.role}
          placeholder="Enter here..."
          {...register("role")}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label={dict.fields.email}
            required
            type="email"
            placeholder="Enter here..."
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label={dict.fields.phone}
            type="tel"
            placeholder="Enter here..."
            {...register("phoneNumber")}
          />
        </div>

        <Controller
          control={control}
          name="partnershipType"
          render={({ field }) => (
            <RadioGroupField
              label={dict.fields.partnershipType}
              name={field.name}
              options={partnershipOptions}
              value={field.value}
              onChange={field.onChange}
              error={
                errors.partnershipType?.message ??
                errors.partnershipOther?.message
              }
              otherPlaceholder={dict.fields.otherPlaceholder}
              onOtherChange={(v) =>
                setValue("partnershipOther", v, { shouldValidate: true })
              }
            />
          )}
        />

        <TextAreaField
          label={dict.fields.vision}
          hint={dict.fields.visionHint}
          placeholder="Write your vision here...."
          error={errors.vision?.message}
          {...register("vision")}
        />

        <RecaptchaCheckbox key={recaptchaKey} onChange={setRecaptchaToken} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#1C1C1C] px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : dict.submit}
        </button>

        {submitState === "ok" && (
          <p className="text-sm text-eyebrow">{dict.successMessage}</p>
        )}
        {submitState === "error" && (
          <p className="text-sm text-red-700">{dict.errorMessage}</p>
        )}
      </form>
    </div>
  );
}
