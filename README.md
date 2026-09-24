# Autos del Vado Hermosillo — Landing page

Sitio estático (HTML + CSS + JS, sin dependencias ni build). Pensado primero para celular.

## Ver en local
```
python3 -m http.server 8000
```
y abre http://localhost:8000

## Publicar
Sube el contenido de esta carpeta a cualquier hosting estático (GitHub Pages, Netlify, Vercel).
En GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## Editar contenido
Todo lo editable está al inicio de `app.js`:
- `INVENTORY`: autos (nombre, año, km, precio, tipo, crédito, número de fotos, descripción).
  Las fotos van en `assets/inventario/auto-<id>/01.jpg`, `02.jpg`, …
- `WHATSAPP_COLOR`: `'rojo'` (marca) o `'verde'` (WhatsApp oficial).
- `SHOW_BANKS`: muestra el bloque de bancos y enganche mínimo en Financiamiento
  (los logos y el enganche están en `index.html`, marcados como "por confirmar").

El formulario "Vende tu auto" no guarda datos: abre WhatsApp con la información prellenada.
