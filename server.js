#!/usr/bin/env node
/**
 * AGC Global Express — Full Stack Server
 * NEW: Login lockout, email alerts, change password, forgot/reset password
 * Zero external dependencies — pure Node.js built-ins only
 */

const http   = require('http');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const url    = require('url');

const PORT        = process.env.PORT || 3000;
const DATA_DIR    = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR  = path.join(__dirname, 'public');

// ── Email config — set these in Railway environment variables ──────────────
// Option A: SendGrid (recommended — free 100 emails/day)
//   SENDGRID_KEY = SG.xxxxxxxxxxxx
// Option B: Gmail SMTP
//   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587
//   SMTP_USER=you@gmail.com   SMTP_PASS=your-app-password
const SENDGRID_KEY = process.env.SENDGRID_KEY || '';
const SMTP_HOST    = process.env.SMTP_HOST    || '';
const SMTP_PORT    = parseInt(process.env.SMTP_PORT) || 587;
const SMTP_USER    = process.env.SMTP_USER    || '';
const SMTP_PASS    = process.env.SMTP_PASS    || '';
const SMTP_FROM    = process.env.SMTP_FROM    || SMTP_USER || 'noreply@agcglobalexpress.com';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  || '';
const SITE_URL     = process.env.SITE_URL     || 'http://localhost:' + PORT;

// Ensure directories
[DATA_DIR, UPLOADS_DIR, path.join(UPLOADS_DIR, 'blogs')].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Data helpers ──────────────────────────────────────────────────────────
function readData(file) {
  const fp = path.join(DATA_DIR, file + '.json');
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}
function writeData(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file + '.json'), JSON.stringify(data, null, 2));
}

// ── Login lockout (in-memory) ─────────────────────────────────────────────
const attempts = {};
const MAX_TRIES = 5;
const LOCK_MS   = 15 * 60 * 1000; // 15 min

function checkLock(username) {
  const a = attempts[username];
  if (a && a.lockedUntil && Date.now() < a.lockedUntil) {
    const m = Math.ceil((a.lockedUntil - Date.now()) / 60000);
    return `Account locked for ${m} more minute(s). Too many failed attempts.`;
  }
  return null;
}
function failAttempt(username) {
  if (!attempts[username]) attempts[username] = { count: 0, lockedUntil: null };
  attempts[username].count++;
  if (attempts[username].count >= MAX_TRIES) {
    attempts[username].lockedUntil = Date.now() + LOCK_MS;
    attempts[username].count = 0;
  }
}
function clearLock(username) { delete attempts[username]; }

// ── Init default data ─────────────────────────────────────────────────────
function initData() {
  if (!readData('users').length) {
    writeData('users', [{
      id: 'admin-1', username: 'admin',
      password: hashPw('Admin@123'), role: 'superadmin',
      name: 'Super Admin',
      email: ADMIN_EMAIL || 'admin@agcglobalexpress.com',
      createdAt: new Date().toISOString()
    }]);
  }
  ['queries','blogs','resets'].forEach(f => { if (!readData(f).length) writeData(f, []); });
  if (!readData('rates').length) {
    writeData('rates', [
      {id:'r1', origin:'Delhi',  destination:'Mumbai',    service:'Express',     perKg:80,  perBag:150,  minWeight:1},
      {id:'r2', origin:'Delhi',  destination:'Mumbai',    service:'Standard',    perKg:50,  perBag:100,  minWeight:1},
      {id:'r3', origin:'Delhi',  destination:'Bangalore', service:'Express',     perKg:90,  perBag:160,  minWeight:1},
      {id:'r4', origin:'Delhi',  destination:'Chennai',   service:'Express',     perKg:95,  perBag:170,  minWeight:1},
      {id:'r5', origin:'Mumbai', destination:'Delhi',     service:'Express',     perKg:80,  perBag:150,  minWeight:1},
      {id:'r6', origin:'Mumbai', destination:'Bangalore', service:'Express',     perKg:70,  perBag:130,  minWeight:1},
      {id:'r7', origin:'Delhi',  destination:'London',    service:'Air Freight', perKg:850, perBag:1200, minWeight:5},
      {id:'r8', origin:'Delhi',  destination:'Dubai',     service:'Air Freight', perKg:450, perBag:800,  minWeight:5},
      {id:'r9', origin:'Mumbai', destination:'USA',       service:'Air Freight', perKg:950, perBag:1500, minWeight:5},
      {id:'r10',origin:'Delhi',  destination:'Singapore', service:'Air Freight', perKg:600, perBag:1000, minWeight:5},
    ]);
  }
}

