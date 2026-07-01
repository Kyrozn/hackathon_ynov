# TechCorp AI Chat — Livrable DEV WEB

## Objectif

Ce projet répond à la mission DEV WEB du challenge TechCorp IA.

L'objectif est de fournir une interface web de chat permettant d'interagir avec le modèle Phi-3.5-Financial via un serveur d'inférence.

## Modalités couvertes

- Développement d'une interface web de chat obligatoire
- Intégration avec l'API du serveur d'inférence choisi par l'équipe INFRA
- Connexion par défaut à Ollama sur `http://localhost:11434`
- Backend FastAPI exposant une API REST pour le frontend
- Interface utilisateur intuitive pour tester le modèle
- Gestion de l'historique des messages
- Gestion des erreurs de connexion
- Endpoint de vérification `/health`

## Architecture

dev-web/
├── backend/
│   ├── __pycache__
│   └── main.py
├── frontend/
│   ├── .vscode
│   ├── node_modules
│   ├── public
│   ├── gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── App.vue
│       ├── main.js
│       ├── style.css
│       └── services/
│           └── api.js
└── README.md

## Technologies utilisées

