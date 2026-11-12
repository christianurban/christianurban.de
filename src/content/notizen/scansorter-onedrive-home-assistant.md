---
title: Gescannte Post automatisch in OneDrive einsortieren
description: Ein eigener ScanSorter in Home Assistant liest Scans aus dem Postfach, erkennt Absender und Inhalt und legt sie im richtigen OneDrive-Ordner ab – aber nur, wenn er sich wirklich sicher ist.
date: 2026-11-12
tags: [home-assistant, smart-home, ki, claude-code, onedrive]
---

*Teil 6 der Serie „Smart Home mit Home Assistant“. Bisher: [KNX und Gira X1 anbinden](../knx-gira-x1-home-assistant/), [Home Assistant als Code](../home-assistant-als-code/), [PV-Überschussladen mit evcc](../pv-ueberschussladen-evcc/), [Hue, Shelly, Mähroboter und Küchengeräte](../hue-shelly-husqvarna-home-connect/) und [das Familienkochbuch](../familienkochbuch-home-assistant/).*

Papierpost scannen wir seit Jahren ein. Der Scanner schickt jedes Dokument als `scan.pdf` per E-Mail – und dann beginnt die eigentliche Arbeit: Anhang speichern, umbenennen, in OneDrive den richtigen Ordner suchen. Die Ordnerstruktur ist über Jahre gewachsen, und genau deshalb blieben die Scans oft im Postfach liegen.

Inzwischen erledigt das ein kleines eigenes Projekt, der ScanSorter. Er läuft als Integration in Home Assistant, liegt wie das Kochbuch in einem privaten Git-Repo und ist in kurzer Zeit mit Claude Code entstanden.

## Die wichtigste Regel: lieber fragen als falsch ablegen

Ein falsch einsortierter Brief ist schlimmer als ein nicht einsortierter. Den findet man nämlich nie wieder. Deshalb verschiebt der ScanSorter ein Dokument nur, wenn er sich nach festen Kriterien sicher ist. In allen anderen Fällen landet es in einem Klärungsordner, und ich bekomme eine Rückfrage.

Das Ziel: mindestens 95 % der automatischen Ablagen sollen stimmen. Alles andere wird gefragt.

## Der Ablauf

Alle 15 Minuten macht die Integration einen Lauf:

1. **Mails abholen.** Über Microsoft Graph holt sie die Scanner-Mails aus dem Postfach, speichert die PDFs in einen Eingangsordner in OneDrive und verschiebt die Mail in einen Ordner „erledigt“. Gelöscht wird nichts.
2. **Text erkennen.** Die Scans sind reine Bilder. Azure AI Document Intelligence macht daraus Text – die ersten zwei Seiten reichen für die Einordnung.
3. **Regeln prüfen.** Eine Datei `regeln.yaml` in OneDrive kennt Vertrags-, Kunden- und Versicherungsnummern und die Absender, die immer in denselben Ordner gehören.
4. **Klassifizieren.** Ein Sprachmodell bekommt den Text und eine kompakte Liste der vorhandenen Ordner. Es liefert Dokumenttyp, Absender, Datum, Betreff, bis zu drei Ordnervorschläge und gefundene Referenznummern als JSON.
5. **Entscheiden.** Feste Kriterien legen fest, ob verschoben oder gefragt wird.
6. **Ablegen und protokollieren.** Aus `scan.pdf` wird zum Beispiel `2026-11-10_Stadtwerke_Jahresabrechnung-Strom.pdf`, und jede Aktion landet mit Begründung in einer CSV-Datei.

Jede Nacht baut die Integration außerdem einen Index der OneDrive-Ordner neu auf: Pfade, häufige Absender, bestätigte Referenznummern.

## Dem Sprachmodell nicht blind vertrauen

Fragt man ein Sprachmodell, wie sicher es sich ist, bekommt man gern „95 %“ – egal, ob es stimmt. Diese Selbsteinschätzung nutzt der ScanSorter deshalb gar nicht. Stattdessen muss ein Dokument sieben harte Kriterien erfüllen:

| Kriterium | Bedeutung |
|---|---|
| Lesbar | Die Texterkennung liefert genug sinnvollen Text. |
| Gültiger Ordner | Der Vorschlag existiert wirklich. Neue Ordner werden nie angelegt. |
| Harter Anker | Eine Regel greift, oder derselbe Absender bzw. dieselbe Nummer wurde für diesen Ordner schon mindestens zweimal bestätigt. |
| Kein Konkurrent | Kein anderer Ordner hat ebenfalls einen harten Anker. |
| Stabil | Zwei Läufe mit unterschiedlich formuliertem Prompt kommen zum selben Ordner. |
| Kein Sperrtyp | Bescheide, Gerichtsschreiben und Kündigungen werden immer gefragt. |
| Keine Doppelung | Im Zielordner liegt nicht schon dieselbe Datei. |

Das Sprachmodell macht also Vorschläge, die Entscheidung trifft nachvollziehbarer Code. Referenznummern zählen zum Beispiel nur, wenn sie wirklich im erkannten Text stehen – nicht, wenn das Modell sie sich ausgedacht hat.

