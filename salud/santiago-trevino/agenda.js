/* =========================================================================
   Agenda del Dr. Santiago Treviño · fuente única de disponibilidad.
   La usan la página principal (próximos horarios) y /agenda/ (calendario).

   IMPORTANTE: los días y horarios de abajo son DE MUESTRA para el demo.
   No son los horarios reales del consultorio; se reemplazan cuando el
   consultorio confirme su disponibilidad.
   ========================================================================= */
(function (global) {
  'use strict';

  var CONFIG = {
    zona: 'America/Mexico_City',
    offset: '-06:00',            // CDMX no usa horario de verano desde 2022
    duracionMin: 50,
    anticipacionHoras: 12,       // no se puede solicitar con menos de 12 h
    diasHorizonte: 56,           // se agenda hasta 8 semanas adelante
    ocupadosMuestraPct: 28,      // % de horarios marcados ocupados (determinista, de muestra)
    telefonoWa: '522223572531',
    telefonoTxt: '222 357 2531',
    correo: 'psiqtrevsan@gmail.com',
    sedes: {
      cuicuilco: {
        nombre: 'Clínica Cuicuilco', corto: 'Cuicuilco', modalidad: 'presencial', zona: 'Tlalpan',
        direccion: 'Av. San Fernando 649, Casa G, Manantial Peña Pobre, Tlalpan, 14060 CDMX',
        // 1 = lunes … 6 = sábado (MUESTRA)
        horario: { 1: ['16:00','17:00','18:00','19:00'], 3: ['16:00','17:00','18:00','19:00'], 4: ['10:00','11:00','12:00','13:00','16:00','17:00'] }
      },
      soma: {
        nombre: 'SOMA Medicina Integral', corto: 'SOMA', modalidad: 'presencial', zona: 'Pedregal',
        direccion: 'Blvd. Adolfo Ruiz Cortines 3332, Jardines del Pedregal, Álvaro Obregón, 01900 CDMX',
        horario: { 2: ['10:00','11:00','12:00','13:00'], 5: ['10:00','11:00','12:00','13:00'] }
      },
      video: {
        nombre: 'Videoconsulta', corto: 'Video', modalidad: 'video', zona: 'En línea',
        direccion: 'En línea (videoconsulta)',
        horario: { 1: ['08:00','09:00'], 2: ['17:00','18:00','19:00'], 3: ['08:00','09:00'], 5: ['17:00','18:00'], 6: ['09:00','10:00','11:00'] }
      }
    }
  };

  var SERVICIOS = {
    primera:        { nombre: 'Consulta psiquiátrica · primera vez', corto: 'Primera vez', nota: 'Evaluación inicial y plan de tratamiento', precio: 1800, modalidad: 'presencial' },
    seguimiento:    { nombre: 'Consulta de seguimiento', corto: 'Seguimiento', nota: 'Ya soy paciente', precio: 1500, modalidad: 'presencial' },
    psicoeducacion: { nombre: 'Psicoeducación', corto: 'Psicoeducación', nota: 'Información sobre diagnóstico y tratamiento', precio: 1800, modalidad: 'presencial' },
    medgen:         { nombre: 'Primera visita de Medicina General', corto: 'Medicina general', nota: 'Consulta médica general', precio: 800, modalidad: 'presencial' },
    aborto:         { nombre: 'Tratamiento psicoterapéutico y psicofarmacológico asociado al aborto', corto: 'Acompañamiento asociado al aborto', nota: 'Confidencial', precio: 1800, modalidad: 'presencial' },
    'tele-primera': { nombre: 'Telepsiquiatría · primera vez', corto: 'Primera vez', nota: 'Evaluación inicial por video', precio: 1500, modalidad: 'video' },
    'tele-seg':     { nombre: 'Telepsiquiatría · seguimiento', corto: 'Seguimiento', nota: 'Ya soy paciente', precio: 1500, modalidad: 'video' }
  };

  var CLAVE = 'st-trevino-citas-v1';

  /* ---------- Fechas (todo en hora de CDMX) ---------- */
  function hoy() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function instante(fecha, hora) { return new Date(fecha + 'T' + hora + ':00' + CONFIG.offset); }
  function sumarDias(fecha, n) {
    var p = fecha.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10);
  }
  function diaSemana(fecha) { return new Date(fecha + 'T00:00:00Z').getUTCDay(); }
  function fmt(op) { op.timeZone = CONFIG.zona; return new Intl.DateTimeFormat('es-MX', op); }
  var F = {
    largo: fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    medio: fmt({ weekday: 'long', day: 'numeric', month: 'long' }),
    corto: fmt({ weekday: 'short', day: 'numeric', month: 'short' }),
    mes: fmt({ month: 'long', year: 'numeric' })
  };
  function fecha(f, tipo) { return F[tipo || 'medio'].format(instante(f, '12:00')); }
  function dinero(n) { return '$' + n.toLocaleString('es-MX') + ' MXN'; }

  /* ---------- Apartados guardados en este navegador ---------- */
  function leerCitas() {
    try { var v = JSON.parse(localStorage.getItem(CLAVE) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  var citas = leerCitas();
  function guardarCita(c) {
    citas.push(c);
    try { localStorage.setItem(CLAVE, JSON.stringify(citas)); } catch (e) {}
  }
  function apartado(f, h) {
    // Un solo médico: un horario apartado se bloquea en todas las modalidades.
    return citas.some(function (c) { return c.fecha === f && c.hora === h; });
  }

  /* ---------- Disponibilidad ---------- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function ocupadoMuestra(f, h, sede) { return hash(f + '|' + h + '|' + sede) % 100 < CONFIG.ocupadosMuestraPct; }
  function dentroHorizonte(f) { var h = hoy(); return f >= h && f <= sumarDias(h, CONFIG.diasHorizonte); }
  function estadoSlot(f, h, sede) {
    if (!CONFIG.sedes[sede] || (CONFIG.sedes[sede].horario[diaSemana(f)] || []).indexOf(h) < 0) return 'no';
    if (instante(f, h).getTime() - Date.now() < CONFIG.anticipacionHoras * 3600e3) return 'no';
    if (!dentroHorizonte(f)) return 'no';
    if (apartado(f, h)) return 'ocupado';
    if (ocupadoMuestra(f, h, sede)) return 'ocupado';
    return 'libre';
  }
  var TODAS = ['cuicuilco', 'soma', 'video'];
  function slotsDia(f, sedes) {
    var dow = diaSemana(f), out = [];
    (sedes || TODAS).forEach(function (s) {
      (CONFIG.sedes[s].horario[dow] || []).forEach(function (h) { out.push({ fecha: f, hora: h, sede: s, estado: estadoSlot(f, h, s) }); });
    });
    return out.sort(function (a, b) { return a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0; });
  }
  function proximosLibres(n, sedes) {
    var out = [], f = hoy(), fin = sumarDias(f, CONFIG.diasHorizonte);
    for (; f <= fin && out.length < n; f = sumarDias(f, 1)) {
      slotsDia(f, sedes).forEach(function (s) { if (s.estado === 'libre' && out.length < n) out.push(s); });
    }
    return out;
  }
  function urlSlot(base, s) { return base + '?d=' + s.fecha + '&h=' + encodeURIComponent(s.hora) + '&s=' + s.sede; }
  function urlWa(texto) { return 'https://wa.me/' + CONFIG.telefonoWa + (texto ? '?text=' + encodeURIComponent(texto) : ''); }

  global.Agenda = {
    CONFIG: CONFIG, SERVICIOS: SERVICIOS, TODAS: TODAS,
    hoy: hoy, instante: instante, sumarDias: sumarDias, diaSemana: diaSemana,
    fecha: fecha, dinero: dinero, hash: hash,
    estadoSlot: estadoSlot, slotsDia: slotsDia, proximosLibres: proximosLibres,
    guardarCita: guardarCita, urlSlot: urlSlot, urlWa: urlWa
  };
})(window);
