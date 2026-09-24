# leboncoin messaging — frontend technical test

A responsive messaging interface where a user can browse their conversations, read and send messages, and start new conversations. It keeps working when the network or the API does not.

Built with React 19, TypeScript, Vite, TanStack Query, React Router, Zod, axios and Tailwind CSS. The interface is in French.

## Features

| Requirement                                | Status                                                        |
| ------------------------------------------ | ------------------------------------------------------------- |
| List all conversations of the logged user  | ✅ Sorted by most recent message                              |
| Select a conversation and see its messages | ✅ Chronological, grouped by day, kept scrolled to the newest |
| Send messages                              | ✅ Shown immediately, with retry and delete if sending fails  |
| Works on desktop and mobile                | ✅ Side by side on desktop, one pane at a time on mobile      |
| Robust safety guards                       | ✅ See [Safety guards](#safety-guards)                        |
| **Bonus 1**: create conversations          | ✅ User search, no duplicate conversations                    |
| **Bonus 2**: shaky infrastructure          | ✅ Retries, automatic recovery, offline mode, clear messages  |
| Performance, accessibility, tests          | ✅ See the dedicated sections                                 |

## Getting started

**Requirements:** Node.js 24 (see [.nvmrc](.nvmrc)), and the [technical test repository](https://github.com/leboncoin/frontend-technical-test), which provides the mock API.

```bash
# 1. Start the API (json-server on http://localhost:3005), from the technical test repository
npm install
npm run start-server

# 2. Start the app (http://localhost:5173), from this repository
cp .env.example .env
npm install
npm run dev
```

There is no authentication in the exercise: the logged user is hard-coded in [src/lib/getLoggedUserId.ts](src/lib/getLoggedUserId.ts).

### Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start the development server        |
| `npm run build`        | Type-check and build for production |
| `npm run preview`      | Serve the production build          |
| `npm test`             | Run the test suite once             |
| `npm run test:watch`   | Run tests in watch mode             |
| `npm run typecheck`    | Type-check the project              |
| `npm run lint`         | Lint the project                    |
| `npm run format`       | Format the project with Prettier    |
| `npm run format:check` | Check the formatting                |

### Environment variables

| Variable                      | Default                 | Description                                                                              |
| ----------------------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `VITE_API_URL`                | `http://localhost:3005` | Base URL of the API                                                                      |
| `VITE_SIMULATED_FAILURE_RATE` | `0`                     | **Development only.** Share of requests (0 to 1) that fail with a simulated 503 response |

## Architecture

### Stack

| Concern      | Choice                                | Why                                                                                                            |
| ------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Build        | Vite + React 19 + TypeScript (strict) | Fast feedback loop. The app is a client-side SPA, so server rendering brings nothing here                      |
| Server state | TanStack Query                        | Caching, retries, polling, cancellation, offline pause and resume, and mutation state in one tool              |
| HTTP         | axios                                 | One configured instance (base URL, timeout, headers) with interceptors as extension points                     |
| Validation   | Zod                                   | Every API response is validated at runtime. Types are inferred from the schemas, so they are defined only once |
| Routing      | React Router                          | URL-driven navigation, lazy-loaded routes and route-level error boundaries                                     |
| Styling      | Tailwind CSS v4                       | Mobile-first utilities, design tokens in CSS, no runtime cost                                                  |
| Tests        | Vitest, Testing Library, MSW          | Tests go through the real components, hooks and HTTP client. Only the network is mocked                        |

### Folder structure

```
src/
├── app/            # App shell: providers, route definitions, responsive layout
├── pages/          # Thin route components (validate params, compose features), lazy-loaded
├── features/       # Business logic and UI, grouped by domain
│   ├── conversations/    # conversation list, single conversation, locally created conversations
│   ├── newConversation/  # user search and conversation creation
│   ├── messages/         # message list, composer, sending
│   └── connection/       # offline and API health banner
├── services/       # API layer, no React code: HTTP client + one folder per resource (service + schema)
├── components/     # Generic UI: avatar, buttons, links, spinner, empty and error states, error boundary
├── context/        # Logged user
├── lib/            # Pure helpers: dates, error messages, query client
└── test/           # Test setup, fixtures, MSW handlers and in-memory database
```

Dependencies only go one way:

```
pages → features (components → hooks) → services → httpClient → API
```

- Each folder exposes its public API through an `index.ts` (`@/services`, `@/features/messages`…). An ESLint rule forbids deep imports from other folders, so a folder's internals can change without breaking its users.
- Inside a folder, files import each other with relative paths, which avoids circular imports through the index.
- `pages/` has no index on purpose: pages are loaded with `import()`, and a shared index would pull every page into the main bundle.
- Components never call services directly, and services know nothing about React. Each layer can be tested and replaced on its own.
- One component per file, and each component has a single `return`: loading, error, empty and loaded states are conditions inside it, so its whole output reads in one place.

### Routing and responsive layout

| URL                  | Content                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `/`                  | Conversation list (+ "Sélectionnez une conversation" on desktop) |
| `/conversations/:id` | Conversation                                                     |
| `/conversations/new` | New conversation                                                 |
| `*`                  | Not found page                                                   |

The URL, not component state, decides which pane is visible. On mobile, the list and the conversation are shown one at a time with a back button. From the `md` breakpoint, both are shown side by side. Refreshing the page or using the browser's back button always shows the right screen.

## Key decisions

1. **Validate at the boundary.** The HTTP client validates every response with a Zod schema, and turns every failure into a typed `ApiError` (`http`, `network`, `timeout`, `invalid-response`). Malformed data shows an error state instead of crashing a component further down.
2. **Retry only what can succeed.** Queries retry up to 3 times, and only for 5xx responses, network errors and timeouts. Client errors and invalid responses are never retried. Mutations are never retried automatically, so a message is never sent twice without the user deciding.
3. **Outgoing messages live in the mutation cache.** Messages are polled every 5 seconds, and each poll replaces the query cache, which would erase messages that are not confirmed yet. Pending and failed messages are therefore read from TanStack Query's mutation cache (`useMutationState`). Each keeps its own status (sending, waiting for connection, failed) and survives navigating away and back.
4. **Guard against races.** Before a newly sent message or conversation is written into the cache, in-flight fetches are cancelled. Otherwise a fetch started before the request finished could overwrite the new item.
5. **Only open your own conversations.** A conversation is looked up in the user's own list, which is already cached. Its messages are only requested once it is found there. Changing the id in the URL shows "Conversation introuvable" instead of loading someone else's messages.
6. **Polling instead of WebSockets.** The API has no real-time channel. Polling pauses automatically when the tab is hidden. With a real backend, WebSockets or server-sent events would replace it.

## API quirks found and how they are handled

Each quirk was checked against the real json-server.

| Quirk                                                                                                                                                                                     | Handling                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The conversations middleware loads `db.json` once with `require()`, so **a created conversation is saved to disk but not returned by `GET /conversations/:id` until the server restarts** | Created conversations are stored in `localStorage` for the current user, validated with Zod when read, and merged into every fetch until the server returns them. They survive refetches and page reloads |
| `POST` bodies in the specification lack fields other endpoints rely on (`authorId`, `conversationId`, nicknames), and json-server stores the body as is                                   | The client sends complete objects, and only relies on the `{ id }` guaranteed by the specification in the response                                                                                        |
| `GET /user/:id` is rewritten to `/users?id=:id` and returns an array instead of an object                                                                                                 | The service accepts both shapes                                                                                                                                                                           |
| Timestamps are Unix **seconds**. The specification types message timestamps as strings, the data uses numbers                                                                             | Both are accepted and turned into numbers in one schema                                                                                                                                                   |
| A 404 means "no conversations" or "no messages"                                                                                                                                           | Treated as an empty list                                                                                                                                                                                  |
| The API returns every user's **token**                                                                                                                                                    | Dropped by the user schema, so credentials never reach client state                                                                                                                                       |

## Resilience (Bonus 2)

- **Separate error states:** the conversation list, the conversation and the messages each fail on their own, with a message the user can understand and a "Réessayer" button.
- **API health banner:** as soon as a request fails with an error that may go away, a banner reassures the user while retries run in the background. Failed requests are tried again every 15 seconds, and the banner disappears once the API answers again. Client errors (4xx) do not show it.
- **Offline mode:** a banner appears when the connection is lost. Messages written offline show "En attente de connexion…" and are sent automatically when the connection comes back.
- **Failed messages:** a message that could not be sent stays in the conversation with **Renvoyer** and **Supprimer** actions.
- **Error boundaries:** an unexpected crash only replaces the affected page. When a new deployment makes a lazy-loaded file unavailable, the user is invited to reload to get the latest version.

**Try it:** set `VITE_SIMULATED_FAILURE_RATE=0.3` in `.env` and restart `npm run dev`. About 30% of requests will fail with a 503 before reaching the network. To test offline mode, use the "Offline" option in the browser's developer tools. The simulation only exists in development builds, and tests always turn it off.

## Safety guards

- Every API response is validated at runtime, and so are route parameters: `/conversations/abc` shows a not found state without calling the API.
- Message text is trimmed, never empty, and limited to 1000 characters in the interface. The service validates it again before sending.
- Message text is rendered as text by React. There is no `dangerouslySetInnerHTML`, so a message cannot inject a script.
- Requests time out after 10 seconds, and are cancelled when the user navigates away.
- No duplicate sends: mutations are not retried automatically, and the input is cleared on submit. When creating a conversation, the buttons are disabled while the request runs, and an existing conversation is opened instead of creating a duplicate.
- Tokens returned by the API are removed from parsed data.
- Values read from `localStorage` are validated, and every access is wrapped, so corrupted or unavailable storage cannot crash the app.

## Accessibility

- The page language is French (`lang="fr"`), so screen readers use a French voice.
- Semantic structure: one `<h1>` in the app layout, landmarks (`header`, labelled `aside`, `main`), lists, `<time dateTime>` for dates, and a title for every page.
- A "Aller au contenu principal" skip link, and visible focus styles on every interactive element.
- The message list is a `role="log"` live region, so new messages are announced. Each message starts with its author for screen readers ("Vous : …", "Jeremie : …").
- Connection changes, errors and the characters-left counter are announced with live regions. Icon-only buttons have accessible names.
- Keyboard: Enter sends, Shift+Enter adds a new line. Enter is ignored while an input method editor is composing text (Chinese, Japanese…).
- On desktop, the message input is focused when a conversation opens. It is not done on mobile, where it would open the keyboard.

## Performance

- The conversation and new conversation pages are loaded on demand: 3.5 kB and 1.7 kB gzipped.
- Data is cached and shared between screens: opening a conversation from the list makes no extra request for its header.
- Polling pauses in hidden tabs. A poll that returns the same data keeps the same objects, so memoised work such as grouping messages by day is not redone. Data stays fresh for 30 seconds before it is fetched again when the window regains focus.
- Date formatters are created once, and derived data (sorting, grouping by day) is memoised or computed in TanStack Query's `select`.
- The main bundle is 155 kB gzipped. The application code is about 2% of it: most of it is React DOM, Zod, React Router and axios.

## Testing

116 tests in 18 files. Run them with `npm test`.

- **Service tests** cover the HTTP client (success, 4xx, 5xx, network error, timeout, invalid JSON, schema mismatch, cancellation) and each service.
- **Integration tests** render the real routes and providers at a given URL, and interact like a user does, by role and accessible name. They cover the conversation list, the conversation view, sending (including failure, retry and sending offline), conversation creation, the not found pages and the connection banner.
- **MSW** mocks the network with an in-memory database that behaves like json-server and is reset after each test. A request without a handler fails the test.
- Tests run in the UTC time zone, so date assertions pass on every machine.
- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs type-check, lint, formatting check, tests and build on every pull request and on every push to `main`.

## Limitations and next steps

- **Authentication:** the logged user is hard-coded. With real authentication, the token would be added by an axios interceptor, and the user would come from a session endpoint.
- **Real-time:** replace polling with WebSockets or server-sent events.
- **Long histories:** paginate messages (`useInfiniteQuery`) and virtualise the list.
- **Idempotency:** if a send times out after the server saved the message, retrying creates a duplicate. An idempotency key handled by the server would prevent it.
- **Last message timestamp:** the API does not update a conversation's `lastMessageTimestamp` when a message is sent, so the list order only changes when the server does.
- **Internationalisation:** texts are written in French directly in the components. An i18n library would be the next step to support other languages.
- **Colour contrast:** the own-message bubble (`#2196f3` with white text) is below the WCAG AA contrast ratio and should be darkened.
- **Bundle size:** Zod's `zod/mini` build would save about 10 kB gzipped, at the cost of slightly less readable schemas.
- **Tests:** some helpers (date formatting, error messages) and components are only covered through the integration tests. End-to-end tests (Playwright) against the real API would complete the CI workflow.

## Time spent

_To be filled in._
