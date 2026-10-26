import { describe, expect, it } from 'vitest'
import { findRegExpLiterals } from '../src'

describe('find-regexp-literals', () => {
  it('returns the pattern, flags and source location', () => {
    expect.assertions(1)
    expect(findRegExpLiterals('/foo/gi')).toMatchObject([
      {
        pattern: 'foo',
        flags: 'gi',
        start: 0,
        end: 7,
        loc: {
          start: { line: 1, column: 0, index: 0 },
          end: { line: 1, column: 7, index: 7 },
        },
      },
    ])
  })

  it.each([
    ['/foo/', 'foo', ''],
    ['/(?:)/', '(?:)', ''],
    [String.raw`/foo\/bar/g`, String.raw`foo\/bar`, 'g'],
    [String.raw`/\d+\s\w/u`, String.raw`\d+\s\w`, 'u'],
    ['/[a-z/]+/i', '[a-z/]+', 'i'],
    [String.raw`/\p{Letter}+/u`, String.raw`\p{Letter}+`, 'u'],
    ['/foo/dgimsuy', 'foo', 'dgimsuy'],
    [
      String.raw`/[\p{ASCII}&&\p{Letter}]/v`,
      String.raw`[\p{ASCII}&&\p{Letter}]`,
      'v',
    ],
  ])('preserves the pattern and flags of %s', (code, pattern, flags) => {
    expect.assertions(1)
    expect(findRegExpLiterals(code)).toMatchObject([{ pattern, flags }])
  })

  it('finds nested literals in source order', () => {
    expect.assertions(1)
    const code = `
      function match(value) {
        return /foo/.test(value) ? [/bar/g] : { fallback: /baz/i }
      }
    `

    expect(findRegExpLiterals(code)).toMatchObject([
      { pattern: 'foo', flags: '' },
      { pattern: 'bar', flags: 'g' },
      { pattern: 'baz', flags: 'i' },
    ])
  })

  it('preserves repeated literals', () => {
    expect.assertions(1)
    expect(findRegExpLiterals('[/foo/g, /foo/i, /foo/g]')).toMatchObject([
      { pattern: 'foo', flags: 'g', start: 1, end: 7 },
      { pattern: 'foo', flags: 'i', start: 9, end: 15 },
      { pattern: 'foo', flags: 'g', start: 17, end: 23 },
    ])
  })

  it.each([
    '',
    '   \n',
    'const value = 42',
    "const value = '/foo/g'",
    'const value = `/foo/g`',
    '// /foo/g\n/* /bar/i */',
    'const value = 12 / 3 / 2',
    "const value = new RegExp('foo', 'g')",
    "const value = RegExp('foo', 'g')",
  ])('returns no literals for %j', code => {
    expect.assertions(1)
    expect(findRegExpLiterals(code)).toStrictEqual([])
  })

  it('finds literals inside template expressions', () => {
    expect.assertions(1)
    const code = `\`result: \${/foo/g.test(value)}\``

    expect(findRegExpLiterals(code)).toMatchObject([
      { pattern: 'foo', flags: 'g' },
    ])
  })

  it.each([
    ['\n', 13],
    ['\r\n', 14],
  ])('tracks locations with line ending %j', (lineEnding, start) => {
    expect.assertions(1)
    expect(
      findRegExpLiterals(`// comment${lineEnding}  /foo/gi`),
    ).toMatchObject([
      {
        pattern: 'foo',
        flags: 'gi',
        start,
        end: start + 7,
        loc: {
          start: { line: 2, column: 2, index: start },
          end: { line: 2, column: 9, index: start + 7 },
        },
      },
    ])
  })

  it('parses TypeScript source', () => {
    expect.assertions(1)
    expect(
      findRegExpLiterals('const pattern: RegExp = /foo/g', { language: 'ts' }),
    ).toMatchObject([{ pattern: 'foo', flags: 'g' }])
  })

  it('parses JSX expressions', () => {
    expect.assertions(1)
    expect(
      findRegExpLiterals('const view = <div>{/foo/i.test(value)}</div>', {
        language: 'jsx',
      }),
    ).toMatchObject([{ pattern: 'foo', flags: 'i' }])
  })

  it('parses declaration files without literals', () => {
    expect.assertions(1)
    expect(
      findRegExpLiterals('declare const pattern: RegExp', { language: 'dts' }),
    ).toStrictEqual([])
  })

  it('forwards parser location options', () => {
    expect.assertions(1)
    expect(
      findRegExpLiterals('/foo/g', {
        startLine: 3,
        startColumn: 4,
        startIndex: 10,
      }),
    ).toMatchObject([
      {
        pattern: 'foo',
        flags: 'g',
        start: 10,
        end: 16,
        loc: {
          start: { line: 3, column: 4, index: 10 },
          end: { line: 3, column: 10, index: 16 },
        },
      },
    ])
  })

  it.each(['const =', '/foo', '/foo/gg'])(
    'throws for invalid source %s',
    code => {
      expect.assertions(1)
      expect(() => findRegExpLiterals(code)).toThrow(SyntaxError)
    },
  )
})
