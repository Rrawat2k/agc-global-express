/* ─── AGC Global Express - Main Stylesheet ─── */
:root {
  --red: #E63B2E;
  --red-dark: #C0392B;
  --navy: #0B1F35;
  --navy-mid: #0f2847;
  --dark: #07131F;
  --mid: #1a2e44;
  --light-bg: #F4F7FA;
  --white: #ffffff;
  --text: #2D3748;
  --text-light: #718096;
  --text-muted: #A0AEC0;
  --border: #E2E8F0;
  --gold: #F59E0B;
  --green: #10B981;
  --blue: #3B82F6;
  --font-display: 'Rajdhani', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-hero: 'Bebas Neue', cursive;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 24px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.16);
  --radius: 12px;
  --transition: 0.3s ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; font-size: 16px; }

body {
  font-family: var(--font-body);
  color: var(--text);
  background: var(--white);
  overflow-x: hidden;
  line-height: 1.6;
}

/* ── Layout ── */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

/* ── Top Bar ── */
.topbar {
  background: var(--dark);
  padding: 0.5rem 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}
.topbar-inner { display: flex; justify-content: space-between; align-items: center; }
.topbar-left, .topbar-right { display: flex; gap: 1.5rem; }
.topbar a { color: rgba(255,255,255,0.8); text-decoration: none; transition: color var(--transition); }
.topbar a:hover { color: var(--red); }

/* ── Navbar ── */
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(11, 31, 53, 0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  transition: all var(--transition);
}
.navbar.scrolled { box-shadow: 0 4px 30px rgba(0,0,0,0.3); }
.nav-inner {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}
.logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
.logo-icon svg { width: 40px; height: 40px; }
.logo-text { display: flex; flex-direction: column; line-height: 1; }
.logo-main { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: #fff; letter-spacing: 2px; }
.logo-sub { font-size: 0.55rem; color: var(--red); letter-spacing: 3px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
.nav-links { display: flex; gap: 0.25rem; align-items: center; list-style: none; }
.nav-links a {
  font-family: var(--font-display);
  font-size: 0.95rem; font-weight: 600;
  color: rgba(255,255,255,0.85);
  text-decoration: none; padding: 0.5rem 0.9rem;
  border-radius: 6px;
  letter-spacing: 0.5px;
  transition: all var(--transition);
}
.nav-links a:hover { color: #fff; background: rgba(255,255,255,0.08); }
.btn-nav {
  background: var(--red) !important;
  color: #fff !important;
  padding: 0.5rem 1.25rem !important;
  border-radius: 6px !important;
}
.btn-nav:hover { background: var(--red-dark) !important; }
.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 4px;
}
.hamburger span { display: block; width: 24px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; }

/* ── Hero ── */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex; align-items: center;
  overflow: hidden;
  background: var(--dark);
}
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(135deg, #07131F 0%, #0B1F35 40%, #0f2847 70%, #1a1a2e 100%);
}
.hero-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(230,59,46,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 50%);
}
.hero-grid {
  position: absolute; inset: 0; opacity: 0.04;
  background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
  background-size: 60px 60px;
}
.hero-content {
  position: relative; z-index: 1;
  padding: 8rem 1.5rem 4rem;
  max-width: 800px;
}
.hero-badge {
  display: inline-block;
  background: rgba(230,59,46,0.15);
  border: 1px solid rgba(230,59,46,0.3);
  color: #fca5a0;
  font-size: 0.85rem; font-weight: 500;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  animation: fadeDown 0.6s ease both;
}
.hero-title {
  font-family: var(--font-hero);
  display: flex; flex-direction: column;
  line-height: 0.9;
  margin-bottom: 1.5rem;
  animation: fadeDown 0.7s ease 0.1s both;
}
.hero-title-line { font-size: clamp(4rem, 9vw, 7rem); color: rgba(255,255,255,0.9); }
.hero-title-accent { font-size: clamp(4.5rem, 10vw, 8rem); color: var(--red); }
.hero-desc {
  font-size: 1.1rem; line-height: 1.7;
  color: rgba(255,255,255,0.65);
  max-width: 540px; margin-bottom: 2rem;
  animation: fadeDown 0.8s ease 0.2s both;
}
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; animation: fadeDown 0.9s ease 0.3s both; }
.hero-stats {
  display: flex; gap: 0; align-items: center;
  padding: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1);
  animation: fadeDown 1s ease 0.4s both;
}
.stat { text-align: center; flex: 1; }
.stat-num { display: block; font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: #fff; line-height: 1; }
.stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
.stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.15); flex-shrink: 0; }
.hero-scroll-hint {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  color: rgba(255,255,255,0.4); font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase;
  animation: bounce 2s infinite;
}
.scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent); }

