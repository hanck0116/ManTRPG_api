import { createServer, type IncomingMessage } from 'node:http';
import { handleTurn } from './api/routes.js';
import { parsePlayerInput } from './api/schemas.js';

const port = Number(process.env.PORT ?? 3000);

const readJson = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request as AsyncIterable<Buffer>) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};

const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET' && request.url === '/health') {
    response.end(JSON.stringify({ ok: true, service: 'ManTRPG_api' }));
    return;
  }

  if (request.method === 'POST' && request.url === '/turn') {
    try {
      const input = parsePlayerInput(await readJson(request));
      response.end(JSON.stringify(handleTurn(input)));
    } catch (error) {
      response.statusCode = 400;
      response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }));
    }
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ ok: false, error: 'not found' }));
});

server.listen(port, () => {
  console.log(`ManTRPG_api listening on http://localhost:${port}`);
});
