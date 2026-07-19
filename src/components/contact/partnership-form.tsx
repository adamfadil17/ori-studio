"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PartnershipFormValues, partnershipSchema } from "@/utils/validators";
import {
  RadioGroupField,
  TextAreaField,
  TextField,
} from "../layout/form-fields";

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
}

export default function PartnershipForm({ dict }: { dict: PartnershipDict }) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: { partnershipType: "DEVELOPER_COLLABORATION" },
  });

  async function onSubmit(values: PartnershipFormValues) {
    // TODO: kirim ke API route -> Prisma ContactPartnership.create() + email notifikasi
    console.log("Partnership submission:", values);
    await new Promise((resolve) => setTimeout(resolve, 400));
    reset();
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
              error={errors.partnershipType?.message}
              otherPlaceholder={dict.fields.otherPlaceholder}
              onOtherChange={(v) => setValue("partnershipOther", v)}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-headline px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "..." : dict.submit}
        </button>

        {isSubmitSuccessful && (
          <p className="text-sm text-eyebrow">{dict.successMessage}</p>
        )}
      </form>
    </div>
  );
}
