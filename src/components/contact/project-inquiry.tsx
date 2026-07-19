"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProjectInquiryFormValues,
  projectInquirySchema,
} from "@/utils/validators";
import {
  FieldSectionLabel,
  RadioGroupField,
  TextAreaField,
  TextField,
} from "../layout/form-fields";

interface ProjectInquiryDict {
  eyebrow: string;
  headline: string;
  subheadline: string;
  contactInfo: string;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    serviceType: string;
    projectType: string;
    estimatedLocation: string;
    estimatedBudget: string;
    vision: string;
    visionHint: string;
    otherPlaceholder: string;
  };
  serviceTypeOptions: Record<string, string>;
  projectTypeOptions: Record<string, string>;
  budgetOptions: Record<string, string>;
  submit: string;
  successMessage: string;
}

export default function ProjectInquiryForm({
  dict,
}: {
  dict: ProjectInquiryDict;
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ProjectInquiryFormValues>({
    resolver: zodResolver(projectInquirySchema),
    defaultValues: {
      serviceType: "ARCHITECTURE_DESIGN",
      projectType: "RESIDENTIAL",
      estimatedBudget: "PREFER_NOT_TO_SAY",
    },
  });

  async function onSubmit(values: ProjectInquiryFormValues) {
    // TODO: kirim ke API route -> Prisma ContactInquiry.create() + email notifikasi (Nodemailer)
    console.log("Project inquiry submission:", values);
    await new Promise((resolve) => setTimeout(resolve, 400));
    reset();
  }

  const serviceOptions = Object.entries(dict.serviceTypeOptions).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );
  const projectOptions = Object.entries(dict.projectTypeOptions).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );
  const budgetOptions = Object.entries(dict.budgetOptions).map(
    ([value, label]) => ({
      value,
      label,
    }),
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
        <div className="space-y-6">
          <FieldSectionLabel>{dict.contactInfo}</FieldSectionLabel>

          <TextField
            label={dict.fields.fullName}
            required
            placeholder="Enter here..."
            error={errors.fullName?.message}
            {...register("fullName")}
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
        </div>

        <Controller
          control={control}
          name="serviceType"
          render={({ field }) => (
            <RadioGroupField
              label={dict.fields.serviceType}
              name={field.name}
              options={serviceOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.serviceType?.message}
              otherPlaceholder={dict.fields.otherPlaceholder}
              onOtherChange={(v) => setValue("serviceTypeOther", v)}
            />
          )}
        />

        <Controller
          control={control}
          name="projectType"
          render={({ field }) => (
            <RadioGroupField
              label={dict.fields.projectType}
              name={field.name}
              options={projectOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.projectType?.message}
              otherPlaceholder={dict.fields.otherPlaceholder}
              onOtherChange={(v) => setValue("projectTypeOther", v)}
            />
          )}
        />

        <TextField
          label={dict.fields.estimatedLocation}
          placeholder="Enter here..."
          {...register("estimatedLocation")}
        />

        <Controller
          control={control}
          name="estimatedBudget"
          render={({ field }) => (
            <RadioGroupField
              label={dict.fields.estimatedBudget}
              name={field.name}
              options={budgetOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.estimatedBudget?.message}
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
