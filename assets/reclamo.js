(function () {
  var aviso = document.getElementById('rc-float');
  if (!aviso) return;

  var clave = 'pulselat-reclamo-v1:' + location.pathname;
  var oculto = false;
  try { oculto = localStorage.getItem(clave) === '1'; } catch (e) {}

  function pintar() {
    aviso.classList.toggle('rc-off', oculto);
    document.body.classList.toggle('rc-vivo', !oculto);
  }

  pintar();

  var cerrar = aviso.querySelector('.rc-cerrar');
  if (cerrar) {
    cerrar.addEventListener('click', function () {
      oculto = true;
      try { localStorage.setItem(clave, '1'); } catch (e) {}
      pintar();
    });
  }
})();
