---
title: Alle Komponenten im Blick mit Dependency-Track
description: Der Cyber Resilience Act verlangt Softwarestücklisten und den Umgang mit Schwachstellen. Im Code erledigen das Dependabot und Renovate – für alles andere bauen wir gerade Dependency-Track als zentrales System auf.
date: 2026-11-14
tags: [security, sbom, dependency-track, devops]
---

Welche Komponenten stecken eigentlich in unseren Produkten – und ist eine davon gerade von einer Sicherheitslücke betroffen? Für Code in einem Git-Repo lässt sich diese Frage gut beantworten. Für alles andere war sie bisher schwer zu beantworten. Genau das ändert sich gerade, und der Anstoß dafür kommt vom Gesetzgeber.

## Woher die Anforderung kommt

Zuerst dachte ich an NIS2. Beim Nachlesen zeigt sich aber: Die ausdrückliche Pflicht zur Softwarestückliste kommt aus dem **Cyber Resilience Act** (CRA, Verordnung (EU) 2024/2847).

- **Cyber Resilience Act:** Hersteller von Produkten mit digitalen Elementen müssen die enthaltenen Komponenten und Schwachstellen erfassen und dokumentieren – ausdrücklich auch, indem sie eine **Software Bill of Materials (SBOM)** in einem gängigen, maschinenlesbaren Format erstellen, mindestens für die direkten Abhängigkeiten (Anhang I, Teil II). Bekannte Schwachstellen müssen zügig behoben werden. Die Meldepflichten für aktiv ausgenutzte Schwachstellen gelten seit dem 11. September 2026, die übrigen Pflichten ab dem 11. Dezember 2027.
- **NIS2:** Die Richtlinie – in Deutschland umgesetzt mit dem NIS2-Umsetzungsgesetz, in Kraft seit Dezember 2025 – verlangt Sicherheit in der Lieferkette. Eine SBOM schreibt sie nicht ausdrücklich vor, ist aber ein naheliegendes Werkzeug, um diese Anforderung zu erfüllen.

Beides zusammen läuft auf dasselbe hinaus: Man muss wissen, was in den eigenen Produkten steckt, und Schwachstellen darin dauerhaft überwachen. (Das ist meine Lesart als Entwickler, keine Rechtsberatung.)

## Im Code ist das schon gelöst

In der Softwareentwicklung haben wir das weitgehend automatisiert. **Dependabot** und **Renovate** kennen die Abhängigkeiten aus den Manifesten der Repos, melden Schwachstellen und erstellen direkt Pull Requests mit dem Update. Wie wir Dependabot eingerichtet haben, steht in der Notiz [Dependabot-Sicherheitsupdates einrichten](../dependabot-security-updates/), warum ich es für unterschätzt halte, im [Meinungsbeitrag](../../meinung/dependabot/).

Diese Werkzeuge haben aber eine Grenze: Sie sehen nur, was in einem Manifest steht. Komponenten, die mit einem Produkt ausgeliefert oder installiert werden, ohne in einem Repo als Abhängigkeit zu stehen, bleiben unsichtbar. Und ein Überblick über *alle* Produkte entsteht so auch nicht – jedes Repo ist eine Insel.

## Dependency-Track als zentrales System

Für den Gesamtblick setzen wir auf [OWASP Dependency-Track](https://dependencytrack.org/). Es ist Open Source, ohne Lizenzkosten, und macht im Kern drei Dinge:

1. **SBOMs sammeln:** Für jedes Projekt nimmt Dependency-Track eine Stückliste im Format CycloneDX entgegen – per Weboberfläche oder automatisiert über die REST-API.
2. **Schwachstellen abgleichen:** Die Komponenten werden laufend mit Quellen wie der National Vulnerability Database, GitHub Advisories und OSV abgeglichen. Wird morgen eine neue Lücke bekannt, taucht sie auch bei einer Stückliste von gestern auf.
3. **Bewerten und benachrichtigen:** Befunde lassen sich bewerten („betrifft uns nicht, weil …“), Richtlinien prüfen Lizenzen und Schweregrade, und bei neuen Befunden gibt es Benachrichtigungen.

Wichtig ist das Wort *laufend*. Eine SBOM ist eine Momentaufnahme dessen, was im Produkt steckt. Die Bewertung, ob das sicher ist, ändert sich dagegen jeden Tag.

## Unsere Entscheidungen

Ein paar Punkte haben wir früh festgelegt:

- **Ein Projekt pro Produkt, nicht pro Repo.** Ein Produkt besteht oft aus mehreren Repos und bringt zusätzlich Fremdkomponenten mit, die in keinem Repo stehen. Deshalb bildet ein Projekt in Dependency-Track ein ausgeliefertes Produkt ab, die Projektversion entspricht der Produktversion. So lässt sich jeder Befund einem Produkt und einer Version zuordnen.
- **Jedes Produkt hat einen Owner.** Ein Dashboard voller Schwachstellen hilft niemandem, wenn sich keiner zuständig fühlt. Jedes Produkt wird deshalb einer verantwortlichen Person zugewiesen.
- **Ergänzung, kein Ersatz.** Dependabot und Renovate bleiben für die Repos zuständig, dort wird auch aktualisiert. Dependency-Track ist der zentrale Überblick und deckt zusätzlich ab, was die Code-Werkzeuge nicht sehen.
- **Version 5.** Dependency-Track 5 ist seit Juni 2026 allgemein verfügbar, für Version 4 endet die Unterstützung absehbar. Für einen Neuaufbau war die Wahl damit klar.

## Erste Erfahrungen

Wir stehen noch ganz am Anfang. Die ersten Tests laufen aber gut:

- **Aus GitHub automatisiert importieren.** Die Stücklisten unserer Repos exportieren wir aus GitHub und importieren sie automatisiert in Dependency-Track. Ein Stolperstein dabei: GitHub liefert SBOMs im Format SPDX, Dependency-Track liest CycloneDX. Das muss man einplanen, etwa mit einer Konvertierung oder indem man CycloneDX direkt im Build erzeugt.
- **Komponenten ohne Paketmanager.** Für Fremdkomponenten, die nicht aus npm, NuGet oder Maven kommen, gibt es keine Paket-URL. Hier hilft die CPE-Kennung, über die die National Vulnerability Database Produkte identifiziert. Ob eine Komponente richtig erkannt wird, steht und fällt mit dieser Angabe.
- **Vollständigkeit bleibt Arbeit.** Dependency-Track bewertet nur, was in der Stückliste steht. Dass dort wirklich alles steht, muss jemand sicherstellen – auch das ist eine Aufgabe des Owners.

Als Nächstes bauen wir die übrigen Produkte in Dependency-Track auf, also genau die, bei denen es keinen automatischen Export aus einem Repo gibt.

## Mein Fazit

Der Cyber Resilience Act macht aus einer guten Praxis eine Pflicht. Das ist gar nicht schlecht: Die Frage „Sind wir von dieser Lücke betroffen?“ sollte man ohnehin in Minuten beantworten können, nicht in Tagen. Im Code liefern Dependabot und Renovate das schon heute. Mit Dependency-Track kommt jetzt der Rest dazu – ein Ort, an dem alle Produkte, ihre Komponenten und ihre Verantwortlichen zusammenlaufen.