// ── Crypto ────────────────────────────────────────────────────────────────
function hashPw(pw) {
  return crypto.createHash('sha256').update(pw + 'agc-salt-2024').digest('hex');
}
function mkToken(userId) {
  const p = { userId, ts: Date.now() };
  const sig = crypto.createHmac('sha256','agc-jwt-secret-v2').update(JSON.stringify(p)).digest('hex');
  return Buffer.from(JSON.stringify({...p,sig})).toString('base64');
}
function verifyToken(token) {
  try {
    const d = JSON.parse(Buffer.from(token,'base64').toString());
    const {sig,...p} = d;
    const exp = crypto.createHmac('sha256','agc-jwt-secret-v2').update(JSON.stringify(p)).digest('hex');
    if (sig !== exp) return null;
    if (Date.now() - d.ts > 24*60*60*1000) return null;
    return d;
  } catch { return null; }
}
function authUser(req) {
  const t = (req.headers['authorization']||'').replace('Bearer ','');
  if (!t) return null;
  const d = verifyToken(t);
  if (!d) return null;
  return readData('users').find(u => u.id === d.userId) || null;
}
function genId() { return crypto.randomBytes(8).toString('hex'); }

// ── Email via SendGrid HTTP ────────────────────────────────────────────────
function sendMail({ to, subject, html }) {
  if (!to) { console.log('[EMAIL] No recipient, skipping'); return Promise.resolve(false); }

  // SendGrid API (preferred)
  if (SENDGRID_KEY) {
    return new Promise(resolve => {
      const body = JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SMTP_FROM, name: 'AGC Global Express' },
        subject, content: [{ type: 'text/html', value: html }]
      });
      const req = https.request({
        hostname: 'api.sendgrid.com', path: '/v3/mail/send', method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + SENDGRID_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, res => {
        res.resume();
        const ok = res.statusCode >= 200 && res.statusCode < 300;
        console.log(`[EMAIL] SendGrid → ${to} | Status: ${res.statusCode}`);
        resolve(ok);
      });
      req.on('error', e => { console.log('[EMAIL ERROR]', e.message); resolve(false); });
      req.write(body); req.end();
    });
  }

  // Fallback: log to console (configure SendGrid or SMTP env vars to enable real sending)
  console.log(`\n[EMAIL — not configured]\nTo: ${to}\nSubject: ${subject}\n(Set SENDGRID_KEY or SMTP env vars in Railway to enable real emails)\n`);
  return Promise.resolve(false);
}

// ── Email templates ────────────────────────────────────────────────────────
function tplQuery(q) {
  const adminEmail = ADMIN_EMAIL || readData('users').find(u=>u.role==='superadmin')?.email || '';
  return {
    to: adminEmail,
    subject: `🚢 New Query from ${q.name} — ${q.service||'General'} (${q.origin||'?'} → ${q.destination||'?'})`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0B1F35,#1a2e44);padding:24px;text-align:center">
        <h2 style="color:#fff;margin:0">🚢 New Customer Query</h2>
        <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px">AGC Global Express Admin Alert</p>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:600;color:#64748b;width:130px">👤 Name</td><td style="padding:8px 12px">${q.name}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#64748b">🏢 Company</td><td style="padding:8px 12px">${q.company||'—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:600;color:#64748b">✉️ Email</td><td style="padding:8px 12px"><a href="mailto:${q.email}">${q.email}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#64748b">📞 Phone</td><td style="padding:8px 12px">${q.phone||'—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:600;color:#64748b">📍 Route</td><td style="padding:8px 12px"><strong>${q.origin||'—'} → ${q.destination||'—'}</strong></td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#64748b">🚀 Service</td><td style="padding:8px 12px">${q.service||'—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:600;color:#64748b">📦 Bags/Wt</td><td style="padding:8px 12px">${q.bags||'—'} bags · ${q.weight||'—'} kg</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#64748b">💬 Message</td><td style="padding:8px 12px">${q.message||'—'}</td></tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="${SITE_URL}/admin" style="background:#E63B2E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">View in Admin Panel →</a>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">Ref: #${(q.id||'').toUpperCase().slice(0,8)} · ${new Date(q.createdAt).toLocaleString('en-IN')}</p>
      </div>
    </div>`
  };
}

function tplReset(user, link) {
  return {
    to: user.email,
    subject: '🔑 Reset your AGC Admin password',
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0B1F35,#1a2e44);padding:28px;text-align:center">
        <h2 style="color:#fff;margin:0">🔑 Password Reset</h2>
        <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px">AGC Global Express Admin Portal</p>
      </div>
      <div style="padding:32px;text-align:center">
        <p style="font-size:15px;color:#374151">Hi <strong>${user.name}</strong>,</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.7">We received a request to reset your password.<br>Click the button below — this link expires in <strong>1 hour</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#E63B2E;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">Reset My Password →</a>
        <p style="font-size:13px;color:#9ca3af">If you didn't request this, just ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
        <p style="font-size:11px;color:#d1d5db;word-break:break-all">Or copy: <a href="${link}" style="color:#E63B2E">${link}</a></p>
      </div>
    </div>`
  };
}

