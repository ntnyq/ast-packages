import type { ParserOptions } from '@babel/parser'

export interface NpmPackage {
  end: number | null
  name: string
  start: number | null
  loc: {
    end: Position
    start: Position
  }
}

export interface Options extends ParserOptions {
  /**
   * Cache up to 100 parsed sources, keyed by code, language and parser options.
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
