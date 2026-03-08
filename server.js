#!/usr/bin/env node
/**
 * AGC Global Express - Full Stack Freight Website
 * Self-contained Node.js server (no external npm needed beyond Node built-ins)
 * Uses: http, fs, path, crypto, url, querystring (all built-in)
 * Data stored in JSON files (simulates DB)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure data directories exist
[DATA_DIR, UPLOADS_DIR, path.join(UPLOADS_DIR, 'blogs')].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─── Data Layer ────────────────────────────────────────────────────────────
function readData(file) {
  const fpath = path.join(DATA_DIR, file + '.json');
  if (!fs.existsSync(fpath)) return [];
  try { return JSON.parse(fs.readFileSync(fpath, 'utf8')); } catch { return []; }
}

function writeData(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file + '.json'), JSON.stringify(data, null, 2));
}

// Initialize default admin
function initData() {
  const users = readData('users');
  if (!users.length) {
    writeData('users', [{
      id: 'admin-1',
      username: 'admin',
      password: hashPassword('Admin@123'),
      role: 'superadmin',
      name: 'Super Admin',
      email: 'admin@agcglobalexpress.com',
      createdAt: new Date().toISOString()
    }]);
  }
  if (!readData('queries').length) writeData('queries', []);
  if (!readData('blogs').length) writeData('blogs', []);
  if (!readData('rates').length) {
    writeData('rates', [
      { id: 'r1', origin: 'Delhi', destination: 'Mumbai', service: 'Express', perKg: 80, perBag: 150, minWeight: 1 },
      { id: 'r2', origin: 'Delhi', destination: 'Mumbai', service: 'Standard', perKg: 50, perBag: 100, minWeight: 1 },
      { id: 'r3', origin: 'Delhi', destination: 'Bangalore', service: 'Express', perKg: 90, perBag: 160, minWeight: 1 },
      { id: 'r4', origin: 'Delhi', destination: 'Chennai', service: 'Express', perKg: 95, perBag: 170, minWeight: 1 },
      { id: 'r5', origin: 'Mumbai', destination: 'Delhi', service: 'Express', perKg: 80, perBag: 150, minWeight: 1 },
      { id: 'r6', origin: 'Mumbai', destination: 'Bangalore', service: 'Express', perKg: 70, perBag: 130, minWeight: 1 },
      { id: 'r7', origin: 'Delhi', destination: 'London', service: 'Air Freight', perKg: 850, perBag: 1200, minWeight: 5 },
      { id: 'r8', origin: 'Delhi', destination: 'Dubai', service: 'Air Freight', perKg: 450, perBag: 800, minWeight: 5 },
      { id: 'r9', origin: 'Mumbai', destination: 'USA', service: 'Air Freight', perKg: 950, perBag: 1500, minWeight: 5 },
      { id: 'r10', origin: 'Delhi', destination: 'Singapore', service: 'Air Freight', perKg: 600, perBag: 1000, minWeight: 5 },
    ]);
  }
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'agc-salt-2024').digest('hex');
}

function generateToken(userId) {
  const payload = { userId, ts: Date.now() };
  const sig = crypto.createHmac('sha256', 'agc-jwt-secret').update(JSON.stringify(payload)).digest('hex');
  return Buffer.from(JSON.stringify({ ...payload, sig })).toString('base64');
}

function verifyToken(token) {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    const { sig, ...payload } = data;
    const expected = crypto.createHmac('sha256', 'agc-jwt-secret').update(JSON.stringify(payload)).digest('hex');
    if (sig !== expected) return null;
    if (Date.now() - data.ts > 24 * 60 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}

function getAuthUser(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return readData('users').find(u => u.id === decoded.userId) || null;
}

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// ─── MIME Types ────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf'
};

// ─── Multipart Parser (for file uploads) ──────────────────────────────────
function parseMultipart(body, boundary) {
  const parts = {};
  const bBuf = Buffer.from('--' + boundary);
  let start = body.indexOf(bBuf) + bBuf.length + 2;
  while (start < body.length) {
    const end = body.indexOf(bBuf, start);
    if (end === -1) break;
    const part = body.slice(start, end - 2);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) { start = end + bBuf.length + 2; continue; }
    const headers = part.slice(0, headerEnd).toString();
    const content = part.slice(headerEnd + 4);
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    if (nameMatch) {
      const name = nameMatch[1];
      if (filenameMatch) {
        parts[name] = { filename: filenameMatch[1], data: content, isFile: true };
      } else {
        parts[name] = content.toString();
      }
    }
    start = end + bBuf.length + 2;
  }
  return parts;
}

// ─── Response Helpers ──────────────────────────────────────────────────────
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filepath, mime) {
  try {
    const data = fs.readFileSync(filepath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not Found');
  }
}

// ─── API Router ────────────────────────────────────────────────────────────
async function handleAPI(req, res, pathname, body) {
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    return res.end();
  }

  let parsed = {};
  try {
    if (typeof body === 'string' && body) parsed = JSON.parse(body);
  } catch {}

  // ── Auth ──
  if (pathname === '/api/auth/login' && method === 'POST') {
    const users = readData('users');
    const user = users.find(u => u.username === parsed.username && u.password === hashPassword(parsed.password));
    if (!user) return sendJSON(res, 401, { error: 'Invalid credentials' });
    const token = generateToken(user.id);
    return sendJSON(res, 200, { token, user: { id: user.id, name: user.name, role: user.role, username: user.username } });
  }

  // ── Queries (public submit) ──
  if (pathname === '/api/queries' && method === 'POST') {
    const queries = readData('queries');
    const q = { id: generateId(), ...parsed, status: 'pending', createdAt: new Date().toISOString() };
    queries.push(q);
    writeData('queries', queries);
    return sendJSON(res, 201, { success: true, id: q.id });
  }

  // ── Rate Calculator (public) ──
  if (pathname === '/api/rates/calculate' && method === 'POST') {
    const { origin, destination, service, bags, weight } = parsed;
    const rates = readData('rates');
    const rate = rates.find(r =>
      r.origin.toLowerCase() === (origin || '').toLowerCase() &&
      r.destination.toLowerCase() === (destination || '').toLowerCase() &&
      r.service.toLowerCase() === (service || '').toLowerCase()
    );
    if (!rate) return sendJSON(res, 404, { error: 'No rate found for this route/service' });
    const w = parseFloat(weight) || 0;
    const b = parseInt(bags) || 0;
    const weightCharge = Math.max(w, rate.minWeight) * rate.perKg;
    const bagCharge = b * rate.perBag;
    const subtotal = weightCharge + bagCharge;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    return sendJSON(res, 200, {
      origin, destination, service, bags: b, weight: w,
      weightCharge, bagCharge, subtotal, gst: parseFloat(gst.toFixed(2)),
      total: parseFloat(total.toFixed(2)), currency: 'INR', rate
    });
  }

  if (pathname === '/api/rates/options' && method === 'GET') {
    const rates = readData('rates');
    const origins = [...new Set(rates.map(r => r.origin))];
    const destinations = [...new Set(rates.map(r => r.destination))];
    const services = [...new Set(rates.map(r => r.service))];
    return sendJSON(res, 200, { origins, destinations, services });
  }

  // ── Blogs (public get) ──
  if (pathname === '/api/blogs' && method === 'GET') {
    const blogs = readData('blogs').filter(b => b.published).reverse();
    return sendJSON(res, 200, blogs);
  }
  if (pathname.startsWith('/api/blogs/') && method === 'GET') {
    const slug = pathname.split('/api/blogs/')[1];
    const blog = readData('blogs').find(b => b.slug === slug && b.published);
    if (!blog) return sendJSON(res, 404, { error: 'Not found' });
    return sendJSON(res, 200, blog);
  }

  // ── Protected routes ──
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

  // ── Admin: Queries ──
  if (pathname === '/api/admin/queries' && method === 'GET') {
    let queries = readData('queries');
    if (user.role === 'agent') {
      queries = queries.filter(q => q.status !== 'accepted' || q.acceptedBy === user.id);
    }
    return sendJSON(res, 200, queries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  if (pathname.match(/^\/api\/admin\/queries\/[^/]+\/accept$/) && method === 'PATCH') {
    const id = pathname.split('/')[4];
    const queries = readData('queries');
    const idx = queries.findIndex(q => q.id === id);
    if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
    queries[idx].status = 'accepted';
    queries[idx].acceptedBy = user.id;
    queries[idx].acceptedByName = user.name;
    queries[idx].acceptedAt = new Date().toISOString();
    writeData('queries', queries);
    return sendJSON(res, 200, queries[idx]);
  }

  if (pathname.match(/^\/api\/admin\/queries\/[^/]+$/) && method === 'DELETE') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const id = pathname.split('/api/admin/queries/')[1];
    const queries = readData('queries').filter(q => q.id !== id);
    writeData('queries', queries);
    return sendJSON(res, 200, { success: true });
  }

  // ── Admin: Users ──
  if (pathname === '/api/admin/users' && method === 'GET') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const users = readData('users').map(u => ({ ...u, password: undefined }));
    return sendJSON(res, 200, users);
  }

  if (pathname === '/api/admin/users' && method === 'POST') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const users = readData('users');
    if (users.find(u => u.username === parsed.username)) return sendJSON(res, 400, { error: 'Username taken' });
    const newUser = {
      id: generateId(), username: parsed.username,
      password: hashPassword(parsed.password), role: parsed.role || 'agent',
      name: parsed.name, email: parsed.email, createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeData('users', users);
    return sendJSON(res, 201, { ...newUser, password: undefined });
  }

  if (pathname.match(/^\/api\/admin\/users\/[^/]+$/) && method === 'DELETE') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const id = pathname.split('/api/admin/users/')[1];
    if (id === user.id) return sendJSON(res, 400, { error: 'Cannot delete yourself' });
    writeData('users', readData('users').filter(u => u.id !== id));
    return sendJSON(res, 200, { success: true });
  }

  // ── Admin: Rates ──
  if (pathname === '/api/admin/rates' && method === 'GET') {
    return sendJSON(res, 200, readData('rates'));
  }

  if (pathname === '/api/admin/rates' && method === 'POST') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const rates = readData('rates');
    const rate = { id: generateId(), ...parsed };
    rates.push(rate);
    writeData('rates', rates);
    return sendJSON(res, 201, rate);
  }

  if (pathname.match(/^\/api\/admin\/rates\/[^/]+$/) && method === 'DELETE') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const id = pathname.split('/api/admin/rates/')[1];
    writeData('rates', readData('rates').filter(r => r.id !== id));
    return sendJSON(res, 200, { success: true });
  }

  if (pathname.match(/^\/api\/admin\/rates\/[^/]+$/) && method === 'PUT') {
    if (user.role !== 'superadmin') return sendJSON(res, 403, { error: 'Forbidden' });
    const id = pathname.split('/api/admin/rates/')[1];
    const rates = readData('rates');
    const idx = rates.findIndex(r => r.id === id);
    if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
    rates[idx] = { ...rates[idx], ...parsed };
    writeData('rates', rates);
    return sendJSON(res, 200, rates[idx]);
  }

  // ── Admin: Blogs ──
  if (pathname === '/api/admin/blogs' && method === 'GET') {
    return sendJSON(res, 200, readData('blogs').reverse());
  }

  if (pathname === '/api/admin/blogs' && method === 'POST') {
    // Handle multipart for blog with image
    const blogs = readData('blogs');
    const slug = (parsed.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const blog = {
      id: generateId(), title: parsed.title, slug, content: parsed.content,
      excerpt: parsed.excerpt || parsed.content?.substring(0, 150) + '...',
      author: user.name, authorId: user.id, tags: parsed.tags || '',
      metaTitle: parsed.metaTitle || parsed.title,
      metaDesc: parsed.metaDesc || parsed.excerpt || '',
      image: parsed.image || '', published: parsed.published === 'true' || parsed.published === true,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    blogs.push(blog);
    writeData('blogs', blogs);
    return sendJSON(res, 201, blog);
  }

  if (pathname.match(/^\/api\/admin\/blogs\/[^/]+$/) && method === 'PUT') {
    const id = pathname.split('/api/admin/blogs/')[1];
    const blogs = readData('blogs');
    const idx = blogs.findIndex(b => b.id === id);
    if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
    blogs[idx] = { ...blogs[idx], ...parsed, updatedAt: new Date().toISOString() };
    writeData('blogs', blogs);
    return sendJSON(res, 200, blogs[idx]);
  }

  if (pathname.match(/^\/api\/admin\/blogs\/[^/]+$/) && method === 'DELETE') {
    const id = pathname.split('/api/admin/blogs/')[1];
    writeData('blogs', readData('blogs').filter(b => b.id !== id));
    return sendJSON(res, 200, { success: true });
  }

  // ── Admin: Dashboard Stats ──
  if (pathname === '/api/admin/stats' && method === 'GET') {
    const queries = readData('queries');
    const blogs = readData('blogs');
    const users = readData('users');
    return sendJSON(res, 200, {
      totalQueries: queries.length,
      pendingQueries: queries.filter(q => q.status === 'pending').length,
      acceptedQueries: queries.filter(q => q.status === 'accepted').length,
      totalBlogs: blogs.length,
      publishedBlogs: blogs.filter(b => b.published).length,
      totalUsers: users.length
    });
  }

  return sendJSON(res, 404, { error: 'API endpoint not found' });
}

// ─── Static File Server ────────────────────────────────────────────────────
function serveStatic(req, res, pathname) {
  // Serve uploaded files
  if (pathname.startsWith('/uploads/')) {
    const fp = path.join(__dirname, pathname);
    if (fs.existsSync(fp)) {
      const ext = path.extname(fp);
      return sendFile(res, fp, MIME[ext] || 'application/octet-stream');
    }
    return res.writeHead(404) || res.end();
  }

  // Serve public files
  let fp = path.join(PUBLIC_DIR, pathname);
  if (pathname === '/' || pathname === '') fp = path.join(PUBLIC_DIR, 'index.html');

  // SPA fallback for /admin routes
  if (pathname.startsWith('/admin')) fp = path.join(PUBLIC_DIR, 'admin.html');
  if (pathname.startsWith('/blog')) fp = path.join(PUBLIC_DIR, 'blog.html');

  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) {
    fp = path.join(fp, 'index.html');
  }

  if (!fs.existsSync(fp)) {
    fp = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(fp);
  const mime = MIME[ext] || 'text/html';
  sendFile(res, fp, mime);
}

// ─── Main Server ───────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/api/') || req.method === 'OPTIONS') {
    let body = Buffer.alloc(0);
    req.on('data', chunk => { body = Buffer.concat([body, chunk]); });
    req.on('end', () => {
      const ct = req.headers['content-type'] || '';
      if (ct.includes('multipart/form-data')) {
        const boundaryMatch = ct.match(/boundary=(.+)/);
        if (boundaryMatch) {
          const parts = parseMultipart(body, boundaryMatch[1]);
          // Save any file uploads
          Object.keys(parts).forEach(key => {
            if (parts[key].isFile && parts[key].data.length > 0) {
              const ext = path.extname(parts[key].filename) || '.jpg';
              const fname = generateId() + ext;
              const fpath = path.join(UPLOADS_DIR, 'blogs', fname);
              fs.writeFileSync(fpath, parts[key].data);
              parts[key] = '/uploads/blogs/' + fname;
            }
          });
          handleAPI(req, res, pathname, null).catch(e => sendJSON(res, 500, { error: e.message }));
          return;
        }
      }
      handleAPI(req, res, pathname, body.toString()).catch(e => sendJSON(res, 500, { error: e.message }));
    });
  } else {
    serveStatic(req, res, pathname);
  }
});

initData();
server.listen(PORT, () => {
  console.log(`\n🚀 AGC Global Express running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔑 Login: admin / Admin@123\n`);
});
