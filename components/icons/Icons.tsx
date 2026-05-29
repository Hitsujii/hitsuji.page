import type { SVGProps } from 'react'
type IconProps = SVGProps<SVGSVGElement>

export function IconMoon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={24}
      height={24}
      shapeRendering="crispEdges"
      viewBox="0 0 6.35 6.35"
      {...props}
    >
      <path
        d="M2.31 6.061v-.288H1.154v-.578H.577V4.041H0V2.309h.577V1.155h.578V.577h.577V0h1.732v.577h-.578v1.155H2.31v1.154h.577v.578h.578v.577h1.154v-.577h1.155v-.578h.577v1.732h-.577v.577h-.578v.578H4.041v.577H2.309Zm1.73-.577v-.289h1.155v-.577h.578V4.04H4.618v.578H3.464V4.04h-.578v-.576H2.31v-.578h-.577V1.732h.578V.577h-.578v.578h-.577v1.154H.577v1.732h.578v1.154h1.154v.578h1.732Z"
        style={{
          display: 'inline',
          fill: 'currentColor',
          strokeWidth: 0.0218182,
        }}
      />
    </svg>
  )
}

export function IconSun(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={24}
      height={24}
      viewBox="0 0 6.35 6.35"
      shapeRendering="crispEdges"
      stroke="currentColor"
      {...props}
    >
      <path
        d="M2.93 6.106v-.244h.489v.488h-.488ZM.489 5.617v-.244h.489v.489H.488Zm4.885 0v-.244h.489v.489h-.489Zm-2.93-.488v-.244h-.978v-.977H.977V2.442h.488v-.977h.977V.977h1.466v.488h.977v.977h.488v1.466h-.488v.977h-.977v.488H2.442Zm1.465-.489v-.244h.488v-.488h.489V2.442h-.489v-.488h-.488v-.489H2.442v.489h-.488v.488h-.489v1.466h.489v.488h.488v.489h1.466ZM0 3.175v-.244h.488v.488H0Zm5.862 0v-.244h.488v.488h-.488ZM.488.733V.488h.489v.489H.488Zm4.885 0V.488h.489v.489h-.489ZM2.931.244V0h.488v.488h-.488Z"
        style={{
          display: 'inline',
          fill: 'currentColor',
          strokeWidth: 0.0184616,
        }}
      />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={24}
      height={24}
      shapeRendering="crispEdges"
      viewBox="0 0 6.35 6.35"
      {...props}
    >
      <path
        d="M5.773 6.061v-.288h-.578v-.578h-.577v-.577H3.464v.577H1.732v-.577H.577V3.464H0V1.732h.577V.577h1.155V0h1.732v.577h1.154v1.155h.577v1.732h-.577v1.154h.577v.577h.578v.578h.577v.577h-.577ZM3.463 4.33v-.29h.578v-.576h.577V1.732H4.04v-.577h-.576V.577H1.732v.578h-.577v.577H.577v1.732h.578v.577h.577v.577h1.732z"
        style={{
          fill: 'currentColor',
          strokeWidth: 0.0218182,
        }}
      />
    </svg>
  )
}
