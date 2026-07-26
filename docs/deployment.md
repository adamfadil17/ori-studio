# Deployment (self-hosted VPS)

Notes for running the site on a Linux VPS (e.g. Contabo) with Node + PostgreSQL
behind pm2, and — once a domain is ready — Nginx. Focus is on the pieces that
aren't obvious from the code: **file storage** and the **upload sweeper**.

## 1. Install & build

Uploads and secrets aside, the app is a standard Next.js build:

```bash
git clone <repo> && cd ori-studio
cp .env.example .env        # then fill it in (see below)
npm ci                      # installs devDeps too — the build AND the sweeper need them
npx prisma generate         # src/generated is gitignored, so generate on the server
npx prisma migrate deploy   # apply migrations
npm run db:seed             # first admin, from ADMIN_* in .env
npm run build
# start with pm2 (or your process manager), running as a non-root user e.g. `deploy`
pm2 start "npm run start" --name ori-studio
```

On **every** deploy, rebuild and restart — Next compiles the whole app, so no
code change (component, style, route, or logic) takes effect until then:

```bash
npm run build
pm2 restart ori-studio
```

The Prisma steps are conditional: run `npx prisma generate` only when the schema
changed or on a fresh clone (`src/generated` is gitignored), and
`npx prisma migrate deploy` only when there are new migrations.

## 2. File storage directories

Uploads live **outside** the app tree, so they survive redeploys and aren't
subject to Next's startup snapshot of `public/`. Each kind has a **committed**
dir (served) and a sibling **tmp** dir (staging + trash, never served).

```bash
# public images (committed + tmp) — Nginx-servable
sudo mkdir -p /var/www/ori-uploads /var/www/ori-uploads-tmp
# private CVs (committed + tmp) — never served statically
sudo mkdir -p /var/lib/ori-studio/private/cv /var/lib/ori-studio/tmp/cv

# own them by the app user, then lock down the private side
sudo chown -R deploy:deploy /var/www/ori-uploads /var/www/ori-uploads-tmp /var/lib/ori-studio
sudo chmod 755 /var/www/ori-uploads /var/www/ori-uploads-tmp   # world-readable (public)
sudo chmod 700 /var/lib/ori-studio/private /var/lib/ori-studio/tmp  # app user only
```

> **Same filesystem.** Each tmp dir must sit on the same filesystem as its
> committed pair (both under `/var/www`; both under `/var/lib`). `promote`/`trash`
> use `rename`, which is atomic only within one filesystem — across mounts it
> falls back to a slower copy+unlink, but keeping them paired avoids that.

Then point the app at them in `.env` and restart:

```bash
UPLOADS_DIR=/var/www/ori-uploads
UPLOADS_TMP_DIR=/var/www/ori-uploads-tmp
PRIVATE_UPLOADS_DIR=/var/lib/ori-studio/private
PRIVATE_TMP_DIR=/var/lib/ori-studio/tmp
UPLOADS_TTL_HOURS=24
```

Leaving these blank (dev) falls back to project-local `.data/*`.

## 3. Sweeper cron (hourly)

`npm run sweep` walks the tmp roots and: promotes any file the DB still
references (a crash backstop), deletes unreferenced files older than
`UPLOADS_TTL_HOURS`, and leaves fresh unreferenced files alone (grace window, so
an in-flight submit is never deleted mid-flight). It loads `.env` itself
(`--env-file`), so cron only needs the right working directory.

As the app user (`crontab -e`):

```cron
0 * * * * cd /home/deploy/ori-studio && /usr/bin/npm run sweep >> /var/log/ori-sweep.log 2>&1
```

- **PATH in cron is minimal** — use the absolute path to `npm` (`which npm`), or
  source your node manager in a small wrapper script.
- **`tsx` is a devDependency.** Building on the server (step 1) installs it, so
  `npm run sweep` works. If you later prune dev deps (`npm prune --omit=dev`),
  move `tsx` into `dependencies` or the cron will fail.

## 4. Serving uploads

The app works with or without Nginx:

- **Bare Node (no domain yet):** the route handler `app/uploads/[...path]`
  already serves committed images per request — nothing to configure. This is
  what makes freshly-uploaded images load without a restart.
- **With Nginx (recommended once you have a domain):** alias only the
  **committed public** dir, offloading static serving from Node:

```nginx
location /uploads/ {
    alias /var/www/ori-uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    try_files $uri =404;
}
```

> **Never alias the private dir.** CVs are served only through the authenticated
> `/api/uploads/cv/...` route. Keeping `PRIVATE_UPLOADS_DIR` under `/var/lib`
> (outside `/var/www`) makes it impossible for Nginx to expose them.

## 5. Migrating existing uploads

Only needed if a previous deploy stored files inside the app
(`public/uploads`, `private-uploads`). Move them once:

```bash
mv public/uploads/images/*  /var/www/ori-uploads/images/    2>/dev/null || true
mv private-uploads/cv/*      /var/lib/ori-studio/private/cv/  2>/dev/null || true
```

Stored URLs (`/uploads/…`, `/api/uploads/cv/…`) don't change, so there's **no DB
migration**. For this project the DB was wiped clean, so there is nothing to
migrate.

## 6. Backups

Both storage roots sit outside the app, so back them up independently of the
code — `rsync` `/var/www/ori-uploads` and `/var/lib/ori-studio/private` on a
schedule, separate from `pg_dump` for the database.
