# Violet Planner

Persönliches Projektmanagement mit Whiteboard, OKR-Zielverfolgung, Aufgaben, Kalender und Social-Media-Contentplanung. Alle Module lassen sich **live ins Whiteboard einbetten**.

## Start

Voraussetzung: Python 3.8 oder neuer. Weitere Pakete sind nicht nötig.

```bash
python app.py
```

Der Browser öffnet sich automatisch unter http://localhost:8765. Alle Daten liegen in `planner.db`, Medien im Ordner `media/`. Für ein Backup kopierst du beides.

Optionen: `--port 9000`, `--no-browser`, `--db /pfad/zur/datei.db`, `--host 0.0.0.0`

## Module

| Modul | Funktionen |
|---|---|
| **Übersicht** | Heute fällig und überfällig, nächste Posts, Zielfortschritt, Schnellanlage |
| **Whiteboard** | Unendliche Fläche, Haftnotizen, Text, Formen, Pfeile mit Beschriftung, Bilder (Drag & Drop oder Einfügen), Icon-Bibliothek, Vorlagen, mehrere Boards, Rückgängig |
| **Ziele (OKR)** | Ziele mit Key Results, Start-, Ziel- und Istwert, +/− Buttons, Fortschrittsringe, verknüpfte Aufgaben und Posts |
| **Aufgaben** | Kanban oder Liste, Priorität, Fälligkeit, Projekte, Tags, Zuordnung zu einem Key Result |
| **Kalender** | Monatsansicht mit Aufgaben, Posts und Ziel-Stichtagen; Einträge per Drag & Drop verschieben |
| **Content** | Pipeline Idee → Skript → Produktion → Geplant → Veröffentlicht, Plattformen, Formate, Content-Säulen, Caption und Hashtags |

## Neu in Version 2

**Whiteboard**
- **Freie Farben:** Farbwähler für jedes Element (Füllung, Rahmen, Schrift, Kopfzeilen), Deckkraft, Füllungs-Deckkraft, Rahmenstärke, Eckenradius, Drehung, Schatten. Mit **＋** speicherst du Farben in deiner Palette (Rechtsklick entfernt sie).
- **Designvorlagen (G):** über 20 Elemente ähnlich wie bei Canva: Kennzahl, Fortschritt, Prozess, Zeitstrahl, Vergleich, Pyramide, Kreislauf, Checkliste, Kreis- und Balkendiagramm, KPI-Reihe, Instagram-Post, Story, Karussell-Slide, Persona, Banner, Zitat, Info-Karte. Dazu 7 Farbthemen, Inhalte per Doppelklick bearbeitbar.
- **HTML-Visualisierung (Y):** eigener HTML/CSS/JS-Code mit Live-Vorschau und Vorlagen (animierte Diagramme, Zähler, Heatmap, Chart.js). Auf Wunsch erzeugt die KI den Code. Der Code läuft abgeschottet in einer Sandbox.
- **Frames (F):** Folien in 16:9, 9:16, 1:1 und 4:5 sowie fertige Layouts. Jeder Frame lässt sich als **eigene Vorlage speichern** und in jedem Board wieder einfügen.
- **Mehrfachauswahl:** Strg/Cmd+Klick oder Strg/Cmd+Ziehen (auch mit Shift). Damit kannst du **gruppieren** (Strg+G), ausrichten, **gleichmäßig horizontal und vertikal verteilen** (automatisch oder mit festem Abstand), Größen angleichen oder alles in einen Frame packen.
- **Präsentationsmodus (P):** Frames werden nacheinander im Vollbild gezeigt. Jedes Element kann eine Animation bekommen (Einblenden, Von unten/oben/links/rechts, Zoom, Pop, Wischen, Unschärfe, Drehen) und einem Schritt zugeordnet werden. Elemente lassen sich **verdecken** (per Klick oder im Schritt aufdecken) oder **in der Präsentation ausblenden** (z. B. für Sprechernotizen). Steuerung mit Pfeiltasten, Leertaste oder Klick.
- **Timer & Stoppuhr:** mit Voreinstellungen, Ton am Ende und Rundenzeiten. Läuft auch während der Präsentation (Taste T).

