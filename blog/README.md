# Adding a new blog post

This blog is plain HTML — no build step, no CMS. To publish a new post:

1. Copy `welcome.html` (or any existing post) to a new file, named after
   the post's slug, e.g. `my-new-post.html`.
2. Edit its `<title>`, the `.eyebrow` tag, `<h1>`, the byline date/read time,
   and the content inside `.prose`.
3. Add a card for it in `blog/index.html`, inside the `.blog-grid` list
   (copy one of the existing `<a class="blog-card">` blocks and update the
   `href`, tag, title, and excerpt). If it's your newest post, also move it
   into the `.featured-post` slot at the top.
4. Optionally add a matching teaser card to the "From the blog" section on
   `../index.html`.

Every post page links back to `index.html` via the "← Back to all posts"
link at the bottom — no other wiring needed.
