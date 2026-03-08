
/**
 * Recursively removes 'lkey' property from objects and arrays
 */
export const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject);
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k !== 'lkey') {
      cleaned[k] = (v && typeof v === 'object') ? cleanObject(v) : v;
    }
  }
  return cleaned;
};
