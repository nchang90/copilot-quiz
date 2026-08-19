import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";

const extensionDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(extensionDir, "../../../../");
const projectName = "GitHub Copilot Apps Quiz";
const candidatePorts = Array.from({ length: 24 }, (_, index) => 5173 + index);

const wrapperServers = new Map();
let devServerState = {
    status: "idle",
    url: null,
    source: null,
    process: null,
    readyPromise: null,
};

function log(message) {
    session.log(message, { level: "info", ephemeral: true });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function fileExists(filePath) {
    try {
        await access(filePath, fsConstants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function httpGet(url, timeoutMs = 1500) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        const body = await response.text();
        return { ok: response.ok, status: response.status, body };
    } finally {
        clearTimeout(timeout);
    }
}

async function detectRunningDevServer() {
    for (const port of candidatePorts) {
        const url = `http://127.0.0.1:${port}/`;
        try {
            const { ok, body } = await httpGet(url);
            if (ok && body.includes("GitHub Copilot Apps Quiz")) {
                return { url, source: `existing:${port}` };
            }
        } catch {
            // Ignore and keep probing.
        }
    }
    return null;
}

function waitForProcessExit(child) {
    return new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`Process exited with code ${code ?? "unknown"} signal ${signal ?? "none"}`));
        });
    });
}

async function runCommand(command, args, cwd) {
    const child = spawn(command, args, {
        cwd,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
    });

    await new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(stderr.trim() || `Command failed: ${command} ${args.join(" ")}`));
        });
    });
}

async function ensureDependencies() {
    const nodeModulesPath = path.join(repoRoot, "node_modules");
    if (await fileExists(nodeModulesPath)) {
        return;
    }

    log("Dependencies are missing; running npm ci.");
    await runCommand("npm", ["ci"], repoRoot);
}

function parseDevServerUrl(chunk) {
    const text = chunk.toString();
    const match = text.match(/Local:\s+(https?:\/\/[^\s]+\/)/);
    if (!match) {
        return null;
    }
    const rawUrl = match[1];
    const normalized = new URL(rawUrl);
    normalized.hostname = "127.0.0.1";
    return normalized.toString();
}

async function waitForLiveDevServer(child) {
    let buffer = "";

    return await new Promise((resolve, reject) => {
        const fail = (error) => {
            reject(error instanceof Error ? error : new Error(String(error)));
        };

        child.stdout.on("data", async (chunk) => {
            const text = chunk.toString();
            buffer += text;

            const discoveredUrl = parseDevServerUrl(text) || parseDevServerUrl(buffer);
            if (!discoveredUrl) {
                return;
            }

            try {
                const verified = await httpGet(discoveredUrl);
                if (verified.ok) {
                    resolve({ url: discoveredUrl, source: `spawned:${new URL(discoveredUrl).port}` });
                }
            } catch {
                // Keep waiting for the server to become reachable.
            }
        });

        child.once("error", fail);
        child.once("exit", (code, signal) => {
            reject(new Error(`npm run dev exited early with code ${code ?? "unknown"} signal ${signal ?? "none"}`));
        });
    });
}

async function ensureDevServer() {
    if (devServerState.readyPromise) {
        return devServerState.readyPromise;
    }

    devServerState.readyPromise = (async () => {
        const existing = await detectRunningDevServer();
        if (existing) {
            devServerState = {
                ...devServerState,
                status: "ready",
                url: existing.url,
                source: existing.source,
                readyPromise: null,
            };
            log(`Using existing quiz dev server at ${existing.url}`);
            return existing;
        }

        await ensureDependencies();

        log("Starting quiz dev server with npm run dev -- --host 127.0.0.1.");
        const child = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1"], {
            cwd: repoRoot,
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
        });

        devServerState.process = child;
        devServerState.status = "starting";

        let stderr = "";
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        try {
            const result = await waitForLiveDevServer(child);
            devServerState = {
                ...devServerState,
                status: "ready",
                url: result.url,
                source: result.source,
                readyPromise: null,
            };
            log(`Quiz dev server ready at ${result.url}`);
            return result;
        } catch (error) {
            devServerState = {
                status: "error",
                url: null,
                source: null,
                process: null,
                readyPromise: null,
            };
            const detail = stderr.trim();
            throw new CanvasError("dev_server_failed", detail || error.message || "Failed to start quiz dev server.");
        }
    })();

    return devServerState.readyPromise;
}

