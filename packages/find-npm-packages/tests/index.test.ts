import { describe, expect, it } from 'vitest'
import { findNpmPackages } from '../src'
import FIXTURE_DTS from './fixtures/dts.d.ts?raw'
import FIXTURE_JS from './fixtures/js.js?raw'
import FIXTURE_JSX from './fixtures/jsx.jsx?raw'
import FIXTURE_TS from './fixtures/ts.ts?raw'

describe('find-npm-packages', () => {
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
