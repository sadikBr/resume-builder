/**
 * Unlocks the owner's resume in the browser. The data ships only in encrypted
 * form (see scripts/encrypt-resume.mjs); a wrong code fails AES-GCM's
 * integrity check, so nothing readable is ever produced without the right one.
 */
export async function decryptPersonalResume(code: string): Promise<unknown> {
  // Loaded on demand so the blob isn't part of the main bundle.
  const { encryptedPersonalResume: blob } = await import("./personal-resume.enc");

  const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const { subtle } = window.crypto;

  const baseKey = await subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  const key = await subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: bytes(blob.salt), iterations: blob.iterations },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  // Throws (OperationError) when the code is wrong.
  const plain = await subtle.decrypt({ name: "AES-GCM", iv: bytes(blob.iv) }, key, bytes(blob.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
