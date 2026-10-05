const fs = require('fs');
const path = require('path');

const IMAGE_ROOT = path.join(__dirname, '..', 'public', 'uploads');
const REPORT_ROOT = path.join(__dirname, '..', 'storage');

const ensureDir = (targetPath) => {
  fs.mkdirSync(targetPath, { recursive: true });
};

const sanitizeSegment = (value, fallback = 'file') => {
  const normalized = String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return normalized || fallback;
};

const timestampLabel = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`;
};

const getExtensionFromMime = (mimeType) => {
  const mime = String(mimeType || '').toLowerCase();
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  if (mime.includes('png')) return '.png';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('pdf')) return '.pdf';
  return '.bin';
};

const parseDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
};

const isDataUrl = (value) => /^data:/i.test(String(value || ''));

const saveDataUrlFile = ({
  dataUrl,
  ownerType,
  ownerId,
  ownerName,
  bucket,
  label,
}) => {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return String(dataUrl || '');

  const safeOwnerType = sanitizeSegment(ownerType, 'users');
  const safeOwnerId = sanitizeSegment(ownerId, 'unknown');
  const safeOwnerName = sanitizeSegment(ownerName, 'person');
  const safeBucket = sanitizeSegment(bucket, 'files');
  const safeLabel = sanitizeSegment(label, 'upload');
  const filename = `${safeOwnerName}_${safeLabel}_${timestampLabel()}${getExtensionFromMime(parsed.mimeType)}`;

  const isImageBucket = safeBucket === 'images';
  const root = isImageBucket ? IMAGE_ROOT : REPORT_ROOT;
  const relativeDir = path.join(safeOwnerType, safeOwnerId, safeBucket);
  const absoluteDir = path.join(root, relativeDir);
  ensureDir(absoluteDir);

  const absolutePath = path.join(absoluteDir, filename);
  fs.writeFileSync(absolutePath, parsed.buffer);

  const normalizedRelative = relativeDir.split(path.sep).join('/');
  return isImageBucket
    ? `/uploads/${normalizedRelative}/${filename}`
    : `/api/files/${normalizedRelative}/${filename}`;
};

module.exports = {
  IMAGE_ROOT,
  REPORT_ROOT,
  isDataUrl,
  saveDataUrlFile,
};
