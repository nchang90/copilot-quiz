# GitHub Copilot Apps — Demo Lab

## Demo Flow

### Demo duration
Aim for a 20–30 minute walkthrough, with extra time built in for planning, live service validation, and stacked PR/review discussion if the audience asks for more detail.

### 1. Canvas + Plan Mode
Prompt: *"Instrument this quiz to post events to a local service. Show me a plan first."*

### 2. Agents
Run **Game Agent**: *"Wire up event emission for scoreUpdated and achievementCandidate"*

Run **Platform Agent**: *"Build POST /event, GET /events, and a live dashboard."*

Run **Agent Merge** and record the compatibility verdict.

Notes for session

- Run feature/integration-plan, Game-Agent-plan, and feature/quiz-service-sync together
- Rubber Duck - feature
- Improved stacked PR visibility and context
- Request and re-request Copilot code reviews

### 3. Skills & Automations
Open **Automations → Skills**.

Invoke `event-schema-validation`: *"Check that emitEvent calls use only allowed types with correct payload shape."*

Set up a scheduled task that spans both repos.

### 4. Run it live
Start both services.

Play the quiz.

Confirm events appear on the dashboard in real time.

```bash
cd copilot-quiz && npm run dev
cd copilot-quiz-service && node src/server.js
```

### 5. Multiple Sessions
Create three sessions in parallel:

| Session | Repo | Branch | Purpose |
| --- | --- | --- | --- |
| Session A | copilot-quiz | `feat/producer-wiring` | Game Agent wiring emitEvent |
| Session B | copilot-quiz-service | `feat/service-api` | Platform Agent building POST /event |
| Session C | copilot-quiz | `feat/canvas-extension` | Canvas extension for the producer |

Open each session from the sidebar `+` button.

Prompt:
```
Wire emitEvent for scoreUpdated and achievementCandidate events to http://localhost:3001/event.

Payloads:
- scoreUpdated: { score, delta, level }
- achievementCandidate: { score, achievement, level }

Fire-and-forget, swallow errors. Do not disrupt quiz flow or UI. Test end-to-end.
```

### 6. `/impeccable` Design Review
Run `/impeccable` on the event bridge wiring across both repos.

### 7. Rubber-Duck Agent
Run Rubber-Duck on the emitEvent changes.

### 8. Diff GUI
Open the Diff Viewer from the session sidebar.

Add an inline note on the secondary pill:
`Make this secondary pill slightly less prominent than the primary one.`

### 9. Stacked PRs
Create a stacked PR:

```bash
# PR 1 — producer changes
gh pr create --title "feat: event emission wiring" --body "scoreUpdated + achievementCandidate via emitEvent()"

# PR 2 — stacks on PR 1
gh pr create --title "feat: service contract validation" --body "Validates event schema after producer PR merges" --base <branch-of-pr-1>
```

### 10. `/chronicle` Summary
Run `/chronicle` to generate the session summary.

### 11. Close
State the final outcome.

## Checklist
- [ ] Quiz at `localhost:5173`
- [ ] Events at `localhost:3001` within 2s
- [ ] No CORS errors
- [ ] No quiz disruption from event failures
- [ ] Multiple sessions running in parallel
- [ ] `/impeccable` run on event bridge wiring
- [ ] Rubber-Duck reviewed emitEvent edge cases
- [ ] Diff GUI shows inline canvas comments
- [ ] Stacked PRs created
- [ ] `/chronicle` summary generated
