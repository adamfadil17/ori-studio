"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getActiveOpenPositions,
  OpenPosition,
} from "@/lib/data/open-positions";
import { CareerFormValues, careerSchema } from "@/lib/validators";
import OpenPositionModal from "./open-position-modal";
import {
  FieldSectionLabel,
  RadioGroupField,
  SelectField,
  TextField,
} from "../../ui/form-fields";
import OpenPositionsList from "./open-positions-list";

interface CareerDict {
  eyebrow: string;
  headline: string;
  subheadline: string;
  contactInfo: string;
  openPositionsLabel: string;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    positionOfInterest: string;
    portfolioLinkedin: string;
    portfolioUrl: string;
    linkedinUrl: string;
    yearsOfExperience: string;
    uploadCv: string;
  };
  experienceOptions: Record<string, string>;
  upload: string;
  noFileChosen: string;
  submit: string;
  viewDetails: string;
  applyForPosition: string;
  closeModal: string;
  positionType: string;
  positionLevel: string;
  successMessage: string;
}

export default function CareerForm({ dict }: { dict: CareerDict }) {
  const positions = getActiveOpenPositions();
  const [selectedPositionForModal, setSelectedPositionForModal] =
    useState<OpenPosition | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      openPositionId: positions[0]?.id ?? "",
      positionOfInterest: positions[0]?.title ?? "",
      yearsOfExperience: "YEARS_0_2",
    },
  });

  async function onSubmit(values: CareerFormValues) {
    // TODO: kirim sebagai multipart/form-data ke API route (upload CV) ->
    // Prisma ContactCareer.create() + simpan file CV + email notifikasi.
    // `values.cvFile` sudah tervalidasi (PDF, maks 5MB) lewat cvFileSchema.
    console.log("Career submission:", values);
    await new Promise((resolve) => setTimeout(resolve, 400));
    reset();
  }

  const experienceOptions = Object.entries(dict.experienceOptions).map(
    ([value, label]) => ({ value, label }),
  );
  const positionOptions = positions.map((p) => ({
    value: p.id,
    label: p.title,
  }));

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

      <div className="mt-8">
        <OpenPositionsList
          positions={positions}
          label={dict.openPositionsLabel}
          viewDetailsLabel={dict.viewDetails}
          onSelect={setSelectedPositionForModal}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8">
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
          name="openPositionId"
          render={({ field }) => (
            <SelectField
              label={dict.fields.positionOfInterest}
              name={field.name}
              value={field.value ?? ""}
              onChange={(id) => {
                field.onChange(id);
                // Simpan juga judul posisi sebagai fallback teks
                // (positionOfInterest) supaya admin tetap paham
                // walau posisinya dihapus di kemudian hari.
                const selected = positions.find((p) => p.id === id);
                setValue("positionOfInterest", selected?.title ?? "");
              }}
              options={positionOptions}
              error={errors.positionOfInterest?.message}
            />
          )}
        />

        <div className="space-y-6">
          <FieldSectionLabel>{dict.fields.portfolioLinkedin}</FieldSectionLabel>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label={dict.fields.portfolioUrl}
              required
              placeholder="Enter here..."
              error={errors.portfolioUrl?.message}
              {...register("portfolioUrl")}
            />
            <TextField
              label={dict.fields.linkedinUrl}
              placeholder="Enter here..."
              error={errors.linkedinUrl?.message}
              {...register("linkedinUrl")}
            />
          </div>
        </div>

        <Controller
          control={control}
          name="yearsOfExperience"
          render={({ field }) => (
            <RadioGroupField
              label={dict.fields.yearsOfExperience}
              name={field.name}
              options={experienceOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.yearsOfExperience?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="cvFile"
          render={({ field }) => (
            <div>
              <FieldSectionLabel>{dict.fields.uploadCv}</FieldSectionLabel>
              <div className="mt-4 flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 bg-eyebrow px-6 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90">
                  <Upload size={14} strokeWidth={1.4} aria-hidden="true" />
                  {dict.upload}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    className="sr-only"
                  />
                </label>
                <span className="text-sm text-body">
                  {field.value?.name ?? dict.noFileChosen}
                </span>
              </div>
              {errors.cvFile && (
                <p className="mt-1.5 text-xs text-red-700">
                  {errors.cvFile.message}
                </p>
              )}
            </div>
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "..." : dict.submit}
        </button>

        {isSubmitSuccessful && (
          <p className="text-sm text-eyebrow">{dict.successMessage}</p>
        )}
      </form>

      {selectedPositionForModal && (
        <OpenPositionModal
          position={selectedPositionForModal}
          dict={dict}
          onClose={() => setSelectedPositionForModal(null)}
          onApply={(position) => {
            setValue("openPositionId", position.id);
            setValue("positionOfInterest", position.title);
            setSelectedPositionForModal(null);
          }}
        />
      )}
    </div>
  );
}