**OKR-KI-Assistent:** formuliert aus deiner Idee Objectives und Key Results und prüft bestehende OKRs. Ein regelbasierter Schnell-Check und ein Offline-Baukasten funktionieren auch ohne KI.

**Content-Management:** ein detaillierter Beitragseditor mit Crossposting auf mehrere Plattformen und folgenden Inhalten:
- Hook, Caption und eigene Caption je Plattform mit Zeichenlimits
- Hashtags, Call-to-Action, Link und erster Kommentar
- Skript mit Zeitmarken, Shotlist und Voiceover
- Hintergrundmusik mit Quelle/Lizenz und Startpunkt, Ton-Notizen
- Cover-Text, Alt-Text, Ort und Markierungen
- Checkliste
Dazu kommen 12 Beitragsvorlagen, eigene Vorlagen und KI-Texte.

## Whiteboard-Bedienung (überarbeitet)
- **Text direkt bearbeiten:** Doppelklick auf Notiz, Form oder Text. Alternativ das Element auswählen und einfach lostippen oder Enter drücken. Der Text wird angehängt, die Elemente wachsen mit. Esc, Strg+Enter oder ein Klick daneben beendet die Bearbeitung.
- **Doppelklick** funktioniert auch auf Designs (Inhalt), HTML (Code), Icons (tauschen), Bildern (ersetzen), Verbindungen (Beschriftung) und Frame-Titeln (umbenennen).
- **Schwebende Leiste** über der Auswahl: Text bearbeiten, Farben, Schriftgröße, Fett, Gruppieren, gleichmäßig verteilen, Duplizieren, Sperren, Löschen. Das große Eigenschaften-Panel lässt sich ausblenden (×) und über die Leiste wieder einblenden.
- **Verbindungspunkte (●):** An einem ausgewählten Element ziehen, um es mit einem anderen zu verbinden. Ein Klick legt direkt ein neues, verbundenes Element an, ideal für Mindmaps.
- **Hilfslinien** beim Verschieben richten Elemente an Kanten und Mitten anderer Elemente aus. Mit Alt schaltest du sie aus.
- **Kopieren, Ausschneiden, Einfügen** (Strg+C/X/V), auch zwischen Boards. Eingefügter Text aus anderen Programmen wird zu Notizen, eingefügte Bilder landen direkt auf dem Board.
- **Mehrfachauswahl mit Strg (Mac: Cmd):** Strg+Klick fügt Elemente zur Auswahl hinzu oder entfernt sie, Strg+Ziehen auf leerer Fläche zieht einen Auswahlrahmen (Shift funktioniert ebenso).
- **Rechtecke:** Eckenradius bis 200 px. Per Klick auf die Ecken der kleinen Vorschau wählst du, welche Ecken gerundet werden. Dazu gibt es Vorgaben (Alle, Keine, Oben, Unten, Links, Rechts, Diagonal). Bei mehreren ausgewählten Rechtecken lässt sich das für alle gleichzeitig einstellen.
- **Pfeiltasten** verschieben (mit Shift in 10er-Schritten). **Strg+L** sperrt Elemente. **Rechtsklick** öffnet ein Kontextmenü.
- **Stift (B):** freihand zeichnen mit Farbe und Strichstärke.
- **Werkzeugleiste, Eigenschaften und Inhaltsverzeichnis ein- und ausblenden:** über die Schalter oben rechts. Die Werkzeugleiste lässt sich scrollen, falls das Fenster zu niedrig ist.
- **Inhaltsverzeichnis:** listet alle Frames und große Überschriften. Ein Klick fliegt hin, mit ▲▼ änderst du die Reihenfolge (auch für die Präsentation). Es gibt eine Suche.
- **Sprung-Links:** Jedes Element und jeder Frame lässt sich im Eigenschaften-Panel unter „Verlinken“ mit einem Frame verbinden. Ein Klick auf den Link springt dorthin, mit „↩ Zurück“ geht es zurück. Das funktioniert auch im Präsentationsmodus.
- **Drehen:** am orangen ⟳-Griff ziehen (mit Shift in 15°-Schritten, rastet bei 0/90/180° ein) oder 90°-Knopf in der schwebenden Leiste.
- **Text ausrichten:** horizontal (links, Mitte, rechts) und **vertikal (oben, Mitte, unten)**, dazu **Abstand zum Rand** einstellbar.
- **Tastenkürzel-Übersicht:** ? oder das Tastatur-Symbol oben.

