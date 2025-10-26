// Read API base from global vars if the bundler injects them; otherwise fallback.
const globalEnv = (typeof globalThis !== 'undefined' ? (globalThis as any) : {}) as any;
export const API_BASE =
  globalEnv.VITE_API_BASE ||
  globalEnv.NEXT_PUBLIC_API_BASE ||
  'http://localhost:4000';

async function handle<T>(resPromise: Promise<Response>): Promise<T> {
  const res = await resPromise;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  return res.json();
}

function headers() { return { 'Content-Type': 'application/json' }; }
function toQuery(params?: Record<string, any>) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && usp.append(k, String(v)));
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const api = {
  list: <T>(entity: string, params?: Record<string, any>) =>
    handle<T>(fetch(`${API_BASE}/api/${entity}${toQuery(params)}`)),
  get:  <T>(entity: string, id: string) =>
    handle<T>(fetch(`${API_BASE}/api/${entity}/${id}`)),
  create: <T>(entity: string, body: any) =>
    handle<T>(fetch(`${API_BASE}/api/${entity}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) })),
  update: <T>(entity: string, id: string, body: any) =>
    handle<T>(fetch(`${API_BASE}/api/${entity}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) })),
  remove: <T>(entity: string, id: string) =>
    handle<T>(fetch(`${API_BASE}/api/${entity}/${id}`, { method: 'DELETE' })),
};
