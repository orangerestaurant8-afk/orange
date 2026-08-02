# Deployment

## Frontend — Vercel

1. Import this repository into Vercel and select `frontend` as the project root.
2. Set `NEXT_PUBLIC_API_URL` to `https://<your-render-service>.onrender.com/api`.
3. Set `NEXT_PUBLIC_SITE_URL` to the production Vercel URL (or custom domain), for example `https://orange.example.com`.
4. Deploy. Rebuild the frontend whenever either public variable changes.

## Backend — Render

1. Create a Render Web Service from this repository with `backend` as the root directory.
2. Use build command `npm install && npm run build` and start command `npm start`.
3. Configure these environment variables:
   - `PORT` (Render provides this automatically)
   - `MONGODB_URI` — Atlas connection URI
   - `FRONTEND_ORIGIN` — exact Vercel production URL, without a trailing slash
   - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — long, distinct random secrets
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
   - `NODE_ENV=production`
4. Deploy and copy the service’s HTTPS URL into Vercel’s `NEXT_PUBLIC_API_URL`.

## MongoDB Atlas

1. Create a production database user with a strong password and only the required database permissions.
2. Add the Render service’s outbound network access according to your Atlas network policy. For an initial deployment, Atlas’s temporary `0.0.0.0/0` allowance is possible but should be narrowed when practical.
3. Put the URI in Render as `MONGODB_URI`; never commit it to `.env.example`.

## CORS and cookies

Set `FRONTEND_ORIGIN` to the exact deployed frontend origin. The API already sends credentialed CORS responses for that origin, allowing the httpOnly refresh cookie flow. If you add a preview domain or custom domain, update `FRONTEND_ORIGIN` and redeploy the backend. For cross-site frontend/API domains in production, set the refresh cookie `sameSite` policy to `none` with `secure: true` if browser testing shows the cookie is not retained.

## Pre-launch checks

- Confirm `GET /api/health` responds from Render.
- Sign up/login and confirm `/api/auth/me` succeeds.
- Upload a menu image from the admin console and confirm its Cloudinary URL is saved.
- Confirm an admin endpoint returns `403` to a customer token.
