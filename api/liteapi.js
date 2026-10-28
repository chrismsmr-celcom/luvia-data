// Proxy Vercel : garde la clé LiteAPI côté serveur (variable d'env LITEAPI_KEY)
const BASE = 'https://da.liteapi.travel';
const OK = ['/analytics/', '/commissions/report', '/bookings/'];

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const path = String(req.query.path || '');
  if (!OK.some((p) => path.startsWith(p)) || path.includes('..')) {
    return res.status(400).send(JSON.stringify({ error: 'path not allowed' }));
  }
  // Même code que la page de connexion (ACCESS_CODE pour le changer sans toucher au code)
  if (req.headers['x-access'] !== (process.env.ACCESS_CODE || 'LUV-7858')) {
    return res.status(401).send(JSON.stringify({ error: 'unauthorized' }));
  }
  const key = process.env.LITEAPI_KEY;
  if (!key) return res.status(500).send(JSON.stringify({ error: 'LITEAPI_KEY missing' }));
  try {
    const r = await fetch(BASE + path, {
      method: req.method,
      headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined,
    });
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.status(r.status).send(await r.text());
  } catch (e) {
    res.status(502).send(JSON.stringify({ error: 'upstream unreachable' }));
  }
};
