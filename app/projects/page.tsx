import Breadcrumb from '@/components/Breadcrumb'
import Link from '@/components/Link'
import projectsData from '@/data/projectsData'
import { genPageMetadata } from 'app/seo'
import PageHeader from '@/components/PageHeader'
import { pageTitleTransitionKey } from '@/components/view-transitions'

export const metadata = genPageMetadata({
  title: 'Projects',
  description: 'Small projects and experiments.',
})

export default function Projects() {
  return (
    <>
      <Breadcrumb />

      <main id="main-content" className="app-layout pb-4">
        <PageHeader title="Projects" titleTransitionKey={pageTitleTransitionKey('/projects')} />

        {projectsData.length > 0 ? (
          <ul className="project-list">
            {projectsData.map((project) => (
              <li key={project.title} className="project-row">
                <div className="project-row__body">
                  <h2>{project.title}</h2>
                  <span className="project-row__separator" aria-hidden="true">
                    {' — '}
                  </span>
                  <p>{project.description}</p>
                </div>

                {project.source && (
                  <Link href={project.source} className="project-row__source">
                    [src]
                    <span className="sr-only"> for {project.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No projects found.</p>
        )}
      </main>
    </>
  )
}
