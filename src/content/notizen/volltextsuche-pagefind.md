---
title: Volltextsuche für statische Seiten mit Pagefind
description: Suche ohne Server, ohne Datenbank und ohne externen Dienst – wie Pagefind den Suchindex beim Build erzeugt, wie ich ihn in Astro eingebunden habe und welche Stolperfallen es gab.
date: 2026-11-21
tags: [astro, pagefind, github-pages]
---

Diese Seite ist statisch: Astro erzeugt HTML-Dateien, GitHub Pages liefert sie aus. Das ist schnell, günstig und sicher – aber eine Suche braucht normalerweise einen Server oder einen externen Dienst. Beides wollte ich nicht. Die Lösung ist [Pagefind](https://pagefind.app/): Der Suchindex entsteht beim Build und wird einfach mit ausgeliefert. Gesucht wird im Browser.

## Wie Pagefind funktioniert

Pagefind läuft nach dem eigentlichen Build über die fertigen HTML-Dateien und erzeugt daraus einen Index im Ordner `pagefind/`. Der Clou: Der Index ist in kleine Stücke aufgeteilt. Bei einer Suche lädt der Browser nur die Teile, die er für die eingegebenen Wörter braucht, und die Auszüge der Treffer.

Bei dieser Seite ist der komplette Index rund 200 KB groß – einschließlich einer kleinen WebAssembly-Datei, die die Suche ausführt. Geladen wird davon pro Suche nur ein Bruchteil. Auch bei Tausenden Seiten bleibt das handlich.

Die Einbindung in den Build ist eine Zeile in der `package.json`:

```json
"scripts": {
  "build": "astro build && pagefind --site dist"
}
```

Pagefind ist als Entwicklungsabhängigkeit installiert. Der GitHub-Actions-Workflow musste nicht angepasst werden – er ruft ohnehin `npm run build` auf.

## Festlegen, was durchsucht wird

Ohne weitere Angaben indexiert Pagefind jede Seite komplett, inklusive Navigation und Fußzeile. Das will man nicht: Sonst passt jede Seite auf die Suche nach „Impressum“. Mit ein paar Attributen im HTML lässt sich das steuern:

```astro
<article data-pagefind-body data-pagefind-meta={`rubrik:${section.label}`}>
  <a href="/notizen/" data-pagefind-ignore>← Notizen</a>
  <span class="kicker" data-pagefind-ignore>
    <time data-pagefind-meta="datum">{formatDate(date)}</time>
  </span>
  <h1 data-pagefind-meta="title">{title}</h1>
  <p class="lede" data-pagefind-meta="beschreibung">{description}</p>
  …
</article>
```

- **`data-pagefind-body`** markiert den Bereich, der durchsucht wird. Sobald ein Element auf der Seite dieses Attribut hat, ignoriert Pagefind alle Seiten ohne – Übersichten, Tag-Seiten und das Impressum tauchen also nicht in den Treffern auf.
- **`data-pagefind-ignore`** nimmt einzelne Elemente aus, etwa den Zurück-Link oder die Serien-Navigation, die sonst die Titel aller anderen Teile in jeden Beitrag tragen würde.
- **`data-pagefind-meta`** speichert Metadaten wie Titel, Datum und Rubrik, die ich in den Treffern anzeige.

## Eine eigene Oberfläche statt der Standard-UI

Pagefind bringt eine fertige Suchoberfläche mit. Ich habe stattdessen die JavaScript-API genutzt, damit die Treffer genauso aussehen wie die übrigen Karten der Seite:

```js
const pagefind = await import('/pagefind/pagefind.js');
await pagefind.options({ excerptLength: 24 });

const search = await pagefind.debouncedSearch(term, {}, 200);
const results = await Promise.all(search.results.slice(0, 20).map((r) => r.data()));
// results[i].meta.title, .meta.datum, .excerpt (Treffer mit <mark> markiert), .url
```

`debouncedSearch` wartet, bis man kurz aufhört zu tippen, und verwirft überholte Anfragen. Die Daten eines Treffers lädt erst `data()` – so werden nur die Auszüge geholt, die auch angezeigt werden. Den Suchbegriff schreibe ich zusätzlich als `?q=` in die URL. Damit lässt sich eine Suche verlinken, etwa [nach „Home Assistant“](../../suche/?q=home%20assistant).

## Stolperfallen

- **Mehrere Metadaten in einem Attribut gehen nicht.** Mein erster Versuch war `data-pagefind-meta="rubrik:Notizen, datum:…"`. Heraus kam eine Rubrik „Notizen, datum:…“. Jede weitere Angabe kommt deshalb an ein eigenes Element.
- **Ignorieren heißt nicht vergessen.** `data-pagefind-ignore` nimmt Text aus dem Suchindex, Metadaten darin werden aber trotzdem gelesen. Genau das nutze ich beim Datum: Es steht als Metadatum in der Trefferliste, taucht aber nicht in den Auszügen auf.
- **Deutsch braucht nur `lang="de"`.** Pagefind erkennt die Sprache am `<html>`-Element und nutzt dann eine deutsche Wortstammbildung. „Automation“ findet so auch „Automationen“.
- **Im Dev-Server gibt es keinen Index.** Er entsteht erst beim Build. Zum Testen der Suche braucht es `npm run build` und `npm run preview`. Die Suchseite zeigt im Dev-Server deshalb einen Hinweis statt einer Fehlermeldung.
- **Zusammengesetzte Wörter.** Die deutsche Wortzerlegung findet manchmal mehr als erwartet, selbst bei Fantasiebegriffen. Für eine kleine Seite ist das eher hilfreich als störend.

## Mein Fazit

Pagefind passt perfekt zu einer statischen Seite: kein Server, keine Datenbank, kein externer Dienst, keine Kosten – und keine Daten über Suchanfragen, die irgendwo anders landen. Der meiste Aufwand steckte in der eigenen Oberfläche, nicht in Pagefind selbst. Wer eine Seite mit Astro, Hugo, Eleventy oder einem anderen Generator betreibt, sollte es sich ansehen.
