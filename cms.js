/**
 * Brow Derma CMS — Content Loader
 * Fetches content from Supabase and injects it into the page.
 * Falls back silently to static HTML if Supabase is unreachable.
 */
(function () {
  'use strict';

  var cfg = window.CMS_CONFIG;
  if (!cfg || !cfg.url || cfg.url === 'YOUR_SUPABASE_URL') return;

  var SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src; s.onload = cb;
    s.onerror = function () { console.warn('CMS: SDK load failed'); };
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Set only the first text node, preserving child elements (e.g. <sub>€</sub>)
  function setLeadingText(el, value) {
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) {
        el.childNodes[i].nodeValue = value + ' ';
        return;
      }
    }
    el.textContent = value; // fallback
  }

  // Set the last text node of an element (used for contact links with icon prefix)
  function setTrailingText(el, value) {
    var nodes = el.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].nodeType === 3 && nodes[i].nodeValue.trim()) {
        nodes[i].nodeValue = value;
        return;
      }
    }
    // No trailing text node found — append one
    el.appendChild(document.createTextNode(value));
  }

  function applyRow(key, value, type) {
    if (!key || value == null || value === '') return;

    // ── SEO (no data-cms-key needed) ─────────────────────────
    if (key === 'seo.title')          { document.title = value; return; }
    if (key === 'seo.description')    { setMeta('name',     'description',    value); return; }
    if (key === 'seo.og_title')       { setMeta('property', 'og:title',       value); return; }
    if (key === 'seo.og_description') { setMeta('property', 'og:description', value); return; }

    // ── FAQ rebuild ──────────────────────────────────────────
    if (key === 'faq.items') {
      try {
        var items = JSON.parse(value);
        var grid  = document.querySelector('.faq-grid');
        if (!grid || !Array.isArray(items)) return;
        var html = '';
        items.forEach(function (it) {
          html += '<div class="faq-item">'
            + '<button class="faq-q">' + esc(it.q) + '<span class="faq-icon">+</span></button>'
            + '<p class="faq-a">' + esc(it.a) + '</p></div>';
        });
        grid.innerHTML = html;
        if (typeof window.initFaqAccordion === 'function') window.initFaqAccordion();
      } catch (e) { console.warn('CMS: faq.items parse error', e); }
      return;
    }

    // ── DOM targets ──────────────────────────────────────────
    var els = document.querySelectorAll('[data-cms-key="' + key + '"]');
    if (!els.length) return;

    var isTarifPrice   = /^tarif\./.test(key) && /\.price$|\.retouche\./.test(key);
    var isContactField = /^contact\./.test(key);

    els.forEach(function (el) {
      if (type === 'image') {
        if (el.tagName === 'IMG') el.src = value;
        else el.style.backgroundImage = 'url(' + value + ')';

      } else if (type === 'html') {
        el.innerHTML = value;

      } else if (isTarifPrice) {
        // Preserve the <sub>€</sub> child
        setLeadingText(el, value);

      } else if (isContactField) {
        // Contact links have a leading icon <div> then a text node
        setTrailingText(el, value);
        // Also update href
        if (key === 'contact.email')     el.href = 'mailto:' + value;
        if (key === 'contact.phone')     el.href = 'tel:+33' + value.replace(/^0/, '').replace(/[^0-9]/g, '');
        if (key === 'contact.instagram') el.href = 'https://instagram.com/' + value.replace('@', '');
        if (key === 'contact.address')   el.href = 'https://maps.google.com/maps?q=' + encodeURIComponent(value);

      } else {
        el.textContent = value;
      }
    });
  }

  function setMeta(attr, name, val) {
    var m = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (m) m.setAttribute('content', val);
  }

  loadScript(SDK, function () {
    try {
      var client = supabase.createClient(cfg.url, cfg.key);
      client.from('content').select('key,value,type').then(function (res) {
        if (res.error) { console.warn('CMS:', res.error.message); return; }
        (res.data || []).forEach(function (row) { applyRow(row.key, row.value, row.type); });
      });
    } catch (e) { console.warn('CMS: init error', e); }
  });
})();
