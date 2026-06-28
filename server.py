import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def load_env_file():
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


load_env_file()

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "5173"))
MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
FALLBACK_MODELS = [model.strip() for model in os.environ.get("OPENAI_FALLBACK_MODELS", "gpt-4o-mini").split(",") if model.strip()]


def safe_text(value, limit=900):
    return " ".join(str(value or "").split())[:limit]


class PLSHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/interview-status":
            self.send_json(200, {"enabled": bool(os.environ.get("OPENAI_API_KEY")), "model": MODEL})
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/interview":
            self.send_error(404)
            return
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self.send_json(503, {"error": "AI interviews need OPENAI_API_KEY on the server."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(min(length, 12000)).decode("utf-8")
            payload = json.loads(body or "{}")
            response = self.openai_interview(api_key, payload)
            self.send_json(200, response)
        except urllib.error.HTTPError as error:
            try:
                data = json.loads(error.read().decode("utf-8"))
                message = data.get("error", {}).get("message", "AI interview failed.")
            except Exception:
                message = "AI interview failed."
            self.send_json(error.code, {"error": message})
        except Exception as error:
            self.send_json(500, {"error": str(error)})

    def openai_interview(self, api_key, payload):
        player = payload.get("player") or {}
        team = payload.get("team") or {}
        season = payload.get("season") or {}
        question = safe_text(payload.get("question"), 500)
        messages = payload.get("messages") or []
        context = {
            "player": {
                "name": safe_text(player.get("name"), 80),
                "position": safe_text(player.get("position"), 40),
                "rating": player.get("rating"),
                "age": player.get("age"),
                "goals": player.get("goals"),
                "assists": player.get("assists"),
                "saves": player.get("saves"),
                "wins": player.get("wins"),
                "trend": safe_text(player.get("trend"), 80),
                "traits": player.get("traits") or {},
                "profile": player.get("profile") or player.get("interviewProfile") or {},
                "rookie": player.get("rookie"),
                "seasonsWithTeam": player.get("seasonsWithTeam"),
                "injuryWeeks": player.get("injuryWeeks"),
            },
            "team": {
                "name": safe_text(team.get("name"), 80),
                "record": safe_text(team.get("record"), 30),
                "goalsFor": team.get("goalsFor"),
                "goalsAgainst": team.get("goalsAgainst"),
                "standing": team.get("standing"),
                "fanbase": team.get("fanbase"),
                "chemistry": team.get("chemistry"),
                "owner": safe_text(team.get("owner"), 80),
                "value": team.get("value"),
            },
            "season": {
                "week": season.get("week"),
                "draftYear": season.get("draftYear"),
                "seasonDone": season.get("seasonDone"),
                "playoffsDone": season.get("playoffsDone"),
                "worldsDone": season.get("worldsDone"),
            },
            "recentMessages": [
                {"from": safe_text(message.get("from"), 80), "text": safe_text(message.get("text"), 500)}
                for message in messages[-8:]
                if isinstance(message, dict)
            ],
            "question": question,
        }
        models = [MODEL] + [model for model in FALLBACK_MODELS if model != MODEL]
        last_error = None
        for model in models:
            try:
                return self.ask_openai_model(api_key, model, context)
            except urllib.error.HTTPError as error:
                last_error = error
                if error.code not in (400, 404):
                    raise
            except Exception as error:
                last_error = error
                raise
        if isinstance(last_error, urllib.error.HTTPError):
            raise last_error
        raise RuntimeError("AI interview failed.")

    def ask_openai_model(self, api_key, model, context):
        request_body = {
            "model": model,
            "max_output_tokens": 220,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You are the fictional lacrosse player being interviewed inside a sports management browser game. "
                        "Stay in first person as that player. Treat the JSON context as your only personal memory: name, team, "
                        "stats, traits, profile, season, and recent chat. Answer naturally and specifically, like a real person, "
                        "in 1-4 short sentences. Use the player's profile for favorites, hometown, hobbies, music, personality, "
                        "and motto. If asked for a personal fact that is not in the context, say: \"I don't know, man. What's "
                        "the next question?\" Do not invent extra family details, addresses, passwords, secrets, or fake facts. "
                        "If the question is unsafe, hateful, sexual, illegal, or too private, decline briefly. Do not say you "
                        "are an AI, a bot, a language model, or generated by a computer."
                    ),
                },
                {"role": "user", "content": "Interview context:\n" + json.dumps(context, indent=2)},
            ],
        }
        req = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(request_body).encode("utf-8"),
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as res:
            data = json.loads(res.read().decode("utf-8"))
        answer = safe_text(extract_output_text(data), 900)
        return {"answer": answer or "I don't know, man. What's the next question?", "model": model}


def extract_output_text(data):
    if data.get("output_text"):
        return data.get("output_text")
    parts = []
    for item in data.get("output", []) or []:
        for content in item.get("content", []) or []:
            if isinstance(content, dict):
                if content.get("text"):
                    parts.append(content.get("text"))
                elif content.get("type") == "output_text" and content.get("text"):
                    parts.append(content.get("text"))
    return " ".join(parts)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), PLSHandler)
    public_host = "localhost" if HOST in ("127.0.0.1", "0.0.0.0") else HOST
    print(f"PLS running at http://{public_host}:{PORT}")
    if os.environ.get("OPENAI_API_KEY"):
        print(f"AI interviews enabled with {MODEL}")
    else:
        print("AI interviews disabled: set OPENAI_API_KEY to enable them.")
    server.serve_forever()
