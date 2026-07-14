# hitsuji.page

Personal C++ learning log, notes vault, blog, and a suspicious amount of blue CSS.

The site combines a plain old developer blog with a small Windows-era `frieren.cpp` window. Posts and short learning logs share one reverse-chronological `history[]` stream on the home page; longer notes live in the C++ vault.

## Local development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Development output is written to `.next-dev`; production builds use `.next`. Keeping them separate allows `npm run build` to run without stopping an active dev server.

After a production build, run it with:

```bash
npm start
```

## Content

- `data/blog/` — long-form posts
- `data/learning-log/` — short entries rendered in `history[]`
- `data/notes/` — the synced notes vault
- `data/projectsData.ts` — projects
- `data/siteMetadata.js` — site metadata and integrations

`npm run notes:sync` copies Markdown notes from `CPP_NOTES` (or the local default configured in the script).

## Local audits

One-off browser and contrast checks belong in `.local-audit/`. The directory is intentionally ignored by Git and ESLint; audit scripts and screenshots must not be committed.

## Stack and credits

Next.js, React, Contentlayer, Tailwind CSS, and Pliny. The codebase grew from [NextPaper](https://github.com/Hitsujii/next-paper), which in turn took inspiration from AstroPaper and Tailwind Next.js Starter Blog.
