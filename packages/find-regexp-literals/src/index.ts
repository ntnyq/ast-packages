import { babelParse, walkAST } from 'ast-kit'
import type { Options, RegExpLiteral } from './types'

export function findRegExpLiterals(
  code: string,
  options: Options = {},
): RegExpLiteral[] {
  const { language = 'js' } = options,
    program = babelParse(code, language, options),
    result: RegExpLiteral[] = []

  walkAST(program, {
    enter(node) {
      if (node.type === 'RegExpLiteral' || node.type === 'RegexLiteral') {
        result.push({
          end: node.end,
          flags: node.flags,
          pattern: node.pattern,
          start: node.start,
          loc: {
            ...node.loc,
          },
        })
      }
    },
  })

  return result
}
