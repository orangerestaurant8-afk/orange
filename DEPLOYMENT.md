# Production deployment: Vercel + Railway

The frontend and API can be deployed independently. Deploy the Railway API first so its public URL is available to the Vercel build.

## 1. MongoDB Atlas

Create a database user and a production database. In Atlas Network Access, allow Railway to reach the cluster (for initial setup, `0.0.0.0/0` works; restrict it later if possible). Copy the connection string for `MONGODB_URI`.

## 2. Backend on Railway

1. Create a **New Project → Deploy from GitHub repo** and choose this repository.
2. In the service settings, set **Root Directory** to `backend`. Railway will use `backend/railway.json` for the build, start, restart, and health-check settings.
3. Add the variables in `backend/.env.example`, using real values. Set `NODE_ENV` to `production`; Railway provides `PORT` automatically.
4. Generate a public domain. Confirm `https://<your-api>.up.railway.app/api/health` returns `{"status":"ok"}`.

Leave `FRONTEND_ORIGIN` as a placeholder until Vercel deploys. It is a comma-separated allowlist, so it can contain both your custom domain and Vercel production URL, for example:

```text
https://orange.example.com,https://orange.vercel.app
```

## 3. Frontend on Vercel

1. Import the same Git repository into Vercel and set **Root Directory** to `frontend`.
2. Add these production environment variables:

```text
NEXT_PUBLIC_API_URL=https://<your-api>.up.railway.app/api
NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app
```

Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` only when the address picker is needed. Its Google Cloud referrer restriction should include your Vercel/custom domain.

3. Deploy. Copy the resulting Vercel production URL.
4. In Railway, set `FRONTEND_ORIGIN` to that exact URL (and any custom domain), then redeploy Railway.

`NEXT_PUBLIC_*` variables are compiled into the frontend. Redeploy Vercel whenever `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_SITE_URL` changes.

## 4. Verify

- The Railway health URL responds successfully.
- The Vercel app loads menu data from the API.
- Customer signup/login and admin login work.
- An admin can upload an image to Cloudinary.
- A customer token cannot access admin endpoints.

## Notes

- Never commit `.env`, `.env.local`, or real credentials; use each platform's environment-variable UI.
- The API only accepts browser requests from `FRONTEND_ORIGIN`. Update it when changing domains.
- Cross-site refresh cookies are configured with `Secure` and `SameSite=None` in production for the Vercel/Railway setup.
- Customer OTPs currently log to the backend console. During private testing, set `EXPOSE_OTP_IN_RESPONSE=true` in Railway to display the code on the verification screen. Remove it or set it to `false` before public launch, then connect an SMS or WhatsApp provider.
