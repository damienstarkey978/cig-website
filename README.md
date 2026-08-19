# Custom Intelligence Group — Website

Static site (no build step). Sections: Hero, Services, Process, Industries, multi-step client onboarding form, FAQ, CTA, Footer.

## Structure
- `index.html` — main page
- `thank-you.html` — form success page (no-JS fallback)
- `css/style.css` — all styles
- `js/main.js` — mobile nav + multi-step form logic
- `images/cig-logo.png` — logo
- `netlify.toml` — Netlify config

## Local preview
Open `index.html` directly, or serve locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploying
See deployment instructions provided separately for connecting to Netlify and your GoDaddy domain, and for setting up form-submission email notifications.
