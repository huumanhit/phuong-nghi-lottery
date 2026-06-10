export function parseAddresses(address1?: string, address2?: string): string[] {
  if (!address1) return [];
  try {
    const parsed = JSON.parse(address1);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    }
  } catch {
    // ignore JSON parse error
  }
  return [address1, address2].map(addr => addr?.trim()).filter((addr): addr is string => !!addr);
}
