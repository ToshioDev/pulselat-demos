(function () {
  var btn = document.querySelector('[data-menu-toggle]');
  var panel = document.getElementById('menu-movil');
  if (!btn || !panel) return;

  var lastFocus = null;

  function focusables() {
    return Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled])'));
  }

  function open() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-abierto');
    var items = focusables();
    if (items.length) items[0].focus();
  }

  function close(restore) {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-abierto');
    if (restore && lastFocus) lastFocus.focus();
  }

  btn.addEventListener('click', function () {
    if (panel.hidden) open(); else close(true);
  });

  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-close]')) {
      e.preventDefault();
      close(true);
    } else if (e.target.closest('a')) {
      close(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    if (e.key === 'Escape') { close(true); return; }
    if (e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close(false);
  });
})();
