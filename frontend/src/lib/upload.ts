import { api } from "@/lib/api";

export async function uploadFile(file: File, folder = "drinsight/about") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const { data } = await api.post<{ url: string }>("/storage/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
