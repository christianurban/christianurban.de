---
title: Wie ich meine Seite mit Astro, GitHub Actions und KI aufgebaut habe
description: Vom Chat über GitHub-Issues zu Pull Requests – wie diese Webseite an einem Vormittag entstanden ist und was ich dabei über die Zusammenarbeit mit KI gelernt habe.
date: 2026-11-02T12:00:00+01:00
tags: [astro, github-actions, github-pages, ki, claude-code]
---

Lange hat christianurban.de nur auf die Seite unserer Immobilienverwaltung gezeigt. Ich wollte das ändern – aber ohne eine Webseite, die nach dem Launch einschläft. Sie sollte sich so einfach pflegen lassen wie ein Notizbuch. Dieser Beitrag beschreibt, wie sie entstanden ist, und ist gleichzeitig ihr erster Inhalt.

## Erst denken, dann bauen: der Chat

Angefangen hat es mit einem Gespräch mit Claude: Was könnte auf so einer Seite stehen, das auch andere interessiert? Herausgekommen sind ein paar klare Leitplanken:

- **Ein fachlicher Kern** – Notizen zu Softwareentwicklung, KI und GitHub aus eigenen Projekten.
- **Persönliches am Rand** – Rezepte, Laufen, Wandern, Tennis. Familie nur in einem Satz, ohne Namen und Fotos der Kinder.
- **Pflege ohne Hürde** – jeder Beitrag ist eine Markdown-Datei im Repo.
- **Eine Faustregel für Inhalte:** Was ich ohne Bedenken auf einer öffentlichen Konferenz erzählen würde, passt hierher. Interna aus dem Job nicht.

Bei der Technik habe ich zuerst an Azure Static Web Apps gedacht und mich dann für **GitHub Pages** entschieden. Als Generator ist es **Astro** geworden statt des in Pages eingebauten Jekyll: etwas mehr Aufwand beim Einrichten, dafür flexibel genug für das, was noch kommen soll – etwa Lauf- und Wanderstatistiken, die sich automatisch aktualisieren.

## Aus dem Chat werden Issues

Den Chat habe ich anschließend an Claude Code gegeben, mit einer einzigen Bitte: daraus Issues anzulegen. Das Ergebnis waren 15 Issues mit Checklisten – vom Grundgerüst über Deployment, Domain und Lizenz bis zu Rezepten und RSS.

Dieser Schritt hat sich mehr gelohnt, als ich erwartet hatte. Die Issues sind die Schnittstelle zwischen mir und der KI: Ich entscheide, *was* gebaut wird und in welcher Reihenfolge. Die Umsetzung eines Issues ist dann ein klar abgegrenzter Auftrag.

## Issue für Issue zum Pull Request

Danach lief es immer gleich: „Kannst du #2 umsetzen?“ – Claude Code legt einen Branch an, baut, testet lokal, prüft die Seite im Browser und öffnet einen Pull Request mit `Closes #2`. Ich lese den PR und merge.

Ein paar Dinge sind mir dabei aufgefallen:

- **Entscheidungen bleiben bei mir.** Bei der Lizenz für die Inhalte kam eine Rückfrage statt einer stillen Annahme (es ist CC BY 4.0 geworden). Für die Startseite kam eine Liste mit Fragen zu Beruf, Region und Familie, bevor eine Zeile Text geschrieben wurde.
- **Vorhandenes wiederverwenden.** Für das Design habe ich nur gesagt: „so wie in meinem Cookbook-Repo, oder noch professioneller“. Farben, Schriften und Karten wurden von dort übernommen – ruhiger und mit hellem Farbschema.
- **Details, an die ich nicht gedacht hätte.** Etwa, dass die Seite ohne eigene Domain in einem Unterpfad liegt und sonst CSS und Links ins Leere zeigen. Oder dass Schriften besser lokal ausgeliefert werden als von Google Fonts. Zu beidem gibt es eine eigene Notiz.
- **Fehler passieren trotzdem.** Einmal wurden zwei Korrekturen auf einen Branch gepusht, dessen PR ich schon gemergt hatte. Sie fehlten auf `main`, und ich habe es nur bemerkt, weil ich keinen PR mehr gesehen habe. Auch daraus ist eine Notiz geworden.

## Wie die Seite jetzt funktioniert

- Inhalte liegen als Markdown unter `src/content/` – eine Datei pro Beitrag.
- Jeder Push auf `main` baut die Seite per GitHub Action und veröffentlicht sie auf GitHub Pages.
- Neue Beiträge kann ich direkt auf github.com schreiben, notfalls vom Handy. Oder ich gebe Claude Code meine Stichpunkte und bekomme einen PR zurück.

Der Quellcode liegt öffentlich auf [GitHub](https://github.com/christianurban/christianurban.de) – inklusive aller Issues und Pull Requests, falls jemand den Weg nachvollziehen möchte.

## Fazit

Das Bauen selbst war der kleinste Teil. Wertvoller war, vorher sauber zu klären, was die Seite sein soll, und das in Issues festzuhalten. Mit dieser Struktur wird die KI vom Ideengeber zum Kollegen, der Aufgaben abarbeitet – und ich bleibe derjenige, der entscheidet, reviewt und merged.
