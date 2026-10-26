import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: {
    compilerOptions: {
      isolatedDeclarations: true,
    },
  },
  entry: ['src/index.ts'],
  platform: 'neutral',
})
