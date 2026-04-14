import { defineConfig } from '@prisma/internals';

export default defineConfig({
  datasource: {
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL,
    },
  },
});
