/** @param {Record<string, string>} [extra] */
export function getAuthHeaders(extra = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Query string for doctor list follow/rating state (patient profile id). */
export function getPatientProfileQueryParam() {
  try {
    const raw = localStorage.getItem('user');
    const u = raw ? JSON.parse(raw) : null;
    const pid = u?.patient || u?.patientProfileId;
    return pid ? `patientProfileId=${encodeURIComponent(pid)}` : '';
  } catch {
    return '';
  }
}
