import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

function resolveSecretKey(): string {
  return (
    process.env.SETTINGS_ENCRYPTION_KEY?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    'drinsight-dev-settings-key'
  );
}

export function encryptSecretJson(payload: Record<string, unknown>): string {
  const key = deriveKey(resolveSecretKey());
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptSecretJson<T extends Record<string, unknown>>(blob?: string | null): T {
  if (!blob) return {} as T;
  try {
    const key = deriveKey(resolveSecretKey());
    const buf = Buffer.from(blob, 'base64');
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + 16);
    const data = buf.subarray(IV_LEN + 16);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return {} as T;
  }
}

export const SECRET_MASK = '********';

export function maskSecret(value?: string | null): string {
  return value ? SECRET_MASK : '';
}
