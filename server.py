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
MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.5")


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
            },
            "team": {
                "name": safe_text(team.get("name"), 80),
                "record": safe_text(team.get("record"), 30),
                "fanbase": team.get("fanbase"),
                "chemistry": team.get("chemistry"),
            },
            "recentMessages": [
                {"from": safe_text(message.get("from"), 80), "text": safe_text(message.get("text"), 500)}
                for message in messages[-8:]
                if isinstance(message, dict)
            ],
            "question": question,
        }
        request_body = {
            "model": MODEL,
            "max_output_tokens": 170,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You are roleplaying as a fictional professional lacrosse player in a sports management browser game. "
                        "Answer in first person as the player. Use the provided stats and team context. Be natural, specific, "
                        "and brief: 1-3 sentences. If the question is unsafe, private, illegal, hateful, sexual, or wildly "
                        "unrelated, politely decline and steer back to lacrosse or team life. Do not claim to be an AI."
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
        answer = safe_text(data.get("output_text"), 700)
        return {"answer": answer or "I do not have a good answer for that one right now."}


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), PLSHandler)
    public_host = "localhost" if HOST in ("127.0.0.1", "0.0.0.0") else HOST
    print(f"PLS running at http://{public_host}:{PORT}")
    if os.environ.get("OPENAI_API_KEY"):
        print(f"AI interviews enabled with {MODEL}")
    else:
        print("AI interviews disabled: set OPENAI_API_KEY to enable them.")
    server.serve_forever()
