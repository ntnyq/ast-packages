declare module 'validate-npm-package-name' {
  interface Results {
    validForNewPackages: boolean
    validForOldPackages: boolean
    errors?: string[] | undefined
    warnings?: string[] | undefined
  }

  interface ValidNames extends Results {
    validForNewPackages: true
    validForOldPackages: true
  }

  interface InvalidNames extends Results {
    errors: string[]
    validForNewPackages: false
    validForOldPackages: false
  }

  interface LegacyNames extends Results {
    validForNewPackages: false
    validForOldPackages: true
    warnings: string[]
  }

  declare function validate(
    name: string,
  ): InvalidNames | LegacyNames | ValidNames

  export = validate
}
