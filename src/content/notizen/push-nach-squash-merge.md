---
title: Commits nach dem Merge – und warum Git sie nicht vermisst
description: Wer auf einen Branch pusht, dessen PR schon gemergt ist, verliert die Änderungen stillschweigend. Nach einem Squash-Merge hilft auch git merge-base nicht weiter.
date: 2026-11-02
tags: [git, github]
---

Beim Bau dieser Seite ist mir Folgendes passiert: Ein Pull Request war offen, und ich habe noch zwei kleine Korrekturen nachgeschoben. Sie landeten per `git push` auf dem Feature-Branch. Was ich nicht bemerkt hatte: Der PR war in der Zwischenzeit schon gemergt.

Der Push lief trotzdem problemlos durch. GitHub hängt neue Commits nur an *offene* PRs an – ein gemergter PR bleibt, wie er ist. Die Korrekturen lagen also auf einem Branch, den niemand mehr anschaut.

## Prüfen, was wirklich auf `main` ist

Naheliegend wäre:

```bash
git merge-base --is-ancestor <commit> origin/main && echo "ist drin"
```

Nach einem **Squash-Merge** sagt das aber für jeden Commit des Branches „nicht drin“ – auch für die, deren Inhalt längst auf `main` ist. Beim Squashen entsteht ein neuer Commit, die ursprünglichen Commits sind nie Vorfahren von `main`.

Verlässlich ist der Vergleich des Inhalts:

```bash
git diff origin/main feature/branch -- src/
```

Ist der Diff leer, ist alles angekommen. Zeigt er etwas, fehlt genau das auf `main`.

## Wie ich es künftig vermeide

- **Vor dem Nachschieben den PR-Status prüfen:** `gh pr view --json state` zeigt `OPEN` oder `MERGED`.
- **Nach dem Merge den Branch löschen lassen** (*Settings → General → Automatically delete head branches*). Ein späterer Push meldet dann `* [new branch]` statt eines Updates – ein deutliches Warnsignal.
- **Fehlende Änderungen sauber nachreichen:** neuen Branch von `origin/main`, nur die fehlenden Commits per `git cherry-pick` übernehmen, neuer PR. Bereits enthaltene Commits führen beim Cherry-Pick zu einem leeren Commit – dann einfach `git cherry-pick --skip`.
