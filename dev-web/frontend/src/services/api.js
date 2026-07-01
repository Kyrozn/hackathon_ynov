const API_URL = 'http://127.0.0.1:8001'

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`)
  return await response.json()
}

export async function sendChatMessage(message) {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  })

  return await response.json()
}