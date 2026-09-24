(function () {
  'use strict';

  // ---- Configuración -------------------------------------------------------
  var WA_NUMBER = '526621480043';
  // 'rojo' (color de marca) o 'verde' (verde oficial de WhatsApp)
  var WHATSAPP_COLOR = 'rojo';
  // Mostrar bancos y enganche mínimo en Financiamiento (cuando el negocio lo confirme)
  var SHOW_BANKS = false;

  // Inventario. Las fotos viven en assets/inventario/auto-<id>/01.jpg … <n>.jpg
  var INVENTORY = [
    { id: 1, name: 'Honda HR-V', year: 2022, km: 77000, price: 299000, type: 'suv', credit: true, n: 13, trans: 'Estándar 6 vel.', extra: [['Color', 'Blanco perla']], desc: 'Un solo dueño con factura original, 77,000 kilómetros, cámara de reversa, manos libres bluetooth, llantas nuevas, blanco perla, ¡impecable!' },
    { id: 2, name: 'Toyota Highlander XLE', year: 2015, km: 148000, price: 249000, type: 'suv', credit: false, n: 14, trans: 'Automática', extra: [['Motor', 'V6 3.5 L']], desc: 'Factura agencia Toyota, 148,000 kilómetros, V6 3.5 L, vestiduras en piel, cámara de reversa, puerta trasera eléctrica, quemacocos, llantas nuevas 100%, ¡impecable!' },
    { id: 3, name: 'Toyota Camry XLE', year: 2021, km: 83000, price: 379000, type: 'sedan', credit: true, n: 15, trans: 'Automática', extra: [['Motor', '4 cilindros'], ['Color', 'Blanco perla']], desc: 'Un solo dueño con factura original, blanco perla, 4 cilindros, 83,000 kilómetros, vestiduras en piel con ventilación o calefacción, cámara de reversa, pantalla touch con manos libres Bluetooth, sonido JBL original (versión más equipada), llantas 90% de vida, ¡enterito!' },
    { id: 4, name: 'Honda CR-V Turbo Plus', year: 2023, km: 80000, price: 519000, type: 'suv', credit: true, n: 15, trans: 'Automática', extra: [['Motor', 'Turbo'], ['Color', 'Gris Oxford perla']], desc: 'Línea nueva, un solo dueño con factura original, 80,000 kilómetros y garantía extendida al 2027, vestiduras en piel, quemacocos, CarPlay y Android Auto, puerta trasera eléctrica, cargador de celular inalámbrico, cámara de reversa y lateral derecha; llantas 80% de vida, color gris Oxford perla, ¡impecable!' },
    { id: 5, name: 'Toyota Sienna LE', year: 2019, km: 130000, price: 309000, type: 'minivan', credit: true, n: 14, trans: 'Automática', extra: [['Pasajeros', '8']], desc: 'Un solo dueño con factura original, 8 pasajeros con cinturón, vestiduras en tela, 130,000 kilómetros, cámara de reversa, llantas Hankook 80% de vida, ¡impecable!' }
  ];

  var TYPE_LABELS = { sedan: 'Sedán', suv: 'SUV', minivan: 'Minivan' };
  var TYPE_FILTERS = [['todos', 'Todos'], ['sedan', 'Sedán'], ['suv', 'SUV'], ['minivan', 'Minivan']];
  var PRICE_FILTERS = [['todos', 'Cualquier precio'], ['a', 'Hasta $300 mil'], ['b', '$300 – $400 mil'], ['c', 'Más de $400 mil']];
  var PRICE_FNS = {
    todos: function () { return true; },
    a: function (v) { return v <= 300000; },
    b: function (v) { return v > 300000 && v <= 400000; },
    c: function (v) { return v > 400000; }
  };

  var SERVICES = [
    { icon: 'directions_car', title: 'Compra', text: 'Elige tu próximo auto entre seminuevos revisados.', cta: 'Ver inventario', href: '#inventario' },
    { icon: 'account_balance', title: 'Financiamiento bancario', text: 'Estrena tu seminuevo a pagos.', cta: 'Solicita tu crédito', href: '#financiamiento' },
    { icon: 'sell', title: 'Venta', text: 'Te compramos tu auto.', cta: 'Cotiza tu auto', href: '#vende' },
    { icon: 'handshake', title: 'Consignación', text: 'Lo vendemos por ti.', cta: 'Cómo funciona', href: '#consignacion' }
  ];
  var FIN_STEPS = [
    { n: '01', title: 'Elige tu auto', text: 'Ven al lote o escoge desde el inventario.' },
    { n: '02', title: 'Solicita tu crédito', text: 'Te ayudamos con los papeles y la solicitud al banco.' },
    { n: '03', title: 'Llévatelo', text: 'Con tu crédito aprobado, sales manejando.' }
  ];
  var CONS_STEPS = [
    { n: 1, icon: 'garage', title: 'Trae tu auto', text: 'Pásate al lote con tu auto y sus papeles.' },
    { n: 2, icon: 'price_check', title: 'Lo valuamos', text: 'Te damos un precio justo de mercado.' },
    { n: 3, icon: 'campaign', title: 'Lo exhibimos y promocionamos', text: 'En el lote y en nuestras redes.' },
    { n: 4, icon: 'payments', title: 'Recibes tu pago', text: 'Cuando se vende, te pagamos.' }
  ];

  // ---- Utilidades ----------------------------------------------------------
  function $(id) { return document.getElementById(id); }
  function wa(msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg); }
  function money(n) { return '$' + n.toLocaleString('es-MX'); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function photos(car) {
    var list = [];
    for (var i = 1; i <= car.n; i++) list.push('assets/inventario/auto-' + car.id + '/' + (i < 10 ? '0' : '') + i + '.jpg');
    return list;
  }
  function carWa(car) {
    return wa('Hola, me interesa el ' + car.name + ' ' + car.year + ' (' + money(car.price) + ') que vi en su página. ¿Sigue disponible?');
  }

  // ---- Color de WhatsApp y enlaces prellenados ------------------------------
  if (WHATSAPP_COLOR === 'verde') document.documentElement.style.setProperty('--wa-bg', '#25D366');
  Array.prototype.forEach.call(document.querySelectorAll('[data-wa]'), function (a) {
    a.href = wa(a.getAttribute('data-wa'));
  });
  $('banks').hidden = !SHOW_BANKS;

  // ---- Menú móvil ----------------------------------------------------------
  var menuBtn = $('menuBtn'), mobileNav = $('mobileNav');
  function setMenu(open) {
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.icon').textContent = open ? 'close' : 'menu';
  }
  menuBtn.addEventListener('click', function () { setMenu(mobileNav.hidden); });
  mobileNav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  window.matchMedia('(min-width: 980px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  // ---- Líneas animadas del hero --------------------------------------------
  $('heroLines').innerHTML = [70, 45, 90, 30, 60].map(function (w, i) {
    return '<i style="width:' + w + '%;height:' + (i % 2 ? 3 : 5) + 'px;opacity:' + (1 - i * 0.12) +
      ';animation:vadoSlide .9s cubic-bezier(.2,.8,.2,1) ' + (i * 0.08) + 's both, vadoRun ' + (3 + i * 0.4) + 's ease-in-out ' + (1 + i * 0.1) + 's infinite"></i>';
  }).join('');

  // ---- Secciones estáticas renderizadas desde datos ------------------------
  $('services').innerHTML = SERVICES.map(function (s) {
    return '<div class="service">' +
      '<div class="service-top"><div class="service-icon"><span class="icon" aria-hidden="true">' + s.icon + '</span></div>' +
      '<div class="service-lines" aria-hidden="true"><i></i><i></i></div></div>' +
      '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
      '<a class="link-arrow" href="' + s.href + '">' + esc(s.cta) + ' <span class="icon" aria-hidden="true">arrow_forward</span></a></div>';
  }).join('');

  $('finSteps').innerHTML = FIN_STEPS.map(function (st) {
    return '<div class="fin-step"><div class="fin-step-top"><span class="fin-step-n">' + st.n + '</span>' +
      '<div class="fin-step-lines" aria-hidden="true"><i></i><i></i></div></div>' +
      '<h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p></div>';
  }).join('');

  $('consSteps').innerHTML = CONS_STEPS.map(function (st) {
    return '<div class="cons-step"><div class="cons-step-top"><span class="icon" aria-hidden="true">' + st.icon + '</span>' +
      '<span>PASO ' + st.n + '</span></div><h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p></div>';
  }).join('');

  // ---- Inventario y filtros ------------------------------------------------
  var filter = { type: 'todos', price: 'todos' };

  function renderChips(el, options, key, cls) {
    el.innerHTML = options.map(function (o) {
      return '<button type="button" class="chip' + (cls ? ' ' + cls : '') + '" data-key="' + o[0] + '" aria-pressed="' + (filter[key] === o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('');
  }
  function bindChips(el, options, key, cls) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      filter[key] = b.getAttribute('data-key');
      renderChips(el, options, key, cls);
      renderCars();
    });
    renderChips(el, options, key, cls);
  }

  function renderCars() {
    var cars = INVENTORY.filter(function (c) {
      return (filter.type === 'todos' || c.type === filter.type) && PRICE_FNS[filter.price](c.price);
    });
    $('cars').innerHTML = cars.map(function (c) {
      var label = esc(c.name + ' ' + c.year);
      return '<article class="car">' +
        '<button type="button" class="car-photo" data-open="' + c.id + '" aria-label="Ver fotos de ' + label + '">' +
          '<img src="' + photos(c)[0] + '" alt="' + label + '" loading="lazy">' +
          '<span class="car-count"><span class="icon" aria-hidden="true">photo_library</span>' + c.n + ' fotos</span>' +
          (c.credit ? '<span class="badge-credit">Crédito disponible</span>' : '') +
        '</button>' +
        '<div class="car-body">' +
          '<div class="car-meta">' + TYPE_LABELS[c.type] + ' · ' + c.year + '</div>' +
          '<h3 class="car-name" data-open="' + c.id + '">' + esc(c.name) + '</h3>' +
          '<div class="car-specs">' +
            '<span><span class="icon" aria-hidden="true">speed</span>' + c.km.toLocaleString('es-MX') + ' km</span>' +
            '<span><span class="icon" aria-hidden="true">settings</span>' + esc(c.trans) + '</span>' +
          '</div>' +
          '<button type="button" class="car-more" data-open="' + c.id + '">Ver fotos y detalles <span class="icon" aria-hidden="true">arrow_forward</span></button>' +
          '<div class="car-foot"><span class="car-price">' + money(c.price) + '</span>' +
          '<a class="car-cta" href="' + carWa(c) + '" target="_blank" rel="noopener">Me interesa</a></div>' +
        '</div></article>';
    }).join('');
    $('noCars').hidden = cars.length > 0;
  }

  bindChips($('typeChips'), TYPE_FILTERS, 'type');
  bindChips($('priceChips'), PRICE_FILTERS, 'price', 'chip-sm');
  renderCars();

  $('cars').addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]');
    if (t) openCar(Number(t.getAttribute('data-open')), t);
  });

  // ---- Detalle con galería -------------------------------------------------
  var modal = $('carModal'), current = null, idx = 0, lastFocus = null;

  function showPhoto(i) {
    var ph = photos(current);
    idx = ((i % ph.length) + ph.length) % ph.length;
    $('galleryImg').src = ph[idx];
    $('galleryImg').alt = current.name + ' ' + current.year + ', foto ' + (idx + 1);
    $('galleryCounter').textContent = (idx + 1) + ' / ' + ph.length;
    Array.prototype.forEach.call($('thumbs').children, function (img, j) {
      img.classList.toggle('active', j === idx);
      if (j === idx && img.scrollIntoView) img.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  function openCar(id, trigger) {
    current = INVENTORY.filter(function (c) { return c.id === id; })[0];
    if (!current) return;
    lastFocus = trigger || document.activeElement;
    var c = current;
    $('carMeta').textContent = TYPE_LABELS[c.type] + ' · ' + c.year;
    $('carTitle').textContent = c.name;
    $('carPrice').textContent = money(c.price);
    $('carDesc').textContent = c.desc;
    $('carWa').href = carWa(c);
    var specs = [['Año', String(c.year)], ['Kilometraje', c.km.toLocaleString('es-MX') + ' km'], ['Transmisión', c.trans]]
      .concat(c.extra, [['Financiamiento', c.credit ? 'Sí, bancario' : 'Consultar']]);
    $('carSpecs').innerHTML = specs.map(function (s) {
      return '<div><span>' + esc(s[0]) + '</span><span>' + esc(s[1]) + '</span></div>';
    }).join('');
    $('thumbs').innerHTML = photos(c).map(function (src, j) {
      return '<img src="' + src + '" alt="Foto ' + (j + 1) + '" data-i="' + j + '" loading="lazy">';
    }).join('');
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-panel').scrollTop = 0;
    showPhoto(0);
    $('modalClose').focus();
  }

  function closeCar() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    current = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.addEventListener('click', function (e) { if (e.target === modal) closeCar(); });
  $('modalClose').addEventListener('click', closeCar);
  $('galleryPrev').addEventListener('click', function () { showPhoto(idx - 1); });
  $('galleryNext').addEventListener('click', function () { showPhoto(idx + 1); });
  $('thumbs').addEventListener('click', function (e) {
    var i = e.target.getAttribute('data-i');
    if (i !== null) showPhoto(Number(i));
  });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeCar();
    else if (e.key === 'ArrowLeft') showPhoto(idx - 1);
    else if (e.key === 'ArrowRight') showPhoto(idx + 1);
  });

  // Deslizar para cambiar de foto en celular
  var touchX = null;
  $('galleryImg').addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  $('galleryImg').addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) showPhoto(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // ---- Vende tu auto -------------------------------------------------------
  var form = $('sellForm'), done = $('sellDone');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var fotos = f.getAll('fotos').filter(function (x) { return x && x.size; }).length;
    var msg = 'Hola, quiero vender mi auto.\nNombre: ' + f.get('nombre') + '\nTeléfono: ' + f.get('telefono') +
      '\nAuto: ' + f.get('marca') + ' ' + f.get('modelo') + ' ' + f.get('anio') +
      (fotos ? '\nTengo ' + fotos + ' foto(s) para enviar.' : '');
    window.open(wa(msg), '_blank');
    form.hidden = true;
    done.hidden = false;
  });
  $('sellReset').addEventListener('click', function () {
    form.reset();
    done.hidden = true;
    form.hidden = false;
  });
})();
