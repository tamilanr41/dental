# Netlify website and clinic API

The Netlify `dist` folder contains the static website only. Login, registration, appointments, and the admin area need the Express API and persistent database configured in `render.yaml`.

## Deploy the API

1. Push this project to a Git repository and create a Render Blueprint from it using `render.yaml`.
2. Set `SITE_ORIGIN` to the public website origin, for example `https://fancy-elf-3ea04c.netlify.app` (no trailing slash).
3. Set a strong, unique `ADMIN_PASSWORD` before the first deploy. Keep it private. The initial admin email is `admin@srisaraswathidental.com`.
4. Wait for the Render service health endpoint at `/api/health` to return `{ "ok": true }` and copy its `onrender.com` service URL.

The Blueprint creates a persistent disk for the SQLite database and a generated session secret. The initial admin account is only created when `ADMIN_PASSWORD` is set; the server never prints that password.

## Connect and rebuild the Netlify frontend

1. Copy `.env.production.example` to `.env.production` and replace the example value with the Render service URL, such as `VITE_API_BASE_URL=https://your-service.onrender.com`.
2. Run `npm run build`.
3. Deploy the newly generated `dist` folder to Netlify. The built frontend sends auth cookies to the API with credentials enabled; the API accepts only the configured Netlify origin.

If you deploy only `dist` before deploying/configuring the API, login and registration cannot create or validate accounts. The forms now show a clear service setup error instead of a generic failure.