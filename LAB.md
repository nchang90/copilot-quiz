# GitHub Copilot Apps — Demo Lab

> **30–40 min** | Quiz app → multi-repo event-driven system with Canvas, Agents, MCP, Skills, and the newest Copilot CLI features.

## Architecture

```javascript
Canvas (Plan + Approval + Execution)
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
🎮 Quiz  🌐 Service   🔗 MCP
(producer) (consumer)  (tools)
   └── POST /event ──┘
```

| Repo | Role |
| --- | --- |
| copilot-quiz (this) | Event producer |
| [copilot-quiz-service](https://github.com/NickAzureDevops/copilot-quiz-service) | Event consumer + dashboard |

## Demo Flow (30 min)

### 1. Canvas + Plan Mode (4 min)
Prompt: *"Instrument this quiz to post events to a local service. Show me a plan first."*

Show plan → approve → execution → artifacts.

### 2. Agents (6 min)
**Game Agent:** *"Wire up event emission for scoreUpdated and achievementCandidate"*

**Platform Agent:** *"Build POST /event, GET /events, and a live dashboard."*

**Agent Merge:** One compatibility verdict across both repos.

> **Highlight reasoning:** Pause to show *why* Copilot chose specific components and how it interprets cross-repo schema consistency.

### 3. Skills & Automations (5 min)
Open Automations → Skills. Show `event-schema-validation` under copilot-quiz and `azure-observability` under copilot-quiz-service.

Invoke skill: *"Check that emitEvent calls use only allowed types with correct payload shape."*

Then show automations — set up a scheduled task (e.g., daily issue triage or repo audit) that spans both repos. This demonstrates multi-repo coordination running on autopilot.

### 4. Run it live (5 min)
Start both services, play the quiz, and show events appearing on the dashboard in real-time. This is the proof that everything works end-to-end.
```bash
cd copilot-quiz && npm run dev
cd copilot-quiz-service && node src/server.js
```

### 5. Multiple Sessions at Once (3 min)
One of the most powerful things to show live: Copilot Apps lets you run several sessions in parallel, each on its own branch, all visible in the sidebar simultaneously.

**How to set it up for this demo:**

| Session | Repo | Branch | Purpose |
| --- | --- | --- | --- |
| Session A | copilot-quiz | `feat/producer-wiring` | Game Agent wiring emitEvent |
| Session B | copilot-quiz-service | `feat/service-api` | Platform Agent building POST /event |
| Session C | copilot-quiz | `feat/canvas-extension` | Canvas extension for the producer |

Open each session from the sidebar `+` button. They run independently — you can switch between them, watch agents work in parallel, and merge when each is ready.

**Prompt (copy-paste ready):**
```
Wire emitEvent for scoreUpdated and achievementCandidate events to http://localhost:3001/event.

Payloads:
- scoreUpdated: { score, delta, level }
- achievementCandidate: { score, achievement, level }

Fire-and-forget, swallow errors. Do not disrupt quiz flow or UI. Test end-to-end.
```

---

### 6. `/impeccable` Design Review (3 min)
After the agents produce code changes, run `/impeccable` to get instant design feedback from a dedicated critique agent.

Prompt: *"Run impeccable on the event bridge wiring across both repos."*

> **What to show:** `/impeccable` surfaces signal-to-noise design notes (not style, not lint). It reasons about coupling, data flow, and contract surface — exactly what you want when two repos talk over HTTP.

---

### 7. Rubber-Duck Agent (3 min)
Before merging, drop the diff or a stacked PR into the **Rubber-Duck** agent for a logic-and-bug review.

Prompt: *"Rubber-duck the emitEvent changes — are there any edge cases or logic errors?"*

> **What to show:** The Rubber-Duck agent explains *its reasoning* about what could go wrong, without fixing anything. Great for live demos — it narrates like a senior reviewer, not a linter.

---

### 8. New Diff GUI + Stacked PRs (4 min)
Open the **Diff Viewer** from the session sidebar. Show the staged changes across both repos side-by-side with inline annotation comments.

Then create a **stacked PR**: one PR for the producer-side emitEvent wiring and a second that depends on it for the service-side validation. Both appear in the session sidebar with their dependency chain shown.

> **What to show:** The diff GUI renders inline review comments from Copilot. Stacked PRs give a reviewable, merge-sequenced view of cross-repo work — no manual rebasing.

**Create stacked PRs from the terminal:**
```bash
# PR 1 — producer changes
gh pr create --title "feat: event emission wiring" --body "scoreUpdated + achievementCandidate via emitEvent()"

# PR 2 — stacks on PR 1
gh pr create --title "feat: service contract validation" --body "Validates event schema after producer PR merges" --base <branch-of-pr-1>
```

---

### 9. `/chronicle` Summary (2 min)
At the end of the session, run `/chronicle` to generate a structured summary of everything that happened — decisions made, files changed, PRs opened, skills invoked.

Prompt: *"/chronicle — summarise this session."*

> **What to show:** A ready-made narrative of the demo session, useful for standups, docs, or handing off to a colleague. Zero-effort audit trail.

---

### 10. Close (2 min)
> "We planned it, parallel sessions ran the agents simultaneously, `/impeccable` reviewed it, Rubber-Duck found the edge cases, stacked PRs sequenced the merge, and `/chronicle` wrote the summary. That's AI-native engineering."

## Checklist
- [ ] Quiz at `localhost:5173`
- [ ] Events at `localhost:3001` within 2s
- [ ] No CORS errors
- [ ] No quiz disruption from event failures
- [ ] Multiple sessions running in parallel (A/B/C)
- [ ] `/impeccable` run on event bridge wiring
- [ ] Rubber-Duck reviewed emitEvent edge cases
- [ ] Diff GUI shows inline canvas comments
- [ ] Stacked PRs created (producer → service)
- [ ] `/chronicle` summary generated

---

## Bonus: Visual Delight

**Quiz UI**
- Glow animation on score update
- Confetti burst on quiz completion
- Shake animation after 3 wrong answers

**Dashboard signal**
- After 3 wrong answers, the quiz emits an `achievementCandidate` with `"Chaos streak unlocked!"`.
- This stays within the valid producer contract while giving the dashboard a gold-highlight moment.