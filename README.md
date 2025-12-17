# Atrium Jazz

A website that shows upcoming jazz concerts in select jazz clubs across NYC. Work in progress.

> This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Seed the Database

To seed the development database:

1. Ensure your database connection is configured in `.env`
2. Run the seed script:
```bash
node data/seed.js
```
or
```bash
npx prisma db seed
```

This will populate your database with initial test data. The seed script can be found in `prisma/seed.ts`.

## Reset the database

To reset the database, run the following command:

```bash 
npx prisma db push --force-reset
```

This will drop the existing database and create a new one.

## Update Prisma Schema

When making changes to your Prisma schema (`schema.prisma`), follow these steps:

1. Make your changes to `schema.prisma`

2. Push the schema changes to the database:
```bash
npx prisma db push --force-reset
```

3. Generate the new Prisma Client:
```bash
npx prisma generate
```

4. Restart Prisma Studio to see the new tables:
```bash
npx prisma studio
```

5. Restart the Next.js development server:
```bash
npm run dev
```

Note: Using `--force-reset` will drop your existing database. Make sure to back up any important data before running this command.

## Clear node_modules and reinstall dependencies

```bash
rm -rf node_modules
npm install
```

This can sometimes fix issues with the prism client, regenerate the client with

```bash
npx prisma generate
```

## Build locally

```bash
npx next build
```

## Run linter

```bash
npm run lint
```

## Reset the database using the script

```bash
./reset-db.sh
```

## Apply migration after updating schema file

```bash
npx prisma migrate dev --name your_migration_name
```

That's all you have to do.