function renderHtml(instanceId) {
    const title = escapeHtml(projectName);
    const escapedInstanceId = escapeHtml(instanceId);
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: var(--font-sans, system-ui, sans-serif);
        background: var(--background-color-default, #ffffff);
        color: var(--text-color-default, #1f2328);
      }
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      body {
        display: grid;
        grid-template-rows: auto 1fr;
        background: var(--background-color-default, #ffffff);
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color-default, rgba(31, 35, 40, 0.12));
        background: var(--background-color-subtle, rgba(127, 127, 127, 0.06));
      }
      .title {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      h1 {
        margin: 0;
        font-size: 16px;
        line-height: 1.2;
      }
      .meta {
        margin: 0;
        color: var(--text-color-muted, #57606a);
        font-size: 12px;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      button, a {
        font: inherit;
      }
      button, .link-button {
        border: 1px solid var(--border-color-default, rgba(31, 35, 40, 0.16));
        border-radius: 8px;
        background: var(--background-color-default, #ffffff);
        color: inherit;
        padding: 8px 12px;
        cursor: pointer;
        text-decoration: none;
      }
      button:hover, .link-button:hover {
        background: var(--background-color-muted, rgba(127, 127, 127, 0.08));
      }
      main {
        min-height: 0;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        background: #fff;
      }
      .status {
        font-size: 12px;
        color: var(--text-color-muted, #57606a);
      }
    </style>
  </head>
  <body>
    <header>
      <div class="title">
        <h1>${title}</h1>
        <p class="meta">Instance <code>${escapedInstanceId}</code></p>
        <p id="status" class="status">Loading quiz preview…</p>
      </div>
      <div class="actions">
        <button id="refresh" type="button">Refresh</button>
        <a id="open-new-tab" class="link-button" href="#" target="_blank" rel="noreferrer">Open app</a>
      </div>
    </header>
    <main>
      <iframe id="frame" title="GitHub Copilot Apps Quiz" loading="eager"></iframe>
    </main>
    <script>
      async function loadState() {
        const response = await fetch('/state', { cache: 'no-store' });
        const state = await response.json();
        const status = document.getElementById('status');
        const frame = document.getElementById('frame');
        const openNewTab = document.getElementById('open-new-tab');
        status.textContent = state.message;
        frame.src = state.devServerUrl;
        openNewTab.href = state.devServerUrl;
      }
      document.getElementById('refresh').addEventListener('click', () => {
        loadState().catch((error) => {
          document.getElementById('status').textContent = error.message;
        });
      });
      loadState().catch((error) => {
        document.getElementById('status').textContent = error.message;
      });
    </script>
  </body>
</html>`;
}

async function startWrapperServer(instanceId) {
    const server = createServer(async (req, res) => {
        try {
            const requestUrl = new URL(req.url || "/", "http://127.0.0.1");

            if (requestUrl.pathname === "/state") {
                const devServer = await ensureDevServer();
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    instanceId,
                    devServerUrl: devServer.url,
                    message: `Quiz preview ready at ${devServer.url}`,
                }));
                return;
            }

            const devServer = await ensureDevServer();
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(renderHtml(instanceId, devServer.url));
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end(error instanceof Error ? error.message : String(error));
        }
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/` };
}

async function getWrapperServer(instanceId) {
    let entry = wrapperServers.get(instanceId);
    if (!entry) {
        entry = await startWrapperServer(instanceId);
        wrapperServers.set(instanceId, entry);
    }
    return entry;
}

const session = await joinSession({
    canvases: [
        createCanvas({
            id: "quiz-canvas",
            displayName: "GitHub Copilot Apps Quiz",
            description: "Live quiz preview with automatic local dev-server startup."
            actions: [
                {
                    name: "status",
                    description: "Return the current quiz preview and dev-server status.",
                    handler: async () => {
                        const devServer = await ensureDevServer();
                        return {
                            ready: true,
                            devServerUrl: devServer.url,
                            source: devServer.source,
                        };
                    },
                },
            ],
            open: async (ctx) => {
                const entry = await getWrapperServer(ctx.instanceId);
                const devServer = await ensureDevServer();
                return {
                    title: "GitHub Copilot Apps Quiz",
                    status: `Quiz preview: ${devServer.url}`,
                    url: entry.url,
                };
            },
            onClose: async (ctx) => {
                const entry = wrapperServers.get(ctx.instanceId);
                if (entry) {
                    wrapperServers.delete(ctx.instanceId);
                    await new Promise((resolve) => entry.server.close(() => resolve()));
                }
            },
        }),
    ],
});

session.log("quiz-canvas extension loaded", { level: "info", ephemeral: true });
