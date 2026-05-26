# NextPaper

> AstroPaper, but for Next.js.

[Live demo](https://hitsujii.github.io/next-paper)

NextPaper is a minimal Next.js blog starter inspired by [AstroPaper](https://github.com/satnaing/astro-paper) and built on top of [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog).

It is for people who like the calm, readable style of AstroPaper, but want to stay in the Next.js ecosystem. You get Contentlayer, MDX, tags, archives, local search, newsletter support, comments, RSS, sitemap and a clean layout for personal blogs, technical writing and small portfolio sites.

NextPaper is not an Astro theme. It is a Next.js starter that treats AstroPaper as the visual baseline and gives credit to the projects it builds on.

## Features

- Next.js App Router
- Contentlayer and MDX
- Blog posts, tags and archives
- Projects page
- Local search
- Newsletter support
- Comments support with Giscus
- Dark mode
- RSS and sitemap
- SEO metadata
- Code blocks with filename tabs and copy button
- Table of contents
- Share links
- Responsive layout
- View-transition-friendly UI

## Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Contentlayer](https://contentlayer.dev/)
- [MDX](https://mdxjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pliny](https://github.com/timlrx/pliny)

## Use as a template

Click **Use this template** on GitHub, then update the project with your own content and settings.

The main files to edit are:

- `data/siteMetadata.js`
- `data/authors/default.mdx`
- `data/projectsData.ts`
- `data/headerNavLinks.ts`
- `data/blog`
- `public/static`

If you use comments, newsletter or analytics, add your provider settings and environment variables in your deployment platform.

## Getting started

Install dependencies:

```bash
yarn install
```

Start the dev server:

```bash
yarn dev
```

Build for production:

```bash
yarn build
```

Run linting:

```bash
yarn lint
```

## Content

Blog posts live in `data/blog`.

A basic post looks like this:

```mdx
---
title: My post title
date: '2026-01-01'
tags: ['next-js', 'mdx']
draft: false
summary: A short summary of the post.
---
```

Author profiles live in `data/authors`, with the default profile in `data/authors/default.mdx`.

Projects are configured in `data/projectsData.ts`.

## Configuration

Most site settings are in `data/siteMetadata.js`.

That file controls metadata, social links, comments, analytics, newsletter settings, RSS and SEO-related values.

Navigation links are configured in `data/headerNavLinks.ts`.

Static assets live in `public`.

## Search

NextPaper uses a generated local search index at `public/search.json`.

The search UI is inspired by AstroPaper and Pagefind-style result lists, while keeping the original local search pipeline.

## Comments

NextPaper supports comments through [Pliny](https://github.com/timlrx/pliny). The default setup uses [Giscus](https://giscus.app/), which connects blog posts to GitHub Discussions.

Comment settings live in `data/siteMetadata.js`.

For Giscus, enable Discussions in your GitHub repository, install the Giscus app and provide these values in your deployment environment:

```txt
NEXT_PUBLIC_GISCUS_REPO
NEXT_PUBLIC_GISCUS_REPOSITORY_ID
NEXT_PUBLIC_GISCUS_CATEGORY
NEXT_PUBLIC_GISCUS_CATEGORY_ID
```

## Newsletter and analytics

Newsletter and analytics settings are inherited from Tailwind Nextjs Starter Blog through Pliny.

Configure them in `data/siteMetadata.js` and provide the required environment variables in `.env.local` or your deployment platform.

## Deployment

NextPaper can be deployed to any platform that supports Next.js.

It also supports static export for GitHub Pages.

For a GitHub Pages project site, such as `https://username.github.io/repo-name/`, keep the default workflow behavior. The workflow will use the repository base path automatically.

For a custom domain, such as `https://example.com/`, set this GitHub Actions variable:

```txt
CUSTOM_DOMAIN=true
```

This makes the workflow build the site from the root path instead of `/repo-name`.

You can also set `BASE_PATH` as a GitHub Actions variable if you need a custom path manually.

## Credits

NextPaper stands on the shoulders of two great open-source projects:

- [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) by Timothy Lin, used as the technical foundation.
- [AstroPaper](https://github.com/satnaing/astro-paper) by Sat Naing, used as the visual baseline and design inspiration.

## License

Licensed under the MIT License.

---

Made with 🤍 by [Hitsuji](https://hitsujii.github.io/next-paper/) 👨🏻‍💻
