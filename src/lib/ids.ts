const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

/** Random, URL-safe id without look-alike characters (0/O, 1/l/I). */
export function newId(length = 10): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function isValidId(id: string) {
  return /^[a-zA-Z0-9]{6,24}$/.test(id);
}
