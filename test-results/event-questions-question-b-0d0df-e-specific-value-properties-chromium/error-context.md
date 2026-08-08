# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: event-questions.spec.ts >> question builder CRUD, validation, and type properties >> persists representative type-specific value properties
- Location: e2e\event-questions.spec.ts:195:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://127.0.0.1:3100/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://127.0.0.1:3100/login"

```

```yaml
- banner:
  - link "⚡ EventKH":
    - /url: /
  - navigation:
    - link "📅 Browse Events":
      - /url: /events
    - link "🤝 Matchmaking":
      - /url: /matchmaking
    - link "Log in":
      - /url: /login
    - link "🚀 Sign up":
      - /url: /register
    - button "Select language":
      - img "English"
      - text: English ▼
- text: ⚡ EventKH
- heading "Welcome back to Cambodia's event platform" [level=1]
- paragraph: Sign in to manage your events, view participants, and scan QR check-ins.
- text: 🎟️ Issue QR tickets in minutes 📊 Real-time attendee dashboard 🎫 Branded badge generation 📲 Instant QR check-in scanning
- heading "Sign in to your account" [level=2]
- paragraph:
  - text: Or
  - link "create a new account":
    - /url: /register
- text: Email address
- textbox "Email address":
  - /placeholder: you@example.com
  - text: playwright-1786165701741-20fxv1@example.test
- text: Password
- textbox "Password":
  - /placeholder: ••••••••
  - text: EventKH-test-123!
- button "Signing in..." [disabled]
- text: Don't have an account?
- link "Sign up free →":
  - /url: /register
- alert
```

# Test source

```ts
  1  | import { test as base, expect, type Page } from "@playwright/test";
  2  | 
  3  | export const ORGANIZER_PASSWORD = process.env.TEST_ORGANIZER_PASSWORD ?? "EventKH-test-123!";
  4  | 
  5  | type OrganizerFixtures = {
  6  |   organizer: { email: string; password: string };
  7  |   eventPage: Page;
  8  | };
  9  | 
  10 | export const test = base.extend<OrganizerFixtures>({
  11 |   organizer: async ({ request }, provide) => {
  12 |     const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  13 |     const email = process.env.TEST_ORGANIZER_EMAIL ?? `playwright-${runId}@example.test`;
  14 |     const response = await request.post("/api/register", {
  15 |       data: { name: "Playwright Organizer", email, password: ORGANIZER_PASSWORD, role: "ORGANIZER" },
  16 |     });
  17 |     expect(response.ok()).toBeTruthy();
  18 |     await provide({ email, password: ORGANIZER_PASSWORD });
  19 |   },
  20 |   eventPage: async ({ page, organizer }, provide) => {
  21 |     await page.goto("/login");
  22 |     await page.getByLabel(/email/i).fill(organizer.email);
  23 |     await page.getByLabel(/password/i).fill(organizer.password);
  24 |     await page.getByRole("button", { name: /sign in/i }).click();
> 25 |     await expect(page).toHaveURL(/\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  26 |     await page.goto("/dashboard/events/new");
  27 |     await provide(page);
  28 |   },
  29 | });
  30 | 
  31 | export { expect };
  32 | 
```