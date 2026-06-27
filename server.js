const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const model = process.env.OPENAI_MODEL || "gpt-5.5";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12000) {
        req.destroy();
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function safeText(value, max = 900) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function handleInterview(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, { error: "AI interviews need OPENAI_API_KEY on the server." });
    return;
  }

  const body = JSON.parse(await readBody(req) || "{}");
  const player = body.player || {};
  const team = body.team || {};
  const question = safeText(body.question, 500);
  const recentMessages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];

  if (!question) {
    sendJson(res, 400, { error: "Question required." });
    return;
  }

  const context = {
    player: {
      name: safeText(player.name, 80),
      position: safeText(player.position, 40),
      rating: player.rating,
      age: player.age,
      goals: player.goals,
      assists: player.assists,
      saves: player.saves,
      wins: player.wins,
      trend: safeText(player.trend, 80),
      traits: player.traits || {}
    },
    team: {
      name: safeText(team.name, 80),
      record: safeText(team.record, 30),
      fanbase: team.fanbase,
      chemistry: team.chemistry
    },
    recentMessages: recentMessages.map((message) => ({
      from: safeText(message.from, 80),
      text: safeText(message.text, 500)
    })),
    question
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 170,
      input: [
        {
          role: "system",
          content: "You are roleplaying as a fictional professional lacrosse player in a sports management browser game. Answer in first person as the player. Use the provided stats and team context. Be natural, specific, and brief: 1-3 sentences. If the question is unsafe, private, illegal, hateful, sexual, or wildly unrelated, politely decline and steer back to lacrosse or team life. Do not claim to be an AI."
        },
        {
          role: "user",
          content: `Interview context:\n${JSON.stringify(context, null, 2)}`
        }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    sendJson(res, response.status, { error: data.error && data.error.message ? data.error.message : "AI interview failed." });
    return;
  }

  sendJson(res, 200, { answer: safeText(data.output_text || "", 700) || "I do not have a good answer for that one right now." });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  const filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/interview-status") {
    sendJson(res, 200, { enabled: !!process.env.OPENAI_API_KEY, model });
    return;
  }
  if (req.method === "POST" && req.url === "/api/interview") {
    handleInterview(req, res).catch((error) => sendJson(res, 500, { error: error.message || "Server error." }));
    return;
  }
  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`PLS running at http://localhost:${port}`);
  console.log(process.env.OPENAI_API_KEY ? `AI interviews enabled with ${model}` : "AI interviews disabled: set OPENAI_API_KEY to enable them.");
});
