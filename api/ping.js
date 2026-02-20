// Vercel serverless: GET /api/ping?host=IP
// Pings http://IP:9998/ and returns { ok: true, ms } or { ok: false }.
const PING_TIMEOUT_MS = 8000;

function isAllowedHost(host) {
    if (!host || typeof host !== 'string') return false;
    const trimmed = host.trim();
    if (trimmed.length === 0) return false;
    // Allow IPv4 and hostnames (no protocol, no path)
    if (/^[\d.]+$/.test(trimmed)) return true; // IPv4
    if (/^[a-zA-Z0-9.-]+$/.test(trimmed)) return true; // hostname
    return false;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    const host = req.query.host;
    if (!isAllowedHost(host)) {
        return res.status(400).json({ error: 'Missing or invalid host' });
    }
    const url = `http://${host.trim()}:9998/?_=${Date.now()}`;
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    try {
        await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        const ms = Date.now() - start;
        return res.status(200).json({ ok: true, ms });
    } catch (e) {
        clearTimeout(timeout);
        return res.status(200).json({ ok: false });
    }
}
