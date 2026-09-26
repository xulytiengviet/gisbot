/** GISBot on Cloudflare Workers. Reuses the audited Pages API handlers. */
import { onRequestGet as health } from '../functions/api/health.js';
import { onRequestGet as geocode } from '../functions/api/geocode.js';
import { onRequestGet as sources } from '../functions/api/sources.js';
import { onRequestPost as chat } from '../functions/api/chat.js';

const routes = {
  '/api/health': { GET: health },
  '/api/geocode': { GET: geocode },
  '/api/sources': { GET: sources },
  '/api/chat': { POST: chat },
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'geolocation=(self), microphone=(self), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.tile.opentopomap.org https://unpkg.com; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

function jsonError(error, status, allow) {
  return Response.json({ error }, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...(allow ? { Allow: allow } : {}),
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/')) {
      const route = routes[path];
      if (!route) return jsonError('API không tồn tại.', 404);
      const handler = route[request.method];
      if (!handler) return jsonError('Phương thức không được hỗ trợ.', 405, Object.keys(route).join(', '));
      return handler({ request, env, context: ctx });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError('Chỉ hỗ trợ GET và HEAD cho tài nguyên tĩnh.', 405, 'GET, HEAD');
    }
    if (!env.ASSETS?.fetch) {
      return jsonError('Chưa cấu hình ASSETS trong Cloudflare Workers.', 503);
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
