export const normalizeApiError = (e: unknown) => 
  e instanceof Error ? e.message : String(e ?? 'Unknown error');