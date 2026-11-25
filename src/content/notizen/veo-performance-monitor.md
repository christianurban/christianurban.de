---
title: Ein Performance-Monitor für Business Central – und wie er stündlich aktuell bleibt
description: Ein Dashboard bewertet die Performance vieler Business-Central-Umgebungen anhand ihrer Telemetrie – mit festen Regeln statt KI. Mein Teil war der Betrieb, mit GitHub Actions, OIDC und einer Azure Static Web App.
date: 2026-11-25
tags: [business-central, azure, github-actions, telemetrie]
---

„Business Central ist heute so langsam.“ Diesen Satz hört jeder, der ERP-Systeme betreut. Die schwierige Frage ist die danach: Stimmt das? Seit wann? Für alle oder nur für einzelne Benutzer? Und liegt es am letzten Update, an einem Job, der mitten am Tag läuft, oder an einer Schnittstelle?

Für unsere Cloud-Lösung VEO auf Basis von Business Central hat ein Kollege dafür den **VEO Performance-Monitor** gebaut. Ich habe ihn nicht entwickelt, sondern mich um Hosting und automatisierte Datenabfrage gekümmert. Hier ein Überblick über beides.

## Die Datenquelle: Telemetrie aus Business Central

Business Central schreibt auf Wunsch Telemetrie nach Azure Application Insights: lange SQL-Abfragen und AL-Vorgänge, Sperren und Deadlocks, Berichtslaufzeiten, Fehlerdialoge, Seitenaufrufe, Aufrufe von Schnittstellen und Jobs der Aufgabenwarteschlange. Jedes Ereignis hat eine feste Kennung, etwa `RT0012` für ein Sperr-Timeout.

Diese Daten sind da – aber niemand schaut sich Millionen einzelner Ereignisse an. Der Performance-Monitor fragt sie mit festen KQL-Abfragen ab und verdichtet sie zu einer Ampel je Umgebung.

## Was das Dashboard zeigt

Das Dashboard hat drei Ebenen: **Übersicht → Kunde → Modul**. Die Module entsprechen den Fachbereichen – Verkauf, Einkauf, Lager, Produktion, Finanzen –, dazu kommen Schnittstellen und Hintergrundjobs. Jedes AL-Objekt ist über eine Zuordnungstabelle einem Modul zugewiesen.

Insgesamt gibt es rund zwanzig Kennzahlen, etwa „Seitenladezeit P95“, „Lange SQL-Abfragen je Benutzer und Tag“ oder „Sperr-Timeouts je Tag“. Die Bewertung folgt drei Regeln:

1. **Absolute Schwellen:** Ab einem festen Wert wird eine Kennzahl gelb oder rot.
2. **Vergleich mit sich selbst:** Ist ein Wert deutlich schlechter als in den 28 Tagen davor, gibt es eine Warnung – auch wenn die absolute Schwelle noch nicht erreicht ist.
3. **Vergleich mit allen anderen:** Wer zu den langsamsten 10 % gehört, bekommt einen Hinweis.

Die Schwellen sind nicht geraten, sondern an der Verteilung über alle Umgebungen kalibriert. Sie stehen mit Gültigkeitsdatum in einer CSV-Datei. Eine Verschärfung ist eine neue Zeile, die alten bleiben stehen. So ist nachvollziehbar, ob sich Ampeln verbessern, weil die Systeme schneller geworden sind – oder nur, weil jemand die Schwellen verändert hat.

## Ein paar Ideen, die mir besonders gefallen

- **Keine KI im Ablauf.** Alle Kennzahlen entstehen aus festen Abfragen und festen Regeln. Das Ergebnis ist reproduzierbar und erklärbar – bei einer Bewertung, die Kunden betrifft, ist das wichtiger als jede clevere Vorhersage.
- **Der Morgen nach dem Update.** Updates laufen abends. Am nächsten Morgen vergleicht der Monitor die ersten Stunden des Tages mit demselben Zeitfenster der letzten gleichartigen Tage, bevorzugt mit ähnlicher Auslastung. Neue App- oder Plattformversionen werden markiert. So fällt ein langsames Update auf, bevor das Telefon klingelt.
- **So erleben es die Benutzer.** Gezählt werden nur Wartezeiten, die Anwender selbst spüren: Seitenladezeit, lange Vorgänge, Sperren, Fehlermeldungen. Jobs und Schnittstellen stehen getrennt daneben. Blockiert ein Job einen Benutzer, erkennt der Monitor das an der Kombination aus Sperr-Timeout und Sperrhalter.
- **Einzelne Benutzer.** Ein Benutzer gilt als auffällig, wenn derselbe Vorgang bei ihm deutlich länger dauert als bei den Kollegen – nicht, weil er einfach viel arbeitet. Die Telemetrie enthält dabei nur eine pseudonyme ID, Namen gibt es nur über eine optionale Datei, die nicht im Repository liegt.
- **Vom Befund zum Ticket – und zurück.** Auf Knopfdruck entsteht ein Ticket-Text mit Messwerten. Darin steckt ein Link zu einem Wirkungsbericht, der die Vorher-Werte selbst in der URL trägt. Nach der Maßnahme zeigt der Bericht vorher gegenüber nachher, ohne dass irgendwo etwas gespeichert werden musste.

