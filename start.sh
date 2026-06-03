#!/bin/bash

echo "Démarrage de Mediplan…"

# Aller dans le dossier docs
cd docs || exit

# Si un PID existe déjà, vérifier que le serveur n'est pas déjà en cours
if [ -f .server_pid ]; then
  OLD_PID=$(cat .server_pid)
  if [ -n "$OLD_PID" ] && ps -p "$OLD_PID" >/dev/null 2>&1; then
    echo "Un serveur Mediplan semble déjà démarré (PID $OLD_PID)."
    echo "Si ce n'est pas le cas, supprimez docs/.server_pid puis relancez start.sh."
    exit 1
  fi
fi

PORT="${1:-9000}"

if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -le 0 ] || [ "$PORT" -gt 65535 ]; then
  echo "Port invalide : $PORT"
  echo "Utilisation : ./start.sh [PORT]"
  exit 1
fi

# Lance le serveur en arrière-plan et conserve les logs pour diagnostic
LOG="../mediplan-http.log"
python3 -m http.server "$PORT" >> "$LOG" 2>&1 &
SERVER_PID=$!

sleep 1

if ! ps -p "$SERVER_PID" >/dev/null 2>&1; then
  echo "Le serveur Mediplan n'a pas démarré correctement."
  if command -v ss >/dev/null 2>&1 && ss -ltn | grep -q ":$PORT"; then
    echo "Le port $PORT est déjà utilisé par un autre service."
  fi
  echo "Consultez le journal : $LOG"
  tail -20 "$LOG"
  exit 1
fi

echo $SERVER_PID > .server_pid
xdg-open "http://localhost:$PORT"

echo "Mediplan est lancé sur http://localhost:$PORT"
echo "PID du serveur : $SERVER_PID"
echo "Journal de serveur : $(pwd)/../mediplan-http.log"
