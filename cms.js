/**
 * Brow Derma CMS — Content Loader v2
 * Loads content + sections config + design variables from Supabase.
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

  function setLeadingText(el, value) {
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) {
        el.childNodes[i].nodeValue = value + ' ';
        return;
      }
    }
    el.textContent = value;
  }

  function setTrailingText(el, value) {
    var nodes = el.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].nodeType === 3 && nodes[i].nodeValue.trim()) {
        nodes[i].nodeValue = value;
        return;
      }
    }
    el.appendChild(document.createTextNode(value));
  }

  function setMeta(attr, name, val) {
    var m = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (m) m.setAttribute('content', val);
  }

  // ── Apply a single content row ───────────────────────────────
  function applyRow(key, value, type) {
    if (!key || value == null || value === '') return;

    // Design CSS variables
    if (key.indexOf('design.color.') === 0) {
      var varName = '--' + key.replace('design.color.', '');
      document.documentElement.style.setProperty(varName, value);
      return;
    }

    // SEO
    if (key === 'seo.title')          { document.title = value; return; }
    if (key === 'seo.description')    { setMeta('name', 'description', value); return; }
    if (key === 'seo.og_title')       { setMeta('property', 'og:title', value); return; }
    if (key === 'seo.og_description') { setMeta('property', 'og:description', value); return; }

    // FAQ
    if (key === 'faq.items') {
      try {
        var items = JSON.parse(value);
        var grid  = document.querySelector('.faq-grid');
        if (!grid || !Array.isArray(items)) return;
        grid.innerHTML = items.map(function (it) {
          return '<div class="faq-item">'
            + '<button class="faq-q">' + esc(it.q) + '<span class="faq-icon">+</span></button>'
            + '<p class="faq-a">' + esc(it.a) + '</p></div>';
        }).join('');
        if (typeof window.initFaqAccordion === 'function') window.initFaqAccordion();
      } catch (e) {}
      return;
    }

    // DOM targets
    var els = document.querySelectorAll('[data-cms-key="' + key + '"]');
    if (!els.length) return;
    var isTarif   = /^tarif\./.test(key);
    var isContact = /^contact\./.test(key);
    var isSiteLogo = key === 'site.logo';

    els.forEach(function (el) {
      if (type === 'image' || isSiteLogo) {
        if (el.tagName === 'IMG') el.src = value;
        else el.style.backgroundImage = 'url(' + value + ')';
      } else if (type === 'html') {
        el.innerHTML = value;
      } else if (isTarif) {
        setLeadingText(el, value);
      } else if (isContact) {
        setTrailingText(el, value);
        if (key === 'contact.email')     el.href = 'mailto:' + value;
        if (key === 'contact.phone')     el.href = 'tel:+33' + value.replace(/^0/,'').replace(/[^0-9]/g,'');
        if (key === 'contact.instagram') el.href = 'https://instagram.com/' + value.replace('@','');
        if (key === 'contact.address')   el.href = 'https://maps.google.com/maps?q=' + encodeURIComponent(value);
      } else {
        el.textContent = value;
      }
    });
  }

  // ── Apply sections config (visibility + order) ───────────────
  function applySections(sections) {
    if (!sections || !sections.length) return;

    // Sort by position
    var sorted = sections.slice().sort(function (a, b) { return a.position - b.position; });

    // Get the main content parent (body or a wrapper)
    var parent = document.body;

    // Process each section
    sorted.forEach(function (sec) {
      var el = document.querySelector('[data-cms-section="' + sec.section_id + '"]');
      if (!el) return;

      if (!sec.visible) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
        // Re-append to enforce order (collect all cms-section elements in order first)
      }
    });

    // Reorder in DOM: collect all section elements, then reinsert in sorted order
    var allSectionEls = [];
    sorted.forEach(function (sec) {
      var el = document.querySelector('[data-cms-section="' + sec.section_id + '"]');
      if (el) allSectionEls.push(el);
    });

    if (allSectionEls.length > 1) {
      // Find the common parent (they should all share one)
      var commonParent = allSectionEls[0].parentNode;
      // Find the first section's position in parent to know where to start inserting
      var anchor = allSectionEls[0];
      allSectionEls.forEach(function (el) {
        commonParent.insertBefore(el, anchor);
        anchor = el.nextSibling;
      });
    }
  }

  loadScript(SDK, function () {
    try {
      var client = supabase.createClient(cfg.url, cfg.key);

      // Load content + sections in parallel
      Promise.all([
        client.from('content').select('key,value,type'),
        client.from('page_sections').select('*').eq('page', 'home').order('position')
      ]).then(function (results) {
        var contentRes  = results[0];
        var sectionsRes = results[1];

        if (!contentRes.error && contentRes.data) {
          contentRes.data.forEach(function (row) { applyRow(row.key, row.value, row.type); });
        }
        if (!sectionsRes.error && sectionsRes.data) {
          applySections(sectionsRes.data);
        }
      }).catch(function (e) { console.warn('CMS:', e); });

    } catch (e) { console.warn('CMS: init error', e); }
  });
})();
