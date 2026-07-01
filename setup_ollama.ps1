Write-Host "Lancement du conteneur Docker Ollama..."
docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama ollama/ollama

Write-Host "Attente du démarrage du serveur Ollama..."
Start-Sleep -Seconds 5

Write-Host "Téléchargement du modèle phi3.5..."
docker exec ollama ollama pull phi3.5

Write-Host "Création du modèle personnalisé phi3.5-financial..."
docker cp ./models/phi3.5_financial/Modelfile ollama:/Modelfile
docker exec ollama ollama create phi3.5-financial -f /Modelfile

Write-Host "Modèle phi3.5-financial créé avec succès."
Write-Host "Note: Le modèle phi3.5 a été configuré avec un system prompt financier spécialisé."
