# leboncoin messaging — frontend technical test

A responsive messaging interface where a user can browse their conversations, read and send messages, and start new conversations.

Built with React 19, TypeScript, Vite, TanStack Query, React Router, Zod, axios and Tailwind CSS.


## Getting started

**Requirements:** Node.js 24 (see [.nvmrc](.nvmrc)), and the [technical test repository](https://github.com/leboncoin/frontend-technical-test), which provides the mock API.

```bash
npm install
npm run start-server

cp .env.example .env
npm install
npm run dev
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check the project |
| `npm run lint` | Lint the project |

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3005` | Base URL of the API |

## Architecture

### Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build | Vite + React 19 + TypeScript (strict) | Fast feedback loop. The app is a client-side SPA, so server rendering brings nothing here |
| Server state | TanStack Query | Caching, retries, polling, cancellation and mutation state in one tool |
| HTTP | axios | One configured instance (base URL, timeout, headers) with interceptors as extension points |
| Validation | Zod | Every API response is validated at runtime. Types are inferred from the schemas, so they are defined only once |
| Routing | React Router | URL-driven navigation, lazy-loaded routes and route-level error boundaries |
| Styling | Tailwind CSS v4 | Mobile-first utilities, design tokens in CSS, no runtime cost |
| Tests | Vitest, Testing Library, MSW | Tests go through the real components, hooks and HTTP client. Only the network is mocked |

### Folder structure

```
src/
├── app/            # App shell: providers, route definitions, responsive layout
├── pages/          # Thin route components (validate params, compose features), lazy-loaded
├── features/       # Business logic and UI, grouped by domain
│   ├── conversations/    # conversation list and single conversation
│   ├── newConversation/  # user search and conversation creation
│   ├── messages/         # message list, composer, sending
│   └── connection/       # offline and API health banner
├── services/       # API layer, no React code: HTTP client + one folder per resource (service + schema)
├── components/     # Generic UI: avatar, spinner, empty and error states, error boundary
├── context/        # Logged user
├── lib/            # Pure helpers: dates, error messages, query client
└── test/           # Test setup, fixtures and MSW handlers
```

Dependencies only go one way:

```
pages → features (components → hooks) → services → httpClient → API
```

- Each folder exposes its public API through an `index.ts` (`@/services`, `@/features/messages`…). An ESLint rule forbids deep imports from other folders, so a folder's internals can change without breaking its users.
- Inside a folder, files import each other with relative paths, which avoids circular imports through the index.
- `pages/` has no index on purpose: pages are loaded with `import()`, and a shared index would pull every page into the main bundle.
- Components never call services directly, and services know nothing about React. Each layer can be tested and replaced on its own.

## Quality

- TypeScript in strict mode, with `noUnusedLocals` and `noUnusedParameters`.
- Tests run in the UTC time zone, so date assertions pass on every machine.
- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs type-check, lint, tests and build on every pull request and on every push to `main`.
