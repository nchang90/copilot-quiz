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
### 3. What to do next
Follow this order:

1. Confirm the quiz is only emitting the approved event contract.
2. Create the stacked PR chain in this order:
   - `feat/event-contract` from `main`
   - `feat/event-wiring` from `feat/event-contract`
   - `feat/event-validation` from `feat/event-wiring`
3. If any lower branch changes, run `gh stack view --json` and then `gh stack sync`.
4. Run the producer and service together and verify live dashboard updates.
5. Finish with the optional review passes only if time allows.

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
### 7. Stack commands to use

Use these when you need to inspect or recover the stack:

```bash
gh stack view --json
gh stack sync
gh stack rebase
gh stack push
gh stack rebase --abort
```

Rules:
- `view` tells you whether a branch needs rebasing.
- `sync` is the normal way to update and push the stack.
- `rebase` is the recovery path when conflicts appear.
- `push` publishes the rebased stack after you inspect it.
- `rebase --abort` is the escape hatch if the conflict resolution looks wrong.

### 8. Run it live
Start both services.

```bash
cd copilot-quiz && npm run dev
cd copilot-quiz-service && node src/server.js
```

Then:
- play the quiz
- confirm events appear on the dashboard in real time
- verify a score change triggers `scoreUpdated`
- verify achievement milestones trigger `achievementCandidate`
- confirm dashboard updates occur within 2 seconds
- confirm no CORS errors appear
- confirm failed network requests never interrupt gameplay

### 9. Optional review passes
Only if time allows, add these as polish moments:

- Rubber-Duck review of emitEvent edge cases
  - critique serialization
  - allowlist enforcement
  - fire-and-forget error handling in `src/counter.js`
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
