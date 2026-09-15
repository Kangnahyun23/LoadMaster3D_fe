import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

/**
 * Hai project dùng chung alias `@/` của Vite:
 * - unit: domain và logic thuần, môi trường node, nhanh.
 * - dom: component React qua React Testing Library, file `*.dom.test.tsx`.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'dom',
            environment: 'jsdom',
            include: ['src/**/*.dom.test.tsx'],
            setupFiles: ['./src/test/setup-dom.ts'],
            // Benchmark domain chỉ chạy một lần, ở project unit (node). `include: []` bị coi là mặc định nên dùng exclude.
            benchmark: { exclude: ['**/*'] },
          },
        },
      ],
      benchmark: {
        include: ['tests/**/*.bench.ts', 'src/**/*.bench.ts'],
      },
    },
  }),
)
