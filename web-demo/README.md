# QOLQA Demos Privadas

Motor de demos privadas para QOLQA Residential, QOLQA Travel y la pantalla de kiosco. El Home público de QOLQA se mantiene fuera de esta app y no se reemplaza.

## Desarrollo local

Desde la raíz del monorepo QOLQA:

```bash
cd web-demo
npm install
npm run dev
```

Vite mostrará la URL local disponible, normalmente `http://localhost:5173`.

Rutas de demo:

- `/residential`
- `/travel`
- `/kiosk`

## Build y vista previa

```bash
npm run build
npm run preview
```

La salida de la app queda en `dist/`.

Para preparar el output combinado que usa Vercel desde la raíz del repo:

```bash
npm --prefix web-demo run build
node web-demo/scripts/prepare-vercel-output.mjs
```

Ese paso copia el Home original y agrega `/residential`, `/travel` y `/kiosk` en `web-demo/site-dist/`.

## Deploy en Vercel

Configuración recomendada al importar el repositorio raíz:

- Framework Preset: `Other`
- Root Directory: `.`
- Install Command: `npm --prefix web-demo ci`
- Build Command: `npm --prefix web-demo run build && node web-demo/scripts/prepare-vercel-output.mjs`
- Output Directory: `web-demo/site-dist`

El `vercel.json` raíz mantiene `/` como Home original y solo reescribe `/residential`, `/travel` y `/kiosk` hacia sus pantallas de demo.
