---
title: Claude Desktop über Microsoft Foundry – ein PoC mit LiteLLM
description: Wie bekommen Kolleginnen und Kollegen ohne Team-Seat Claude Desktop mit Chat, Cowork und Code? Wir bauen gerade einen PoC über Microsoft Foundry, ein LiteLLM-Gateway und ein hartes Budget pro Person.
date: 2026-11-28
tags: [ki, claude, azure, litellm, intune]
---

Wir nutzen Claude im Team-Plan. Die Seats sind aber begrenzt, und längst nicht jede Person, die Claude ausprobieren möchte, braucht einen vollen Seat. Gleichzeitig soll niemand mit privaten Konten oder kopierten API-Keys arbeiten. Die Frage war also: Wie geben wir weiteren Personen Claude Desktop – mit Chat, Cowork und Code –, ohne dass die Kosten davonlaufen?

Die Antwort, die wir gerade in einem Proof of Concept ausprobieren, heißt intern **Claude 3P**. Claude Desktop kann nicht nur mit einem claude.ai-Konto arbeiten, sondern auch mit einem Modell-Anbieter eines Drittanbieters – „third party“, daher der Name. Bei uns ist das Microsoft Foundry, also Claude über die eigene Azure-Subscription.

## Die Idee in einem Satz

Claude Desktop spricht nicht direkt mit Foundry, sondern mit einem **eigenen Gateway**, das jede Anfrage einer Person zuordnet und ihr ein **festes Monatsbudget** gibt. Den nötigen Schlüssel bekommt niemand von Hand – er wird im Hintergrund per Windows-Anmeldung geholt.

```text
Schlüssel:  Claude Desktop → Credential Helper → Key-Broker → LiteLLM
            (fragt nach)     (Windows-SSO)       (prüft Gruppe, erzeugt Key)

Anfragen:   Claude Desktop → LiteLLM-Gateway → Microsoft Foundry
            (mit Key)        (Budget prüfen)   (Claude-Modelle)
```

## Die Bausteine

### Microsoft Foundry

Foundry stellt die Modelle bereit – Sonnet, Haiku und Opus – und rechnet über die Azure-Subscription ab. Zwei Erkenntnisse aus dem Refinement:

- **Nicht jede Subscription geht.** Claude ist in Foundry nicht für CSP-Subscriptions verfügbar, wohl aber für ein Enterprise Agreement.
- **Nicht jede Region geht.** In Germany West Central gibt es keine Claude-Modelle. Foundry liegt deshalb in Sweden Central, alles andere bleibt in Deutschland.

### LiteLLM als Gateway

