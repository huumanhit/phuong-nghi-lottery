export const COOKIE_NAME = "admin_session";

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const padded = s + "===".slice((s.length + 3) % 4);
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(usage: KeyUsage[]): Promise<CryptoKey> {
  const secret = process.env.NEXTAUTH_SECRET || "admin-fallback-secret-32chars-xx";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

export async function createAdminToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const payloadJson = JSON.stringify({ role: "admin", exp });
  const payload = b64url(new TextEncoder().encode(payloadJson).buffer as ArrayBuffer);
  const key = await getKey(["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${b64url(sigBuf)}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const dot = token.indexOf(".");
    if (dot === -1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const key = await getKey(["verify"]);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(sig),
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return Math.floor(Date.now() / 1000) < exp;
  } catch {
    return false;
  }
}
