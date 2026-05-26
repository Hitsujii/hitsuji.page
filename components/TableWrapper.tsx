import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function TableWrapper({ children }: Props) {
  return (
    <div className="overflow-hidden [&_table]:my-0 [&_table]:min-w-xl">
      <div className="relative w-full overflow-x-auto">
        <table>{children}</table>
      </div>
    </div>
  )
}
