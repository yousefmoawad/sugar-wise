const DEFAULT_MAX = 6 * 1024 * 1024;

/**
 * @param {File} file
 * @param {number} [maxBytes]
 * @returns {Promise<string>}
 */
export function readImageAsDataURL(file, maxBytes = DEFAULT_MAX) {
  return new Promise((resolve, reject) => {
    if (!file || !file.size) {
      reject(new Error('No file'));
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error('FILE_TOO_LARGE'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}
