---
title: Codebasen als Wissensgraph mit Graphify
description: Statt Dateien zu durchsuchen, fragt die KI einen Graphen – wie Graphify eine Codebasis abbildet, was das bei dieser Webseite ergibt und warum wir es für AL und X++ erweitert haben.
date: 2026-11-16
tags: [ki, claude-code, graphify, business-central]
---

Ein KI-Assistent kennt eine Codebasis nicht – er muss sie sich jedes Mal neu erschließen. In einem kleinen Projekt geht das schnell. In einer großen Codebasis sucht er mit `grep`, öffnet Datei um Datei und baut sich mühsam ein Bild davon, was wie zusammenhängt. Das kostet Zeit, Tokens und Kontext, und trotzdem fehlt am Ende oft ein Zusammenhang.

[Graphify](https://github.com/Graphify-Labs/graphify) setzt genau da an: Es bildet ein Projekt als **Wissensgraph** ab, den der Assistent abfragen kann, statt Dateien zu durchsuchen.

## Was Graphify macht

Graphify liest ein Projekt ein und erzeugt daraus einen Graphen: Knoten sind Dateien, Klassen, Funktionen oder Begriffe, Kanten sind Beziehungen wie „ruft auf“, „importiert“ oder „erbt von“. Ein paar Eigenschaften gefallen mir besonders:

- **Code bleibt lokal.** Quellcode wird mit tree-sitter geparst – deterministisch, ohne Sprachmodell, nichts verlässt den Rechner. Nur für Dokumente, PDFs oder Bilder kommt ein Sprachmodell zum Einsatz.
- **Jede Kante ist nachvollziehbar.** Graphify kennzeichnet, ob eine Beziehung direkt im Code steht (`EXTRACTED`) oder erschlossen wurde (`INFERRED`).
- **Ein echter Graph, kein Vektorindex.** Es gibt keine Embeddings. Man fragt nach Pfaden und Nachbarn, statt nach ähnlichen Textstellen.
- **Communities.** Graphify gruppiert eng verbundene Knoten zu Bereichen und schreibt einen Bericht mit den zentralen Knoten („God Nodes“) und überraschenden Verbindungen.

Graphify steht unter der Apache-2.0-Lizenz und wird als Skill installiert. In Claude Code genügt dann `/graphify`, und der Assistent nutzt den Graphen für Fragen zur Architektur.

## Beispiel: diese Webseite

Zum Ausprobieren habe ich Graphify über den Code dieser Webseite laufen lassen. Für den reinen Code-Graphen reicht ein Befehl, ein Sprachmodell braucht es dafür nicht:

```bash
graphify update .
```

Das Ergebnis für 38 Dateien: 217 Knoten, 246 Kanten, 26 Communities – und 0 verbrauchte Tokens. Der Bericht nennt als zentrale Knoten genau die Funktionen, an denen die Seite hängt: `url()` für Links mit Basispfad, `getAllPosts()` und `getPosts()` für die Beitragslisten und `tagUrl()` für die Tags.

Abfragen gehen direkt über die Kommandozeile oder über den Assistenten:

```text
$ graphify explain "getSeries()"
Node: getSeries()
  Source:    src/lib/site.ts L76
Connections (3):
  <-- site.ts [contains] [EXTRACTED]
  <-- [...id].astro [imports] [EXTRACTED]
  --> getAllPosts() [calls] [EXTRACTED]
```

Für eine Seite dieser Größe ist das nett, aber nicht nötig. Der eigentliche Nutzen zeigt sich bei Codebasen mit Tausenden Dateien, in denen niemand mehr alle Zusammenhänge im Kopf hat.

## Unsere Erweiterung für AL und X++

Auf der Arbeit entwickeln wir viel für Microsoft Dynamics 365 – in **AL** für Business Central und in **X++** für Finance and Operations. Beide Sprachen kannte Graphify nicht. Wir haben es deshalb in einem eigenen Fork erweitert.

Gerade hier lohnt sich ein Graph besonders. In Business Central wird Standardcode nicht verändert, sondern erweitert: Tabellen- und Seitenerweiterungen hängen sich an bestehende Objekte, und vieles läuft über Events. Ein Event-Subscriber ruft niemanden direkt auf – er wird aufgerufen. Mit einer Textsuche findet man solche Beziehungen nur, wenn man schon weiß, wonach man suchen muss.

Die AL-Erweiterung bildet deshalb nicht nur Objekte wie Tabellen, Seiten, Codeunits und Reports ab, sondern auch:

- **Erweiterungen** und das Objekt, das sie erweitern,
- **Events** mit ihren Publishern und Subscribern,
- **Abhängigkeiten zwischen Apps** aus der `app.json` – ein Objekt wird nur dann einer anderen App zugeordnet, wenn diese tatsächlich als Abhängigkeit eingetragen ist,
- **Testbeziehungen**, also welche Tests welche Seiten und Handler nutzen.

Für X++ gilt Ähnliches. Auch dort wird Standardcode über Erweiterungen und Event-Handler angepasst, und die Zusammenhänge sind über viele Dateien verteilt.

Ein eigener Fork hat eine Folge, die man von Anfang an einplanen sollte: Er muss mit dem Original Schritt halten. Wir holen Änderungen von Graphify deshalb automatisiert über einen Workflow nach.

## Was ich gelernt habe

- **Ein Graph ersetzt kein Lesen, aber viel Suchen.** Der Assistent findet schneller die richtigen Stellen und muss weniger Dateien öffnen.
- **Struktur ist billig, Semantik kostet.** Der Code-Graph entsteht lokal und kostenlos. Erst Dokumente und Bilder brauchen ein Sprachmodell.
- **Für Nischensprachen lohnt sich eigene Arbeit.** Für AL und X++ gibt es weit weniger Werkzeuge als für C# oder Python. Gerade dort hilft es, wenn die KI die Struktur einer Codebasis nicht erst erraten muss.
