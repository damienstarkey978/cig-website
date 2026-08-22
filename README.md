# Custom Intelligence Group — Website

Static site (no build step). Sections: Hero, Services, Process, Industries, multi-step client onboarding form, FAQ, CTA, Footer.

## Structure
- `index.html` — main page (includes canonical/OG/Twitter meta tags and Organization + FAQPage JSON-LD)
- `thank-you.html` — form success page (no-JS fallback, `noindex`)
- `css/style.css` — all styles
- `js/main.js` — mobile nav + multi-step form logic
- `images/cig-logo.png` — logo
- `netlify.toml` — Netlify config
- `robots.txt` — crawler rules; explicitly allows major AI/LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- `sitemap.xml` — XML sitemap submitted to Google Search Console
- `llms.txt` — plain-text site summary for AI assistants/answer engines (llmstxt.org convention)

## SEO / Search Console
See the setup steps provided separately for verifying the domain in Google Search Console and submitting the sitemap.

## Local preview
Open `index.html` directly, or serve locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploying
See deployment instructions provided separately for connecting to Netlify and your GoDaddy domain, and for setting up form-submission email notifications.