## Vorlage „App-Konzept (Vibe Coding)“
Für die Planung von Apps, Handyspielen und Web-Apps, die du mit KI baust (z. B. für YouTube-Videos). Du findest sie unter „Board-Vorlage“ oder beim Anlegen eines neuen Boards („+ Board“ → Vorlage).

**Aufbau in 10 Phasen von links nach rechts:** Jede Phase ist eine farbige Spalte mit großem Kopf (Nummer, Emoji, Titel und ein Satz Erklärung, ideal auch für Zuschauer im Video). Pfeile zwischen den Köpfen zeigen den Weg.
1. 💡 Idee & Zielgruppe · 2. 🧩 Funktionen & Umfang · 3. 🎮 Spiel (optional) · 4. 🎨 Design & UX · 5. ⚙️ Technik & Business · 6. 🤖 Prompt an die KI · 7. 🔁 Weiterentwickeln · 8. 🧪 User Testing · 9. 🚀 Go-Live · 10. 🎬 Video

- Frames sind pro Phase nummeriert (1.1, 1.2 …) und in der Farbe ihrer Phase gehalten.
- Oben stehen eine Kurzanleitung und der Entwicklungsverlauf.
- Das **Inhaltsverzeichnis** gruppiert die Frames nach Phasen. Ein Klick auf eine Phase zoomt auf ihren Anfang.
- Doppelklick auf einen Phasenkopf ändert Titel, Emoji, Erklärung und Farbe.
- **Navigationskonsole** (unten rechts, oben über „Navigation“ ein-/ausblendbar):
  - Steuerkreuz: ▶/◀ wechselt die Phase, ▼/▲ geht Schritt für Schritt durch die Frames. ▼ am Ende einer Phase springt automatisch zur nächsten, ⌂ führt zum Anfang.
  - Zeigt an, wo du gerade bist („Phase 2 von 10 · Schritt 3/4“). Phasen-Punkte und Schritt-Nummern sind anklickbar.
  - Die Anzeige folgt auch, wenn du selbst verschiebst oder zoomst. Einklappbar, damit sie im Video nicht stört.
  - Tastatur: Pfeiltasten (wenn nichts ausgewählt ist) oder immer mit Alt + Pfeiltasten.
  - Die runden Pfeile zwischen den Phasenköpfen sind klickbar und springen zur nächsten Phase.
- Neue Weiterentwicklungs-Runden erscheinen untereinander in Phase 7. Die Spalte wächst automatisch mit.

