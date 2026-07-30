# Nirjhar Khan — Portfolio Website

One-page portfolio site for graphic designer Nirjhar Khan. Static HTML/CSS/JS,
no build tooling, self-hosted fonts.

## Sections

- Hero
- About
- Services
- Selected Work (live Behance embeds)
- Education & Experience
- Testimonials
- Contact (PHP form backend, see `contact.php`)

## Local development

Serve the folder with any static file server, e.g.:

```
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Deployment

`contact.php` has placeholder SMTP/cPanel fields (`$smtpHost`, `$smtpUsername`,
`$smtpPassword`, etc.) — fill these in once hosted.
