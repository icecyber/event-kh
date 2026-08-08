# EventKH

EventKH is a Next.js application for creating events, tickets, custom registration fields, registrations, and attendee check-ins.

## Development setup

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000` by default. Configure the database and NextAuth in `.env` or `.env.local` using `.env.example` as a template:

```env
DATABASE_URL="file:./dev.db"
DATABASE_AUTH_TOKEN=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Use an isolated database for tests. Do not point automated tests at a production/Turso database or a shared development database.

## Existing tests

Run the unit/component test suite with:

```bash
npm test
```

Use watch mode while developing:

```bash
npm run test:watch
```

## Entity-creation smoke test

`scripts/entity-creation-test.mjs` exercises the creation workflow through the running HTTP application:

1. Creates a unique organizer account.
2. Authenticates through NextAuth.
3. Creates an event with a ticket and custom field.
4. Publishes the event.
5. Creates a guest registration and custom answer.
6. Looks up and checks in the registration.
7. Confirms duplicate registration is rejected with HTTP 409.

The script stops after a failed assertion, records the failure instead of throwing an unhandled error, prints a concise report, and exits with status `1` when any check fails.

### Setup and run

Start the application in one terminal:

```bash
npm run dev
```

Run the smoke test from the project directory in another terminal:

```bash
npm run test:entity-creation
```

Optional configuration:

| Variable | Default | Purpose |
| --- | --- | --- |
| `TEST_BASE_URL` | `http://localhost:3000` | Running EventKH URL |
| `TEST_ORGANIZER_EMAIL` | Unique generated test email | Organizer email; use a unique value for each run |
| `TEST_ORGANIZER_PASSWORD` | `EventKH-test-123!` | Password used when creating the test organizer |
| `TEST_REPORT_PATH` | No file | Writes a JSON report to this path when set |

PowerShell example:

```powershell
$env:TEST_BASE_URL = "http://localhost:3000"
$env:TEST_REPORT_PATH = "reports/entity-creation.json"
npm run test:entity-creation
```

The script requires a reachable application, a working database schema, and the NextAuth credentials provider. It creates test records in the configured database; use a disposable test database and remove the generated test records afterward if the database is persistent.

## Production build

```bash
npm run build
npm run start
```
