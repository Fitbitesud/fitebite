# Fitebite tests

Covers the cart totals, the WhatsApp message, and the WhatsApp number the orders go to.

## Run

    bun test                    # everything
    bun test tests/cart-totals  # one file

Install Bun once (`npm i -g bun`, or https://bun.sh). The test files use `bun:test`; to run them
under Vitest/Jest instead, change the first import line and swap `mock.module` in `tests/setup.ts`
for `vi.mock` / `jest.mock`.

## What is where

| File | What it checks |
|---|---|
| `cart-totals.test.ts` | `computeTotals`: subtotal = total (no delivery fee at any amount), kcal/protein, edge cases |
| `whatsapp-message.test.ts` | Order message content, numbers adding up, link/recipient, URL-encoding, `openWhatsApp`, order number |
| `whatsapp-number.test.ts` | Which number is used: config default vs Sanity dashboard, normalisation (`0…`, `+249…`, `00249…`, Arabic digits, empty field), display number |
| `live-fetch-freshness.test.ts` | Live dashboard refreshes bypass the CDN; static-build reads keep the cached client |
| `comments.test.ts` | Approved-only reads, Sanity moderation writes, local/WhatsApp fallback, and malformed storage |
| `subscriptions.test.ts` | Package/subscription pricing, discounts, macros, package WhatsApp message |
| `browser/cart.browser.test.ts` | The real cart + drawer + menu in headless Chromium: add/remove, totals on screen (courier note, no fee, no «مجاني»), saved-cart corruption, form validation, the exact WhatsApp link opened, second order |

`browser/` needs `playwright` and a Chromium install (`npm i -D playwright && npx playwright install chromium`).
Without Playwright that file is skipped automatically. `tests/setup.ts` fakes the Sanity client so nothing
touches the network.
