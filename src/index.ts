import { babelParse, walkAST } from 'ast-kit'
import validateNpmPackageName from 'validate-npm-package-name'
import type { NpmPackage, Options } from './types'

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

  function isNpmPackageName(name: string) {
    const result = validateNpmPackageName(name)
    return result.validForNewPackages || result.validForOldPackages
  }

  walkAST(program, {
    enter(node) {
      if (
        node.type === 'ImportDeclaration'
        && isNpmPackageName(node.source.value)
      ) {
        packages.push({
          end: node.source.end,
          name: node.source.value,
          start: node.source.start,
          loc: {
            end: node.source.loc?.end,
            start: node.source.loc?.start,
          },
        })
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
          && isNpmPackageName(node.arguments[0].value)
        ) {
          packages.push({
            end: node.arguments[0].end,
            name: node.arguments[0].value,
            start: node.arguments[0].start,
            loc: {
              end: node.arguments[0].loc?.end,
              start: node.arguments[0].loc?.start,
            },
          })
        }
      }
    },
  })

  return packages
}
