---
title: Home Assistant als Code – mit Git und Claude Code
description: Automationen als YAML-Pakete, die Konfiguration versioniert in Git und Claude Code als Kollege, der Issues umsetzt – so pflege ich unser Smart Home.
date: 2026-11-06
tags: [home-assistant, smart-home, claude-code, ki]
series: Smart Home mit Home Assistant
seriesPart: 2
---

Home Assistant lässt sich komplett über die Oberfläche konfigurieren. Ich mache das trotzdem fast nie. Stattdessen liegt die Konfiguration als YAML in einem Git-Repo, jede Änderung beginnt mit einem Issue, und den größten Teil der Arbeit erledigt Claude Code. Inzwischen sind so über hundert Issues und Pull Requests zusammengekommen.

## Pakete statt einer großen Datei

Der wichtigste Baustein sind [Pakete](https://www.home-assistant.io/docs/configuration/packages/). Eine Zeile in der `configuration.yaml` reicht:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

Danach ist jede Datei im Ordner `packages/` ein eigenes Paket. Ein Paket bündelt alles, was zu einem Thema gehört – KNX-Entitäten, Sensoren, Helfer, Automationen:

```text
packages/
├── beschattung.yaml
├── energie_knx.yaml
├── haus_verlassen.yaml
├── knx_licht.yaml
├── knx_rollladen.yaml
├── nacht.yaml
├── rauchmelder.yaml
└── tuerklingel.yaml
```

So steht nicht eine Automation in `automations.yaml`, der zugehörige Helfer irgendwo in der Oberfläche und die KNX-Adresse in einer dritten Datei. Wer verstehen will, was nachts passiert, öffnet `nacht.yaml` – und findet alles an einem Ort.

## Kommentare sind Dokumentation

Weil es Text ist, kann ich festhalten, *warum* etwas so ist. Ein Beispiel aus der Beschattung:

```yaml
automation:
  # Nach Sonnenuntergang braucht es die Markise nicht mehr, auch wenn sie
  # von Hand ausgefahren wurde. Die Markise meldet ihre Position nicht,
  # deshalb immer senden.
  - id: markise_sonnenuntergang
    alias: Markise Sonnenuntergang
    triggers:
      - trigger: sun
        event: sunset
    conditions:
      - condition: state
        entity_id: switch.zustand_automatik_gesperrt
        state: "off"
    actions:
      - action: cover.set_cover_position
        target:
          entity_id: cover.markise_wintergarten
        data:
          position: 100
```

Ein halbes Jahr später weiß ich sonst nicht mehr, warum die Automation keine Bedingung auf die aktuelle Position hat. Mit Kommentar schon.

Auch Logik, die mehrere Pakete brauchen, lässt sich teilen: Eigene Jinja-Makros in `custom_templates/` beschreiben zum Beispiel einmal, welche Fenster welchen Behang haben – Beschattung und Hausstatus nutzen dieselbe Liste.

## Was ins Repo gehört – und was nicht

Versioniert werden nur Dinge, die man lesen und vergleichen kann:

- `configuration.yaml`, Automationen, Skripte, Szenen
- der Ordner `packages/` und eigene Templates
- Dashboards im YAML-Modus

Nicht ins Repo gehören:

- `secrets.yaml` mit Passwörtern und Tokens – stattdessen liegt eine `secrets.example.yaml` mit den Schlüsselnamen und Platzhaltern daneben
- die Datenbank mit dem Verlauf und die Logs
- der Großteil von `.storage` mit Integrationen, Benutzern und Tokens

Eine `.gitignore` sorgt dafür, dass nichts davon versehentlich im Commit landet. Gesichert wird Home Assistant trotzdem über seine eigenen Backups – das Repo dient der Nachvollziehbarkeit, nicht der Wiederherstellung.

Ein kleines Skript holt die versionierbaren Dateien per SSH von Home Assistant ab. So landen auch Änderungen, die doch einmal über die Oberfläche entstanden sind, im Repo. Ein `git diff` zeigt dann genau, was sich geändert hat.

## Der Ablauf: vom Issue zum eingespielten Paket

Jede Änderung folgt demselben Muster:

1. **Issue anlegen:** Was soll passieren? Zum Beispiel: „Wenn alle das Haus verlassen, sollen Licht und Lautsprecher ausgehen.“
2. **Claude Code setzt um:** Es liest die bestehende Doku und die Pakete, schreibt das neue oder geänderte Paket und ergänzt die Dokumentation.
3. **Prüfen auf Home Assistant:** Das Paket wird eingespielt, `ha core check` prüft die Konfiguration auf Fehler. Erst dann wird neu geladen.
4. **Pull Request:** Der PR beschreibt, was die Automation macht, unter welchen Bedingungen sie *nicht* greift und wie man sie testet. Ich lese ihn – oft unterwegs in der GitHub-App – und merge.

Die Commit-Historie liest sich danach wie ein Logbuch des Hauses: „Nacht: Flur-Jalousie fährt mit herunter“, „Markise bei Sonnenuntergang einfahren“, „Hausgeräte über Home Connect“.

## Warum das mit KI so gut funktioniert

Der Ablauf funktioniert nur, weil alles als Text vorliegt. Claude Code kann:

- **die bestehende Konfiguration lesen**, statt zu raten, wie Entitäten heißen oder welche Gruppenadressen belegt sind,
- **sich an Konventionen halten** – Namensschema, Paketaufteilung, Kommentare –, weil es sie im Repo sieht,
- **Doku und Code gemeinsam pflegen**, sodass beides nicht auseinanderläuft,
- **Folgen erkennen**: Ändert sich ein Name, findet es alle Stellen, die ihn verwenden.

Entscheidend ist die Doku im Repo. Bei mir liegen dort neben den Paketen auch die Exporte aus ETS und GPA, eine Beschreibung aller Gruppenadressen und Entscheidungsvorlagen – etwa, welche Logik im X1 bleibt und welche in Home Assistant läuft. Damit hat die KI denselben Kontext wie ich und trifft Entscheidungen im Sinne der bestehenden Architektur.

Die Verantwortung bleibt trotzdem bei mir: Ich lege fest, *was* passieren soll, lese jeden PR und teste das Ergebnis im Haus. Gerade bei Dingen wie Rauchmeldern oder Rollläden ist das kein Formalismus.

## Mein Fazit

Home Assistant als Code ist mehr Aufwand als ein paar Klicks in der Oberfläche – aber nur am Anfang. Danach habe ich eine nachvollziehbare, dokumentierte Konfiguration, die ich gemeinsam mit einer KI weiterentwickeln kann. Für ein Haus mit Dutzenden Automationen möchte ich nicht mehr anders arbeiten.
