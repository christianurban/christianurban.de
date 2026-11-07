---
title: PV-Überschussladen mit evcc und Home Assistant
description: Wie unser E-Auto möglichst mit Sonnenstrom lädt – evcc regelt Wallbox, Wechselrichter und Speicher, Home Assistant zeigt an und schaltet um, KNX bekommt die Werte.
date: 2026-11-07
tags: [home-assistant, smart-home, energie, evcc]
---

*Teil 3 der Serie „Smart Home mit Home Assistant“. In [Teil 1](../knx-gira-x1-home-assistant/) ging es um die Anbindung an KNX, in [Teil 2](../home-assistant-als-code/) darum, wie ich die Konfiguration als Code pflege.*

Auf dem Dach liegt eine PV-Anlage mit Fronius-Wechselrichter und BYD-Speicher, in der Garage hängt eine Wallbox, davor steht ein VW ID. Buzz. Das Ziel ist einfach: Das Auto soll möglichst mit dem Strom laden, den wir sonst für ein paar Cent ins Netz einspeisen würden. Die Umsetzung ist es weniger – und deshalb macht das bei uns nicht Home Assistant selbst, sondern [evcc](https://evcc.io/).

## Warum nicht einfach eine Automation?

Eine Automation „Wenn Einspeisung größer X, dann Wallbox an“ ist schnell geschrieben. Gut funktioniert sie nicht:

- **Wolken:** Der Überschuss schwankt im Minutentakt. Ohne Hysterese schaltet die Wallbox ständig an und aus.
- **Ladestrom nachführen:** Das Auto soll nicht nur an oder aus sein, sondern genau so viel laden, wie gerade übrig ist – und den Strom alle paar Sekunden anpassen.
- **Hausspeicher:** Lädt zuerst der Speicher oder das Auto? Und darf das Auto den Speicher leer ziehen?
- **Fahrzeug:** Ladestand und Ladelimit kommen vom Auto, nicht von der Wallbox.

evcc ist genau dafür gebaut. Es kennt Wechselrichter, Speicher, Wallboxen und Fahrzeuge vieler Hersteller und bringt eine durchdachte Regelung mit. Ich wollte das Rad nicht neu erfinden.

## Die Aufgabenteilung

Bei uns gilt eine klare Regel: **evcc regelt die Wallbox, sonst niemand.**

| System | Aufgabe |
|---|---|
| evcc | liest Wechselrichter, Speicher und Netz, regelt den Ladestrom, holt Ladestand vom Auto |
| Home Assistant | zeigt den Stand an, schaltet den Lademodus, schreibt Werte auf den KNX-Bus |
| KNX | Anzeige im Haus, Lademodus per Taster oder Gira-App umschalten |

evcc läuft als App direkt in Home Assistant. Backups und Updates laufen damit gemeinsam, und es gibt keinen zusätzlichen Rechner. Den Wechselrichter liest evcc per Modbus im lokalen Netz, die Wallbox spricht OCPP, das Auto kommt über die Fahrzeug-API von VW.

## Die evcc-Konfiguration

Die Konfiguration ist überschaubar. Stark gekürzt und ohne Zugangsdaten sieht sie so aus:

```yaml
meters:
  - name: netz
    type: template
    template: fronius-gen24
    usage: grid
  - name: pv
    type: template
    template: fronius-gen24
    usage: pv
  - name: speicher
    type: template
    template: fronius-gen24
    usage: battery

chargers:
  - name: wallbox
    type: template
    template: ocpp-wallbox

loadpoints:
  - title: Garage
    charger: wallbox
    mode: pv

site:
  meters:
    grid: netz
    pv: [pv]
    battery: [speicher]
```

Ein Wechselrichter liefert drei Zähler: Netz, PV und Speicher. Der Ladepunkt „Garage“ startet im Modus `pv`, also nur mit Überschuss. Zugangsdaten für das Auto liegen nicht im Repo – dort steht eine Version mit Platzhaltern, wie bei `secrets.yaml` in Home Assistant.

## Die Einstellungen, die den Unterschied machen

Ein paar Entscheidungen musste ich bewusst treffen:

- **Lademodi:** Aus, *Smart* (nur Überschuss), *Min + PV* (immer laden, mit Überschuss schneller) und *Schnell*. Im Alltag steht der Modus auf Smart.
- **Hysterese:** Der evcc-Standard passt: Start nach einer Minute Überschuss, Stopp nach drei Minuten Mangel.
- **Hausspeicher zuerst bis 50 %:** Bis dahin hat der Speicher Vorrang, darüber das Auto. So ist abends genug für das Haus da, und an sonnigen Tagen lädt trotzdem das Auto.
- **Keine Phasenumschaltung:** Unsere Wallbox lädt fest dreiphasig. Smart-Laden startet deshalb erst ab etwa 4,1 kW Überschuss (6 A × 3 Phasen × 230 V). An grauen Tagen reicht das oft nicht – dann gibt es Min + PV.
- **Kein fester Ladeplan:** Im Alltag brauchen wir keinen. Muss das Auto zu einer bestimmten Zeit voll sein, lege ich in der evcc-App einmalig einen Plan an.

## Home Assistant: Anzeige und Umschalten

evcc hat eine eigene Oberfläche und eine REST-API. Home Assistant fragt den Stand alle 30 Sekunden ab und macht daraus Sensoren – Ladeleistung, geladene Energie, Ladestand und Reichweite des Autos, angesteckt, lädt:

```yaml
rest:
  - resource: http://EVCC_HOST:7070/api/state
    scan_interval: 30
    sensor:
      - name: evcc Garage Ladeleistung
        unique_id: evcc_garage_ladeleistung
        value_template: "{{ value_json.loadpoints[0].chargePower | float(0) | round(0) }}"
        unit_of_measurement: W
        device_class: power
        state_class: measurement
```

Auf der Energie-Seite im Dashboard sieht man oben eine Ampel – grün für Überschuss, orange für Netzbezug, blau für Batteriebetrieb –, darunter den Energiefluss von PV zu Haus, Speicher, Netz und Wallbox und daneben den Ladepunkt mit Umschaltung des Lademodus. Die Zählerstände fließen außerdem in das eingebaute Energie-Dashboard von Home Assistant, inklusive Autarkie und Eigenverbrauch.

## KNX: der Lademodus am Taster

Weil im Haus alles auf KNX läuft, schreibt Home Assistant die wichtigsten Werte auch auf den Bus: Ladeleistung, Ladestand, ob das Auto angesteckt ist und ob es lädt. Der Lademodus geht als Zahl in beide Richtungen – 0 für Aus, 1 für Smart, 2 für Min + PV, 3 für Schnell. Kommt von einem Taster oder aus der Gira-App ein neuer Wert, ruft eine kleine Automation in Home Assistant das passende Skript auf, und evcc übernimmt.

So kann jeder in der Familie den Modus umschalten, ohne eine weitere App zu öffnen.

## Was ich gelernt habe

- **Spezialisierte Werkzeuge nutzen.** Home Assistant kann vieles, aber für das Laden ist evcc einfach besser. Die Integration über die API ist trotzdem eng genug.
- **Nur ein System regelt.** Zwei Regelungen für dieselbe Wallbox gehen garantiert schief. Home Assistant liest und schaltet Modi, mehr nicht.
- **Die Einstellungen dokumentieren.** Einiges speichert evcc in seiner Datenbank, nicht in der Konfigurationsdatei – etwa die Speicher-Priorität. Deshalb steht im Repo, was eingestellt ist und warum.

Und das Ergebnis? An sonnigen Tagen lädt der ID. Buzz praktisch kostenlos, und ich muss mich um nichts kümmern. Genau so soll sich Hausautomation anfühlen.
