#!/usr/bin/env python3
"""Genera maquetas de landing a partir de un config por negocio.

Uso: python build.py [slug ...]
Sin argumentos regenera todas las carpetas con config.json.
"""
import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent

CONFIGS = {
    "al-grano": {
        "marca": "Al Grano",
        "zona": "Lindavista · Calz. Azcapotzalco 1248",
        "titulo": "Café, antojo<br>y <em>terraza.</em>",
        "lead": "Muros verdes, flores y una mesa esperando. Café de la mañana, comida a media tarde y postres hasta el cierre.",
        "rating": "4.5",
        "resenas": "1,379",
        "hechos": [
            "Terraza amplia con sombra y luz cálida",
            "Café, baguettes y repostería del día",
            "Pedidos para llevar y para oficina",
        ],
        "menu": [
            ("Espresso", "Doble, taza corta", "$42"),
            ("Capuchino", "Leche vaporizada, cocoa", "$62"),
            ("Latte de la casa", "Con jarabe de temporada", "$68"),
            ("Frappé de café", "Con crema batida", "$75"),
            ("Baguette de pavo", "Pan horneado, aderezos", "$95"),
            ("Rebanada del día", "Pregunta por la del día", "$55"),
        ],
        "dir": "Calz. Azcapotzalco - La Villa 1248<br>Lindavista, Gustavo A. Madero, 07300",
        "maps": "Al Grano Express Calz Azcapotzalco La Villa",
        "tel": "5555866556",
        "tel_txt": "55 5586 6556",
        "paleta": {
            "noche": "#0e1712", "noche2": "#14201a", "crema": "#f4efe6",
            "amb": "#e8792a", "amb2": "#f7ab68", "gris": "#9aa79c",
        },
        "foto": "foto2.jpg",
        "pos": "50% 42%",
    },
    "cafetzin": {
        "marca": "Cafetzin",
        "zona": "Estrella · Calz. de Guadalupe 537",
        "titulo": "Café de barrio<br><em>hasta la noche.</em>",
        "lead": "Neón encendido, mesas afuera y café que no se acaba. El punto de la colonia para platicar sin mirar el reloj.",
        "rating": "4.8",
        "resenas": "362",
        "hechos": [
            "Abierto hasta tarde, todos los días",
            "Café, sándwiches y postres caseros",
            "Terraza con mesas para grupos",
        ],
        "menu": [
            ("Americano", "Café de olla o americano", "$40"),
            ("Capuchino", "Con canela de la casa", "$60"),
            ("Chocolate", "Con leche y canela", "$55"),
            ("Sándwich de la casa", "Pan artesanal, al gusto", "$85"),
            ("Cuernito relleno", "Jamón y queso", "$60"),
            ("Pastel del día", "Pregunta por la rebanada", "$50"),
        ],
        "dir": "Calz. de Guadalupe 537<br>Col. Estrella, Gustavo A. Madero, 07800",
        "maps": "Cafetería Cafetzin Calz de Guadalupe 537",
        "tel": "527971301245",
        "tel_txt": "797 130 1245",
        "paleta": {
            "noche": "#120d10", "noche2": "#1a1216", "crema": "#f6ecea",
            "amb": "#ef5b4c", "amb2": "#ff9478", "gris": "#a89693",
        },
        "foto": "foto2.jpg",
        "pos": "50% 45%",
    },
    "cultura": {
        "marca": "Cultura, Ideas & Café",
        "zona": "Lindavista · Ing. Carlos Daza 202",
        "titulo": "Café, libros<br>y una mesa<br><em>para quedarse.</em>",
        "lead": "Paredes de terracota, repisa de frascos y café recién hecho. Un local de colonia para leer, trabajar o simplemente estar.",
        "rating": "4.3",
        "resenas": "532",
        "hechos": [
            "Espacio tranquilo para leer y trabajar",
            "Café de olla, espresso y chocolate",
            "Desayunos y comida corrida",
        ],
        "menu": [
            ("Café de olla", "Con piloncillo y canela", "$35"),
            ("Espresso", "Doble", "$40"),
            ("Capuchino", "Leche vaporizada", "$58"),
            ("Chocolate caliente", "Con leche entera", "$52"),
            ("Desayuno de la casa", "Huevos al gusto, café y pan", "$95"),
            ("Comida corrida", "Sopa, guisado y agua fresca", "$120"),
        ],
        "dir": "Ing. Carlos Daza 202<br>Guadalupe Insurgentes, Gustavo A. Madero, 07870",
        "maps": "Cultura Ideas y Café Carlos Daza 202 Lindavista",
        "tel": "55590370545",
        "tel_txt": "55 9037 0545",
        "paleta": {
            "noche": "#1a100c", "noche2": "#231510", "crema": "#f7ece0",
            "amb": "#c2552f", "amb2": "#e78d59", "gris": "#a99486",
        },
        "foto": "foto2.jpg",
        "pos": "50% 50%",
    },
}

