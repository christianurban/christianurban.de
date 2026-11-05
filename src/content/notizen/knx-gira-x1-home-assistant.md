---
title: KNX und Gira X1 mit Home Assistant verbinden
description: Wie ich Home Assistant an unsere KNX-Anlage mit Gira X1 angebunden habe – wer welche Logik übernimmt, eine eigene Hauptgruppe für Fremdsysteme und ein Heartbeat für den Ernstfall.
date: 2026-11-05
tags: [home-assistant, knx, smart-home]
---

*Teil 1 der Serie „Smart Home mit Home Assistant“. Warum ich mich überhaupt für Home Assistant entschieden habe, steht im [Meinungsbeitrag](../../meinung/home-assistant/).*

Unser Haus läuft auf KNX mit Gira-Aktorik. Die Visualisierung, Zeitschaltuhren und Logiken liegen auf einem **Gira X1**, programmiert mit dem **Gira Project Assistant (GPA)**. Das funktioniert seit Jahren zuverlässig. Für alles, was nicht KNX ist – PV-Anlage, Wallbox, Auto, Hausgeräte, Sonos, Hue, Shelly –, kam Home Assistant dazu. Hier beschreibe ich, wie beide Welten zusammenarbeiten.

## Erst die Rollen klären

Die wichtigste Entscheidung fiel vor der ersten Zeile Konfiguration: **Wer ist wofür zuständig?**

| Ebene | Verantwortung |
|---|---|
| KNX-Aktoren und -Sensoren | Grundfunktionen und Sicherheit, z. B. Windschutz – laufen auch ohne X1 und Home Assistant |
| Gira X1 | führend für Hausfunktionen: globale Zustände wie Anwesend, Nacht oder Urlaub, Szenen, Heizung, Zeitschaltuhren |
| Home Assistant | Gateway zu den Fremdsystemen, dazu Komfortlogik mit vielen Geräten |

Daraus ergeben sich ein paar Grundsätze, an die ich mich strikt halte:

- **Fällt Home Assistant aus, läuft das Haus weiter.** Es fehlen nur die Werte und Aktionen der Fremdsysteme.
- **Globale Zustände gehören dem X1.** Home Assistant liest sie, setzt sie aber nie selbst.
- **Eine Logik lebt an genau einer Stelle** – nie gleichzeitig im X1 und in Home Assistant.

Eine bewusste Ausnahme ist die Beschattung: Rund 25 Behänge mit Sonnenstandsnachführung wären im GPA sehr aufwendig, in Home Assistant sind sie leicht anzupassen. Fällt Home Assistant aus, fehlt nur der Komfort. Der Windschutz bleibt im X1, weil er immer funktionieren muss.

## Die Verbindung: KNX-Tunneling über den X1

