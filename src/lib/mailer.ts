import "server-only";

import nodemailer, {
  type SendMailOptions,
  type Transporter,
} from "nodemailer";

import { humanizeEnum } from "./format";
import type { SubmissionType } from "./types";

// Reuse a single transporter across hot reloads / lambda invocations.
const globalForMailer = globalThis as unknown as {
  mailer?: Transporter | null;
};

function buildTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  if (!host || !port) return null;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port: Number(port),
    // Port 465 is implicit TLS; everything else uses STARTTLS.
    secure: process.env.SMTP_SECURE === "true" || Number(port) === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

/** Returns the shared transporter, or `null` when SMTP isn't configured. */
export function getTransporter(): Transporter | null {
  if (globalForMailer.mailer !== undefined) return globalForMailer.mailer;
  const transporter = buildTransporter();
  globalForMailer.mailer = transporter; // cache the null too, to avoid rebuilding
  return transporter;
}

function mailFrom(): string {
  return process.env.MAIL_FROM ?? `ORI Studio <${process.env.SMTP_USER}>`;
}

function studioInbox(): string | undefined {
  return process.env.MAIL_TO ?? process.env.SMTP_USER;
}

/** Best-effort send: never throws — logs and swallows so the request survives. */
async function dispatch(mail: SendMailOptions, ctx: string): Promise<void> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(`[mailer] SMTP not configured — skipping ${ctx}`);
      return;
    }
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(`[mailer] Failed to send ${ctx}:`, error);
  }
}

// ------------------------------------------------------------
// CONTENT
// ------------------------------------------------------------

const SUBJECT_PREFIX: Record<SubmissionType, string> = {
  PROJECT_INQUIRY: "New Project Inquiry",
  PARTNERSHIP: "New Partnership Request",
  CAREER: "New Career Application",
};

/** Noun used in the customer-facing acknowledgement ("your project inquiry"). */
const CONTACT_NOUN: Record<SubmissionType, string> = {
  PROJECT_INQUIRY: "project inquiry",
  PARTNERSHIP: "partnership request",
  CAREER: "application",
};

type Row = [label: string, value: unknown];

/**
 * Turn a root-relative path into an absolute URL so links work from an inbox.
 * Needs APP_URL (e.g. https://oristudio.co); falls back to the raw path.
 */
function absoluteUrl(value: unknown): string {
  const raw = String(value ?? "");
  if (!raw.startsWith("/")) return raw;
  const base = process.env.APP_URL?.replace(/\/+$/, "") ?? "";
  return base ? `${base}${raw}` : raw;
}

