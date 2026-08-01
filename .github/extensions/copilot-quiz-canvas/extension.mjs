import { createServer } from "node:http";
import { joinSession, createCanvas } from "@github/copilot-sdk/extension";
import { QuizProducerStore } from "./store.mjs";
import { renderHtml } from "./ui.mjs";

const servers = new Map();
const stores = new Map();

function getStore(documentId) {
    let store = stores.get(documentId);
    if (!store) {
        store = new QuizProducerStore(documentId);
        stores.set(documentId, store);
    }
    return store;
}

function sendJson(res, status, value) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(value));
}

async function startServer(instanceId, documentId) {
    const store = getStore(documentId);
    const server = createServer(async (req, res) => {
        const url = new URL(req.url, "http://127.0.0.1");
        res.setHeader("Access-Control-Allow-Origin", "*");

        if (url.pathname === "/" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
            res.end(renderHtml());
            return;
        }
        if (url.pathname === "/model" && req.method === "GET") {
            sendJson(res, 200, store.snapshot());
            return;
        }
        if (url.pathname === "/validate" && req.method === "GET") {
            sendJson(res, 200, await store.validate());
            return;
        }
        if (url.pathname === "/refresh" && req.method === "GET") {
            const serviceUrl = url.searchParams.get("serviceUrl") || "http://localhost:3001";
            sendJson(res, 200, await store.refresh(serviceUrl));
            return;
        }
        sendJson(res, 404, { ok: false, error: "not found" });
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/`, documentId, instanceId };
}

const canvas = createCanvas({
    id: "copilot-quiz-canvas",
    displayName: "Quiz Producer Contract",
    description: "Inspect the copilot-quiz event contract and refresh the linked service event stream.",
    inputSchema: {
        type: "object",
        properties: {
            documentId: { type: "string", description: "Stable model id (defaults to default)." },
            serviceUrl: { type: "string", description: "Service base URL (defaults to http://localhost:3001)." },
        },
        additionalProperties: false,
    },
    actions: [
        {
            name: "validate_quiz_contract",
            description: "Validate the producer-side endpoint, allowed event types, payloads, and fire-and-forget behavior.",
            inputSchema: { type: "object", properties: { documentId: { type: "string" } }, additionalProperties: true },
            handler: async (ctx) => getStore(ctx.input?.documentId || "default").validate(),
        },
        {
            name: "refresh_quiz_events",
            description: "Read the latest events from copilot-quiz-service without changing quiz state.",
            inputSchema: {
                type: "object",
                properties: {
                    serviceUrl: { type: "string", description: "Service base URL." },
                    documentId: { type: "string" },
                },
                additionalProperties: true,
            },
            handler: async (ctx) =>
                getStore(ctx.input?.documentId || "default").refresh(ctx.input?.serviceUrl || "http://localhost:3001"),
        },
    ],
    open: async (ctx) => {
        const input = ctx.input || {};
        const documentId = String(input.documentId || "default");
        let entry = servers.get(ctx.instanceId);
        if (!entry) {
            entry = await startServer(ctx.instanceId, documentId);
            servers.set(ctx.instanceId, entry);
        }
        return { title: "Quiz Producer Contract", url: entry.url, status: getStore(documentId).snapshot().status };
    },
    onClose: async (ctx) => {
        const entry = servers.get(ctx.instanceId);
        if (entry) {
            servers.delete(ctx.instanceId);
            await new Promise((resolve) => entry.server.close(resolve));
        }
    },
});

await joinSession({
    canvases: [canvas],
});
