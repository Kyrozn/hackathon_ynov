from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI(title="TechCorp AI Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serveur d'inférence d'INFRA
# Ollama par défaut
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_CHAT_URL = f"{OLLAMA_BASE_URL}/api/chat"

# Nom du modèle à adapter selon le nom réel installé dans Ollama
MODEL_NAME = os.getenv("MODEL_NAME", "phi3.5-financial")


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {
        "project": "TechCorp AI Chat",
        "status": "Backend opérationnel",
        "inference_server": OLLAMA_BASE_URL,
        "model": MODEL_NAME
    }


@app.get("/health")
def health():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_available = response.status_code == 200

        return {
            "backend": "ok",
            "ollama": "ok" if ollama_available else "unavailable",
            "inference_server": OLLAMA_BASE_URL,
            "model": MODEL_NAME
        }

    except Exception as e:
        return {
            "backend": "ok",
            "ollama": "unavailable",
            "error": str(e),
            "inference_server": OLLAMA_BASE_URL,
            "model": MODEL_NAME
        }


@app.post("/chat")
def chat(request: ChatRequest):
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Phi-3.5-Financial, a professional assistant "
                    "specialized in finance, business analysis, and financial decision support. "
                    "Answer clearly, accurately, and professionally."
                )
            },
            {
                "role": "user",
                "content": request.message
            }
        ],
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()

        return {
            "success": True,
            "reply": data.get("message", {}).get("content", "Aucune réponse reçue du modèle."),
            "model": MODEL_NAME,
            "server": OLLAMA_BASE_URL
        }

    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "reply": (
                "Erreur : impossible de contacter le serveur Ollama. "
                "Vérifiez qu'Ollama est lancé sur http://localhost:11434."
            ),
            "model": MODEL_NAME,
            "server": OLLAMA_BASE_URL
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "reply": "Erreur : le modèle met trop de temps à répondre.",
            "model": MODEL_NAME,
            "server": OLLAMA_BASE_URL
        }

    except Exception as e:
        return {
            "success": False,
            "reply": f"Erreur lors de l'appel au serveur d'inférence : {str(e)}",
            "model": MODEL_NAME,
            "server": OLLAMA_BASE_URL
        }