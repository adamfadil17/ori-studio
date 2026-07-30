# reCAPTCHA v2 (checkbox) — setup guide

The three contact forms (Inquiry, Partnership, Career) are protected by Google
reCAPTCHA **v2** — the "I'm not a robot" checkbox. The visitor ticks the box
before submitting; the token it produces is verified server-side. This guide
walks through getting the two keys and turning it on.

## How it behaves

- **Disabled by default.** With no keys set, the checkbox isn't rendered and the
  server skips verification — forms work normally in local dev without any keys.
- **Enabled** once both keys are present. The checkbox appears above each form's
  submit button (`src/components/public/contact/recaptcha-checkbox.tsx`); the
  form won't submit until it's ticked, and the API verifies the token
  (`src/lib/recaptcha.ts`) before saving. A failed check returns `400` and the
  submission is **not** saved.

Two keys, two homes:

| Key | Env var | Where it lives |
|---|---|---|
| Site key | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public — shipped to the browser |
| Secret key | `RECAPTCHA_SECRET_KEY` | Server only — never exposed |

## Getting the keys

1. Go to the reCAPTCHA admin console: **https://www.google.com/recaptcha/admin/create**
   (sign in with the Google account you want to own the keys — ideally the same
   studio Google account used for email).
2. Fill in the form:
   - **Label:** e.g. `ORI Studio Architect` (just a name for you).
   - **reCAPTCHA type:** choose **reCAPTCHA v2**, then the **"I'm not a robot"
     Checkbox** sub-option. (This matters — a v3 key will NOT work with the
     checkbox widget.)
   - **Domains:** add each domain the site runs on, one per line — **without**
     `https://` or a path. For example:
     - `oristudio.co`
     - `www.oristudio.co`
     - `localhost` ← add this too if you want to test the live check locally.
   - Accept the Terms, then **Submit**.
3. The next screen shows two keys:
   - **Site Key** → copy into `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Secret Key** → copy into `RECAPTCHA_SECRET_KEY`

   You can always return to https://www.google.com/recaptcha/admin, open the
   site, and click the ⚙ (settings) to see the keys again.

## Putting them in `.env`

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6Lc...your-site-key..."
RECAPTCHA_SECRET_KEY="6Lc...your-secret-key..."
```

Then rebuild + restart (`NEXT_PUBLIC_*` is baked into the client bundle at build
time, so a rebuild is required — not just a restart):

```bash
npm run build
pm2 restart ori-studio
```

## Notes

- **`localhost` in the domain list** lets you exercise the real checkbox in dev.
  Otherwise, just leave the keys blank locally and it stays disabled.
- **Already have v3 keys?** They won't work here — register a new **v2 Checkbox**
  site and use those keys instead.
- **Fails closed.** When enabled, a missing/expired token or an error talking to
  Google rejects the submission. Google reCAPTCHA is highly available, but keep
  this in mind if you ever see verification failures.
- The checkbox token is **single-use** and expires after a couple of minutes;
  the form resets it after each successful submit automatically.
- This is separate from the existing per-endpoint **rate limiting**, which stays
  on regardless.
