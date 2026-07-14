import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import projectsData from '@/data/projectsData'
import { genPageMetadata } from 'app/seo'
import PageHeader from '@/components/PageHeader'

export const metadata = genPageMetadata({
  title: 'Projects',
  description: 'Things I have built or worked on.',
})

export default function Projects() {
  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout pb-4">
        <PageHeader title="Projects" description="Things I have built or worked on." />

        {projectsData.length > 0 ? (
          <ul className="project-list">
            {projectsData.map((project) => {
              const href = project.href

              return (
                <li key={project.title} className="project-card">
                  {href ? (
                    <Link href={href} className="project-card__link">
                      <h2>{project.title}</h2>
                    </Link>
                  ) : (
                    <h2 className="project-card__title">{project.title}</h2>
                  )}

                  {project.description && (
                    <p className="project-card__summary">{project.description}</p>
                  )}
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