/* ── Buttons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--red);
  color: #fff; font-family: var(--font-display);
  font-size: 1rem; font-weight: 600; letter-spacing: 1px;
  padding: 0.8rem 2rem; border-radius: 8px;
  text-decoration: none; border: none; cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 16px rgba(230,59,46,0.35);
}
.btn-primary:hover { background: var(--red-dark); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(230,59,46,0.45); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: transparent;
  color: #fff; font-family: var(--font-display);
  font-size: 1rem; font-weight: 600; letter-spacing: 1px;
  padding: 0.8rem 2rem; border-radius: 8px;
  text-decoration: none; border: 2px solid rgba(255,255,255,0.3);
  cursor: pointer; transition: all var(--transition);
}
.btn-secondary:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.08); }
.btn-full { width: 100%; justify-content: center; }

/* ── Ticker ── */
.ticker-wrap {
  background: var(--red);
  padding: 0.75rem 0; overflow: hidden;
}
.ticker {
  display: flex; gap: 3rem; white-space: nowrap;
  animation: ticker 30s linear infinite;
  color: rgba(255,255,255,0.9);
  font-family: var(--font-display); font-weight: 600; letter-spacing: 1px;
  font-size: 0.9rem;
}
.ticker span::before { content: '◆'; margin-right: 1.5rem; font-size: 0.6rem; opacity: 0.6; }

/* ── Section Styles ── */
.section { padding: 5rem 0; }
.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-tag {
  display: inline-block;
  background: rgba(230,59,46,0.08);
  color: var(--red);
  font-size: 0.8rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 2px;
  padding: 0.35rem 1rem; border-radius: 50px;
  margin-bottom: 1rem;
  border: 1px solid rgba(230,59,46,0.2);
}
.section-tag.light { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.2); }
.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700; line-height: 1.1;
  color: var(--navy); margin-bottom: 1rem;
}
.section-title.light { color: #fff; }
.accent { color: var(--red); }
.accent-light { color: #fca5a0; }
.section-desc { font-size: 1rem; color: var(--text-light); max-width: 560px; margin: 0 auto; }

/* ── Services Grid ── */
.services-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;
}
.service-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 2rem;
  position: relative; overflow: hidden;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}
