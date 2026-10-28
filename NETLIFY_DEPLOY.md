# Netlify website and clinic API

The Netlify `dist` folder contains the static website only. The Express API and its persistent database run as a separate Render service.

## Render backend settings

- **Build Command:** `npm ci --omit=dev`
- **Start Command:** `npm start`
- **SITE_ORIGIN:** `https://srisarashwathidentals.netlify.app` (no trailing slash)
- **ADMIN_PASSWORD:** set a strong private password before the first start
- **SESSION_SECRET:** generate this in Render; the Blueprint creates one automatically

Do not run `npm run build` on the Render API service. It is the Vite/TypeScript frontend build and needs development packages. Netlify builds the frontend separately.

The Blueprint creates a persistent disk for SQLite. The initial admin email is `admin@srisaraswathidental.com`; its password is the value set in `ADMIN_PASSWORD`.

After the Render service is live, check `<Render service URL>/api/health`; it should return `{ "ok": true }`.

## Netlify frontend settings

Set `VITE_API_BASE_URL` to the Render service URL, for example:

```env
VITE_API_BASE_URL=https://your-service.onrender.com
```

If Netlify is connected to Git, set this in the Netlify environment variables and redeploy. If you manually upload `dist`, set it in `.env.production`, run `npm run build`, then upload the fresh `dist` folder.

`dist` by itself does not contain the API, so login and registration will not work until the Render service is deployed and the frontend is rebuilt with its URL.
