# GitHub Copilot Apps — Demo Lab
## Demo duration
Aim for a 20–30 minute walkthrough, with extra time built in for planning, live service validation, and optional review/PR discussion if the audience asks for more detail.
### 1. Frame the problem
Explain the goal: this quiz app needs to emit only valid events to the local service without disrupting the player experience.

- [http://localhost:3001](http://localhost:3001) is the dashboard/service host
- /event is a POST-only API route, not a browser page
- a browser GET to /event will fail with “Cannot GET /event”
- the quiz app should POST to that endpoint from JavaScript, not by navigating to it in the browser
### 2. Canvas + Plan Mode
Change the quiz border to bright blue

Prompt: *"Instrument this quiz to post events to a local service. Show me a plan first."*

Keep the plan focused on a small set of tasks:
- confirm the event contract
- wire `emitEvent()` to the local service
- verify the payloads and event types
- run the producer and service together
- validate live dashboard output and error resilience
### 3. Stacked PRs
Use a single repository and build the stack bottom-up, matching Dan Wahlin’s workshop flow.

- Start with the trunk: `main`
- Layer 1: `feat/event-contract`
- Layer 2: `feat/event-wiring`
- Layer 3: `feat/event-validation`

Explain that each pull request shows only its own layer, and that a mid-stack PR cannot merge by itself.
### 4. Show my work
After the agents are active, open the "My work" board to show the task flow in a real product-style view.

Highlight:
- the active work for `copilot-quiz`
- the active work for `copilot-quiz-service`
- the merge/compatibility verdict
- task status pills such as `Passed`, `Available`, and `Blocked`
### 5. Skills & Automations
Open **Automations → Skills**.

Invoke `event-schema-validation`: *"Check that emitEvent calls use only allowed types with correct payload shape."*

### 6. Multiple Sessions
Run Game-Agent on `copilot-quiz` and Platform Agent on `copilot-quiz-service` in parallel. Then run Agent Merge. Report **approve**, **request changes**, or **reject**, with blockers. Do not merge unless the verdict is **approve**.
### 7. Keep the stack current

Each layer starts from the branch below it, not from `main`. If trunk or a lower layer advances, inspect the stack:

```bash
gh stack view --json
```

A branch whose parent is no longer an ancestor reports `needsRebase: true`.

For routine synchronization, run:

```bash
gh stack sync
```

`sync` fetches and reconciles remote stack state, fast-forwards trunk when possible, cascade-rebases stale branches, pushes the updated branches, and synchronizes pull request and stack state. It does not open pull requests.

Use the split workflow when you want to test and inspect before updating remote branches:

```bash
gh stack rebase
npm test
gh stack view --json
# Inspect every parent-to-child diff, then approve the remote update.
gh stack push
```

`rebase` is also the recovery path when `sync` reports conflicts. Use `gh stack rebase --abort` if conflict resolution is uncertain.
### 8. Run it live
Start both services.

Play the quiz.

Confirm events appear on the dashboard in real time.

```bash
cd copilot-quiz && npm run dev
cd copilot-quiz-service && node src/server.js
```

Observe:
- a score change triggers `scoreUpdated`
- achievement milestones trigger `achievementCandidate`
- dashboard updates occur within 2 seconds
- no CORS errors appear
- failed network requests never interrupt gameplay

### 9. Optional review passes
Only if time allows, add these as polish moments:

-  /Rubber-Duck review of emitEvent edge cases
Rubber-Duck review of emitEvent edge cases — critique serialization, allowlist enforcement, and fire-and-forget error handling in src/counter.js

- Diff GUI note on the secondary pill: `Make this secondary pill slightly less prominent than the primary one.`
- `/impeccable` design review of the event bridge
### 10. `/chronicle` Summary
Run `/chronicle` to generate the session summary.

### 11. Close
State the final outcome: the producer and service are aligned on the contract, the dashboard reflects live quiz activity, and the event bridge remains resilient to failures without disrupting gameplay.

## Checklist
- [ ] Quiz at `localhost:5173`
- [ ] Events at `localhost:3001` within 2s
- [ ] No CORS errors
- [ ] No quiz disruption from event failures
- [ ] Multiple sessions running in parallel
- [ ] `event-schema-validation` run on emitEvent usage
- [ ] Stacked PRs created (optional)
- [ ] `/impeccable` run on event bridge wiring (optional)
- [ ] Rubber-Duck reviewed emitEvent edge cases (optional)
- [ ] Diff GUI shows inline canvas comments (optional)
- [ ] `/chronicle` summary generated
