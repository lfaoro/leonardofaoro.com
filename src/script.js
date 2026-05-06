(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger-menu');
  var mobile = document.getElementById('mobile-menu');
  var backdrop = document.getElementById('menu-backdrop');
  var links = document.querySelectorAll('.mobile-menu-link');
  var toggle = document.getElementById('theme-toggle');
  var toast = document.getElementById('toast');

  // --- Mobile menu ---
  var lastFocused = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')
    );
  }

  function trapFocus(e) {
    if (!mobile) return;
    var focusable = getFocusable(mobile);
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && e.key === 'Tab') {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else if (e.key === 'Tab') {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  function setMenu(isOpen) {
    if (!burger || !mobile) return;
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      lastFocused = document.activeElement;
      mobile.classList.remove('-translate-x-full');
      burger.classList.add('burger-open');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', trapFocus);
      if (backdrop) {
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100');
      }
      setTimeout(function () {
        var focusable = getFocusable(mobile);
        if (focusable.length) focusable[0].focus();
      }, 50);
    } else {
      mobile.classList.add('-translate-x-full');
      burger.classList.remove('burger-open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', trapFocus);
      if (backdrop) {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
      }
      if (lastFocused) lastFocused.focus();
    }
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(mobile.classList.contains('-translate-x-full'));
    });
  }

  links.forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  // Close on backdrop tap
  if (backdrop) {
    backdrop.addEventListener('click', function () {
      setMenu(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
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
    }, { threshold: 0.2 });

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
