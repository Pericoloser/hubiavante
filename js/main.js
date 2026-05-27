/**
 * SIM4UE – Main JavaScript
 * Multilingüe ES/PT/GL/EN · POCTEP
 */

/* ── Config ─────────────────────────────────────────────── */
// Formspree: replace with your form ID from https://formspree.io
// 1. Create a free account at formspree.io
// 2. Click "New Form" → give it a name → copy the form ID (e.g. "xpwzlkno")
// 3. Replace "YOUR_FORM_ID" below with your actual ID
const FORMSPREE_ID = 'xnjroekn';
const FORMSPREE_ENDPOINT = FORMSPREE_ID !== 'YOUR_FORM_ID'
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : null; // if null, will simulate send (demo mode)

/* ── Logo map ───────────────────────────────────────────── */
const PARTNER_LOGOS = {
  'BP':  'images/logos/fps.png',   // Coloca "FPS Vertical Principal.png" → images/logos/fps.png
  'BE2': 'images/logos/usc.svg',
  'BE3': 'images/logos/chtmad.svg',
  'BE4': 'images/logos/hvr.svg',
  'BE5': 'images/logos/chuc.svg',
  'BE6': 'images/logos/fisevi.svg',
};

// Fallback SVG if the PNG is not yet uploaded
const PARTNER_LOGO_FALLBACKS = {
  'BP': 'images/logos/fps.svg',
};

/* ── State ─────────────────────────────────────────────── */
let currentLang = 'es';
let translations = {};

