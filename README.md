# Nirjhar Khan — Portfolio Website

One-page portfolio for graphic designer & art director **Nirjhar Khan**.
Static HTML/CSS/JS, no build tooling, no framework, self-hosted fonts.
Live at **[nirjharkhan.com](https://nirjharkhan.com/)**.

## Sections

- **Hero** — name, intro, stats, social links, skills marquee
- **About** — bio, discipline/specialism/toolkit spec sheet, portrait
- **Services** — 8 capability cards (accordion on mobile)
- **Design philosophy** — pull-quote band
- **Portfolio** — filterable grid of live Behance embeds
- **Education & Experience** — two-column timeline
- **Testimonials** — auto-advancing, infinite-loop carousel
- **Contact** — form posting to `contact.php`, plus direct email/WhatsApp/map links
- **Footer** — brand lockup, social links, credit

## Tech notes

- **Fonts**: self-hosted, no external font requests.
  - **Victory Striker Sans** — used only for the hero name and the three
    hero stat numbers (12+ / 85+ / 35+). Its shipped vertical metrics were
    patched with `fontTools` (see `fonts/`) — the original file's declared
    ascent was sized to a couple of unused decorative glyphs, which left a
    large phantom gap above every line of real text.
  - **Montserrat** — everything else, self-hosted in 6 static weights
    (Regular/Medium/SemiBold/Bold/ExtraBold/Black).
- **Theme**: light/dark toggle, persisted to `localStorage`, respects
  `prefers-color-scheme` when no explicit choice is stored.
- **Images**: hero and about portraits ship as WebP (via `<picture>`,
  PNG fallback for older browsers) — cut ~2.9 MB down to ~170 KB combined.
  Social-preview meta tags (`og:image`, `twitter:image`, JSON-LD) still
  point at the PNG for maximum crawler compatibility.
- **Portfolio embeds**: Behance `<iframe>`s are `loading="lazy"` so they
  don't cost anything until the visitor actually scrolls to them.
- **Motion**: scroll-reveal via `IntersectionObserver`; cursor-follow /
  card-tilt / floating-chip physics are gated behind `pointer: fine` and
  `prefers-reduced-motion`, so touch devices and reduced-motion users get
  a static, instant layout instead.

## SEO

- Single canonical URL (`https://nirjharkhan.com/`), `robots.txt` +
  `sitemap.xml` pointing at it.
- Open Graph + Twitter Card tags, JSON-LD `Person` (with `sameAs`,
  `worksFor`, `alumniOf`, client `review`s) and `WebSite` schema.
- One `<h1>`, six `<h2>`s, descriptive `alt` text on every image.

## Local development

Serve the folder with any static file server, e.g.:

```
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`. No build step, no install.

## Deployment (nirjharkhan.com)

1. Upload everything **except** the files below to `public_html` (or your
   host's web root):
   - `recomendatiions.docx` — the original content brief; not a web
     asset, don't publish it (it'd be directly downloadable at
     `/recomendatiions.docx` otherwise).
   - `.git/`, `.claude/`, `README.md` — dev-only.
2. **Contact form**: open `contact.php` and fill in `$recipientEmail`.
   It uses PHP's built-in `mail()` by default, which works out of the box
   on most cPanel shared hosting. If mail ends up in spam, switch to the
   SMTP/PHPMailer block near the bottom of the file (fill in `$smtpHost`,
   `$smtpUsername`, `$smtpPassword` from your host's mail settings first).
3. **`.htaccess`** is already set up for this domain — HTTPS + non-www
   canonicalization, gzip/brotli compression, cache headers, and correct
   MIME types for `.woff2`/`.webp`. Requires `mod_rewrite`, `mod_deflate`,
   `mod_expires`, `mod_headers` (all standard on cPanel/Apache). If the
   site ever moves off `nirjharkhan.com`, update the hostname in the
   rewrite rules.
4. Verify after upload: contact form submits successfully, dark/light
   toggle persists across reloads, and the Behance embeds load when
   scrolled into view.

## Structure

```
index.html          — the entire site (single page)
css/style.css        — all styles, theme tokens at the top
js/script.js         — all behaviour (IIFE, no dependencies)
contact.php          — form backend (fill in before going live)
fonts/               — self-hosted woff2 files + @font-face in style.css
img/                 — portraits (PNG + WebP), logos, favicons
.htaccess            — production server config (compression/caching/HTTPS)
robots.txt, sitemap.xml — SEO
```
