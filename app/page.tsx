import 'katex/dist/katex.css'

import { allBlogs, allLearningLogs } from 'contentlayer/generated'
import Main from './Main'
import { getHistoryStream } from './_lib/history-stream'

export default async function Page() {
  const history = getHistoryStream({
    blogs: allBlogs,
    learningLogs: allLearningLogs,
  })

  return <Main history={history} />
}