/* ── Language Loading ───────────────────────────────────── */
async function loadTranslations(lang) {
  if (translations[lang]) return translations[lang];
  try {
    const res = await fetch(`locales/${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    translations[lang] = await res.json();
    return translations[lang];
  } catch (err) {
    console.warn(`Could not load locale '${lang}':`, err);
    return null;
  }
}

async function setLanguage(lang) {
  const t = await loadTranslations(lang);
  if (!t) return;
  currentLang = lang;

  // Persist selection
  try { localStorage.setItem('sim4ue_lang', lang); } catch(_) {}

  // Update html lang attr
  document.documentElement.lang = lang;

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getNestedKey(t, key);
    if (val !== undefined) el.textContent = val;
  });

  // Update all [data-i18n-placeholder] elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = getNestedKey(t, key);
    if (val !== undefined) el.placeholder = val;
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });

  // Re-render all sections
  renderHero(t);
  renderStats(t);
  renderProyecto(t);
  renderPartners(t);
  renderActivities(t);
  renderGantt(t);
  renderNews(t);
  renderContact(t);
  renderFooter(t);
  renderCookieBanner(t);
}

function getNestedKey(obj, keyPath) {
  return keyPath.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

/* ── Render Functions ───────────────────────────────────── */

function renderHero(t) {
  const h = t.hero;
  if (!h) return;
  setElText('#hero-tagline', h.tagline);
  setElText('#hero-subtitle', h.subtitle);
  setElText('#hero-btn-proyecto', h.btn_proyecto);
  setElText('#hero-btn-socios', h.btn_socios);
}

function renderStats(t) {
  const s = t.stats;
  if (!s) return;
  setElText('[data-stat="presupuesto"]', s.presupuesto);
  setElText('[data-stat="subvencion"]', s.subvencion);
  setElText('[data-stat="socios"]', s.socios);
  setElText('[data-stat="duracion"]', s.duracion);
}

function renderPartners(t) {
  const s = t.socios;
  if (!s) return;
  setElText('#socios-title', s.title);
  setElText('#socios-subtitle', s.subtitle);

  const container = document.getElementById('partners-grid');
  if (!container) return;

  container.innerHTML = s.partners.map((p, i) => {
    const isLead = p.ref === 'BP';
    const logoSrc = PARTNER_LOGOS[p.ref];
    const fallbackSrc = PARTNER_LOGO_FALLBACKS[p.ref] || '';
    const logoEl = logoSrc
      ? `<img src="${logoSrc}"
             alt="${p.name}" loading="lazy"
             ${fallbackSrc ? `onerror="this.onerror=null;this.src='${fallbackSrc}'"` : ''}
          />`
      : `<span class="partner-logo-placeholder">${p.abbr}</span>`;
    return `
    <article class="partner-card ${isLead ? 'lead-card' : ''} reveal reveal-delay-${(i % 4) + 1}">
      <div class="partner-logo-wrap">${logoEl}</div>
      <div class="partner-header">
        <div class="partner-ref">${p.ref}</div>
        <div>
          <div class="partner-abbr">${p.flag} ${p.abbr}</div>
          <div class="partner-country">${p.city}</div>
        </div>
        ${isLead ? `<span class="lead-badge">${s.lead}</span>` : ''}
      </div>
      <div class="partner-body">
        <div class="partner-name">${p.name}</div>
        <div class="partner-role">${p.role}</div>
        <div class="partner-desc">${p.desc}</div>
      </div>
      <div class="partner-footer">
        <div class="partner-budget">${t.stats?.presupuesto || 'Presupuesto'}: <strong>${p.budget}</strong></div>
      </div>
    </article>`;
  }).join('');

  // Re-observe new elements
  observeReveal();
}

function renderActivities(t) {
  const a = t.actividades;
  if (!a) return;
  setElText('#actividades-title', a.title);
  setElText('#actividades-subtitle', a.subtitle);

  const container = document.getElementById('activities-grid');
  if (!container) return;

  const colorMap = { A1:'a1', A2:'a2', A3:'a3', A4:'a4', A5:'a5', A6:'a6' };
  const iconMap = { A1:'🖥️', A2:'🔬', A3:'🏥', A4:'👶', A5:'📋', A6:'📢' };

  container.innerHTML = a.items.map((item, i) => {
    const cls = colorMap[item.id] || 'a1';
    const icon = iconMap[item.id] || '📌';
    const leadLabel = t.socios ? '' : 'Lead';
    return `
    <article class="activity-card ${cls} reveal reveal-delay-${(i % 3) + 1}">
      <div class="activity-header">
        <div class="activity-id">${icon}</div>
        <div class="activity-header-text">
          <div class="activity-title">${item.id}. ${item.title}</div>
          <div class="activity-period">📅 ${item.period}</div>
        </div>
      </div>
      <div class="activity-body">
        <p class="activity-desc">${item.desc}</p>
        <div class="activity-lead">Lead: <strong>${item.lead}</strong></div>
        <div class="activity-deliverable">${item.deliverable}</div>
      </div>
    </article>`;
  }).join('');

  observeReveal();
}

function renderNews(t) {
  const n = t.noticias;
  if (!n) return;
  setElText('#noticias-title', n.title);
  setElText('#noticias-subtitle', n.subtitle);

  const container = document.getElementById('news-grid');
  if (!container) return;

  const newsSvgs = [
    'images/news-1.svg',
    'images/news-2.svg',
    'images/news-3.svg',
  ];

  container.innerHTML = n.items.map((item, i) => `
    <article class="news-card reveal reveal-delay-${i + 1}">
      <div class="news-img" style="padding:0;overflow:hidden">
        <img src="${newsSvgs[i % 3]}" alt="${item.title}"
             style="width:100%;height:180px;object-fit:cover;border-radius:0;display:block"
             loading="lazy"/>
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span class="news-tag">${item.tag}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h3 class="news-title">${item.title}</h3>
        <p class="news-desc">${item.desc}</p>
        <a href="#" class="news-link">→</a>
      </div>
    </article>`).join('');

  observeReveal();
}

function renderFooter(t) {
  const f = t.footer;
  if (!f) return;
  setElText('#footer-funded', f.funded);
  setElText('#footer-rights', f.rights);
  setElText('#footer-privacy', f.privacy);
  setElText('#footer-legal', f.legal);
  setElText('#footer-cookies', f.cookies);
}

function renderCookieBanner(t) {
  const c = t.cookie;
  if (!c) return;
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  const textEl = banner.querySelector('.cookie-text');
  const acceptBtn = banner.querySelector('.cookie-accept');
  const moreBtn = banner.querySelector('.cookie-more');
  if (textEl) textEl.innerHTML = c.text + ` <a href="#" onclick="return false">${c.more}</a>`;
  if (acceptBtn) acceptBtn.textContent = c.accept;
  if (moreBtn) moreBtn.textContent = c.more;
}

function renderProyecto(t) {
  const p = t.proyecto;
  if (!p) return;
  setElText('#proyecto-title', p.title);
  setElText('#proyecto-subtitle', p.subtitle);
  setElText('#proyecto-p1', p.p1);
  setElText('#proyecto-p2', p.p2);
  setElText('#proyecto-p3', p.p3);
  setElText('#obj-title', p.obj_title);
  setElText('#obj1', p.obj1);
  setElText('#obj2', p.obj2);
  setElText('#obj3', p.obj3);
  setElText('#poctep-label', p.poctep_label);
  setElText('#period-label', p.period_label);
  setElText('#period-value', p.period_value);
  setElText('#budget-label', p.budget_label);
  setElText('#budget-value', p.budget_value);
}

function renderContact(t) {
  const c = t.contacto;
  if (!c) return;
  setElText('#contacto-title', c.title);
  setElText('#contacto-subtitle', c.subtitle);
  setElText('#coord-title', c.coord_title);
  setElText('#coord-name', c.coord_name);
  setElText('#coord-unit', c.coord_unit);
  setElText('#coord-address', c.coord_address);
  const emailEl = document.getElementById('coord-email');
  if (emailEl) { emailEl.textContent = c.coord_email; emailEl.href = `mailto:${c.coord_email}`; }
  setElText('#social-title', c.social_title);
  const f = c.form;
  if (!f) return;
  setElText('[data-i18n="contacto.form.name"]', f.name);
  setElText('[data-i18n="contacto.form.email"]', f.email);
  setElText('[data-i18n="contacto.form.org"]', f.org);
  setElText('[data-i18n="contacto.form.message"]', f.message);
  setElText('#form-submit', f.send);
  const nameInput = document.getElementById('inp-name');
  if (nameInput) nameInput.placeholder = f.name;
  const emailInput = document.getElementById('inp-email');
  if (emailInput) emailInput.placeholder = f.email;
  const orgInput = document.getElementById('inp-org');
  if (orgInput) orgInput.placeholder = f.org;
  const msgInput = document.getElementById('inp-message');
  if (msgInput) msgInput.placeholder = f.message;
}

function setElText(selector, text) {
  if (!text) return;
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (el) el.textContent = text;
}

/* ── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
    updateActiveNavLink();
    toggleBackToTop();
  }, { passive: true });

  // Mobile toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
        window.scrollTo({ top: target.offsetTop - navH - 8, behavior: 'smooth' });
      }
    });
  });
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 20;
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - navH) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

/* ── Back to Top ────────────────────────────────────────── */
function toggleBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (btn) btn.classList.toggle('visible', window.scrollY > 400);
}

/* ── Scroll Reveal ──────────────────────────────────────── */
let revealObserver;
function observeReveal() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => {
    if (!el.classList.contains('visible')) revealObserver.observe(el);
  });
}

/* ── Cookie Banner ──────────────────────────────────────── */
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  try {
    if (localStorage.getItem('sim4ue_cookies_accepted')) return;
  } catch(_) {}
  setTimeout(() => banner.classList.add('visible'), 1800);

  const acceptBtn = banner.querySelector('.cookie-accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      try { localStorage.setItem('sim4ue_cookies_accepted', '1'); } catch(_) {}
      banner.classList.remove('visible');
    });
  }
}

/* ── Animated counters ──────────────────────────────────── */
function animateCounter(el, target, prefix, suffix, duration = 1800) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.animated) {
        e.target.dataset.animated = '1';
        const target = parseFloat(e.target.dataset.counter);
        const prefix = e.target.dataset.prefix || '';
        const suffix = e.target.dataset.suffix || '';
        animateCounter(e.target, target, prefix, suffix);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

/* ── Contact Form ───────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = translations[currentLang];
    const msg = form.querySelector('.form-message');
    const btn = form.querySelector('#form-submit');
    if (!t) return;

    // Validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(f => {
      if (!f.value.trim()) { f.style.borderColor = '#e63127'; valid = false; }
      else f.style.borderColor = '';
    });

    if (!valid) {
      if (msg) { msg.className = 'form-message error'; msg.textContent = t.contacto.form.required; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Enviando...'; }

    if (FORMSPREE_ENDPOINT) {
      // Real send via Formspree
      try {
        const formData = new FormData(form);
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST', body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          if (msg) { msg.className = 'form-message success'; msg.textContent = t.contacto.form.success; }
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        if (msg) { msg.className = 'form-message error'; msg.textContent = 'Error al enviar. Inténtalo de nuevo o escríbenos a info@sim4ue.eu'; }
      }
    } else {
      // Demo mode (no Formspree configured yet)
      await new Promise(r => setTimeout(r, 1200));
      if (msg) { msg.className = 'form-message success'; msg.textContent = t.contacto.form.success + ' (Demo – configura Formspree para envío real)'; }
      form.reset();
    }

    if (btn) { btn.disabled = false; btn.textContent = t.contacto.form.send || 'Enviar mensaje'; }
  });
}

/* ── Gantt Chart ────────────────────────────────────────── */
function renderGantt(t) {
  const table = document.getElementById('gantt-table');
  const legend = document.getElementById('gantt-legend');
  const todayNote = document.getElementById('gantt-today-note');
  if (!table || !t.actividades) return;

  // Project timeline: Jan 2026 → Dec 2028 (36 months)
  const START = new Date(2026, 0, 1);
  const END   = new Date(2028, 11, 31);
  const TODAY = new Date(); // May 2026 approximately

  // Build month array
  const months = [];
  let cur = new Date(START);
  while (cur <= END) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  const TOTAL = months.length; // 36

  // Today column index
  const todayIdx = months.findIndex(m =>
    m.year === TODAY.getFullYear() && m.month === TODAY.getMonth());

  // Month abbreviations by lang
  const MON_LABELS = {
    es: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    pt: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
    gl: ['Xan','Feb','Mar','Abr','Mai','Xuñ','Xul','Ago','Set','Out','Nov','Dec'],
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  };
  const MON = MON_LABELS[currentLang] || MON_LABELS.es;

  // Activity date ranges
  const ACT_RANGES = [
    { id: 'A1', start: new Date(2026,0,1),  end: new Date(2027,11,31), cls: 'g-a1' },
    { id: 'A2', start: new Date(2026,0,1),  end: new Date(2027,3,30),  cls: 'g-a2' },
    { id: 'A3', start: new Date(2026,5,1),  end: new Date(2028,11,31), cls: 'g-a3' },
    { id: 'A4', start: new Date(2026,5,1),  end: new Date(2028,11,31), cls: 'g-a4' },
    { id: 'A5', start: new Date(2026,0,1),  end: new Date(2028,11,31), cls: 'g-a5' },
    { id: 'A6', start: new Date(2026,0,1),  end: new Date(2028,11,31), cls: 'g-a6' },
  ];

  const actItems = t.actividades.items || [];

  // Build year spans for header
  const years = [2026, 2027, 2028];
  const yearSpans = years.map(y => months.filter(m => m.year === y).length);

  // Header rows
  let thead = '<thead>';
  // Row 1: label + year spans
  thead += '<tr><th rowspan="2" style="text-align:left;min-width:170px;background:rgba(0,61,143,.95)">Actividad</th>';
  years.forEach((y, i) => {
    thead += `<th colspan="${yearSpans[i]}">${y}</th>`;
  });
  thead += '</tr>';
  // Row 2: month labels
  thead += '<tr>';
  months.forEach((m, i) => {
    const isToday = i === todayIdx;
    thead += `<th class="${isToday ? 'today-col' : ''}" title="${MON[m.month]} ${m.year}">${MON[m.month]}</th>`;
  });
  thead += '</tr></thead>';

  // Body rows
  let tbody = '<tbody>';
  ACT_RANGES.forEach((act, idx) => {
    const item = actItems[idx] || {};
    const name = item.title || act.id;
    const colorCls = act.cls;
    tbody += '<tr>';
    // Label
    tbody += `<td class="gantt-label-col">
      <span class="act-id ${colorCls}" style="color:white">${act.id}</span>
      <span class="act-name">${name}</span>
    </td>`;
    // Month cells
    months.forEach((m, i) => {
      const cellDate = new Date(m.year, m.month, 1);
      const cellEnd  = new Date(m.year, m.month + 1, 0);
      const inRange  = cellDate <= act.end && cellEnd >= act.start;
      const isToday  = i === todayIdx;
      // Is it the first cell of a run?
      const prevInRange = i > 0 ? (() => {
        const pm = months[i-1];
        const pd = new Date(pm.year, pm.month, 1);
        const pe = new Date(pm.year, pm.month + 1, 0);
        return pd <= act.end && pe >= act.start;
      })() : false;

      if (inRange) {
        const isFirst = !prevInRange;
        tbody += `<td class="gantt-cell active-cell${isToday ? ' today-col' : ''}">
          ${isToday ? '<div class="gantt-today-line"></div>' : ''}
          ${isFirst ? `<div class="gantt-bar ${colorCls}"></div>` : `<div class="gantt-bar ${colorCls}" style="border-radius:0"></div>`}
        </td>`;
      } else {
        tbody += `<td class="gantt-cell${isToday ? ' today-col' : ''}">
          ${isToday ? '<div class="gantt-today-line" style="background:var(--red);opacity:.5"></div>' : ''}
        </td>`;
      }
    });
    tbody += '</tr>';
  });
  tbody += '</tbody>';

  table.innerHTML = thead + tbody;

  // Legend
  if (legend) {
    const colors = [
      { cls: 'g-a1', label: 'A1' }, { cls: 'g-a2', label: 'A2' },
      { cls: 'g-a3', label: 'A3' }, { cls: 'g-a4', label: 'A4' },
      { cls: 'g-a5', label: 'A5' }, { cls: 'g-a6', label: 'A6' },
    ];
    legend.innerHTML = colors.map((c, i) => {
      const name = actItems[i]?.title || c.label;
      return `<div class="gantt-legend-item">
        <div class="gantt-legend-dot ${c.cls}"></div>
        <span><strong>${c.label}</strong> · ${name}</span>
      </div>`;
    }).join('');
  }

  // Today label
  if (todayNote) {
    const todayLabel = { es:'Hoy', pt:'Hoje', gl:'Hoxe', en:'Today' }[currentLang] || 'Hoy';
    todayNote.innerHTML = `${todayLabel} (${TODAY.toLocaleDateString(currentLang === 'en' ? 'en-GB' : currentLang + '-ES', {month:'short', year:'numeric'})})`;
  }

  // Update gantt titles
  const titles = {
    es: { h: 'Cronograma del proyecto', p: 'Distribución temporal de actividades · Enero 2026 – Diciembre 2028' },
    pt: { h: 'Cronograma do projeto',   p: 'Distribuição temporal das atividades · Janeiro 2026 – Dezembro 2028' },
    gl: { h: 'Cronograma do proxecto',  p: 'Distribución temporal das actividades · Xaneiro 2026 – Decembro 2028' },
    en: { h: 'Project timeline',        p: 'Activity schedule · January 2026 – December 2028' },
  };
  const gt = titles[currentLang] || titles.es;
  setElText('#gantt-title', gt.h);
  setElText('#gantt-subtitle', gt.p);
}

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Detect saved or browser language
  let lang = 'es';
  try { lang = localStorage.getItem('sim4ue_lang') || lang; } catch(_) {}
  const browserLang = navigator.language?.slice(0,2).toLowerCase();
  if (!localStorage.getItem('sim4ue_lang') && ['es','pt','gl','en'].includes(browserLang)) {
    lang = browserLang === 'gl' ? 'gl' : browserLang;
  }
  if (!['es','pt','gl','en'].includes(lang)) lang = 'es';

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Init modules
  initNavbar();
  initCookieBanner();
  initContactForm();
  initCounters();
  observeReveal();

  // Back to top
  const btt = document.getElementById('back-to-top');
  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Load language (renders all content)
  await setLanguage(lang);
});
