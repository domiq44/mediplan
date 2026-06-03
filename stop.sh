#!/bin/bash

# Cherche le fichier PID soit dans docs/ (lorsque start.sh a fait cd docs),
# soit à la racine (cas où on l'aurait déplacé).
PID_FILE=""
if [ -f docs/.server_pid ]; then
    PID_FILE="docs/.server_pid"
elif [ -f .server_pid ]; then
    PID_FILE=".server_pid"
fi

if [ -n "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if [ -z "$PID" ]; then
        echo "Fichier PID vide : $PID_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi

    if ps -p "$PID" >/dev/null 2>&1; then
        CMD=$(ps -p "$PID" -o args=)
        if echo "$CMD" | grep -q "python3 -m http.server"; then
            if kill "$PID" >/dev/null 2>&1; then
                rm -f "$PID_FILE"
                echo "Serveur Mediplan arrêté (PID $PID)."
            else
                echo "Impossible d'arrêter le PID $PID. Il peut déjà être arrêté."
                rm -f "$PID_FILE"
            fi
        else
            echo "Le PID $PID n'appartient pas à un serveur Mediplan : $CMD"
            echo "Le fichier PID va être supprimé, mais le processus n'a pas été tué."
            rm -f "$PID_FILE"
        fi
    else
        echo "Aucun processus Python trouvé pour PID $PID. Suppression du fichier PID stale."
        rm -f "$PID_FILE"
    fi
else
    echo "Aucun serveur Mediplan n'est en cours d'exécution."
fi
