/* Comanda dinámica reutilizable para cualquier carta.
   Raíz [data-carrito] con data-wa, data-cafe y data-verbo ("pedido" | "apartado").
   Cada [data-item]: data-precio (vacío = a cotizar) y [data-variante] con su data-precio.
   Chips de opción única: [data-modo], [data-hora] o [data-grupo] con botones [data-opcion]. */
(function () {
  var roots = document.querySelectorAll('[data-carrito]');
  if (!roots.length) return;

  function money(n) {
    return '$' + Number(n).toLocaleString('es-MX');
  }

  function textOf(el) {
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  Array.prototype.forEach.call(roots, function (root) {
    var wa = (root.getAttribute('data-wa') || '').replace(/\D/g, '');
    var cafe = root.getAttribute('data-cafe') || 'el café';
    var verbo = root.getAttribute('data-verbo') || 'pedido';
    var cta = root.querySelector('[data-enviar]');
    var cuentaEl = root.querySelector('[data-cuenta]');
    var totalEl = root.querySelector('[data-total]');
    var aviso = root.querySelector('.carrito-aviso');
    var vaciar = root.querySelector('[data-vaciar]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-item]'));
    var modo = '';
    var hora = '';
    var extraGroups = {};

    if (aviso) aviso.hidden = true;

    function priceOf(item) {
      var active = item.querySelector('[data-variante][aria-pressed="true"]');
      var raw = active && active.hasAttribute('data-precio')
        ? active.getAttribute('data-precio')
        : item.getAttribute('data-precio');
      if (raw === null || raw === '') return null;
      var n = Number(raw);
      return isNaN(n) ? null : n;
    }

    function nameOf(item) {
      return item.getAttribute('data-nombre') || textOf(item.querySelector('.carrito-item-nombre'));
    }

    function noPriceText(item) {
      return item.getAttribute('data-precio-texto') || 'Precio del día';
    }

    function variantOf(item) {
      var active = item.querySelector('[data-variante][aria-pressed="true"]');
      if (!active) return '';
      return active.getAttribute('data-nombre-variante') || textOf(active.cloneNode(true)).replace(/\s*\$[\d.,]+$/, '').trim();
    }

    function setError(message) {
      if (!aviso) return;
      aviso.textContent = message;
      aviso.hidden = false;
    }

    function clearNotice() {
      if (aviso) aviso.hidden = true;
    }

    function summary() {
      var count = 0;
      var total = 0;
      var pending = 0;
      items.forEach(function (item) {
        var qty = Number(item.getAttribute('data-qty') || 0);
        if (!qty) return;
        count += qty;
        var p = priceOf(item);
        if (p === null) pending += qty;
        else total += p * qty;
      });
      if (cuentaEl) {
        cuentaEl.textContent = count === 0
          ? 'Elige al menos un producto'
          : count + (count === 1 ? ' producto' : ' productos');
      }
      if (totalEl) {
        if (count === 0) totalEl.textContent = '$0';
        else if (pending && !total) totalEl.textContent = 'A cotizar';
        else totalEl.textContent = money(total) + (pending ? ' + a cotizar' : '');
      }
      if (cta) cta.disabled = count === 0;
      if (vaciar) vaciar.hidden = count === 0;
      return { count: count, total: total, pending: pending };
    }

    function setQty(item, qty) {
      qty = Math.max(0, Math.min(99, qty));
      item.setAttribute('data-qty', qty);
      var qtyEl = item.querySelector('[data-cantidad]');
      var minus = item.querySelector('[data-menos]');
      if (qtyEl) qtyEl.textContent = qty;
      if (minus) minus.disabled = qty === 0;
      item.classList.toggle('carrito-item--activo', qty > 0);
      clearNotice();
      summary();
    }

    items.forEach(function (item) {
      var variants = Array.prototype.slice.call(item.querySelectorAll('[data-variante]'));
      var active = item.querySelector('[data-variante][aria-pressed="true"]') || variants[0];
      var priceEl = item.querySelector('[data-precio-item]');
      var minus = item.querySelector('[data-menos]');
      var plus = item.querySelector('[data-mas]');
      var qtyEl = item.querySelector('[data-cantidad]');

      item.setAttribute('data-qty', 0);

      function paintPrice() {
        var p = priceOf(item);
        if (priceEl) priceEl.textContent = p === null ? noPriceText(item) : money(p);
        summary();
      }

      if (active) {
        variants.forEach(function (v) {
          v.setAttribute('aria-pressed', String(v === active));
        });
      }

      variants.forEach(function (v) {
        v.addEventListener('click', function () {
          variants.forEach(function (other) {
            other.setAttribute('aria-pressed', String(other === v));
          });
          paintPrice();
        });
      });

      if (minus) minus.addEventListener('click', function () {
        setQty(item, Number(item.getAttribute('data-qty') || 0) - 1);
      });
      if (plus) plus.addEventListener('click', function () {
        setQty(item, Number(item.getAttribute('data-qty') || 0) + 1);
      });
      if (qtyEl) qtyEl.textContent = 0;
      if (minus) minus.disabled = true;
      paintPrice();
    });

    function bindGroup(selector, attr, setter) {
      var group = root.querySelector(selector);
      if (!group) return;
      var opts = Array.prototype.slice.call(group.querySelectorAll('[' + attr + ']'));
      var selected = opts.filter(function (o) { return o.getAttribute('aria-pressed') === 'true'; })[0] || opts[0];
      if (!selected) return;
      opts.forEach(function (o) {
        o.setAttribute('aria-pressed', String(o === selected));
      });
      setter(textOf(selected));
      opts.forEach(function (o) {
        o.addEventListener('click', function () {
          opts.forEach(function (other) {
            other.setAttribute('aria-pressed', String(other === o));
          });
          setter(textOf(o));
        });
      });
    }

    bindGroup('[data-modo]', 'data-modo-opcion', function (v) { modo = v; });
    bindGroup('[data-hora]', 'data-hora-opcion', function (v) { hora = v; });

    Array.prototype.forEach.call(root.querySelectorAll('[data-grupo]'), function (group) {
      var key = group.getAttribute('data-grupo');
      var opts = Array.prototype.slice.call(group.querySelectorAll('[data-opcion]'));
      var selected = opts.filter(function (o) { return o.getAttribute('aria-pressed') === 'true'; })[0] || opts[0];
      if (!key || !selected) return;
      opts.forEach(function (o) { o.setAttribute('aria-pressed', String(o === selected)); });
      extraGroups[key] = textOf(selected);
      opts.forEach(function (o) {
        o.addEventListener('click', function () {
          opts.forEach(function (other) { other.setAttribute('aria-pressed', String(other === o)); });
          extraGroups[key] = textOf(o);
        });
      });
    });

    if (vaciar) vaciar.addEventListener('click', function () {
      items.forEach(function (item) { setQty(item, 0); });
    });

    if (cta) cta.addEventListener('click', function () {
      var res = summary();
      if (!res.count) {
        setError('Elige al menos un producto para armar el mensaje.');
        return;
      }
      if (!wa) {
        setError('No pudimos preparar el enlace de WhatsApp. Escríbenos directo desde el número de la sección.');
        return;
      }

      var head = verbo === 'apartado'
        ? 'Hola. Quiero apartar en ' + cafe + ':'
        : 'Hola. Quiero hacer un pedido en ' + cafe + ':';
      var lines = [head];

      items.forEach(function (item) {
        var qty = Number(item.getAttribute('data-qty') || 0);
        if (!qty) return;
        var p = priceOf(item);
        var variant = variantOf(item);
        var line = '• ' + qty + ' × ' + nameOf(item) + (variant ? ' (' + variant + ')' : '');
        line += p === null ? ' — ' + noPriceText(item) : ' — ' + money(p * qty);
        lines.push(line);
      });

      if (res.pending && !res.total) lines.push('Total: a cotizar');
      else lines.push('Total: ' + money(res.total) + (res.pending ? ' + productos a cotizar' : ''));

      var extra = [];
      if (modo) extra.push(modo);
      if (hora) extra.push(hora);
      Object.keys(extraGroups).forEach(function (key) {
        if (extraGroups[key]) extra.push(key + ': ' + extraGroups[key]);
      });
      if (extra.length) lines.push('', extra.join(' · '));
      lines.push('Gracias.');

      var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(lines.join('\n'));

      clearNotice();
      if (aviso) {
        aviso.textContent = 'Abrimos WhatsApp con tu ' + verbo + '. Si no se abrió, ';
        var link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'toca aquí para enviarlo';
        aviso.appendChild(link);
        aviso.appendChild(document.createTextNode('.'));
        aviso.hidden = false;
      }
      window.open(url, '_blank', 'noopener');
    });

    summary();
  });
})();
