import { notFound } from "next/navigation";

import BackLink from "@/components/admin/ui/back-link";
import StatusSelect from "@/components/admin/submissions/status-select";
import SubmissionDeleteButton from "@/components/admin/submissions/submission-delete-button";
import { TYPE_LABEL } from "@/components/admin/dashboard/chart-tokens";
import { formatDateTime, humanizeEnum } from "@/lib/format";
import { getSubmissionByKind } from "@/lib/submissions";
import { submissionKindSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Row = [label: string, value: string | null | undefined, isLink?: boolean];

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  const parsed = submissionKindSchema.safeParse(type);
  if (!parsed.success) notFound();
  const kind = parsed.data;

  const record = await getSubmissionByKind(kind, id);
  if (!record) notFound();

  // Per-channel field list. Narrowing on `type` gives each branch exactly the
  // fields that channel has.
  let who: string;
  let rows: Row[];

  if (record.type === "PROJECT_INQUIRY") {
    who = record.fullName;
    rows = [
      ["Email", record.email, true],
      ["Phone", record.phoneNumber],
      ["Service", record.serviceTypeOther || humanizeEnum(record.serviceType)],
      [
        "Project type",
        record.projectTypeOther || humanizeEnum(record.projectType),
      ],
      ["Estimated location", record.estimatedLocation],
      ["Budget", humanizeEnum(record.estimatedBudget)],
      ["Vision", record.vision],
    ];
  } else if (record.type === "PARTNERSHIP") {
    who = record.companyName;
    rows = [
      ["Role", record.role],
      ["Email", record.email, true],
      ["Phone", record.phoneNumber],
      [
        "Partnership type",
        record.partnershipOther || humanizeEnum(record.partnershipType),
      ],
      ["Vision", record.vision],
    ];
  } else {
    who = record.fullName;
    rows = [
      ["Email", record.email, true],
      ["Phone", record.phoneNumber],
      [
        "Position of interest",
        record.openPosition?.title ?? record.positionOfInterest,
      ],
      ["Years of experience", humanizeEnum(record.yearsOfExperience)],
      ["Portfolio", record.portfolioUrl, true],
      ["LinkedIn", record.linkedinUrl, true],
      ["CV", record.cvUrl, true],
    ];
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/submissions">Submissions</BackLink>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-eyebrow">
            {TYPE_LABEL[record.type]}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-headline">{who}</h1>
          <p className="mt-2 text-sm text-body">
            Received {formatDateTime(record.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusSelect kind={kind} id={record.id} status={record.status} />
          <SubmissionDeleteButton
            kind={kind}
            id={record.id}
            name={who}
            redirectTo="/dashboard/submissions"
          />
        </div>
      </div>

      <dl className="mt-8 bg-background-main">
        {rows
          .filter(([, value]) => value !== null && value !== undefined && value !== "")
          .map(([label, value, isLink]) => (
            <div
              key={label}
              className="grid gap-1 border-b border-headline/5 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:gap-4"
            >
              <dt className="text-[10px] tracking-[0.15em] uppercase text-eyebrow">
                {label}
              </dt>
              <dd className="text-sm leading-relaxed whitespace-pre-wrap text-headline">
                {isLink ? (
                  <a
                    href={
                      label === "Email" ? `mailto:${value}` : (value as string)
                    }
                    target={label === "Email" ? undefined : "_blank"}
                    rel={label === "Email" ? undefined : "noopener noreferrer"}
                    className="underline underline-offset-2 hover:opacity-70"
                  >
                    {label === "CV" ? "Download CV (PDF)" : value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
      </dl>

      <p className="mt-4 text-xs text-body">
        Reply directly by email — this panel does not send messages.
      </p>
    </div>
  );
}