// ── MIME ──────────────────────────────────────────────────────────────────
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.webp':'image/webp','.woff2':'font/woff2','.pdf':'application/pdf'
};

function sendJSON(res, status, data) {
  res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  res.end(JSON.stringify(data));
}
function sendFile(res, fp, mime) {
  try { res.writeHead(200,{'Content-Type':mime}); res.end(fs.readFileSync(fp)); }
  catch { res.writeHead(404); res.end('Not Found'); }
}

// ── Multipart ─────────────────────────────────────────────────────────────
function parseMultipart(body, boundary) {
  const parts = {}, bBuf = Buffer.from('--'+boundary);
  let start = body.indexOf(bBuf) + bBuf.length + 2;
  while (start < body.length) {
    const end = body.indexOf(bBuf, start);
    if (end === -1) break;
    const part = body.slice(start, end-2);
    const he = part.indexOf('\r\n\r\n');
    if (he === -1) { start = end+bBuf.length+2; continue; }
    const hdrs = part.slice(0,he).toString();
    const content = part.slice(he+4);
    const nm = hdrs.match(/name="([^"]+)"/);
    const fm = hdrs.match(/filename="([^"]+)"/);
    if (nm) parts[nm[1]] = fm ? {filename:fm[1],data:content,isFile:true} : content.toString();
    start = end+bBuf.length+2;
  }
  return parts;
}

