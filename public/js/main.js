// AGC Global Express - Main JS

const API = '';

// ─── Navbar scroll effect ───────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── Hamburger ──────────────────────────────────────────
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});

// ─── Intersection Observer for AOS ──────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

// ─── Rate Calculator ────────────────────────────────────
async function loadRateOptions() {
  try {
    const res = await fetch('/api/rates/options');
    const data = await res.json();
    const fill = (id, opts) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      opts.forEach(o => { const op = document.createElement('option'); op.value = o; op.textContent = o; sel.appendChild(op); });
    };
    fill('rateOrigin', data.origins || []);
    fill('rateDestination', data.destinations || []);
    fill('rateService', data.services || []);
  } catch (e) { console.log('Rate options error:', e); }
}

document.getElementById('rateForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Calculating...'; btn.disabled = true;
  document.getElementById('rateResult').style.display = 'none';
  document.getElementById('rateError').style.display = 'none';
  try {
    const res = await fetch('/api/rates/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: document.getElementById('rateOrigin').value,
        destination: document.getElementById('rateDestination').value,
        service: document.getElementById('rateService').value,
        bags: document.getElementById('rateBags').value,
        weight: document.getElementById('rateWeight').value
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rate not found');
    const fmt = n => '₹ ' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('rateRoute').textContent = `${data.origin} → ${data.destination}`;
    document.getElementById('rbWeight').textContent = fmt(data.weightCharge);
    document.getElementById('rbBag').textContent = fmt(data.bagCharge);
    document.getElementById('rbSub').textContent = fmt(data.subtotal);
    document.getElementById('rbGst').textContent = fmt(data.gst);
    document.getElementById('rbTotal').textContent = fmt(data.total);
    document.getElementById('rateResult').style.display = 'block';
    document.getElementById('rateResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    document.getElementById('rateErrorMsg').textContent = err.message || 'No rate found. Please contact us.';
    document.getElementById('rateError').style.display = 'block';
  } finally { btn.textContent = 'Calculate Rate'; btn.disabled = false; }
});

// ─── Query Form ─────────────────────────────────────────
document.getElementById('queryForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('querySubmitBtn');
  btn.textContent = 'Submitting...'; btn.disabled = true;
  const form = e.target;
  const data = {};
  new FormData(form).forEach((v, k) => { data[k] = v; });
  try {
    const res = await fetch('/api/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    document.getElementById('queryRefId').textContent = '#' + result.id.toUpperCase().slice(0, 8);
    form.style.display = 'none';
    document.getElementById('querySuccess').style.display = 'block';
  } catch (err) {
    alert('Error: ' + (err.message || 'Failed to submit. Please try again.'));
  } finally { btn.textContent = 'Submit Query →'; btn.disabled = false; }
});

function resetQueryForm() {
  document.getElementById('queryForm').reset();
  document.getElementById('queryForm').style.display = 'block';
  document.getElementById('querySuccess').style.display = 'none';
}

// ─── Blog Preview ────────────────────────────────────────
async function loadBlogPreview() {
  const container = document.getElementById('blogsPreview');
  if (!container) return;
  try {
    const res = await fetch('/api/blogs');
    const blogs = await res.json();
    if (!blogs.length) {
      container.innerHTML = '<p class="blog-loading">No articles yet. Check back soon!</p>';
      return;
    }
    container.innerHTML = blogs.slice(0, 3).map(b => `
      <a href="/blog.html?slug=${b.slug}" class="blog-card">
        <div class="blog-card-img">
          ${b.image ? `<img src="${b.image}" alt="${b.title}" loading="lazy">` : '📝'}
        </div>
        <div class="blog-card-body">
          <div class="blog-card-tag">${b.tags?.split(',')[0] || 'Logistics'}</div>
          <h4>${b.title}</h4>
          <p>${b.excerpt || ''}</p>
          <div class="blog-card-meta">
            <span>${b.author}</span>
            <span>${new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </a>`).join('');
  } catch { container.innerHTML = '<p class="blog-loading">Could not load articles.</p>'; }
}

// ─── Newsletter ──────────────────────────────────────────
document.getElementById('newsletterForm')?.addEventListener('submit', e => {
  e.preventDefault();
  e.target.innerHTML = '<p style="color:#10B981;font-weight:600;">✓ Subscribed! Thank you.</p>';
});

// ─── Init ────────────────────────────────────────────────
loadRateOptions();
loadBlogPreview();
