# iqbalismail.com

Personal / academic site for Iqbal K I — plain HTML/CSS/JS, no build step,
no framework, no dependencies. Deployed on GitHub Pages at
[www.iqbalismail.com](https://www.iqbalismail.com).

This README is the map: what each page is, where its content actually
lives, and exactly what to touch for the changes you'll make most often.
Every page also has inline HTML comments at the point where you'd add new
content — this file is the overview; the comments are the detail.

## Quick local preview

No server or build tooling required — just open a file directly, or serve
the folder so relative paths behave exactly like production:

```
python -m http.server 8000
# then open http://localhost:8000/index.html
```

## Structure

```
index.html          Homepage (hero, research-interest teaser)
about.html           Qualifications / certifications / teaching / academic service (tabbed)
research.html        Publications + conference presentations
resources.html       Downloadable code/notebooks/datasets
blog/
  index.html          Blog listing — AUTO-GENERATED, see below, don't hand-edit its cards
  welcome.html         A post
  why-deep-rl-for-portfolios.html
  reading-a-reward-curve.html
  README.md            Full blog-authoring guide
css/style.css        One shared stylesheet for the whole site
js/script.js          One shared script for the whole site (nav toggle, tab
                       switching, filter/sort — each block only runs on
                       pages that have its markup)
scripts/build-blog-index.js   Regenerates blog/index.html from post metadata
images/               Photos, publication figures, blog thumbnails
assets/Iqbal_CV.pdf   The CV linked from the homepage "Download CV" button
.github/workflows/    CI: auto-build the blog index + sync gh-pages on push
```

Design tokens (colors, spacing, radii) are CSS custom properties at the top
of `css/style.css` — change a value there to change it site-wide, rather
than hunting for hardcoded colors.

## How to update the things you'll update most

### Add a publication (journal paper)

Two places need updating — they're independent, not generated from each
other:

1. **`research.html`**, inside `<div class="pub-list" id="pubList">` — copy
   an existing `<article class="pub-card">` block. Set `data-year="YYYY"`
   (drives the Year filter automatically) and update the figure, tags,
   title, authors, abstract, and DOI link. Add a cover image to `images/`.
2. **`about.html`**, inside `<ol class="citation-list">` under the
   "Research Publications" panel — add the plain APA-style citation.

Both spots have an inline comment with the same instructions right above
the markup.

### Add a conference presentation

`research.html`, inside `<ul class="plain-list" id="confList">` — copy a
`<li>`, set `data-year="YYYY"`, fill in the title and venue. It shares the
Year filter/sort with Publications above.

### Add, edit, or delete a blog post

**Fully automated** — see `blog/README.md` for the complete guide. Short
version: copy an existing post, edit its `<meta name="post:*">` tags
(title/type/date/readtime/excerpt) and prose, optionally drop a thumbnail
named to match its date, then push to `main`. A GitHub Actions workflow
regenerates `blog/index.html`'s cards automatically — you never hand-edit
that file. Deleting a post's file removes its card the same way.

### Add a downloadable resource

`resources.html`, inside `<div class="resource-grid">` — copy a
`<article class="resource-card">` block: year/tag, title, one-line
description, and a link (point it at the real repo once public). No
filter/sort here; it's a small, hand-ordered grid.

### Edit About page content (qualifications, certifications, teaching, etc.)

`about.html` is one page with a JS-driven sidebar tab switcher — six
`<section class="about-panel" id="...">` blocks, one per sidebar link. Each
uses one of two repeating patterns:

- **`.timeline`** (Qualifications, Teaching Experience) — copy a
  `.timeline-item` for a new degree/role.
- **`.card-grid` + `.mini-card`** (Eligibility Tests, Reviewer, Memberships)
  — copy a `.mini-card` for a new entry.

To add a whole new section: add a sidebar `<a data-target="X">` link, a
matching `<button data-target="X">` in the `#aboutWheel` picker (the mobile
stand-in for the sidebar), *and* a matching `<section id="X"
class="about-panel">` — all three are linked only by that shared id string
(see the comment above the sidebar nav in the file).

### Edit the homepage

`index.html` — the hero text/photo/social links are hand-written, no
pattern to follow. The "Research Interests" bar underneath repeats the same
four items as `research.html`'s "Research Interests" section as a teaser;
keep both in sync if you change one.

## Site-wide filter/sort system

The blog index and the Research page's Publications/Conference lists share
one filter-bar UI (`.filter-bar` in CSS) and one JS helper
(`setupCardFilterSort()` in `js/script.js`). It works off `data-*`
attributes on each card/list item — `data-type`/`data-date` for blog posts,
`data-year` for publications and conference items — and Year options are
generated automatically at runtime from whatever dates/years are actually
on the page, so you never maintain those dropdowns by hand.

## Deployment

- **`main`** is the source of truth. Push here.
- A GitHub Actions workflow (`.github/workflows/sync-gh-pages.yml`) runs on
  every push to `main`: it regenerates the blog index (see above), then
  fast-forwards the **`gh-pages`** branch to match `main`. GitHub Pages
  serves from `gh-pages`.
- The custom domain (`www.iqbalismail.com`) is set via the `CNAME` file at
  the repo root — don't delete it, GitHub Pages regenerates DNS config from
  it on every deploy.
- `.nojekyll` tells GitHub Pages to serve the site as-is, skipping Jekyll
  processing (needed because some filenames/folders here would otherwise be
  treated specially by Jekyll).

You should essentially never need to touch `gh-pages` directly — it's a
generated mirror, not something to edit.
