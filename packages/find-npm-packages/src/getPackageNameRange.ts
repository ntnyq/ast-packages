import type { StringLiteral } from '@babel/types'
import type { NpmPackage } from './types'

const RE_STRING_CHARACTER =
  /\\(?:u\{[\da-f]+\}|u[\da-f]{4}|x[\da-f]{2}|\r\n|[\s\S])|[^\\]/giu
const RE_LINE_CONTINUATION = /^\\(?:\r\n|[\n\r\u2028\u2029])$/u
const RE_LINE_BREAK = /\r\n|[\n\r\u2028\u2029]/gu

/**
 * Maps a decoded npm package name back to its raw string-literal range.
 * Valid npm names contain only ASCII characters, so every non-continuation
 * token contributes one character even when it is escaped in the source.
 *
 * @param literal - Babel string literal with its original raw source
 * @param name - Decoded and validated npm package name
 * @returns The raw package-name range, if source metadata is available
 */
export function getPackageNameRange(
  literal: StringLiteral,
  name: string,
): Omit<NpmPackage, 'name'> | undefined {
  const rawLiteral = literal.extra?.raw
  if (
    typeof literal.start !== 'number' ||
    !literal.loc ||
    typeof rawLiteral !== 'string'
  ) {
    return
  }

  const start = literal.start + 1
  const raw = rawLiteral.slice(1, -1)
  let decodedLength = 0
  for (const token of raw.matchAll(RE_STRING_CHARACTER)) {
    if (!RE_LINE_CONTINUATION.test(token[0])) {
      decodedLength++
    }
    if (decodedLength === name.length) {
      const rawName = raw.slice(0, token.index + token[0].length)
      let line = literal.loc.start.line
      let column = literal.loc.start.column + 1 + rawName.length
      for (const lineBreak of rawName.matchAll(RE_LINE_BREAK)) {
        line++
        column = rawName.length - lineBreak.index - lineBreak[0].length
      }
      return {
        start,
        end: start + rawName.length,
        loc: {
          start: {
            line: literal.loc.start.line,
            column: literal.loc.start.column + 1,
            index: start,
          },
          end: { line, column, index: start + rawName.length },
        },
      }
    }
  }
}