Home Assistant bringt eine offizielle [KNX-Integration](https://www.home-assistant.io/integrations/knx/) mit. Der X1 stellt mehrere KNX-Tunnel bereit; einer davon ist jetzt für Home Assistant reserviert und hat in der ETS eine eigene physikalische Adresse. Routing per Multicast beherrscht der X1 nicht, Tunneling reicht aber völlig.

Einen Haken hat das: ETS, Home Assistant und andere Clients teilen sich die Tunnel des X1. Mittelfristig plane ich deshalb eine eigene KNX-IP-Schnittstelle nur für Home Assistant.

Wichtig zu wissen: Der X1 beantwortet keine Leseanfragen. Home Assistant liest Zustände deshalb direkt von den Aktoren oder hört auf die Rückmeldungen, die der X1 sendet.

## Eine eigene Hauptgruppe für Fremdsysteme

Die Hauptgruppen 0–4 in der ETS sind belegt und bleiben unangetastet. Für alles, was Home Assistant auf den Bus legt, gibt es die neue **Hauptgruppe 5 „Integration“**, gegliedert nach Gewerk statt nach Hersteller:

| Mittelgruppe | Gewerk | Beispiele |
|---|---|---|
| 5/0 | System | Home Assistant online, Freigaben für Logiken |
| 5/1 | Energie | PV-Leistung, Netzbezug, Batterie, PV-Überschuss |
| 5/2 | Mobilität | Wallbox, Ladestand des Autos, Lademodus |
| 5/3 | Hausgeräte | Spülmaschine, Kochfeld |
| 5/4 | Medien & Sprache | Fernseher läuft, Sonos |
| 5/5 | Licht & Steckdosen | Shelly, Hue-Sensoren |
| 5/6 | Klima & Umwelt | später z. B. Wärmepumpe |
| 5/7 | Sicherheit & Zugang | später z. B. Türkommunikation |

Dazu ein paar Regeln:

- **Blöcke je Gerät:** Jedes Gerät bekommt 20 Untergruppen, z. B. 5/2/0–19 Ladepunkt und 5/2/20–39 Auto. So ist Platz für weitere Werte, ohne umnummerieren zu müssen.
- **Schreibrichtung:** Was Home Assistant sendet, liegt nur in Hauptgruppe 5. Bestehende Gruppenadressen liest es nur oder spricht sie gezielt für Befehle an.
- **Datenpunkttyp immer setzen**, damit X1 und Home Assistant die Werte gleich interpretieren.
- **Bedeutung in die Beschreibung**, z. B. „positiv = Bezug, negativ = Einspeisung“.

## In beide Richtungen: lesen und senden

Bestehende KNX-Funktionen bindet Home Assistant direkt über ihre Gruppenadressen ein, etwa eine dimmbare Leuchte:

```yaml
knx:
  light:
    - name: "Wohnen"
      address: "1/0/30"
      state_address: "1/0/31"
      brightness_address: "1/0/33"
      brightness_state_address: "1/0/34"
```

Umgekehrt legt Home Assistant Werte aus Fremdsystemen auf den Bus – zum Beispiel die PV-Leistung, damit der X1 und die Gira-App sie anzeigen können:

```yaml
knx:
  expose:
    - type: power        # DPT 14.056, Leistung in Watt
      entity_id: sensor.energie_pv_leistung
      address: "5/1/0"
```

Bei Messwerten gilt: nicht jede Schwankung auf den Bus schicken. Werte nur bei relevanter Änderung und höchstens alle 10–30 Sekunden senden – eine einzelne KNX-Linie hat begrenzte Bandbreite. Detaillierte Verläufe bleiben in Home Assistant.

## Heartbeat: Merkt der X1, wenn Home Assistant fehlt?

Damit ein Ausfall nicht unbemerkt bleibt, sendet Home Assistant jede Minute ein Lebenszeichen auf 5/0/0:

```yaml
automation:
  - id: knx_heartbeat
    alias: KNX Heartbeat Home Assistant online
    triggers:
      - trigger: time_pattern
        minutes: "/1"
      - trigger: homeassistant
        event: start
    actions:
      - action: knx.send
        data:
          address: 5/0/0
          payload: 1
```

Bleibt das Telegramm aus, zeigt der X1 an, dass Home Assistant offline ist.

## Ein Leitfaden für neue Geräte

Damit künftige Geräte nach demselben Muster dazukommen, prüfe ich jedes neue Gerät in dieser Reihenfolge:

1. **Gibt es eine KNX-Variante?** Dann diese – sie läuft ohne Middleware.
2. **Kann der X1 es nativ, und reicht das für alle geplanten Logiken?** Dann im X1 einbinden.
3. **Sonst über Home Assistant**, bevorzugt lokal mit Push, dann lokal mit Polling, dann offizielle Cloud-API. Inoffizielle Cloud-Anbindungen nur für Komfort, nie für etwas, auf das sich eine Hausfunktion verlässt.

## Alles im Git-Repo

ETS- und GPA-Export, die Home-Assistant-Konfiguration ohne Zugangsdaten und die Dokumentation liegen bei mir in einem privaten Git-Repo. Jede Änderung ist ein Commit mit Beschreibung – und weil alles als Text vorliegt, kann Claude Code beim Schreiben von Automationen und Dokumentation mithelfen. Wie das konkret aussieht, beschreibe ich im nächsten Teil der Serie.
