import type { ParserOptions } from '@babel/parser'

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

export interface RegExpLiteral {
  flags: string
  pattern: string
  end?: number | null
  start?: number | null
  loc?: {
    end?: Position
    start?: Position
  }
}

interface Position {
  column: number
  index: number
  line: number
}
