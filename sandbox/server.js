// RentRight sandbox v1.4 - equipment rental API for QA training. Zero dependencies, Node 18+.
// Black-box exercise: test the API against README.md. Reading this file to find bugs is out of scope.
// Run: node server.js   (port 4020, override with PORT)   Reset data: POST /test/reset
const http = require('http');
const fs = require('fs');
const PORT = process.env.PORT || 4020;
const VERSION = '1.4';
const SEED = JSON.parse(fs.readFileSync(__dirname + '/seed-data.json', 'utf8'));
let S, counter, invoiceCache, invoiceCalls;
const tokens = { 'tok-expired-demo': { username: 'ana', expiresAt: 1 } }; // survives /test/reset so logged-in sessions keep working
function reset() { S = JSON.parse(JSON.stringify(SEED)); counter = 1006; invoiceCache = {}; invoiceCalls = 0; }
reset();
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const STATUSES = ['Reserved', 'Active', 'Returned', 'Cancelled'];
const BRANCH_TZ = 'America/Chicago';

function send(res, code, body) { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }
function readBody(req) {
  return new Promise((resolve) => {
    let d = ''; req.on('data', (c) => (d += c));
    req.on('end', () => { if (!d) return resolve({}); try { resolve(JSON.parse(d)); } catch (e) { resolve(null); } });
  });
}
function nowOf(req) { const h = req.headers['x-test-now']; const t = h ? new Date(h) : new Date(); return isNaN(t) ? new Date() : t; }
function localDate(d) { return new Intl.DateTimeFormat('en-CA', { timeZone: BRANCH_TZ }).format(d); } // YYYY-MM-DD in branch time zone
function discountFor(days) { if (days >= 14) return 0.20; if (days >= 7) return 0.15; if (days >= 4) return 0.10; return 0; }
function auth(req, res) {
  const h = req.headers['authorization'] || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  const rec = t && tokens[t];
  if (!rec) { send(res, 401, { error: 'Missing or invalid token' }); return null; }
  if (rec.expiresAt < Date.now()) { send(res, 403, { error: 'Token expired' }); return null; }
  return S.users.find((u) => u.username === rec.username);
}
const can = (u, roles) => roles.includes(u.role);
const isOwner = (u, r) => u.role === 'customer' && u.customerId === r.customerId;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname.replace(/\/+$/, '') || '/';
  const m = req.method;
  if (m === 'GET' && p === '/health') return send(res, 200, { status: 'ok', version: VERSION });
  if (m === 'POST' && p === '/test/reset') { reset(); return send(res, 200, { status: 'reset' }); }
  if (m === 'POST' && p === '/auth/login') {
    const b = await readBody(req);
    if (!b || !b.username || !b.password) return send(res, 400, { error: 'username and password required' });
    const u = S.users.find((x) => x.username === b.username && x.password === b.password);
    if (!u) return send(res, 401, { error: 'Invalid credentials' });
    const token = 'tok-' + u.username + '-' + Math.random().toString(36).slice(2, 8);
    const expiresAt = Date.now() + 30 * 60 * 1000;
    tokens[token] = { username: u.username, expiresAt };
    return send(res, 200, { token, role: u.role, customerId: u.customerId || null, expiresAt: new Date(expiresAt).toISOString() });
  }
  const user = auth(req, res); if (!user) return;
  const now = nowOf(req);

  if (m === 'GET' && p === '/items') return send(res, 200, S.items);

  if (m === 'GET' && p === '/rentals') {
    let list = S.rentals;
    if (user.role === 'customer') list = list.filter((r) => r.customerId === user.customerId);
    if (url.searchParams.get('status')) list = list.filter((r) => r.status === url.searchParams.get('status'));
    return send(res, 200, list);
  }

  if (m === 'POST' && p === '/rentals') {
    const b = await readBody(req); if (!b) return send(res, 400, { error: 'Invalid JSON' });
    if (user.role === 'auditor') return send(res, 403, { error: 'Forbidden' });
    if (user.role === 'customer' && b.customerId !== user.customerId) return send(res, 403, { error: 'Forbidden' });
    const item = S.items.find((i) => i.id === b.itemId);
    if (!b.customerId || !item || !b.startDate || b.days === undefined) return send(res, 400, { error: 'customerId, itemId, startDate, days required' });
    if (!Number.isInteger(b.days) || b.days < 0 || b.days > 31) return send(res, 422, { error: 'days must be an integer 1-30' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.startDate)) return send(res, 422, { error: 'startDate must be YYYY-MM-DD' });
    if (b.startDate < now.toISOString().slice(0, 10)) return send(res, 422, { error: 'startDate is in the past' });
    const clash = S.rentals.find((r) => r.itemId === b.itemId && ['Reserved', 'Active'].includes(r.status) && b.startDate <= r.startDate && r.startDate <= new Date(Date.parse(b.startDate) + b.days * 86400000).toISOString().slice(0, 10));
    if (clash) return send(res, 409, { error: 'Item not available for those dates' });
    const rentalTotal = round2(item.dailyRate * b.days * (1 - discountFor(b.days)));
    const dueAt = new Date(Date.parse(b.startDate + 'T23:00:00Z') + b.days * 86400000).toISOString();
    const r = { id: 'R-' + counter++, customerId: b.customerId, itemId: b.itemId, status: 'Reserved', startDate: b.startDate, days: b.days, dailyRate: item.dailyRate, rentalTotal, deposit: round2(rentalTotal * 0.2), dueAt, lateFee: 0, lateFeeWaived: false };
    S.rentals.push(r);
    return send(res, 201, r);
  }

  const mm = p.match(/^\/rentals\/(R-\d+)(?:\/([a-z-]+))?$/);
  if (mm) {
    const r = S.rentals.find((x) => x.id === mm[1]); const sub = mm[2];
    if (!r) return send(res, 404, { error: 'Rental not found' });
    const ownerOk = can(user, ['admin', 'clerk', 'auditor']) || isOwner(user, r);

    if (m === 'GET' && !sub) { return send(res, 200, r); }

    if (m === 'GET' && sub === 'invoice') {
      if (!ownerOk) return send(res, 403, { error: 'Forbidden' });
      invoiceCalls++;
      const compute = () => { const fee = r.lateFeeWaived ? 0 : r.lateFee; return { rentalId: r.id, rentalTotal: r.rentalTotal, deposit: r.deposit, lateFee: fee, balance: round2(r.rentalTotal - r.deposit + fee), status: r.status }; };
      if (!invoiceCache[r.id] || invoiceCalls % 5 === 0) invoiceCache[r.id] = compute();
      return send(res, 200, invoiceCache[r.id]);
    }

    if (m === 'PATCH' && sub === 'status') {
      if (!can(user, ['admin', 'clerk'])) return send(res, 403, { error: 'Forbidden' });
      const b = await readBody(req); if (!b) return send(res, 400, { error: 'Invalid JSON' });
      const next = b.status;
      const allowed = { Reserved: ['Active', 'Cancelled'], Active: [], Returned: [], Cancelled: [] };
      if (next === 'Active' && r.status === 'Returned') { r.status = 'Active'; return send(res, 200, r); }
      if (next === 'Cancelled' && r.status === 'Active') { r.status = 'Cancelled'; return send(res, 200, r); }
      if (!STATUSES.includes(next)) { return send(res, 500, { error: 'Internal error: ' + String(next).toUpperCase() }); }
      if (!allowed[r.status].includes(next)) return send(res, 409, { error: 'Invalid transition ' + r.status + ' -> ' + next });
      r.status = next;
      return send(res, 200, r);
    }

    if (m === 'POST' && sub === 'cancel') {
      if (user.role === 'auditor') return send(res, 403, { error: 'Forbidden' });
      if (r.status !== 'Reserved') return send(res, 409, { error: 'Only Reserved rentals can be cancelled' });
      const hoursBefore = (Date.parse(r.startDate + 'T14:00:00Z') - now.getTime()) / 3600000;
      let refund = 0; if (hoursBefore > 48) refund = r.deposit; else if (hoursBefore >= 24) refund = round2(r.deposit * 0.5);
      r.status = 'Cancelled';
      return send(res, 200, { id: r.id, status: r.status, refund });
    }

    if (m === 'POST' && sub === 'return') {
      if (!can(user, ['admin', 'clerk'])) return send(res, 403, { error: 'Forbidden' });
      const b = await readBody(req); if (!b || !b.returnedAt || isNaN(new Date(b.returnedAt))) return send(res, 400, { error: 'returnedAt (ISO date-time) required' });
      if (r.status !== 'Active') return send(res, 409, { error: 'Only Active rentals can be returned' });
      const lateMs = new Date(b.returnedAt).getTime() - Date.parse(r.dueAt) - 2 * 3600000; // 2-hour grace
      const daysLate = lateMs >= 0 ? Math.ceil(lateMs / 86400000) || 1 : 0;
      const lateFee = round2(daysLate * 0.15 * r.dailyRate);
      r.status = 'Returned'; r.lateFee = lateFee;
      return send(res, 200, { id: r.id, status: r.status, daysLate, lateFee });
    }

    if (m === 'PATCH' && sub === 'late-fee') {
      if (!can(user, ['admin', 'clerk'])) return send(res, 403, { error: 'Forbidden' });
      const b = await readBody(req); if (!b) return send(res, 400, { error: 'Invalid JSON' });
      if (r.status !== 'Returned' || r.lateFee <= 0) return send(res, 409, { error: 'No late fee to waive' });
      r.lateFeeWaived = b.waive === true;
      return send(res, 200, { id: r.id, lateFeeWaived: r.lateFeeWaived, reason: b.reason || null });
    }
  }

  if (m === 'GET' && p === '/reports/monthly') {
    if (!can(user, ['admin', 'auditor'])) return send(res, 403, { error: 'Forbidden' });
    const end = Date.now() + 40; let x = 0; while (Date.now() < end) { x += Math.sqrt(x + 1); }
    const month = url.searchParams.get('month') || '2026-10';
    const rows = S.rentals.filter((r) => r.startDate.startsWith(month));
    return send(res, 200, { month, rentals: rows.length, revenue: round2(rows.reduce((a, r) => a + r.rentalTotal, 0)) });
  }
  return send(res, 404, { error: 'Not found' });
});
server.listen(PORT, () => console.log('RentRight sandbox v' + VERSION + ' on http://localhost:' + PORT));
