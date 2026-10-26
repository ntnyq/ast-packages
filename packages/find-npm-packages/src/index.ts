// oxlint-disable-next-line import/no-nodejs-modules -- Package discovery needs Node's built-in module list.
import { isBuiltin } from 'node:module'
import type * as t from '@babel/types'
import { babelParse, walkAST } from 'ast-kit'
import validateNpmPackageName from 'validate-npm-package-name'
import { getPackageNameRange } from './getPackageNameRange'
import type { NpmPackage, Options } from './types'

export type { NpmPackage, Options } from './types'

const RE_PACKAGE_NAME = /^(?:@[^/]+\/[^/@]+|[^/@]+)/u
const MAX_CACHE_SIZE = 100
const PARSE_CACHE = new Map<string, ReturnType<typeof babelParse>>()

function unwrapParenthesizedExpression(node: t.Node): t.Node {
  let expression = node
  while (expression.type === 'ParenthesizedExpression') {
    expression = expression.expression
  }
  return expression
}

function getValidNpmPackageName(importString: string) {
  const match = importString.match(RE_PACKAGE_NAME)

  if (match) {
    const name = match[0]
    if (isBuiltin(importString) || isBuiltin(name)) {
      return
    }
    const result = validateNpmPackageName(name)

    if (result.validForNewPackages || result.validForOldPackages) {
      return name
    }
  }
}

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
  const { language = 'js', cache = false, ...parserOptions } = options
  if (parserOptions.locations === false) {
    throw new TypeError('locations: false is not supported')
  }
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
  const packages: NpmPackage[] = []

  function checkNpmPackageName(node: t.Node) {
    const stringLiteral = unwrapParenthesizedExpression(node)
    if (stringLiteral.type !== 'StringLiteral') {
      return
    }
    const name = getValidNpmPackageName(stringLiteral.value)

    if (!name) {
      return
    }

    const range = getPackageNameRange(stringLiteral, name)
    if (range) {
      packages.push({ name, ...range })
    }
  }

  walkAST(program, {
    enter(node) {
      if (node.type === 'ImportDeclaration') {
        checkNpmPackageName(node.source)
      }

      if (
        (node.type === 'ExportNamedDeclaration' ||
          node.type === 'ExportAllDeclaration') &&
        node.source
      ) {
        checkNpmPackageName(node.source)
      }

      if (node.type === 'TSImportType') {
        checkNpmPackageName(node.source)
      }

      if (node.type === 'TSExternalModuleReference') {
        checkNpmPackageName(node.expression)
      }

      if (node.type === 'ImportExpression') {
        checkNpmPackageName(node.source)
      }

      if (node.type === 'CallExpression') {
        const callee = unwrapParenthesizedExpression(node.callee)
        const isImportExpression = callee.type === 'Import'
        const isRequireExpression =
          callee.type === 'Identifier' && callee.name === 'require'

        if ((isImportExpression || isRequireExpression) && node.arguments[0]) {
          checkNpmPackageName(node.arguments[0])
        }
      }
    },
  })

  // Babel's AST property order can differ from source order.
  return packages.toSorted(
    (left, right) => left.loc.start.index - right.loc.start.index,
  )
}
