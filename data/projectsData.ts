interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'NextPaper',
    description: `A minimal Next.js blog starter inspired by AstroPaper and built on top of Tailwind Nextjs Starter Blog.`,
    href: 'https://github.com/Hitsujii/next-paper',
  },
  {
    title: 'hitsuji.page',
    description: `My personal site for learning C++, writing high-cortisol posts and overengineering small things along the way.`,
    href: 'https://github.com/Hitsujii/hitsuji.page',
  },
]

export default projectsData
