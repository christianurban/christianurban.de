---
title: Claude Code vom Handy steuern mit Remote Control
description: Eine Claude-Code-Sitzung am Rechner starten, Remote Control einschalten und unterwegs per Sprache oder Text weiterarbeiten – so nutze ich das inzwischen fast täglich.
date: 2026-11-04
tags: [claude-code, ki, workflow]
---

Eine Funktion von Claude Code nutze ich inzwischen fast täglich: [Remote Control](https://code.claude.com/docs/en/remote-control). Damit läuft eine Sitzung auf meinem Rechner weiter, gesteuert wird sie aber vom Handy aus.

## So arbeite ich damit

1. **Sitzung pro Repo öffnen:** Am Rechner starte ich einen Chat in dem Repository, um das es gehen soll.
2. **Remote Control einschalten:** In einer laufenden Sitzung reicht `/remote-control`, im Terminal geht auch `claude --remote-control`. Der bisherige Verlauf bleibt erhalten.
3. **Aufs Handy wechseln:** In der Claude-App taucht die Sitzung im Code-Bereich auf. Alternativ öffnet man den angezeigten Link oder scannt den QR-Code.

Ab da erledige ich das meiste über das Handy: Ich spreche meine Anweisungen einfach ein oder tippe sie. Claude Code arbeitet währenddessen auf dem Rechner – mit dem echten Repo, den lokalen Werkzeugen und allen Rechten, die ich dort freigegeben habe.

## Warum mir das so gefällt

- **Unterwegs im Blick:** Ich sehe jederzeit, woran Claude gerade arbeitet, und kann auf Rückfragen reagieren, statt dass eine Aufgabe stundenlang wartet.
- **Sprache statt Tastatur:** Ein Issue umsetzen, einen Text anpassen, einen PR erstellen – das lässt sich gut diktieren. Für längere Beschreibungen ist Sprechen sogar schneller als Tippen.
- **Keine Kopie in der Cloud:** Code und Werkzeuge bleiben auf meinem Rechner. Das Handy ist nur die Fernbedienung.

Auch an dieser Webseite habe ich so gearbeitet: Issue ansagen, PR auf github.com ansehen und mergen, das Ergebnis direkt auf dem Handy prüfen und Feedback samt Screenshot zurückschicken.

## Worauf man achten sollte

- **Der Rechner muss laufen:** Die Sitzung lebt auf dem eigenen Rechner. Geht er in den Ruhezustand, verbindet sich Claude Code danach wieder.
- **claude.ai-Konto nötig:** Remote Control funktioniert mit einem Claude-Abo, nicht mit einem reinen API-Key.
- **Zurück am Rechner** geht es in derselben Sitzung einfach weiter.