## Mein Teil: vom Skript zum Dienst

Angefangen hat der Monitor als Python-Skript mit ein paar `.bat`-Dateien für den lokalen Betrieb. Damit Kolleginnen und Kollegen denselben Stand sehen und der Link im Ticket für alle funktioniert, brauchte es eine gemeinsame Adresse und eine regelmäßige Aktualisierung.

### Stündlich per GitHub Action

Eine GitHub Action fragt die Telemetrie werktags von 6 bis 22 Uhr stündlich ab, berechnet die Kennzahlen und veröffentlicht das Ergebnis. Eine Kleinigkeit dabei: Der Zeitplan von GitHub Actions läuft in UTC. Damit das Fenster im Sommer wie im Winter stimmt, ist der Zeitplan großzügig gefasst, und ein erster Job prüft die deutsche Uhrzeit:

```yaml
on:
  schedule:
    - cron: "0 4-21 * * 1-5"   # UTC – deckt 6–22 Uhr in Sommer- und Winterzeit ab
  workflow_dispatch:

jobs:
  zeitfenster:
    runs-on: ubuntu-latest
    outputs:
      laufen: ${{ steps.pruefen.outputs.laufen }}
    steps:
      - id: pruefen
        run: |
          h=$(TZ=Europe/Berlin date +%-H); wd=$(TZ=Europe/Berlin date +%u)
          if [ "$wd" -le 5 ] && [ "$h" -ge 6 ] && [ "$h" -le 22 ]; then laufen=true; else laufen=false; fi
          echo "laufen=$laufen" >> "$GITHUB_OUTPUT"
```

### Anmeldung ohne Passwort

Die Action meldet sich per **OpenID Connect (OIDC)** bei Azure an. GitHub stellt für jeden Lauf ein kurzlebiges Token aus, Azure vertraut diesem Token über eine App-Registrierung. Es liegt also kein Passwort und kein Client-Secret im Repository. Die App-Registrierung hat nur die Rechte, die sie braucht: Telemetrie lesen und in einen Storage-Container schreiben.

### Keine Kundendaten im Repository

Die Liste der Umgebungen mit Kundennamen gehört nicht ins Git. Die Action lädt sie bei jedem Lauf aus der Datenbank, in der die Umgebungen ohnehin verwaltet werden – mit einem Konto, das nur die benötigten Spalten lesen darf. Der Verlauf der Kennzahlen liegt in einem privaten Storage-Container und wird bei jedem Lauf geholt und zurückgeschrieben.

Weil die Runner von GitHub bei jedem Lauf eine andere IP-Adresse haben, öffnet die Action die Datenbank-Firewall nur für die Dauer des Laufs und nur für die eigene Adresse. Am Ende wird die Regel wieder gelöscht – auch Reste von abgebrochenen Läufen.

### Hosting als Azure Static Web App

Das Dashboard selbst ist eine einzelne HTML-Datei plus eine JavaScript-Datei mit den Daten. Dafür reicht eine **Azure Static Web App**. Sie ist mit Entra ID verbunden, sodass nur angemeldete Mitarbeitende das Dashboard sehen. Ein eigener Server oder eine Datenbank für das Dashboard sind nicht nötig.

## Was ich gelernt habe

- **Telemetrie ist nur so gut wie ihre Abdeckung.** App-Telemetrie aus den eigenen Erweiterungen liefert nicht alle Ereignisse. Für Sitzungen oder Webservice-Aufrufe muss die Umgebungs-Telemetrie je Umgebung im Admin Center eingeschaltet sein. Das Dashboard zeigt deshalb offen „Keine Daten“, statt eine grüne Ampel vorzutäuschen.
- **Erst lokal, dann als Dienst.** Der Weg vom Skript mit `.bat`-Dateien zur GitHub Action war kurz, weil das Skript schon sauber getrennt hatte: Konfiguration in YAML, Kundendaten außerhalb des Repos, Ausgabe als statische Dateien.
- **Geheimnisse vermeiden statt verwalten.** OIDC statt Client-Secret, temporäre Firewall-Regeln statt dauerhafter Freigaben, Leserechte nur auf die nötigen Spalten – jedes Geheimnis, das es nicht gibt, muss auch niemand rotieren.
- **Feste Regeln schaffen Vertrauen.** Ein Dashboard, dessen Ampel man erklären kann, wird genutzt. Eines, das „die KI hat entschieden“ sagt, eher nicht.
