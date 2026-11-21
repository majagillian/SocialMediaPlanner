#!/usr/bin/env python3
"""Violet Planner – persönliches Projektmanagement mit Whiteboard.

Start:  python app.py            (öffnet den Browser automatisch)
Optionen:
  --port 8765        Port (Standard 8765)
  --host 127.0.0.1   Für Server-Betrieb z. B. 0.0.0.0 (nur hinter Passwortschutz!)
  --no-browser       Browser nicht automatisch öffnen
  --db pfad.db       Speicherort der Datenbank

Benötigt nur Python 3.8+ (keine zusätzlichen Pakete).
"""
import argparse
import json
import mimetypes
import os
import re
import shutil
import subprocess
import uuid
import urllib.error
import urllib.request
import sqlite3
import threading
import webbrowser
from datetime import date, datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

BASE = Path(__file__).resolve().parent
STATIC = BASE / "static"

SCHEMA = {
    "projects": {
        "name": "TEXT NOT NULL DEFAULT 'Projekt'",
        "description": "TEXT",
        "color": "TEXT DEFAULT '#7C3AED'",
        "icon": "TEXT DEFAULT 'folder'",
        "status": "TEXT DEFAULT 'aktiv'",
        "start_date": "TEXT",
        "due_date": "TEXT",
        "objective_id": "INTEGER",
        "notes": "TEXT",
    },
    "objectives": {
        "title": "TEXT NOT NULL DEFAULT ''",
        "description": "TEXT",
        "period": "TEXT",
        "due_date": "TEXT",
        "color": "TEXT",
    },
    "key_results": {
        "objective_id": "INTEGER",
        "title": "TEXT NOT NULL DEFAULT ''",
        "start_value": "REAL DEFAULT 0",
        "target_value": "REAL DEFAULT 100",
        "current_value": "REAL DEFAULT 0",
        "step": "REAL DEFAULT 1",
        "unit": "TEXT",
    },
    "tasks": {
        "title": "TEXT NOT NULL DEFAULT ''",
        "notes": "TEXT",
        "status": "TEXT DEFAULT 'todo'",
        "priority": "TEXT DEFAULT 'mittel'",
        "due_date": "TEXT",
        "project": "TEXT",
        "tags": "TEXT",
        "kr_id": "INTEGER",
        "project_id": "INTEGER",
    },
    "posts": {
        "title": "TEXT NOT NULL DEFAULT ''",
        "platform": "TEXT DEFAULT 'Instagram'",
        "format": "TEXT",
        "pillar": "TEXT",
        "status": "TEXT DEFAULT 'idee'",
        "publish_date": "TEXT",
        "publish_time": "TEXT",
        "caption": "TEXT",
        "hashtags": "TEXT",
        "notes": "TEXT",
        "kr_id": "INTEGER",
        "project_id": "INTEGER",
        # Content-Management: Details für die Produktion & Veröffentlichung
        "platforms": "TEXT",       # Crossposting, kommagetrennt
        "hook": "TEXT",
        "cta": "TEXT",
        "first_comment": "TEXT",
        "link": "TEXT",
        "variants": "TEXT",        # JSON: eigene Caption je Plattform
        "aspect": "TEXT",
        "duration": "TEXT",
        "script": "TEXT",
        "shotlist": "TEXT",
        "voiceover": "TEXT",
        "music": "TEXT",
        "music_source": "TEXT",
        "music_start": "TEXT",
        "audio_notes": "TEXT",
        "cover_text": "TEXT",
        "alt_text": "TEXT",
        "location": "TEXT",
        "people_tags": "TEXT",
        "media_notes": "TEXT",
        "checklist": "TEXT",       # JSON
        "published_urls": "TEXT",  # JSON: Link je Plattform
    },
    "boards": {
        "name": "TEXT NOT NULL DEFAULT 'Board'",
        "data": "TEXT",
        "project_id": "INTEGER",
    },
    "settings": {
        "key": "TEXT",
        "value": "TEXT",
    },
    "videos": {
        "name": "TEXT NOT NULL DEFAULT 'Neues Video'",
        "aspect": "TEXT DEFAULT '9:16'",
        "post_id": "INTEGER",
        "project_id": "INTEGER",
        "data": "TEXT",
    },
}

