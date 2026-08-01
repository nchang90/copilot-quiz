import { readFile } from "node:fs/promises";
import { join } from "node:path";

const CONTRACT = {
    endpoint: "http://localhost:3001/event",
    eventTypes: ["scoreUpdated", "achievementCandidate"],
    payloads: {
        scoreUpdated: ["score", "delta", "level"],
        achievementCandidate: ["score", "achievement", "level"],
    },
};

export class QuizProducerStore {
    constructor(documentId) {
        this.documentId = documentId;
        this.model = {
            documentId,
            status: "ready",
            contract: CONTRACT,
            checks: [],
            events: [],
            refreshedAt: null,
        };
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.model));
    }

    async validate() {
        const counterPath = join(process.cwd(), "src", "counter.js");
        const mainPath = join(process.cwd(), "src", "main.js");
        const [counter, main] = await Promise.all([readFile(counterPath, "utf8"), readFile(mainPath, "utf8")]);
        const checks = [
            { name: "Event endpoint", pass: counter.includes(CONTRACT.endpoint) },
            { name: "Allowed event types", pass: CONTRACT.eventTypes.every((type) => main.includes(`'${type}'`)) },
            { name: "Fire-and-forget errors", pass: counter.includes(".catch(() => {})") },
            { name: "No rejected event type", pass: !counter.includes("achievementTriggered") && !main.includes("achievementTriggered") },
            { name: "Producer payload fields", pass: Object.values(CONTRACT.payloads).every((fields) => fields.every((field) => main.includes(field))) },
        ];
        this.model.checks = checks;
        this.model.status = checks.every((check) => check.pass) ? "valid" : "invalid";
        return { ok: this.model.status === "valid", checks, contract: CONTRACT };
    }

    async refresh(serviceUrl) {
        const response = await fetch(`${serviceUrl.replace(/\/+$/, "")}/events`);
        if (!response.ok) {
            throw new Error(`Event stream request failed with HTTP ${response.status}`);
        }
        const events = await response.json();
        this.model.events = Array.isArray(events) ? events.slice(0, 25) : [];
        this.model.refreshedAt = new Date().toISOString();
        this.model.status = "refreshed";
        return { ok: true, events: this.model.events, refreshedAt: this.model.refreshedAt };
    }
}
