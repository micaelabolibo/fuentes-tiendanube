(function () {
  "use strict";

  /* ===================== CONFIGURACIÓN (editá solo esto) ===================== */
  var CFG = {
    scrollPx: 300,            // cuánto tiene que bajar la persona para que aparezca
    retrasoSinScrollSeg: 10,  // si la página no se puede bajar, aparece a los 10 segundos
    esperaTrasScrollSeg: 5,   // pausa después de bajar, para no pisar el pop-up de descuento nativo de Tiendanube
    hasta: "2026-11-30",      // se muestra hasta este día inclusive; después no hace nada
    ctaUrl: "/productos/",    // a dónde lleva el botón principal. Si lo dejás en "", solo cierra
    botonFlotante: true,      // botoncito abajo a la izquierda para volver a abrir el aviso
    fuentes: "https://cdn.jsdelivr.net/gh/micaelabolibo/fuentes-tiendanube@main"
  };

  var T = {
    sello:  "AVISO IMPORTANTE",
    titulo: "Nos tomamos una<br>semanita de&nbsp;descanso&nbsp;🌿",
    intro:  "Del lunes 23/11 al viernes 27/11 inclusive no habrá envíos ni retiros por el local de Villa Crespo.",
    puntos: [
      { emoji: "📍", texto: "Si estás cerca del local, podés pasar a buscar tus productos hasta este viernes 20/11." },
      { emoji: "🛵", texto: "Si estás en CABA, podés hacer tu pedido y recibirlo por motomensajería antes de la pausa, coordinando la entrega." }
    ],
    nota:   "La tienda online sigue abierta normalmente. Retomamos envíos y retiros el lunes 30/11.",
    boton:  "HACER MI PEDIDO EN LA TIENDA",
    cerrar: "Entendido",
    fab:    "Aviso de vacaciones"
  };
  /* =================== FIN DE LA CONFIGURACIÓN =================== */


  if (window.__vvPopupVacaciones) { return; }   // evita que corra dos veces
  window.__vvPopupVacaciones = true;

  var CLAVE = "vv_vacaciones_visto";
  var ruta  = (location.pathname || "").toLowerCase();
  var test  = (location.search || "").toLowerCase().indexOf("vvpopup=1") > -1 || window.VV_POPUP_TEST === true;

  /* Nunca tapar el pago */
  if (!test && (ruta.indexOf("/checkout") > -1 || ruta.indexOf("/comprar") > -1)) { return; }

  /* Venció el aviso: no hace nada */
  function vigente() {
    var p = CFG.hasta.split("-");
    return new Date() <= new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59);
  }
  if (!test && !vigente()) { return; }

  /* Ya se mostró en esta sesión de navegación */
  function yaVisto() {
    try { return sessionStorage.getItem(CLAVE) === "1"; } catch (e) { return false; }
  }
  function marcarVisto() {
    try { sessionStorage.setItem(CLAVE, "1"); } catch (e) {}
  }
  var visto = !test && yaVisto();


  /* ============================ PALETA Y FUENTES ============================ */
  var C = {
    tinta: "#1e1c05", crema: "#fff9de", cremaSuave: "#f2ead0",
    oliva: "#94924e", olivaOsc: "#687155"
  };
  var SANS    = '"Hauora","Helvetica Neue",Arial,sans-serif';
  var DISPLAY = '"Akeila",Georgia,"Times New Roman",serif';

  function caras() {
    var f = CFG.fuentes;
    if (!f) { return ""; }
    return ''
      + '@font-face{font-family:"Akeila";src:url(' + f + '/AKEILA.OTF) format("opentype");font-weight:400;font-display:swap}'
      + '@font-face{font-family:"Hauora";src:url(' + f + '/HAUORA-REGULAR.TTF) format("truetype");font-weight:400;font-display:swap}'
      + '@font-face{font-family:"Hauora";src:url(' + f + '/HAUORA-MEDIUM-2.TTF) format("truetype");font-weight:500;font-display:swap}'
      + '@font-face{font-family:"Hauora";src:url(' + f + '/HAUORA-BOLD.TTF) format("truetype");font-weight:700;font-display:swap}';
  }


  /* ============================ ESTILOS ============================ */
  var css = caras()
    + 'body.vvc-lock{overflow:hidden!important}'
    + '#vvc-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(30,28,5,.55);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;opacity:0;transition:opacity .24s cubic-bezier(.25,.1,.25,1)}'
    + '#vvc-overlay.vvc-in{opacity:1}'
    + '#vvc-overlay *{box-sizing:border-box}'
    + '#vvc-card{position:relative;width:100%;max-width:420px;max-height:calc(100vh - 32px);overflow-y:auto;background:' + C.crema + ';border-radius:14px;box-shadow:0 24px 60px rgba(30,28,5,.25);font-family:' + SANS + ';color:' + C.tinta + ';text-align:left}'
    + '#vvc-head{position:relative;overflow:hidden;background:' + C.olivaOsc + ';color:' + C.crema + ';padding:clamp(22px,6vw,28px) clamp(24px,6vw,32px) clamp(20px,5vw,24px)}'
    + '#vvc-sello{position:relative;z-index:1;display:inline-flex;margin:0 0 10px;padding:5px 10px;border-radius:6px;font-family:' + SANS + ';font-weight:700;font-size:11px;line-height:1.2;letter-spacing:.11em;text-transform:uppercase;box-shadow:inset 0 0 0 1px rgba(255,249,222,.5)}'
    + '#vvc-title{position:relative;z-index:1;margin:0;max-width:340px;font-family:' + DISPLAY + ';font-weight:400;font-size:clamp(24px,6.5vw,29px);line-height:1.12;letter-spacing:.005em}'
    + '#vvc-hoja{position:absolute;right:8px;top:-14px;color:' + C.crema + ';opacity:.2;pointer-events:none}'
    + '#vvc-close{position:absolute;z-index:2;top:10px;right:10px;width:44px;height:44px;border:0;padding:0;background:transparent;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:' + C.crema + '}'
    + '#vvc-close:hover{background:rgba(255,249,222,.12)}'
    + '#vvc-close:focus-visible{outline:2px solid ' + C.crema + ';outline-offset:2px}'
    + '#vvc-body{display:flex;flex-direction:column;gap:14px;padding:clamp(16px,4vw,20px) clamp(20px,6vw,32px) clamp(20px,5vw,26px)}'
    + '#vvc-intro{margin:0;font-size:15px;line-height:1.5}'
    + '#vvc-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}'
    + '#vvc-list li{display:grid;grid-template-columns:32px minmax(0,1fr);gap:12px;align-items:center;background:' + C.cremaSuave + ';border-radius:10px;padding:10px 14px;margin:0;font-size:14px;line-height:1.45}'
    + '.vvc-em{font-size:22px;line-height:1;text-align:center}'
    + '#vvc-nota{margin:0;font-size:13.5px;line-height:1.45;color:' + C.olivaOsc + '}'
    + '.vvc-btn{display:flex;align-items:center;justify-content:center;width:100%;font-family:' + SANS + ';font-weight:500;line-height:1.2;border-radius:6px;cursor:pointer;text-decoration:none;border:1px solid transparent;transition:background .15s,color .15s}'
    + '#vvc-acciones{display:flex;flex-direction:column;gap:8px;margin-top:2px}'
    + '#vvc-cta{height:52px;padding:0 32px;font-size:16px;letter-spacing:.06em;background:' + C.tinta + ';color:' + C.crema + '}'
    + '#vvc-cta:hover{background:' + C.olivaOsc + ';color:' + C.crema + '}'
    + '#vvc-ok{height:44px;padding:0 24px;font-size:15px;background:transparent;color:' + C.tinta + ';border-color:' + C.tinta + '}'
    + '#vvc-ok:hover{background:' + C.cremaSuave + '}'
    + '#vvc-cta:focus-visible,#vvc-ok:focus-visible,#vvc-fab:focus-visible{outline:2px solid ' + C.olivaOsc + ';outline-offset:2px}'
    + '#vvc-fab{position:fixed;left:20px;bottom:20px;z-index:2147482999;height:48px;padding:0 18px;border:0;border-radius:999px;background:' + C.olivaOsc + ';color:' + C.crema + ';font-family:' + SANS + ';font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 10px 28px rgba(30,28,5,.28)}'
    + '#vvc-fab:hover{background:' + C.tinta + '}'
    + '@media (max-width:480px){#vvc-fab{left:14px;bottom:14px;height:44px;font-size:13px}}';


  /* ============================ MARCADO ============================ */
  var X_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  /* Hoja decorativa del encabezado (la misma del pop-up de VidaVeraLetter) */
  function hoja() {
    return '<svg id="vvc-hoja" width="140" height="140" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20"/>'
      + '<path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13"/></svg>';
  }

  function puntos() {
    var out = "", i;
    for (i = 0; i < T.puntos.length; i++) {
      out += '<li><span class="vvc-em" aria-hidden="true">' + T.puntos[i].emoji + '</span>'
          +  '<span>' + T.puntos[i].texto + '</span></li>';
    }
    return out;
  }

  var html = ''
    + '<div id="vvc-card" role="dialog" aria-modal="true" aria-labelledby="vvc-title">'
    +   '<div id="vvc-head">'
    +     '<button id="vvc-close" type="button" aria-label="Cerrar">' + X_ICON + '</button>'
    +     '<span id="vvc-sello">' + T.sello + '</span>'
    +     '<h2 id="vvc-title">' + T.titulo + '</h2>'
    +     hoja()
    +   '</div>'
    +   '<div id="vvc-body">'
    +     '<p id="vvc-intro">' + T.intro + '</p>'
    +     '<ul id="vvc-list">' + puntos() + '</ul>'
    +     '<p id="vvc-nota">' + T.nota + '</p>'
    +     '<div id="vvc-acciones">'
    +       '<a id="vvc-cta" class="vvc-btn" href="#">' + T.boton + '</a>'
    +       '<button id="vvc-ok" class="vvc-btn" type="button">' + T.cerrar + '</button>'
    +     '</div>'
    +   '</div>'
    + '</div>';


  /* ============================ LÓGICA ============================ */
  var overlay = null, card = null, fab = null, foco = null, pendiente = false;

  function tecla(e) {
    if (e.key === "Escape" || e.keyCode === 27) { cerrar(); return; }
    if ((e.key === "Tab" || e.keyCode === 9) && card) {
      var f = card.querySelectorAll("button,a[href]");
      if (!f.length) { return; }
      var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    }
  }

  function abrir() {
    if (overlay) { return; }
    pendiente = false;
    foco = document.activeElement;
    if (!test) { marcarVisto(); }
    if (fab) { fab.style.display = "none"; }

    overlay = document.createElement("div");
    overlay.id = "vvc-overlay";
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    document.body.classList.add("vvc-lock");
    card = overlay.querySelector("#vvc-card");

    var cta = overlay.querySelector("#vvc-cta");
    if (CFG.ctaUrl) {
      cta.setAttribute("href", CFG.ctaUrl);
    } else {
      cta.addEventListener("click", function (e) { e.preventDefault(); cerrar(); });
    }

    overlay.addEventListener("click", function (e) { if (e.target === overlay) { cerrar(); } });
    overlay.querySelector("#vvc-close").addEventListener("click", cerrar);
    overlay.querySelector("#vvc-ok").addEventListener("click", cerrar);
    document.addEventListener("keydown", tecla, true);

    void overlay.offsetWidth;
    overlay.classList.add("vvc-in");
    overlay.querySelector("#vvc-close").focus();
  }

  function cerrar() {
    if (!overlay) { return; }
    document.removeEventListener("keydown", tecla, true);
    document.body.classList.remove("vvc-lock");
    overlay.classList.remove("vvc-in");
    var viejo = overlay;
    overlay = card = null;
    setTimeout(function () {
      if (viejo.parentNode) { viejo.parentNode.removeChild(viejo); }
      if (foco && foco.focus) { try { foco.focus(); } catch (e) {} }
    }, 260);
    mostrarFab();
  }

  function mostrarFab() {
    if (!CFG.botonFlotante) { return; }
    if (!fab) {
      fab = document.createElement("button");
      fab.id = "vvc-fab";
      fab.type = "button";
      fab.setAttribute("aria-label", T.fab);
      fab.textContent = "🌿 " + T.fab;
      fab.addEventListener("click", abrir);
      document.body.appendChild(fab);
    }
    fab.style.display = "block";
  }


  /* ============================ CUÁNDO APARECE ============================ */
  function programar(ms) {
    if (pendiente || overlay) { return; }
    pendiente = true;
    setTimeout(abrir, ms);
  }

  function alBajar() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y < CFG.scrollPx) { return; }
    window.removeEventListener("scroll", alBajar);
    programar(CFG.esperaTrasScrollSeg * 1000);
  }

  function paginaBajable() {
    return document.documentElement.scrollHeight > window.innerHeight + CFG.scrollPx;
  }


  /* ============================ ARRANQUE ============================ */
  function arrancar() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    if (test) { abrir(); return; }
    if (visto) { mostrarFab(); return; }

    if (paginaBajable()) {
      window.addEventListener("scroll", alBajar);
      alBajar();
    } else {
      programar(CFG.retrasoSinScrollSeg * 1000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
