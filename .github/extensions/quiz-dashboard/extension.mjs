import { joinSession } from "@github/copilot-sdk/extension";

const CONTRACT_CONTEXT = [
    "You are working in copilot-quiz, the event producer for copilot-quiz-service.",
    "Only emit POST requests to http://localhost:3001/event.",
    "Allowed event types: scoreUpdated and achievementCandidate.",
    "Keep emitEvent fire-and-forget and swallow all network errors.",
    "Do not change quiz flow, scoring, UI layout, controls, or timing unless explicitly requested.",
].join(" ");

const session = await joinSession({
    hooks: {
        onSessionStart: async () => ({
            additionalContext: CONTRACT_CONTEXT,
        }),
        onUserPromptSubmitted: async (input) => {
            const prompt = input.prompt.toLowerCase();
            if (prompt.includes("copilot-quiz-service") || prompt.includes("scoreupdated") || prompt.includes("achievementcandidate")) {
                return { additionalContext: CONTRACT_CONTEXT };
            }
        },
    },
    tools: [
        {
            name: "quiz_dashboard_event_contract",
            description: "Summarizes the copilot-quiz producer contract for copilot-quiz-service.",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false,
            },
            handler: async () => CONTRACT_CONTEXT,
        },
    ],
});
