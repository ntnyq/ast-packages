import type { ParserOptions } from '@babel/parser'

export interface NpmPackage {
  name: string
  end?: number | null
  start?: number | null
  loc?: {
    end?: Position
    start?: Position
  }
}

export interface Options extends ParserOptions {
  /**
   * Parse code cache
   */
  cache?: boolean

  /**
   * Code language
   *
   * @default `js`
   */
  language?: 'dts' | 'js' | 'jsx' | 'ts'
}

interface Position {
  column: number
  index: number
  line: number
}
