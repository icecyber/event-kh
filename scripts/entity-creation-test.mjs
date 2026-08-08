#!/usr/bin/env node

/**
 * Black-box smoke test for the application's resource-creation workflow.
 *
 * Flow: user -> authenticated event with nested ticket/custom field -> publish
 * -> guest registration -> organizer lookup/check-in.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import process from "node:process";

const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const password = process.env.TEST_ORGANIZER_PASSWORD || "EventKH-test-123!";
const reportPath = process.env.TEST_REPORT_PATH;
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = process.env.TEST_ORGANIZER_EMAIL || `entity-test-${runId}@example.test`;
const eventTitle = `Entity creation smoke test ${runId}`;

const cookies = new Map();
const results = [];

function rememberCookies(response) {
  const headers = response.headers;
  const values = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  for (const value of values) {
    const [pair] = value.split(";");
    const index = pair.indexOf("=");
    if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
}

function cookieHeader() {
  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const cookie = cookieHeader();
  if (cookie) headers.set("cookie", cookie);
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  rememberCookies(response);
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch { /* keep text */ }
  return { response, body };
}

function assertStep(name, condition, detail) {
  const result = { name, status: condition ? "passed" : "failed", detail };
  results.push(result);
  const mark = condition ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
  if (!condition) throw new Error(`${name}: ${detail || "assertion failed"}`);
}

async function run() {
  let event;
  let registration;
  try {
    const health = await request("/");
    assertStep("Application is reachable", health.response.status < 500, `HTTP ${health.response.status}`);

    const createdUser = await request("/api/register", {
      method: "POST",
      body: JSON.stringify({ name: "Entity Test Organizer", email, password, role: "ORGANIZER" }),
    });
    assertStep("Organizer account is created", createdUser.response.status === 200 || createdUser.response.status === 201, `HTTP ${createdUser.response.status}`);
    assertStep("Account response does not expose a password", !createdUser.body?.password, "password field absent");

    const csrf = await request("/api/auth/csrf");
    assertStep("NextAuth CSRF token is available", csrf.response.ok && typeof csrf.body?.csrfToken === "string", `HTTP ${csrf.response.status}`);

    const login = await request("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf.body.csrfToken, email, password, json: "true" }),
    });
    assertStep("Organizer can authenticate", login.response.status >= 200 && login.response.status < 400, `HTTP ${login.response.status}`);

    const eventResponse = await request("/api/events", {
      method: "POST",
      body: JSON.stringify({
        title: eventTitle,
        description: "Automated entity creation test",
        date: "2030-01-02T09:00:00.000Z",
        endDate: "2030-01-02T17:00:00.000Z",
        location: "Test venue",
        capacity: 10,
        ticketTypes: [{ name: "Test ticket", price: 25, quantityAvailable: 10 }],
        customFields: [{ label: "Company", fieldType: "text", required: true, order: 0 }],
      }),
    });
    event = eventResponse.body;
    assertStep("Event and nested resources are created", eventResponse.response.status === 201, `HTTP ${eventResponse.response.status}`);
    assertStep("Event has a generated slug", Boolean(event?.id && event?.slug));
    assertStep("Ticket type is persisted", event?.ticketTypes?.length === 1 && event.ticketTypes[0].name === "Test ticket");
    assertStep("Custom field is persisted", event?.customFields?.length === 1 && event.customFields[0].label === "Company");
    assertStep("New event starts unpublished", event?.isPublished === false);

    const publish = await request(`/api/events/${event.id}/publish`, { method: "POST" });
    assertStep("Event can be published", publish.response.ok && publish.body?.isPublished === true, `HTTP ${publish.response.status}`);

    const registrationResponse = await request(`/api/events/${event.id}/register`, {
      method: "POST",
      body: JSON.stringify({
        ticketTypeId: event.ticketTypes[0].id,
        guestName: "Entity Test Attendee",
        guestEmail: `attendee-${runId}@example.test`,
        answers: [{ customFieldId: event.customFields[0].id, fieldName: "Company", answerValue: "Test Co" }],
      }),
    });
    registration = registrationResponse.body;
    assertStep("Guest registration is created", registrationResponse.response.status === 201, `HTTP ${registrationResponse.response.status}`);
    assertStep("Registration is confirmed with a QR value", registration?.status === "CONFIRMED" && Boolean(registration?.qrCodeString));
    assertStep("Custom answer is persisted", registration?.customAnswers?.length === 1 && registration.customAnswers[0].answerValue === "Test Co");

    const lookup = await request(`/api/events/${event.id}/redeem`, {
      method: "POST",
      body: JSON.stringify({ registrationId: registration.id, lookupOnly: true }),
    });
    assertStep("Organizer can look up the registration", lookup.response.ok && lookup.body?.id === registration.id, `HTTP ${lookup.response.status}`);

    const redeem = await request(`/api/events/${event.id}/redeem`, {
      method: "POST",
      body: JSON.stringify({ qrCodeString: registration.qrCodeString }),
    });
    assertStep("Registration can be checked in", redeem.response.ok && redeem.body?.status === "CHECKED_IN", `HTTP ${redeem.response.status}`);

    const duplicate = await request(`/api/events/${event.id}/register`, {
      method: "POST",
      body: JSON.stringify({ ticketTypeId: event.ticketTypes[0].id, guestName: "Duplicate", guestEmail: `attendee-${runId}@example.test`, answers: [] }),
    });
    assertStep("Duplicate registration is rejected gracefully", duplicate.response.status === 409, `HTTP ${duplicate.response.status}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!results.some((result) => result.status === "failed")) results.push({ name: "Unexpected test failure", status: "failed", detail: message });
    console.error(`\nTest run stopped safely: ${message}`);
  } finally {
    const passed = results.filter((result) => result.status === "passed").length;
    const failed = results.filter((result) => result.status === "failed").length;
    const report = { timestamp: new Date().toISOString(), baseUrl, runId, passed, failed, results };
    console.log(`\nEntity creation report: ${passed} passed, ${failed} failed`);
    if (reportPath) {
      await mkdir(dirname(reportPath), { recursive: true }).catch(() => {});
      await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
      console.log(`Report written to ${reportPath}`);
    }
    if (failed) process.exitCode = 1;
  }
}

run();
