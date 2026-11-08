---
title: Hue, Shelly, Mähroboter und Küchengeräte in Home Assistant
description: Was neben KNX noch im Haus steckt und wie es in Home Assistant gelandet ist – lokale und Cloud-Integrationen, Entwicklerkonten, Umbenennen und bewusst weggelassene Funktionen.
date: 2026-11-08
tags: [home-assistant, smart-home, hue, shelly]
---

*Teil 4 der Serie „Smart Home mit Home Assistant“. Bisher: [KNX und Gira X1 anbinden](../knx-gira-x1-home-assistant/), [Home Assistant als Code](../home-assistant-als-code/) und [PV-Überschussladen mit evcc](../pv-ueberschussladen-evcc/).*

KNX ist bei uns das Rückgrat. Daneben gibt es aber, wie in fast jedem Haus, Geräte mit eigener App: Hue-Leuchten, ein paar Shellys, einen Mähroboter von Husqvarna und Küchengeräte mit Home Connect. Genau dafür habe ich mich für Home Assistant entschieden – es spricht mit all diesen Systemen. Hier ist, wie die Einbindung lief, was gut funktioniert hat und was ich bewusst weggelassen habe.

## Lokal oder Cloud – die wichtigste Frage

Bei jeder Integration schaue ich zuerst, wie sie mit dem Gerät spricht:

| Gerät | Integration | Verbindung |
|---|---|---|
| Philips Hue | Hue | lokal über die Bridge |
| Shelly | Shelly | lokal, ohne Cloud |
| Husqvarna Automower | Husqvarna Automower | Cloud (Automower Connect) |
| Spülmaschine, Kochfeld | Home Connect | Cloud des Herstellers |

Lokal ist mir lieber: schneller, unabhängig vom Internet und vom Hersteller. Bei Mähroboter und Küchengeräten gibt es aber keine sinnvolle lokale Alternative. Das ist in Ordnung, solange klar ist, was ohne Internet nicht geht – und nichts Wichtiges davon abhängt.

## Hue und Shelly: schnell eingebunden, wenig zu tun

**Hue** war in wenigen Minuten erledigt: Bridge erkennen lassen, Knopf drücken, fertig. Die Hue-Leuchten bei uns hängen im Flur, im Abstellraum und im Garten. Im Flur und Abstellraum sind sie an KNX-Aktoren angeschlossen, die ohnehin gezählt und über „Alles aus“ geschaltet werden. Viele Ideen aus der ursprünglichen Planung – Hue in die Lichtzählung aufnehmen, Farbszenen, Orientierungslicht nachts – haben sich damit erledigt. Das Issue habe ich trotzdem sauber abgeschlossen und jeweils notiert, *warum* etwas entfällt.

Eine Folge davon: Schaltet KNX den Strom ab, meldet Home Assistant die Hue-Lampe als „nicht verfügbar“. Das ist normal, darf aber keine Warnung auslösen. Auf meiner Seite „Haustechnik“ sind nicht verfügbare Geräte deshalb nach Integration gruppiert, jeweils mit einem Hinweis, was dort normal ist.

**Shelly** läuft ebenfalls lokal. Die Shellys schalten Leuchten in Zimmerecken und eine Steckdose. Die eigentliche Logik – Zeitschaltuhren, Szenen – bleibt im Gira X1, der die Shellys direkt anspricht. Home Assistant zeigt die Schalter auf den Raumseiten, schaltet sie beim Verlassen des Hauses aus und meldet im Hausstatus Überhitzung, Überlast oder wenn ein Gerät nicht erreichbar ist.

Eine bewusste Entscheidung: **kein Energie-Tracking** für die Shellys. Die Messwerte gibt es, aber an den Geräten hängen nur kleine Lampen. Seit dem Einbau 2022/23 kamen insgesamt gut 2 kWh zusammen – rund 70 Cent. Das gehört nicht ins Energie-Dashboard, sondern höchstens in eine Fußnote.

## Mähroboter und Küchengeräte: erst ein Entwicklerkonto

Bei den Cloud-Integrationen war die Einrichtung aufwendiger. Sowohl Husqvarna als auch Home Connect verlangen eine **eigene Anwendung in ihrem Entwicklerportal**: anmelden, Anwendung anlegen, Redirect-URL von Home Assistant eintragen, Client-ID und Secret in Home Assistant hinterlegen.

Zwei Stolperfallen:

- **Bei Husqvarna braucht die Anwendung zwei APIs:** die Authentication API *und* die Automower Connect API. Fehlt eine, bricht die Einrichtung ab.
- **Die Anmeldung am besten am PC machen.** In der iPhone-App ging beim Zurückspringen aus dem Browser der Anmeldevorgang verloren.

Die Zugangsdaten liegen nur in Home Assistant, nicht im Repo – dort steht nur dokumentiert, *wie* die Anwendung eingerichtet ist.

## Was daraus geworden ist

**Mähroboter:** Eine Kachel auf der Startseite zeigt „Mäht · 80 %“ oder „Angedockt · 100 %“, bei einem Problem den Fehler. Auf der Seite für den Außenbereich gibt es Start, Pause, Parken, den nächsten Start und die Betriebsstunden des Messers. Bei einem Fehler, der länger als zwei Minuten ansteht, kommt eine Push-Nachricht aufs Handy.

**Spülmaschine:** Home Assistant kennt Programm, Fortschritt und Endzeit. Die Startseite zeigt „läuft bis 14:35“, und wenn sie fertig ist, sagt Sonos im Wohnzimmer Bescheid – nur wenn jemand zu Hause ist und nicht nachts. Der Hinweis bleibt im Hausstatus, bis die Tür geöffnet wird. Das ist die Automation, die im Alltag am meisten genutzt wird.

**Kochfeld:** Viel braucht es hier nicht. Aber eine Warnung „Kochfeld an, niemand zu Hause“ im Hausstatus ist ein beruhigendes Detail.

## Was ich gelernt habe

- **Umbenennen lohnt sich.** Integrationen legen Entitäten nach Gerätenamen oder MAC-Adresse an, der Mähroboter hieß zuerst `garden_…`. Ich benenne sofort nach einem festen Schema um – Home Assistant übernimmt Verlauf und Statistik. Später, wenn Automationen und Dashboards darauf verweisen, ist es viel mehr Arbeit.
- **Nicht alles aktivieren.** Manche Integrationen bringen Dutzende Entitäten mit, einige standardmäßig deaktiviert – etwa „Salz fast leer“ bei der Spülmaschine. Ich schalte nur ein, was ich wirklich nutze.
- **Entscheidungen aufschreiben – auch die gegen etwas.** Warum es kein Energie-Tracking für die Shellys gibt oder warum Hue nicht in die Lichtzählung kommt, steht im Repo. Sonst stelle ich mir dieselbe Frage in einem halben Jahr wieder.
- **Nicht jedes Gerät muss smart sein.** Waschmaschine, Trockner und Backofen hängen nicht an Home Connect. Eine Fertig-Meldung ginge nur über Messsteckdosen. Das kommt vielleicht irgendwann – nötig ist es nicht.

Das Schöne daran: Für die Familie sieht alles gleich aus. Ob ein Wert vom KNX-Bus, aus der Hue-Bridge oder aus der Cloud von Husqvarna kommt, spielt auf dem Dashboard keine Rolle.
