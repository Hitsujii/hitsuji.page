declare module 'flubber' {
  export type ShapeInterpolator = (progress: number) => string

  export type InterpolateOptions = {
    maxSegmentLength?: number
  }

  export function interpolate(
    fromShape: string,
    toShape: string,
    options?: InterpolateOptions
  ): ShapeInterpolator
}

declare module 'svgpath' {
  type Matrix = [number, number, number, number, number, number]

  interface SvgPath {
    matrix(matrix: Matrix): SvgPath
    round(precision?: number): SvgPath
    toString(): string
  }

  export default function svgpath(path: string): SvgPath
}
