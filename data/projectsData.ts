interface Project {
  title: string
  description: string
  source?: string
}

const projectsData: Project[] = [
  {
    title: 'NextPaper',
    description: `A minimal Next.js blog starter inspired by AstroPaper.`,
    source: 'https://github.com/Hitsujii/next-paper',
  },
  {
    title: 'hitsuji.page',
    description: `The source for this blog and C++ learning log.`,
    source: 'https://github.com/Hitsujii/hitsuji.page',
  },
]

export default projectsData
