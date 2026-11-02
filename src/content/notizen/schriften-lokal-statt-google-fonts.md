---
title: Schriften lokal einbinden statt über Google Fonts
description: Mit Fontsource kommen Webfonts als npm-Paket ins Projekt und werden von der eigenen Seite ausgeliefert – ohne Anfrage an Google.
date: 2026-11-02
tags: [astro, dsgvo, webfonts]
---

Der klassische Weg zu einer schönen Schrift ist ein `<link>` auf `fonts.googleapis.com`. Dabei lädt der Browser jedes Besuchers die Schrift von Google-Servern – und überträgt dabei seine IP-Adresse. Das Landgericht München I hat 2022 entschieden, dass das ohne Einwilligung gegen die DSGVO verstößt (Az. 3 O 17493/20). Für eine Seite aus Deutschland heißt das: Schriften besser selbst ausliefern.

## Fontsource

[Fontsource](https://fontsource.org) stellt praktisch alle Google Fonts als npm-Pakete bereit:

```bash
npm i @fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource/jetbrains-mono
```

Im Layout werden die CSS-Dateien importiert:

```astro
---
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource/jetbrains-mono/500.css';
---
```

Astro bündelt die Schriftdateien beim Build nach `dist/_astro/` – sie kommen von der eigenen Domain.

## Worauf ich geachtet habe

- **Variable Fonts** (`@fontsource-variable/...`), wenn verfügbar: eine Datei für alle Schriftstärken statt einer pro Stärke.
- **Nur benötigte Schnitte importieren**, etwa `jetbrains-mono/500.css` statt des ganzen Pakets.
- **Familienname anpassen:** Variable Fonts heißen in CSS mit Zusatz, z. B. `'Inter Variable'` statt `'Inter'`. Eine sinnvolle Fallback-Kette (`system-ui, -apple-system, 'Segoe UI', sans-serif`) gehört trotzdem dazu.
- Unicode-Bereiche wie Kyrillisch oder Griechisch werden zwar mitgebaut, aber per `unicode-range` nur geladen, wenn die Seite solche Zeichen enthält.

Nebeneffekt: Ohne den Umweg über einen weiteren Server lädt die Seite meist sogar schneller.