.service-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--red); }
.service-card.featured {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
  border-color: var(--red);
}
.service-card.featured h3, .service-card.featured p, .service-card.featured li { color: rgba(255,255,255,0.85) !important; }
.service-card.featured .service-link { color: #fca5a0; }
.service-badge {
  position: absolute; top: 1rem; right: 1rem;
  background: var(--red); color: #fff;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;
  padding: 0.25rem 0.6rem; border-radius: 50px;
  text-transform: uppercase;
}
.service-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.service-card h3 { font-family: var(--font-display); font-size: 1.3rem; color: var(--navy); margin-bottom: 0.75rem; }
.service-card p { font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem; }
.service-features { list-style: none; margin-bottom: 1.25rem; }
.service-features li { font-size: 0.85rem; color: var(--text-light); padding: 0.2rem 0; }
.service-features li::before { content: '✓ '; color: var(--green); font-weight: 700; }
.service-link { color: var(--red); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: gap var(--transition); }
.service-link:hover { text-decoration: underline; }

/* ── Why Section ── */
.why-section {
  position: relative; padding: 5rem 0; background: var(--navy);
  overflow: hidden;
}
.why-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 50%, rgba(230,59,46,0.1) 0%, transparent 60%);
}
.why-inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
}
.why-content .section-title { text-align: left; margin-bottom: 1rem; }
.why-desc { color: rgba(255,255,255,0.65); margin-bottom: 2rem; }
.why-points { display: flex; flex-direction: column; gap: 1.5rem; }
.why-point { display: flex; gap: 1rem; align-items: flex-start; }
.why-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 0.1rem; }
.why-point h4 { color: #fff; font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.25rem; }
.why-point p { color: rgba(255,255,255,0.6); font-size: 0.9rem; }
.why-visual { display: flex; justify-content: center; }
.why-image-stack { position: relative; }
.why-img-main { border-radius: var(--radius); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.why-img-main svg { width: 100%; height: auto; display: block; }
.why-badge-float {
  position: absolute; background: var(--white);
  border-radius: 10px; padding: 0.75rem 1.25rem;
  box-shadow: var(--shadow-lg); text-align: center;
}
.why-badge-1 { bottom: -1rem; left: -2rem; }
.why-badge-2 { top: -1rem; right: -2rem; }
.wbf-num { display: block; font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--red); }
.wbf-label { font-size: 0.75rem; color: var(--text-light); }

/* ── Rate Calculator ── */
.rate-calc-wrap { max-width: 800px; margin: 0 auto; }
.rate-form-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 2rem;
  box-shadow: var(--shadow-md); margin-bottom: 1.5rem;
}
.rate-result-card {
  background: var(--navy); border-radius: var(--radius);
  padding: 2rem; color: #fff;
}
.rate-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.rate-result-header h3 { font-family: var(--font-display); font-size: 1.3rem; }
.rate-route-badge { background: var(--red); font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 50px; }
.rate-breakdown { border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
.rb-row { display: flex; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.9rem; color: rgba(255,255,255,0.75); }
.rb-row:last-child { border-bottom: none; }
.rb-row.total { background: rgba(230,59,46,0.15); font-weight: 700; color: #fff; font-size: 1.05rem; }
.rate-disclaimer { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
.rate-disclaimer a { color: #fca5a0; }
.rate-error-card { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: var(--radius); padding: 2rem; text-align: center; }
.rate-error-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.rate-error-card p { color: #92400E; margin-bottom: 1rem; }
.rate-error-card .btn-secondary { border-color: #F59E0B; color: #92400E; }

/* ── Form ── */
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 0.75rem 1rem;
  border: 1.5px solid var(--border); border-radius: 8px;
  font-family: var(--font-body); font-size: 0.9rem; color: var(--text);
  background: var(--white); transition: border-color var(--transition);
  outline: none;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--red); box-shadow: 0 0 0 3px rgba(230,59,46,0.1);
}
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.checkbox-group { flex-direction: row; align-items: center; margin-bottom: 1rem; }
.checkbox-label { display: flex; gap: 0.5rem; align-items: center; font-size: 0.85rem; cursor: pointer; }
.checkbox-label a { color: var(--red); }

/* ── Process ── */
.process-section { background: var(--light-bg); }
.process-steps { display: flex; align-items: flex-start; justify-content: center; gap: 0; flex-wrap: wrap; }
.process-step { text-align: center; max-width: 200px; padding: 1.5rem 1rem; }
.ps-num { font-family: var(--font-hero); font-size: 3rem; color: rgba(230,59,46,0.15); line-height: 1; margin-bottom: 0.5rem; }
.ps-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.process-step h4 { font-family: var(--font-display); font-size: 1.1rem; color: var(--navy); margin-bottom: 0.5rem; }
.process-step p { font-size: 0.85rem; color: var(--text-light); }
.process-arrow { font-size: 1.5rem; color: var(--red); margin-top: 3rem; padding: 0 0.5rem; opacity: 0.5; }

/* ── About ── */
.about-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.about-visual { display: flex; justify-content: center; }
.about-img-wrap { position: relative; }
.about-img-main svg { width: 100%; border-radius: var(--radius); }
.about-badge {
  position: absolute; bottom: -1.5rem; right: -1.5rem;
  background: var(--red); color: #fff;
  padding: 1.25rem; border-radius: 12px;
  text-align: center; box-shadow: var(--shadow-lg);
}
.ab-num { display: block; font-family: var(--font-display); font-size: 2.5rem; font-weight: 700; line-height: 1; }
.ab-label { font-size: 0.75rem; opacity: 0.85; }
.about-content { padding-left: 2rem; }
.about-content .section-title { text-align: left; }
.about-content p { color: var(--text-light); margin-bottom: 1rem; line-height: 1.8; }
.about-milestones { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.milestone { display: flex; gap: 1rem; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
.ml-year { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--red); min-width: 3rem; }
.ml-event { font-size: 0.9rem; color: var(--text); }

/* ── Testimonials ── */
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.testimonial-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 2rem;
  box-shadow: var(--shadow-sm); transition: all var(--transition);
}
.testimonial-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.tcard-stars { color: var(--gold); font-size: 1rem; margin-bottom: 1rem; }
.testimonial-card p { color: var(--text-light); font-style: italic; margin-bottom: 1.5rem; line-height: 1.7; }
.tcard-author { display: flex; gap: 0.75rem; align-items: center; }
.tcard-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--red); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
}
.tcard-author strong { display: block; font-size: 0.9rem; color: var(--navy); }
.tcard-author span { font-size: 0.78rem; color: var(--text-light); }

/* ── Contact ── */
.contact-section { background: var(--light-bg); }
.contact-wrap { display: grid; grid-template-columns: 380px 1fr; gap: 2.5rem; }
.contact-info {
  background: var(--navy); border-radius: var(--radius);
  padding: 2rem; color: rgba(255,255,255,0.85);
}
.contact-info h3 { font-family: var(--font-display); font-size: 1.3rem; color: #fff; margin-bottom: 1.5rem; }
.ci-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.ci-icon { font-size: 1.25rem; flex-shrink: 0; }
.ci-item strong { display: block; color: #fff; font-size: 0.9rem; margin-bottom: 0.25rem; }
.ci-item p { font-size: 0.85rem; color: rgba(255,255,255,0.6); line-height: 1.6; }
.ci-social { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
.social-btn {
  width: 38px; height: 38px; border-radius: 8px;
  background: rgba(255,255,255,0.1); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; text-decoration: none; font-weight: 600;
  transition: all var(--transition);
}
.social-btn:hover { background: var(--red); transform: translateY(-2px); }
.contact-form-wrap {
  background: var(--white); border-radius: var(--radius);
  padding: 2rem; box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}
.contact-form .form-group { margin-bottom: 0; }
.query-success { text-align: center; padding: 3rem 2rem; }
.qs-icon { font-size: 3rem; margin-bottom: 1rem; }
.query-success h3 { font-family: var(--font-display); font-size: 1.5rem; color: var(--green); margin-bottom: 1rem; }
.query-success p { color: var(--text-light); margin-bottom: 1.5rem; }

/* ── Blog Preview ── */
.blogs-preview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.blog-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
  transition: all var(--transition); box-shadow: var(--shadow-sm);
  text-decoration: none; color: inherit;
  display: block;
}
.blog-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.blog-card-img {
  width: 100%; height: 180px; object-fit: cover;
  background: linear-gradient(135deg, var(--navy), var(--navy-mid));
  display: flex; align-items: center; justify-content: center;
  font-size: 3rem; color: rgba(255,255,255,0.3);
}
.blog-card-img img { width: 100%; height: 100%; object-fit: cover; }
.blog-card-body { padding: 1.25rem; }
.blog-card-tag { font-size: 0.75rem; font-weight: 600; color: var(--red); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
.blog-card h4 { font-family: var(--font-display); font-size: 1.1rem; color: var(--navy); margin-bottom: 0.5rem; line-height: 1.3; }
.blog-card p { font-size: 0.85rem; color: var(--text-light); line-height: 1.6; }
.blog-card-meta { display: flex; justify-content: space-between; margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted); }
.blog-loading { text-align: center; color: var(--text-light); padding: 3rem; font-size: 0.9rem; }
.section-cta { text-align: center; }
.section-cta .btn-secondary { color: var(--navy); border-color: var(--navy); }
.section-cta .btn-secondary:hover { background: var(--navy); color: #fff; }

/* ── Footer ── */
.footer { background: var(--dark); }
.footer-top { padding: 4rem 0 3rem; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 2.5rem; }
.footer-brand { }
.footer-logo { margin-bottom: 1rem; }
.footer-brand p { color: rgba(255,255,255,0.55); font-size: 0.875rem; line-height: 1.7; margin-bottom: 1.25rem; }
.footer-cert { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.footer-cert span { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 50px; }
.footer-links h4 { font-family: var(--font-display); color: #fff; font-size: 1rem; letter-spacing: 0.5px; margin-bottom: 1.25rem; }
.footer-links ul { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
.footer-links a { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 0.875rem; transition: color var(--transition); }
.footer-links a:hover { color: var(--red); }
.footer-newsletter h4 { font-family: var(--font-display); color: #fff; margin-bottom: 0.75rem; }
.footer-newsletter p { color: rgba(255,255,255,0.55); font-size: 0.875rem; margin-bottom: 1rem; }
.newsletter-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.newsletter-form input {
  flex: 1; padding: 0.65rem 1rem; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
  color: #fff; font-size: 0.875rem; outline: none;
}
.newsletter-form input::placeholder { color: rgba(255,255,255,0.3); }
.newsletter-form button {
  padding: 0.65rem 1.25rem; background: var(--red);
  color: #fff; border: none; border-radius: 6px;
  font-weight: 600; cursor: pointer; font-size: 0.875rem;
  transition: background var(--transition);
}
.newsletter-form button:hover { background: var(--red-dark); }
.footer-offices { color: rgba(255,255,255,0.45); font-size: 0.8rem; }
.footer-offices strong { color: rgba(255,255,255,0.7); display: block; margin-bottom: 0.25rem; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 1.25rem 0;
}
.footer-bottom-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.footer-bottom span { color: rgba(255,255,255,0.35); font-size: 0.8rem; }

/* ── WhatsApp Float ── */
.whatsapp-float {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 50;
}
.whatsapp-float a {
  display: flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: 50%;
  background: #25D366; font-size: 1.75rem;
  box-shadow: 0 4px 20px rgba(37,211,102,0.4);
  text-decoration: none; transition: all var(--transition);
  animation: pulse 2s infinite;
}
.whatsapp-float a:hover { transform: scale(1.1); }

/* ── Animations ── */
@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-10px); } }
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pulse { 0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.4); } 50% { box-shadow: 0 4px 30px rgba(37,211,102,0.7); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

[data-aos] { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
[data-aos].visible { opacity: 1; transform: translateY(0); }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .why-inner, .about-inner { grid-template-columns: 1fr; gap: 2rem; }
  .contact-wrap { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .nav-links { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--navy); padding: 1rem; gap: 0; }
  .nav-links.open { display: flex; }
  .nav-links a { padding: 0.75rem 1rem; border-radius: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .hamburger { display: flex; }
  .nav-inner { position: relative; }
  .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
  .topbar-left { display: none; }
  .hero-content { padding: 6rem 1.5rem 3rem; }
  .hero-stats { flex-wrap: wrap; gap: 1rem; }
  .stat-div { display: none; }
  .process-steps { flex-direction: column; align-items: center; }
  .process-arrow { transform: rotate(90deg); }
  .footer-grid { grid-template-columns: 1fr; }
  .why-badge-1, .why-badge-2 { display: none; }
  .about-badge { bottom: 0; right: 0; }
  .about-content { padding-left: 0; }
}
