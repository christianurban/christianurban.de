---
title: Unser Familienkochbuch – als Code und in Home Assistant
description: Über 400 Rezepte aus Instagram, Chefkoch und Omas Rezeptbuch in einer schlichten Webseite, gepflegt mit Claude Code und eingebaut in Home Assistant – mit Wochenplan, Koch-Statistik und Einkaufsliste.
date: 2026-11-09
tags: [home-assistant, smart-home, claude-code, ki, kochen]
series: Smart Home mit Home Assistant
seriesPart: 5
---

Unsere Rezepte lagen früher überall: gespeicherte Beiträge auf Instagram, Favoriten bei Chefkoch, ausgedruckte Zettel, ein handgeschriebenes Rezeptbuch. Gesucht haben wir trotzdem jedes Mal von vorn. Inzwischen gibt es ein Familienkochbuch mit über 400 Rezepten – eine kleine Webseite in einem privaten GitHub-Repo, die Home Assistant direkt mit ausliefert.

## Bewusst schlicht: HTML, JavaScript und eine JSON-Datei

Das Kochbuch ist eine statische Single-Page-App ohne Framework und ohne Build:

```text
cookbook/
├── index.html
├── script.js
├── styles.css
├── data/
│   ├── recipes.json
│   └── nutrition.json
├── images/
└── tools/
```

Alle Rezepte stehen in einer einzigen Datei, `recipes.json`. Ein Rezept besteht aus Titel, Portionen, Zeit, Zutaten, Schritten, Tags und der Quelle:

```json
{
  "id": "croque-monsieur",
  "title": "Croque Monsieur",
  "portions": "4",
  "time": "20 Minuten",
  "ingredients": ["3 mittelgroße Tomaten", "2–3 kleine Zwiebeln", "…"],
  "steps": ["Backofen vorheizen und Tomaten in Scheiben schneiden.", "…"],
  "tags": ["Snack", "Fleisch", "Ofengericht", "Schnell"],
  "source": { "label": "kochen & genießen – Die neue 30-Minuten-Küche" }
}
```

Statt eines Links steht bei Rezepten aus Büchern oder von Zetteln eine Quellenangabe.

Das ist für Menschen lesbar, für eine KI leicht zu bearbeiten und für Git gut zu vergleichen. Eine Datenbank habe ich nie vermisst.

## Rezepte rein: Import und Fotos mit Claude Code

Das eigentliche Problem war, die Rezepte überhaupt zusammenzubekommen. Dafür gibt es drei Wege, alle mit Claude Code gebaut:

- **Instagram:** Instagram exportiert gespeicherte Beiträge als JSON. Ein Skript erzeugt daraus eine Warteschlange, Claude Code liest die Beiträge und macht daraus strukturierte Rezepte. So sind gut 250 Rezepte ins Kochbuch gekommen.
- **Rezeptseiten wie Chefkoch:** Viele Seiten haben strukturierte Daten nach schema.org/Recipe. Ein Import-Skript übernimmt Titel, Zutaten, Schritte und Quelle direkt – über 130 Rezepte.
- **Fotos:** Ein ausgedrucktes oder handgeschriebenes Rezept fotografiere ich und schicke es Claude Code. Ein eigener Skill liest das Foto aus, schreibt einen Entwurf und zeigt eine Vorschau im Design der Seite. Erst nach meiner Freigabe landet das Rezept im Kochbuch, mit dem Originalfoto daneben.

Dazu kommen Nährwerte: Für jedes Rezept schätzt Claude die Mengen der Zutaten, ein Skript rechnet daraus Kalorien, Fett, Kohlenhydrate und Eiweiß pro Portion. Das sind Richtwerte, keine Laborwerte – für den Alltag reicht es.

## Warum in Home Assistant?

Das Kochbuch könnte auch auf GitHub Pages liegen. In Home Assistant hat es aber drei Vorteile: Die Familie hat die App ohnehin auf dem Handy, das Kochbuch steht dort einfach in der Seitenleiste, und Home Assistant kann Daten speichern, die eine statische Seite nicht speichern kann.

Home Assistant holt den aktuellen Stand jede Nacht mit `git pull` aus dem Repo, auf Wunsch auch sofort über ein Skript. Der Zugang zum privaten Repo darf nur lesen. Schlägt der Abgleich fehl, erscheint eine Benachrichtigung mit der Meldung von Git.

Eine Hürde gab es: Der Standardordner `/local` liefert Dateien mit einem Cache von 31 Tagen aus – auch die `index.html`. Neue Rezepte wären dann erst Wochen später auf den Handys angekommen. Deshalb gibt es eine kleine eigene Integration, die denselben Ordner mit `Cache-Control: no-cache` ausliefert. Der Browser fragt dann bei jedem Aufruf nach und bekommt bei unverändertem Stand nur ein schnelles „304 Not Modified“.

## Mehr als eine Rezeptsammlung

Die eigene Integration hat noch eine zweite Aufgabe: Sie stellt eine kleine API bereit. Damit wurde aus der Rezeptsammlung ein Werkzeug für den Alltag:

- **Heute gekocht:** Ein Knopf auf jeder Rezeptseite. Daraus entsteht eine gemeinsame Statistik – was am häufigsten gekocht wird, was lange nicht mehr dran war.
- **Wochenplan:** Rezepte für diese oder nächste Woche vormerken, gemeinsam für alle Geräte. Was seit Montag gekocht wurde, ist abgehakt.
- **Einkaufsliste:** Die Zutaten aller offenen Gerichte einer Woche auf einmal sammeln und per Apple-Kurzbefehl in die Erinnerungen übertragen.
- **Weiterkochen:** Sperrt sich das Handy beim Kochen, öffnet das Kochbuch danach wieder dasselbe Rezept an derselben Stelle, abgehakte Zutaten inklusive. Und „Bildschirm anlassen“ verhindert das Sperren gleich ganz.

Die Daten liegen in Home Assistant, nicht im Repo. So bleibt `git pull` sauber, und Statistik und Wochenplan sind in jedem Backup von Home Assistant enthalten. Läuft das Kochbuch ohne Home Assistant, blendet es diese Funktionen einfach aus.

## Der Wochenplan an der Wand

Weil Home Assistant die Daten kennt, kann es sie auch woanders zeigen. Ein Sensor liefert den Wochenplan, und auf dem iPad in der Küche steht er auf dem Wand-Dashboard – neben dem Energiefluss, den Terminen und der Spülmaschine: offene Gerichte, schon gekochte durchgestrichen, ein Ausblick auf nächste Woche. Ein Tippen öffnet den Wochenplan im Kochbuch.

Damit beantwortet ein Blick an die Wand die häufigste Frage im Haus: „Was essen wir heute?“

## Was ich gelernt habe

- **Einfach anfangen.** HTML, JavaScript und eine JSON-Datei reichen für ein Kochbuch mit Hunderten Rezepten. Ohne Build und Framework kann ich in fünf Jahren noch genauso daran arbeiten.
- **KI ist ideal für Fleißarbeit.** Hunderte Rezepte aus Beiträgen, Webseiten und Fotos zu übertragen, hätte ich von Hand nie gemacht. Wichtig ist die Freigabe vor dem Speichern – gerade bei handschriftlichen Rezepten.
- **Home Assistant ist eine gute Plattform für eigene Werkzeuge.** App, Backups, Dashboards und Benachrichtigungen gibt es schon. Eine kleine Integration reicht, um eine eigene Anwendung daran anzudocken.
