// Event bridge — forwards Copilot Quiz events to copilot-quiz-service
export function emitEvent(type, payload) {
  fetch('http://localhost:3001/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, timestamp: new Date().toISOString(), payload }),
  }).catch(() => {}) // fire-and-forget; services may be offline
}

const HEALTH_CHECK_URL = 'http://localhost:3001/events'
const HEALTH_CHECK_TIMEOUT_MS = 2500

// Health check — lightweight, fire-and-forget probe of copilot-quiz-service.
// Never throws and never blocks quiz interactivity; resolves to a boolean.
export async function checkServiceHealth() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS)

  try {
    const response = await fetch(HEALTH_CHECK_URL, {
      method: 'GET',
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}
