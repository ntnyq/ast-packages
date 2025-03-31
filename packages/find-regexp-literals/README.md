# find-regexp-literals

[![NPM VERSION](https://img.shields.io/npm/v/find-regexp-literals.svg)](https://www.npmjs.com/package/find-regexp-literals)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/find-regexp-literals.svg)](https://www.npmjs.com/package/find-regexp-literals)

Find npm packages from given source code.

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

const code = `import findRegExpLiterals from 'find-regexp-literals'`

const result = findRegExpLiterals(code)

console.log(result)
// [
//   {
//     "name": "find-regexp-literals",
//     "start": 29,
//     "end": 46,
//     "loc": {
//       "end": {
//         "column": 46,
//         "index": 46,
//         "line": 1,
//       },
//       "start": {
//         "column": 29,
//         "index": 29,
//         "line": 1,
//       },
//     },
//   },
// ]
```

## API

### `findRegExpLiterals`

- **Type**: `(code: string, options: Options = {}) => RegExpLiterals[]`

## Interface

```ts
import type { ParserOptions } from '@babel/parser'

export interface RegExpLiterals {
  name: string
  end: number
  start: number
  loc: {
    end: Position
    start: Position
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
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [ntnyq](https://github.com/ntnyq)
