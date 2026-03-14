# ping-ufrgs

A [Next.js](https://nextjs.org) project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Database Schema](#database-schema)
3. [End-to-End Testing with Playwright](#end-to-end-testing-with-playwright)
4. [Node.js Version](#nodejs-version)
5. [Documentation](#documentation)

## Getting Started

This project requires Node.js version 24. Please ensure you have the correct version installed.

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ping-ufrgs
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

To pull the schema from Supabase:

```bash
npx drizzle-kit pull
```

## End-to-End Testing with Playwright

To run end-to-end tests, ensure Playwright is installed on your machine. Use the following commands:

```bash
npx playwright install
npx playwright test
```

## Documentation

- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
