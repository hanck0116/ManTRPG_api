export interface WorkerEnv {
  OPTIONAL_PROXY_ENABLED?: string;
}

interface RelayRequest {
  provider?: string;
  endpoint?: string;
  body?: unknown;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true, mode: 'byok-direct-default', localLlm: false });
    if (url.pathname === '/llm') return json({ ok: false, error: 'direct_byok_mode_uses_browser_provider_calls_not_worker' }, 403);
    if (url.pathname === '/proxy/llm') return proxyLlm(request, env);
    return json({ ok: true, message: 'ManTRPG worker: health/static/optional proxy only' });
  },
};

async function proxyLlm(request: Request, env: WorkerEnv): Promise<Response> {
  if (env.OPTIONAL_PROXY_ENABLED !== 'true') return json({ ok: false, error: 'optional_proxy_disabled' }, 403);
  const body = await request.json().catch(() => null) as RelayRequest | null;
  if (!body?.endpoint) return json({ ok: false, error: 'endpoint_required' }, 400);
  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({ ok: false, error: 'player_authorization_header_required_proxy_warning_key_passes_worker' }, 400);
  const upstream = await fetch(body.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authorization },
    body: JSON.stringify(body.body ?? {}),
  });
  return new Response(upstream.body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json', 'X-ManTRPG-Proxy-Warning': 'player_api_key_passes_worker_in_opt_in_proxy_mode' } });
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}
