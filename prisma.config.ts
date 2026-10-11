import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:sinna_secret_2026@localhost:5433/sinna_dental_db?schema=public',
  },
});
