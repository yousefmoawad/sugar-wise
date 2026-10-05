/** Normalize Mongo-style ids from API / localStorage (string, ObjectId, { $oid }, populated doc). */
export function normalizeRefId(ref) {
  if (ref == null || ref === '') return '';
  if (typeof ref === 'string') {
    const s = ref.trim();
    if (s === 'undefined' || s === 'null') return '';
    return s;
  }
  if (typeof ref === 'object') {
    if (ref.$oid) return String(ref.$oid);
    if (ref._id != null) return normalizeRefId(ref._id);
  }
  return String(ref);
}
