<template>
  <div class="app">
    <aside class="sidebar">
      <h2>TechCorp</h2>
      <p class="subtitle">AI Chat Interface</p>

      <div class="status-card">
        <h3>Serveur d'inférence</h3>
        <p><strong>Type :</strong> Ollama</p>
        <p><strong>URL :</strong> {{ serverUrl }}</p>
        <p><strong>Modèle :</strong> {{ modelName }}</p>

        <div class="status-line">
          <span :class="['dot', backendStatus]"></span>
          <span>{{ statusLabel }}</span>
        </div>

        <button class="secondary-button" @click="checkHealth">
          Tester la connexion
        </button>
      </div>

      <div class="status-card">
        <h3>Objectif DEV WEB</h3>
        <ul>
          <li>Interface web de chat</li>
          <li>Connexion API backend</li>
          <li>Intégration Ollama</li>
          <li>Test du modèle en temps réel</li>
        </ul>
      </div>
    </aside>

    <main class="main">
      <header class="chat-header">
        <div>
          <h1>Phi-3.5-Financial Chat</h1>
          <p>Interface professionnelle de test du modèle financier TechCorp</p>
        </div>

        <button class="clear-button" @click="clearChat">
          Effacer
        </button>
      </header>

      <section class="chat-container">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-author">
            {{ message.role === 'user' ? 'Vous' : 'Assistant TechCorp' }}
          </div>

          <div class="message-content">
            {{ message.content }}
          </div>
        </div>

        <div v-if="loading" class="message assistant">
          <div class="message-author">Assistant TechCorp</div>
          <div class="message-content typing">
            Connexion au modèle en cours...
          </div>
        </div>
      </section>

      <section class="examples">
        <button @click="useExample('Analyse les risques financiers d’une entreprise avec une forte dette.')">
          Exemple risque financier
        </button>

        <button @click="useExample('Explique la différence entre chiffre d’affaires, marge et bénéfice net.')">
          Exemple finance
        </button>

        <button @click="useExample('Donne une recommandation business pour améliorer la rentabilité.')">
          Exemple business
        </button>
      </section>

      <footer class="input-zone">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="Posez une question au modèle financier..."
        />

        <button @click="sendMessage" :disabled="loading || !input.trim()">
          Envoyer
        </button>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHealth, sendChatMessage } from './services/api'

const input = ref('')
const loading = ref(false)

const backendStatus = ref('unknown')
const statusLabel = ref('Statut inconnu')
const serverUrl = ref('http://localhost:11434')
const modelName = ref('phi3.5-financial')

const messages = ref([
  {
    role: 'assistant',
    content:
      'Bonjour, je suis l’assistant financier TechCorp. Posez-moi une question pour tester le modèle Phi-3.5-Financial.'
  }
])

async function checkHealth() {
  try {
    const data = await getHealth()

    serverUrl.value = data.inference_server || serverUrl.value
    modelName.value = data.model || modelName.value

    if (data.backend === 'ok' && data.ollama === 'ok') {
      backendStatus.value = 'ok'
      statusLabel.value = 'Backend et Ollama connectés'
    } else if (data.backend === 'ok') {
      backendStatus.value = 'warning'
      statusLabel.value = 'Backend actif, Ollama indisponible'
    } else {
      backendStatus.value = 'error'
      statusLabel.value = 'Connexion indisponible'
    }
  } catch (error) {
    backendStatus.value = 'error'
    statusLabel.value = 'Backend indisponible'
  }
}

async function sendMessage() {
  if (!input.value.trim()) return

  const currentInput = input.value

  messages.value.push({
    role: 'user',
    content: currentInput
  })

  input.value = ''
  loading.value = true

  try {
    const data = await sendChatMessage(currentInput)

    messages.value.push({
      role: 'assistant',
      content: data.reply || 'Aucune réponse reçue du modèle.'
    })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content:
        'Erreur : impossible de contacter le backend FastAPI. Vérifiez que le serveur tourne sur le port 8001.'
    })
  } finally {
    loading.value = false
  }
}

function useExample(text) {
  input.value = text
}

function clearChat() {
  messages.value = [
    {
      role: 'assistant',
      content:
        'Conversation réinitialisée. Posez une question pour tester Phi-3.5-Financial.'
    }
  ]
}

onMounted(() => {
  checkHealth()
})
</script>