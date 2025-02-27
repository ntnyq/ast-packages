import { babelParse, walkAST } from 'ast-kit'
import validateNpmPackageName from 'validate-npm-package-name'
import type * as t from '@babel/types'
import type { NpmPackage, Options } from './types'

const RE_PACKAGE_NAME = /^(@[^/]+\/[^/@]+|[^/@]+)/

/**
 * Find npm packages from given source code.
 *
 * @param code - Code to parse
 * @param options - options
 * @returns An array of found npm packages
 *
 * @example
 *
 * ```ts
 * import { findNpmPackages } from 'find-npm-packages'
 *
 * const code = `import findNpmPackages from 'find-npm-packages'`
 *
 * const result = findNpmPackages(code)
 * ```
 */
export function findNpmPackages(
  code: string,
  options: Options = {},
): NpmPackage[] {
  const { language = 'js' } = options
  const program = babelParse(code, language, options)
  const packages: NpmPackage[] = []

  function getValidNpmPackageName(importString: string) {
    const match = importString.match(RE_PACKAGE_NAME)

    if (match) {
      const name = match[0]
      const result = validateNpmPackageName(name)

      if (result.validForNewPackages || result.validForOldPackages) {
        return name
      }
    }
  }

  function checkNpmPackageName(stringLiteral: t.StringLiteral) {
    const name = getValidNpmPackageName(stringLiteral.value)

    if (!name) return

    const start = stringLiteral.start
    const loc = stringLiteral.loc

    if (start && loc) {
      packages.push({
        end: start + name.length + 1,
        name,
        start: start + 1,
        loc: {
          end: {
            column: loc.start.column + name.length + 1,
            index: loc.start.index + name.length + 1,
            line: loc.start.line,
          },
          start: {
            column: loc.start.column + 1,
            index: loc.start.index + 1,
            line: loc.start.line,
          },
        },
      })
    }
  }

  walkAST(program, {
    enter(node) {
      if (node.type === 'ImportDeclaration') {
        checkNpmPackageName(node.source)
      }

      // NOTE: ImportExpression is not supported
      if (node.type === 'CallExpression') {
        const isImportExpression = node.callee.type === 'Import'
        const isRequireExpression =
          node.callee.type === 'Identifier' && node.callee.name === 'require'

        if (
          (isImportExpression || isRequireExpression)
          && node.arguments[0]
          && node.arguments[0].type === 'StringLiteral'
        ) {
          checkNpmPackageName(node.arguments[0])
        }
      }
    },
  })

  return packages
}
