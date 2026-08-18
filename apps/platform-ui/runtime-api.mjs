import { createHttpRuntime } from '../../packages/platform-ui/src/runtime-client.ts';

const runtime = createHttpRuntime(process.env.PLATFORM_RUNTIME_URL ?? '');

export async function handleRuntimeApi(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const routes = {
    '/api/cases': () => runtime.cases.list(),
    '/api/documents': () => runtime.documents.list(),
    '/api/agents/runs': () => runtime.agents.listRuns(),
    '/api/actions/pending': () => runtime.actions.listPending(),
    '/api/proof': () => runtime.proof.list(),
    '/api/integrations/health': () => runtime.integrations.health(),
  };
  const route = routes[url.pathname];
  const result = route ? await route() : url.pathname === '/api/command' && req.method === 'POST'
    ? await new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => resolve(await runtime.command.execute(JSON.parse(body || '{}').input ?? '')));
      })
    : { ok: false, code: 'ERROR', message: 'Unknown runtime endpoint.' };
  res.writeHead(result.ok ? 200 : result.code === 'NOT_CONFIGURED' ? 503 : 502, { 'content-type': 'application/json' });
  res.end(JSON.stringify(result));
}