TEMPLATE = """<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>{marca} · Lindavista</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter+Tight:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{{
    --noche:{noche}; --noche-2:{noche2}; --crema:{crema};
    --amb:{amb}; --amb-2:{amb2}; --gris:{gris};
    --linea:rgba(247,236,224,.16);
  }}
  *{{box-sizing:border-box;margin:0;padding:0}}
  html{{scroll-behavior:smooth}}
  body{{background:var(--noche);color:var(--crema);font-family:"Inter Tight",system-ui,sans-serif;font-weight:300;line-height:1.55;-webkit-font-smoothing:antialiased}}
  a{{color:inherit;text-decoration:none}}
  .wrap{{max-width:1180px;margin:0 auto;padding:0 28px}}
  .serif{{font-family:"Fraunces",Georgia,serif;font-weight:400;letter-spacing:-.015em;line-height:1.02}}
  nav{{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:26px 28px;max-width:1180px;margin:0 auto}}
  .marca{{display:flex;align-items:center;gap:12px;font-size:13px;letter-spacing:.18em;text-transform:uppercase}}
  .marca svg{{width:30px;height:30px;flex:none}}
  .nav-links{{display:flex;gap:28px;font-size:14px;color:rgba(247,236,224,.72)}}
  .nav-links a:hover{{color:var(--amb-2)}}
  .hero{{position:relative;min-height:min(94vh,880px);display:flex;align-items:flex-end;overflow:hidden}}
  .hero img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{pos};filter:saturate(1.03) contrast(1.02)}}
  .hero::after{{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,8,7,.74) 0%,rgba(10,8,7,.15) 30%,rgba(10,8,7,.6) 66%,var(--noche) 100%)}}
  .hero .wrap{{position:relative;z-index:2;padding-bottom:64px;padding-top:180px}}
  .eyebrow{{display:inline-flex;align-items:center;gap:10px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--amb-2)}}
  .eyebrow::before{{content:"";width:34px;height:1px;background:var(--amb);display:block}}
  h1{{font-size:clamp(50px,9.5vw,132px);margin:18px 0 14px;font-weight:400}}
  h1 em{{font-style:italic;color:var(--amb-2)}}
  .lead{{max-width:46ch;font-size:clamp(16px,1.5vw,19px);color:rgba(247,236,224,.84)}}
  .acciones{{display:flex;flex-wrap:wrap;gap:14px;margin-top:32px}}
  .btn{{display:inline-flex;align-items:center;gap:10px;padding:15px 26px;border-radius:999px;font-size:15px;font-weight:500;transition:.2s}}
  .btn-solido{{background:var(--amb);color:#17100a}}
  .btn-solido:hover{{background:var(--amb-2);transform:translateY(-1px)}}
  .btn-linea{{border:1px solid rgba(247,236,224,.34)}}
  .btn-linea:hover{{border-color:var(--amb-2);color:var(--amb-2)}}
  .cinta{{border-top:1px solid var(--linea);border-bottom:1px solid var(--linea);background:var(--noche-2)}}
  .cinta .wrap{{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding:22px 28px}}
  .estrellas{{display:flex;align-items:center;gap:14px}}
  .estrellas b{{font-family:"Fraunces",serif;font-weight:500;font-size:30px;line-height:1}}
  .estrellas span{{font-size:14px;color:var(--gris)}}
  .estrellas .stars{{color:var(--amb);letter-spacing:2px;font-size:15px}}
  .cinta a.enlace{{font-size:14px;border-bottom:1px solid var(--amb);padding-bottom:2px;color:var(--amb-2)}}
  section{{padding:110px 0}}
  .kicker{{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--gris);margin-bottom:22px}}
  h2{{font-size:clamp(34px,4.6vw,62px);max-width:22ch}}
  .dos{{display:grid;grid-template-columns:1.05fr .95fr;gap:70px;align-items:start}}
  .dos p{{color:rgba(247,236,224,.76);font-size:17px;max-width:44ch}}
  .dos p + p{{margin-top:18px}}
  .lista-hechos{{border-top:1px solid var(--linea)}}
  .lista-hechos div{{display:flex;gap:18px;padding:20px 0;border-bottom:1px solid var(--linea);align-items:baseline}}
  .lista-hechos b{{font-family:"Fraunces",serif;font-weight:400;font-size:22px;color:var(--amb-2);min-width:34px}}
  .lista-hechos span{{font-size:15px;color:rgba(247,236,224,.8)}}
  .menu{{background:var(--noche-2);border-top:1px solid var(--linea);border-bottom:1px solid var(--linea)}}
  .menu .head{{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:24px;margin-bottom:54px}}
  .nota{{font-size:13px;color:var(--gris);max-width:30ch;text-align:right}}
  .platillos{{display:grid;grid-template-columns:repeat(2,1fr);gap:0 70px}}
  .platillo{{display:flex;align-items:baseline;gap:14px;padding:22px 0;border-bottom:1px solid var(--linea)}}
  .platillo .n{{font-size:19px}}
  .platillo .d{{font-size:13px;color:var(--gris);margin-top:4px}}
  .platillo .puntos{{flex:1;border-bottom:1px dotted rgba(247,236,224,.25);transform:translateY(-4px)}}
  .platillo .precio{{font-family:"Fraunces",serif;font-size:19px;color:var(--amb-2);white-space:nowrap}}
  .ubic{{display:grid;grid-template-columns:1fr 1fr;gap:70px}}
  .dato{{padding:24px 0;border-bottom:1px solid var(--linea)}}
  .dato h3{{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--gris);font-weight:400;margin-bottom:8px}}
  .dato p{{font-size:18px;max-width:34ch}}
  .dato a{{color:var(--amb-2)}}
  .horario{{display:flex;justify-content:space-between;gap:16px;font-size:15px;padding:10px 0;color:rgba(247,236,224,.8)}}
  .horario b{{font-weight:500;color:var(--crema)}}
  .cierre{{background:var(--noche-2);border-top:1px solid var(--linea);text-align:center;padding:120px 0}}
  .cierre h2{{margin:0 auto 18px;max-width:26ch}}
  .cierre p{{color:var(--gris);margin:0 auto 36px;max-width:52ch}}
  .cierre .acciones{{justify-content:center}}
  footer{{padding:44px 0;border-top:1px solid var(--linea);font-size:12px;color:var(--gris)}}
  footer .wrap{{display:flex;flex-wrap:wrap;justify-content:space-between;gap:14px}}
  @media (max-width:860px){{
    .nav-links{{display:none}}
    .dos,.ubic{{grid-template-columns:1fr;gap:40px}}
    .platillos{{grid-template-columns:1fr}}
    .nota{{text-align:left}}
    section{{padding:76px 0}}
    .hero{{min-height:88vh}}
    .hero::after{{background:linear-gradient(180deg,rgba(10,8,7,.78) 0%,rgba(10,8,7,.34) 26%,rgba(10,8,7,.72) 62%,var(--noche) 100%)}}
    .hero .wrap{{padding-top:140px}}
    .acciones{{gap:10px}}
    .acciones .btn{{flex:1;justify-content:center}}
  }}
</style>
</head>
<body>
<nav>
  <div class="marca">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" stroke="var(--amb)" stroke-width="1.2"/>
      <circle cx="20" cy="20" r="12" stroke="var(--amb)" stroke-opacity=".45" stroke-width="1"/>
      <circle cx="20" cy="20" r="5" fill="var(--amb)"/>
    </svg>
    {marca}
  </div>
  <div class="nav-links">
    <a href="#casa">La casa</a><a href="#menu">Menú</a><a href="#visita">Visítanos</a>
    <a href="https://wa.me/{tel}">WhatsApp</a>
  </div>
</nav>
<header class="hero">
  <img src="fotos/{foto}" alt="{marca} en Lindavista">
  <div class="wrap">
    <span class="eyebrow">{zona}</span>
    <h1 class="serif">{titulo}</h1>
    <p class="lead">{lead}</p>
    <div class="acciones">
      <a class="btn btn-solido" href="https://wa.me/{tel}">Pedir por WhatsApp</a>
      <a class="btn btn-linea" href="#menu">Ver el menú</a>
    </div>
  </div>
</header>
<div class="cinta"><div class="wrap">
  <div class="estrellas"><b>{rating}</b><div><div class="stars">★★★★★</div><span>{resenas} reseñas en Google</span></div></div>
  <a class="enlace" href="https://flamastars.pulselat.online/r/{slug}">Leer las reseñas</a>
</div></div>
<section id="casa"><div class="wrap dos">
  <div>
    <div class="kicker">La casa</div>
    <h2 class="serif">Aquí se viene <br>sin prisa.</h2>
    <p style="margin-top:26px">{lead}</p>
    <p>Todo se prepara al momento, con café de tueste local. También tenemos todo para llevar.</p>
  </div>
  <div class="lista-hechos">{hechos}</div>
</div></section>
<section class="menu" id="menu"><div class="wrap">
  <div class="head">
    <div><div class="kicker">Menú</div><h2 class="serif">Lo de siempre,<br>bien hecho.</h2></div>
    <p class="nota">Ejemplo de carta: se arma con tu menú real y tus precios.</p>
  </div>
  <div class="platillos">{platillos}</div>
</div></section>
<section id="visita"><div class="wrap ubic">
  <div>
    <div class="kicker">Visítanos</div>
    <h2 class="serif">Aquí, en el barrio.</h2>
    <div class="dato" style="margin-top:34px"><h3>Dirección</h3><p>{dir}</p></div>
    <div class="dato"><h3>WhatsApp y llamadas</h3><p><a href="https://wa.me/{tel}">{tel_txt}</a></p></div>
    <div class="dato" style="border:none"><h3>Cómo llegar</h3><p><a href="https://www.google.com/maps/search/?api=1&query={maps_q}">Abrir en Google Maps →</a></p></div>
  </div>
  <div>
    <div class="kicker">Horario</div>
    <div class="horario"><b>Lunes a viernes</b><span>Abierto</span></div>
    <div class="horario"><b>Sábado</b><span>Abierto</span></div>
    <div class="horario"><b>Domingo</b><span>Abierto</span></div>
    <div class="dato" style="margin-top:44px"><h3>Para llevar</h3><p>Manda tu pedido por WhatsApp y pasa por él sin fila.</p></div>
  </div>
</div></section>
<section class="cierre"><div class="wrap">
  <h2 class="serif">¿Nos vemos?</h2>
  <p>Escríbenos por WhatsApp para apartar mesa, pedir para llevar o preguntar qué hay hoy.</p>
  <div class="acciones">
    <a class="btn btn-solido" href="https://wa.me/{tel}">Escribir por WhatsApp</a>
    <a class="btn btn-linea" href="https://www.google.com/maps/search/?api=1&query={maps_q}">Cómo llegar</a>
  </div>
</div></section>
<footer><div class="wrap">
  <span>{marca} · {zona}</span><span>Propuesta de Pulse LAT · pulselat.online</span>
</div></footer>
</body>
</html>
"""


