# Adding a new blog post

The blog index (`blog/index.html`) is auto-generated from the post files in
this folder — you never edit it by hand. To publish a new post:

1. Copy `welcome.html` (or any existing post) to a new file, named after
   the post's slug, e.g. `my-new-post.html`.
2. Edit its `<title>`, the five `post:*` `<meta>` tags near the top of
   `<head>` (see below), the `.eyebrow` tag, `<h1>`, the visible byline
   date/read time, and the content inside `.prose`.
3. Optional: drop a thumbnail into `../images/blog_thumbs/`, named
   `DD-MM-YY.webp` to match the post's `post:date` — e.g. a post dated
   `2026-04-01` needs `01-04-26.webp`. No matching file just means the card
   falls back to a placeholder icon.
4. Commit and push to `main`. A GitHub Actions workflow
   (`.github/workflows/sync-gh-pages.yml`) runs
   `node scripts/build-blog-index.js` on every push, which rebuilds the
   featured card and the "All posts" grid — including the filter/sort
   `data-type`/`data-date` attributes — from every post's metadata, commits
   the result back to `main`, and syncs `gh-pages`.

Deleting a post is the mirror image: delete the `.html` file (and its
thumbnail, if any) and push — the next build drops its card automatically.
Editing a post's type, date, excerpt, or read time is just editing that
post's `post:*` meta tags and pushing; the index picks it up on the next
build.

To preview the regenerated index locally before pushing, run
`node scripts/build-blog-index.js` yourself (needs only Node, no
dependencies) — it edits `blog/index.html` in place.

Every post page links back to `index.html` via the "← Back to all posts"
link at the bottom — no other wiring needed.

## The `post:*` meta tags

Near the top of `<head>`, every post has five tags the generator reads.
All five are required:

```html
<meta name="post:title" content="My New Post" />
<meta name="post:type" content="Field Notes" />
<meta name="post:date" content="2026-04-01" />
<meta name="post:readtime" content="4 min read" />
<meta name="post:excerpt" content="One sentence describing the post." />
```

`blog/index.html` itself has no `post:date` tag, which is how the generator
tells posts apart from the index page when it scans the folder.

**Don't hand-edit the generated regions.** In `blog/index.html`, everything
between `<!-- BLOG_FEATURED:START -->`/`:END` and `<!-- BLOG_GRID:START -->`/
`:END` is overwritten on the next build. Everything else on that page (the
hero copy, the filter bar, the page shell) is regular hand-maintained HTML.

## Post types (for the Type filter)

`post:type` must exactly match one of these — it's both the filter option
and the `.tag` text shown on the card:

- **Notes** — meta posts about the blog itself: intros, updates, milestones.
- **Research** — plain-language walkthroughs of your own published work / work in progress.
- **Field Notes** — narrative, story-driven posts about the practical side of doing research.
- **Paper Breakdowns** — deep dives into other people's papers.
- **Tooling & Reproducibility** — technical, code-heavy posts about your actual stack.
- **Career Notes** — reflections on the PhD-to-job-market journey.
- **Data Diaries** — short posts about a specific dataset.
- **Explainers** — plain explanations of standard finance/ML concepts, not tied to your own research.
- **Commentary** — short, timely reactions to markets or AI/finance news.

The generator warns (but doesn't fail) if `post:type` isn't in this list.
If you need a genuinely new category, add it to the `#blogFilterType`
`<select>` in `blog/index.html` and to the list above.

Year/Month filter options need no maintenance — they're generated in the
browser at runtime from whatever `data-date` values are on the page.
