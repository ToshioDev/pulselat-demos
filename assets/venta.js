(function () {
  var forms = document.querySelectorAll('form[data-venta]');
  if (!forms.length) return;

  Array.prototype.forEach.call(forms, function (form) {
    var wa = (form.getAttribute('data-wa') || '').replace(/\D/g, '');
    var cafe = form.getAttribute('data-cafe') || 'el café';
    var asunto = form.getAttribute('data-asunto') || 'una consulta';
    var errorBox = form.querySelector('.venta-error');
    var aviso = form.querySelector('.venta-aviso');
    if (aviso) aviso.hidden = true;

    function labelOf(field) {
      if (field.getAttribute('data-label')) return field.getAttribute('data-label');
      var label = form.querySelector('label[for="' + field.id + '"]');
      return label ? label.textContent.trim() : field.name;
    }

    function setError(message) {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    function clearError() {
      if (errorBox) errorBox.hidden = true;
    }

    form.addEventListener('input', function (e) {
      if (e.target && e.target.hasAttribute('data-campo')) {
        e.target.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = Array.prototype.slice.call(form.querySelectorAll('[data-campo]'));
      var invalid = [];

      fields.forEach(function (field) {
        field.removeAttribute('aria-invalid');
        if (field.hasAttribute('required') && !field.value.trim()) {
          field.setAttribute('aria-invalid', 'true');
          invalid.push(field);
        }
      });

      if (invalid.length) {
        setError('Falta completar: ' + invalid.map(function (f) { return labelOf(f).toLowerCase(); }).join(', ') + '.');
        invalid[0].focus();
        return;
      }

      if (!wa) {
        setError('No pudimos preparar el enlace de WhatsApp. Escríbenos directo desde el número de la sección.');
        return;
      }

      clearError();
      var nombre = (form.elements.nombre && form.elements.nombre.value.trim()) || 'un cliente';
      var lineas = [
        'Hola, soy ' + nombre + '.',
        'Quiero ' + asunto + ' en ' + cafe + '.'
      ];

      fields.forEach(function (field) {
        if (field.name === 'nombre') return;
        var valor = field.value.trim();
        if (!valor) return;
        lineas.push(labelOf(field) + ': ' + valor);
      });

      lineas.push('Gracias.');
      var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(lineas.join('\n'));

      if (aviso) {
        aviso.textContent = 'Abrimos WhatsApp con tu mensaje. Si no se abrió, ';
        var enlace = document.createElement('a');
        enlace.href = url;
        enlace.target = '_blank';
        enlace.rel = 'noopener';
        enlace.textContent = 'toca aquí para enviarlo';
        aviso.appendChild(enlace);
        aviso.appendChild(document.createTextNode('.'));
        aviso.hidden = false;
      }

      window.open(url, '_blank', 'noopener');
    });
  });
})();
