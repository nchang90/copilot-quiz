# Copilot Quiz

A browser-based quiz game and event producer built with vanilla JavaScript and Vite. It powers the interactive front-end experience while emitting fire-and-forget events to the companion service repo, [NickAzureDevops/copilot-quiz-service](https://github.com/NickAzureDevops/copilot-quiz-service).

![Copilot Quiz dashboard preview](./public/copilot-quiz-dashboard.png)

## Overview

This repo demonstrates a lightweight event-driven workflow:

- the quiz UI runs locally in the browser
- score and milestone updates are generated in real time
- those updates are emitted as HTTP events to `http://localhost:3001/event`
- the service repo listens for those events and renders them in a live dashboard

The app intentionally keeps the producer side simple and resilient: event delivery is fire-and-forget, and any network errors are swallowed so the quiz experience never breaks.

## Why this repo exists

This is the producer half of a two-repository demo that illustrates:

- Copilot working across multiple repos and codebases
- event-driven architecture from UI to service
- contract-based integration between a frontend producer and a dashboard consumer
- safe, non-blocking instrumentation that preserves user interactivity

## Architecture

```text
index.html            → main quiz shell and HUD
src/main.js           → quiz logic, scoring, answer flow
src/counter.js        → emitEvent() HTTP bridge to the service
src/style.css         → app styling and quiz presentation
public/*.png          → demo and dashboard assets
```

## Event contract

The app emits only these two event types to `http://localhost:3001/event`:

- `scoreUpdated`
- `achievementCandidate`

Envelope shape:

```json
{
  "type": "scoreUpdated",
  "timestamp": "2026-08-16T12:00:00.000Z",
  "payload": {
    "score": 100,
    "delta": 10,
    "level": 1
  }
}
```

Typical payloads:

```json
{ "score": 100, "delta": 10, "level": 1 }
{ "score": 500, "achievement": "Reached 500 points!", "level": 1 }
```

Important rules:

- Never emit unsupported event types
- Never block the quiz on a failed POST
- Never let event failures interrupt gameplay

## Getting started

Requirements:

- Node.js 18+

Install and run:

```bash
npm ci && npm run dev
```

When using the browser canvas, run the command above first and then open the local dev server in the canvas.

Then open:

- http://localhost:5173

If that port is already in use, Vite will choose the next available port automatically.

To build for production:

```bash
npm run build
npm run preview
```

## Running with the dashboard service

Start the consumer service in the companion repo:

```bash
cd ../copilot-quiz-service
node src/server.js
```

Then use the quiz app in this repo and watch the events appear on the dashboard at:

- http://localhost:3001

## Demo flow

1. Open the quiz in the browser.
2. Answer questions to increase your score and streak.
3. Hit milestones and level-ups.
4. Watch producer events show up in the live dashboard service.
5. Confirm the UI remains responsive even when the event service is unavailable.

## Repository notes

This repo is intentionally frontend-only. There are no backend routes or server-side APIs here; the app exists to generate and emit events in a clean, repeatable way.

## Related project

- Consumer/dashboard repo: [NickAzureDevops/copilot-quiz-service](https://github.com/NickAzureDevops/copilot-quiz-service)
