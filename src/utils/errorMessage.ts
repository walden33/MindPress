export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;

  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }

  return "Unexpected error";
}
