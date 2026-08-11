// Extension: copilot-quiz-browser
// Opens the Copilot Quiz Vite dev server in a canvas panel.
// Start the quiz first with: npm run dev (defaults to http://localhost:5173)

import { joinSession, createCanvas } from "@github/copilot-sdk/extension";

// Detect which port Vite is actually listening on (5173 or 5174 fallback).
async function resolveQuizUrl() {
    for (const port of [5173, 5174, 5175]) {
        try {
            const res = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(500) });
            if (res.ok || res.status < 500) return `http://localhost:${port}/`;
        } catch {
            // port not available, try next
        }
    }
    return "http://localhost:5173/"; // fallback
}

const session = await joinSession({
    canvases: [
        createCanvas({
            id: "quiz-browser",
            displayName: "Copilot Quiz",
            description: "Opens the Copilot Quiz app running on the local Vite dev server",
            open: async () => {
                const url = await resolveQuizUrl();
                return { title: "Copilot Quiz", url };
            },
        }),
    ],
});