- **Auswahllisten:** Optionen anklicken. Fast jede Liste hat **„Sonstiges“** mit Freitext. Ein Doppelklick bearbeitet Überschrift, Optionen und die Bezeichnung im Prompt. Eigene Listen legst du mit der Taste K an.
- **Spezifische technische Funktionen:** eigene Liste mit beliebig vielen Funktionen (auch mehrere auf einmal, eine pro Zeile). Jede Funktion bekommt eine **Priorität Hoch, Mittel oder Niedrig**, die du per Klick umschaltest. Die Liste lässt sich nach Priorität sortieren.
- **Spiele:** Notizen für Hauptfigur, Gegner, Setting/Welt und Story. Dazu **Bild-Platzhalter**: per Klick oder Drag & Drop ein Bild hinterlegen. ⚠️ Der Prompt enthält nur Text. Die Bilder musst du im KI-Tool zusätzlich hochladen, der Prompt weist darauf hin.
- **Farbpalette:** Primär, Sekundär, Akzent, Hintergrund und Text, mit **14 fertigen Paletten** oder eigenen Farben (Farbwähler oder Hex-Code). Die Hex-Codes landen automatisch im Prompt.
- **Schriftarten** für Überschriften und Fließtext, mit Vorschau in der jeweiligen Schrift. Für die Vorschau ist Internet nötig.
- **KI-Anweisungen:** Hier strukturierst du das Gespräch mit der KI:
  - **Rolle der KI**, z. B. Mentor für Einsteiger oder Game-Developer
  - **Arbeitsweise**, z. B. erst Rückfragen stellen, in kleinen Schritten arbeiten, einsteigerfreundlich erklären, erst Plan dann Code
  - **Zusätzliche Aufgaben**, z. B. Benchmark-Analyse, ergänzende Funktionen vorschlagen, Wettbewerbsfähigkeit einschätzen, klickbaren Prototyp erstellen, Testanleitung schreiben, Code ins Git-Repository pushen (fragt nach dem Link), README, Deployment, DSGVO- und Barrierefreiheits-Check, App-Store-Texte, Ideen für Videotitel und Thumbnail
  - eine Notiz für eigene Anweisungen
- **KI-Prompt (automatisch):** baut sich live auf aus Rolle, ausgefüllten Notizen, Anforderungen, Farbpalette, priorisierten Funktionen, Referenzbildern, Arbeitsweise und nummerierten Aufgaben. Mit „Kopieren“ landet er in der Zwischenablage.
### Klickbarer Prototyp auf dem Board (Werkzeug 📱, Taste U)
- **Importieren:** HTML-Datei hochladen (z. B. den Prototyp aus Claude), Code einfügen oder Beispiel-Prototyp. Der Prototyp läuft live und ist direkt auf dem Board klickbar.
- **Ansicht:** 📱 Handy, 📲 Tablet oder 🖥️ Desktop. ↻ startet den Prototyp neu.
- **Kommentieren:** 💬 schaltet den Kommentarmodus ein. Ein Klick auf eine Stelle heftet einen nummerierten Pin an. Ein Klick auf einen Pin öffnet: bearbeiten, erledigt, löschen. Pins merken sich ihre Position in Prozent der sichtbaren Ansicht. Wenn du im Prototyp scrollst oder die Ansicht wechselst, können sie verrutschen.
- **Mit KI bearbeiten (✨ KI):** Änderung beschreiben, optional alle offenen Kommentare mitschicken. Claude überarbeitet den Code über deinen hinterlegten API-Schlüssel, umgesetzte Kommentare werden abgehakt.
- **Versionen (⋯ → Versionen):** Jede Änderung (KI, Code, Upload) speichert die vorherige Version (bis zu 25). Wiederherstellen oder zum Vergleich als Kopie daneben legen.
- **⋯-Menü:** Code bearbeiten, neue Version hochladen, Kommentare als Text kopieren (für Claude), als HTML herunterladen, umbenennen.
- **Offene Kommentare → Weiterentwicklung:** übernimmt alle neuen Kommentare als Punkte in eine Liste der aktuellen Weiterentwicklungs-Runde. Der Prompt der Runde aktualisiert sich sofort.

