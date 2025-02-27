# find-npm-packages

[![CI](https://github.com/ntnyq/find-npm-packages/workflows/CI/badge.svg)](https://github.com/ntnyq/find-npm-packages/actions)
[![NPM VERSION](https://img.shields.io/npm/v/find-npm-packages.svg)](https://www.npmjs.com/package/find-npm-packages)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/find-npm-packages.svg)](https://www.npmjs.com/package/find-npm-packages)
[![CODECOV](https://codecov.io/github/ntnyq/find-npm-packages/branch/main/graph/badge.svg)](https://codecov.io/github/ntnyq/find-npm-packages)
[![LICENSE](https://img.shields.io/github/license/ntnyq/find-npm-packages.svg)](https://github.com/ntnyq/find-npm-packages/blob/main/LICENSE)

Find npm packages from given source code.

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

## Interface

```ts
import type { ParserOptions } from '@babel/parser'

export interface NpmPackage {
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
