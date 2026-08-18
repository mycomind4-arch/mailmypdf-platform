const upstream = process.env.PLATFORM_RUNTIME_URL;

async function proxy(path, init = {}) {
  if (!upstream) return { ok: false, code: 'NOT_CONFIGURED', message: 'PLATFORM_RUNTIME_URL is not configured.' };
  try {
    const response = await fetch(`${upstream.replace(/\/$/, '')}${path}`, init);
    const body = await response.json().catch(() => undefined);
    if (!response.ok) return { ok: false, code: body?.code ?? 'ERROR', message: body?.message ?? `Runtime request failed (${response.status}).` };
    return { ok: true, data: body?.data ?? body };
  } catch (error) {
    return { ok: false, code: 'UNAVAILABLE', message: error instanceof Error ? error.message : 'Runtime is unavailable.' };
  }
}

export async function handleRuntimeApi(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const routes = new Set(['/api/cases','/api/documents','/api/agents/runs','/api/actions/pending','/api/proof','/api/integrations/health']);
  let result;
  if (routes.has(url.pathname) && req.method === 'GET') result = await proxy(url.pathname);
  else if (url.pathname === '/api/command' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    await new Promise((resolve) => req.on('end', resolve));
    result = await proxy('/api/command', { method: 'POST', headers: { 'content-type': 'application/json' }, body });
  } else result = { ok: false, code: 'ERROR', message: 'Unknown runtime endpoint.' };
  res.writeHead(result.ok ? 200 : result.code === 'NOT_CONFIGURED' ? 503 : 502, { 'content-type': 'application/json' });
  res.end(JSON.stringify(result));
}