### Von der Idee bis zur Veröffentlichung
Unter dem ersten Prompt begleitet dich die Vorlage weiter:
- **Entwicklungsverlauf (Übersicht):** zeigt automatisch den Fortschritt in vier Schritten (Konzept, Weiterentwicklung, User Testing, Go-Live) und listet alle Weiterentwicklungs-Runden mit Datum, Status und erledigten/offenen Punkten (🐞 Fehler, ✨ Funktionen, ⚙️ Verbesserungen). Ein Klick springt zur Runde. Mit „+ Neue Weiterentwicklungs-Runde“ legst du beliebig viele Runden an.
- **Weiterentwicklung #N:** Status (Geplant/In Arbeit/Getestet/Erledigt), Schwerpunkt, drei Listen mit Priorität für **Fehler**, **fehlende/neue Funktionen** und **Verbesserungen**, Notizen für „Was funktioniert schon gut?“ und Fehlermeldungen, Screenshot-Platzhalter und ein **eigener Prompt** für genau diese Runde. Punkte lassen sich abhaken; erledigte Punkte verschwinden aus dem Prompt und zählen im Verlauf.
- **User Testing:** Testmethode, Testgeräte, Testpersonen, Testaufgaben, Feedback-Notiz und ein Prompt für Testplan, Fragebogen, Feedback-Auswertung oder Beta-Test-Einrichtung.
- **Go-Live:** Wo veröffentlichen (Google Play, App Store, Web, itch.io …), was schon vorhanden ist (Entwicklerkonto, Datenschutzerklärung, Impressum, Icon …), App-Name und Termin. Der Prompt fordert eine **Schritt-für-Schritt-Anleitung** mit allen Voraussetzungen, Kosten und Stolperfallen an, optional Launch-Checkliste, Store-Texte oder Social-Media-Launch-Plan.
- Ältere Konzept-Boards: „Board-Vorlage → App-Konzept: Verlauf, Testing & Go-Live nachrüsten“. Neue Runde auch über „Board-Vorlage → App-Konzept: neue Weiterentwicklungs-Runde“.

- **Einzelne Blöcke nachrüsten:** „Board-Vorlage → App-Konzept: einzelnen Block einfügen …“
- **Anpassen & speichern:** „Board-Vorlage → Aktuelles Board als Vorlage speichern“, für das ganze Board oder nur die Auswahl, optional mit zurückgesetzten Auswahlen.

## Social-Media-Frames (neu)
Frame-Werkzeug (F) → Bereich „Social Media“. Alle Formate haben exakte Pixelmaße:
- **Instagram:** Post 4:5 (1080×1350), Post 1:1, Karussell, Story/Reel-Cover 9:16 (1080×1920)
- **TikTok & YouTube:** TikTok 9:16, TikTok-Foto-Karussell, YouTube-Thumbnail (1280×720), Short-Cover, Kanalbanner (2560×1440)
- **LinkedIn, Facebook & Co.:** LinkedIn 1,91:1 und 4:5, LinkedIn-Karussell, Facebook 1:1, Pinterest-Pin 2:3, X/Threads 16:9

Weitere Funktionen:
- Sicherheitszonen zeigen, welche Bereiche die Plattform-Oberfläche überdeckt. Sie werden nicht exportiert.
- Bei Karussells legst du die Anzahl der Slides fest und kannst später weitere anhängen.
- **Export als PNG oder JPG in Originalgröße**, bei Karussells alle Slides auf einmal (nummeriert). Optional wird der Export im Beitrag hinterlegt. Den Export startest du über das Download-Symbol am Frame-Titel, die schwebende Leiste oder das Eigenschaften-Panel.
- Das Format eines bestehenden Frames lässt sich nachträglich ändern.

## Projekte (neu)
Unter „Projekte“ legst du Projekte an, z. B. „Account-Aufbau“ oder „Kooperation mit Marke X“. Jedes Projekt hat Name, Farbe, Icon, Status (geplant, aktiv, pausiert, abgeschlossen), Start, Deadline, Beschreibung und optional ein verknüpftes Ziel (OKR).
- Die **Projektseite** bündelt Aufgaben (Kanban), Beiträge, Whiteboards, Videos, einen Bereich „Als Nächstes“ und Notizen.
- Fortschrittsanzeige anhand erledigter Aufgaben. Deadlines erscheinen im Kalender, aktive Projekte in der Übersicht.
- Projekte zuordnen kannst du in der Aufgabe, im Beitrag, im Board (über „Bearbeiten“) und im Video. Im Aufgaben-Dialog lässt sich über „+ Neues Projekt …“ direkt ein Projekt anlegen.
- Projektnamen aus älteren Versionen werden beim ersten Start automatisch in Projekte umgewandelt.