def render(slug, c):
    p = c["paleta"]
    hechos = "".join(
        f'<div><b>0{i+1}</b><span>{h}</span></div>' for i, h in enumerate(c["hechos"])
    )
    platillos = "".join(
        f'<div class="platillo"><div><div class="n">{n}</div><div class="d">{d}</div></div>'
        f'<div class="puntos"></div><div class="precio">{precio}</div></div>'
        for n, d, precio in c["menu"]
    )
    html = TEMPLATE.format(
        slug=slug,
        marca=c["marca"],
        zona=c["zona"],
        titulo=c["titulo"],
        lead=c["lead"],
        rating=c["rating"],
        resenas=c["resenas"],
        dir=c["dir"],
        maps_q=c["maps"].replace(" ", "+"),
        tel=c["tel"],
        tel_txt=c["tel_txt"],
        foto=c["foto"],
        pos=c["pos"],
        hechos=hechos,
        platillos=platillos,
        **p,
    )
    target = BASE / slug
    target.mkdir(parents=True, exist_ok=True)
    (target / "index.html").write_text(html, encoding="utf-8")
    return target


if __name__ == "__main__":
    slugs = sys.argv[1:] or list(CONFIGS)
    for s in slugs:
        if s not in CONFIGS:
            print(f"sin config: {s}")
            continue
        print("ok", render(s, CONFIGS[s]))
