(function () {
  "use strict";

  /* ===================== CONFIGURACIÓN (editá solo esto) ===================== */
  var CFG = {
    destino: "https://www.academiavidavera.com/vidaveraletter",

    delaySeg: 3,           // segundos que espera antes de aparecer

    nuevaPestana: true,    // abre la landing en pestaña nueva, así no se pierde
                           // la pantalla con el detalle del pedido

    diasSinMostrar: 7,     // si lo cierran, no vuelve solo por X días

    botonFlotante: true,   // deja un botoncito abajo a la derecha para reabrirlo

    iconos: "emoji",       // "emoji" = los ✨ 🌱 💚 del diseño
                           // "marca" = los íconos olivos de Vida Vera en círculo

    utm: { utm_source: "tiendanube", utm_medium: "popup", utm_campaign: "post-compra" },

    broteUrl: "",          // si subís el brote a un hosting, pegá acá la URL
                           // y se usa esa en vez de la imagen embebida

    fuentes: "https://cdn.jsdelivr.net/gh/micaelabolibo/fuentes-tiendanube@main"
                           // dejalo en "" si no querés que cargue Akeila y Hauora
  };

  var T = {
    sello:  "¡Gracias por tu compra!",
    titulo: "¡Sumate gratis<br>al <i>VidaVeraLetter</i>!&nbsp;🌿",
    intro:  "Cada domingo envío un mail exclusivo a la comunidad con:",
    puntos: [
      { emoji: "✨", icono: "bookmark", titulo: "Resumen semanal",
        detalle: "Lo más importante de lo que compartimos en redes." },
      { emoji: "🌱", icono: "bag",      titulo: "Novedades y beneficios",
        detalle: "Enterate antes que nadie de lanzamientos y descuentos exclusivos." },
      { emoji: "💚", icono: "heart",    titulo: "Logros compartidos",
        detalle: "Historias de la comunidad que inspiran a seguir haciendo pequeños cambios." }
    ],
    boton:   "SUMARME",
    rechazo: "Ahora no, gracias",
    nota:    "Te lleva a la página donde dejás tu nombre y tu correo.<br>Podés darte de baja cuando quieras."
  };
  /* =================== FIN DE LA CONFIGURACIÓN =================== */


  if (window.__vvPopupVidaveraletter) { return; }   // evita que corra dos veces
  window.__vvPopupVidaveraletter = true;

  var CLAVE = "vv_popup_vidaveraletter";
  var ruta  = (location.pathname || "").toLowerCase();
  var qs    = (location.search || "").toLowerCase();
  var test  = qs.indexOf("vvpopup=1") > -1 || window.VV_POPUP_TEST === true;

  /* --- Seguro: nunca interrumpir el pago en sí --- */
  if (ruta.indexOf("/checkout") > -1 || ruta.indexOf("/comprar") > -1) {
    if (ruta.indexOf("/success") < 0 && ruta.indexOf("/gracias") < 0) { return; }
  }

  /* --- ¿Ya lo vio o ya se suscribió? --- */
  function leerEstado() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; }
  }
  function guardarEstado(dias, suscripto) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        hasta: Date.now() + dias * 86400000,
        suscripto: !!suscripto
      }));
    } catch (e) {}
  }
  var estado = leerEstado();
  if (estado.suscripto && !test) { return; }   // si ya se suscribió, no molestamos más
  var yaVisto = !test && !!(estado.hasta && Date.now() < estado.hasta);


  /* ============================ PALETA Y FUENTES ============================ */
  var C = {
    tinta: "#1e1c05", crema: "#fff9de", cremaSuave: "#f2ead0",
    oliva: "#94924e", olivaOsc: "#687155"
  };
  var SANS    = '"Hauora","Helvetica Neue",Arial,sans-serif';
  var DISPLAY = '"Akeila",Georgia,"Times New Roman",serif';
  var BROTE   = CFG.broteUrl || "";   // vacio = usa la hoja dibujada, liviana

  function caras() {
    var f = CFG.fuentes;
    if (!f) { return ""; }
    return ''
      + '@font-face{font-family:"Akeila";src:url(' + f + '/AKEILA.OTF) format("opentype");font-weight:400;font-display:swap}'
      + '@font-face{font-family:"Hauora";src:url(' + f + '/HAUORA-REGULAR.TTF) format("truetype");font-weight:400;font-display:swap}'
      + '@font-face{font-family:"Hauora";src:url(' + f + '/HAUORA-MEDIUM-2.TTF) format("truetype");font-weight:500;font-display:swap}'
      + '@font-face{font-family:"Hauora";src:url(' + f + '/HAUORA-BOLD.TTF) format("truetype");font-weight:700;font-display:swap}';
  }


  /* ============================ ÍCONOS ============================ */
  function svg(paths, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" '
      + 'aria-hidden="true">' + paths + '</svg>';
  }
  var ICON = {
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'
  };


  /* ============================ ESTILOS ============================ */
  var css = caras()
    + 'body.vvl-lock{overflow:hidden!important}'
    + '#vvl-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(30,28,5,.55);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;overflow:hidden;opacity:0;transition:opacity .24s cubic-bezier(.25,.1,.25,1)}'
    + '#vvl-overlay.vvl-in{opacity:1}'
    + '#vvl-overlay *{box-sizing:border-box}'
    + '#vvl-card{position:relative;width:100%;max-width:420px;flex-shrink:0;transform-origin:center;overflow:hidden;background:' + C.crema + ';border-radius:14px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(30,28,5,.25);font-family:' + SANS + ';color:' + C.tinta + ';text-align:left}'
    + '#vvl-head{position:relative;flex-shrink:0;overflow:hidden;color:' + C.crema + ';background:' + C.olivaOsc + ';padding:clamp(22px,6vw,28px) clamp(24px,6vw,32px) clamp(20px,5vw,24px)}'
    + '#vvl-sello{position:relative;z-index:1;display:inline-flex;align-items:center;margin:0 0 10px;padding:5px 10px;border-radius:6px;font-family:' + SANS + ';font-weight:700;font-size:11px;line-height:1.2;letter-spacing:.11em;text-transform:uppercase;color:' + C.crema + ';box-shadow:inset 0 0 0 1px rgba(255,249,222,.5)}'
    + '#vvl-title{position:relative;z-index:1;margin:0;max-width:288px;font-family:' + DISPLAY + ';font-weight:400;font-size:clamp(24px,6.5vw,29px);line-height:1.12;letter-spacing:.005em;color:' + C.crema + '}'
    + '#vvl-title .vvl-big{font-size:1.2em}'
    + '#vvl-brote{position:absolute;right:18px;top:4px;width:118px;height:auto;pointer-events:none;opacity:.35;filter:blur(1.5px)}'
    + '#vvl-hoja{position:absolute;right:8px;top:-14px;color:' + C.crema + ';opacity:.2;pointer-events:none}'
    + '#vvl-close{position:absolute;z-index:2;top:10px;right:10px;width:44px;height:44px;border:0;padding:0;background:transparent;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:' + C.crema + '}'
    + '#vvl-close:hover{background:rgba(255,249,222,.12)}'
    + '#vvl-close:focus-visible,#vvl-join:focus-visible,#vvl-no:focus-visible,#vvl-fab:focus-visible{outline:2px solid ' + C.crema + ';outline-offset:2px}'
    + '#vvl-body{flex-shrink:0;display:flex;flex-direction:column;gap:14px;padding:clamp(16px,4vw,20px) clamp(20px,6vw,32px) clamp(20px,5vw,26px)}'
    + '#vvl-intro{margin:0;font-size:15px;line-height:1.5}'
    + '#vvl-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}'
    + '#vvl-list li{display:grid;grid-template-columns:36px minmax(0,1fr);gap:14px;align-items:center;background:' + C.cremaSuave + ';border-radius:10px;padding:10px 14px;margin:0}'
    + '#vvl-list .vvl-ico{width:36px;height:36px;border-radius:50%;background:' + C.olivaOsc + ';color:' + C.crema + ';display:flex;align-items:center;justify-content:center}'
    + '#vvl-list .vvl-ico-emoji{background:transparent;font-size:21px;line-height:1}'
    + '#vvl-list .vvl-txt{display:flex;flex-direction:column;gap:2px}'
    + '#vvl-list strong{font-weight:700;font-size:15px;line-height:1.3}'
    + '#vvl-list .vvl-d{font-size:13px;line-height:1.45}'
    + '#vvl-list .vvl-acc{color:' + C.olivaOsc + ';font-weight:700}'
    + '#vvl-actions{display:flex;flex-direction:column;gap:0;margin-top:2px}'
    + '.vvl-btn{display:flex;align-items:center;justify-content:center;width:100%;font-family:' + SANS + ';font-weight:500;line-height:1.2;border-radius:6px;cursor:pointer;text-decoration:none;border:1px solid transparent;transition:background .15s cubic-bezier(.25,.1,.25,1),color .15s}'
    + '#vvl-join{height:52px;padding:0 32px;font-size:16px;letter-spacing:.06em;background:' + C.tinta + ';color:' + C.crema + '}'
    + '#vvl-join:hover{background:' + C.olivaOsc + ';color:' + C.crema + '}'
    + '#vvl-no{height:44px;padding:0 24px;font-size:15px;background:transparent;color:' + C.tinta + ';text-decoration-color:' + C.oliva + ';text-underline-offset:4px}'
    + '#vvl-no:hover{text-decoration:underline}'
    + '#vvl-note{margin:2px 0 0;text-align:center;font-size:12.5px;line-height:1.45;color:' + C.olivaOsc + '}'
    + '#vvl-fab{position:fixed;right:20px;bottom:20px;z-index:2147482999;display:flex;align-items:center;gap:10px;height:52px;padding:0 20px 0 16px;border:0;border-radius:999px;background:' + C.olivaOsc + ';color:' + C.crema + ';font-family:' + SANS + ';font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 10px 28px rgba(30,28,5,.28);transition:transform .15s,box-shadow .15s}'
    + '#vvl-fab:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(30,28,5,.32)}'
    + '@media (max-width:480px){#vvl-fab{right:14px;bottom:14px;height:48px;font-size:14px}}';


  /* ============================ MARCADO ============================ */
  function puntos() {
    var out = "", i, p, ico;
    for (i = 0; i < T.puntos.length; i++) {
      p = T.puntos[i];
      if (CFG.iconos === "emoji" && p.emoji) {
        ico = '<span class="vvl-ico vvl-ico-emoji" aria-hidden="true">' + p.emoji + '</span>';
      } else {
        ico = '<span class="vvl-ico">' + svg(ICON[p.icono] || ICON.heart, 18) + '</span>';
      }
      out += '<li>' + ico
          +  '<span class="vvl-txt"><strong>' + p.titulo + '</strong>'
          +  '<span class="vvl-d">' + p.detalle + '</span></span></li>';
    }
    return out;
  }

  /* El adorno del encabezado: si cargaste una imagen en broteUrl usa esa;
     si no, dibuja una hoja liviana (no engorda el código). */
  function hoja() {
    if (BROTE) { return '<img id="vvl-brote" src="' + BROTE + '" alt="" aria-hidden="true">'; }
    return '<svg id="vvl-hoja" width="140" height="140" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20"/>'
      + '<path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13"/></svg>';
  }

  var html = ''
    + '<div id="vvl-card" role="dialog" aria-modal="true" aria-labelledby="vvl-title">'
    +   '<div id="vvl-head">'
    +     '<button id="vvl-close" type="button" aria-label="Cerrar">' + svg(ICON.x, 22) + '</button>'
    +     '<span id="vvl-sello">' + T.sello + '</span>'
    +     '<h2 id="vvl-title">' + T.titulo + '</h2>'
    +     hoja()
    +   '</div>'
    +   '<div id="vvl-body">'
    +     '<p id="vvl-intro">' + T.intro + '</p>'
    +     '<ul id="vvl-list">' + puntos() + '</ul>'
    +     '<div id="vvl-actions">'
    +       '<a id="vvl-join" class="vvl-btn" href="#">' + T.boton + '</a>'
    +       '<button id="vvl-no" class="vvl-btn" type="button">' + T.rechazo + '</button>'
    +       '<p id="vvl-note">' + T.nota + '</p>'
    +     '</div>'
    +   '</div>'
    + '</div>';


  /* ============================ LÓGICA ============================ */
  var overlay, card, fab, foco;

  function armarURL() {
    var base = CFG.destino, partes = [], k;
    for (k in CFG.utm) {
      if (Object.prototype.hasOwnProperty.call(CFG.utm, k)) {
        partes.push(encodeURIComponent(k) + "=" + encodeURIComponent(CFG.utm[k]));
      }
    }
    return base + (base.indexOf("?") > -1 ? "&" : "?") + partes.join("&");
  }

  function ajustar() {
    if (!card) { return; }
    card.style.transform = "none";
    var s = Math.min(1, (window.innerHeight - 32) / card.offsetHeight);
    card.style.transform = s < 1 ? "scale(" + s + ")" : "none";
  }

  function tecla(e) {
    if (e.key === "Escape" || e.keyCode === 27) { cerrar(); return; }
    if (e.key === "Tab" && card) {
      var f = card.querySelectorAll("button,a[href]");
      if (!f.length) { return; }
      var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    }
  }

  function abrir() {
    if (overlay) { return; }
    foco = document.activeElement;
    if (fab) { fab.style.display = "none"; }

    overlay = document.createElement("div");
    overlay.id = "vvl-overlay";
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    document.body.classList.add("vvl-lock");
    card = overlay.querySelector("#vvl-card");

    var join = overlay.querySelector("#vvl-join");
    join.setAttribute("href", armarURL());
    if (CFG.nuevaPestana) {
      join.setAttribute("target", "_blank");
      join.setAttribute("rel", "noopener");
    }
    join.addEventListener("click", function () { guardarEstado(365, true); });

    overlay.addEventListener("click", function (e) { if (e.target === overlay) { cerrar(); } });
    overlay.querySelector("#vvl-close").addEventListener("click", cerrar);
    overlay.querySelector("#vvl-no").addEventListener("click", cerrar);
    document.addEventListener("keydown", tecla, true);
    window.addEventListener("resize", ajustar);

    ajustar();
    setTimeout(ajustar, 300);
    void overlay.offsetWidth;
    overlay.classList.add("vvl-in");
    overlay.querySelector("#vvl-close").focus();
  }

  function cerrar() {
    if (!overlay) { return; }
    guardarEstado(CFG.diasSinMostrar, false);
    document.removeEventListener("keydown", tecla, true);
    window.removeEventListener("resize", ajustar);
    document.body.classList.remove("vvl-lock");
    overlay.classList.remove("vvl-in");
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
      fab.id = "vvl-fab";
      fab.type = "button";
      fab.setAttribute("aria-label", "Abrir VidaVeraLetter");
      fab.innerHTML = svg(ICON.mail, 20) + "<span>VidaVeraLetter</span>";
      fab.addEventListener("click", abrir);
      document.body.appendChild(fab);
    }
    fab.style.display = "flex";
  }


  /* ============================ ARRANQUE ============================ */
  function arrancar() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    if (test) { abrir(); return; }
    if (yaVisto) { mostrarFab(); return; }
    setTimeout(abrir, CFG.delaySeg * 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
