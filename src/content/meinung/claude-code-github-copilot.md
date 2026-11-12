---
title: Claude Code und GitHub Copilot – wann ich was nutze
description: Copilot für die freie Modellwahl und das Code Review. Claude Code für fast alles andere – weil man für dasselbe Geld deutlich mehr umsetzen kann und die Claude App die Entwicklung komplett aufnimmt.
date: 2026-11-12
tags: [ki, claude-code, github-copilot]
---

Wir haben lange mit GitHub Copilot in Visual Studio Code entwickelt. Inzwischen läuft der Großteil unserer Projekte mit Claude Code. Copilot ist trotzdem nicht verschwunden, er hat nur eine andere Rolle bekommen. Hier ist, wann ich was nutze – und warum.

## Wann Copilot die bessere Wahl ist

Copilot hat einen klaren Vorteil: **die Auswahl an Modellen.** Dort stehen nicht nur die Modelle von Anthropic zur Verfügung, sondern auch die von OpenAI und anderen Anbietern. Wer Modelle vergleichen oder für eine Aufgabe gezielt ein bestimmtes Modell einsetzen möchte, ist mit Copilot besser bedient.

Claude Code ist dagegen auf die Modelle von Anthropic festgelegt. Für unsere tägliche Entwicklung ist das kein Nachteil – aber wenn die Modellwahl selbst der Punkt ist, greife ich zu Copilot.

## Warum wir trotzdem meistens Claude Code nutzen

### Das Abrechnungsmodell

Der wichtigste Grund ist nüchtern: das Geld. Im Team-Plan von Anthropic sind wir nur durch ein Zeitkontingent begrenzt, nicht durch einzelne Anfragen oder Tokens. Für rund 20 € im Monat pro Person lässt sich damit sehr viel umsetzen.

Wir haben das verglichen. Unser Ergebnis: Mit den 20 € bei Anthropic schafft eine Person fast so viel wie mit GitHub Copilot für etwa 400 bis 500 € im Monat. Das ist natürlich kein Labortest, sondern unsere Erfahrung mit unseren Projekten und unserer Arbeitsweise. Aber der Unterschied ist so groß, dass er die Entscheidung für den Alltag fast allein trägt.

Gerade beim agentischen Arbeiten fällt das ins Gewicht. Wenn die KI ein Issue selbstständig umsetzt, Dateien liest, baut, testet und nachbessert, kommen schnell viele Anfragen zusammen. Bei einem Modell, das pro Anfrage oder Token abrechnet, wird genau das teuer. Mit einem festen Kontingent denke ich darüber nicht mehr nach.

### Die Claude App

Der zweite Grund hat uns selbst überrascht: Wir arbeiten in den meisten Projekten gar nicht mehr in Visual Studio Code, sondern direkt in der **Claude App**. Dort ist Claude Code fest eingebunden – mit Projekten, Sitzungen, Diff-Ansicht, Terminal, Browser-Vorschau und Pull Requests.

Ich beschreibe, was ich möchte, Claude setzt es um, und ich prüfe das Ergebnis. Den Editor brauche ich dafür nur noch selten. Diese Webseite ist ein gutes Beispiel: Notizen, Suche und Bildoptimierung sind so entstanden, jeweils als eigener Branch mit Pull Request. Den Merge mache ich oft vom Handy aus.

## Code Review: hier bleibt Copilot gesetzt

Beim Review sieht es anders aus. In unseren Code-Projekten nutzen wir im Regelfall das **Code Review von GitHub Copilot**. Es hängt direkt am Pull Request, kommentiert die Änderungen und braucht keine weitere Einrichtung. Das passt gut zusammen: Claude Code schreibt den Code, Copilot schaut im Pull Request noch einmal drüber, und am Ende entscheidet ein Mensch.

Die Ausnahme ist Business Central. Für AL-Code nutzen wir **Peti**, ein KI-Code-Review eines kleinen Start-ups aus Münster, das auf diese Welt spezialisiert ist. Gerade im ERP-Umfeld zahlt sich das aus.

## Das Werkzeug ist nicht alles

Unabhängig vom Assistenten gilt: Die Ergebnisse werden erst dann verlässlich, wenn die KI ihre Arbeit selbst prüfen kann – mit Tests, Build-Skripten und klaren Anforderungen. Wie wir das mit Spezifikationen lösen, steht in der Notiz [Spec-Driven Development mit OpenSpec](../../notizen/spec-driven-development-openspec/). Das funktioniert mit Claude Code und Copilot gleichermaßen.

## Mein Fazit

Für uns sind Claude Code und GitHub Copilot keine reine Konkurrenz, sondern Werkzeuge für unterschiedliche Fälle:

- **GitHub Copilot**, wenn ich die freie Wahl zwischen vielen Modellen verschiedener Anbieter brauche – und für das Code Review im Pull Request.
- **Peti** für das Review von Business-Central-Code.
- **Claude Code** für die tägliche Entwicklung – weil wir dort für einen Bruchteil des Geldes ein Vielfaches umsetzen und die Claude App die Arbeit im Editor fast vollständig ersetzt hat.

Der Markt ändert sich schnell, Preise und Kontingente auch. Ich schaue mir das regelmäßig neu an. Stand heute ist die Entscheidung für uns aber eindeutig.
