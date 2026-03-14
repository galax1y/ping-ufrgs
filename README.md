# ping-ufrgs

A [Next.js](https://nextjs.org) project.

## Table of Contents

1. [Requirements](#requirements)
2. [Getting Started](#getting-started)
3. [Database Schema](#database-schema)
4. [End-to-End Testing with Playwright](#end-to-end-testing-with-playwright)
5. [Documentation](#documentation)

## Requirements

- Node.js version 24
- `.env` file with the `DATABASE_URL` variable

## Getting Started

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

If everything is correctly installed, you can run:
```bash
npm run test:e2e
```

- Safari browser emulation won't work properly on weird Linux distros -> the ones that don't use apt-get (probably) rip arch

## Documentation

- [Next.js](https://nextjs.org) - Next.js is the main React framework
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Playwright](https://playwright.dev/docs/intro) - End-to-end testing framework

