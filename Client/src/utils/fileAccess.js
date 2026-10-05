import { getAuthHeaders } from "./getAuthHeaders";

export const isProtectedFileUrl = (url) =>
  String(url || "").startsWith("/api/files/");

export const fetchProtectedFileBlobUrl = async (url) => {
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load file");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const openFileWithAuth = async (url) => {
  if (!url) return;
  if (!isProtectedFileUrl(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const blobUrl = await fetchProtectedFileBlobUrl(url);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
};
