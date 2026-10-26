# find-regexp-literals

[![NPM VERSION](https://img.shields.io/npm/v/find-regexp-literals.svg)](https://www.npmjs.com/package/find-regexp-literals)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/find-regexp-literals.svg)](https://www.npmjs.com/package/find-regexp-literals)

Find regular expression literals from given source code.

Preserves patterns, flags, source ranges and repeated literals in source order.
Strings, comments, division expressions and `RegExp()` constructors are ignored.

Requires Node.js `^22.18.0 || >=24.11.0`.

## Install

```shell
npm install find-regexp-literals
```

```shell
yarn add find-regexp-literals
```

```shell
pnpm add find-regexp-literals
```

## Usage

```ts
import { findRegExpLiterals } from 'find-regexp-literals'

const code = '/foo/gi'

const result = findRegExpLiterals(code)

console.log(result)
// [
//   {
//     "pattern": "foo",
//     "flags": "gi",
//     "start": 0,
//     "end": 7,
//     "loc": {
//       "end": {
//         "column": 7,
//         "index": 7,
//         "line": 1,
//       },
//       "start": {
//         "column": 0,
//         "index": 0,
//         "line": 1,
//       },
//     },
//   },
// ]
```

## API

### `findRegExpLiterals`

- **Type**: `(code: string, options: Options = {}) => RegExpLiteral[]`

Parser options are forwarded to Babel. Invalid source throws `SyntaxError`.
The `estree` plugin is unsupported and throws `TypeError`. Setting
`locations: false` omits `loc` while preserving the pattern, flags and offsets.
`start` and `end` are UTF-16 source offsets with an exclusive end, including
`startIndex` when supplied. Ranges cover the complete literal, including slashes
and flags.

With `cache: true`, up to 100 parsed sources are retained per package instance.
Cache entries distinguish code, language and parser options.

## Interface

```ts
import type { ParserOptions } from '@babel/parser'

export interface RegExpLiteral {
  pattern: string
  flags: string
  end?: number | null
  start?: number | null
  loc?: {
    end?: Position
    start?: Position
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
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [ntnyq](https://github.com/ntnyq)