## Formen frei einfärben (neu)
- **Formenbibliothek** (Taste D bzw. das Formen-Symbol): Rechteck, Kreis, Raute, Dreieck, Fünf-/Sechs-/Achteck, Stern, Parallelogramm, Trapez, Pfeile, Chevron, Plus, Herz, Sprech- und Gedankenblase, Wolke, Zylinder, Dokument, Banner, Schild, Blitz, Etikett und weitere.
- **Schnellfarben** mit einem Klick (Füllung + Rahmen, die Schrift passt sich automatisch an), dazu freie Farbwahl für Füllung, Rahmen und Schrift, eine Pipette (Chrome/Edge), Deckkraft, Rahmenstärke, gestrichelte Rahmen und Eckenradius.
- „Form ändern“ tauscht die Form und behält Farben und Text.
- **Mehrere Elemente auf einmal einfärben:** auswählen (Shift+Klick oder Strg+A), dann rechts unter „Farbe für alle“ eine Farbe wählen.

## Video-Editor (neu)
Erreichbar über „Video-Editor“ in der Seitenleiste oder direkt aus einem Beitrag (Tab „Video & Audio“ → „Im Video-Editor öffnen“).

- **Formate:** 9:16 (Reel, TikTok, Short, Story), 4:5, 1:1 und 16:9 (YouTube), jederzeit umschaltbar. Optional mit Sicherheitszonen für die Plattform-Oberfläche.
- **Zeitleiste** mit Spuren für Video, Overlay (Bild-im-Bild), Text, Untertitel, Voiceover und Musik:
  - Clips verschieben, an den Rändern trimmen, teilen (S), duplizieren, löschen
  - Einrasten an Kanten und Abspielkopf, Lücken schließen, Rückgängig und Wiederholen
- **Farbe & Filter:**
  - 14 Filter, z. B. Kino, Vintage, Warm, Kühl, S/W, Noir, Matt, Goldene Stunde, mit regelbarer Stärke
  - Regler für Belichtung, Kontrast, Sättigung, Temperatur, Tönung, Farbton, Verblassen, Vignette, Weichzeichner und Körnung
  - Einstellungen lassen sich auf alle Clips übertragen
- **Bild:** Füllen oder Einpassen (mit unscharfem Hintergrund), Skalierung, Position, Drehung, Deckkraft, Ken-Burns-Zoom
- **Animationen:** Ein- und Ausblenden, Aus Schwarz, Von links/rechts/unten, Zoom, Pop, Wischen, Unschärfe, Drehen, Schreibmaschine
- **Text:** 9 Stilvorlagen (Hook, Titel, Untertitel, Box, Highlight, Bauchbinde, Kontur, Neon, Call-to-Action) mit Schrift, Farbe, Kontur, Hintergrundbox und Schatten. **Untertitel aus Skript:** Text einfügen, er wird automatisch in kurze Untertitel aufgeteilt und auf das Voiceover verteilt.
- **Ton:**
  - Musik und Audio hochladen
  - **Voiceover direkt über das Mikrofon aufnehmen**, auf Wunsch während das Video läuft
  - Lautstärke, Ein- und Ausblenden, Stummschalten, Ton vom Video abtrennen
  - **Ducking:** Die Musik wird automatisch leiser, solange das Voiceover läuft
  - Wellenformen in der Zeitleiste
- **Tempo:** 0,25× bis 4×
- **Export** als MP4 in Full HD oder 720p mit 25, 30 oder 60 fps. Ist **ffmpeg** installiert, wird automatisch ein H.264/AAC-MP4 erzeugt, das alle Plattformen akzeptieren. Exporte liegen im Ordner `media/` und lassen sich mit dem Beitrag verknüpfen.

**Empfohlener Browser:** Chrome oder Edge.
**ffmpeg installieren:**
- Windows: `winget install ffmpeg`
- Mac: `brew install ffmpeg`
- Linux: `sudo apt install ffmpeg`

Danach die App neu starten.
**Hinweise:** Der Export läuft in Echtzeit, ein 30-Sekunden-Video braucht also etwa 30 Sekunden. Lass den Tab dabei geöffnet. iPhone-Videos im HEVC-Format spielen in Chrome unter Windows eventuell nicht ab. Stelle dann am iPhone unter Einstellungen → Kamera → Formate auf „Maximale Kompatibilität“ um. Die Mikrofonaufnahme funktioniert lokal sofort, auf dem Server nur über HTTPS.

