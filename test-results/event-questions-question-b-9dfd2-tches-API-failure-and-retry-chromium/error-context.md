# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: event-questions.spec.ts >> question builder CRUD, validation, and type properties >> handles toolbox search, no matches, API failure, and retry
- Location: e2e\event-questions.spec.ts:237:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://127.0.0.1:3100/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    11 × locator resolved to <html lang="en">…</html>
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
  - text: playwright-1786165701723-n8q1xh@example.test
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

```
Tearing down "context" exceeded the test timeout of 30000ms.
```