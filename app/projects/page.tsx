import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import projectsData from '@/data/projectsData'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Projects',
  description: 'Things I have built or worked on.',
})

export default function Projects() {
  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout pb-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Projects</h1>
        <p className="mt-2 mb-6 italic">Things I have built or worked on.</p>

        {projectsData.length > 0 ? (
          <ul>
            {projectsData.map((project) => {
              const href = project.href

              return (
                <li key={project.title} className="my-6">
                  {href ? (
                    <Link
                      href={href}
                      className="inline-block text-lg font-medium text-[var(--accent)] underline-offset-4 hover:underline hover:decoration-dashed focus-visible:no-underline focus-visible:underline-offset-0"
                    >
                      <h2>{project.title}</h2>
                    </Link>
                  ) : (
                    <h2 className="inline-block text-lg font-medium text-[var(--accent)]">
                      {project.title}
                    </h2>
                  )}

                  {project.description && <p>{project.description}</p>}
                </li>
              )
            })}
          </ul>
        ) : (
          <p>No projects found.</p>
        )}
      </main>
    </>
  )
}
