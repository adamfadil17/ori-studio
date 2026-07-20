export function getAuthHeaders(
  includeContentType = false,
): Record<string, string> {
  const token =
    localStorage.getItem("token") ??
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (includeContentType) headers["Content-Type"] = "application/json";
  return headers;
}