[LiteLLM](https://github.com/BerriAI/litellm) ist ein Open-Source-Proxy, der eine einheitliche API vor viele Modell-Anbieter setzt. Für uns zählen drei Funktionen: Modell-Aliasse (`claude-sonnet`, `claude-haiku`, `claude-opus`), virtuelle Keys pro Person und Budgets auf Team- und Nutzerebene.

LiteLLM läuft als Azure Container App mit eigenem Image und gepinnter Version, Nutzer, Keys und Verbräuche liegen in PostgreSQL. Eine Entscheidung haben wir früh getroffen: **Prompts und Antworten werden nicht gespeichert** – weder in der Datenbank noch in den Logs. Gespeichert wird nur, was für die Abrechnung nötig ist: wer, welches Modell, wie viele Tokens, welche Kosten.

Spannend war die Frage nach der Identität. Anmeldung per SSO oder JWT ist bei LiteLLM ein Enterprise-Feature. Statt einer kostenpflichtigen Gateway-Lizenz identifiziert sich jede Person über einen **eigenen virtuellen Key**. Damit stellt sich sofort die nächste Frage: Wie kommt dieser Key auf das Gerät?

### Budgets und Modelle

Die Kostenbremse ist der Kern des PoC:

- **Ein Team-Budget pro Monat** als Obergrenze für alle zusammen.
- **Ein Budget pro Person**, gebunden an den Nutzer und nicht an einen Key. Wer zwei Geräte hat, teilt sich das Budget – ist es aufgebraucht, werden beide abgewiesen, bis es sich nach 30 Tagen zurücksetzt.
- **Sonnet und Haiku für alle, Opus nur auf Antrag.** Ein Admin trägt das Modell beim Nutzer ein.

Nach einem Abrechnungsmonat vergleichen wir die Summen in LiteLLM mit den Foundry-Kosten auf der Azure-Rechnung. Mehr als 5 % Abweichung sollen es nicht sein – sonst stimmt die Zuordnung nicht.

### Der Key-Broker

Der Key-Broker ist eine kleine Azure Function in C#. Sie ist neben LiteLLM die einzige Komponente, die den Master-Key von LiteLLM kennt. Ruft man `GET /api/key` mit einem gültigen Entra-Token auf, passiert Folgendes:

1. Der Broker prüft das Token und die **Mitgliedschaft in einer Entra-Gruppe** – inklusive verschachtelter Gruppen, per Microsoft Graph bei jedem Aufruf.
2. Gibt es die Person in LiteLLM noch nicht, legt er sie mit den Standardwerten an: Team, Budget, erlaubte Modelle.
3. Er erzeugt einen neuen Key für dieses Gerät mit 30 Tagen Laufzeit, löscht den alten Key desselben Geräts und gibt den neuen zurück. Speichern tut er ihn nicht.

Dazu kommt ein täglicher Abgleich: Wer nicht mehr in der Gruppe ist, wird in LiteLLM gesperrt, alle Keys werden gelöscht. Spätestens am Folgetag ist der Zugang weg. Liefert Graph einen Fehler oder eine unvollständige Liste, wird niemand gesperrt – lieber einen Tag zu lang Zugang als ein versehentlicher Massen-Ausschluss.

### Der Credential Helper

Claude Desktop kann für den Schlüssel ein externes Programm aufrufen. Unser Credential Helper ist eine .NET-Konsolenanwendung als signierte Single-File-EXE. Ihr Vertrag ist bewusst schmal: **Key auf stdout, sonst nichts.** Bei einem Fehler gibt es einen Exit-Code ungleich 0 und eine Meldung auf stderr.

Der Ablauf:

- Liegt ein Key mit mehr als drei Tagen Restlaufzeit im Windows Credential Store, gibt der Helper ihn sofort aus – ohne Netzwerk.
- Sonst holt er per MSAL und dem Windows-Broker (WAM) still ein Entra-Token, ruft den Key-Broker auf und speichert den neuen Key.
- Klappt die stille Anmeldung nicht, zeigt er einmal den Windows-Anmeldedialog.

Der Key liegt ausschließlich im Credential Store der Person – nicht in Dateien, nicht in der Registry, nicht in Logs. Niemand muss je einen Key sehen, kopieren oder eintippen.

### Verteilung per Intune

Auf die Geräte kommt alles über Intune, zugewiesen an dieselbe Entra-Gruppe: Claude Desktop, der Helper und eine verwaltete Konfiguration als `.reg`. Die Konfiguration setzt das Gateway als Anbieter, den Helper als Quelle für den Schlüssel, Sonnet als Standardmodell – und lässt nur diesen Modus zu, ohne Anmeldung bei claude.ai. Die Telemetrie an Anthropic ist auf Vorgabe der Informationssicherheit komplett aus.

Ein Detail, das man leicht übersieht: **Claude Desktop muss als `.msix` verteilt werden.** Mit dem `.exe`-Installer fehlt Cowork.

Der Zugang wird also an genau einer Stelle gesteuert: Wer in die Gruppe kommt, bekommt App, Konfiguration und beim ersten Start einen Key. Wer die Gruppe verlässt, verliert über den täglichen Abgleich den Zugang – die App bleibt installiert, funktioniert aber nicht mehr.

## Wie wir arbeiten

Der PoC ist auch ein Testfeld für unsere Arbeitsweise mit KI. Die Anforderungen stehen als [OpenSpec](../../notizen/spec-driven-development-openspec/)-Spezifikationen im Repository – je Baustein eine: Infrastruktur, Gateway, Key-Broker, Credential Helper, Verteilung und Pipeline. Entstanden sind sie aus einem Umsetzungskonzept.

Aus den Specs wurden Work Items, und jedes davon ging durch den [Refinement-Skill](../../notizen/refinement-skill-claude-code/). Das hat sich gelohnt. Ein paar Beispiele, was dabei herauskam:

- **Aufteilen.** Aus einer großen Infrastruktur-Story wurden drei: Basis mit Foundry, Hosting des Gateways und Hosting des Key-Brokers. Die Pipeline wurde in einen Workflow pro Komponente geschnitten.
- **Entscheiden statt annehmen.** Budgets als feste USD-Beträge statt umgerechneter Euro, das Rate Limit des Brokers pro Instanz im Speicher statt in einer Datenbank, das Entsperren gesperrter Nutzer nur durch einen Admin.
- **Specs nachziehen.** Wo das Refinement von der Spec abwich – andere Domain, keine Kostenstelle im PoC, keine Deinstallation beim Austritt –, gibt es ein eigenes Work Item, das die Specs anpasst. So bleiben Spec und Ticket deckungsgleich.
- **Offen lassen, was offen ist.** Wie die Helper-EXE signiert wird, ist noch nicht geklärt – und steht genau so als offene Frage im Ticket.

Alles Azure-seitige ist Bicep und soll sich aus einer leeren Ressourcengruppe ohne Klicks im Portal aufbauen lassen. Die Workflows melden sich per OIDC an Azure an, Secrets liegen nur im Key Vault.

## Was noch offen ist

Der PoC läuft gerade. Die ersten Stories für Infrastruktur und Gateway sind im Pull Request, der Rest ist bereit für die Umsetzung. Spannend wird:

- ob LiteLLM in der gepinnten Version sauber mit den Claude-Deployments in Foundry zusammenspielt,
- wie oft Claude Desktop den Credential Helper aufruft und wie es auf Fehler reagiert,
- ob die Verbräuche in LiteLLM wirklich zur Azure-Rechnung passen,
- und natürlich, wie sich das für die Pilotpersonen im Alltag anfühlt.

Ich schreibe eine Fortsetzung, sobald die ersten Personen damit arbeiten.

## Was ich bisher mitnehme

- **Ein Gateway ist die eigentliche Kostenbremse.** Foundry allein kennt kein Budget pro Person. Erst das Gateway macht aus „Azure-Abrechnung“ ein „jede Person hat ihr Kontingent“.
- **Identität ohne Lizenz geht – mit etwas Klebstoff.** Key-Broker und Credential Helper sind zwei kleine, überschaubare Komponenten und ersetzen das SSO-Feature eines Enterprise-Plans.
- **Eine Gruppe, ein Schalter.** Wenn App, Konfiguration und Zugang an derselben Entra-Gruppe hängen, gibt es keinen Zustand, in dem jemand halb drin ist.
- **Die Details stecken in den Randbedingungen.** CSP oder EA, welche Region, `.msix` statt `.exe` – keine dieser Fragen ist schwer, aber jede hätte den PoC aufhalten können.