// ── API ───────────────────────────────────────────────────────────────────
async function handleAPI(req, res, pathname, body) {
  const method = req.method;
  if (method==='OPTIONS') {
    res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,PATCH','Access-Control-Allow-Headers':'Content-Type,Authorization'});
    return res.end();
  }
  let p = {};
  try { if (typeof body==='string'&&body) p = JSON.parse(body); } catch {}

  // ─ LOGIN with lockout ───────────────────────────────────────────────────
  if (pathname==='/api/auth/login' && method==='POST') {
    const lockMsg = checkLock(p.username);
    if (lockMsg) return sendJSON(res, 429, {error: lockMsg});
    const users = readData('users');
    const user = users.find(u => u.username===p.username && u.password===hashPw(p.password));
    if (!user) {
      failAttempt(p.username);
      const a = attempts[p.username];
      const left = a ? Math.max(0, MAX_TRIES-a.count) : MAX_TRIES;
      return sendJSON(res, 401, {error:`Invalid credentials. ${left} attempt(s) left before 15-min lockout.`});
    }
    clearLock(p.username);
    return sendJSON(res, 200, {
      token: mkToken(user.id),
      user: {id:user.id, name:user.name, role:user.role, username:user.username, email:user.email}
    });
  }

  // ─ FORGOT PASSWORD ──────────────────────────────────────────────────────
  if (pathname==='/api/auth/forgot-password' && method==='POST') {
    const users = readData('users');
    const user = users.find(u => u.email && u.email.toLowerCase()===(p.email||'').toLowerCase());
    if (user) {
      const token   = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 60*60*1000;
      const resets  = readData('resets').filter(r => r.userId !== user.id);
      resets.push({token, userId:user.id, expires});
      writeData('resets', resets);
      const link = `${SITE_URL}/admin?reset=${token}`;
      sendMail(tplReset(user, link)).catch(()=>{});
    }
    return sendJSON(res, 200, {success:true, message:'If that email exists in our system, a reset link has been sent.'});
  }

  // ─ RESET PASSWORD ───────────────────────────────────────────────────────
  if (pathname==='/api/auth/reset-password' && method==='POST') {
    if (!p.token||!p.password) return sendJSON(res, 400, {error:'Token and new password required'});
    if (p.password.length<6)   return sendJSON(res, 400, {error:'Password must be at least 6 characters'});
    const resets = readData('resets');
    const reset  = resets.find(r => r.token===p.token && r.expires>Date.now());
    if (!reset) return sendJSON(res, 400, {error:'Reset link is invalid or expired. Request a new one.'});
    const users = readData('users');
    const idx   = users.findIndex(u => u.id===reset.userId);
    if (idx===-1) return sendJSON(res, 400, {error:'User not found'});
    users[idx].password = hashPw(p.password);
    writeData('users', users);
    writeData('resets', resets.filter(r => r.token!==p.token));
    clearLock(users[idx].username);
    return sendJSON(res, 200, {success:true, message:'Password reset! You can now log in.'});
  }

  // ─ PUBLIC: Submit Query ─────────────────────────────────────────────────
  if (pathname==='/api/queries' && method==='POST') {
    const queries = readData('queries');
    const q = {id:genId(), ...p, status:'pending', createdAt:new Date().toISOString()};
    queries.push(q);
    writeData('queries', queries);
    // Fire-and-forget email notification
    const mail = tplQuery(q);
    if (mail.to) sendMail(mail).catch(()=>{});
    return sendJSON(res, 201, {success:true, id:q.id});
  }

  // ─ PUBLIC: Rate calculator ──────────────────────────────────────────────
  if (pathname==='/api/rates/calculate' && method==='POST') {
    const {origin, destination, service, bags, weight} = p;
    const rates = readData('rates');
    const rate  = rates.find(r =>
      r.origin.toLowerCase()===(origin||'').toLowerCase() &&
      r.destination.toLowerCase()===(destination||'').toLowerCase() &&
      r.service.toLowerCase()===(service||'').toLowerCase()
    );
    if (!rate) return sendJSON(res, 404, {error:'No rate found for this route/service. Contact us for a custom quote.'});
    const w=parseFloat(weight)||0, b=parseInt(bags)||0;
    const wc = Math.max(w,rate.minWeight)*rate.perKg;
    const bc = b*rate.perBag;
    const sub = wc+bc, gst = sub*0.18, total = sub+gst;
    return sendJSON(res, 200, {origin,destination,service,bags:b,weight:w,weightCharge:wc,bagCharge:bc,subtotal:sub,gst:parseFloat(gst.toFixed(2)),total:parseFloat(total.toFixed(2)),currency:'INR',rate});
  }
  if (pathname==='/api/rates/options' && method==='GET') {
    const rates = readData('rates');
    return sendJSON(res, 200, {
      origins:[...new Set(rates.map(r=>r.origin))],
      destinations:[...new Set(rates.map(r=>r.destination))],
      services:[...new Set(rates.map(r=>r.service))]
    });
  }

  // ─ PUBLIC: Blogs ────────────────────────────────────────────────────────
  if (pathname==='/api/blogs' && method==='GET') {
    return sendJSON(res, 200, readData('blogs').filter(b=>b.published).reverse());
  }
  if (pathname.startsWith('/api/blogs/') && method==='GET') {
    const slug = pathname.split('/api/blogs/')[1];
    const blog = readData('blogs').find(b=>b.slug===slug&&b.published);
    if (!blog) return sendJSON(res, 404, {error:'Not found'});
    return sendJSON(res, 200, blog);
  }

  // ─ AUTH REQUIRED below ──────────────────────────────────────────────────
  const user = authUser(req);
  if (!user) return sendJSON(res, 401, {error:'Unauthorized'});

  // ─ CHANGE PASSWORD (logged-in) ──────────────────────────────────────────
  if (pathname==='/api/auth/change-password' && method==='POST') {
    if (!p.currentPassword||!p.newPassword) return sendJSON(res, 400, {error:'Both fields required'});
    if (p.newPassword.length<6) return sendJSON(res, 400, {error:'New password must be at least 6 characters'});
    const users = readData('users');
    const idx   = users.findIndex(u=>u.id===user.id);
    if (users[idx].password !== hashPw(p.currentPassword)) return sendJSON(res, 400, {error:'Current password is incorrect'});
    if (hashPw(p.newPassword)===users[idx].password) return sendJSON(res, 400, {error:'New password cannot be same as current'});
    users[idx].password = hashPw(p.newPassword);
    writeData('users', users);
    return sendJSON(res, 200, {success:true, message:'Password changed successfully!'});
  }

  // ─ ADMIN: Queries ────────────────────────────────────────────────────────
  if (pathname==='/api/admin/queries' && method==='GET') {
    let qs = readData('queries');
    if (user.role==='agent') qs = qs.filter(q=>q.status!=='accepted'||q.acceptedBy===user.id);
    return sendJSON(res, 200, qs.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
  }
  if (pathname.match(/^\/api\/admin\/queries\/[^/]+\/accept$/) && method==='PATCH') {
    const id = pathname.split('/')[4];
    const qs = readData('queries');
    const i  = qs.findIndex(q=>q.id===id);
    if (i===-1) return sendJSON(res, 404, {error:'Not found'});
    qs[i] = {...qs[i], status:'accepted', acceptedBy:user.id, acceptedByName:user.name, acceptedAt:new Date().toISOString()};
    writeData('queries', qs);
    return sendJSON(res, 200, qs[i]);
  }
  if (pathname.match(/^\/api\/admin\/queries\/[^/]+$/) && method==='DELETE') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    writeData('queries', readData('queries').filter(q=>q.id!==pathname.split('/api/admin/queries/')[1]));
    return sendJSON(res, 200, {success:true});
  }

  // ─ ADMIN: Users ──────────────────────────────────────────────────────────
  if (pathname==='/api/admin/users' && method==='GET') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    return sendJSON(res, 200, readData('users').map(u=>({...u,password:undefined})));
  }
  if (pathname==='/api/admin/users' && method==='POST') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    const users = readData('users');
    if (users.find(u=>u.username===p.username)) return sendJSON(res, 400, {error:'Username already taken'});
    const nu = {id:genId(),username:p.username,password:hashPw(p.password),role:p.role||'agent',name:p.name,email:p.email||'',createdAt:new Date().toISOString()};
    users.push(nu);
    writeData('users', users);
    return sendJSON(res, 201, {...nu,password:undefined});
  }
  if (pathname.match(/^\/api\/admin\/users\/[^/]+$/) && method==='DELETE') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    const id = pathname.split('/api/admin/users/')[1];
    if (id===user.id) return sendJSON(res, 400, {error:'Cannot delete yourself'});
    writeData('users', readData('users').filter(u=>u.id!==id));
    return sendJSON(res, 200, {success:true});
  }

  // ─ ADMIN: Rates ──────────────────────────────────────────────────────────
  if (pathname==='/api/admin/rates' && method==='GET') return sendJSON(res, 200, readData('rates'));
  if (pathname==='/api/admin/rates' && method==='POST') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    const rates=[...readData('rates'),{id:genId(),...p}];
    writeData('rates',rates); return sendJSON(res,201,rates[rates.length-1]);
  }
  if (pathname.match(/^\/api\/admin\/rates\/[^/]+$/) && method==='DELETE') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    writeData('rates',readData('rates').filter(r=>r.id!==pathname.split('/api/admin/rates/')[1]));
    return sendJSON(res,200,{success:true});
  }
  if (pathname.match(/^\/api\/admin\/rates\/[^/]+$/) && method==='PUT') {
    if (user.role!=='superadmin') return sendJSON(res, 403, {error:'Forbidden'});
    const id=pathname.split('/api/admin/rates/')[1];
    const rates=readData('rates'), i=rates.findIndex(r=>r.id===id);
    if (i===-1) return sendJSON(res,404,{error:'Not found'});
    rates[i]={...rates[i],...p}; writeData('rates',rates); return sendJSON(res,200,rates[i]);
  }

  // ─ ADMIN: Blogs ──────────────────────────────────────────────────────────
  if (pathname==='/api/admin/blogs' && method==='GET') return sendJSON(res,200,readData('blogs').reverse());
  if (pathname==='/api/admin/blogs' && method==='POST') {
    const blogs=readData('blogs');
    const slug=(p.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'-'+Date.now();
    const blog={id:genId(),title:p.title,slug,content:p.content,excerpt:p.excerpt||(p.content||'').substring(0,150)+'...',author:user.name,authorId:user.id,tags:p.tags||'',metaTitle:p.metaTitle||p.title,metaDesc:p.metaDesc||p.excerpt||'',image:p.image||'',published:p.published==='true'||p.published===true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    blogs.push(blog); writeData('blogs',blogs); return sendJSON(res,201,blog);
  }
  if (pathname.match(/^\/api\/admin\/blogs\/[^/]+$/) && method==='PUT') {
    const id=pathname.split('/api/admin/blogs/')[1];
    const blogs=readData('blogs'),i=blogs.findIndex(b=>b.id===id);
    if (i===-1) return sendJSON(res,404,{error:'Not found'});
    blogs[i]={...blogs[i],...p,updatedAt:new Date().toISOString()};
    writeData('blogs',blogs); return sendJSON(res,200,blogs[i]);
  }
  if (pathname.match(/^\/api\/admin\/blogs\/[^/]+$/) && method==='DELETE') {
    writeData('blogs',readData('blogs').filter(b=>b.id!==pathname.split('/api/admin/blogs/')[1]));
    return sendJSON(res,200,{success:true});
  }

  // ─ ADMIN: Stats ──────────────────────────────────────────────────────────
  if (pathname==='/api/admin/stats' && method==='GET') {
    const qs=readData('queries'),bl=readData('blogs'),us=readData('users');
    return sendJSON(res,200,{totalQueries:qs.length,pendingQueries:qs.filter(q=>q.status==='pending').length,acceptedQueries:qs.filter(q=>q.status==='accepted').length,totalBlogs:bl.length,publishedBlogs:bl.filter(b=>b.published).length,totalUsers:us.length});
  }

  return sendJSON(res, 404, {error:'Not found'});
}

// ── Static files ──────────────────────────────────────────────────────────
function serveStatic(req, res, pathname) {
  if (pathname.startsWith('/uploads/')) {
    const fp = path.join(__dirname, pathname);
    if (fs.existsSync(fp)) return sendFile(res, fp, MIME[path.extname(fp)]||'application/octet-stream');
    return res.writeHead(404)||res.end();
  }
  let fp = path.join(PUBLIC_DIR, pathname);
  if (pathname==='/'||pathname==='') fp = path.join(PUBLIC_DIR,'index.html');
  if (pathname.startsWith('/admin')) fp = path.join(PUBLIC_DIR,'admin.html');
  if (pathname.startsWith('/blog'))  fp = path.join(PUBLIC_DIR,'blog.html');
  if (fs.existsSync(fp)&&fs.statSync(fp).isDirectory()) fp = path.join(fp,'index.html');
  if (!fs.existsSync(fp)) fp = path.join(PUBLIC_DIR,'index.html');
  sendFile(res, fp, MIME[path.extname(fp)]||'text/html');
}

// ── Server ────────────────────────────────────────────────────────────────
http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,PATCH,OPTIONS');

  const pathname = url.parse(req.url,true).pathname;
  if (pathname.startsWith('/api/')||req.method==='OPTIONS') {
    let body = Buffer.alloc(0);
    req.on('data', c => { body = Buffer.concat([body,c]); });
    req.on('end', () => {
      const ct = req.headers['content-type']||'';
      if (ct.includes('multipart/form-data')) {
        const bm = ct.match(/boundary=(.+)/);
        if (bm) {
          const parts = parseMultipart(body, bm[1]);
          Object.keys(parts).forEach(k => {
            if (parts[k]?.isFile && parts[k].data.length>0) {
              const ext=path.extname(parts[k].filename)||'.jpg';
              const fname=genId()+ext;
              fs.writeFileSync(path.join(UPLOADS_DIR,'blogs',fname), parts[k].data);
              parts[k]='/uploads/blogs/'+fname;
            }
          });
          handleAPI(req,res,pathname,null).catch(e=>sendJSON(res,500,{error:e.message}));
          return;
        }
      }
      handleAPI(req,res,pathname,body.toString()).catch(e=>sendJSON(res,500,{error:e.message}));
    });
  } else {
    serveStatic(req, res, pathname);
  }
}).listen(PORT, () => {
  console.log(`\n🚀 AGC Global Express → http://localhost:${PORT}`);
  console.log(`🔧 Admin              → http://localhost:${PORT}/admin`);
  console.log(`🔑 Login: admin / Admin@123`);
  console.log(`📧 Email: ${SENDGRID_KEY ? 'SendGrid ✓' : SMTP_HOST ? 'SMTP ✓' : '⚠ Not configured — set SENDGRID_KEY in Railway'}`);
  console.log(`📩 Query alerts → ${ADMIN_EMAIL||'(set ADMIN_EMAIL in Railway env vars)'}\n`);
});

initData();
