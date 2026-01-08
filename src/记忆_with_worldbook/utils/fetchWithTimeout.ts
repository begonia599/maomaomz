export function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timeoutId),
  };
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const { signal, cancel } = createTimeoutSignal(timeoutMs);
  try {
    return await fetch(url, { ...init, signal });
  } finally {
    cancel();
  }
}
