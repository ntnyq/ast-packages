import { expect, it } from 'vitest'
import { findNpmPackages } from '../src'
import FIXTURE_DTS from './fixtures/dts.d.ts?raw'
import FIXTURE_JS from './fixtures/js.js?raw'
import FIXTURE_JSX from './fixtures/jsx.jsx?raw'
import FIXTURE_TS from './fixtures/ts.ts?raw'

it('basic', () => {
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
  expect(
    findNpmPackages(FIXTURE_JS.replaceAll('\r\n', '\n'), {
      language: 'js',
    }),
  ).toMatchSnapshot()
})

it('ts', () => {
  expect(
    findNpmPackages(FIXTURE_TS.replaceAll('\r\n', '\n'), {
      language: 'ts',
    }),
  ).toMatchSnapshot()
})

it('dts', () => {
  expect(
    findNpmPackages(FIXTURE_DTS.replaceAll('\r\n', '\n'), {
      language: 'dts',
    }),
  ).toMatchSnapshot()
})

it('jsx', () => {
  expect(
    findNpmPackages(FIXTURE_JSX.replaceAll('\r\n', '\n'), {
      language: 'jsx',
    }),
  ).toMatchSnapshot()
})
