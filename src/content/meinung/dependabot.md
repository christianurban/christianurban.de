---
title: Dependabot ist eines der besten Gratis-Features von GitHub
description: Abhängigkeiten aktuell halten und Sicherheitslücken schließen, ohne dass jemand daran denken muss – Dependabot erledigt das, und die Kernfunktionen kosten nichts.
date: 2026-11-04
tags: [github, dependabot, security, devops]
---

Jedes Projekt hat Abhängigkeiten, und jede Abhängigkeit altert. Irgendwann taucht eine Sicherheitslücke auf, oder ein Update ist so weit weg, dass es niemand mehr anfassen möchte. Ich finde: Genau dafür ist [Dependabot](https://docs.github.com/de/code-security/dependabot) eines der besten Features, die GitHub zu bieten hat – und die Kernfunktionen sind kostenlos.

## Was Dependabot macht

Dependabot hat drei Bausteine, die sich ergänzen:

- **Warnungen (Alerts):** GitHub gleicht die Abhängigkeiten eines Repos mit der GitHub Advisory Database ab und meldet bekannte Schwachstellen.
- **Sicherheitsupdates:** Für eine gemeldete Lücke erstellt Dependabot direkt einen Pull Request, der auf eine sichere Version anhebt.
- **Versionsupdates:** Mit einer kleinen Datei `.github/dependabot.yml` hält Dependabot Pakete und GitHub Actions regelmäßig aktuell – auch ohne Sicherheitsanlass.

Am Ende steht immer ein normaler Pull Request. Die Pipeline baut und testet ihn, ich schaue drauf und merge. Kein zusätzliches Werkzeug, kein eigenes Dashboard, das niemand öffnet.

## Klein anfangen: diese Seite

Auch diese Webseite nutzt Dependabot: Einmal pro Woche kommen Updates für npm-Pakete und GitHub Actions, zusammengehörige Pakete gebündelt in einem PR. Sicherheitsupdates kommen sofort. Wie das eingerichtet ist – vom einzelnen Repo bis zur ganzen Enterprise –, beschreibe ich in der Notiz [Dependabot-Sicherheitsupdates einrichten](../../notizen/dependabot-security-updates/).

## Groß denken: für alle Organisationen

Auf der Arbeit haben wir Dependabot gerade in unserer GitHub Enterprise für alle Organisationen aktiviert. Der Unterschied zum Einzelprojekt: Niemand muss mehr daran denken, es pro Repo einzuschalten. Jedes Repo bekommt Warnungen und Sicherheitsupdates – auch das alte Projekt, das gerade niemand aktiv pflegt. Gerade dort schlummern die meisten Lücken.

## Warum ich es für unterschätzt halte

- **Kostenlos:** Warnungen, Sicherheits- und Versionsupdates kosten nichts. Erst Extras wie das Zuweisen von Warnungen an Personen oder organisationsweite eigene Regeln für private Repos setzen GitHub Advanced Security bzw. Code Security voraus.
- **Wenig Aufwand:** Einschalten, eine YAML-Datei – fertig. Der Rest läuft über den gewohnten PR-Prozess.
- **Kleine Schritte statt großer Sprünge:** Wer jede Woche ein paar kleine Updates mergt, steht nie vor dem gefürchteten „drei Major-Versionen auf einmal“.
- **Sicherheit wird sichtbar:** Lücken landen dort, wo Entwickler ohnehin arbeiten – im Repo, als PR.

## Und was ist mit Dependency-Track?

Dependabot ersetzt keinen Überblick über alle Produkte. Dafür baue ich gerade [Dependency-Track](https://dependencytrack.org/) auf, das SBOMs zentral auswertet. Beides ergänzt sich gut: Dependency-Track zeigt das Gesamtbild, Dependabot sorgt direkt im Repo dafür, dass Lücken geschlossen werden.

## Mein Fazit

Wer auf GitHub arbeitet und Dependabot nicht eingeschaltet hat, verschenkt etwas. Es kostet nichts, ist in Minuten eingerichtet und nimmt einem genau die Arbeit ab, die sonst liegen bleibt.
