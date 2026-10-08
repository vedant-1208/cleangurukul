import exifr from 'exifr';

/**
 * Validates that a captured photo is truly live (taken within the last 2 minutes).
 * Checks EXIF DateTimeOriginal if available, and file.lastModified timestamp.
 * 
 * @param {File|Blob} file 
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function validateLivePhoto(file) {
  if (!file) {
    return { ok: false, reason: 'No photo provided.' };
  }

  const TWO_MINUTES_MS = 2 * 60 * 1000;
  const now = Date.now();

  // 1. Check file.lastModified if available
  if (file.lastModified) {
    const ageMs = now - file.lastModified;
    if (ageMs > TWO_MINUTES_MS) {
      return {
        ok: false,
        reason: `Photo timestamp is too old (${Math.round(ageMs / 1000)}s ago). A live camera capture within the last 2 minutes is required.`,
      };
    }
  }

  // 2. Check EXIF DateTimeOriginal if present in image headers
  try {
    const exifData = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']);
    if (exifData && (exifData.DateTimeOriginal || exifData.CreateDate)) {
      const photoDate = new Date(exifData.DateTimeOriginal || exifData.CreateDate).getTime();
      if (!isNaN(photoDate)) {
        const exifAgeMs = now - photoDate;
        if (exifAgeMs > TWO_MINUTES_MS) {
          return {
            ok: false,
            reason: 'EXIF metadata indicates this photo was captured over 2 minutes ago. Please take a live photo.',
          };
        }
      }
    }
  } catch (err) {
    // Canvas-generated blobs won't have EXIF, which is valid if captured via the live camera tool
  }

  return { ok: true };
}
