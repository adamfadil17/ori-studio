// Client-side upload helpers for the "preview local, upload on submit" flow.
// Import directly (`@/lib/upload-client`) from client components — NOT via the
// server barrel; this uses browser APIs (FormData, object URLs).

import axios from "axios";

import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  type UploadFolder,
} from "./validators";

export type ProjectImageType = "HERO" | "GALLERY";

/**
 * A gallery/cover item in the form. Until submit, a freshly-picked image is a
 * local `File` previewed via an object URL — never touching storage. An item
 * loaded from an existing record already has a stored `url`.
 */
export type DraftImage =
  | {
      kind: "existing";
      url: string;
      alt?: string | null;
      type: ProjectImageType;
      order: number;
    }
  | {
      kind: "new";
      file: File;
      previewUrl: string; // URL.createObjectURL(file)
      alt?: string | null;
      type: ProjectImageType;
      order: number;
    };

/** Shape the projects API expects for each image. */
export interface ResolvedImage {
  url: string;
  alt?: string | null;
  type: ProjectImageType;
  order: number;
}

/**
 * Client-side mirror of `imageFileSchema` — for instant feedback the moment a
 * file is picked (before any upload). Returns an error message, or null if OK.
 */
export function validateImageFile(file: File): string | null {
  if (file.size === 0) return "Image file is required";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "Image must be 3MB or smaller";
  if (!(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Image must be JPEG, PNG, WebP, or AVIF";
  }
  return null;
}

/** Make a local preview URL. Remember to `revokePreview` it when the item is dropped. */
export function makePreview(file: File): string {
  return URL.createObjectURL(file);
}

/** Free an object URL created by `makePreview` (call on remove/replace/unmount). */
export function revokePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl);
}

/** Upload a single image at submit time; resolves to its stored URL. */
export async function uploadImage(
  file: File,
  folder: UploadFolder = "general",
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  // Same-origin request, so the httpOnly session cookie is attached
  // automatically. Deliberately NO Authorization header: the API reads the
  // Bearer header first, so a stale token in localStorage would shadow the
  // valid cookie and the upload would fail with 401.
  // The browser also sets the multipart Content-Type (with its boundary) —
  // don't override it.
  const { data } = await axios.post("/api/uploads/image", form);

  return data.data.url as string;
}

/**
 * Submit-time resolver for a project's images: upload every new file, keep
 * existing URLs, preserve type/alt/order. The result is the `images` array to
 * send to POST/PATCH /api/projects. Nothing was uploaded before this call, so
 * cancelling the form leaves zero orphans on storage.
 */
export async function resolveDraftImages(
  images: DraftImage[],
  folder: UploadFolder = "projects",
): Promise<ResolvedImage[]> {
  return Promise.all(
    images.map(async (img) => ({
      url: img.kind === "new" ? await uploadImage(img.file, folder) : img.url,
      alt: img.alt ?? null,
      type: img.type,
      order: img.order,
    })),
  );
}

/** Submit-time resolver for a single cover image (article `image` field). */
export async function resolveCoverImage(
  image:
    | { kind: "existing"; url: string }
    | { kind: "new"; file: File },
  folder: UploadFolder = "articles",
): Promise<string> {
  return image.kind === "new" ? uploadImage(image.file, folder) : image.url;
}