## Rückfragen direkt in Home Assistant

Ist ein Dokument nicht eindeutig, erscheint es im Dashboard: Absender, Betreff, Datum, der Grund für die Rückfrage, ein Link zur PDF und die Ordnervorschläge oben in einer Auswahlliste. Ordner wählen, „Zuordnen“ tippen, fertig. Bei einer neuen Rückfrage kommt eine Push-Nachricht aufs Handy.

Anfangs liefen Rückfragen per E-Mail mit Antwort per Reply. Das geht noch, ist aber standardmäßig aus. Im Dashboard ist es einfach schneller.

Das Schöne daran: **Das System lernt aus jeder Antwort.** Nach der ersten Bestätigung trägt es selbst eine Absender-Regel in `regeln.yaml` ein. Der nächste Brief desselben Absenders geht dann ohne Rückfrage in den richtigen Ordner. Ich kann die Regeln jederzeit lesen, ändern oder löschen – eine gelöschte Regel legt es nicht erneut an.

```yaml
regeln:
  - name: Stromvertrag
    wenn_text_enthaelt: ["123456"]        # Vertragsnummer
    ziel: /Haus/Energie/Strom

immer_fragen:
  dokumenttypen: [Gerichtsschreiben, Bescheid, Kündigung]
  schluesselwoerter: [Diagnose, Steuer-ID]  # geht nie an das Sprachmodell
```

## Kostenlos – und dabei bleibt es

Ein Ziel war, keine laufenden Kosten zu haben. Texterkennung und Sprachmodell laufen in der Cloud, weil der Home-Assistant-Server dafür zu schwach ist, aber jeweils im kostenlosen Tarif:

- **Document Intelligence (F0):** 500 Seiten im Monat.
- **Google Gemini API:** ein kostenloses Tageskontingent, solange im Projekt keine Abrechnung eingerichtet ist.

Darauf allein verlasse ich mich nicht. Der ScanSorter zählt selbst mit und bleibt unter eigenen Obergrenzen. Ist ein Kontingent erschöpft, pausiert er einfach: Die Dokumente bleiben im Eingang und werden nach dem Tages- oder Monatswechsel verarbeitet. Zwei Tachos im Dashboard zeigen den Verbrauch.

Ein Detail am Rande: Das Sprachmodell habe ich schon zweimal gewechselt. Erst wurde ein Dienst eingestellt, dann gab es beim nächsten kein kostenloses Angebot mehr. Weil die Integration eine OpenAI-kompatible Schnittstelle nutzt, war das jedes Mal nur eine Konfigurationsänderung.

## Datenschutz

Es geht um private Post, deshalb gelten ein paar feste Regeln:

- Sensible Ordner stehen gar nicht erst im Index und werden nie an das Sprachmodell übermittelt.
- Dokumente mit bestimmten Schlüsselwörtern gehen nie an das Sprachmodell, sondern direkt in die Rückfrage.
- Home Assistant zeigt nur Dateinamen, Ziele und Status – keine Dokumentinhalte.
- Die Integration baut nur ausgehende Verbindungen auf. Es gibt keine Schnittstelle, die aus dem Internet erreichbar wäre.
- Zugangsdaten liegen nur in Home Assistant, nicht im Repo.

## Warum in Home Assistant?

Zuerst war eine Azure Function geplant. Am Ende ist es eine Integration in Home Assistant geworden, und das war die richtige Entscheidung: Zeitsteuerung, Benachrichtigungen, Dashboard und Backups gibt es dort schon. Kein zusätzlicher Cloud-Dienst, den ich betreiben und absichern muss.

Die Logik selbst liegt in einem eigenen Paket ohne Abhängigkeit zu Home Assistant. Dadurch lässt sie sich mit rund 60 Tests prüfen, ohne dass ein Home Assistant laufen muss.

## Wo es steht

Der ScanSorter läuft gerade im **Testmodus**: Er holt die Mails ab und protokolliert, wohin er verschieben *würde*, verschiebt aber nichts. Nach etwa zwei Wochen werte ich die Trefferquote aus. Erst wenn sie bei mindestens 95 % liegt, darf er wirklich ablegen.

## Was ich gelernt habe

- **Ein Sprachmodell schlägt vor, Code entscheidet.** Die Kombination aus KI für das Verstehen und harten Regeln für die Entscheidung macht das Ergebnis vorhersehbar.
- **Erst beobachten, dann automatisieren.** Ein Testmodus mit Protokoll kostet zwei Wochen Geduld und spart viele falsch abgelegte Briefe.
- **Kostenlose Tarife sind kein Plan.** Sie ändern sich. Eine austauschbare Schnittstelle und eigene Obergrenzen machen den Wechsel leicht.
- **Home Assistant ist mehr als Smart Home.** Wie beim Kochbuch reicht eine kleine Integration, um ein eigenes Werkzeug mit Dashboard und Benachrichtigungen zu bauen.
