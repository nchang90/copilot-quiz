// Event bridge — forwards Copilot Quiz events to copilot-quiz-service
export function emitEvent(type, payload) {
  fetch('http://localhost:3001/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, timestamp: new Date().toISOString(), payload }),
  }).catch(() => {}) // fire-and-forget; services may be offline
}

// Health check — lightweight, fire-and-forget probe of copilot-quiz-service.
// Never throws; resolves to a boolean.
export async function checkServiceHealth() {
  try {
    const response = await fetch('http://localhost:3001/events')
    return response.ok
  } catch {
    return false
  }
}
