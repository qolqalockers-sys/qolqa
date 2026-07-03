# QOLQA Web Comercial

Sitio público para presentar QOLQA Residential y QOLQA Travel a clientes potenciales. Está construido como una app React + Vite + TypeScript, aislada del resto del monorepo y lista para publicar en Vercel.

## Desarrollo local

Desde la raíz del monorepo QOLQA:

```bash
cd web-demo
npm install
npm run dev
```

Vite levantará el sitio en `http://localhost:5174`.

## Build y vista previa

```bash
npm run build
npm run preview
```

La salida de producción queda en `dist/`.

## Deploy en Vercel

Configuración recomendada al importar el repositorio:

- Framework Preset: `Vite`
- Root Directory: `web-demo`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Si el repositorio importado en Vercel contiene el monorepo dentro de una carpeta superior, usar `qolqa/web-demo` como Root Directory.

El archivo `vercel.json` incluye una reescritura hacia `index.html` para que las rutas `/residential` y `/travel` funcionen al abrirlas directamente.
