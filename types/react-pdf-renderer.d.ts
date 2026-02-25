/**
 * Type declaration for @react-pdf/renderer so its components are valid
 * JSX elements under React 19 / strict TypeScript.
 */
declare module '@react-pdf/renderer' {
  import type { ComponentType, CSSProperties, ReactNode, ReactElement } from 'react'

  export const Document: ComponentType<{ title?: string; author?: string; subject?: string; creator?: string; children?: ReactNode }>
  export const Page: ComponentType<{ size?: string | { width: number; height: number }; style?: CSSProperties; children?: ReactNode }>
  export const View: ComponentType<{ style?: CSSProperties; children?: ReactNode }>
  export const Text: ComponentType<{ style?: CSSProperties; children?: ReactNode }>
  export const Link: ComponentType<{ src: string; children?: ReactNode }>
  export const Image: ComponentType<{ src: string | { data: string; format: string }; style?: CSSProperties }>
  export const StyleSheet: {
    create: (styles: Record<string, CSSProperties>) => Record<string, CSSProperties>
  }
  export function pdf(component: ReactElement): Promise<Blob>
}
