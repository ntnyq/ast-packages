import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: ['node:module'],
  },
  dts: {
    compilerOptions: {
      isolatedDeclarations: true,
    },
  },
  entry: ['src/index.ts'],
  platform: 'neutral',
})
