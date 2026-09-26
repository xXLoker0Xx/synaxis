import { createServer } from 'node:http';
import handler from '../api/planet-positions.ts';

const PORT = Number(process.env.HORIZONS_API_PORT ?? 3001);

function createResponse(nodeResponse) {
  const response = {
    statusCode: 200,
    setHeader(name, value) {
      nodeResponse.setHeader(name, value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      nodeResponse.statusCode = this.statusCode;
      nodeResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
      nodeResponse.end(JSON.stringify(payload));
      return this;
    },
  };
  return response;
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname !== '/api/planet-positions') {
    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Local route not found.' }));
    return;
  }

  const query = Object.fromEntries(url.searchParams.entries());
  try {
    await handler({ method: request.method, query }, createResponse(response));
  } catch (error) {
    console.error('[Horizons API]', error);
    if (!response.headersSent) {
      response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'Unexpected error in local Horizons proxy.' }));
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Synaxis Horizons API local: http://localhost:${PORT}/api/planet-positions`);
});
