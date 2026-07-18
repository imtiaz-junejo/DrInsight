import { api } from "@/lib/api";

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);

export function validateImageFile(file: File, maxBytes = 5 * 1024 * 1024): string | null {
  if (!IMAGE_TYPES.has(file.type)) {
    return "Please upload a JPG, PNG, or WEBP image.";
  }
  if (file.size > maxBytes) {
    return `Image must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller.`;
  }
  return null;
}

export function validateLicenseCertificateFile(file: File, maxBytes = 8 * 1024 * 1024): string | null {
  if (!DOCUMENT_TYPES.has(file.type)) {
    return "Please upload a JPG, PNG, WEBP, or PDF file.";
  }
  if (file.size > maxBytes) {
    return `File must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller.`;
  }
  return null;
}

export async function uploadFile(file: File, folder = "drinsight/about") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const { data } = await api.post<{ url: string }>("/storage/upload", formData, {
    headers: { "Content-Type": undefined },
  });
  return data.url;
}
