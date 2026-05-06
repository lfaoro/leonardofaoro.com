(function () {
  'use strict';

  var header = document.getElementById('header');
  var toggle = document.getElementById('theme-toggle');
  var toast = document.getElementById('toast');

  // --- Escape closes menu ---
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var t = document.getElementById('menu-toggle');
      if (t && t.checked) { t.checked = false; document.body.style.overflow = ''; }
    }
  });

  // --- Header scroll ---
  window.addEventListener('scroll', function () {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('nav-scrolled');
    } else {
      header.classList.remove('nav-scrolled');
    }
  }, { passive: true });

  // --- Active nav indicator ---
  var navLinks = document.querySelectorAll('nav a[data-section]');
  var mobileLinks = document.querySelectorAll('.mobile-menu-link[data-section]');
  var sections = document.querySelectorAll('section[id]');

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('nav-active', link.getAttribute('data-section') === id);
    });
    mobileLinks.forEach(function (link) {
      link.classList.toggle('nav-active', link.getAttribute('data-section') === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  // --- Year ---
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear().toString();
  });

  // --- Theme toggle ---
  if (toggle) {
    toggle.addEventListener('click', function () {
      var html = document.documentElement;
      var isDark = html.classList.toggle('dark');
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (_) { }
    });
  }

  // Keyboard shortcut: Cmd/Ctrl+Shift+L
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      if (toggle) toggle.click();
    }
  });

  // --- Smooth scroll with offset ---
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      var t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        var offset = 80;
        var top = t.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // --- Copy to clipboard ---
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2000);
  }

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied to clipboard');
      }).catch(function () {
        showToast('Copy failed');
      });
    });
  });

  // --- Scroll-triggered fade-in ---
  var fadeEls = document.querySelectorAll('section');
  fadeEls.forEach(function (el) {
    el.classList.add('fade-in');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Live GitHub stats with localStorage cache ---
  var GH_CACHE_KEY = 'gh-cache-v1';
  var GH_CACHE_TTL = 3600000; // 1 hour

  function getCached(repo) {
    try {
      var raw = localStorage.getItem(GH_CACHE_KEY + ':' + repo);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (Date.now() - entry.ts < GH_CACHE_TTL) return entry.data;
    } catch (_) { }
    return null;
  }

  function setCached(repo, data) {
    try {
      localStorage.setItem(GH_CACHE_KEY + ':' + repo, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (_) { }
  }

  function fetchGitHub(repo, callback) {
    var cached = getCached(repo);
    if (cached) {
      callback(cached);
      return;
    }
    fetch('https://api.github.com/repos/' + repo, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setCached(repo, data);
        callback(data);
      })
      .catch(function () {
        callback(null);
      });
  }

  document.querySelectorAll('.gh-stars').forEach(function (el) {
    var repo = el.getAttribute('data-repo');
    if (!repo) return;
    fetchGitHub(repo, function (data) {
      el.classList.remove('gh-loading');
      if (data && typeof data.stargazers_count === 'number') {
        el.textContent = data.stargazers_count.toLocaleString();
      } else {
        el.textContent = '0';
      }
    });
  });

  document.querySelectorAll('.gh-forks').forEach(function (el) {
    var repo = el.getAttribute('data-repo');
    if (!repo) return;
    fetchGitHub(repo, function (data) {
      el.classList.remove('gh-loading');
      if (data && typeof data.forks_count === 'number') {
        el.textContent = data.forks_count.toLocaleString();
      } else {
        el.textContent = '0';
      }
    });
  });
})();
