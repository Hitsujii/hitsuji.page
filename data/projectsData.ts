interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Documentation Site',
    description: `A small documentation-style project entry. Replace this with your own project,
    product or case study when you customize the template.`,
    href: '/blog/introducing-tailwind-nextjs-starter-blog',
  },
  {
    title: 'Content-Driven Blog',
    description: `An example project showing how NextPaper can be used for MDX articles, tags,
    RSS, sitemap and SEO-friendly static publishing.`,
    href: '/blog/github-markdown-guide',
  },
]

export default projectsData
