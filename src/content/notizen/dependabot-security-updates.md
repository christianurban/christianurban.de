---
title: Dependabot-Sicherheitsupdates einrichten – vom Repo bis zur Enterprise
description: Warnungen einschalten, Sicherheits-PRs automatisch erstellen lassen, Updates bündeln und Rauschen herausfiltern – eine kurze Anleitung.
date: 2026-11-04
tags: [github, dependabot, security]
---

Warum ich Dependabot für eines der besten Gratis-Features von GitHub halte, steht in meinem [Meinungsbeitrag](../../meinung/dependabot/). Hier geht es um das Wie: Sicherheitsupdates einschalten, sinnvoll konfigurieren und Rauschen vermeiden.

## Was bei einer Sicherheitslücke passiert

1. **Warnung:** GitHub gleicht die Abhängigkeiten des Repos mit der GitHub Advisory Database ab. Wird eine Schwachstelle bekannt, erscheint eine Dependabot-Warnung im Reiter *Security*.
2. **Pull Request:** Sind Sicherheitsupdates aktiv, erstellt Dependabot automatisch einen PR, der das Paket auf die nächste sichere Version hebt – samt Release Notes und Hinweis auf die Lücke.
3. **Merge:** Die Pipeline baut und testet den PR wie jeden anderen. Nach dem Merge wird die Warnung automatisch geschlossen.

Sicherheitsupdates kommen sofort, unabhängig vom Zeitplan der Versionsupdates.

## Einschalten: Repo, Organisation, Enterprise

- **Einzelnes Repo:** *Settings → Advanced Security* (früher *Code security*): *Dependabot alerts* und *Dependabot security updates* aktivieren. Per CLI geht es auch:

  ```bash
  gh api -X PUT repos/<owner>/<repo>/vulnerability-alerts
  gh api -X PUT repos/<owner>/<repo>/automated-security-fixes
  ```

- **Organisation:** Über *Security configurations* legt man fest, welche Funktionen für alle Repos gelten – etwa die von GitHub empfohlene Konfiguration. Neue Repos bekommen sie automatisch.
- **Enterprise:** Auf Enterprise-Ebene lassen sich Sicherheitskonfigurationen für alle Organisationen auf einmal ausrollen. So haben wir es auf der Arbeit gemacht – damit hängt nichts mehr davon ab, dass jemand pro Repo daran denkt.

## Versionsupdates mit `dependabot.yml`

Sicherheitsupdates brauchen keine Konfigurationsdatei. Wer zusätzlich regelmäßig aktualisieren möchte, legt `.github/dependabot.yml` an. Für diese Seite sieht das so aus:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      timezone: Europe/Berlin
    groups:
      astro:
        patterns: ['astro', '@astrojs/*']
      fonts:
        patterns: ['@fontsource*']
      dev:
        dependency-type: development

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    groups:
      actions:
        patterns: ['*']
```

Die Gruppen sorgen dafür, dass zusammengehörige Pakete in einem PR kommen statt in fünf.

## Sicherheitsupdates bündeln

Auch Sicherheitsupdates lassen sich gruppieren – entweder per Schalter in den Einstellungen von Repo oder Organisation oder gezielt in der `dependabot.yml`:

```yaml
    groups:
      security:
        applies-to: security-updates
        patterns: ['*']
```

Dependabot fasst dann möglichst viele Sicherheitsupdates eines Ökosystems in einem PR zusammen. Versions- und Sicherheitsupdates werden dabei nie gemischt.

## Rauschen vermeiden: Auto-Triage-Regeln

Nicht jede Warnung ist relevant – etwa eine Lücke in einem Entwicklungswerkzeug, das nie in Produktion läuft. Mit [Auto-Triage-Regeln](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-auto-triage-rules) lassen sich Warnungen automatisch verwerfen oder zurückstellen, bevor überhaupt eine Benachrichtigung rausgeht. GitHub liefert dafür vordefinierte Regeln mit; eigene Regeln für private Repos setzen GitHub Advanced Security bzw. Code Security voraus.

## Meine Tipps

- **Erst Warnungen, dann Updates:** Wer Dependabot organisationsweit einführt, sollte vorher abschätzen, wie viele PRs auf einen Schlag entstehen.
- **Gute Tests sind die halbe Miete:** Je verlässlicher die Pipeline, desto entspannter lassen sich Updates mergen.
- **Regelmäßig mergen:** Kleine wöchentliche Updates sind harmloser als ein großer Sprung alle paar Monate.

Mehr Details stehen in der [GitHub-Doku zu Dependabot-Sicherheitsupdates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates).
