import { babelParse, walkAST } from 'ast-kit'
import type { Options, RegExpLiteral } from './types'

export type { Options, RegExpLiteral } from './types'

const MAX_CACHE_SIZE = 100
const PARSE_CACHE = new Map<string, ReturnType<typeof babelParse>>()

/**
 * Finds regular expression literals, preserving their source order and ranges.
 *
 * @param code - Source code to parse
 * @param options - Language and Babel parser options
 * @returns Regular expression literals in source order
 */
export function findRegExpLiterals(
  code: string,
  options: Options = {},
): RegExpLiteral[] {
  const { language = 'js', cache = false, ...parserOptions } = options
  if (
    parserOptions.plugins?.some(
      plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === 'estree',
    )
  ) {
    throw new TypeError('The estree parser plugin is not supported')
  }

  // ast-kit's own cache ignores parser options, including source offsets.
  const cacheKey = cache ? JSON.stringify([code, language, parserOptions]) : ''
  const cachedProgram = cache ? PARSE_CACHE.get(cacheKey) : undefined
  const program = cachedProgram ?? babelParse(code, language, parserOptions)
  if (cache && !cachedProgram) {
    if (PARSE_CACHE.size >= MAX_CACHE_SIZE) {
      const oldestKey = PARSE_CACHE.keys().next().value
      if (oldestKey !== undefined) {
        PARSE_CACHE.delete(oldestKey)
      }
    }
    PARSE_CACHE.set(cacheKey, program)
  }
  const result: RegExpLiteral[] = []

  walkAST(program, {
    enter(node) {
      if (node.type === 'RegExpLiteral') {
        result.push({
          end: node.end,
          flags: node.flags,
          pattern: node.pattern,
          start: node.start,
          loc: node.loc
            ? {
                start: { ...node.loc.start },
                end: { ...node.loc.end },
              }
            : undefined,
        })
      }
    },
  })

  return result
}
