# Deploy (Coolify)

1. **New Resource → Docker Compose**, point it at this repo (`docker-compose.yml` at the root).
2. **Environment Variables** (Coolify resource settings) — copy every key from `.env.example`, fill in real values:
   - `JWT_SECRET` — one long random string, same value the whole stack shares.
   - `POSTGRES_PASSWORD` — pick one.
   - `WEB_ORIGIN` / `PANEL_ORIGIN` / `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` — your real domains (see step 3).
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — from resend.com after verifying the sending domain. Leave blank to start (emails just log instead of sending — nothing breaks, users just won't get them).
3. **Domains** — in Coolify, attach each service to its subdomain:
   - `api` → `api.tekliflercepte.com` (port 4000)
   - `web` → `tekliflercepte.com` (port 3002)
   - `panel` → `panel.tekliflercepte.com` (port 3001)

   Coolify issues Let's Encrypt certs automatically once DNS points at the server.
4. **Deploy.** First deploy builds all 3 images + starts Postgres.
5. **Migrate + seed** — one-time, run inside the `api` container (Coolify → api service → Terminal, or `docker compose exec api sh`):
   ```
   cd /app && pnpm db:migrate:deploy
   cd /app && pnpm db:seed
   ```
   The seed log prints the admin login (phone + password) once — save it, it's not shown again. Set `ADMIN_SEED_PASSWORD` beforehand if you'd rather choose it yourself.
6. **Verify**: `tekliflercepte.com` loads, `panel.tekliflercepte.com` redirects to `/giris`, log in with the seeded admin.

## Notes

- Uploaded photos live on the `api_uploads` volume, mounted into the `api` container only — durable across redeploys as long as the volume isn't deleted. No S3/R2 needed at this scale.
- Postgres runs as its own service in the compose file with a persistent volume. If you'd rather use Coolify's managed Postgres, delete the `postgres` service from `docker-compose.yml` and point `DATABASE_URL` at that instead.
- Future deploys: pushing to `main` (or clicking Redeploy in Coolify) rebuilds the 3 app images. Postgres data and uploads persist — only run `db:migrate:deploy` again if a deploy includes new migrations.
