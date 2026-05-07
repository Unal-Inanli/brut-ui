// Local config so this package isn't ruled by the repo-root vitest.config.js
// (which scopes test discovery to tests/unit/**). Mcp's smoke tests live in
// packages/mcp/test/, so we override the include pattern here.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});
