# find-npm-packages

[![NPM VERSION](https://img.shields.io/npm/v/find-npm-packages.svg)](https://www.npmjs.com/package/find-npm-packages)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/find-npm-packages.svg)](https://www.npmjs.com/package/find-npm-packages)

Find npm packages from given source code.

Supports static imports, dynamic imports, `require()`, re-exports, TypeScript
import types and import-equals declarations. Node.js built-in modules and local
paths are excluded. Repeated references are preserved in source order.

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Install

```shell
npm install find-npm-packages
```

```shell
yarn add find-npm-packages
```

```shell
pnpm add find-npm-packages
```

## Usage

```ts
import { findNpmPackages } from 'find-npm-packages'

const code = `import findNpmPackages from 'find-npm-packages'`

const result = findNpmPackages(code)

console.log(result)
// [
//   {
//     "name": "find-npm-packages",
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

### `findNpmPackages`

- **Type**: `(code: string, options: Options = {}) => NpmPackage[]`

Parser options are forwarded to Babel. Invalid source throws `SyntaxError`.
`locations: false` and the `estree` plugin are unsupported and throw `TypeError`.
`start` and `end` are UTF-16 source offsets with an exclusive end, including
`startIndex` when supplied. Ranges cover the raw package name without quotes or
subpaths, including any escape sequences or line continuations in that name.

With `cache: true`, up to 100 parsed sources are retained per package instance.
Cache entries distinguish code, language and parser options.

## Interface

```ts
import type { ParserOptions } from '@babel/parser'

export interface NpmPackage {
  name: string
  end: number | null
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
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [ntnyq](https://github.com/ntnyq)
