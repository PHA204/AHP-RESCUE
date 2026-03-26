// REFACTORED: added a local module declaration so react-katex stays type-safe in this workspace
declare module 'react-katex' {
  import type { ReactElement } from 'react'

  export function InlineMath(props: { math: string }): ReactElement
  export function BlockMath(props: { math: string }): ReactElement
}