MEDIA = BASE / "media"   # hochgeladene Videos, Bilder, Musik, Voiceovers und Exporte
MEDIA_TYPES = {".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".m4v": "video/mp4",
               ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac", ".ogg": "audio/ogg",
               ".oga": "audio/ogg", ".weba": "audio/webm", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
               ".gif": "image/gif", ".webp": "image/webp"}


def safe_media_name(original):
    stem, ext = os.path.splitext(os.path.basename(original or "datei"))
    ext = ext.lower() if ext.lower() in MEDIA_TYPES else ".bin"
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", stem)[:40].strip("-") or "datei"
    return f"{stem}-{uuid.uuid4().hex[:8]}{ext}"


def ffmpeg_path():
    return shutil.which("ffmpeg")

# ---------------------------------------------------------------------------
# KI (Claude API). Schlüssel liegt in config.json neben app.py oder in der
# Umgebungsvariable ANTHROPIC_API_KEY – er wird nie an den Browser geschickt.
# ---------------------------------------------------------------------------
CONFIG_PATH = BASE / "config.json"
DEFAULT_MODEL = "claude-sonnet-5-5"


def load_config():
    try:
        return json.loads(CONFIG_PATH.read_text("utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save_config(cfg):
    CONFIG_PATH.write_text(json.dumps(cfg, indent=2), "utf-8")
    try:
        os.chmod(CONFIG_PATH, 0o600)
    except OSError:
        pass


def api_key():
    return load_config().get("api_key") or os.environ.get("ANTHROPIC_API_KEY", "")


AI_SYSTEM = {
    "okr": (
        "Du bist ein erfahrener OKR-Coach und Social-Media-Stratege. Du hilfst einer Person, die "
        "einen Social-Media-Account aufbaut, gute OKRs zu formulieren. Regeln: Objectives sind "
        "qualitativ, motivierend, kurz (max. 10 Wörter) und ohne Zahlen. Key Results sind messbar, "
        "mit Startwert, Zielwert und Einheit, ergebnis- statt aktivitätsorientiert, ambitioniert aber "
        "realistisch, 2–4 pro Objective. Antworte auf Deutsch und AUSSCHLIESSLICH mit gültigem JSON "
        "ohne Markdown in genau diesem Format: "
        '{"feedback": "kurze Einschätzung (max. 3 Sätze)", "objectives": [{"title": "...", '
        '"description": "warum wichtig", "period": "Zeitraum", "key_results": [{"title": "...", '
        '"start_value": 0, "target_value": 100, "unit": "...", "step": 1}]}], '
        '"tips": ["Tipp 1", "Tipp 2"]}'
    ),
    "caption": (
        "Du bist Social-Media-Texter:in für Creator. Schreibe auf Deutsch, natürlich, ohne Floskeln, "
        "mit starkem Hook in der ersten Zeile, kurzen Absätzen, passenden Emojis (sparsam) und klarem "
        "Call-to-Action. Passe Länge und Ton je Plattform an (TikTok/Instagram locker, LinkedIn "
        "professioneller, X max. 280 Zeichen). Antworte AUSSCHLIESSLICH mit gültigem JSON ohne Markdown: "
        '{"hook": "...", "caption": "Haupt-Caption", "hashtags": "#a #b #c", "cta": "...", '
        '"first_comment": "...", "variants": {"Plattformname": "angepasste Caption"}, '
        '"music_ideas": ["Stimmung/Genre-Vorschlag 1", "..."], "script": "kurzes Skript mit Zeitmarken, falls Video"}'
    ),
    "html": (
        "Du erstellst eigenständige HTML-Visualisierungen für ein Whiteboard. Gib AUSSCHLIESSLICH "
        "ein vollständiges HTML-Dokument zurück (beginnend mit <!DOCTYPE html>), ohne Erklärungen "
        "und ohne Markdown-Codeblock. Alles inline (CSS und JS). Externe Skripte nur von "
        "cdn.jsdelivr.net, falls wirklich nötig (z. B. Chart.js). Design: klar und minimalistisch, "
        "weißer Hintergrund, Schrift system-ui, Hauptfarbe Violett #7C3AED, Akzente Mint #34D399 "
        "und Orange #FB923C. Die Seite muss sich an jede Fenstergröße anpassen (100% Breite/Höhe, "
        "kein Scrollen nötig). Beschriftungen auf Deutsch."
    ),
}


def call_claude(mode, prompt):
    key = api_key()
    if not key:
        raise RuntimeError("Kein API-Schlüssel hinterlegt. Bitte in den KI-Einstellungen eintragen.")
    cfg = load_config()
    body = json.dumps({
        "model": cfg.get("model") or DEFAULT_MODEL,
        "max_tokens": 8000 if mode == "html" else 2500,
        "system": AI_SYSTEM[mode],
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=body, method="POST",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as res:
            data = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode("utf-8")).get("error", {}).get("message", "")
        except Exception:
            msg = ""
        if e.code == 401:
            raise RuntimeError("API-Schlüssel ungültig.")
        raise RuntimeError(f"KI-Fehler ({e.code}): {msg}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"KI nicht erreichbar: {e.reason}")
    text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text").strip()
    if mode in ("okr", "caption"):
        start, end = text.find("{"), text.rfind("}")
        if start < 0:
            raise RuntimeError("Die KI-Antwort konnte nicht gelesen werden. Bitte erneut versuchen.")
        return json.loads(text[start:end + 1])
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    return {"html": text}

DB_PATH = BASE / "planner.db"
DB_LOCK = threading.Lock()


def connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def now():
    return datetime.now().isoformat(timespec="seconds")


def init_db():
    fresh = not DB_PATH.exists()
    with connect() as con:
        for table, cols in SCHEMA.items():
            col_sql = ", ".join(f"{c} {t}" for c, t in cols.items())
            con.execute(
                f"CREATE TABLE IF NOT EXISTS {table} ("
                f"id INTEGER PRIMARY KEY AUTOINCREMENT, {col_sql}, "
                f"created_at TEXT, updated_at TEXT)"
            )
            # Spalten nachrüsten, falls die DB aus einer älteren Version stammt
            existing = {r["name"] for r in con.execute(f"PRAGMA table_info({table})")}
            for c, t in cols.items():
                if c not in existing:
                    con.execute(f"ALTER TABLE {table} ADD COLUMN {c} {t}")
        if fresh:
            seed(con)
        elif con.execute("SELECT COUNT(*) FROM boards").fetchone()[0] == 0:
            insert(con, "boards", {"name": "Mein Board", "data": json.dumps(empty_board())})
        migrate_projects(con)


def migrate_projects(con):
    """Ältere Versionen speicherten das Projekt als Freitext an der Aufgabe – daraus echte Projekte machen."""
    names = [r[0] for r in con.execute(
        "SELECT DISTINCT TRIM(project) FROM tasks WHERE project IS NOT NULL AND TRIM(project) != '' AND project_id IS NULL")]
    palette = ["#7C3AED", "#34D399", "#FB923C", "#6366F1", "#EC4899"]
    for i, name in enumerate(names):
        row = con.execute("SELECT id FROM projects WHERE name=?", (name,)).fetchone()
        pid = row[0] if row else insert(con, "projects", {"name": name, "status": "aktiv", "color": palette[i % len(palette)], "icon": "folder"})
        con.execute("UPDATE tasks SET project_id=? WHERE TRIM(project)=? AND project_id IS NULL", (pid, name))


def empty_board():
    return {"items": [], "connectors": [], "view": {"x": 80, "y": 60, "z": 1}}


def insert(con, table, data):
    cols = [c for c in data if c in SCHEMA[table]]
    vals = [data[c] for c in cols]
    ts = now()
    cur = con.execute(
        f"INSERT INTO {table} ({', '.join(cols + ['created_at', 'updated_at'])}) "
        f"VALUES ({', '.join('?' * (len(cols) + 2))})",
        vals + [ts, ts],
    )
    return cur.lastrowid


def seed(con):
    """Beispieldaten, damit die App nicht leer startet. Alles darf gelöscht werden."""
    d = lambda n: (date.today() + timedelta(days=n)).isoformat()
    obj = insert(con, "objectives", {
        "title": "Social-Media-Account erfolgreich aufbauen",
        "description": "Eine Community rund um mein Thema aufbauen und regelmäßig wertvollen Content liefern.",
        "period": "Nächste 3 Monate", "due_date": d(90), "color": "#7C3AED",
    })
    kr_f = insert(con, "key_results", {"objective_id": obj, "title": "Follower gewinnen",
                                       "start_value": 0, "target_value": 1000, "current_value": 0,
                                       "step": 10, "unit": "Follower"})
    kr_p = insert(con, "key_results", {"objective_id": obj, "title": "Posts veröffentlichen",
                                       "start_value": 0, "target_value": 36, "current_value": 0,
                                       "step": 1, "unit": "Posts"})
    insert(con, "key_results", {"objective_id": obj, "title": "Engagement-Rate erreichen",
                                "start_value": 0, "target_value": 5, "current_value": 0,
                                "step": 0.5, "unit": "%"})
    tasks = [
        ("Nische & Zielgruppe definieren", "hoch", d(1), kr_f),
        ("Content-Säulen festlegen", "hoch", d(2), kr_p),
        ("Profilbild & Bio erstellen", "mittel", d(3), kr_f),
        ("10 Content-Ideen sammeln", "mittel", d(4), kr_p),
        ("Posting-Rhythmus festlegen", "niedrig", d(6), kr_p),
    ]
    proj = insert(con, "projects", {"name": "Account-Aufbau", "description": "Profil, Nische und erste Inhalte für den neuen Social-Media-Account.",
                                    "color": "#7C3AED", "icon": "rocket", "status": "aktiv", "start_date": d(0), "due_date": d(30), "objective_id": obj})
    task_ids = []
    for title, prio, due, kr in tasks:
        task_ids.append(insert(con, "tasks", {"title": title, "priority": prio, "due_date": due,
                                              "project": "Account-Aufbau", "project_id": proj, "status": "todo", "kr_id": kr}))
    insert(con, "posts", {"title": "Vorstellungs-Reel: Wer bin ich?", "platform": "Instagram",
                          "format": "Reel", "pillar": "Persönlich", "status": "skript",
                          "publish_date": d(5), "publish_time": "18:00", "kr_id": kr_p})
    insert(con, "posts", {"title": "Karussell: 5 Tipps für Einsteiger", "platform": "Instagram",
                          "format": "Karussell", "pillar": "Wissen", "status": "idee",
                          "publish_date": d(8), "publish_time": "12:00", "kr_id": kr_p})
    insert(con, "posts", {"title": "Behind the Scenes: Mein Setup", "platform": "TikTok",
                          "format": "Video", "pillar": "Behind the Scenes", "status": "idee",
                          "publish_date": d(10), "publish_time": "19:00", "kr_id": kr_p})

    board = {
        "items": [
            {"id": "t1", "type": "text", "x": 0, "y": 0, "w": 620, "h": 60,
             "text": "Mein Social-Media-Projekt", "fs": 34, "color": "#1F1B2E", "bold": True},
            {"id": "n1", "type": "note", "x": 0, "y": 90, "w": 200, "h": 150, "color": "#EDE9FE",
             "text": "Zielgruppe:\nWer soll meinen Content sehen?"},
            {"id": "n2", "type": "note", "x": 220, "y": 90, "w": 200, "h": 150, "color": "#D1FAE5",
             "text": "Content-Säulen:\nWissen · Persönlich · Behind the Scenes"},
            {"id": "n3", "type": "note", "x": 440, "y": 90, "w": 200, "h": 150, "color": "#FFEDD5",
             "text": "Doppelklick auf eine Notiz zum Bearbeiten.\nRechts oben: in Aufgabe oder Post umwandeln!"},
            {"id": "e1", "type": "embed", "kind": "okr", "cfg": {"ref": obj},
             "x": 0, "y": 290, "w": 400, "h": 330},
            {"id": "e2", "type": "embed", "kind": "tasks", "cfg": {"project": "", "showDone": False},
             "x": 470, "y": 290, "w": 380, "h": 330},
            {"id": "e3", "type": "embed", "kind": "posts", "cfg": {"platform": ""},
             "x": 920, "y": 290, "w": 380, "h": 330},
            {"id": "i1", "type": "icon", "icon": "lucide:rocket", "color": "#7C3AED",
             "x": 680, "y": 110, "w": 90, "h": 90},
        ],
        "connectors": [
            {"id": "c1", "from": "e1", "to": "e2", "color": "#7C3AED"},
            {"id": "c2", "from": "e2", "to": "e3", "color": "#FB923C"},
            {"id": "c3", "from": "n2", "to": "e3", "color": "#34D399"},
        ],
        "view": {"x": 60, "y": 40, "z": 0.85},
    }
    insert(con, "boards", {"name": "Mein Social-Media-Board", "data": json.dumps(board), "project_id": proj})


def row_dict(row):
    return dict(row) if row else None


def clean(table, payload):
    out = {}
    for k, v in (payload or {}).items():
        if k in SCHEMA[table]:
            if isinstance(v, (dict, list)):
                v = json.dumps(v)
            out[k] = v
    return out


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC), **kwargs)

    def log_message(self, fmt, *args):  # ruhige Konsole
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # --- Hilfsfunktionen -------------------------------------------------
    def send_json(self, code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            return json.loads(raw or b"{}")
        except json.JSONDecodeError:
            return {}

    def api_parts(self):
        parts = urlparse(self.path).path.strip("/").split("/")
        if not parts or parts[0] != "api":
            return None
        return parts[1:]

    def resolve(self, parts):
        """-> (table, id) oder None"""
        if not parts or parts[0] not in SCHEMA:
            return None
        if len(parts) == 1:
            return parts[0], None
        if len(parts) == 2 and parts[1].isdigit():
            return parts[0], int(parts[1])
        return None

    # --- HTTP-Methoden ---------------------------------------------------
    def serve_media(self, name):
        path = (MEDIA / os.path.basename(unquote(name))).resolve()
        if not path.is_file() or path.parent != MEDIA.resolve():
            return self.send_json(404, {"error": "Datei nicht gefunden"})
        size = path.stat().st_size
        ctype = MEDIA_TYPES.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        start, end = 0, size - 1
        rng = self.headers.get("Range")
        if rng:
            m = re.match(r"bytes=(\d*)-(\d*)", rng)
            if m:
                if m.group(1):
                    start = int(m.group(1)); end = int(m.group(2)) if m.group(2) else size - 1
                elif m.group(2):
                    start = max(0, size - int(m.group(2)))
            end = min(end, size - 1)
            if start > end:
                self.send_response(416); self.send_header("Content-Range", f"bytes */{size}"); self.end_headers(); return
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        try:
            with open(path, "rb") as f:
                f.seek(start); left = end - start + 1
                while left > 0:
                    chunk = f.read(min(1024 * 512, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk); left -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        url_path = urlparse(self.path).path
        if url_path.startswith("/media/"):
            return self.serve_media(url_path[len("/media/"):])
        parts = self.api_parts()
        if parts is None:
            return super().do_GET()
        if parts == ["ffmpeg"]:
            return self.send_json(200, {"available": bool(ffmpeg_path())})
        with DB_LOCK, connect() as con:
            if parts == ["ai", "status"]:
                cfg = load_config()
                return self.send_json(200, {"configured": bool(api_key()), "model": cfg.get("model") or DEFAULT_MODEL})
            if parts == ["all"]:
                data = {t: [dict(r) for r in con.execute(f"SELECT * FROM {t} ORDER BY id")] for t in SCHEMA}
                return self.send_json(200, data)
            res = self.resolve(parts)
            if not res:
                return self.send_json(404, {"error": "not found"})
            table, rid = res
            if rid is None:
                return self.send_json(200, [dict(r) for r in con.execute(f"SELECT * FROM {table} ORDER BY id")])
            row = con.execute(f"SELECT * FROM {table} WHERE id=?", (rid,)).fetchone()
            return self.send_json(200 if row else 404, row_dict(row) or {"error": "not found"})

    def do_POST(self):
        parts = self.api_parts() or []
        if parts == ["ai", "config"]:
            payload = self.read_json(); cfg = load_config()
            if payload.get("api_key") is not None:
                cfg["api_key"] = payload["api_key"].strip()
            if payload.get("model"):
                cfg["model"] = payload["model"].strip()
            save_config(cfg)
            return self.send_json(200, {"configured": bool(api_key()), "model": cfg.get("model") or DEFAULT_MODEL})
        if parts == ["media"]:
            qs = parse_qs(urlparse(self.path).query)
            name = safe_media_name(qs.get("name", ["datei"])[0])
            n = int(self.headers.get("Content-Length") or 0)
            if n <= 0:
                return self.send_json(400, {"error": "Leere Datei"})
            MEDIA.mkdir(exist_ok=True)
            with open(MEDIA / name, "wb") as f:
                left = n
                while left > 0:
                    chunk = self.rfile.read(min(1024 * 1024, left))
                    if not chunk:
                        break
                    f.write(chunk); left -= len(chunk)
            return self.send_json(201, {"url": f"/media/{name}", "name": name, "size": n})
        if parts == ["convert"]:
            payload = self.read_json()
            ff = ffmpeg_path()
            if not ff:
                return self.send_json(400, {"error": "ffmpeg ist nicht installiert."})
            src = (MEDIA / os.path.basename(str(payload.get("name", "")))).resolve()
            if not src.is_file() or src.parent != MEDIA.resolve():
                return self.send_json(404, {"error": "Datei nicht gefunden"})
            out = src.with_name(src.stem + "-final.mp4")
            cmd = [ff, "-y", "-i", str(src), "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                   "-pix_fmt", "yuv420p", "-r", str(int(payload.get("fps") or 30)), "-c:a", "aac", "-b:a", "192k",
                   "-movflags", "+faststart", str(out)]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode != 0:
                return self.send_json(500, {"error": "Konvertierung fehlgeschlagen: " + res.stderr[-400:]})
            return self.send_json(200, {"url": f"/media/{out.name}", "name": out.name})
        if parts == ["ai", "generate"]:
            payload = self.read_json()
            mode = payload.get("mode")
            if mode not in AI_SYSTEM:
                return self.send_json(400, {"error": "Unbekannter Modus"})
            try:
                return self.send_json(200, call_claude(mode, str(payload.get("prompt", ""))[:20000]))
            except (RuntimeError, json.JSONDecodeError) as e:
                return self.send_json(502, {"error": str(e)})
        res = self.resolve(parts)
        if not res or res[1] is not None:
            return self.send_json(404, {"error": "not found"})
        table = res[0]
        data = clean(table, self.read_json())
        with DB_LOCK, connect() as con:
            rid = insert(con, table, data)
            row = con.execute(f"SELECT * FROM {table} WHERE id=?", (rid,)).fetchone()
        self.send_json(201, row_dict(row))

    def do_PUT(self):
        res = self.resolve(self.api_parts() or [])
        if not res or res[1] is None:
            return self.send_json(404, {"error": "not found"})
        table, rid = res
        data = clean(table, self.read_json())
        with DB_LOCK, connect() as con:
            if data:
                sets = ", ".join(f"{c}=?" for c in data) + ", updated_at=?"
                con.execute(f"UPDATE {table} SET {sets} WHERE id=?", list(data.values()) + [now(), rid])
            row = con.execute(f"SELECT * FROM {table} WHERE id=?", (rid,)).fetchone()
        self.send_json(200 if row else 404, row_dict(row) or {"error": "not found"})

    def do_DELETE(self):
        res = self.resolve(self.api_parts() or [])
        if not res or res[1] is None:
            return self.send_json(404, {"error": "not found"})
        table, rid = res
        with DB_LOCK, connect() as con:
            if table == "boards" and con.execute("SELECT COUNT(*) FROM boards").fetchone()[0] <= 1:
                return self.send_json(400, {"error": "Das letzte Board kann nicht gelöscht werden."})
            if table == "objectives":
                kr_ids = [r[0] for r in con.execute("SELECT id FROM key_results WHERE objective_id=?", (rid,))]
                for k in kr_ids:
                    con.execute("UPDATE tasks SET kr_id=NULL WHERE kr_id=?", (k,))
                    con.execute("UPDATE posts SET kr_id=NULL WHERE kr_id=?", (k,))
                con.execute("DELETE FROM key_results WHERE objective_id=?", (rid,))
            if table == "projects":
                con.execute("UPDATE tasks SET project_id=NULL, project=NULL WHERE project_id=?", (rid,))
                for t in ("posts", "boards", "videos"):
                    con.execute(f"UPDATE {t} SET project_id=NULL WHERE project_id=?", (rid,))
            if table == "key_results":
                con.execute("UPDATE tasks SET kr_id=NULL WHERE kr_id=?", (rid,))
                con.execute("UPDATE posts SET kr_id=NULL WHERE kr_id=?", (rid,))
            con.execute(f"DELETE FROM {table} WHERE id=?", (rid,))
        self.send_json(200, {"ok": True})


def main():
    global DB_PATH
    ap = argparse.ArgumentParser(description="Violet Planner")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--db", default=str(BASE / "planner.db"))
    ap.add_argument("--no-browser", action="store_true")
    args = ap.parse_args()

    DB_PATH = Path(args.db)
    init_db()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    url = f"http://{'localhost' if args.host in ('127.0.0.1', '0.0.0.0') else args.host}:{args.port}"
    print(f"Violet Planner läuft auf {url}  (Beenden mit Strg+C)")
    print(f"Datenbank: {DB_PATH}")
    if not args.no_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBeendet.")


if __name__ == "__main__":
    main()
