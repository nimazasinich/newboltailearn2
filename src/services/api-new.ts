export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Opts = {
  method?: ApiMethod;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function apiFetch<T = unknown>(url: string, opts: Opts = {}): Promise<T> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), opts.timeoutMs ?? 15000);
  
  const h = {
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  };
  
  const r = await fetch(url, {
    method: opts.method ?? 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    headers: h,
    signal: opts.signal ?? c.signal,
    credentials: 'include'
  });
  
  clearTimeout(t);
  
  if (!r.ok) {
    const tx = await r.text().catch(() => '');
    throw new Error(tx || r.statusText);
  }
  
  const ct = r.headers.get('content-type') || '';
  return ct.includes('application/json') ? await r.json() as T : await (r.blob() as any as T);
}