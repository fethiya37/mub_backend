// import 'dotenv/config';
// import { defineConfig, env } from 'prisma/config';

// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   migrations: {
//     path: 'prisma/migrations',
//     seed: 'tsx prisma/seed/seed.ts',
//   },
//   datasource: {
//     url: env('DATABASE_URL'),
//   },
// });

// "@prisma/adapter-pg": "^7.2.0",

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