/** Ordered, human-readable fields per submission type. */
function fieldRows(type: SubmissionType, r: Record<string, unknown>): Row[] {
  switch (type) {
    case "PROJECT_INQUIRY":
      return [
        ["Full name", r.fullName],
        ["Email", r.email],
        ["Phone", r.phoneNumber],
        ["Service", r.serviceTypeOther || humanizeEnum(r.serviceType)],
        ["Project type", r.projectTypeOther || humanizeEnum(r.projectType)],
        ["Estimated location", r.estimatedLocation],
        ["Budget", humanizeEnum(r.estimatedBudget)],
        ["Vision", r.vision],
      ];
    case "PARTNERSHIP":
      return [
        ["Company", r.companyName],
        ["Role", r.role],
        ["Email", r.email],
        ["Phone", r.phoneNumber],
        ["Partnership type", r.partnershipOther || humanizeEnum(r.partnershipType)],
        ["Vision", r.vision],
      ];
    case "CAREER":
      return [
        ["Full name", r.fullName],
        ["Email", r.email],
        ["Phone", r.phoneNumber],
        ["Position of interest", r.positionOfInterest],
        ["Years of experience", humanizeEnum(r.yearsOfExperience)],
        ["Portfolio", r.portfolioUrl],
        ["LinkedIn", r.linkedinUrl],
        ["CV", absoluteUrl(r.cvUrl)], // admin-only download route
      ];
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const nonEmpty = ([, value]: Row) =>
  value !== null && value !== undefined && value !== "";

function rowsToText(rows: Row[]): string {
  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

// Brand palette (design tokens) — inlined because email clients strip <style>.
const BRAND = {
  bg: "#F8F6F2", // background-main (card)
  matte: "#F1ECE4", // background-alt (outer matte)
  eyebrow: "#B89F82", // label-eyebrow
  headline: "#33271F", // text-headline
  body: "#695544", // text-body
  border: "#E7E0D6", // hairline separators
} as const;

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";

/** Short uppercase tag shown as the eyebrow in the header. */
const TYPE_LABEL: Record<SubmissionType, string> = {
  PROJECT_INQUIRY: "Project Inquiry",
  PARTNERSHIP: "Partnership",
  CAREER: "Career",
};

/** Branded, table-based details grid (Outlook-safe, inline styles). */
function rowsToHtml(rows: Row[]): string {
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:11px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.eyebrow};font-family:${SANS};font-size:11px;letter-spacing:1px;text-transform:uppercase;vertical-align:top;width:38%">${escapeHtml(
          label,
        )}</td>
          <td style="padding:11px 0 11px 16px;border-bottom:1px solid ${BRAND.border};color:${BRAND.headline};font-family:${SANS};font-size:14px;line-height:1.55;vertical-align:top">${escapeHtml(
          String(value),
        )}</td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${cells}</table>`;
}

/** Full branded email shell: matte backdrop → card → header / body / footer. */
function emailLayout(opts: {
  eyebrow: string;
  heading: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.matte}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.matte};padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.bg};border:1px solid ${BRAND.border}">
        <tr><td style="padding:30px 36px 22px;border-bottom:1px solid ${BRAND.border}">
          <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${BRAND.eyebrow}">${escapeHtml(
            opts.eyebrow,
          )}</p>
          <p style="margin:0;font-family:${SERIF};font-size:20px;letter-spacing:2px;color:${BRAND.headline}">ORI Studio</p>
        </td></tr>
        <tr><td style="padding:32px 36px">
          <h1 style="margin:0 0 20px;font-family:${SERIF};font-weight:normal;font-size:22px;line-height:1.3;color:${BRAND.headline}">${escapeHtml(
            opts.heading,
          )}</h1>
          ${opts.body}
        </td></tr>
        <tr><td style="padding:20px 36px 30px;border-top:1px solid ${BRAND.border}">
          <p style="margin:0;font-family:${SANS};font-size:12px;letter-spacing:0.5px;color:${BRAND.body}">ORI Studio Architect &middot; Bali, Indonesia</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const paragraph = (text: string, margin = "0 0 16px") =>
  `<p style="margin:${margin};font-family:${SANS};font-size:14px;line-height:1.6;color:${BRAND.body}">${text}</p>`;

/** Internal notification for the studio — every field, reply-to the customer. */
function renderAdminEmail(type: SubmissionType, record: Record<string, unknown>) {
  const rows = fieldRows(type, record).filter(nonEmpty);

  const text = `${SUBJECT_PREFIX[type]}\n\n${rowsToText(rows)}`;

  const body = `${paragraph(
    `A new ${CONTACT_NOUN[type]} just came in through the website.`,
    "0 0 24px",
  )}${rowsToHtml(rows)}`;

  const html = emailLayout({
    eyebrow: TYPE_LABEL[type],
    heading: SUBJECT_PREFIX[type],
    body,
  });

  return { text, html };
}

/** Friendly acknowledgement for the customer — a receipt of what they sent. */
function renderCustomerEmail(
  type: SubmissionType,
  record: Record<string, unknown>,
) {
  const name =
    (record.fullName as string) ?? (record.companyName as string) ?? "there";
  const noun = CONTACT_NOUN[type];
  const intro = `We’ve received your ${noun} and our team will get back to you shortly. Here’s a copy of what you submitted, for your records.`;

  // Echo back their submission as a receipt, minus the internal CV storage path.
  const rows = fieldRows(type, record)
    .filter(nonEmpty)
    .filter(([label]) => label !== "CV");

  const text = `Hi ${name},

Thank you for reaching out to ORI Studio. ${intro}

${rowsToText(rows)}

Warm regards,
ORI Studio Architect`;

  const body = `${paragraph(`Hi ${escapeHtml(name)},`)}${paragraph(
    intro,
    "0 0 24px",
  )}${rowsToHtml(rows)}${paragraph("Warm regards,<br>ORI Studio Architect", "24px 0 0")}`;

  const html = emailLayout({
    eyebrow: "Received",
    heading: "Thank you for reaching out",
    body,
  });

  return { text, html };
}

// ------------------------------------------------------------
// SEND
// ------------------------------------------------------------

/** Email the studio inbox about a new submission. */
export async function sendAdminNotification(
  type: SubmissionType,
  record: Record<string, unknown>,
): Promise<void> {
  const to = studioInbox();
  if (!to) {
    console.warn(
      `[mailer] No studio inbox (MAIL_TO/SMTP_USER) — skipping admin ${type} notification (id: ${record.id})`,
    );
    return;
  }
  const contact =
    (record.fullName as string) ??
    (record.companyName as string) ??
    (record.email as string) ??
    "Unknown";
  const { text, html } = renderAdminEmail(type, record);

  await dispatch(
    {
      from: mailFrom(),
      to,
      replyTo: typeof record.email === "string" ? record.email : undefined,
      subject: `${SUBJECT_PREFIX[type]} — ${contact}`,
      text,
      html,
    },
    `admin ${type} notification`,
  );
}

/** Email the customer a confirmation that their submission was received. */
export async function sendCustomerAcknowledgement(
  type: SubmissionType,
  record: Record<string, unknown>,
): Promise<void> {
  const to = typeof record.email === "string" ? record.email : undefined;
  if (!to) return;

  const { text, html } = renderCustomerEmail(type, record);

  await dispatch(
    {
      from: mailFrom(),
      to,
      replyTo: studioInbox(),
      subject: `Thank you for your ${CONTACT_NOUN[type]} — ORI Studio`,
      text,
      html,
    },
    `customer ${type} acknowledgement`,
  );
}

/**
 * Notify both sides of a new contact submission: the studio inbox and the
 * customer. Both are best-effort and run concurrently — the record is already
 * persisted, so neither email can fail the caller's request.
 */
export async function notifyNewSubmission(
  type: SubmissionType,
  record: Record<string, unknown>,
): Promise<void> {
  await Promise.allSettled([
    sendAdminNotification(type, record),
    sendCustomerAcknowledgement(type, record),
  ]);
}