### KI einrichten
Unter „Ziele (OKR)“ → „KI-Einstellungen“ trägst du deinen API-Schlüssel von console.anthropic.com ein. Er wird nur lokal in `config.json` gespeichert. Alternativ kannst du die Umgebungsvariable `ANTHROPIC_API_KEY` setzen.

## Whiteboard: Module einbetten

Mit dem violetten Baustein-Knopf in der Werkzeugleiste (oder der Taste **E**) bettest du ein Modul ein:
OKR-Ziel, Alle Ziele, Aufgabenliste, einzelne Aufgabe, Aufgaben-Kanban, Kalender, Content-Pipeline, nächste Posts oder einen einzelnen Post.

Eingebettete Karten sind **live**: Du kannst Aufgaben abhaken, Key Results mit +/− erhöhen, Karten zwischen Spalten ziehen und Einträge per Klick bearbeiten. Jede Änderung erscheint sofort in allen Modulen.

**Notiz umwandeln:** Wähle eine Notiz aus und klicke rechts auf „In Aufgabe“, „In Post“ oder „In Ziel“. Die Notiz wird dann zu einer echten, verknüpften Karte.

**Verknüpfen:** Jede Notiz oder Form kann mit einer Aufgabe, einem Post oder einem Ziel verknüpft werden. Ein orangefarbenes Link-Symbol öffnet den verknüpften Eintrag.

### Tastenkürzel
V Auswählen · H Verschieben · K Auswahlliste · N Notiz · T Text · R Rechteck · O Kreis · D Raute · L Verbinden · F Frame · G Designs · I Icons · Y HTML · E Modul einbetten · P Präsentieren ·
Strg+A Alles auswählen · Strg+G Gruppieren · Strg+Shift+G Gruppierung aufheben ·
Leertaste + Ziehen = Fläche verschieben · Mausrad = Zoom · 0 = Einpassen · Entf = Löschen · Strg+Z = Rückgängig · Strg+D = Duplizieren ·
Shift beim Ziehen = am Raster ausrichten · Doppelklick auf leere Fläche = neue Notiz

## Icons
Die Icon-Bibliothek nutzt [Iconify](https://iconify.design) mit über 200.000 Icons, darunter Lucide, Tabler, Material, Emoji und Markenlogos wie Instagram oder TikTok. Dafür ist eine **Internetverbindung** nötig. Die Suche versteht gängige deutsche Begriffe; bei ausgefalleneren Begriffen hilft eine englische Suche.

## Betrieb auf dem IONOS-Server
```bash
python3 app.py --host 127.0.0.1 --port 8765 --no-browser
```
Leite die App dann über einen Reverse Proxy (Nginx oder Caddy) mit HTTPS und **Passwortschutz** (Basic Auth) nach außen weiter. Die App hat keine eigene Anmeldung, also bitte nie ohne Schutz öffentlich erreichbar machen. Für den Dauerbetrieb eignet sich ein systemd-Dienst.

## Projektstruktur
```
app.py            Python-Server, REST-API, SQLite-Datenbank
static/index.html Grundgerüst
static/style.css  Design (Violett #7C3AED, Mint #34D399, Orange #FB923C)
static/app.js     Datenhaltung, Dialoge, Übersicht, OKR, Aufgaben, Kalender, Content
static/board.js   Whiteboard, Präsentation, Timer, Gruppen, Frame-Vorlagen
static/designs.js Designvorlagen
static/htmltool.js HTML-Visualisierungstool
static/ai.js      KI-Anbindung & OKR-Assistent
static/posts.js   Beitragseditor & Beitragsvorlagen
static/video.js   Video-Editor
static/projects.js Projekte
static/vendor/    html-to-image (MIT) für den Bild-Export
media/            hochgeladene Medien & Exporte (wird automatisch angelegt)
```
