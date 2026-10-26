import { describe, expect, expectTypeOf, it } from 'vitest'
import { findNpmPackages } from '../src'
import type { NpmPackage, Options } from '../src'
import FIXTURE_DTS from './fixtures/dts.d.ts?raw'
import FIXTURE_JS from './fixtures/js.js?raw'
import FIXTURE_JSX from './fixtures/jsx.jsx?raw'
import FIXTURE_TS from './fixtures/ts.ts?raw'

describe('find-npm-packages', () => {
  it('exports the public option and result types', () => {
    expect.assertions(0)
    expectTypeOf<Parameters<typeof findNpmPackages>[1]>().toEqualTypeOf<
      Options | undefined
    >()
    expectTypeOf<ReturnType<typeof findNpmPackages>>().toEqualTypeOf<
      NpmPackage[]
    >()
  })

  it.each([
    ["export { x } from 'foo'", 'foo'],
    ["export * from '@foo/bar/subpath'", '@foo/bar'],
    ["export * as foo from 'foo'", 'foo'],
    ["export type { Foo } from 'foo'", 'foo'],
    ["import foo = require('foo')", 'foo'],
    ["type Foo = import('foo').Foo", 'foo'],
    ["type Foo = typeof import('@foo/bar/subpath')", '@foo/bar'],
  ])('finds dependency references in %s', (code, name) => {
    expect.assertions(1)
    expect(
      findNpmPackages(code, { language: 'ts' }).map(pkg => pkg.name),
    ).toStrictEqual([name])
  })

  it.each(['fs', 'path/posix', 'assert/strict', 'node:fs', 'node:test'])(
    'ignores the built-in module %s',
    name => {
      expect.assertions(1)
      expect(findNpmPackages(`import '${name}'`)).toStrictEqual([])
    },
  )

  it('keeps npm packages whose names resemble built-in modules', () => {
    expect.assertions(1)
    expect(
      findNpmPackages(
        "import '@scope/fs'; import 'fs-extra'; import 'test'",
      ).map(pkg => pkg.name),
    ).toStrictEqual(['@scope/fs', 'fs-extra', 'test'])
  })

  it.each<[string, string, { line: number; column: number }]>([
    [String.raw`lo\u0064ash`, 'lodash', { line: 1, column: 19 }],
    [String.raw`lo\x64ash`, 'lodash', { line: 1, column: 17 }],
    [String.raw`lo\u{64}ash`, 'lodash', { line: 1, column: 19 }],
    [String.raw`lo\u006Aash`, 'lojash', { line: 1, column: 19 }],
    [String.raw`lo\x6Aash`, 'lojash', { line: 1, column: 17 }],
    [String.raw`fo\U0061`, 'foU0061', { line: 1, column: 16 }],
    [String.raw`fo\X64ash`, 'foX64ash', { line: 1, column: 17 }],
    [String.raw`@scope\/pkg`, '@scope/pkg', { line: 1, column: 19 }],
    ['lo\\\ndash', 'lodash', { line: 2, column: 4 }],
    ['lo\\\r\ndash', 'lodash', { line: 2, column: 4 }],
    ['lo\\\rdash', 'lodash', { line: 2, column: 4 }],
    ['lo\\\u2028dash', 'lodash', { line: 2, column: 4 }],
    ['lo\\\u2029dash', 'lodash', { line: 2, column: 4 }],
  ])('tracks the raw source range of %j', (rawName, name, end) => {
    expect.assertions(1)
    const code = `import '${rawName}/subpath'`
    const start = code.indexOf("'") + 1

    expect(findNpmPackages(code)).toStrictEqual([
      {
        name,
        start,
        end: start + rawName.length,
        loc: {
          start: { line: 1, column: start, index: start },
          end: {
            ...end,
            index: start + rawName.length,
          },
        },
      },
    ])
  })

  it.each([
    [String.raw`lo\144ash`, 'lodash'],
    [String.raw`\146oo`, 'foo'],
    [String.raw`f\61`, 'f1'],
    [String.raw`f\615`, 'f15'],
    [String.raw`f\0615`, 'f15'],
  ])('tracks the raw range of legacy octal escapes in %j', (rawName, name) => {
    expect.assertions(1)
    const code = `require('${rawName}/subpath')`
    const start = code.indexOf("'") + 1
    const end = start + rawName.length

    expect(
      findNpmPackages(code, {
        sourceType: 'commonjs',
        startLine: 3,
        startColumn: 4,
        startIndex: 100,
      }),
    ).toStrictEqual([
      {
        name,
        start: start + 100,
        end: end + 100,
        loc: {
          start: { line: 3, column: start + 4, index: start + 100 },
          end: { line: 3, column: end + 4, index: end + 100 },
        },
      },
    ])
  })

  it.each([
    [
      "const f = (p = require('first')): import('second').T => require('third')",
      ['first', 'second', 'third'],
    ],
    [
      "const f = <T extends import('first').T>(p: import('second').T) => import('third')",
      ['first', 'second', 'third'],
    ],
    [
      "const f = (p = require('first')): import('first').T => require('third')",
      ['first', 'first', 'third'],
    ],
  ])(
    'returns arrow function dependencies in source order for %s',
    (code, names) => {
      expect.assertions(2)
      const packages = findNpmPackages(code, { language: 'ts' })

      expect(packages.map(pkg => pkg.name)).toStrictEqual(names)
      expect(packages.map(pkg => pkg.start)).toStrictEqual(
        Array.from(code.matchAll(/'[^']+'/gu), match => match.index + 1),
      )
    },
  )

  it.each([
    "require(('foo'))",
    "require(((('foo'))))",
    "(require)('foo')",
    "((require))((('foo')))",
    "import(('foo'))",
    "import(((('foo'))))",
  ])('finds dependencies through explicit parentheses in %s', code => {
    expect.assertions(2)
    const expected = findNpmPackages(code)

    expect(expected.map(pkg => pkg.name)).toStrictEqual(['foo'])
    expect(
      findNpmPackages(code, { createParenthesizedExpressions: true }),
    ).toStrictEqual(expected)
  })

  it('finds parenthesized imports with legacy import nodes', () => {
    expect.assertions(1)
    expect(
      findNpmPackages("import((('foo')))", {
        createImportExpressions: false,
        createParenthesizedExpressions: true,
      }).map(pkg => pkg.name),
    ).toStrictEqual(['foo'])
  })

  it.each(['require((packageName))', 'import((packageName))'])(
    'ignores non-literal sources inside parentheses in %s',
    code => {
      expect.assertions(1)
      expect(
        findNpmPackages(code, { createParenthesizedExpressions: true }),
      ).toStrictEqual([])
    },
  )

  it('preserves escaped ranges with parser offsets', () => {
    expect.assertions(1)
    const code = String.raw`import 'lo\u0064ash/fp'`
    expect(
      findNpmPackages(code, {
        startLine: 3,
        startColumn: 4,
        startIndex: 100,
      }),
    ).toMatchObject([
      {
        name: 'lodash',
        start: 108,
        end: 119,
        loc: {
          start: { line: 3, column: 12, index: 108 },
          end: { line: 3, column: 23, index: 119 },
        },
      },
    ])
  })

  it('does not reuse cached parser locations', () => {
    expect.assertions(1)
    const code = "import 'cached-package'"
    findNpmPackages(code, { cache: true })
    expect(
      findNpmPackages(code, {
        cache: true,
        startLine: 3,
        startColumn: 4,
        startIndex: 100,
      }),
    ).toMatchObject([
      {
        start: 108,
        end: 122,
        loc: {
          start: { line: 3, column: 12, index: 108 },
          end: { line: 3, column: 26, index: 122 },
        },
      },
    ])
  })

  it('does not reuse cached parses across languages', () => {
    expect.assertions(1)
    const code = "const foo: unknown = require('foo')"
    findNpmPackages(code, { cache: true, language: 'ts' })
    expect(() => findNpmPackages(code, { cache: true })).toThrow(SyntaxError)
  })

  it('keeps cached results independent of caller mutations', () => {
    expect.assertions(2)
    const code = "import 'cached-independent'"
    const first = findNpmPackages(code, { cache: true })
    const expected = structuredClone(first)
    first[0].name = 'changed'
    first[0].loc.start.line = 99
    expect(findNpmPackages(code, { cache: true })).toStrictEqual(expected)
    expect(findNpmPackages(code)).toStrictEqual(expected)
  })

  it('rejects disabled locations explicitly', () => {
    expect.assertions(1)
    expect(() => findNpmPackages("import 'foo'", { locations: false })).toThrow(
      'locations: false is not supported',
    )
  })

  it('rejects the estree plugin explicitly', () => {
    expect.assertions(1)
    expect(() =>
      findNpmPackages("import 'foo'", { plugins: ['estree'] }),
    ).toThrow('The estree parser plugin is not supported')
  })

  it.each([
    ["import('foo')", ['foo']],
    ["import('@foo/bar/subpath')", ['@foo/bar']],
    ["import('./local')", []],
    ['import(packageName)', []],
    [`import(\`foo/\${name}\`)`, []],
  ])('handles dynamic import source %s', (code, names) => {
    expect.assertions(1)
    expect(findNpmPackages(code).map(({ name }) => name)).toStrictEqual(names)
  })

  it('basic', () => {
    expect.assertions(1)
    expect(findNpmPackages(`import findNpmPackages from 'find-npm-packages'`))
      .toMatchInlineSnapshot(`
      [
        {
          "end": 46,
          "loc": {
            "end": {
              "column": 46,
              "index": 46,
              "line": 1,
            },
            "start": {
              "column": 29,
              "index": 29,
              "line": 1,
            },
          },
          "name": "find-npm-packages",
          "start": 29,
        },
      ]
    `)
  })

  it('js', () => {
    expect.assertions(1)
    expect(
      findNpmPackages(FIXTURE_JS.replaceAll('\r\n', '\n'), {
        language: 'js',
      }),
    ).toMatchSnapshot()
  })

  it('ts', () => {
    expect.assertions(1)
    expect(
      findNpmPackages(FIXTURE_TS.replaceAll('\r\n', '\n'), {
        language: 'ts',
      }),
    ).toMatchSnapshot()
  })

  it('dts', () => {
    expect.assertions(1)
    expect(
      findNpmPackages(FIXTURE_DTS.replaceAll('\r\n', '\n'), {
        language: 'dts',
      }),
    ).toMatchSnapshot()
  })

  it('jsx', () => {
    expect.assertions(1)
    expect(
      findNpmPackages(FIXTURE_JSX.replaceAll('\r\n', '\n'), {
        language: 'jsx',
      }),
    ).toMatchSnapshot()
  })
})
