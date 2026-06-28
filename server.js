const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const model = normalizeModelName(process.env.OPENAI_MODEL || "gpt-4o-mini");
const fallbackModels = (process.env.OPENAI_FALLBACK_MODELS || "gpt-4o-mini").split(",").map((item) => normalizeModelName(item.trim())).filter(Boolean);

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

function normalizeModelName(value) {
  const raw = String(value || "gpt-4o-mini").replace(/\s+/g, "").toLowerCase().replace(/_/g, "-");
  const aliases = {
    "gpt4.0mini": "gpt-4o-mini",
    "gpt-4.0-mini": "gpt-4o-mini",
    "gpt4omini": "gpt-4o-mini",
    "gpt-4omini": "gpt-4o-mini",
    "gpt-4o-mini": "gpt-4o-mini",
    "gpt5.5": "gpt-4o-mini",
    "gpt-5.5": "gpt-4o-mini"
  };
  return aliases[raw] || value || "gpt-4o-mini";
}

async function handleInterview(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, { error: "Player interviews are using the built-in free engine." });
    return;
  }

  const body = JSON.parse(await readBody(req) || "{}");
  const player = body.player || {};
  const team = body.team || {};
  const season = body.season || {};
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
      traits: player.traits || {},
      profile: player.profile || player.interviewProfile || {},
      rookie: player.rookie,
      seasonsWithTeam: player.seasonsWithTeam,
      injuryWeeks: player.injuryWeeks
    },
    team: {
      name: safeText(team.name, 80),
      record: safeText(team.record, 30),
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      standing: team.standing,
      fanbase: team.fanbase,
      chemistry: team.chemistry,
      owner: safeText(team.owner, 80),
      value: team.value
    },
    season: {
      week: season.week,
      draftYear: season.draftYear,
      seasonDone: season.seasonDone,
      playoffsDone: season.playoffsDone,
      worldsDone: season.worldsDone
    },
    recentMessages: recentMessages.map((message) => ({
      from: safeText(message.from, 80),
      text: safeText(message.text, 500)
    })),
    question
  };

  const models = [model, ...fallbackModels.filter((fallback) => fallback !== model)];
  let lastError = null;
  for (const modelName of models) {
    const result = await askOpenAiModel(modelName, context);
    if (result.ok) {
      sendJson(res, 200, { answer: result.answer, model: modelName });
      return;
    }
    lastError = result;
    if (![400, 404].includes(result.status)) break;
  }
  sendJson(res, lastError.status || 500, { error: lastError.error || "AI interview failed." });
}

async function askOpenAiModel(modelName, context) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      max_output_tokens: 220,
      input: [
        {
          role: "system",
          content: "You are the fictional lacrosse player being interviewed inside a sports management browser game. Stay in first person as that player. Treat the JSON context as your personal memory: name, team, stats, traits, profile, season, and recent chat. Answer naturally and specifically, like a real person, in 1-4 short sentences. Directly answer every harmless question, including questions unrelated to lacrosse. Use known profile facts when available. When a harmless personal preference or story is not in the context, creatively invent a concise answer that fits the player's personality and stay consistent with earlier chat. Never invent an address, password, private contact information, or instructions for wrongdoing. If the question is unsafe, hateful, sexual, illegal, or invasively private, decline briefly. Do not say you are an AI, a bot, a language model, or generated by a computer."
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
    return { ok: false, status: response.status, error: data.error && data.error.message ? data.error.message : "AI interview failed." };
  }

  const answer = safeText(extractOutputText(data), 900);
  if (!answer) return { ok: false, status: 502, error: "The interview model returned an empty answer." };
  return { ok: true, answer };
}

function extractOutputText(data) {
  if (data.output_text) return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content && content.text) parts.push(content.text);
    }
  }
  return parts.join(" ");
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
  console.log(process.env.OPENAI_API_KEY ? `Enhanced player interviews enabled with ${model}` : "Using built-in free player interview engine.");
});
