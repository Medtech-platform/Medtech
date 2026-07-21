# Mind+Machine™ — Setup Guide (plain language, no coding needed)

This project is now split into small files instead of one giant HTML file,
and the parts that need to stay secret (your Gemini key, Feedly token, and
email key) live on Netlify's servers — never inside a file a browser can read.

**Netlify is the right platform for this.** Here's why, in short:
- **GitHub Pages** can only serve plain files — it cannot run the little
  server-side programs ("functions") that call Feedly/Gemini secretly. Skip it.
- **WordPress** blocks JavaScript on free/personal plans, and even on the
  paid Business plan it has no clean way to hide secret keys. Skip it.
- **Netlify** does both things GitHub Pages and WordPress can't: it hosts
  your site *and* runs small secure server functions *and* can wake itself
  up on a timer every morning. That's exactly what "automated" requires.

You will use GitHub only as a place to store the project's files — Netlify
will read from there automatically every time you make a change.

---

## Step 1 — Put the project on GitHub (5 minutes)

1. Go to [github.com](https://github.com) and create a free account if you don't have one.
2. Click the **+** in the top right → **New repository**. Name it `mindmachine-platform`. Keep it Private if you like. Click **Create repository**.
3. On the new repository page, click **uploading an existing file**.
4. Drag in every file and folder from the project you downloaded from this chat (keep the folder structure — `netlify/functions/...` etc. must stay nested).
5. Click **Commit changes**.

You don't need to know Git commands for this — the website upload is enough to get started. (Later, if you want, GitHub Desktop makes updating files easier than re-uploading each time.)

## Step 2 — Connect Netlify to that GitHub repo (5 minutes)

1. Go to [netlify.com](https://netlify.com) → sign up free (you can sign up directly with your GitHub account, which makes this step automatic).
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub**, then pick the `mindmachine-platform` repository.
4. Build settings: leave everything as default (this project doesn't need a build step) and click **Deploy**.
5. Netlify gives you a free web address like `mindmachine-platform.netlify.app`. That's your live site.

## Step 3 — Add your secret keys to Netlify (10 minutes)

Go to your site in Netlify → **Site configuration → Environment variables → Add a variable**, and add each of these one at a time. (The `.env.example` file in the project lists these same names for reference — never put real keys in that file itself.)

| Variable name | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) → sign in with Google → **Create API Key**. Free, no card needed. |
| `FEEDLY_ACCESS_TOKEN` | [feedly.com/i/developers](https://feedly.com/i/developers) → **Feedly Developer Access Token**. (Feedly's free plan issues a token good for a limited time; Feedly Pro gives a permanent one — see note below.) |
| `FEEDLY_STREAM_ID` | Open the Feedly board/folder you want pulled in → look at its URL or use Feedly's "Explore streamId" tool in the developer docs — it looks like `user/xxxxxxxx-xxxx.../category/MedTech`. |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → free account → **API Keys → Create API Key**. This is what actually sends your daily email. |
| `DIGEST_TO_EMAIL` | The email address that should receive the daily digest. |
| `DIGEST_TO_NAME` | The greeting name used in the email, e.g. `Lee`. |
| `DIGEST_CC_EMAILS` | Comma-separated CC addresses, or leave blank. |
| `DIGEST_FROM_EMAIL` | The "from" address Resend sends as (Resend gives you a working default like `onboarding@resend.dev` while you're testing). |
| `ORG_CONTEXT` | One or two sentences describing your team's focus, e.g. "MedTech market intelligence team focused on cardiac monitoring, surgical robotics, and AI diagnostics." |

After adding these, click **Deploys → Trigger deploy → Deploy site** once so Netlify picks them up.

> **Note on Feedly access:** Feedly's public API access levels change over time and full API access currently requires a paid Feedly plan (Pro+/Business) — the free tier's API access is limited. If you'd rather not pay for Feedly access right now, just leave the two `FEEDLY_...` variables blank. The platform will keep working perfectly using only the free RSS sources — Feedly will simply be skipped until you add those two variables later.

## Step 4 — Try it

1. Open your live Netlify site address.
2. Click **Intel Daily** in the sidebar → **Setup Status** tab → **Check server status** to confirm your keys are recognized (it only shows ✅/❌, never the actual key).
3. Go to the **Run Daily** tab → click **Run now**. You should see real articles get fetched and scored within about 30–60 seconds.

## Step 5 — Confirm the automatic daily run

No extra setup needed — `netlify.toml` already tells Netlify to run the digest automatically every day at 9:00am UTC and email the high-relevance articles, even if nobody has the site open. To change the time, open `netlify.toml`, find the line:

```
schedule = "0 9 * * *"
```

and change the hour (the second number). For example `"0 13 * * *"` runs at 1:00pm UTC instead. Save the file, upload it to GitHub again, and Netlify will pick up the change automatically.

## What's in each folder (for reference)

- `index.html` — the shell: sidebar, top bar, and a container that loads whichever module you click.
- `partials/` — one HTML file per module (dashboard, market-understanding, intel-daily, etc.) — edit a module without touching any other module.
- `css/` — `styles.css` (shared look) and `intel-daily.css` (Intel Daily's own styling).
- `js/app.js` — navigation and shared page behavior.
- `js/intel-daily.js` — Intel Daily's on-screen behavior; it only ever talks to your own Netlify functions, never directly to Feedly or Gemini.
- `netlify/functions/` — the secure server-side code: fetching RSS, fetching Feedly, scoring with Gemini, sending email, and the scheduled daily job. This is where your secret keys are actually used.
- `.env.example` — a checklist of the environment variable *names* Netlify needs (never put real keys in this file).

If you ever want a developer to extend this later, everything they need is already organized by module — no digging through one giant file.
