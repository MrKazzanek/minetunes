#!/usr/bin/env python3

import os
import sys
import json
import re
import urllib.parse
import subprocess
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_FILE = os.path.join(BASE_DIR, "songs.js")
ALBUMS_FILE = os.path.join(BASE_DIR, "albums.json")



def read_songs():
    if not os.path.exists(SONGS_FILE):
        return []
    with open(SONGS_FILE, "r", encoding="utf-8") as f:
        content = f.read().strip()
    
    match = re.search(r"const\s+songs\s*=\s*(\[.*\]);?", content, re.DOTALL)
    if match:
        json_str = match.group(1)
        try:
            return json.loads(json_str)
        except Exception as e:
            print(f"Błąd parsowania songs.js: {e}")
            return []
    return []

def write_songs(songs_list):
    formatted_json = json.dumps(songs_list, indent=4, ensure_ascii=False)
    content = f"const songs = {formatted_json};\n"
    with open(SONGS_FILE, "w", encoding="utf-8") as f:
        f.write(content)

def read_albums():
    if not os.path.exists(ALBUMS_FILE):
        return []
    with open(ALBUMS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception as e:
            print(f"Błąd parsowania albums.json: {e}")
            return []

def write_albums(albums_list):
    formatted_json = json.dumps(albums_list, indent=4, ensure_ascii=False)
    with open(ALBUMS_FILE, "w", encoding="utf-8") as f:
        f.write(formatted_json)

def get_git_status():
    git_dir = os.path.join(BASE_DIR, ".git")
    is_repo = os.path.exists(git_dir)
    remote_url = ""
    status_output = ""
    
    if is_repo:
        try:
            res_remote = subprocess.run(["git", "remote", "get-url", "origin"], cwd=BASE_DIR, capture_output=True, text=True)
            if res_remote.returncode == 0:
                remote_url = res_remote.stdout.strip()
        except Exception:
            pass
            
        try:
            res_status = subprocess.run(["git", "status", "--short"], cwd=BASE_DIR, capture_output=True, text=True)
            if res_status.returncode == 0:
                status_output = res_status.stdout.strip()
        except Exception:
            pass

    return {
        "is_repo": is_repo,
        "remote_url": remote_url,
        "status": status_output
    }

# --- HTTP REQUEST HANDLER ---

class GeneratorHandler(BaseHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/":
            self._set_headers(200, "text/html")
            self.wfile.write(HTML_TEMPLATE.encode("utf-8"))
            return

        if path == "/api/songs":
            songs = read_songs()
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps(songs, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/albums":
            albums = read_albums()
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps(albums, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/files":
            music_files = [f"music/{f}" for f in os.listdir(os.path.join(BASE_DIR, "music"))] if os.path.exists(os.path.join(BASE_DIR, "music")) else []
            images_files = [f"images/{f}" for f in os.listdir(os.path.join(BASE_DIR, "images"))] if os.path.exists(os.path.join(BASE_DIR, "images")) else []
            album_images_files = [f"album-images/{f}" for f in os.listdir(os.path.join(BASE_DIR, "album-images"))] if os.path.exists(os.path.join(BASE_DIR, "album-images")) else []
            data = {
                "music": music_files,
                "images": images_files,
                "album_images": album_images_files
            }
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/git/status":
            info = get_git_status()
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps(info, ensure_ascii=False).encode("utf-8"))
            return

        
        rel_path = path.lstrip("/")
        full_path = os.path.join(BASE_DIR, rel_path)

        if os.path.isfile(full_path):
            ext = os.path.splitext(full_path)[1].lower()
            mime_types = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "application/javascript",
                ".json": "application/json",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".mp3": "audio/mpeg",
                ".ogg": "audio/ogg",
                ".wav": "audio/wav",
                ".otf": "font/otf",
                ".ttf": "font/ttf"
            }
            mime = mime_types.get(ext, "application/octet-stream")
            try:
                with open(full_path, "rb") as f:
                    content = f.read()
                self._set_headers(200, mime)
                self.wfile.write(content)
                return
            except Exception as e:
                self.send_error(500, f"Błąd odczytu pliku: {e}")
                return

        self.send_error(404, "File Not Found")

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b""

        if path == "/api/upload":
            content_type = self.headers.get("Content-Type", "")
            if "multipart/form-data" in content_type:
                boundary = content_type.split("boundary=")[1].encode()
                parts = post_data.split(b"--" + boundary)
                target_folder = "images"
                file_name = ""
                file_content = b""

                for part in parts:
                    if b'filename="' in part:
                        headers_part, body_part = part.split(b"\r\n\r\n", 1)
                        body_part = body_part.rsplit(b"\r\n", 1)[0]
                        
                        fn_match = re.search(r'filename="([^"]+)"', headers_part.decode('utf-8', errors='ignore'))
                        name_match = re.search(r'name="([^"]+)"', headers_part.decode('utf-8', errors='ignore'))
                        
                        if fn_match:
                            file_name = os.path.basename(fn_match.group(1))
                            file_content = body_part
                        if name_match:
                            field_name = name_match.group(1)
                            if field_name == "folder":
                                target_folder = body_part.decode().strip()

                if file_name and file_content:
                    dest_dir = os.path.join(BASE_DIR, target_folder)
                    os.makedirs(dest_dir, exist_ok=True)
                    dest_path = os.path.join(dest_dir, file_name)
                    with open(dest_path, "wb") as f:
                        f.write(file_content)
                    
                    saved_rel_path = f"{target_folder}/{file_name}"
                    self._set_headers(200, "application/json")
                    self.wfile.write(json.dumps({"success": True, "path": saved_rel_path}).encode("utf-8"))
                    return

            self._set_headers(400, "application/json")
            self.wfile.write(json.dumps({"error": "Błędne dane przesyłu"}).encode("utf-8"))
            return

        if path == "/api/songs":
            new_song = json.loads(post_data.decode("utf-8"))
            songs = read_songs()
            idx = next((i for i, s in enumerate(songs) if s["id"] == new_song["id"]), -1)
            if idx >= 0:
                songs[idx] = new_song
            else:
                songs.append(new_song)
            write_songs(songs)
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps({"success": True, "song": new_song}).encode("utf-8"))
            return

        if path == "/api/albums":
            new_album = json.loads(post_data.decode("utf-8"))
            albums = read_albums()
            idx = next((i for i, a in enumerate(albums) if a["id"] == new_album["id"]), -1)
            if idx >= 0:
                albums[idx] = new_album
            else:
                albums.append(new_album)
            write_albums(albums)
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps({"success": True, "album": new_album}).encode("utf-8"))
            return

        if path == "/api/git/init":
            body = json.loads(post_data.decode("utf-8"))
            repo_url = body.get("repo_url", "").strip()
            logs = []
            try:
                r1 = subprocess.run(["git", "init"], cwd=BASE_DIR, capture_output=True, text=True)
                logs.append(r1.stdout + r1.stderr)

                r2 = subprocess.run(["git", "branch", "-M", "main"], cwd=BASE_DIR, capture_output=True, text=True)
                logs.append(r2.stdout + r2.stderr)

                if repo_url:
                    subprocess.run(["git", "remote", "remove", "origin"], cwd=BASE_DIR, capture_output=True, text=True)
                    r3 = subprocess.run(["git", "remote", "add", "origin", repo_url], cwd=BASE_DIR, capture_output=True, text=True)
                    logs.append(r3.stdout + r3.stderr)

                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({"success": True, "log": "\n".join(logs)}).encode("utf-8"))
            except Exception as e:
                self._set_headers(500, "application/json")
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        if path == "/api/git/publish":
            body = json.loads(post_data.decode("utf-8"))
            commit_msg = body.get("message", "Aktualizacja muzyki i albumów MineTunes").strip()
            force = body.get("force", False)
            action = body.get("action", "publish")
            logs = []
            try:
                if action == "pull":
                    r = subprocess.run(["git", "pull", "origin", "main", "--allow-unrelated-histories", "--no-rebase"], cwd=BASE_DIR, capture_output=True, text=True)
                    logs.append("$ git pull origin main --allow-unrelated-histories\n" + r.stdout + r.stderr)
                    success = r.returncode == 0
                else:
                    r1 = subprocess.run(["git", "add", "-A"], cwd=BASE_DIR, capture_output=True, text=True)
                    logs.append("$ git add -A\n" + r1.stdout + r1.stderr)

                    r2 = subprocess.run(["git", "commit", "-m", commit_msg], cwd=BASE_DIR, capture_output=True, text=True)
                    logs.append(f'$ git commit -m "{commit_msg}"\n' + r2.stdout + r2.stderr)

                    push_cmd = ["git", "push", "-u", "origin", "main", "--force"] if force else ["git", "push", "origin", "main"]
                    r3 = subprocess.run(push_cmd, cwd=BASE_DIR, capture_output=True, text=True)
                    logs.append(f"$ {' '.join(push_cmd)}\n" + r3.stdout + r3.stderr)

                    success = r3.returncode == 0

                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({"success": success, "log": "\n\n".join(logs)}).encode("utf-8"))
            except Exception as e:
                self._set_headers(500, "application/json")
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        if path == "/api/songs":
            song_id = query.get("id", [""])[0]
            if song_id:
                songs = read_songs()
                songs = [s for s in songs if s["id"] != song_id]
                write_songs(songs)
                albums = read_albums()
                for album in albums:
                    if "songs" in album and song_id in album["songs"]:
                        album["songs"] = [sid for sid in album["songs"] if sid != song_id]
                write_albums(albums)

                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
                return

        if path == "/api/albums":
            album_id = query.get("id", [""])[0]
            if album_id:
                albums = read_albums()
                albums = [a for a in albums if a["id"] != album_id]
                write_albums(albums)

                self._set_headers(200, "application/json")
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
                return

        self._set_headers(400, "application/json")
        self.wfile.write(json.dumps({"error": "Nieprawidłowe zapytanie DELETE"}).encode("utf-8"))



HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MineTunes — Generator & Publikator</title>
    <link rel="shortcut icon" href="app-assets/logo.png" type="image/x-icon">
    <style>
        @font-face {
            font-family: 'minecraft';
            src: url('MinecraftTen.otf') format('truetype');
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #48484a;
            font-family: 'minecraft', sans-serif;
            color: #e7e8eb;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        header {
            background-color: #3f4040;
            border-bottom: 6px solid #b1b3b5;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 26px;
        }
        .header-title img {
            width: 32px;
            height: 32px;
            image-rendering: pixelated;
        }
        nav {
            display: flex;
            gap: 10px;
        }
        .tab-btn {
            background-color: #313233;
            color: #e7e8eb;
            border: 2px solid #b1b3b5;
            padding: 8px 16px;
            cursor: pointer;
            font-family: 'minecraft', sans-serif;
            font-size: 14px;
            transition: 0.15s;
        }
        .tab-btn:hover, .tab-btn.active {
            background-color: #3c8527;
            border-color: #7fa377;
            color: white;
        }
        main {
            flex: 1;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: #313233;
            padding: 15px;
            border: 4px solid #1e1e1e;
        }
        .btn-green {
            background-color: #3c8527;
            color: #e7e8eb;
            border: 2px solid #7fa377;
            outline: 3px solid #1e1f1f;
            padding: 8px 16px;
            font-family: 'minecraft', sans-serif;
            font-size: 15px;
            cursor: pointer;
            transition: 0.15s;
        }
        .btn-green:hover { background-color: #2a641c; }
        .btn-red {
            background-color: #a12f23;
            color: #e7e8eb;
            border: 2px solid #5a1a13;
            outline: 2px solid #1e1f1f;
            padding: 4px 10px;
            font-family: 'minecraft', sans-serif;
            font-size: 13px;
            cursor: pointer;
        }
        .btn-red:hover { background-color: #c0392b; }

        input[type="text"], input[type="number"], select, textarea {
            background-color: #1e1e1e;
            color: #e7e8eb;
            border: 2px solid #b1b3b5;
            padding: 8px;
            font-family: 'minecraft', sans-serif;
            outline: none;
            width: 100%;
        }
        .search-box { width: 300px; }

        /* Grid Utworów i Albumów */
        .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
        }
        .card {
            background-color: #313233;
            border: 4px solid #1e1e1e;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            position: relative;
        }
        .card-top {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        .card-img {
            width: 56px;
            height: 56px;
            object-fit: cover;
            border: 2px solid #1e1e1e;
            image-rendering: pixelated;
        }
        .card-info { flex: 1; min-width: 0; }
        .card-title { font-size: 16px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-sub { font-size: 12px; color: #b1b3b5; }
        .card-actions {
            display: flex;
            gap: 8px;
            margin-top: auto;
            justify-content: flex-end;
        }

        /* Modal Formularza */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex; align-items: center; justify-content: center;
            z-index: 999;
        }
        .modal-overlay.hidden { display: none; }
        .modal-box {
            background-color: #313233;
            border: 4px solid #1e1e1e;
            padding: 20px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .modal-box h2 { text-align: center; color: #7fa377; border-bottom: 2px solid #3f4040; padding-bottom: 8px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 13px; color: #b1b3b5; }
        .form-row { display: flex; gap: 10px; }

        /* Audio Preview Player */
        .audio-preview-box {
            background-color: #1e1e1e;
            border: 2px solid #3c8527;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 6px;
        }
        .audio-preview-box label { color: #7fa377; font-weight: bold; font-size: 13px; }
        audio { width: 100%; outline: none; }

        /* Multi-select song list w albumach */
        .song-picker-list {
            max-height: 180px;
            overflow-y: auto;
            background: #1e1e1e;
            border: 2px solid #b1b3b5;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .song-picker-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            cursor: pointer;
        }

        /* GitHub Tab */
        .git-section {
            background-color: #313233;
            border: 4px solid #1e1e1e;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .git-status-badge {
            display: inline-block;
            padding: 4px 10px;
            font-weight: bold;
            border: 2px solid #1e1e1e;
        }
        .badge-green { background: #3c8527; color: white; }
        .badge-yellow { background: #d39e00; color: black; }
        .log-console {
            background: #111;
            color: #00ff66;
            font-family: monospace;
            padding: 12px;
            border: 2px solid #1e1e1e;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
            font-size: 12px;
        }
        .guide-box {
            background: #252627;
            border: 2px solid #3f4040;
            padding: 15px;
            margin-top: 15px;
            line-height: 1.6;
            font-size: 13px;
        }
        .guide-box h3 { color: #7fa377; margin-bottom: 8px; font-size: 16px; }
        .guide-box code { background: #111; padding: 2px 6px; color: #f1c40f; }
    </style>
</head>
<body>

<header>
    <div class="header-title">
        <img src="app-assets/logo.png" alt="MineTunes Logo">
        <span>MineTunes Generator</span>
    </div>
    <nav>
        <button class="tab-btn active" onclick="switchTab('songs-tab', this)">🎵 Utwory</button>
        <button class="tab-btn" onclick="switchTab('albums-tab', this)">💿 Albumy</button>
        <button class="tab-btn" onclick="switchTab('github-tab', this)">🚀 GitHub & Publikacja</button>
    </nav>
</header>

<main>
    <!-- TAB 1: UTWORY -->
    <section id="songs-tab" class="tab-content active">
        <div class="toolbar">
            <button class="btn-green" onclick="openAddSongModal()">+ Dodaj Nowy Utwór</button>
            <input type="text" class="search-box" id="song-search" placeholder="Szukaj utworu / wykonawcy..." oninput="renderSongs()">
        </div>
        <div id="songs-grid" class="items-grid"></div>
    </section>

    
    <section id="albums-tab" class="tab-content">
        <div class="toolbar">
            <button class="btn-green" onclick="openAddAlbumModal()">+ Dodaj Nowy Album</button>
        </div>
        <div id="albums-grid" class="items-grid"></div>
    </section>

    
    <section id="github-tab" class="tab-content">
        <div class="git-section">
            <h2>Publikacja Zmian na GitHub</h2>
            <div>
                <span>Stan Repozytorium: </span>
                <span id="git-badge" class="git-status-badge badge-yellow">Sprawdzanie...</span>
            </div>
            <div id="git-remote-info"></div>

            <!-- Inicjalizacja Repozytorium -->
            <div id="git-init-box" class="hidden">
                <p>Twoje lokalne pliki nie są jeszcze połączone z repozytorium GitHub.</p>
                <div class="form-group" style="margin-top: 10px;">
                    <label>Adres URL Repozytorium GitHub (np. https://github.com/kupa/minetunes.git):</label>
                    <input type="text" id="git-repo-url-input" placeholder="https://github.com/USERNAME/REPOSITORY.git">
                </div>
                <button class="btn-green" style="margin-top: 10px;" onclick="initGitRepo()">Zainicjuj Repozytorium Git</button>
            </div>

            <!-- Formularz Commita i Pusha -->
            <div id="git-publish-box" class="hidden">
                <div class="form-group">
                    <label>Wiadomość zmiany (Commit message):</label>
                    <input type="text" id="git-commit-msg" value="New features, an improved homepage, bug fixes, and performance improvements.">
                </div>
                <div class="form-row" style="margin-top: 10px; gap: 10px;">
                    <button class="btn-green" onclick="publishToGithub(false)">🚀 Zapisz i Opublikuj (Push)</button>
                    <button class="btn-red" style="background:#d39e00; border-color:#997300;" onclick="publishToGithub(true)" title="Wymuszenie wysłania, gdy GitHub odrzuca commit [rejected]">⚡ Wymuś Nadpisanie (Force Push)</button>
                    <button class="tab-btn" onclick="pullFromGithub()">📥 Pobierz Zmiany (Pull)</button>
                </div>
            </div>

            <!-- Konsola Logów -->
            <div class="form-group">
                <label>Logi operacji Git:</label>
                <div id="git-log-console" class="log-console">Brak ostatnich akcji...</div>
            </div>

            
            
        </div>
    </section>
</main>


<div id="song-modal" class="modal-overlay hidden">
    <div class="modal-box">
        <h2 id="song-modal-title">Dodaj Utwór</h2>
        
        <div class="form-row">
            <div class="form-group" style="flex:1;">
                <label>ID Utworu (np. lena_raine-otherside):</label>
                <input type="text" id="song-id-input" placeholder="ID utworu">
            </div>
            <div class="form-group" style="flex:1;">
                <label>Wersja Gry (np. 1.20 lub Alpha 1.0.14):</label>
                <input type="text" id="song-version-input" placeholder="1.20">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group" style="flex:1;">
                <label>Tytuł Utworu:</label>
                <input type="text" id="song-title-input" placeholder="Tytuł">
            </div>
            <div class="form-group" style="flex:1;">
                <label>Wykonawca / Artysta:</label>
                <input type="text" id="song-artist-input" placeholder="Wykonawca">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group" style="flex:1;">
                <label>Gatunek / Tagi (oddziel przecinkami):</label>
                <input type="text" id="song-genre-input" placeholder="Music Disc, Ambient">
            </div>
            <div class="form-group" style="flex:1;">
                <label>Czas trwania (w sekundach):</label>
                <input type="number" id="song-duration-input" placeholder="180">
            </div>
        </div>

        <!-- Ścieżka Audio i Upload -->
        <div class="form-group">
            <label>Plik Audio (src):</label>
            <div class="form-row">
                <input type="text" id="song-src-input" placeholder="music/moj_utwor.mp3" style="flex:2;">
                <input type="file" id="song-audio-file" accept="audio/*" style="display:none;" onchange="uploadFile(this, 'music', 'song-src-input')">
                <button class="tab-btn" onclick="document.getElementById('song-audio-file').click()">📁 Wybierz / Upload Audio</button>
            </div>
        </div>

        <!-- PRZESŁUCHANIE UTWORU (AUDIO PREVIEW) -->
        <div class="audio-preview-box">
            <label>🎧 Odsłuchaj Utwór (Przesłuchanie przed zapisem):</label>
            <audio id="song-audio-preview" controls></audio>
        </div>

        <!-- Ścieżka Okładki i Upload -->
        <div class="form-group">
            <label>Okładka (cover):</label>
            <div class="form-row">
                <input type="text" id="song-cover-input" placeholder="images/moj_utwor.jpg" style="flex:2;">
                <input type="file" id="song-cover-file" accept="image/*" style="display:none;" onchange="uploadFile(this, 'images', 'song-cover-input')">
                <button class="tab-btn" onclick="document.getElementById('song-cover-file').click()">🖼️ Upload Okładki</button>
            </div>
        </div>

        <div class="card-actions" style="margin-top:15px;">
            <button class="btn-green" onclick="saveSong()">Zapisz Utwór</button>
            <button class="tab-btn" onclick="closeModals()">Anuluj</button>
        </div>
    </div>
</div>

<!-- MODAL DODAWANIA/EDYCJI ALBUMU -->
<div id="album-modal" class="modal-overlay hidden">
    <div class="modal-box">
        <h2 id="album-modal-title">Dodaj Album</h2>
        
        <div class="form-group">
            <label>ID Albumu (slug, np. tricky-trials):</label>
            <input type="text" id="album-id-input" placeholder="id-albumu">
        </div>

        <div class="form-group">
            <label>Tytuł Albumu:</label>
            <input type="text" id="album-title-input" placeholder="Tytuł Albumu">
        </div>

        <div class="form-group">
            <label>Opis Albumu:</label>
            <textarea id="album-desc-input" placeholder="Krótki opis albumu..."></textarea>
        </div>

        <div class="form-group">
            <label>Okładka Albumu (cover):</label>
            <div class="form-row">
                <input type="text" id="album-cover-input" placeholder="album-images/okladka.png" style="flex:2;">
                <input type="file" id="album-cover-file" accept="image/*" style="display:none;" onchange="uploadFile(this, 'album-images', 'album-cover-input')">
                <button class="tab-btn" onclick="document.getElementById('album-cover-file').click()">🖼️ Upload Okładki</button>
            </div>
        </div>

        <div class="form-group">
            <label>Wybierz Utwory wchodzące w skład Albumu:</label>
            <div id="album-songs-picker" class="song-picker-list"></div>
        </div>

        <div class="card-actions" style="margin-top:15px;">
            <button class="btn-green" onclick="saveAlbum()">Zapisz Album</button>
            <button class="tab-btn" onclick="closeModals()">Anuluj</button>
        </div>
    </div>
</div>

<script>
    let songsData = [];
    let albumsData = [];

    async function loadData() {
        try {
            const resSongs = await fetch('/api/songs');
            songsData = await resSongs.json();
            
            const resAlbums = await fetch('/api/albums');
            albumsData = await resAlbums.json();

            renderSongs();
            renderAlbums();
            checkGitStatus();
        } catch (e) {
            console.error("Błąd ładowania danych:", e);
        }
    }

    function switchTab(tabId, btnElement) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        
        document.getElementById(tabId).classList.add('active');
        if (btnElement) {
            btnElement.classList.add('active');
        }

        if (tabId === 'github-tab') {
            checkGitStatus();
        }
    }

    // --- UTWORY (SONGS) ---
    function renderSongs() {
        const grid = document.getElementById('songs-grid');
        const filter = document.getElementById('song-search').value.toLowerCase().trim();
        grid.innerHTML = '';

        const filtered = songsData.filter(s => 
            s.title.toLowerCase().includes(filter) ||
            s.artist.toLowerCase().includes(filter) ||
            (s.genre && s.genre.some(g => g.toLowerCase().includes(filter)))
        );

        filtered.forEach(song => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-top">
                    <img src="${song.cover}" class="card-img" onerror="this.src='app-assets/logo.png'">
                    <div class="card-info">
                        <div class="card-title">${song.title}</div>
                        <div class="card-sub">${song.artist} • ${song.duration || 0}s</div>
                        <div class="card-sub" style="margin-top:2px;">Tagi: ${(song.genre || []).join(', ')}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="tab-btn" onclick="openAudioPreviewDirect('${song.src}')">▶ Słuchaj</button>
                    <button class="tab-btn" onclick="editSong('${song.id}')">✏️ Edytuj</button>
                    <button class="btn-red" onclick="deleteSong('${song.id}')">🗑️ Usuń</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openAddSongModal() {
        document.getElementById('song-modal-title').textContent = "Dodaj Nowy Utwór";
        document.getElementById('song-id-input').value = "";
        document.getElementById('song-id-input').disabled = false;
        document.getElementById('song-title-input').value = "";
        document.getElementById('song-artist-input').value = "";
        document.getElementById('song-version-input').value = "1.20";
        document.getElementById('song-genre-input').value = "Music Disc";
        document.getElementById('song-duration-input').value = "180";
        document.getElementById('song-src-input').value = "";
        document.getElementById('song-cover-input').value = "images/";
        document.getElementById('song-audio-preview').src = "";
        
        document.getElementById('song-modal').classList.remove('hidden');

        document.getElementById('song-src-input').oninput = function() {
            document.getElementById('song-audio-preview').src = this.value;
        };
    }

    function editSong(id) {
        const song = songsData.find(s => s.id === id);
        if (!song) return;

        document.getElementById('song-modal-title').textContent = "Edytuj Utwór";
        document.getElementById('song-id-input').value = song.id;
        document.getElementById('song-id-input').disabled = true;
        document.getElementById('song-title-input').value = song.title;
        document.getElementById('song-artist-input').value = song.artist;
        document.getElementById('song-version-input').value = song.version || "";
        document.getElementById('song-genre-input').value = (song.genre || []).join(', ');
        document.getElementById('song-duration-input').value = song.duration || 0;
        document.getElementById('song-src-input').value = song.src;
        document.getElementById('song-cover-input').value = song.cover;
        
        const previewEl = document.getElementById('song-audio-preview');
        previewEl.src = song.src;

        document.getElementById('song-src-input').oninput = function() {
            previewEl.src = this.value;
        };

        document.getElementById('song-modal').classList.remove('hidden');
    }

    function openAudioPreviewDirect(src) {
        const audio = new Audio(src);
        audio.play().catch(e => alert("Nie można odtworzyć pliku audio: " + src));
    }

    async function saveSong() {
        const id = document.getElementById('song-id-input').value.trim();
        const title = document.getElementById('song-title-input').value.trim();
        const artist = document.getElementById('song-artist-input').value.trim();
        const version = document.getElementById('song-version-input').value.trim();
        const genreStr = document.getElementById('song-genre-input').value.trim();
        const duration = parseInt(document.getElementById('song-duration-input').value) || 0;
        const src = document.getElementById('song-src-input').value.trim();
        const cover = document.getElementById('song-cover-input').value.trim();

        if (!id || !title || !artist || !src) {
            alert("Uzupełnij wymagane pola: ID, Tytuł, Wykonawca, Plik Audio!");
            return;
        }

        const genre = genreStr.split(',').map(g => g.trim()).filter(Boolean);

        const songObj = {
            id, title, artist, src, cover, genre, version, duration
        };

        const res = await fetch('/api/songs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(songObj)
        });

        if (res.ok) {
            closeModals();
            loadData();
        } else {
            alert("Błąd podczas zapisywania utworu.");
        }
    }

    async function deleteSong(id) {
        if (!confirm(`Czy na pewno chcesz usunąć utwór "${id}"?`)) return;
        const res = await fetch(`/api/songs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) {
            loadData();
        } else {
            alert("Błąd podczas usuwania utworu.");
        }
    }

    // --- ALBUMY (ALBUMS) ---
    function renderAlbums() {
        const grid = document.getElementById('albums-grid');
        grid.innerHTML = '';

        albumsData.forEach(album => {
            const songCount = (album.songs || []).length;
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-top">
                    <img src="${album.cover}" class="card-img" onerror="this.src='app-assets/logo.png'">
                    <div class="card-info">
                        <div class="card-title">${album.title}</div>
                        <div class="card-sub">${songCount} utworów</div>
                        <div class="card-sub" style="margin-top:2px;">${album.description || ''}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="tab-btn" onclick="editAlbum('${album.id}')">✏️ Edytuj</button>
                    <button class="btn-red" onclick="deleteAlbum('${album.id}')">🗑️ Usuń</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openAddAlbumModal() {
        document.getElementById('album-modal-title').textContent = "Dodaj Nowy Album";
        document.getElementById('album-id-input').value = "";
        document.getElementById('album-id-input').disabled = false;
        document.getElementById('album-title-input').value = "";
        document.getElementById('album-desc-input').value = "";
        document.getElementById('album-cover-input').value = "album-images/";

        renderSongPicker([]);
        document.getElementById('album-modal').classList.remove('hidden');
    }

    function editAlbum(id) {
        const album = albumsData.find(a => a.id === id);
        if (!album) return;

        document.getElementById('album-modal-title').textContent = "Edytuj Album";
        document.getElementById('album-id-input').value = album.id;
        document.getElementById('album-id-input').disabled = true;
        document.getElementById('album-title-input').value = album.title;
        document.getElementById('album-desc-input').value = album.description || "";
        document.getElementById('album-cover-input').value = album.cover;

        renderSongPicker(album.songs || []);
        document.getElementById('album-modal').classList.remove('hidden');
    }

    function renderSongPicker(selectedSongIds) {
        const container = document.getElementById('album-songs-picker');
        container.innerHTML = '';

        const selectedSet = new Set(selectedSongIds);

        songsData.forEach(song => {
            const item = document.createElement('label');
            item.className = 'song-picker-item';
            item.innerHTML = `
                <input type="checkbox" value="${song.id}" ${selectedSet.has(song.id) ? 'checked' : ''}>
                <span>${song.title} - ${song.artist}</span>
            `;
            container.appendChild(item);
        });
    }

    async function saveAlbum() {
        const id = document.getElementById('album-id-input').value.trim();
        const title = document.getElementById('album-title-input').value.trim();
        const description = document.getElementById('album-desc-input').value.trim();
        const cover = document.getElementById('album-cover-input').value.trim();

        if (!id || !title) {
            alert("Uzupełnij wymagane pola: ID Albumu, Tytuł!");
            return;
        }

        const selectedSongIds = [];
        document.querySelectorAll('#album-songs-picker input[type="checkbox"]:checked').forEach(cb => {
            selectedSongIds.push(cb.value);
        });

        const albumObj = { id, title, description, cover, songs: selectedSongIds };

        const res = await fetch('/api/albums', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(albumObj)
        });

        if (res.ok) {
            closeModals();
            loadData();
        } else {
            alert("Błąd podczas zapisywania albumu.");
        }
    }

    async function deleteAlbum(id) {
        if (!confirm(`Czy na pewno chcesz usunąć album "${id}"?`)) return;
        const res = await fetch(`/api/albums?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) {
            loadData();
        } else {
            alert("Błąd podczas usuwania albumu.");
        }
    }

    // --- UPLOAD PLIKÓW ---
    async function uploadFile(fileInput, folder, targetInputId) {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById(targetInputId).value = data.path;
                if (targetInputId === 'song-src-input') {
                    document.getElementById('song-audio-preview').src = data.path;
                }
            } else {
                alert("Błąd podczas przesyłania pliku: " + (data.error || 'Nieznany błąd'));
            }
        } catch (e) {
            alert("Błąd sieciowy podczas przesyłania pliku.");
        }
    }

    // --- GITHUB SYNC ---
    async function checkGitStatus() {
        try {
            const res = await fetch('/api/git/status');
            const data = await res.json();

            const badge = document.getElementById('git-badge');
            const remoteInfo = document.getElementById('git-remote-info');
            const initBox = document.getElementById('git-init-box');
            const publishBox = document.getElementById('git-publish-box');

            if (data.is_repo) {
                badge.className = "git-status-badge badge-green";
                badge.textContent = "Repozytorium Połączone";
                remoteInfo.textContent = data.remote_url ? `Remote URL: ${data.remote_url}` : "Brak skonfigurowanego remote url";
                initBox.classList.add('hidden');
                publishBox.classList.remove('hidden');
            } else {
                badge.className = "git-status-badge badge-yellow";
                badge.textContent = "Brak Repozytorium Git";
                remoteInfo.textContent = "";
                initBox.classList.remove('hidden');
                publishBox.classList.add('hidden');
            }
        } catch (e) {
            console.error("Błąd sprawdzania statusu git:", e);
        }
    }

    async function initGitRepo() {
        const repoUrl = document.getElementById('git-repo-url-input').value.trim();
        const res = await fetch('/api/git/init', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ repo_url: repoUrl })
        });
        const data = await res.json();
        document.getElementById('git-log-console').textContent = data.log || data.error;
        checkGitStatus();
    }

    async function publishToGithub(isForce = false) {
        const msg = document.getElementById('git-commit-msg').value.trim();
        if (!msg) {
            alert("Wpisz wiadomość commita!");
            return;
        }

        if (isForce && !confirm("Czy na pewno chcesz WYMUSIĆ nadpisanie zmian na GitHub (Force Push)? Użyj tego, gdy GitHub odrzuca Twój commit [rejected].")) {
            return;
        }

        const consoleEl = document.getElementById('git-log-console');
        consoleEl.textContent = "Rozpoczynam wysyłanie na GitHub... Proszę czekać...\\n";

        try {
            const res = await fetch('/api/git/publish', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: msg, force: isForce, action: 'publish' })
            });
            const data = await res.json();
            consoleEl.textContent = data.log || data.error;

            if (data.success) {
                alert("Sukces! Wyniki zostały opublikowane na GitHub.");
            } else {
                alert("Uwaga: Wynik polecenia git wskazuje na problem. Jeśli w logach jest error [rejected], użyj przycisku 'Wymuś Nadpisanie (Force Push)'.");
            }
            checkGitStatus();
        } catch (e) {
            consoleEl.textContent += "\\nBłąd połączenia z serwerem generatora: " + e.message;
        }
    }

    async function pullFromGithub() {
        const consoleEl = document.getElementById('git-log-console');
        consoleEl.textContent = "Pobieranie zmian z GitHub (git pull)... Proszę czekać...\\n";

        try {
            const res = await fetch('/api/git/publish', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'pull' })
            });
            const data = await res.json();
            consoleEl.textContent = data.log || data.error;

            if (data.success) {
                alert("Pobrano zmiany z GitHub.");
                loadData();
            } else {
                alert("Błąd podczas pobierania z GitHub.");
            }
            checkGitStatus();
        } catch (e) {
            consoleEl.textContent += "\\nBłąd sieci: " + e.message;
        }
    }

    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
    }

    window.onload = loadData;
</script>

</body>
</html>
"""

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print("=" * 60)
    print(" [MineTunes] Generator Muzyki & Publikator GitHub")
    print("=" * 60)
    print(f" Uruchamianie serwera pod adresem: http://localhost:{PORT}")
    print(" Zamykanie serwera: nacisnij Ctrl+C")
    print("=" * 60)

    server = HTTPServer(("0.0.0.0", PORT), GeneratorHandler)

    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nWylaczanie serwera Generatora. Do widzenia!")
        server.server_close()

if __name__ == "__main__":
    main()
