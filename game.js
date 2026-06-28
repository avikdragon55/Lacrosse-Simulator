const teamNames = [
  "Oregon Cupids",
  "Team Aqua",
  "Boston Galaxy Elite",
  "Maryland Bobcats",
  "Lawrenceville Tigers",
  "Team Ross Elite",
  "Arizona 91",
  "Colorado Springs Selects",
  "Tennessee Mountaineers",
  "Vermont Cowboys",
  "Wisconsin Reds",
  "North Carolina Vipers",
  "Texas Reindeers",
  "California Treestumps",
  "New York Stars",
  "LA Selects",
  "Team Illinois",
  "Tampa Bay Blue Jays",
  "New Hampshire Soil Gatherers",
  "Seattle Emeralds"
];

const owners = [
  "Mara Donnelly", "Quinn Aoki", "Victor Hale", "Reese Calloway", "Talia Marsh",
  "Ross Whitaker", "Eli Romero", "Nora Pike", "Grant Hensley", "Cal Ward",
  "Mika Redd", "Jules Kenan", "Sterling Bass", "Ivy Navarro", "Dante Cross",
  "Luc Legrand", "Harper Knox", "Theo Santana", "Bennett Lowell", "Sasha Green"
];

const colors = ["#db5361", "#159cc4", "#392f76", "#c66f2d", "#efb522", "#745ac7", "#e7632f", "#537b9f", "#71664f", "#814c9e", "#cf2e3d", "#288f5b", "#8f4e46", "#6b5434", "#1d67b2", "#207a69", "#234f94", "#2e86c1", "#735d4d", "#20936d"];
const positions = ["Attackman", "Defenseman", "Midfielder", "Goalie"];
const draftNeeds = ["Attackman", "Defenseman", "Midfielder", "Goalie", "Choice"];
const rosterCaps = { Attackman: 5, Midfielder: 5, Defenseman: 5, Goalie: 2 };
const starterTargets = { Attackman: 3, Midfielder: 3, Defenseman: 3, Goalie: 1 };
const rosterMinimums = { Attackman: 3, Midfielder: 3, Defenseman: 3, Goalie: 1 };
const countries = ["Canada", "England", "Australia", "Japan", "Ireland", "Haudenosaunee", "Germany"];
const headlineProspects = [
  "Alex Powers", "Bob Masonry", "Reddster Kiln", "Leon Wieserman", "Gurp Washel", "Rob Casco",
  "Trey Waters", "Alex Green", "Maxwell Monroe", "Keagan Meyers", "Vadar Holm", "Bjorne Lindstrom",
  "Kash Rocket", "Milo Thunder", "Zane Frost", "Nico Voltage", "Otto Blaze", "Jett Harbor",
  "Roman Stonewall", "Finn Laser", "Cruz Night", "Axel North", "Bodie Sparks", "Luca Moon"
];

let state = {};
let idCounter = 0;
let currentAccount = null;
let pendingLoginAccount = null;
let accountMode = "signup";
let bootingAccount = false;
let activeInterviewPlayerId = null;
let interviewMessages = [];
let interviewAwaiting = false;
let aiInterviewEnabled = false;
let aiInterviewChecked = false;
let music = {
  ctx: null,
  master: null,
  sfx: null,
  timer: null,
  melodyTimer: null,
  beatTimer: null,
  pad: [],
  voices: [],
  noiseBuffer: null,
  on: false,
  song: "calm",
  chordStep: 0,
  melodyStep: 0,
  beatStep: 0,
  bassStep: 0
};
const musicSongs = {
  calm: {
    name: "Calm Pad",
    volume: 0.16,
    chordMs: 4200,
    melodyMs: 2600,
    chordWave: "sine",
    melodyWave: "sine",
    padWave: "sine",
    padGain: [0.075, 0.04, 0.035],
    chordGain: 0.055,
    melodyGain: 0.045,
    beatMs: 1200,
    beat: "soft",
    bass: [65.41, 73.42, 82.41, 73.42],
    pad: [130.81, 196, 261.63],
    chords: [[196, 246.94, 293.66], [174.61, 220, 261.63], [164.81, 207.65, 246.94], [146.83, 196, 246.94]],
    melody: [392, 329.63, 293.66, 246.94, 293.66, 329.63]
  },
  night: {
    name: "Neon Night",
    volume: 0.2,
    chordMs: 1800,
    melodyMs: 900,
    chordWave: "triangle",
    melodyWave: "square",
    padWave: "triangle",
    padGain: [0.045, 0.035, 0.025],
    chordGain: 0.075,
    melodyGain: 0.052,
    beatMs: 450,
    beat: "electro",
    bass: [98, 110, 123.47, 146.83],
    pad: [98, 146.83, 220],
    chords: [[220, 277.18, 329.63], [246.94, 311.13, 369.99], [196, 246.94, 293.66], [293.66, 369.99, 440]],
    melody: [659.25, 587.33, 493.88, 440, 493.88, 587.33, 739.99, 659.25]
  },
  focus: {
    name: "Draft Focus",
    volume: 0.16,
    chordMs: 2600,
    melodyMs: 700,
    chordWave: "sawtooth",
    melodyWave: "triangle",
    padWave: "sine",
    padGain: [0.045, 0.025, 0.018],
    chordGain: 0.045,
    melodyGain: 0.035,
    beatMs: 700,
    beat: "click",
    bass: [55, 61.74, 65.41, 73.42],
    pad: [110, 164.81, 220],
    chords: [[110, 164.81, 220], [123.47, 185, 246.94], [130.81, 196, 261.63], [98, 146.83, 196]],
    melody: [220, 246.94, 261.63, 293.66, 261.63, 246.94, 220, 196]
  },
  champion: {
    name: "Champion Glow",
    volume: 0.22,
    chordMs: 2400,
    melodyMs: 1200,
    chordWave: "triangle",
    melodyWave: "sine",
    padWave: "triangle",
    padGain: [0.07, 0.055, 0.04],
    chordGain: 0.09,
    melodyGain: 0.085,
    beatMs: 600,
    beat: "stadium",
    bass: [87.31, 98, 116.54, 130.81],
    pad: [174.61, 261.63, 349.23],
    chords: [[349.23, 440, 523.25], [392, 493.88, 587.33], [329.63, 440, 523.25], [293.66, 392, 493.88]],
    melody: [698.46, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 880]
  },
  rap: {
    name: "Rap Warmup",
    volume: 0.24,
    chordMs: 2400,
    melodyMs: 1200,
    beatMs: 360,
    beat: "rap",
    chordWave: "triangle",
    melodyWave: "square",
    padWave: "sine",
    padGain: [0.035, 0.025, 0.018],
    chordGain: 0.035,
    melodyGain: 0.035,
    bass: [73.42, 73.42, 87.31, 65.41, 73.42, 98],
    pad: [73.42, 146.83, 220],
    chords: [[146.83, 185, 220], [164.81, 207.65, 246.94], [130.81, 164.81, 196], [146.83, 196, 246.94]],
    melody: [293.66, 329.63, 293.66, 246.94, 220, 246.94]
  },
  phonk: {
    name: "Phonk Drive",
    volume: 0.27,
    chordMs: 1800,
    melodyMs: 600,
    beatMs: 300,
    beat: "phonk",
    chordWave: "sawtooth",
    melodyWave: "square",
    padWave: "sawtooth",
    padGain: [0.03, 0.018, 0.014],
    chordGain: 0.04,
    melodyGain: 0.05,
    bass: [55, 65.41, 55, 82.41, 73.42, 65.41],
    pad: [55, 110, 164.81],
    chords: [[110, 138.59, 164.81], [98, 123.47, 146.83], [82.41, 110, 138.59], [73.42, 98, 123.47]],
    melody: [440, 415.3, 392, 329.63, 293.66, 329.63, 392, 440]
  },
  hardcore: {
    name: "Hardcore Arena",
    volume: 0.3,
    chordMs: 900,
    melodyMs: 450,
    beatMs: 240,
    beat: "hardcore",
    chordWave: "sawtooth",
    melodyWave: "square",
    padWave: "sawtooth",
    padGain: [0.025, 0.018, 0.012],
    chordGain: 0.055,
    melodyGain: 0.04,
    bass: [41.2, 41.2, 55, 61.74, 41.2, 73.42],
    pad: [41.2, 82.41, 123.47],
    chords: [[82.41, 103.83, 123.47], [98, 123.47, 146.83], [73.42, 92.5, 110], [61.74, 82.41, 98]],
    melody: [329.63, 246.94, 392, 293.66, 440, 329.63]
  },
  trap: {
    name: "Trap Tunnel",
    volume: 0.25,
    chordMs: 1600,
    melodyMs: 800,
    beatMs: 320,
    beat: "trap",
    chordWave: "triangle",
    melodyWave: "sine",
    padWave: "triangle",
    padGain: [0.04, 0.03, 0.018],
    chordGain: 0.04,
    melodyGain: 0.045,
    bass: [61.74, 61.74, 73.42, 82.41, 73.42, 55],
    pad: [61.74, 123.47, 185],
    chords: [[123.47, 155.56, 185], [146.83, 185, 220], [110, 146.83, 185], [98, 123.47, 164.81]],
    melody: [493.88, 440, 392, 369.99, 329.63, 392]
  },
  arcade: {
    name: "Arcade Choir",
    volume: 0.2,
    chordMs: 3200,
    melodyMs: 380,
    beatMs: 960,
    beat: "spark",
    chordWave: "sine",
    melodyWave: "triangle",
    padWave: "square",
    padGain: [0.022, 0.018, 0.012],
    chordGain: 0.04,
    melodyGain: 0.032,
    bass: [130.81, 164.81, 196, 261.63],
    pad: [261.63, 329.63, 392],
    chords: [[523.25, 659.25, 783.99], [587.33, 739.99, 880], [493.88, 659.25, 987.77], [392, 523.25, 783.99]],
    melody: [1046.5, 987.77, 783.99, 659.25, 783.99, 1174.66, 1318.51, 987.77]
  },
  lofi: {
    name: "Lo-Fi Locker Room",
    volume: 0.2,
    chordMs: 3600,
    melodyMs: 1500,
    beatMs: 520,
    beat: "lofi",
    chordWave: "sine",
    melodyWave: "triangle",
    padWave: "sine",
    padGain: [0.05, 0.035, 0.025],
    chordGain: 0.06,
    melodyGain: 0.035,
    bass: [65.41, 73.42, 55, 61.74, 65.41, 49],
    pad: [130.81, 164.81, 196],
    chords: [[261.63, 311.13, 392, 493.88], [220, 261.63, 329.63, 415.3], [196, 246.94, 293.66, 369.99], [174.61, 220, 261.63, 329.63]],
    melody: [523.25, 493.88, 392, 329.63, 0, 392, 440, 329.63]
  },
  drill: {
    name: "Midnight Drill",
    volume: 0.27,
    chordMs: 3200,
    melodyMs: 740,
    beatMs: 250,
    beat: "drill",
    chordWave: "triangle",
    melodyWave: "sine",
    padWave: "triangle",
    padGain: [0.022, 0.015, 0.01],
    chordGain: 0.035,
    melodyGain: 0.055,
    bass: [46.25, 46.25, 55, 41.2, 61.74, 55, 46.25, 36.71],
    pad: [92.5, 138.59, 185],
    chords: [[185, 220, 277.18], [164.81, 207.65, 246.94], [146.83, 185, 220], [138.59, 174.61, 207.65]],
    melody: [739.99, 659.25, 587.33, 493.88, 440, 493.88, 587.33, 0]
  }
};
const youtubeSongs = {
  "stolen-dance": { name: "Stolen Dance", artist: "Milky Chance", id: "iX-QaNzd-0Y" },
  "the-way-i-are": { name: "The Way I Are", artist: "Timbaland, Keri Hilson, D.O.E.", id: "U5rLz5AZBIA" },
  "less-i-know": { name: "The Less I Know The Better", artist: "Tame Impala", id: "sBzrzS1Ag_g" },
  "apologize": { name: "Apologize", artist: "Timbaland, OneRepublic", id: "ZSM3w1v-A_Y" },
  "fear": { name: "FEAR", artist: "NF", id: "lLFoLJIXayk" },
  "ian-text-back": { name: "Ian text back", artist: "Lildrew", id: "qgBc5niQyO4" },
  "700-club": { name: "700 CLUB", artist: "Logic, Wiz Khalifa", id: "xzFBXqi6imw" },
  "what-you-saying": { name: "What You Saying", artist: "Lil Uzi Vert", id: "s_TUESTU7_4" },
  "praise-the-lord": { name: "Praise The Lord (Da Shine)", artist: "A$AP Rocky, Skepta", id: "Kbj2Zss-5GY" }
};
const accountStorageKey = "plsAccountsV1";
const leaderboardStorageKey = "plsLeaderboardV1";
const themeStorageKey = "plsThemeV1";
const ownerUsernames = ["avik hardy"];

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];
const money = (n) => `$${Math.round(n)}k`;
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ratingBand(place) {
  return Math.max(60, Math.round(96 - place * 1.45 + rand(-5, 5)));
}

function clampRating(value) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function makeTraits(position, rating) {
  return {
    iq: clampRating(rating + rand(-10, 12)),
    showboat: clampRating(rand(35, 88) + (position === "Attackman" ? 8 : 0)),
    enforcer: clampRating(rand(34, 84) + (position === "Defenseman" ? 12 : 0)),
    playmaking: clampRating(rating + rand(-16, 12) + (position === "Midfielder" ? 10 : 0)),
    goalScoring: clampRating(rating + rand(-18, 14) + (position === "Attackman" ? 12 : position === "Goalie" ? -28 : 0)),
    leadership: clampRating(rating + rand(-18, 16) + goalieLeadershipBonus(position))
  };
}

function goalieLeadershipBonus(position) {
  return position === "Goalie" ? 4 : 0;
}

function makeInterviewProfile(name, position, rating) {
  const colors = ["neon green", "midnight blue", "black", "red", "silver", "gold", "electric cyan", "purple", "white"];
  const foods = ["chicken alfredo", "steak tacos", "sushi", "a huge burger", "pasta with meat sauce", "buffalo chicken wraps", "breakfast sandwiches"];
  const music = ["rap before warmups", "hard rock in the weight room", "phonk when I need energy", "old-school hip hop", "anything fast with a heavy beat", "calmer music after games"];
  const hobbies = ["watching film", "lifting", "playing video games", "shooting after practice", "hanging with teammates", "customizing sticks", "watching college lacrosse"];
  const hometowns = ["Baltimore", "Denver", "Long Island", "Philadelphia", "Boston", "Dallas", "San Diego", "Minneapolis", "Charlotte", "Columbus"];
  const heroes = ["a two-way midfielder from my hometown", "my first travel coach", "my older cousin", "a goalie who never talked but stopped everything", "the captain from my first serious team"];
  const nicknames = ["Wheels", "Ice", "Rocket", "Buckets", "Clamp", "Flash", "Tank", "Captain", "Silky"];
  const goofyHabits = ["taping my stick the exact same way", "talking to the goal posts before warmups", "wearing lucky socks", "ranking every hotel breakfast", "doing one tiny dance after a clean ground ball", "naming my sticks like they are race cars"];
  const phrases = ["no question", "big-time", "low-key", "not gonna lie", "that's locker-room science", "write that down in crayon"];
  const vibes = rating >= 88
    ? ["confident", "competitive", "spotlight-ready", "locked in"]
    : rating >= 74
      ? ["honest", "team-first", "gritty", "focused"]
      : ["quiet", "hungry", "humble", "trying to prove myself"];
  const hash = Math.abs(`${name}-${position}-${rating}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  return {
    hometown: hometowns[hash % hometowns.length],
    favoriteColor: colors[(hash + 1) % colors.length],
    favoriteFood: foods[(hash + 2) % foods.length],
    music: music[(hash + 3) % music.length],
    hobby: hobbies[(hash + 4) % hobbies.length],
    hero: heroes[(hash + 6) % heroes.length],
    nickname: nicknames[(hash + 7) % nicknames.length],
    goofyHabit: goofyHabits[(hash + 8) % goofyHabits.length],
    catchphrase: phrases[(hash + 9) % phrases.length],
    personality: vibes[(hash + 5) % vibes.length],
    motto: rating >= 88 ? "Own the moment." : rating >= 74 ? "Win the next possession." : "Earn every shift."
  };
}

function makePlayer(name, position, rating, age, salary, rookie = false) {
  const goalsBias = position === "Attackman" ? 1.45 : position === "Midfielder" ? 1.1 : position === "Defenseman" ? 0.45 : 0.08;
  const assistBias = position === "Midfielder" ? 1.35 : position === "Attackman" ? 1.1 : position === "Defenseman" ? 0.5 : 0.05;
  return {
    id: `p-${idCounter++}`,
    name,
    position,
    rating,
    age,
    salary,
    rookie,
    traits: makeTraits(position, rating),
    interviewProfile: makeInterviewProfile(name, position, rating),
    goalsBias,
    assistBias,
    goals: 0,
    assists: 0,
    saves: 0,
    wins: 0,
    seasonsWithTeam: 0,
    injuryWeeks: 0
  };
}

function playerName(seed) {
  const first = ["Jace", "Cole", "Maddox", "Finn", "Carter", "Nolan", "Ryder", "Brooks", "Weston", "Miles", "Drew", "Tate", "Luca", "Kellan", "Brady", "Sawyer", "Dash", "Knox", "Rocco", "Titan", "Breck", "Macklin", "Cannon", "Ryker", "Ozzy", "Crew"];
  const last = ["Miller", "Hayes", "Porter", "Bishop", "Stone", "Reed", "Walsh", "Dawson", "Blake", "Fraser", "Knight", "Murray", "Banks", "Frost", "Kline", "Hughes", "Jetson", "Riptide", "Quick", "Vortex", "Lazer", "Ironwood", "Winters", "Crossbar", "Wild", "Hammers"];
  return seed || `${pick(first)} ${pick(last)}`;
}

function baseRoster(teamIndex, place) {
  const base = ratingBand(place);
  return [
    makePlayer(playerName(), "Attackman", base + 2, Math.floor(rand(22, 34)), Math.floor(rand(110, 230))),
    makePlayer(playerName(), "Attackman", base - 1, Math.floor(rand(22, 34)), Math.floor(rand(90, 190))),
    makePlayer(playerName(), "Midfielder", base + 1, Math.floor(rand(22, 34)), Math.floor(rand(100, 220))),
    makePlayer(playerName(), "Midfielder", base - 2, Math.floor(rand(22, 34)), Math.floor(rand(80, 180))),
    makePlayer(playerName(), "Defenseman", base, Math.floor(rand(23, 34)), Math.floor(rand(90, 200))),
    makePlayer(playerName(), "Defenseman", base - 3, Math.floor(rand(23, 34)), Math.floor(rand(75, 170))),
    makePlayer(playerName(), "Goalie", base + Math.floor(rand(-2, 3)), Math.floor(rand(24, 34)), Math.floor(rand(100, 210)))
  ].map((p, i) => ({ ...p, name: i === 0 ? `${teamNames[teamIndex].split(" ")[0]} Captain` : p.name }));
}

function createTeams() {
  const lastPlaces = shuffle(teamNames.map((_, index) => index + 1));
  return teamNames.map((name, index) => {
    const place = lastPlaces[index];
    const madePlayoffs = place <= 8;
    const champion = place === 1;
    const fanbase = Math.round(rand(45, 98) - place * 0.8);
    const chemistry = Math.round(rand(54, 92) - place * 0.35);
    return {
      id: index,
      name,
      color: colors[index],
      owner: owners[index],
      lastPlace: place,
      madePlayoffs,
      champion,
      fanbase,
      chemistry,
      value: Math.round(42 + fanbase * 1.7 + chemistry * 0.8 + (21 - place) * 4),
      wins: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      roster: baseRoster(index, place),
      lineup: {},
      picks: []
    };
  });
}

function createDraftPool(classYear = 1) {
  const classNames = Array.from({ length: 7 }, (_, index) => headlineProspects[(index + (classYear - 1) * 7) % headlineProspects.length]);
  const starPositions = ["Attackman", "Goalie", "Midfielder", "Defenseman", "Attackman", "Midfielder", "Defenseman"];
  const stars = classNames.map((name, index) => {
    const rating = Math.max(84, 91 - index + Math.round(rand(-1, 2)));
    return makePlayer(name, starPositions[index], rating, Math.floor(rand(19, 23)), Math.round(250 + rating * 0.6 + rand(-12, 18)), true);
  });
  const pool = [...stars];
  for (let i = 0; i < 520; i++) {
    const tier = Math.random();
    const rating = tier < 0.28 ? Math.round(rand(42, 58)) : tier < 0.72 ? Math.round(rand(59, 74)) : Math.round(rand(75, 85));
    const salary = tier < 0.12 ? 0 : tier < 0.28 ? Math.round(rand(4, 38)) : tier < 0.72 ? Math.round(rand(30, 112)) : Math.round(115 + (rating - 74) * rand(7, 14));
    pool.push(makePlayer(playerName(), pick(positions), rating, Math.floor(rand(18, 24)), salary, true));
  }
  return pool.sort((a, b) => b.rating - a.rating || b.salary - a.salary);
}

function resetGame() {
  idCounter = 0;
  state = {
    teams: createTeams(),
    gmName: currentAccount && readAccounts()[currentAccount] ? readAccounts()[currentAccount].gmName : "",
    selected: null,
    draftYear: 1,
    lottery: [],
    draftPool: createDraftPool(1),
    draftBudget: 750,
    tradeBudget: 400,
    currentPick: 0,
    myDrafted: [],
    draftPicks: [],
    pickLog: [],
    week: 1,
    schedule: [],
    seasonDone: false,
    playoffsDone: false,
    worldsDone: false,
    playoffs: null,
    worlds: null,
    offers: [],
    offerBatch: 0,
    lastTradePopupBatch: 0,
    lotteryAnimating: false,
    liveSim: null,
    liveRecord: null,
    playoffLive: null,
    worldsLive: null,
    emails: [],
    news: [],
    rosterCutMode: false,
    keepRosterIds: [],
    allStarDone: false,
    allStarResults: [],
    hallOfFame: [],
    selectedEmail: 0,
    helpRequests: 0,
    myResults: [],
    latestToastOffer: null,
    tradeMessage: "",
    ownerGoal: null,
    ownerGoalReviewPending: false,
    fired: false
  };
  state.schedule = makeSchedule();
  const intro = qs("#intro-screen");
  const rules = qs("#rules-screen");
  const teamSelect = qs("#team-select");
  const game = qs("#game");
  if (intro) intro.classList.remove("hidden");
  if (rules) rules.classList.add("hidden");
  if (teamSelect) teamSelect.classList.add("hidden");
  if (game) game.classList.add("hidden");
  renderTeams();
  renderLeaderboard();
  renderAll();
  saveAccountProgress();
}

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(accountStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
}

function normalizeAccountStorage() {
  const accounts = readAccounts();
  let changed = false;
  Object.keys(accounts).forEach((key) => {
    const account = accounts[key] || {};
    const clean = sanitizeUsername(account.username || key);
    if (!clean || clean === key) return;
    accounts[clean] = {
      ...account,
      ...(accounts[clean] || {}),
      username: clean,
      gmName: (accounts[clean] && accounts[clean].gmName) || account.gmName || key,
      password: (accounts[clean] && accounts[clean].password) || account.password,
      state: (accounts[clean] && accounts[clean].state) || account.state || null,
      createdAt: Math.min(accounts[clean] && accounts[clean].createdAt || account.createdAt || Date.now(), account.createdAt || Date.now()),
      updatedAt: Math.max(accounts[clean] && accounts[clean].updatedAt || 0, account.updatedAt || 0, Date.now())
    };
    delete accounts[key];
    changed = true;
  });
  if (changed) writeAccounts(accounts);
  return accounts;
}

function isOwnerUsername(username = currentAccount) {
  return ownerUsernames.includes(sanitizeUsername(username || ""));
}

function accountMatchesOwner(username, account = {}) {
  return isOwnerUsername(username) || isOwnerUsername(account.username) || isOwnerUsername(account.gmName);
}

function isOwnerAccount() {
  const accounts = readAccounts();
  const account = accounts[currentAccount] || {};
  return accountMatchesOwner(currentAccount, account);
}

function findAccountKey(username) {
  const clean = sanitizeUsername(username || "");
  const accounts = normalizeAccountStorage();
  if (accounts[username]) return username;
  if (accounts[clean]) return clean;
  return Object.keys(accounts).find((key) => sanitizeUsername(key) === clean || sanitizeUsername(accounts[key].username || "") === clean) || clean;
}

function normalizeOwnerAccounts() {
  const accounts = normalizeAccountStorage();
  let changed = false;
  Object.keys(accounts).forEach((username) => {
    const shouldOwn = accountMatchesOwner(username, accounts[username]);
    if (accounts[username].owner !== shouldOwn) {
      accounts[username].owner = shouldOwn;
      changed = true;
    }
    if (shouldOwn && accounts[username].banned) {
      accounts[username].banned = false;
      changed = true;
    }
  });
  if (changed) writeAccounts(accounts);
}

function readLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(leaderboardStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function writeLeaderboard(board) {
  localStorage.setItem(leaderboardStorageKey, JSON.stringify(board));
}

function updateLeaderboardForSeason(wonTitle) {
  if (!currentAccount) return;
  const board = readLeaderboard();
  const account = readAccounts()[currentAccount] || {};
  const entry = board[currentAccount] || {
    username: currentAccount,
    gmName: account.gmName || state.gmName || currentAccount,
    yearsPlayed: 0,
    championships: 0
  };
  entry.gmName = account.gmName || state.gmName || entry.gmName;
  entry.yearsPlayed += 1;
  if (wonTitle) entry.championships += 1;
  entry.rate = entry.yearsPlayed ? entry.championships / entry.yearsPlayed : 0;
  board[currentAccount] = entry;
  writeLeaderboard(board);
}

function sanitizeUsername(username) {
  return username.trim().toLowerCase().replace(/\s+/g, " ");
}

function saveAccountProgress() {
  if (!currentAccount || bootingAccount || !state.teams) return;
  const accounts = readAccounts();
  const accountKey = findAccountKey(currentAccount);
  const account = accounts[accountKey];
  if (!account) return;
  accounts[accountKey] = {
    ...account,
    owner: accountMatchesOwner(accountKey, account),
    gmName: state.gmName || account.gmName,
    idCounter,
    state: {
      ...state,
      liveSim: null,
      liveRecord: null,
      playoffLive: null,
      worldsLive: null,
      lotteryAnimating: false
    },
    updatedAt: Date.now()
  };
  writeAccounts(accounts);
}

function loadAccount(username) {
  const accountKey = findAccountKey(username);
  const account = readAccounts()[accountKey];
  if (!account || !account.state) return false;
  currentAccount = accountKey;
  bootingAccount = true;
  idCounter = account.idCounter || inferIdCounter(account.state);
  state = {
    ...account.state,
    gmName: account.gmName || account.state.gmName || username,
    liveSim: null,
    liveRecord: null,
    playoffLive: null,
    worldsLive: null,
    lotteryAnimating: false
  };
  normalizeState();
  bootingAccount = false;
  showGameForLoadedAccount();
  renderTeams();
  renderLeaderboard();
  renderOwnerAccess();
  renderAll();
  if (isOwnerAccount()) setTab("owner");
  return true;
}

function normalizeState() {
  state.news = state.news || [];
  state.allStarDone = !!state.allStarDone;
  state.allStarResults = state.allStarResults || [];
  state.hallOfFame = state.hallOfFame || [];
  state.ownerGoal = state.ownerGoal || null;
  state.ownerGoalReviewPending = !!state.ownerGoalReviewPending;
  state.fired = !!state.fired;
  if (state.selected !== null && !state.ownerGoal) state.ownerGoal = makeOwnerGoal(state.teams[state.selected]);
  state.rosterCutMode = !!state.rosterCutMode;
  state.keepRosterIds = state.keepRosterIds || [];
  state.emails = state.emails || [];
  state.teams.forEach((team) => {
    team.lineup = team.lineup || {};
    team.roster.forEach((player) => {
      player.traits = player.traits || makeTraits(player.position, player.rating);
      player.interviewProfile = player.interviewProfile || makeInterviewProfile(player.name, player.position, player.rating);
      player.seasonsWithTeam = player.seasonsWithTeam || 0;
      player.injuryWeeks = player.injuryWeeks || 0;
    });
    ensureTeamLineup(team);
  });
  state.draftPool.forEach((player) => {
    player.traits = player.traits || makeTraits(player.position, player.rating);
    player.interviewProfile = player.interviewProfile || makeInterviewProfile(player.name, player.position, player.rating);
    player.seasonsWithTeam = player.seasonsWithTeam || 0;
    player.injuryWeeks = player.injuryWeeks || 0;
  });
  if (state.selected !== null && state.myDrafted.length >= draftNeeds.length && rosterNeedsCuts(state.teams[state.selected])) {
    state.rosterCutMode = true;
    if (!state.keepRosterIds.length) {
      const mine = state.teams[state.selected];
      state.keepRosterIds = [];
      [...mine.roster].sort((a, b) => rosterKeepScore(b) - rosterKeepScore(a)).forEach((player) => {
        const keptRoster = mine.roster.filter((p) => state.keepRosterIds.includes(p.id));
        const counts = positionCounts(keptRoster);
        if (state.keepRosterIds.length < requiredKeepCount(mine) && counts[player.position] < rosterCaps[player.position]) state.keepRosterIds.push(player.id);
      });
    }
  }
}

function inferIdCounter(savedState) {
  const ids = [];
  (savedState.teams || []).forEach((team) => {
    (team.roster || []).forEach((player) => ids.push(player.id));
  });
  (savedState.draftPool || []).forEach((player) => ids.push(player.id));
  return ids.reduce((max, id) => {
    const match = String(id).match(/^p-(\d+)$/);
    return match ? Math.max(max, Number(match[1]) + 1) : max;
  }, 0);
}

function showGameForLoadedAccount() {
  qs("#account-modal").classList.add("hidden");
  qs("#rules-screen").classList.add("hidden");
  if (state.selected === null) {
    qs("#intro-screen").classList.add("hidden");
    qs("#team-select").classList.remove("hidden");
    qs("#game").classList.add("hidden");
  } else {
    qs("#intro-screen").classList.add("hidden");
    qs("#team-select").classList.add("hidden");
    qs("#game").classList.remove("hidden");
  }
}

function createAccount() {
  const gmName = qs("#gm-name").value.trim();
  const username = sanitizeUsername(qs("#account-username").value);
  const password = qs("#account-password").value;
  if (!gmName || !username || !password) {
    setAccountMessage("Enter a GM name, username, and password.");
    return;
  }
  const existingKey = findAccountKey(username);
  const accounts = readAccounts();
  if (accounts[existingKey]) {
    setAccountMessage("That username already exists. Log in or choose another username.");
    return;
  }
  accounts[username] = { username, password, gmName, owner: accountMatchesOwner(username, { username, gmName }), banned: false, idCounter: 0, state: null, createdAt: Date.now(), updatedAt: Date.now() };
  writeAccounts(accounts);
  currentAccount = username;
  resetGame();
  state.gmName = gmName;
  saveAccountProgress();
  qs("#account-modal").classList.add("hidden");
  setAccountMessage("");
}

function loginAccount() {
  const username = sanitizeUsername(qs("#account-username").value);
  const password = qs("#account-password").value;
  const accountKey = findAccountKey(username);
  const accounts = readAccounts();
  const account = accounts[accountKey];
  if (!account || account.password !== password) {
    setAccountMessage("Username or password is wrong.");
    return;
  }
  if (account.banned && !accountMatchesOwner(accountKey, account)) {
    setAccountMessage("This account has been banned by the owner.");
    return;
  }
  if (accountMatchesOwner(accountKey, account) && !account.owner) {
    accounts[accountKey] = { ...account, owner: true, banned: false };
    writeAccounts(accounts);
  }
  setAccountMessage("");
  showLoginChoice(accountKey, accounts[accountKey] || account);
}

function showLoginChoice(username, account) {
  pendingLoginAccount = username;
  qs("#account-choice-title").textContent = accountMatchesOwner(username, account) ? `Welcome back, Owner Avik Hardy` : `Welcome back, ${account.gmName || username}`;
  qs(".account-fields").classList.add("hidden");
  qs(".account-switch").classList.add("hidden");
  qs(".account-modal .modal-actions").classList.add("hidden");
  qs("#account-choice").classList.remove("hidden");
  qs("#continue-save").disabled = !account.state;
  if (!account.state) setAccountMessage("No saved season yet. Start over to create your team.");
}

function continueSavedAccount() {
  if (!pendingLoginAccount) return;
  const username = pendingLoginAccount;
  pendingLoginAccount = null;
  if (!loadAccount(username)) {
    pendingLoginAccount = username;
    setAccountMessage("No saved season found. Press Start Over to create your team again.");
  }
}

function startAccountOver() {
  if (!pendingLoginAccount) return;
  currentAccount = findAccountKey(pendingLoginAccount);
  pendingLoginAccount = null;
  resetGame();
  saveAccountProgress();
  qs("#account-modal").classList.add("hidden");
}

function setAccountMode(mode) {
  accountMode = mode;
  const signup = mode === "signup";
  qs("#account-title").textContent = signup ? "Create General Manager" : "Log In";
  qs("#account-submit").textContent = signup ? "Create Account" : "Log In";
  qs("#gm-name-field").classList.toggle("hidden", !signup);
  qs("#show-signup").className = signup ? "primary" : "secondary";
  qs("#show-login").className = signup ? "secondary" : "primary";
  qs("#account-password").setAttribute("autocomplete", signup ? "new-password" : "current-password");
  qs(".account-fields").classList.remove("hidden");
  qs(".account-switch").classList.remove("hidden");
  qs(".account-modal .modal-actions").classList.remove("hidden");
  qs("#account-choice").classList.add("hidden");
  pendingLoginAccount = null;
  setAccountMessage("");
}

function submitAccountForm() {
  if (accountMode === "signup") createAccount();
  else loginAccount();
}

function setAccountMessage(message) {
  qs("#account-message").textContent = message;
}

function teamStrength(team) {
  const starters = starterRoster(team);
  const healthy = activeRoster(team);
  const usable = starters.length ? starters : healthy.length ? healthy : team.roster;
  const sortedStarters = [...usable].sort((a, b) => b.rating - a.rating);
  const starterAvg = sortedStarters.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, sortedStarters.length);
  const topStarterPower = sortedStarters.slice(0, 4).reduce((sum, p) => sum + p.rating, 0) / Math.max(1, Math.min(4, sortedStarters.length));
  const bench = healthy.filter((player) => !starters.some((starter) => starter.id === player.id));
  const benchAvg = bench.length ? bench.reduce((sum, p) => sum + p.rating, 0) / bench.length : starterAvg - 7;
  const goalie = sortedStarters.find((p) => p.position === "Goalie") || sortedStarters[0];
  const formBoost = sortedStarters.reduce((sum, player) => {
    const production = player.position === "Goalie" ? player.saves / 90 + player.wins * 0.35 : player.goals * 0.14 + player.assists * 0.1;
    return sum + Math.min(4, production);
  }, 0) / Math.max(1, sortedStarters.length);
  const depthPenalty = Math.max(0, 10 - starters.length) * 2.2;
  return starterAvg * 0.72 + topStarterPower * 0.16 + benchAvg * 0.06 + (goalie ? goalie.rating * 0.06 : 0) + formBoost + team.chemistry * 0.2 + team.fanbase * 0.035 - depthPenalty;
}

function activeRoster(team) {
  return team.roster.filter((p) => !p.injuryWeeks);
}

function positionCounts(roster) {
  return positions.reduce((counts, position) => {
    counts[position] = roster.filter((player) => player.position === position).length;
    return counts;
  }, {});
}

function rosterWithinCaps(team) {
  const counts = positionCounts(team.roster);
  return team.roster.length <= 17 && positions.every((position) => counts[position] <= rosterCaps[position]);
}

function rosterIsLegal(team) {
  return rosterWithinCaps(team);
}

function cutsUnlocked() {
  return state.draftYear >= 3;
}

function rosterNeedsCuts(team) {
  return cutsUnlocked() && !rosterWithinCaps(team);
}

function rosterCanPlay(roster) {
  const counts = positionCounts(roster);
  return positions.every((position) => counts[position] >= rosterMinimums[position]);
}

function rosterShortageText(roster) {
  const counts = positionCounts(roster);
  return positions
    .filter((position) => counts[position] < rosterMinimums[position])
    .map((position) => `${position} ${counts[position]}/${rosterMinimums[position]}`)
    .join(", ");
}

function rosterLimitText(team) {
  const counts = positionCounts(team.roster);
  return positions.map((position) => `${position}: ${counts[position]}/${rosterCaps[position]}`).join(" | ");
}

function requiredKeepCount(team) {
  const counts = positionCounts(team.roster);
  const positionCuts = positions.reduce((sum, position) => sum + Math.max(0, counts[position] - rosterCaps[position]), 0);
  const totalCuts = Math.max(0, team.roster.length - 17);
  return team.roster.length - Math.max(positionCuts, totalCuts);
}

function ensureTeamLineup(team) {
  team.lineup = team.lineup || {};
  positions.forEach((position) => {
    const eligible = team.roster
      .filter((player) => player.position === position)
      .sort((a, b) => b.rating - a.rating);
    const valid = (team.lineup[position] || []).filter((id) => eligible.some((player) => player.id === id));
    const target = Math.min(starterTargets[position], eligible.length);
    team.lineup[position] = valid.slice(0, target);
    eligible.forEach((player) => {
      if (team.lineup[position].length < target && !team.lineup[position].includes(player.id)) team.lineup[position].push(player.id);
    });
  });
}

function starterRoster(team) {
  ensureTeamLineup(team);
  const starters = [];
  positions.forEach((position) => {
    (team.lineup[position] || []).forEach((id) => {
      const player = team.roster.find((p) => p.id === id && !p.injuryWeeks);
      if (player) starters.push(player);
    });
  });
  return starters.length ? starters : activeRoster(team);
}

function teamInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase();
}

const teamLogoArt = {
  "Oregon Cupids": `<path d="M12 20S4 15.5 4 9.5C4 5 9.5 3.5 12 7c2.5-3.5 8-2 8 2.5C20 15.5 12 20 12 20Z"/><path class="logo-accent" d="m3 21 18-18m-4 0h4v4M3 17v4h4"/>`,
  "Team Aqua": `<path d="M3 15c2.4-2.8 4.8-2.8 7.2 0s4.8 2.8 7.2 0 4.8-2.8 6.6-.8"/><path class="logo-accent" d="M12 3c3 4 4.5 6.5 4.5 9A4.5 4.5 0 0 1 12 16.5 4.5 4.5 0 0 1 7.5 12C7.5 9.5 9 7 12 3Z"/>`,
  "Boston Galaxy Elite": `<ellipse cx="12" cy="12" rx="10" ry="4.8" transform="rotate(-25 12 12)"/><path class="logo-accent" d="m12 4 1.5 4.5H18l-3.6 2.7 1.4 4.5-3.8-2.8-3.8 2.8 1.4-4.5L6 8.5h4.5L12 4Z"/>`,
  "Maryland Bobcats": `<path d="m5 8 2-5 4 3h2l4-3 2 5v7l-4 5H9l-4-5V8Z"/><path class="logo-accent" d="M8 11h2m4 0h2m-6 5 2-1 2 1M7 14l-4-1m14 1 4-1"/>`,
  "Lawrenceville Tigers": `<path d="M5 5c5-3 9-3 14 0l2 7-4 8H7l-4-8 2-7Z"/><path class="logo-accent" d="m8 5 2 5m6-5-2 5M6 12l4 1m8-1-4 1m-4 4h4"/>`,
  "Team Ross Elite": `<path d="m12 2 8 4v6c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-4Z"/><path class="logo-accent" d="m7 11 3 3 7-7m-8 9h6"/>`,
  "Arizona 91": `<circle cx="16" cy="7" r="4"/><path d="M8 21V7m0 6H5c-1.5 0-2-1-2-2V9m5 7h3c1.5 0 2-1 2-2v-3M6 21h4"/><path class="logo-accent" d="M16 1v2m0 8v2m6-6h-2m-8 0h-2m10.3-4.3-1.4 1.4m-5.8 5.8-1.4 1.4"/>`,
  "Colorado Springs Selects": `<path d="m2 19 6-9 3 4 4-7 7 12H2Z"/><path class="logo-accent" d="m13 10 2-3 2 3m-15 11c4-3 7 2 11-1s6 1 9-1"/>`,
  "Tennessee Mountaineers": `<path d="m2 21 9-15 4 7 2-3 5 11H2Z"/><path class="logo-accent" d="M13 8a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 13 8Zm0 1-2 4 2 2-2 4m2-6 3 2 2-2"/>`,
  "Vermont Cowboys": `<path d="M4 13c2 2 14 2 16 0l-3-2-2-6-3 2-3-2-2 6-3 2Z"/><path class="logo-accent" d="M2 14c3 5 17 5 20 0M12 8v5"/>`,
  "Wisconsin Reds": `<path d="M13 2 5 13h6l-1 9 9-13h-6V2Z"/><path class="logo-accent" d="m5 6 3 1M3 10l4 1m9 7 3 1"/>`,
  "North Carolina Vipers": `<path d="M4 7c5-5 13-3 13 2 0 4-6 3-6 7 0 2 2 3 5 2"/><path class="logo-accent" d="m16 5 5 1-3 4-3-1m4-2 2 3m-3-3 3-1"/>`,
  "Texas Reindeers": `<path d="M8 9 5 6V2m3 7L3 8M16 9l3-3V2m-3 7 5-1"/><path d="M7 10c0-4 10-4 10 0v5c0 4-2.5 7-5 7s-5-3-5-7v-5Z"/><path class="logo-accent" d="m10 18 2 2 2-2m-5-5h1m4 0h1"/>`,
  "California Treestumps": `<path d="M6 9h12l2 11H4L6 9Z"/><ellipse cx="12" cy="9" rx="6" ry="3"/><path class="logo-accent" d="M9 9c1-2 5-2 6 0-1 1.5-5 1.5-6 0ZM7 4l2 2m8-2-2 2M12 1v4"/>`,
  "New York Stars": `<path d="m12 2 2.8 6.3 6.8.6-5.2 4.5 1.6 6.7-6-3.5-6 3.5 1.6-6.7-5.2-4.5 6.8-.6L12 2Z"/><circle class="logo-accent" cx="12" cy="12" r="2.2"/>`,
  "LA Selects": `<path d="M7 21c3-5 4-10 4-18m0 6L6 5m5 4 5-5m-5 7-6-1m6 1 6-2"/><circle class="logo-accent" cx="18" cy="17" r="4"/><path class="logo-accent" d="m16 17 1.2 1.2L20 15.5"/>`,
  "Team Illinois": `<path d="M5 17c4-6 10-6 14 0M3 13c5-6 13-6 18 0M8 21c2-4 6-4 8 0"/><path class="logo-accent" d="M12 3v13m-2-10 2-3 2 3"/>`,
  "Tampa Bay Blue Jays": `<path d="M3 14c5-8 12-10 18-5-4 1-6 3-7 6-3 5-8 5-11-1Z"/><path class="logo-accent" d="m15 10 7 2-7 2m-7-1 3 2m1-6-2-3"/><circle cx="13" cy="9" r="1" fill="currentColor"/>`,
  "New Hampshire Soil Gatherers": `<path d="m14 3 3 3-8 8-3-3 8-8Zm-8 8-2 9h9l-4-6"/><path class="logo-accent" d="M3 21h18m-6-5c3-2 5-1 6 2m-8 1c2-3 4-3 6-1"/>`,
  "Seattle Emeralds": `<path d="m7 3-5 7 10 12 10-12-5-7H7Z"/><path class="logo-accent" d="m2 10 10 4 10-4M7 3l5 11 5-11M6 10h12"/>`
};

function teamLogoSvg(name) {
  const art = teamLogoArt[name];
  if (!art) return `<span class="team-logo-fallback">${teamInitials(name)}</span>`;
  return `<svg class="team-logo" viewBox="0 0 24 24" role="img" aria-label="${name} logo">${art}</svg>`;
}

function teamBadge(team, extra = "") {
  return `<span class="team-badge ${extra}" style="--team-color:${team.color || "#20ff9f"}">${teamLogoSvg(team.name)}</span>`;
}

function renderTeams() {
  qs("#teams-grid").innerHTML = [...state.teams].sort((a, b) => a.lastPlace - b.lastPlace).map((team) => `
    <button class="team-card" data-team="${team.id}" style="border-left-color:${team.color}">
      <div class="team-card-head">${teamBadge(team)}<strong>${team.name}</strong></div>
      <div class="mini-stats">
        <span class="stat">Last: ${ordinal(team.lastPlace)}</span>
        <span class="stat">${team.madePlayoffs ? "Playoffs" : "Missed"}</span>
        <span class="stat">Fans: ${team.fanbase}</span>
        <span class="stat">Chem: ${team.chemistry}</span>
      </div>
      <span class="muted">Owner: ${team.owner}${team.champion ? " | defending champ" : ""}</span>
    </button>
  `).join("");
  qsa(".team-card").forEach((btn) => btn.addEventListener("click", () => {
    const team = state.teams[Number(btn.dataset.team)];
    confirmAction(
      "Choose Team",
      `Take over ${team.name} for this season?`,
      () => selectTeam(team.id)
    );
  }));
}

function selectTeam(id) {
  state.selected = id;
  state.ownerGoal = makeOwnerGoal(state.teams[id]);
  state.ownerGoalReviewPending = false;
  state.fired = false;
  qs("#game").classList.remove("hidden");
  qs("#rules-screen").classList.add("hidden");
  qs("#team-select").classList.add("hidden");
  qs("#game").scrollIntoView({ behavior: "smooth", block: "start" });
  setTab("draft");
  renderAll();
  showOwnerGoalPrompt();
}

function makeOwnerGoal(team) {
  const last = team.lastPlace || 20;
  const targetWins = Math.max(4, Math.min(15, Math.round(16 - last * 0.45 + rand(-1, 1))));
  const tone = last <= 4 ? "Championship standards are high." : last <= 8 ? "The owner expects a playoff-level season." : last <= 14 ? "The owner wants real progress." : "The owner knows this is a rebuild, but losing forever is not acceptable.";
  return {
    targetWins,
    lastPlace: last,
    message: `${tone} Win at least ${targetWins} games this season or your job is in danger.`
  };
}

function showOwnerGoalPrompt() {
  if (!state.ownerGoal) return;
  showCelebration("Owner Goal", `${state.ownerGoal.targetWins} Wins`, state.ownerGoal.message, "goal");
}

function showRulesScreen() {
  qs("#intro-screen").classList.add("hidden");
  qs("#rules-screen").classList.remove("hidden");
  qs("#team-select").classList.add("hidden");
  qs("#rules-screen").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showTeamSelect() {
  qs("#intro-screen").classList.add("hidden");
  qs("#rules-screen").classList.add("hidden");
  qs("#team-select").classList.remove("hidden");
  qs("#team-select").scrollIntoView({ behavior: "smooth", block: "start" });
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function weightedLottery() {
  const remaining = [...state.teams];
  const order = [];
  while (remaining.length) {
    const total = remaining.reduce((sum, t) => sum + t.lastPlace ** 1.55, 0);
    let ticket = rand(0, total);
    const index = remaining.findIndex((t) => {
      ticket -= t.lastPlace ** 1.55;
      return ticket <= 0;
    });
    order.push(remaining.splice(Math.max(0, index), 1)[0].id);
  }
  state.lottery = order;
  state.currentPick = 0;
  state.draftPicks = [];
  state.pickLog = ["Lottery complete. Worse 2025 teams had better odds, but upsets are possible."];
  renderAll();
}

function makeWeightedLotteryOrder() {
  const remaining = [...state.teams];
  const order = [];
  while (remaining.length) {
    const total = remaining.reduce((sum, team) => sum + team.lastPlace ** 1.55, 0);
    let ticket = rand(0, total);
    const index = remaining.findIndex((team) => {
      ticket -= team.lastPlace ** 1.55;
      return ticket <= 0;
    });
    order.push(remaining.splice(Math.max(0, index), 1)[0].id);
  }
  return order;
}

function runLotteryMachine() {
  if (state.lotteryAnimating || state.lottery.length) return;
  state.lotteryAnimating = true;
  state.lottery = [];
  state.currentPick = 0;
  state.draftPicks = [];
  state.pickLog = ["The lottery machine is live. Worst records have more balls in the hopper."];
  const order = makeWeightedLotteryOrder();
  const windowEl = qs(".machine-window");
  const ballsEl = qs(".machine-balls");
  qs("#run-lottery").disabled = true;
  renderLotteryBalls();

  let revealIndex = 0;
  const revealNext = () => {
    if (revealIndex >= order.length) {
      state.lotteryAnimating = false;
      state.pickLog.unshift("Lottery complete. The draft will now move to your first pick.");
      qs("#run-lottery").disabled = false;
      advanceToMyPick();
      renderAll();
      return;
    }
    let spinCount = 0;
    const spinner = setInterval(() => {
      const fakeTeam = pick(state.teams);
      windowEl.textContent = fakeTeam.name;
      spinCount += 1;
      if (spinCount >= 9) {
        clearInterval(spinner);
        const teamId = order[revealIndex];
        state.lottery.push(teamId);
        windowEl.textContent = `${ordinal(revealIndex + 1)} pick: ${state.teams[teamId].name}`;
        state.pickLog.unshift(`${ordinal(revealIndex + 1)} pick goes to ${state.teams[teamId].name}.`);
        revealIndex += 1;
        renderDraft();
        renderLotteryBalls();
        setTimeout(revealNext, 650);
      }
    }, 85);
  };
  ballsEl.classList.add("active");
  revealNext();
}

function autoPickFor(team) {
  const counts = positions.reduce((acc, pos) => ({ ...acc, [pos]: team.roster.filter((p) => p.position === pos).length }), {});
  const openPositions = positions.filter((position) => counts[position] < rosterCaps[position]);
  const need = [...(openPositions.length ? openPositions : positions)].sort((a, b) => counts[a] - counts[b])[0];
  const available = state.draftPool.filter((p) => p.position === need);
  return available[0] || state.draftPool[0];
}

function draftPlayer(playerId) {
  if (!state.lottery.length || state.myDrafted.length >= draftNeeds.length || state.lotteryAnimating) return;
  const myTurnTeam = state.lottery[state.currentPick % state.lottery.length];
  if (myTurnTeam !== state.selected) return;
  const player = state.draftPool.find((p) => p.id === playerId);
  if (!player || player.salary > state.draftBudget) return;
  const neededPosition = nextNeed();
  if (neededPosition !== "Choice" && player.position !== neededPosition) return;
  completePick(state.selected, player);
  advanceToMyPick();
}

function completePick(teamId, player) {
  const team = state.teams[teamId];
  const pickNumber = state.currentPick + 1;
  state.draftPool = state.draftPool.filter((p) => p.id !== player.id);
  team.roster.push(player);
  team.picks.push(player.name);
  if (teamId === state.selected) {
    state.draftBudget -= player.salary;
    state.myDrafted.push(player);
    playUiSound("draft");
  }
  if (!state.draftPicks) state.draftPicks = [];
  state.draftPicks.push({
    pick: pickNumber,
    teamId,
    team: team.name,
    player: player.name,
    position: player.position,
    rating: player.rating,
    salary: player.salary,
    mine: teamId === state.selected
  });
  state.pickLog.unshift(`${team.name} drafted ${player.name}, ${player.position}, ${player.rating} OVR, ${money(player.salary)}.`);
  state.currentPick += 1;
}

function advanceToMyPick() {
  while (state.myDrafted.length < draftNeeds.length && state.lottery[state.currentPick % state.lottery.length] !== state.selected) {
    const team = state.teams[state.lottery[state.currentPick % state.lottery.length]];
    completePick(team.id, autoPickFor(team));
  }
  if (state.myDrafted.length >= draftNeeds.length) {
    trimCpuRosters();
    if (rosterNeedsCuts(state.teams[state.selected])) {
      openRosterCuts();
      state.pickLog.unshift("Your roster needs position cuts. Keep a balanced group before the season starts.");
    } else {
      unlockSeasonAfterCuts();
    }
  }
  renderAll();
}

function nextNeed() {
  return draftNeeds[state.myDrafted.length] || "Done";
}

function trimCpuRosters() {
  state.teams.forEach((team) => {
    if (team.id !== state.selected && !rosterIsLegal(team)) trimRoster(team);
  });
}

function openRosterCuts() {
  const mine = state.teams[state.selected];
  if (!rosterNeedsCuts(mine)) return unlockSeasonAfterCuts();
  state.rosterCutMode = true;
  state.keepRosterIds = [];
  [...mine.roster].sort((a, b) => rosterKeepScore(b) - rosterKeepScore(a)).forEach((player) => {
    const keptRoster = mine.roster.filter((p) => state.keepRosterIds.includes(p.id));
    const counts = positionCounts(keptRoster);
    if (state.keepRosterIds.length < requiredKeepCount(mine) && counts[player.position] < rosterCaps[player.position]) state.keepRosterIds.push(player.id);
  });
  setTab("cuts");
}

function unlockSeasonAfterCuts() {
  state.rosterCutMode = false;
  state.keepRosterIds = [];
  ensureTeamLineup(state.teams[state.selected]);
  state.pickLog.unshift("Your 5-player draft is complete. Set your starters, then start the season.");
  setTab("lineup");
}

function toggleKeepPlayer(playerId) {
  if (!state.rosterCutMode) return;
  const mine = state.teams[state.selected];
  const player = mine.roster.find((p) => p.id === playerId);
  if (!player) return;
  if (state.keepRosterIds.includes(playerId)) {
    state.keepRosterIds = state.keepRosterIds.filter((id) => id !== playerId);
  } else {
    const keptRoster = mine.roster.filter((p) => state.keepRosterIds.includes(p.id));
    const counts = positionCounts(keptRoster);
    if (state.keepRosterIds.length < requiredKeepCount(mine) && counts[player.position] < rosterCaps[player.position]) state.keepRosterIds.push(playerId);
  }
  renderRosterCuts();
}

function confirmRosterCuts() {
  const mine = state.teams[state.selected];
  if (!state.rosterCutMode) return;
  const keep = new Set(state.keepRosterIds);
  const dropped = mine.roster.filter((player) => !keep.has(player.id));
  const keptRoster = mine.roster.filter((player) => keep.has(player.id));
  const counts = positionCounts(keptRoster);
  const legal = keptRoster.length === requiredKeepCount(mine) && keptRoster.length <= 17 && positions.every((position) => counts[position] <= rosterCaps[position]) && rosterCanPlay(keptRoster);
  if (!legal) return;
  mine.roster = keptRoster;
  ensureTeamLineup(mine);
  state.pickLog.unshift(`Roster cuts complete. Released ${dropped.map((player) => player.name).join(", ")}.`);
  unlockSeasonAfterCuts();
  renderAll();
}

function trimRoster(team) {
  const dropped = [];
  while (!rosterIsLegal(team)) {
    const counts = positionCounts(team.roster);
    const overloaded = positions.filter((position) => counts[position] > rosterCaps[position]);
    const pool = overloaded.length
      ? team.roster.filter((player) => overloaded.includes(player.position))
      : team.roster;
    const sorted = [...pool].sort((a, b) => rosterKeepScore(a) - rosterKeepScore(b));
    const player = sorted[0];
    team.roster = team.roster.filter((p) => p.id !== player.id);
    dropped.push(player);
  }
  ensureTeamLineup(team);
  return dropped;
}

function rosterKeepScore(player) {
  const production = player.position === "Goalie"
    ? player.saves * 0.04 + player.wins
    : player.goals + player.assists * 0.7;
  const potential = player.age <= 24 ? 8 : player.age <= 28 ? 4 : player.age >= 34 ? -8 : 0;
  return player.rating + production + potential - player.salary * 0.03;
}

function makeSchedule() {
  const weeks = [];
  for (let w = 0; w < 20; w++) {
    const ids = [...state.teams.map((t) => t.id)].sort(() => Math.random() - 0.5);
    const games = [];
    for (let i = 0; i < ids.length; i += 2) games.push({ home: ids[i], away: ids[i + 1], played: false });
    weeks.push(games);
  }
  return weeks;
}

function simulateGame(home, away) {
  const h = state.teams[home];
  const a = state.teams[away];
  const strengthGap = teamStrength(h) - teamStrength(a);
  const hEdge = strengthGap * 1.25 + rand(-5.5, 5.5);
  const quarters = [0, 1, 2, 3].map(() => {
    const hs = Math.max(0, Math.round(rand(2, 5) + hEdge / 13 + rand(-0.9, 0.9)));
    const as = Math.max(0, Math.round(rand(2, 5) - hEdge / 13 + rand(-0.9, 0.9)));
    return [hs, as];
  });
  let hs = quarters.reduce((s, q) => s + q[0], 0);
  let as = quarters.reduce((s, q) => s + q[1], 0);
  if (hs === as) hEdge >= 0 ? hs++ : as++;
  recordStats(h, hs, as, hs > as);
  recordStats(a, as, hs, as > hs);
  h.gf += hs; h.ga += as; a.gf += as; a.ga += hs;
  hs > as ? (h.wins++, a.losses++) : (a.wins++, h.losses++);
  return { home, away, quarters, hs, as };
}

function recordStats(team, goals, allowed, won) {
  const starters = starterRoster(team);
  const available = starters.length ? starters : activeRoster(team);
  const skaters = available.filter((p) => p.position !== "Goalie");
  if (!skaters.length) return;
  for (let i = 0; i < goals; i++) {
    weightedPlayer(skaters, "goalsBias").goals += 1;
    if (Math.random() > 0.35) weightedPlayer(skaters, "assistBias").assists += 1;
  }
  const goalie = available.find((p) => p.position === "Goalie") || available[0];
  goalie.saves += Math.max(5, Math.round(rand(8, 18) - allowed / 2));
  if (won) goalie.wins += 1;
}

function weightedPlayer(players, key) {
  const weightFor = (player) => key === "rating" ? player.rating : player.rating * player[key];
  const total = players.reduce((sum, p) => sum + weightFor(p), 0);
  let ticket = rand(0, total);
  return players.find((p) => {
    ticket -= weightFor(p);
    return ticket <= 0;
  }) || players[0];
}

function simulateWeek() {
  if (state.week > 20 || state.myDrafted.length < draftNeeds.length || state.liveSim) return;
  const mine = state.teams[state.selected];
  state.liveRecord = { wins: mine.wins, losses: mine.losses };
  const games = state.schedule[state.week - 1];
  const results = games.map((g) => ({ ...simulateGame(g.home, g.away), played: true }));
  const featured = results.find((g) => g.home === state.selected || g.away === state.selected) || results[0];
  state.liveSim = makeLiveSim(featured, results);
  renderAll();
  animateLiveGame();
}

function makeLiveSim(result, results) {
  const events = [];
  result.quarters.forEach((quarter, qIndex) => {
    const quarterEvents = [];
    for (let i = 0; i < quarter[0]; i++) quarterEvents.push({ quarter: qIndex, team: "home" });
    for (let i = 0; i < quarter[1]; i++) quarterEvents.push({ quarter: qIndex, team: "away" });
    events.push(...shuffle(quarterEvents));
  });
  return {
    result,
    results,
    events,
    index: 0,
    quarters: [[0, 0], [0, 0], [0, 0], [0, 0]],
    hs: 0,
    as: 0
  };
}

function animateLiveGame() {
  if (!state.liveSim) return;
  if (state.liveSim.index >= state.liveSim.events.length) {
    finishLiveWeek();
    return;
  }
  const event = state.liveSim.events[state.liveSim.index];
  const side = event.team === "home" ? 0 : 1;
  state.liveSim.quarters[event.quarter][side] += 1;
  if (event.team === "home") state.liveSim.hs += 1;
  else state.liveSim.as += 1;
  state.liveSim.index += 1;
  renderSeason();
  setTimeout(animateLiveGame, 230);
}

function finishLiveWeek() {
  const live = state.liveSim;
  state.liveSim = null;
  state.liveRecord = null;
  state.schedule[state.week - 1] = live.results;
  state.lastResults = live.results;
  recordMyWeekResult(live.results, state.week);
  processWeekEvents(live.results, state.week);
  state.week += 1;
  maybeRunAllStarWeekend();
  state.seasonDone = state.week > 20;
  const mine = state.teams[state.selected];
  const winPct = mine.wins / Math.max(1, mine.wins + mine.losses);
  const offerChance = Math.max(0.18, Math.min(0.72, 0.22 + winPct * 0.62));
  if (Math.random() < offerChance) generateOffers();
  const email = maybeReceiveMail();
  renderAll();
  if (email) showEmailToast(email);
  if (state.seasonDone) {
    evaluateOwnerGoal(false);
    showAwardsPrompt();
  }
  cleanupTradeOffers();
  if (state.offers.length && state.offerBatch > state.lastTradePopupBatch) {
    state.lastTradePopupBatch = state.offerBatch;
    state.latestToastOffer = 0;
    showTradeToast(describeOffer(state.offers[0]));
  }
}

function simulateSeason() {
  if (state.myDrafted.length < draftNeeds.length || state.seasonDone) return;
  const stopWeek = !state.allStarDone && state.week <= 10 ? 10 : 20;
  while (state.week <= stopWeek) {
    const games = state.schedule[state.week - 1];
    const results = games.map((g) => ({ ...simulateGame(g.home, g.away), played: true }));
    state.schedule[state.week - 1] = results;
    state.lastResults = results;
    recordMyWeekResult(results, state.week);
    processWeekEvents(results, state.week);
    state.week += 1;
    maybeRunAllStarWeekend();
  }
  if (!state.seasonDone && state.week <= 20) {
    renderAll();
    return;
  }
  state.seasonDone = true;
  const seasonEmail = maybeReceiveMail(true);
  const mine = state.teams[state.selected];
  state.tradeMessage = `${mine.name} finished ${mine.wins}-${mine.losses}.`;
  renderAll();
  if (seasonEmail) showEmailToast(seasonEmail);
  evaluateOwnerGoal(false);
  showAwardsPrompt();
}

function evaluateOwnerGoal(final = false) {
  if (!state.ownerGoal || state.fired) return true;
  const wins = state.teams[state.selected].wins;
  if (wins >= state.ownerGoal.targetWins) {
    state.ownerGoalReviewPending = false;
    addNews("owner", "Owner Goal Cleared", `${state.teams[state.selected].owner} confirmed your job is safe after a ${wins}-win season.`);
    return true;
  }
  state.ownerGoalReviewPending = true;
  if (!final) {
    addNews("owner", "Owner Review Pending", `${state.teams[state.selected].owner} will make the final GM decision after Worlds because you missed the ${state.ownerGoal.targetWins}-win goal.`);
    return false;
  }
  state.fired = true;
  state.ownerGoalReviewPending = false;
  addNews("owner", "GM Fired", `${state.teams[state.selected].owner} fired ${state.gmName || "the GM"} after missing the ${state.ownerGoal.targetWins}-win goal.`);
  showCelebration("You Got Fired", "Season Over", `You finished with ${wins} wins, below the owner goal of ${state.ownerGoal.targetWins}. Close this and press reset to start over.`, "danger");
  renderAll();
  return false;
}

function needsFinalOwnerReview() {
  if (!state.ownerGoal || state.fired) return false;
  const wins = state.teams[state.selected].wins;
  return state.ownerGoalReviewPending || wins < state.ownerGoal.targetWins;
}

function showWorldsCompleteCelebration() {
  if (!state.worldsDone || !state.worlds.champion) return;
  showCelebration("World Champions", state.worlds.champion.name, "won the Worlds gold medal.", needsFinalOwnerReview() ? "owner-review" : "", worldConfettiColors(state.worlds.champion));
}

function maybeRunAllStarWeekend() {
  if (state.allStarDone || state.week !== 11) return;
  const all = leaders();
  const skaters = all.filter((player) => player.position !== "Goalie");
  const goalies = all.filter((player) => player.position === "Goalie");
  const fastest = contestWinner(skaters, (p) => p.rating + p.traits.goalScoring * 0.45 + rand(0, 22));
  const accuracy = contestWinner(skaters, (p) => p.traits.iq * 0.4 + p.traits.goalScoring * 0.5 + rand(0, 20));
  const relay = contestWinner(skaters, (p) => p.rating + p.traits.playmaking * 0.35 + rand(0, 24));
  const goalie = contestWinner(goalies, (p) => p.rating + p.saves * 0.08 + rand(0, 22));
  state.allStarResults = [
    { event: "Fastest Shot", icon: "Shot Speed", winner: fastest, detail: `${Math.round(rand(101, 116))} mph`, score: Math.round(rand(82, 99)) },
    { event: "Accuracy Challenge", icon: "Targets", winner: accuracy, detail: `${Math.round(rand(7, 10))}/10 targets`, score: Math.round(rand(74, 98)) },
    { event: "Skills Relay", icon: "Relay Run", winner: relay, detail: `${Math.round(rand(22, 31))} seconds`, score: Math.round(rand(78, 99)) },
    { event: "Goalie Save Showdown", icon: "Save Wall", winner: goalie, detail: `${Math.round(rand(12, 19))} saves`, score: Math.round(rand(80, 99)) }
  ].filter((result) => result.winner);
  state.allStarDone = true;
  showAllStarWeekendPopup();
}

function contestWinner(players, scoreFn) {
  const scored = players.map((player) => ({ player, score: scoreFn(player) })).sort((a, b) => b.score - a.score);
  return scored[0] ? scored[0].player : null;
}

function showAllStarWeekendPopup() {
  qs("#celebration-kicker").textContent = "All-Star Weekend";
  qs("#celebration-title").textContent = "Skills Night";
  qs("#celebration-message").innerHTML = `
    <div class="allstar-popup">
      ${state.allStarResults.map((result) => `
        <div class="allstar-game">
          <span>${result.icon}</span>
          <strong>${result.event}</strong>
          <div class="allstar-meter"><i style="width:${result.score}%"></i></div>
          <p>${result.winner.name} wins for <b>${result.winner.team}</b></p>
          <em>${result.detail}</em>
        </div>
      `).join("")}
    </div>
  `;
  qs("#celebration").classList.remove("danger");
  qs("#celebration").dataset.next = "";
  qs("#confetti").innerHTML = Array.from({ length: 36 }, (_, index) => {
    const colors = ["#20ff9f", "#ff2bd6", "#00e5ff", "#d99a29", "#ffffff"];
    return `<span style="left:${(index * 17) % 100}%; background:${colors[index % colors.length]}; animation-delay:${(index % 8) * 0.12}s"></span>`;
  }).join("");
  qs("#celebration").classList.remove("hidden");
}

function standings() {
  return [...state.teams].sort((a, b) => b.wins - a.wins || (b.gf - b.ga) - (a.gf - a.ga) || teamStrength(b) - teamStrength(a));
}

function recordMyWeekResult(results, week) {
  const game = results.find((g) => g.home === state.selected || g.away === state.selected);
  if (!game) return;
  const mineHome = game.home === state.selected;
  const mineScore = mineHome ? game.hs : game.as;
  const oppScore = mineHome ? game.as : game.hs;
  const opponent = state.teams[mineHome ? game.away : game.home].name;
  state.myResults.push({ week, opponent, mineScore, oppScore, won: mineScore > oppScore });
}

function processWeekEvents(results, week) {
  healInjuries();
  const injury = maybeCreateInjury(results, week);
  if (injury) {
    addNews("injury", "Major Injury Update", `${injury.player.name} will miss ${injury.weeks} weeks for ${injury.team.name}. ${injury.replacement ? `${injury.replacement.name} gets called up into a bigger role.` : "The bench has to cover the minutes."}`, true);
  }
  if (week % 3 === 0) addPlayerInterview();
  if (week % 5 === 0 || Math.random() < 0.14) addDramaStory();
}

function healInjuries() {
  state.teams.forEach((team) => {
    team.roster.forEach((player) => {
      if (player.injuryWeeks > 0) player.injuryWeeks -= 1;
    });
  });
}

function maybeCreateInjury(results, week) {
  if (Math.random() > 0.22) return null;
  const teamIds = [...new Set(results.flatMap((game) => [game.home, game.away]))];
  const myGame = results.find((game) => game.home === state.selected || game.away === state.selected);
  const chosenTeamId = myGame && Math.random() < 0.35 ? state.selected : pick(teamIds);
  const team = state.teams[chosenTeamId];
  const candidates = activeRoster(team).filter((player) => player.position !== "Goalie" || activeRoster(team).filter((p) => p.position === "Goalie").length > 1);
  if (!candidates.length) return null;
  const player = weightedPlayer(candidates, "rating");
  const weeks = Math.round(rand(1, 5));
  player.injuryWeeks = Math.max(player.injuryWeeks || 0, weeks);
  const replacement = findCallUp(team, player);
  return { team, player, weeks, replacement };
}

function findCallUp(team, injuredPlayer) {
  return team.roster
    .filter((player) => player.id !== injuredPlayer.id && !player.injuryWeeks && player.position === injuredPlayer.position)
    .sort((a, b) => b.rating - a.rating)[0] || activeRoster(team).sort((a, b) => b.rating - a.rating)[0];
}

function showAwardsPrompt() {
  showCelebration("Regular Season Complete", "Awards Ready", "Continue to the awards page before starting playoffs.", "awards");
}

function leaders() {
  return state.teams.reduce((players, team) => {
    return players.concat(team.roster.map((player) => ({ ...player, team: team.name })));
  }, []);
}

function generateOffers(force = false) {
  const mine = state.teams[state.selected];
  const winPct = mine.wins / Math.max(1, mine.wins + mine.losses);
  const requestCount = force ? 3 : winPct >= 0.55 ? 3 : winPct >= 0.35 ? 2 : 1;
  const targets = mine.roster.filter((p) => p.salary <= state.tradeBudget + 120).sort((a, b) => b.rating - a.rating);
  if (!targets.length) return;
  const newOffers = Array.from({ length: requestCount }, () => {
    const buyer = pick(state.teams.filter((t) => t.id !== state.selected));
    const outgoing = pick(targets);
    const incoming = buyer.roster
      .filter((p) => p.salary <= state.tradeBudget + 60)
      .filter((p) => tradeKeepsRostersPlayable(outgoing, p, buyer))
      .sort((a, b) => b.rating - a.rating)[0];
    return { buyer: buyer.id, outgoing: outgoing.id, incoming: incoming ? incoming.id : null, pick: Math.random() > 0.45 };
  }).filter((o) => o.incoming);
  state.offers = state.offers.concat(newOffers).slice(-8);
  cleanupTradeOffers();
  if (newOffers.length) state.offerBatch += 1;
}

function validTradeOffer(offer) {
  if (!offer) return false;
  const mine = state.teams[state.selected];
  const other = state.teams[offer.buyer];
  if (!mine || !other) return false;
  const out = mine.roster.find((p) => p.id === offer.outgoing);
  const inc = other.roster.find((p) => p.id === offer.incoming);
  return !!out && !!inc && tradeKeepsRostersPlayable(out, inc, other);
}

function cleanupTradeOffers() {
  state.offers = (state.offers || []).filter(validTradeOffer);
}

function tradeRosterAfterSwap(team, outgoing, incoming) {
  return team.roster.filter((player) => player.id !== outgoing.id).concat(incoming);
}

function tradeKeepsRostersPlayable(myPlayer, theirPlayer, otherTeam) {
  const mine = state.teams[state.selected];
  const myAfter = tradeRosterAfterSwap(mine, myPlayer, theirPlayer);
  const otherAfter = tradeRosterAfterSwap(otherTeam, theirPlayer, myPlayer);
  return myAfter.length <= 17
    && otherAfter.length <= 17
    && (!cutsUnlocked() || positions.every((position) => positionCounts(myAfter)[position] <= rosterCaps[position]))
    && (!cutsUnlocked() || positions.every((position) => positionCounts(otherAfter)[position] <= rosterCaps[position]))
    && rosterCanPlay(myAfter)
    && rosterCanPlay(otherAfter);
}

function describeOffer(offer) {
  if (!offer) return "A team has made a trade request.";
  const mine = state.teams[state.selected];
  const other = state.teams[offer.buyer];
  if (!other) return "This trade request is no longer available.";
  const out = mine.roster.find((p) => p.id === offer.outgoing);
  const inc = other.roster.find((p) => p.id === offer.incoming);
  return `${other.name} wants ${out ? out.name : "one of your players"} and offers ${inc ? inc.name : "a player"}${offer.pick ? " plus a pick" : ""}.`;
}

function acceptOffer(index) {
  cleanupTradeOffers();
  const offer = state.offers[index];
  if (!offer) return;
  const mine = state.teams[state.selected];
  const other = state.teams[offer.buyer];
  const out = mine.roster.find((p) => p.id === offer.outgoing);
  const inc = other.roster.find((p) => p.id === offer.incoming);
  const cost = Math.max(20, Math.round(Math.abs(((inc && inc.salary) || 0) - ((out && out.salary) || 0)) * 0.6));
  if (!out || !inc) {
    state.offers.splice(index, 1);
    renderAll();
    return;
  }
  if (!tradeKeepsRostersPlayable(out, inc, other)) {
    state.tradeMessage = `Trade deleted: it would leave a team too short at one position.`;
    state.offers.splice(index, 1);
    renderAll();
    return;
  }
  if (cost > state.tradeBudget) return;
  mine.roster = mine.roster.filter((p) => p.id !== out.id).concat(inc);
  other.roster = other.roster.filter((p) => p.id !== inc.id).concat(out);
  state.tradeBudget -= cost;
  state.tradeMessage = `Accepted: ${out.name} to ${other.name}, ${inc.name} to ${mine.name}.`;
  state.offers.splice(index, 1);
  playUiSound("trade");
  renderAll();
}

function declineOffer(index) {
  cleanupTradeOffers();
  const offer = state.offers[index];
  if (!offer) return;
  state.tradeMessage = `Declined: ${describeOffer(offer)}`;
  state.offers.splice(index, 1);
  renderAll();
}

function showDeclinePopup(teamName, message) {
  showCelebration("Trade Declined", teamName, message, "danger");
}

function manualTrade(teamId) {
  const mine = state.teams[state.selected];
  const other = state.teams[teamId];
  const myPlayer = [...mine.roster].sort((a, b) => a.rating - b.rating)[0];
  const theirPlayer = other.roster
    .filter((p) => p.salary <= state.tradeBudget + myPlayer.salary)
    .filter((p) => tradeKeepsRostersPlayable(myPlayer, p, other))
    .sort((a, b) => b.rating - a.rating)[0];
  if (!theirPlayer) {
    state.tradeMessage = `${other.name} does not have a budget-safe and position-safe player available.`;
    renderAll();
    return;
  }
  const cost = Math.max(35, Math.round((theirPlayer.rating - myPlayer.rating + 10) * 8));
  if (cost > state.tradeBudget) {
    state.tradeMessage = `Not enough trade budget for ${theirPlayer.name}.`;
    renderAll();
    return;
  }
  const fairness = myPlayer.rating - theirPlayer.rating + (myPlayer.salary - theirPlayer.salary) * 0.04 + (state.tradeBudget - cost) * 0.02;
  const accepted = fairness + rand(-8, 18) > -6;
  if (!accepted) {
    state.tradeBudget = Math.max(0, state.tradeBudget - 8);
    state.tradeMessage = `${other.name} declined. They do not think ${myPlayer.name} is enough for ${theirPlayer.name}.`;
    renderAll();
    showDeclinePopup(other.name, `They declined your offer for ${theirPlayer.name}.`);
    return;
  }
  mine.roster = mine.roster.filter((p) => p.id !== myPlayer.id).concat(theirPlayer);
  other.roster = other.roster.filter((p) => p.id !== theirPlayer.id).concat(myPlayer);
  state.tradeBudget -= cost;
  state.tradeMessage = `Accepted: ${myPlayer.name} to ${other.name}, ${theirPlayer.name} to ${mine.name}.`;
  playUiSound("trade");
  renderAll();
}

function initializePlayoffs() {
  if (!state.seasonDone || state.playoffs) return;
  const top = standings().slice(0, 8);
  const seeded = top.map((team, index) => ({ team, seed: index + 1 }));
  state.playoffs = {
    awards: makeAwards(),
    bracket: [{
      name: "Quarterfinals",
      games: [
        playoffGame(seeded[0], seeded[7]),
        playoffGame(seeded[3], seeded[4]),
        playoffGame(seeded[1], seeded[6]),
        playoffGame(seeded[2], seeded[5])
      ]
    }],
    roundIndex: 0,
    champion: null,
    retirements: []
  };
}

function playoffGame(homeEntry, awayEntry) {
  return {
    home: homeEntry.team,
    away: awayEntry.team,
    homeSeed: homeEntry.seed,
    awaySeed: awayEntry.seed,
    played: false,
    quarters: [[0, 0], [0, 0], [0, 0], [0, 0]],
    homeScore: 0,
    awayScore: 0,
    winner: null
  };
}

function nextPlayableGame(tournament) {
  const round = tournament.bracket[tournament.roundIndex];
  return round ? round.games.find((game) => !game.played) : null;
}

function currentTournamentRound(tournament) {
  return tournament && tournament.bracket[tournament.roundIndex];
}

function formatRoundNumber(tournament) {
  return `Round ${tournament.roundIndex + 1}`;
}

function nextMyPlayoffGame() {
  const round = currentTournamentRound(state.playoffs);
  return round ? round.games.find((game) => !game.played && (game.home.id === state.selected || game.away.id === state.selected)) : null;
}

function completePlayoffGame(game, result) {
  Object.assign(game, {
    played: true,
    quarters: result.quarters,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    winner: result.winner
  });
}

function advancePlayoffRound() {
  const current = state.playoffs.bracket[state.playoffs.roundIndex];
  if (!current || current.games.some((game) => !game.played)) return;
  const winners = current.games.map((game) => ({
    team: game.winner === game.home.id ? game.home : game.away,
    seed: game.winner === game.home.id ? game.homeSeed : game.awaySeed
  }));
  if (winners.length === 1) {
    state.playoffs.champion = winners[0].team;
    state.playoffs.retirements = processRetirements();
    state.playoffsDone = true;
    return;
  }
  const roundNames = ["Quarterfinals", "Semifinals", "Championship"];
  state.playoffs.roundIndex += 1;
  state.playoffs.bracket.push({
    name: roundNames[state.playoffs.roundIndex],
    games: winners.length === 4
      ? [playoffGame(winners[0], winners[1]), playoffGame(winners[2], winners[3])]
      : [playoffGame(winners[0], winners[1])]
  });
}

function runPlayoffs() {
  if (state.fired || !state.seasonDone || state.playoffsDone || state.playoffLive) return;
  initializePlayoffs();
  const liveGame = nextMyPlayoffGame();
  if (!liveGame) {
    simRestOfPlayoffRound();
    return;
  }
  state.playoffLive = makeKnockoutLive(liveGame, playoffResult(liveGame.home, liveGame.away));
  setTab("playoffs");
  renderAll();
  animatePlayoffGame();
}

function simRestOfPlayoffRound() {
  const round = currentTournamentRound(state.playoffs);
  if (!round) return;
  round.games.filter((game) => !game.played).forEach((game) => completePlayoffGame(game, playoffResult(game.home, game.away)));
  advancePlayoffRound();
  setTab("playoffs");
  renderAll();
  if (state.playoffsDone) {
    showCelebration("PLS Champions", state.playoffs.champion.name, "won the league championship.", "", teamConfettiColors(state.playoffs.champion));
  }
}

function finishPlayoffGame() {
  const live = state.playoffLive;
  state.playoffLive = null;
  completePlayoffGame(live.game, {
    quarters: live.quarters,
    homeScore: live.hs,
    awayScore: live.as,
    winner: live.hs > live.as ? live.game.home.id : live.game.away.id
  });
  advancePlayoffRound();
  renderAll();
  if (state.playoffsDone) {
    showCelebration("PLS Champions", state.playoffs.champion.name, "won the league championship.", "", teamConfettiColors(state.playoffs.champion));
  }
}

function animatePlayoffGame() {
  if (!state.playoffLive) return;
  if (state.playoffLive.index >= state.playoffLive.events.length) {
    finishPlayoffGame();
    return;
  }
  playLiveEvent(state.playoffLive);
  renderPlayoffs();
  setTimeout(animatePlayoffGame, 230);
}

function makeKnockoutLive(game, result) {
  const events = [];
  result.quarters.forEach((quarter, qIndex) => {
    const quarterEvents = [];
    for (let i = 0; i < quarter[0]; i++) quarterEvents.push({ quarter: qIndex, team: "home" });
    for (let i = 0; i < quarter[1]; i++) quarterEvents.push({ quarter: qIndex, team: "away" });
    events.push(...shuffle(quarterEvents));
  });
  return {
    game,
    result,
    events,
    index: 0,
    quarters: [[0, 0], [0, 0], [0, 0], [0, 0]],
    hs: 0,
    as: 0
  };
}

function playLiveEvent(live) {
  const event = live.events[live.index];
  const side = event.team === "home" ? 0 : 1;
  live.quarters[event.quarter][side] += 1;
  if (event.team === "home") live.hs += 1;
  else live.as += 1;
  live.index += 1;
}

function playoffResult(a, b) {
  const strengthGap = teamStrength(a) - teamStrength(b);
  const recordGap = (a.wins - a.losses) - (b.wins - b.losses);
  const edge = strengthGap * 1.35 + recordGap * 0.65 + rand(-8, 8);
  let homeScore = Math.max(7, Math.round(rand(9, 17) + edge / 11));
  let awayScore = Math.max(7, Math.round(rand(9, 17) - edge / 11));
  if (homeScore === awayScore) edge >= 0 ? homeScore++ : awayScore++;
  const quarters = splitScoreIntoQuarters(homeScore, awayScore);
  return {
    home: a,
    away: b,
    quarters,
    homeScore,
    awayScore,
    winner: homeScore > awayScore ? a.id : b.id
  };
}

function splitScoreIntoQuarters(homeScore, awayScore) {
  const split = (score) => {
    const quarters = [0, 0, 0, 0];
    for (let i = 0; i < score; i++) quarters[Math.floor(rand(0, 4))] += 1;
    return quarters;
  };
  const hq = split(homeScore);
  const aq = split(awayScore);
  return hq.map((home, index) => [home, aq[index]]);
}

function makeAwards() {
  const all = leaders();
  const rankedTeams = standings();
  const points = (p) => p.goals + p.assists;
  const mvp = [...all].sort((a, b) => (points(b) * 2 + b.rating) - (points(a) * 2 + a.rating))[0];
  const rookie = all.filter((p) => p.rookie).sort((a, b) => (points(b) + b.rating) - (points(a) + a.rating))[0];
  const scorer = [...all].sort((a, b) => b.goals - a.goals || points(b) - points(a))[0];
  const assister = [...all].sort((a, b) => b.assists - a.assists || points(b) - points(a))[0];
  const pointsLeader = [...all].sort((a, b) => points(b) - points(a) || b.goals - a.goals)[0];
  const goalie = all.filter((p) => p.position === "Goalie").sort((a, b) => b.saves + b.wins * 6 - (a.saves + a.wins * 6))[0];
  const improvedTeam = rankedTeams.map((team, index) => {
    const currentPlace = index + 1;
    return { ...team, currentPlace, jump: team.lastPlace - currentPlace };
  }).sort((a, b) => b.jump - a.jump || b.wins - a.wins || (b.gf - b.ga) - (a.gf - a.ga))[0];
  return { mvp, rookie, scorer, assister, pointsLeader, goalie, improvedTeam };
}

function awardCard(title, player, detail) {
  if (!player) return `<div class="award-card"><span>${title}</span><strong>No winner</strong><em>No eligible player</em></div>`;
  return `
    <div class="award-card">
      <span>${title}</span>
      <strong>${player.name}</strong>
      <em>${player.team} | ${detail}</em>
    </div>
  `;
}

function teamAwardCard(title, team) {
  if (!team) return `<div class="award-card"><span>${title}</span><strong>No winner</strong><em>No eligible team</em></div>`;
  const movement = team.jump > 0 ? `climbed ${team.jump} spots` : `held steady at ${team.currentPlace}`;
  return `
    <div class="award-card">
      <span>${title}</span>
      <strong>${team.name}</strong>
      <em>${movement} | ${team.wins}-${team.losses}, ${team.gf - team.ga >= 0 ? "+" : ""}${team.gf - team.ga} differential</em>
    </div>
  `;
}

function makeTeamUSARoster() {
  const score = (player) => {
    const production = player.position === "Goalie"
      ? player.saves * 0.08 + player.wins * 3
      : player.goals * 2 + player.assists;
    return production + player.rating * 1.4 + (player.traits ? player.traits.leadership * 0.2 : 0);
  };
  return leaders().sort((a, b) => score(b) - score(a)).slice(0, 12);
}

function makeWorldField() {
  const roster = makeTeamUSARoster();
  const usaRating = roster.reduce((sum, player) => sum + player.rating, 0) / Math.max(1, roster.length);
  const field = [{ name: "Team USA", rating: usaRating }, ...countries.map((name) => ({ name, rating: rand(75, 92) }))];
  return { usaRoster: roster, field: field.slice(0, 8) };
}

function worldGameResult(a, b) {
  const edge = (a.rating - b.rating) * 0.75 + rand(-20, 20);
  let aScore = Math.max(6, Math.round(rand(8, 16) + edge / 12));
  let bScore = Math.max(6, Math.round(rand(8, 16) - edge / 12));
  if (aScore === bScore) edge >= 0 ? aScore++ : bScore++;
  const quarters = splitScoreIntoQuarters(aScore, bScore);
  return {
    home: a,
    away: b,
    quarters,
    homeScore: aScore,
    awayScore: bScore,
    winner: aScore > bScore ? a : b
  };
}

function initializeWorlds() {
  if (!state.playoffsDone || state.worlds) return;
  const worldSetup = makeWorldField();
  const ranked = [...worldSetup.field].sort((a, b) => (b.rating + rand(-5, 5)) - (a.rating + rand(-5, 5)));
  const seeded = ranked.map((team, index) => ({ team, seed: index + 1 }));
  state.worlds = {
    usaRoster: worldSetup.usaRoster,
    bracket: [{
      name: "World Quarterfinals",
      games: [
        worldGame(seeded[0], seeded[7]),
        worldGame(seeded[3], seeded[4]),
        worldGame(seeded[1], seeded[6]),
        worldGame(seeded[2], seeded[5])
      ]
    }],
    roundIndex: 0,
    champion: null
  };
}

function worldGame(homeEntry, awayEntry) {
  return {
    home: homeEntry.team,
    away: awayEntry.team,
    homeSeed: homeEntry.seed,
    awaySeed: awayEntry.seed,
    played: false,
    quarters: [[0, 0], [0, 0], [0, 0], [0, 0]],
    homeScore: 0,
    awayScore: 0,
    winner: null
  };
}

function nextWorldGame() {
  const round = state.worlds && state.worlds.bracket[state.worlds.roundIndex];
  return round ? round.games.find((game) => !game.played) : null;
}

function nextTeamUSAGame() {
  const round = currentTournamentRound(state.worlds);
  return round ? round.games.find((game) => !game.played && (game.home.name === "Team USA" || game.away.name === "Team USA")) : null;
}

function completeWorldGame(game, result) {
  Object.assign(game, {
    played: true,
    quarters: result.quarters,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    winner: result.winner.name
  });
}

function advanceWorldRound() {
  const current = state.worlds.bracket[state.worlds.roundIndex];
  if (!current || current.games.some((game) => !game.played)) return;
  const winners = current.games.map((game) => ({
    team: game.winner === game.home.name ? game.home : game.away,
    seed: game.winner === game.home.name ? game.homeSeed : game.awaySeed
  }));
  if (winners.length === 1) {
    state.worlds.champion = winners[0].team;
    state.worldsDone = true;
    return;
  }
  const roundNames = ["World Quarterfinals", "World Semifinals", "Gold Medal Game"];
  state.worlds.roundIndex += 1;
  state.worlds.bracket.push({
    name: roundNames[state.worlds.roundIndex],
    games: winners.length === 4
      ? [worldGame(winners[0], winners[1]), worldGame(winners[2], winners[3])]
      : [worldGame(winners[0], winners[1])]
  });
}

function runWorldsStage() {
  if (state.fired || !state.playoffsDone || state.worldsDone || state.worldsLive) return;
  initializeWorlds();
  const liveGame = nextTeamUSAGame();
  if (!liveGame) {
    simRestOfWorldsRound();
    return;
  }
  state.worldsLive = makeKnockoutLive(liveGame, worldGameResult(liveGame.home, liveGame.away));
  renderAll();
  animateWorldsGame();
}

function simRestOfWorldsRound() {
  const round = currentTournamentRound(state.worlds);
  if (!round) return;
  round.games.filter((game) => !game.played).forEach((game) => completeWorldGame(game, worldGameResult(game.home, game.away)));
  advanceWorldRound();
  renderAll();
  if (state.worldsDone && state.worlds.champion) {
    showWorldsCompleteCelebration();
  }
}

function animateWorldsGame() {
  if (!state.worldsLive) return;
  if (state.worldsLive.index >= state.worldsLive.events.length) {
    finishWorldsGame();
    return;
  }
  playLiveEvent(state.worldsLive);
  renderWorlds();
  setTimeout(animateWorldsGame, 230);
}

function finishWorldsGame() {
  const live = state.worldsLive;
  state.worldsLive = null;
  completeWorldGame(live.game, {
    quarters: live.quarters,
    homeScore: live.hs,
    awayScore: live.as,
    winner: live.hs > live.as ? live.game.home : live.game.away
  });
  advanceWorldRound();
  renderAll();
  if (state.worldsDone && state.worlds.champion) {
    showWorldsCompleteCelebration();
  }
}

function continueToNextSeason() {
  if (state.fired || !state.worldsDone) return;
  if (needsFinalOwnerReview()) {
    evaluateOwnerGoal(true);
    return;
  }
  const finalStandings = standings();
  const championId = state.playoffs && state.playoffs.champion ? state.playoffs.champion.id : null;
  updateLeaderboardForSeason(championId === state.selected);
  state.teams.forEach((team) => {
    const previousPlace = team.lastPlace || 20;
    const place = finalStandings.findIndex((ranked) => ranked.id === team.id) + 1;
    const pct = team.wins / Math.max(1, team.wins + team.losses);
    const improvement = previousPlace - place;
    const continuity = rosterContinuity(team);
    team.lastPlace = place;
    team.madePlayoffs = place <= 8;
    team.champion = team.id === championId;
    const valueDelta = (pct - 0.5) * 34 + improvement * 2.6 + (team.madePlayoffs ? 10 : -3) + (team.champion ? 24 : 0) + rand(-4, 5);
    team.value = Math.max(20, Math.round(team.value + valueDelta));
    const fanDelta = Math.round((pct - 0.45) * 14 + improvement * 1.7 + (team.madePlayoffs ? 5 : -1) + (team.champion ? 8 : 0) + rand(-2, 2));
    const chemistryDelta = Math.round((pct - 0.45) * 10 + improvement * 1.1 + continuity * 0.35 + (team.madePlayoffs ? 3 : -1) + rand(-1, 2));
    const moraleDelta = fanDelta;
    team.fanbase = Math.max(15, Math.min(100, team.fanbase + moraleDelta));
    team.chemistry = Math.max(15, Math.min(100, team.chemistry + chemistryDelta));
    progressRoster(team, pct);
    team.wins = 0;
    team.losses = 0;
    team.gf = 0;
    team.ga = 0;
    team.picks = [];
    team.roster.forEach((player) => {
      player.rookie = false;
      player.seasonsWithTeam = (player.seasonsWithTeam || 0) + 1;
      player.injuryWeeks = Math.max(0, (player.injuryWeeks || 0) - 2);
      player.goals = 0;
      player.assists = 0;
      player.saves = 0;
      player.wins = 0;
    });
    ensureTeamLineup(team);
  });
  state.lottery = [];
  state.draftYear += 1;
  state.draftPool = createDraftPool(state.draftYear);
  state.draftBudget = 750;
  state.tradeBudget = 400;
  state.currentPick = 0;
  state.myDrafted = [];
  state.draftPicks = [];
  state.pickLog = ["New season started. Your roster carried over. Run the next draft lottery."];
  state.week = 1;
  state.schedule = makeSchedule();
  state.lastResults = null;
  state.myResults = [];
  state.seasonDone = false;
  state.playoffsDone = false;
  state.worldsDone = false;
  state.playoffs = null;
  state.worlds = null;
  state.playoffLive = null;
  state.worldsLive = null;
  state.offers = [];
  state.emails = [];
  state.news = [];
  state.allStarDone = false;
  state.allStarResults = [];
  state.helpRequests = 0;
  state.offerBatch = 0;
  state.lastTradePopupBatch = 0;
  state.lotteryAnimating = false;
  state.liveSim = null;
  state.liveRecord = null;
  state.tradeMessage = "";
  state.ownerGoal = makeOwnerGoal(state.teams[state.selected]);
  state.ownerGoalReviewPending = false;
  setTab("draft");
  renderAll();
  showOwnerGoalPrompt();
}

function rosterContinuity(team) {
  if (!team.roster.length) return 0;
  return team.roster.reduce((sum, player) => sum + Math.min(8, player.seasonsWithTeam || 0), 0) / team.roster.length;
}

function progressRoster(team, winPct) {
  team.roster.forEach((player) => {
    const production = player.position === "Goalie"
      ? player.saves / 75 + player.wins * 0.45
      : player.goals * 0.18 + player.assists * 0.14;
    const ageCurve = player.age <= 24 ? 1.4 : player.age <= 28 ? 0.7 : player.age <= 32 ? 0.1 : -1.1;
    const seasonBoost = production > 7 ? 1.2 : production > 4 ? 0.6 : production < 1.5 ? -0.5 : 0;
    const teamBoost = winPct > 0.6 ? 0.5 : winPct < 0.35 ? -0.6 : 0;
    const change = Math.round(ageCurve + seasonBoost + teamBoost + rand(-0.8, 1.2));
    player.rating = Math.max(38, Math.min(99, player.rating + change));
    player.salary = Math.max(5, Math.round(player.salary + change * 8 + (player.rating > 85 ? 8 : 0)));
  });
}

function processRetirements() {
  const retired = [];
  state.teams.forEach((team) => {
    team.roster.forEach((player) => {
      player.age += 1;
      const retireChance = player.age < 30 ? 0 : player.age >= 35 ? 0.95 : [0.03, 0.05, 0.09, 0.15, 0.28][player.age - 30];
      if (Math.random() < retireChance) retired.push(makeHallCandidate(player, team));
    });
    team.roster = team.roster.filter((player) => !retired.some((old) => old.id === player.id));
  });
  addHallCandidates(retired);
  return retired;
}

function makeHallCandidate(player, team) {
  const points = player.goals + player.assists;
  const goalieScore = player.position === "Goalie" ? player.saves * 0.08 + player.wins * 4 : 0;
  const skaterScore = player.position !== "Goalie" ? player.goals * 2.2 + player.assists * 1.45 : 0;
  const teamScore = (team.champion ? 18 : 0) + (team.madePlayoffs ? 7 : 0);
  const careerYears = Math.max(1, player.seasonsWithTeam || player.age - 21);
  const score = Math.round(player.rating * 2.2 + skaterScore + goalieScore + teamScore + careerYears * 3 + Math.max(0, player.age - 29) * 2);
  return {
    id: player.id,
    name: player.name,
    team: team.name,
    position: player.position,
    age: player.age,
    rating: player.rating,
    goals: player.goals,
    assists: player.assists,
    points,
    saves: player.saves,
    wins: player.wins,
    seasons: careerYears,
    score
  };
}

function addHallCandidates(players) {
  if (!players.length) return;
  const byId = {};
  [...state.hallOfFame, ...players].forEach((player) => {
    if (!byId[player.id] || player.score > byId[player.id].score) byId[player.id] = player;
  });
  state.hallOfFame = Object.values(byId).sort((a, b) => b.score - a.score).slice(0, 25);
}

function renderAll() {
  if (state.selected === null) return;
  const team = state.teams[state.selected];
  const visibleRecord = state.liveRecord || { wins: team.wins, losses: team.losses };
  qs("#club-name").innerHTML = `${teamBadge(team, "selected-badge")}<span>${team.name}</span>`;
  qs("#club-meta").innerHTML = `
    <div>GM: ${state.gmName || "Unsigned"}${isOwnerAccount() ? ` <b class="owner-badge">OWNER</b>` : ""}</div>
    <div>Last season: ${ordinal(team.lastPlace)} ${team.madePlayoffs ? "(playoffs)" : "(missed playoffs)"}</div>
    <div>Owner: ${team.owner}</div>
    <div>Fanbase: ${team.fanbase} | Chemistry: ${team.chemistry}</div>
    <div>Team value: $${team.value}M</div>
    <div>Goal: ${ownerGoalText()}</div>
  `;
  const ownerTab = qs("#owner-tab");
  if (ownerTab) ownerTab.classList.toggle("hidden", !isOwnerAccount());
  qs("#status-strip").innerHTML = [
    `Record: ${visibleRecord.wins}-${visibleRecord.losses}`,
    `Week: ${Math.min(state.week, 20)} / 20`,
    `Owner goal: ${ownerGoalText(true)}`,
    `Draft: ${state.myDrafted.length}/${draftNeeds.length}`,
    `Trade budget: ${money(state.tradeBudget)}`,
    `Strength: ${Math.round(teamStrength(team))}`
  ].map((x) => `<div class="stat">${x}</div>`).join("");
  renderTabLocks();
  renderDraft();
  renderRosterCuts();
  renderLineup();
  renderSeason();
  renderLeague();
  renderTrades();
  renderAdvice();
  renderNews();
  renderAwards();
  renderPlayoffs();
  renderWorlds();
  renderLeaderboard();
  renderHallOfFame();
  saveAccountProgress();
}

function renderOwnerAccess() {
  const ownerTab = qs("#owner-tab");
  if (ownerTab) ownerTab.classList.toggle("hidden", !isOwnerAccount());
  renderOwnerConsole();
}

function ownerGoalText(short = false) {
  if (!state.ownerGoal) return "Choose team";
  const wins = state.selected === null ? 0 : state.teams[state.selected].wins;
  return short ? `${wins}/${state.ownerGoal.targetWins} wins` : `${wins}/${state.ownerGoal.targetWins} wins needed`;
}

function teamRowClass(teamId, extra = "") {
  return `${extra}${teamId === state.selected ? " my-team" : ""}`.trim();
}

function playerStatLine(player) {
  if (!player) return "No player";
  const main = player.position === "Goalie"
    ? `${player.saves} saves, ${player.wins} wins`
    : `${player.goals} goals, ${player.assists} assists`;
  return `${player.position} | Age ${player.age} | ${player.rating} OVR | ${money(player.salary)} | ${main}`;
}

function playerTrend(player) {
  if (!player) return "";
  const production = player.position === "Goalie"
    ? player.saves / 40 + player.wins * 0.9
    : player.goals + player.assists * 0.8;
  if (production >= 18) return "🔥 rising";
  if (production >= 8) return "📈 playing well";
  if (production <= 1 && (player.goals || player.assists || player.saves || player.wins)) return "📉 cold";
  return "➖ steady";
}

function playerHeatClass(player) {
  const trend = playerTrend(player);
  if (trend.includes("rising")) return "hot-streak elite-hot";
  if (trend.includes("playing well")) return "hot-streak";
  return "";
}

function traitGrid(player) {
  const traits = player.traits || makeTraits(player.position, player.rating);
  player.traits = traits;
  return `
    <div class="trait-grid">
      <span>🧠 IQ <strong>${traits.iq}</strong></span>
      <span>😎 Showboat <strong>${traits.showboat}</strong></span>
      <span>💪 Enforcer <strong>${traits.enforcer}</strong></span>
      <span>🎯 Playmaking <strong>${traits.playmaking}</strong></span>
      <span>🥍 Goal scoring <strong>${traits.goalScoring}</strong></span>
      <span>⭐ Leadership <strong>${traits.leadership}</strong></span>
    </div>
  `;
}

function openScoutCard(playerId) {
  const player = state.draftPool.find((p) => p.id === playerId);
  if (!player) return;
  qs("#scout-title").textContent = player.name;
  qs("#scout-body").innerHTML = `
    <div class="scout-hero">
      <strong>${player.rating} OVR</strong>
      <span>${player.position} | Age ${player.age} | Salary ${money(player.salary)}</span>
      <span class="trend">${playerTrend(player)}</span>
    </div>
    ${traitGrid(player)}
  `;
  qs("#scout-modal").classList.remove("hidden");
}

function closeScoutCard() {
  qs("#scout-modal").classList.add("hidden");
}

function playerStatCard(label, player, teamName) {
  return `
    <div class="trade-player ${player ? playerHeatClass(player) : ""}">
      <span class="muted">${label}</span>
      <strong>${player ? player.name : "Unavailable"}</strong>
      <span>${player ? playerStatLine(player) : ""}</span>
      <span class="trend">${player ? playerTrend(player) : ""}</span>
      ${player ? traitGrid(player) : ""}
      <span class="muted">${teamName}</span>
    </div>
  `;
}

function worldTeamClass(team, extra = "") {
  return `${extra}${team && team.name === "Team USA" ? " my-team" : ""}`.trim();
}

function teamUSARosterHtml(roster) {
  if (!roster || !roster.length) return "";
  return `
    <div class="worlds-roster">
      <h3>Team USA Roster</h3>
      <div class="roster">
        ${roster.map((player, index) => `
          <div class="row">
            <span>${index + 1}. ${player.name}<br><span class="muted">${player.position} | ${player.goals}G ${player.assists}A | ${player.team}</span></span>
            <strong>${player.rating}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function tabAllowed(tab) {
  if (state.rosterCutMode && !rosterNeedsCuts(state.teams[state.selected])) state.rosterCutMode = false;
  if (tab === "owner") return isOwnerAccount();
  if (state.rosterCutMode) return tab === "cuts" || tab === "draft" || tab === "leaderboard" || tab === "hof" || tab === "owner";
  if (tab === "draft" || tab === "advice" || tab === "news") return true;
  if (tab === "cuts") return rosterNeedsCuts(state.teams[state.selected]);
  if (tab === "lineup") return state.myDrafted.length >= draftNeeds.length;
  if (["season", "league", "leaders", "trades"].indexOf(tab) >= 0) return state.myDrafted.length >= draftNeeds.length && !rosterNeedsCuts(state.teams[state.selected]) && rosterCanPlay(state.teams[state.selected].roster);
  if (tab === "awards") return state.seasonDone;
  if (tab === "playoffs") return state.seasonDone && !state.fired;
  if (tab === "worlds") return state.playoffsDone && !state.fired;
  return true;
}

function renderRosterCuts() {
  const status = qs("#cuts-status");
  const list = qs("#cuts-list");
  if (!status || !list || state.selected === null) return;
  const mine = state.teams[state.selected];
  const needsCuts = rosterNeedsCuts(mine);
  const keptRoster = mine.roster.filter((player) => state.keepRosterIds.includes(player.id));
  const keptCounts = positionCounts(keptRoster);
  const keptLegal = keptRoster.length === requiredKeepCount(mine) && keptRoster.length <= 17 && positions.every((position) => keptCounts[position] <= rosterCaps[position]) && rosterCanPlay(keptRoster);
  qs("#confirm-cuts").disabled = !state.rosterCutMode || !needsCuts || !keptLegal;
  if (!needsCuts) {
    status.innerHTML = cutsUnlocked()
      ? `<strong>Roster is legal.</strong> ${mine.roster.length}/17 players. ${rosterLimitText(mine)}`
      : `<strong>Locked until your 3rd season.</strong> Cuts begin once your roster reaches 22 players. Current roster: ${mine.roster.length}.`;
    list.innerHTML = `<div class="muted">No cuts needed right now.</div>`;
    return;
  }
  status.innerHTML = `<strong>${keptRoster.length}/${requiredKeepCount(mine)} selected.</strong> Keep within caps: ${positions.map((position) => `${position} ${keptCounts[position]}/${rosterCaps[position]}`).join(" | ")}`;
  list.innerHTML = [...mine.roster].sort((a, b) => a.position.localeCompare(b.position) || rosterKeepScore(b) - rosterKeepScore(a)).map((player) => {
    const checked = state.keepRosterIds.includes(player.id);
    const production = player.position === "Goalie"
      ? `${player.saves} saves, ${player.wins} wins`
      : `${player.goals} goals, ${player.assists} assists`;
    return `
      <button class="cut-player ${checked ? "kept" : ""}" data-keep="${player.id}">
        <span>
          <strong>${player.name}</strong>
          <em>${player.position} | Age ${player.age} | ${player.rating} OVR | ${production} | ${pSalary(player)}</em>
        </span>
        <b>${checked ? "Keep" : "Cut"}</b>
      </button>
    `;
  }).join("");
  qsa("[data-keep]").forEach((btn) => btn.addEventListener("click", () => toggleKeepPlayer(btn.dataset.keep)));
}

function pSalary(player) {
  return money(player.salary);
}

function renderLineup() {
  const status = qs("#lineup-status");
  const board = qs("#lineup-board");
  if (!status || !board || state.selected === null) return;
  const team = state.teams[state.selected];
  ensureTeamLineup(team);
  const shortage = rosterShortageText(team.roster);
  status.innerHTML = `<strong>Roster shape:</strong> ${rosterLimitText(team)}. Starters use up to 3 Attack, 3 Midfield, 3 Defense, 1 Goalie.${shortage ? ` <span class="warning-text">Short: ${shortage}. You need 3 Attackmen, 3 Midfielders, 3 Defensemen, and 1 Goalie before playing.</span>` : ""}`;
  board.innerHTML = positions.map((position) => {
    const players = team.roster
      .filter((player) => player.position === position)
      .sort((a, b) => b.rating - a.rating);
    return `
      <div class="lineup-group">
        <h3>${position}</h3>
        ${players.map((player) => {
          const starter = (team.lineup[position] || []).includes(player.id);
          const stats = player.position === "Goalie" ? `${player.saves} saves, ${player.wins} wins` : `${player.goals} goals, ${player.assists} assists`;
          return `
            <button class="lineup-player ${starter ? "starter" : ""} ${playerHeatClass(player)}" data-lineup="${player.id}" data-position="${position}">
              <span><strong>${player.name}</strong><em>${player.rating} OVR | Age ${player.age} | ${stats}</em><em class="trend">${playerTrend(player)}</em></span>
              <b>${starter ? "Starter" : "Bench"}</b>
            </button>
          `;
        }).join("") || `<div class="muted">No ${position}s on roster.</div>`}
      </div>
    `;
  }).join("");
  qsa("[data-lineup]").forEach((btn) => btn.addEventListener("click", () => toggleStarter(btn.dataset.position, btn.dataset.lineup)));
}

function toggleStarter(position, playerId) {
  const team = state.teams[state.selected];
  ensureTeamLineup(team);
  const group = team.lineup[position] || [];
  if (group.includes(playerId)) {
    if (group.length > Math.min(starterTargets[position], team.roster.filter((p) => p.position === position).length)) {
      team.lineup[position] = group.filter((id) => id !== playerId);
    }
    return renderLineup();
  }
  if (group.length >= starterTargets[position]) group.shift();
  group.push(playerId);
  team.lineup[position] = group;
  renderAll();
}

function autoSetLineup() {
  if (state.selected === null) return;
  const team = state.teams[state.selected];
  team.lineup = {};
  ensureTeamLineup(team);
  renderAll();
}

function renderTabLocks() {
  qsa(".tab").forEach((btn) => {
    const allowed = tabAllowed(btn.dataset.tab);
    btn.disabled = false;
    btn.classList.toggle("locked", !allowed);
    btn.title = allowed ? "" : lockedTabReason(btn.dataset.tab);
  });
}

function lockedTabReason(tab) {
  if (tab === "cuts") return cutsUnlocked() ? "Roster cuts are locked because no cuts are needed right now." : "Roster Cuts are locked until your 3rd season.";
  if (tab === "lineup") return "Lineup is locked until you finish the draft.";
  if (["season", "league", "leaders", "trades"].includes(tab)) {
    if (state.myDrafted.length < draftNeeds.length) return "Locked until you finish the draft.";
    if (state.selected !== null && rosterNeedsCuts(state.teams[state.selected])) return "Locked until you finish roster cuts.";
    return `Locked because your roster needs at least 3 Attackmen, 3 Midfielders, 3 Defensemen, and 1 Goalie.`;
  }
  if (tab === "awards") return "Awards are locked until the regular season ends.";
  if (tab === "playoffs") return "Playoffs are locked until the regular season ends.";
  if (tab === "worlds") return "Worlds is locked until playoffs are complete.";
  if (tab === "owner") return "Owner tools are locked unless you are logged in as Avik Hardy.";
  return "This section is locked right now.";
}

function showLockedTab(tab) {
  showCelebration("Locked", tabLabel(tab), lockedTabReason(tab), "danger");
}

function tabLabel(tab) {
  const btn = qsa(".tab").find((item) => item.dataset.tab === tab);
  return btn ? btn.textContent : "Section";
}

function renderLotteryBalls() {
  const ballsEl = qs(".machine-balls");
  if (!ballsEl) return;
  ballsEl.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const left = 5 + (index * 8) % 88;
    const delay = (index % 5) * 0.11;
    const label = index + 1;
    return `<span class="ball" style="left:${left}%; top:${index % 2 ? 8 : 2}px; animation-delay:${delay}s">${label}</span>`;
  }).join("");
}

function renderDraft() {
  qs("#draft-budget").textContent = money(state.draftBudget);
  if (!qs(".machine-balls").children.length) renderLotteryBalls();
  if (!state.lottery.length && !state.lotteryAnimating) qs(".machine-window").textContent = "Ready";
  qs("#lottery-list").innerHTML = state.lottery.length ? state.lottery.map((id) => `<li>${state.teams[id].name}</li>`).join("") : "<li>Run the lottery to reveal the order.</li>";
  qs("#draft-needs").innerHTML = draftNeeds.map((need, i) => `<span class="chip ${i < state.myDrafted.length ? "done" : ""}">${need}</span>`).join("");
  const need = nextNeed();
  const canPick = state.lottery.length === state.teams.length && !state.lotteryAnimating && state.lottery[state.currentPick % state.lottery.length] === state.selected && state.myDrafted.length < draftNeeds.length;
  const currentTeam = state.lottery.length ? state.teams[state.lottery[state.currentPick % state.lottery.length]] : null;
  qs("#draft-status").innerHTML = state.myDrafted.length >= draftNeeds.length
    ? `<strong>Draft complete.</strong>`
    : currentTeam
      ? `<strong>Current pick:</strong> ${currentTeam.name}${currentTeam.id === state.selected ? " - you are on the clock." : ""}`
      : `<strong>Run the lottery first.</strong>`;
  const board = state.draftPool
    .filter((p) => need === "Choice" || need === "Done" || p.position === need)
    .sort((a, b) => {
      const affordableA = a.salary <= state.draftBudget ? 1 : 0;
      const affordableB = b.salary <= state.draftBudget ? 1 : 0;
      return affordableB - affordableA || b.rating - a.rating || a.salary - b.salary;
    })
    .slice(0, 36);
  qs("#draft-board").innerHTML = board.map((p) => `
    <div class="player-card scout-card" data-scout="${p.id}">
      <strong>${p.name}</strong>
      <span>${p.position} | ${p.rating} OVR | Age ${p.age}</span>
      <span class="muted">Salary ${money(p.salary)}</span>
      <button ${!canPick || p.salary > state.draftBudget ? "disabled" : ""} data-draft="${p.id}">Draft</button>
    </div>
  `).join("");
  qsa("[data-scout]").forEach((card) => card.addEventListener("click", () => {
    openScoutCard(card.dataset.scout);
  }));
  qsa("[data-draft]").forEach((btn) => btn.addEventListener("click", (event) => {
    event.stopPropagation();
    const player = state.draftPool.find((p) => p.id === btn.dataset.draft);
    if (!player) return;
    confirmAction(
      "Draft Player",
      `Draft ${player.name}, ${player.position}, ${player.rating} OVR for ${money(player.salary)}?`,
      () => draftPlayer(player.id)
    );
  }));
  qs("#pick-log").innerHTML = state.pickLog.map((entry) => `<div class="log-entry">${entry}</div>`).join("") || `<div class="muted">Picks will appear here.</div>`;
  renderDraftRecap();
  const mineReady = state.selected !== null && !rosterNeedsCuts(state.teams[state.selected]) && rosterCanPlay(state.teams[state.selected].roster);
  qs("#simulate-week").disabled = state.myDrafted.length < draftNeeds.length || !mineReady || state.seasonDone || !!state.liveSim;
  qs("#simulate-season").disabled = state.myDrafted.length < draftNeeds.length || !mineReady || state.seasonDone || !!state.liveSim;
  qs("#run-lottery").disabled = state.lotteryAnimating || state.lottery.length > 0;
}

function renderDraftRecap() {
  const picks = state.draftPicks || [];
  const recap = qs("#draft-recap");
  if (!recap) return;
  if (!picks.length) {
    recap.innerHTML = `<div class="muted">Run the lottery and start drafting to see who teams picked around you.</div>`;
    return;
  }
  const myPickIndexes = picks.map((pick, index) => pick.mine ? index : -1).filter((index) => index >= 0);
  const lastMyIndex = myPickIndexes.length ? myPickIndexes[myPickIndexes.length - 1] : -1;
  const before = lastMyIndex >= 0 ? picks.slice(Math.max(0, lastMyIndex - 6), lastMyIndex) : picks.slice(-8);
  const mine = lastMyIndex >= 0 ? [picks[lastMyIndex]] : [];
  const after = lastMyIndex >= 0 ? picks.slice(lastMyIndex + 1, lastMyIndex + 9) : [];
  recap.innerHTML = `
    ${draftRecapGroup("Picked Before You", before)}
    ${draftRecapGroup("Your Pick", mine)}
    ${draftRecapGroup("Picked After You", after)}
  `;
}

function draftRecapGroup(title, picks) {
  return `
    <div class="draft-recap-group">
      <strong>${title}</strong>
      ${picks.length ? picks.map((pick) => `
        <div class="${teamRowClass(pick.teamId, "row draft-recap-row")}">
          <span>#${pick.pick} ${pick.team}<br><span class="muted">${pick.player} | ${pick.position} | ${pick.rating} OVR | ${money(pick.salary)}</span></span>
          <strong>${pick.mine ? "You" : "Pick"}</strong>
        </div>
      `).join("") : `<div class="muted">No picks yet.</div>`}
    </div>
  `;
}

function renderSeason() {
  qs("#week-title").textContent = state.liveSim ? `Week ${state.week} Live` : state.seasonDone ? "Season complete" : `Week ${state.week}`;
  qs("#simulate-season").textContent = !state.allStarDone && state.week <= 10 ? "Sim to All-Star" : "Sim Season";
  const games = state.schedule[Math.min(state.week - 1, 19)] || [];
  const history = state.myResults.map((g) => `<div class="row result-row ${g.won ? "result-win" : "result-loss"}"><span>Week ${g.week}: vs ${g.opponent}</span><strong>${g.mineScore}-${g.oppScore}</strong></div>`).join("");
  const upcoming = games.filter((g) => g.home === state.selected || g.away === state.selected).map((g) => `<div class="row"><span>Week ${state.week}: ${state.teams[g.away].name} at ${state.teams[g.home].name}</span><strong>Pending</strong></div>`).join("");
  const goalCard = state.ownerGoal ? `<div class="owner-goal ${state.fired ? "failed" : ""}"><strong>Owner Goal</strong><span>${state.ownerGoal.message}</span><b>${ownerGoalText()}</b></div>` : "";
  const allStarCard = state.allStarDone ? `<div class="owner-goal"><strong>All-Star Weekend</strong>${state.allStarResults.map((result) => `<span>${result.event}: ${result.winner.name}, ${result.winner.team} (${result.detail})</span>`).join("")}</div>` : "";
  qs("#week-games").innerHTML = goalCard + allStarCard + (history || upcoming ? history + upcoming : `<div class="muted">Your results will appear here after each week.</div>`);
  const last = state.lastResults ? state.lastResults.find((g) => g.home === state.selected || g.away === state.selected) || state.lastResults[0] : null;
  qs("#live-game").innerHTML = state.liveSim ? liveScoreBox(state.liveSim) : last ? scoreBox(last) : `<div class="muted">Sim a week to see quarter-by-quarter scoring.</div>`;
  const team = state.teams[state.selected];
  ensureTeamLineup(team);
  qs("#roster-list").innerHTML = positions.map((position) => `
    <div class="roster-section">
      <strong>${position}</strong>
      ${team.roster.filter((p) => p.position === position).sort((a, b) => b.rating - a.rating).map((p) => {
        const injury = p.injuryWeeks ? ` <span class="injury-tag">Out ${p.injuryWeeks}w</span>` : "";
        const starter = (team.lineup[position] || []).includes(p.id) ? "Starter" : "Bench";
        return `<div class="row ${p.injuryWeeks ? "injured-row" : ""}"><span>${p.name}${injury}<br><span class="muted">${starter}, age ${p.age}, ${money(p.salary)}, ${p.seasonsWithTeam || 0} yrs here</span></span><strong>${p.rating}</strong></div>`;
      }).join("") || `<div class="muted">None</div>`}
    </div>
  `).join("");
}

function liveScoreBox(live) {
  return scoreBox({
    ...live.result,
    quarters: live.quarters,
    hs: live.hs,
    as: live.as
  }) + `<div class="live-note">Live simulation: ${live.index}/${live.events.length} scoring plays</div>`;
}

function scoreBox(g) {
  const h = state.teams[g.home], a = state.teams[g.away];
  const aq = g.quarters.map((q) => q[1]);
  const hq = g.quarters.map((q) => q[0]);
  return `
    <div class="score-line"><strong>Team</strong><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span>F</span></div>
    <div class="${teamRowClass(a.id, "score-line")}"><strong>${a.name}</strong>${aq.map((x) => `<span>${x}</span>`).join("")}<span>${g.as}</span></div>
    <div class="${teamRowClass(h.id, "score-line")}"><strong>${h.name}</strong>${hq.map((x) => `<span>${x}</span>`).join("")}<span>${g.hs}</span></div>
  `;
}

function renderLeague() {
  qs("#standings").innerHTML = `
    <div class="standings-head"><strong>#</strong><span>Team</span><span>Record</span><span>GF</span><span>GA</span><span>Diff</span><span>Status</span></div>
    ${standings().map((t, i) => {
      const diff = t.gf - t.ga;
      return `<div class="${teamRowClass(t.id, "row table-row")}"><strong>${i + 1}</strong><span>${t.name}</span><span>${t.wins}-${t.losses}</span><span>${t.gf}</span><span>${t.ga}</span><span>${diff >= 0 ? "+" : ""}${diff}</span><span>${i < 8 ? "Playoff" : "Out"}</span></div>`;
    }).join("")}
  `;
  const all = leaders();
  const goalLeaders = [...all].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const assistLeaders = [...all].sort((a, b) => b.assists - a.assists).slice(0, 5);
  const pointLeaders = [...all].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists) || b.goals - a.goals).slice(0, 5);
  const goalieLeaders = all.filter((p) => p.position === "Goalie").sort((a, b) => b.saves - a.saves).slice(0, 5);
  qs("#leaders").innerHTML = leaderGroup("Assists", assistLeaders, (p) => p.assists) + leaderGroup("Points", pointLeaders, (p) => p.goals + p.assists) + leaderGroup("Goals", goalLeaders, (p) => p.goals) + leaderGroup("Goalies", goalieLeaders, (p) => `${p.saves} SV`);
  qs("#values").innerHTML = [...state.teams].sort((a, b) => b.value - a.value).slice(0, 10).map((t, i) => `<div class="${teamRowClass(t.id, "row")}"><span>${i + 1}. ${t.name}<br><span class="muted">${t.wins}-${t.losses}, ${t.gf - t.ga >= 0 ? "+" : ""}${t.gf - t.ga} diff</span></span><strong>$${t.value}M</strong></div>`).join("");
}

function leaderGroup(title, players, statValue) {
  return `<div class="leader-group"><strong>${title}</strong>${players.map((p) => `<div class="row"><span>${p.name}<br><span class="muted">${p.team}</span></span><strong>${statValue(p)}</strong></div>`).join("")}</div>`;
}

function makeAdviceEmail(kind = "general") {
  const team = state.teams[state.selected];
  const pct = team.wins / Math.max(1, team.wins + team.losses);
  const best = [...team.roster].sort((a, b) => b.rating - a.rating)[0];
  const weakest = [...team.roster].sort((a, b) => a.rating - b.rating)[0];
  const senderPool = [
    { from: `${team.owner}, Owner`, tone: pct >= 0.55 ? "The building believes in this roster." : "The board wants a cleaner plan." },
    { from: "Mina Cross, Assistant GM", tone: `Shop depth before touching ${best ? best.name : "the core"}.` },
    { from: "Rory Vale, Cap Manager", tone: `Do not spend budget unless the incoming player is clearly above ${weakest ? weakest.name : "replacement level"}.` },
    { from: "Section 12 Fans", tone: pct >= 0.5 ? "Fans are buying in. One more scorer would make noise." : "Fans are restless. They want younger players and effort." },
    { from: `${pick(state.teams.filter((t) => t.id !== state.selected)).owner}, Rival Owner`, tone: "We are watching your roster. A fair offer could get our attention." }
  ];
  const sender = pick(senderPool);
  const subject = kind === "draft" ? "Draft room note" : kind === "trade" ? "Trade desk advice" : kind === "fan" ? "Fan mail" : "Front office pulse";
  const body = kind === "draft"
    ? `${sender.tone} In the draft, prioritize IQ and leadership if ratings are close. If cash gets tight, take the affordable player with the best playmaking or goal scoring trait.`
    : kind === "trade"
      ? `${sender.tone} For trades, compare age, trend, and leadership. A younger rising player can be worth more than a higher overall player who is cold.`
      : kind === "fan"
        ? `${sender.tone} The crowd is talking about ${best ? best.name : team.name}. Fanbase is ${team.fanbase}, so every win or bad trade matters.`
        : `${sender.tone} Current fanbase is ${team.fanbase}, chemistry is ${team.chemistry}, and the record is ${team.wins}-${team.losses}.`;
  return { from: sender.from, subject, body, unread: true };
}

function addAdvice(kind = "general") {
  if (state.helpRequests >= 3) {
    state.emails.unshift({
      from: "Gmail System",
      subject: "Help limit reached",
      body: "You already used your 3 direct help requests. New mail can still arrive from owners, staff, rivals, and fans.",
      unread: true
    });
    state.selectedEmail = 0;
    setTab("advice");
    renderAdvice();
    return;
  }
  state.helpRequests += 1;
  state.emails.unshift(makeAdviceEmail(kind));
  state.selectedEmail = 0;
  setTab("advice");
  renderAdvice();
}

function maybeReceiveMail(force = false) {
  const shouldSend = force || Math.random() <= 0.12;
  if (!shouldSend) return null;
  const email = makeAdviceEmail(pick(["general", "fan", "trade"]));
  state.emails.unshift(email);
  state.emails = state.emails.slice(0, 8);
  return email;
}

function renderAdvice() {
  if (!state.emails.length) {
    qs("#email-list").innerHTML = `<div class="muted">No mail right now. Ask for help when you need the front office.</div>`;
    qs("#email-title").textContent = "Inbox clear";
    qs("#email-body").innerHTML = `<p>Gmail resets each season and only sends occasional updates now.</p><span class="muted">Direct help used: ${state.helpRequests}/3</span>`;
    return;
  }
  qs("#email-list").innerHTML = state.emails.map((email, index) => `
    <button class="email-item ${index === state.selectedEmail ? "active" : ""}" data-email="${index}">
      <strong>${email.subject}</strong>
      <span>${email.from}</span>
    </button>
  `).join("");
  qsa("[data-email]").forEach((btn) => btn.addEventListener("click", () => {
    state.selectedEmail = Number(btn.dataset.email);
    renderAdvice();
  }));
  const email = state.emails[state.selectedEmail];
  qs("#email-title").textContent = email.subject;
  qs("#email-body").innerHTML = `<strong>${email.from}</strong><p>${email.body}</p><span class="muted">Direct help used: ${state.helpRequests}/3</span>`;
}

function addNews(type, title, body, urgent = false) {
  const story = { type, title, body, week: state.week, urgent };
  state.news.unshift(story);
  state.news = state.news.slice(0, 28);
  if (urgent) showNewsToast(story);
  return story;
}

function openInterviewModal() {
  if (state.selected === null) return;
  activeInterviewPlayerId = null;
  interviewMessages = [];
  interviewAwaiting = false;
  qs("#interview-title").textContent = "Interview one of your players";
  qs("#interview-chat").classList.add("hidden");
  qs("#interview-player-list").classList.remove("hidden");
  qs("#interview-question").disabled = false;
  qs("#send-interview").disabled = false;
  qs("#interview-question").value = "";
  renderInterviewPlayers();
  qs("#interview-modal").classList.remove("hidden");
  checkAiInterviewStatus();
}

function closeInterviewModal() {
  interviewAwaiting = false;
  qs("#interview-modal").classList.add("hidden");
}

function renderInterviewPlayers() {
  const mine = state.teams[state.selected];
  qs("#interview-player-list").innerHTML = mine.roster.slice().sort((a, b) => b.rating - a.rating).map((player) => `
    <button class="interview-player ${playerHeatClass(player)}" data-interview-player="${player.id}">
      <span><strong>${player.name}</strong><em>${player.position} | ${player.rating} OVR | ${playerTrend(player)}</em></span>
      <b>Interview</b>
    </button>
  `).join("");
}

async function checkAiInterviewStatus() {
  const status = qs("#interview-ai-status");
  if (!status) return;
  status.textContent = "Players are ready for questions";
  try {
    const response = await fetch("/api/interview-status");
    const data = await response.json();
    aiInterviewEnabled = !!data.enabled;
    aiInterviewChecked = true;
    status.textContent = "Players are ready for questions";
  } catch (error) {
    aiInterviewEnabled = false;
    aiInterviewChecked = true;
    status.textContent = "Players are ready for questions";
  }
}

function renderAiInterviewStatus() {
  const status = qs("#interview-ai-status");
  if (!status) return;
  status.textContent = "Players are ready for questions";
}

function backToInterviewPlayers() {
  activeInterviewPlayerId = null;
  interviewMessages = [];
  interviewAwaiting = false;
  qs("#interview-title").textContent = "Interview one of your players";
  qs("#interview-chat").classList.add("hidden");
  qs("#interview-player-list").classList.remove("hidden");
  qs("#interview-question").disabled = false;
  qs("#send-interview").disabled = false;
  qs("#interview-question").value = "";
}

function startPlayerInterview(playerId) {
  const player = state.teams[state.selected].roster.find((p) => p.id === playerId);
  if (!player) return;
  player.interviewProfile = player.interviewProfile || makeInterviewProfile(player.name, player.position, player.rating);
  activeInterviewPlayerId = playerId;
  interviewAwaiting = false;
  interviewMessages = [{ from: player.name, text: `What's up. ${player.name} here. You get 5 questions. Ask me whatever you want.` }];
  qs("#interview-title").textContent = `${player.name} Interview`;
  qs("#interview-player-list").classList.add("hidden");
  qs("#interview-chat").classList.remove("hidden");
  qs("#interview-question").disabled = false;
  qs("#send-interview").disabled = false;
  qs("#interview-question").value = "";
  renderAiInterviewStatus();
  renderInterviewLog();
  qs("#interview-question").focus();
}

async function sendInterviewQuestion() {
  if (interviewAwaiting) return;
  const input = qs("#interview-question");
  const question = input.value.trim();
  if (!question || !activeInterviewPlayerId) return;
  const player = state.teams[state.selected].roster.find((p) => p.id === activeInterviewPlayerId);
  if (!player) return;
  if (interviewQuestionCount() >= 5) {
    interviewMessages.push({ from: "Press Room", text: "Interview limit reached. You used all 5 questions for this player." });
    input.value = "";
    renderInterviewLog();
    return;
  }
  interviewMessages.push({ from: "You", text: question });
  interviewMessages.push({ from: player.name, text: "Thinking..." });
  interviewAwaiting = true;
  input.value = "";
  renderInterviewLog();
  const answer = await playerInterviewAnswer(player, question);
  interviewMessages[interviewMessages.length - 1] = { from: player.name, text: answer };
  interviewAwaiting = false;
  addNews("interview", `${player.name} Interview`, `You asked: "${question}" ${player.name} answered: "${answer}"`);
  renderInterviewLog();
  renderNews();
}

function interviewQuestionCount() {
  return interviewMessages.filter((message) => message.from === "You").length;
}

function shouldDeclineInterviewQuestion(question) {
  const q = question.toLowerCase();
  const offTopic = ["politics", "religion", "password", "address", "where do you live", "private", "secret", "illegal", "cheat code", "hack"];
  return offTopic.some((topic) => q.includes(topic));
}

function renderInterviewLog() {
  const log = qs("#interview-log");
  const remaining = Math.max(0, 5 - interviewQuestionCount());
  qs("#interview-limit").textContent = `${remaining}/5 questions left. Player may pass if it is too private or too far off.`;
  qs("#send-interview").disabled = remaining <= 0 || interviewAwaiting;
  qs("#interview-question").disabled = remaining <= 0 || interviewAwaiting;
  log.innerHTML = interviewMessages.map((message) => `
    <div class="interview-bubble ${message.from === "You" ? "mine" : ""}">
      <strong>${message.from}</strong>
      <p>${message.text}</p>
    </div>
  `).join("");
  log.scrollTop = log.scrollHeight;
}

async function playerInterviewAnswer(player, question) {
  const aiResult = await fetchAiInterviewAnswer(player, question);
  if (aiResult.answer) return aiResult.answer;
  return "The live interview connection failed. Please try that question again in a moment.";
}

async function fetchAiInterviewAnswer(player, question) {
  try {
    const team = state.teams[state.selected];
    player.interviewProfile = player.interviewProfile || makeInterviewProfile(player.name, player.position, player.rating);
    const standingsRank = [...state.teams].sort((a, b) => b.wins - a.wins || (b.gf - b.ga) - (a.gf - a.ga)).findIndex((t) => t.id === team.id) + 1;
    const response = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        player: {
          ...player,
          trend: playerTrend(player),
          profile: player.interviewProfile
        },
        team: {
          name: team.name,
          record: `${team.wins}-${team.losses}`,
          goalsFor: team.gf,
          goalsAgainst: team.ga,
          standing: standingsRank,
          fanbase: team.fanbase,
          chemistry: team.chemistry,
          owner: team.owner,
          value: team.value
        },
        season: {
          week: state.week,
          draftYear: state.draftYear,
          seasonDone: state.seasonDone,
          playoffsDone: state.playoffsDone,
          worldsDone: state.worldsDone
        },
        messages: interviewMessages.filter((message) => message.text !== "Thinking...")
      })
    });
    if (!response.ok) {
      let error = `server returned ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) error = data.error;
      } catch (parseError) {}
      return { answer: "", error };
    }
    const data = await response.json();
    return { answer: data.answer || "", error: data.error || "" };
  } catch (error) {
    return { answer: "", error: error && error.message ? error.message : "could not reach the enhanced interview server" };
  }
}

function questionMainIdea(question) {
  const cleaned = question.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !["what", "why", "how", "who", "when", "where", "is", "are", "do", "does", "did", "you", "your", "the", "a", "an", "to", "of", "and", "or", "in", "on", "for", "about", "think"].includes(word));
  return cleaned.slice(0, 5).join(" ") || "that";
}

function simulatedPlayerLLM(player, question, context) {
  const { team, profile, trend, statLine, confidence, topTeammate, role, teamMood } = context;
  const q = question.toLowerCase();
  const idea = questionMainIdea(question);
  const opener = pick([
    `Honestly, ${idea} is a funny one.`,
    `Not gonna lie, ${idea} made me blink twice.`,
    `That is a wild question, but I respect it.`,
    `Alright, reporter mode activated.`,
    `${profile.catchphrase}, that is not the question I expected.`
  ]);
  const statFlex = player.position === "Goalie"
    ? `I'm sitting on ${player.saves} saves and ${player.wins} wins, so my brain is mostly save angles and snacks.`
    : `I'm at ${player.goals} goals and ${player.assists} assists, so I am judging everything like it is a fast break.`;
  const moodLine = `With ${team.name} at ${team.wins}-${team.losses}, ${teamMood}.`;
  const goofyLine = pick([
    `My official locker-room answer is that it depends on the vibes, the scoreboard, and whether someone brought ${profile.favoriteFood}.`,
    `If it helps us win a ground ball, I am probably for it. If it distracts us, I am throwing it into the imaginary penalty box.`,
    `I would rate it a ${Math.max(1, Math.min(10, Math.round(player.rating / 10)))} out of 10, adjusted for lacrosse weather and emotional damage.`,
    `My coach would want a serious answer, so: stay disciplined. My real answer: chaos, but organized chaos.`,
    `I have seen weirder things in warmups. One time my tape job looked like a science project and I still played decent.`
  ]);
  if (q.includes("would you rather")) {
    return `${opener} I would pick the option that helps ${team.name} win and lets me keep my ankles intact. ${statFlex}`;
  }
  if (q.startsWith("can you") || q.includes("could you")) {
    return `${opener} Could I? Maybe. Should I? Depends if the trainer, coach, and my common sense all sign the permission slip. ${role}`;
  }
  if (q.includes("rank") || q.includes("rate") || q.includes("scale")) {
    return `${opener} I would rate it ${Math.max(1, Math.min(10, Math.round((player.rating + player.traits.showboat) / 20)))} out of 10. That is a very official number from the ${profile.nickname} Institute of Lacrosse Feelings.`;
  }
  if (q.includes("pizza") || q.includes("burger") || q.includes("candy") || q.includes("drink") || q.includes("snack")) {
    return `${opener} Food questions matter. My go-to is ${profile.favoriteFood}, but if ${idea} shows up after a win, I am at least listening.`;
  }
  if (q.includes("movie") || q.includes("game") || q.includes("video game") || q.includes("show")) {
    return `${opener} I like anything with competition in it. If ${idea} has clutch moments, bad decisions, and somebody yelling at a screen, that sounds like our bench during playoffs.`;
  }
  if (q.includes("fight") || q.includes("beat") || q.includes("win against")) {
    return `${opener} I am not trying to start drama, but I like my chances when the whistle blows. If ${topTeammate ? topTeammate.name : "my teammates"} has my back, I am walking in confident.`;
  }
  if (q.includes("dream") || q.includes("future") || q.includes("career")) {
    return `${opener} Long term, I want people to remember me as ${profile.personality}, tough, and useful in big games. The dream is simple: win enough that nobody can call it luck.`;
  }
  if (q.includes("embarrassing") || q.includes("weird") || q.includes("goofy")) {
    return `${opener} My weird thing is ${profile.goofyHabit}. It sounds ridiculous until I have a good game, then suddenly everybody calls it a routine.`;
  }
  if (q.includes("advice") || q.includes("tip")) {
    return `${opener} My advice is this: do the boring stuff until it becomes automatic. Also hydrate, because cramping up is the least cool way to become a story.`;
  }
  if (q.includes("yes or no")) {
    return `${opener} My answer is yes, but with a coach-sized asterisk. If it hurts the team, no. If it helps us win, absolutely yes.`;
  }
  return `${opener} I connect it back to lacrosse like this: ${moodLine} ${goofyLine} ${statFlex}`;
}

function localPlayerInterviewAnswer(player, question) {
  const q = question.toLowerCase();
  const team = state.teams[state.selected];
  player.interviewProfile = player.interviewProfile || makeInterviewProfile(player.name, player.position, player.rating);
  const profile = player.interviewProfile;
  const trend = playerTrend(player);
  const statLine = player.position === "Goalie" ? `${player.saves} saves and ${player.wins} wins` : `${player.goals} goals and ${player.assists} assists`;
  const confidence = (player.traits.leadership + player.traits.iq + player.rating) / 3;
  const swagger = player.traits.showboat > 72 ? "I like the spotlight, no lie. " : "";
  const topTeammate = team.roster.filter((p) => p.id !== player.id).sort((a, b) => b.rating - a.rating)[0];
  const teamMood = team.wins > team.losses ? "the room feels confident" : team.wins === team.losses ? "the room feels like we are right on the edge" : "the room knows we have to be better";
  const role = player.position === "Goalie"
    ? "My job is to settle everyone down and steal possessions when the game gets messy."
    : player.position === "Defenseman"
      ? "My job is to make people uncomfortable and win the ugly possessions."
      : player.position === "Midfielder"
        ? "My job is to connect both ends, push pace, and make the smart play."
        : "My job is to pressure the cage and make defenses panic.";
  if (shouldDeclineInterviewQuestion(question)) return `I'm going to pass on that one. I try to keep interviews respectful and focused on the game, the team, and life around the season.`;
  if (q.includes("name") && (q.includes("nickname") || q.includes("called"))) return `Some of the guys call me ${profile.nickname}. I did not choose it, but it stuck.`;
  if (q.includes("hero") || q.includes("look up to") || q.includes("inspired")) return `I looked up to ${profile.hero}. That is where a lot of my game started.`;
  if (q.includes("favorite color") || q.includes("favourite color")) return `My favorite color is ${profile.favoriteColor}. If I could pick a custom stick setup, I would work that into it.`;
  if (q.includes("favorite food") || q.includes("favourite food") || q.includes("eat") || q.includes("meal")) return `My go-to meal is ${profile.favoriteFood}. Before games I keep it lighter, but after a win that is what I want.`;
  if (q.includes("music") || q.includes("song")) return `I usually like ${profile.music}. It gets me into the right headspace before a game.`;
  if (q.includes("hobby") || q.includes("outside lacrosse") || q.includes("free time")) return `Outside lacrosse, I am usually into ${profile.hobby}. It keeps me balanced.`;
  if (q.includes("where") && (q.includes("from") || q.includes("hometown"))) return `I'm from ${profile.hometown}. That place is part of how I play.`;
  if (q.includes("personality") || q.includes("what are you like")) return `I would say I am ${profile.personality}. My motto is pretty simple: ${profile.motto}`;
  if (q.includes("weather") || q.includes("rain") || q.includes("cold") || q.includes("hot")) return `Weather changes the ball and the pace, but everybody has to play in it. I try not to make excuses.`;
  if (q.includes("favorite animal") || q.includes("favourite animal")) return `I don't know, man. I never really picked a favorite animal. What's the next question?`;
  if (q.includes("favorite number") || q.includes("favourite number")) return `Favorite number? I would go with ${Math.max(1, Number(String(player.id).replace(/\D/g, "").slice(-2)) || player.rating % 99)}. It just feels like my kind of number.`;
  if (q.includes("how are you") || q.includes("how do you feel")) return `I'm feeling good. Body is holding up, the season is moving fast, and I am trying to stay locked in every week.`;
  if (q.includes("who are you") || q.includes("tell me about yourself")) return `I'm ${player.name}, ${player.position}, ${player.rating} overall. I see myself as someone who can help ${team.name} win if I keep doing my job.`;
  if (q.includes("role") || q.includes("job") || q.includes("responsibility")) return role;
  if (q.includes("injury") || q.includes("hurt") || q.includes("healthy")) return player.injuryWeeks > 0 ? `I'm banged up right now and missing ${player.injuryWeeks} weeks, which is frustrating. I just have to rehab right.` : `I'm healthy right now. At this point in the season, that matters almost as much as anything.`;
  if (q.includes("school") || q.includes("class") || q.includes("homework")) return `Balancing school and lacrosse is real. You learn fast that if you waste time, the day disappears. Discipline matters off the field too.`;
  if (q.includes("friend") || q.includes("family")) return `My family and close friends keep me grounded. When the season gets loud, they remind me I am more than one good game or one bad game.`;
  if (q.includes("scared") || q.includes("fear")) return `I would not say scared, but you respect the moment. The players who act like they never feel anything are usually lying. You just play through it.`;
  if (q.includes("rival") || q.includes("enemy") || q.includes("hate")) return `I would not call it hate, but there are teams I circle on the schedule. You remember who embarrassed you.`;
  if (q.includes("best player") || q.includes("goat")) return `There are a lot of great players in this league. I am not here to crown anybody. I just want my matchup to know they had a long day against me.`;
  if (q.includes("best teammate") || q.includes("favorite teammate") || q.includes("teammate you like")) return topTeammate ? `${topTeammate.name} is a guy I trust. When a game gets tight, you notice who still wants the ball.` : `I respect everyone in the room. We are still building that chemistry.`;
  if (q.includes("money") || q.includes("salary")) return `Money is part of the business, but my focus is playing well enough that everything else takes care of itself.`;
  if ((q.includes("do you like") || q.includes("love") || q.includes("enjoy")) && q.includes("lacrosse")) return `Yeah, I love lacrosse. I would not put in the practices, film, travel, and pressure if I did not care about it. The best part is competing with this team.`;
  if (q.includes("why") && q.includes("lacrosse")) return `I play lacrosse because it rewards everything I care about: speed, toughness, skill, and trust. You cannot fake it when the game gets fast.`;
  if (q.includes("favorite") && (q.includes("part") || q.includes("thing")) && q.includes("lacrosse")) return `My favorite part is the momentum swings. One ground ball, one save, one goal, and suddenly the whole sideline feels different.`;
  if (q.includes("pressure") || q.includes("nervous")) return confidence > 74 ? `Pressure is part of it. I actually like it because it tells you the moment matters.` : `I still get nerves, but once the whistle goes, you just read the play and trust your work.`;
  if (q.includes("improve") || q.includes("better") || q.includes("work on")) return `I am working on consistency. For me that means cleaner decisions, better conditioning, and making the simple play before trying to do too much.`;
  if (q.includes("practice") || q.includes("training") || q.includes("workout")) return `Practice is where you earn trust. I focus on the reps that show up late in games, not just the flashy stuff.`;
  if (q.includes("fans") || q.includes("crowd")) return `The fans matter. When the building is loud, you feel it on ground balls and defensive stands.`;
  if (q.includes("captain") || q.includes("leader") || q.includes("leadership")) return confidence > 76 ? `Leadership is about being steady when everyone else is emotional. I want guys to know what they get from me every night.` : `I'm still learning that part. You lead by doing your job first.`;
  if (q.includes("playoff") || q.includes("championship") || q.includes("world")) return `${swagger}The goal is playoffs first, then the trophy. At ${team.wins}-${team.losses}, we know what has to happen.`;
  if (q.includes("trade") || q.includes("rumor")) return `Trades are business, but chemistry matters. Our chemistry is ${team.chemistry}, and you can feel when a locker room trusts each other.`;
  if (q.includes("team") || q.includes("teammate") || q.includes("locker")) return `This group is close. Fanbase is ${team.fanbase}, chemistry is ${team.chemistry}, and ${teamMood}.`;
  if (q.includes("goal") || q.includes("assist") || q.includes("save") || q.includes("stat") || q.includes("playing")) return `Personally, I'm at ${statLine}, and right now I feel ${trend.replace(/[🔥📈📉➖]/g, "").trim()}. I still have another level.`;
  if (q.includes("coach") || q.includes("gm") || q.includes("manager")) return `The GM has a plan. If we keep adding IQ, toughness, and speed, this team can become dangerous.`;
  if (q.includes("bad") || q.includes("lose") || q.includes("struggle")) return confidence > 72 ? `We are not hiding from it. Losses test your leaders, and I want to be one of those guys.` : `It has been frustrating, but nobody is quitting. We need cleaner starts and better possessions.`;
  if (q.includes("win") || q.includes("record") || q.includes("season")) return `We are ${team.wins}-${team.losses}. That record tells part of the story, but the next game is the only one we can change.`;
  return simulatedPlayerLLM(player, question, { team, profile, trend, statLine, confidence, topTeammate, role, teamMood });
}

function addPlayerInterview() {
  const player = pick(leaders().filter((p) => p.goals + p.assists + p.wins > 0).sort((a, b) => (b.goals + b.assists + b.wins) - (a.goals + a.assists + a.wins)).slice(0, 18));
  if (!player) return;
  const quote = pick([
    `"We are not ducking anybody. Keep lining them up."`,
    `"The locker room is loud right now, in a good way."`,
    `"Stats are cool, but I want the bracket."`,
    `"I know people are watching. I like that pressure."`
  ]);
  addNews("interview", `${player.name} Postgame Text Interview`, `${player.team} star ${player.name} dropped ${player.goals + player.assists} points so far and texted: ${quote}`);
}

function addDramaStory() {
  const all = leaders().filter((p) => p.position !== "Goalie");
  const speaker = pick(all);
  const target = pick(all.filter((p) => p.id !== speaker.id));
  if (!speaker || !target) return;
  const line = pick([
    `"I do not see the hype. Make him go left and it is over."`,
    `"That rating looks generous to me."`,
    `"Good player, but he has not scared our sideline yet."`,
    `"Tell him to bring that energy when the lights are on."`
  ]);
  addNews("drama", `${speaker.name} Starts Some League Drama`, `${speaker.name} of ${speaker.team} was asked about ${target.name} and said: ${line}`);
}

function renderNews() {
  const feed = qs("#news-feed");
  if (!feed) return;
  if (!state.news.length) {
    feed.innerHTML = `<div class="muted">No stories yet. Sim a few games for injuries, interviews, and league drama.</div>`;
    return;
  }
  feed.innerHTML = state.news.map((story) => `
    <div class="news-card ${story.urgent ? "urgent" : ""}">
      <span>${story.type.toUpperCase()} | Week ${story.week || 1}</span>
      <strong>${story.title}</strong>
      <p>${story.body}</p>
    </div>
  `).join("");
}

function renderLeaderboard() {
  const boardEl = qs("#leaderboard");
  if (!boardEl) return;
  renderOwnerConsole();
  const board = readLeaderboard();
  const accounts = readAccounts();
  Object.keys(accounts).forEach((username) => {
    const account = accounts[username];
    if (!board[username]) {
      board[username] = {
        username,
        gmName: account.gmName || username,
        yearsPlayed: account.state && account.state.draftYear ? Math.max(0, account.state.draftYear - 1) : 0,
        championships: 0
      };
    } else {
      board[username].gmName = account.gmName || board[username].gmName || username;
      board[username].yearsPlayed = Math.max(board[username].yearsPlayed || 0, account.state && account.state.draftYear ? Math.max(0, account.state.draftYear - 1) : 0);
    }
    board[username].banned = !!account.banned;
    board[username].owner = !!account.owner || isOwnerUsername(username);
    board[username].rate = board[username].yearsPlayed ? board[username].championships / board[username].yearsPlayed : 0;
  });
  writeLeaderboard(board);
  const rows = Object.values(board).filter((entry) => !entry.banned || isOwnerAccount()).sort((a, b) => {
    return b.championships - a.championships || b.rate - a.rate || b.yearsPlayed - a.yearsPlayed;
  });
  if (!rows.length) {
    boardEl.innerHTML = `<div class="muted">No accounts yet. Create or log in to an account to appear here.</div>`;
    return;
  }
  boardEl.innerHTML = rows.map((entry, index) => {
    const rate = entry.yearsPlayed ? Math.round((entry.championships / entry.yearsPlayed) * 100) : 0;
    return `
      <div class="row table-row ${entry.username === currentAccount ? "my-team" : ""}">
        <strong>${index + 1}</strong>
        <span>${entry.gmName}${entry.owner ? ` <b class="owner-badge">OWNER</b>` : ""}${entry.banned ? ` <b class="ban-badge">BANNED</b>` : ""}<br><span class="muted">@${entry.username}</span></span>
        <span>${entry.championships} titles</span>
        <span>${entry.yearsPlayed} years</span>
        <span>${rate}%</span>
      </div>
    `;
  }).join("");
}

function renderOwnerConsole() {
  const startConsole = qs("#owner-console-start");
  const mainConsole = qs("#owner-console-main");
  const legacyConsole = qs("#owner-console");
  [startConsole, mainConsole, legacyConsole].filter(Boolean).forEach((consoleEl) => {
    consoleEl.classList.add("hidden");
    consoleEl.innerHTML = "";
  });
  const gameVisible = qs("#game") && !qs("#game").classList.contains("hidden");
  const teamSelectVisible = qs("#team-select") && !qs("#team-select").classList.contains("hidden");
  const consoleEls = [gameVisible ? mainConsole : teamSelectVisible ? startConsole : mainConsole || startConsole].filter(Boolean);
  if (!consoleEls.length) return;
  consoleEls.forEach((consoleEl) => consoleEl.classList.toggle("hidden", !isOwnerAccount()));
  if (!isOwnerAccount()) {
    consoleEls.forEach((consoleEl) => {
      consoleEl.innerHTML = "";
    });
    return;
  }
  const accounts = readAccounts();
  const accountRows = Object.keys(accounts).sort().map((username) => {
    const account = accounts[username];
    const status = isOwnerUsername(username) ? "OWNER" : account.banned ? "BANNED" : "ACTIVE";
    return `
      <button class="owner-account-row" data-owner-fill="${username}" type="button">
        <span>${account.gmName || username}<br><small>@${username}</small></span>
        <strong>${status}</strong>
      </button>
    `;
  }).join("") || `<div class="muted">No local accounts yet.</div>`;
  const html = `
    <div class="panel inner owner-console-panel">
      <div>
        <p class="eyebrow">Owner Tools</p>
        <h3>Avik Hardy Command Console</h3>
      </div>
      <div class="owner-account-list">
        <strong>All local player accounts</strong>
        ${accountRows}
      </div>
      <div class="owner-command-row">
        <input id="owner-ban-username" type="text" placeholder="username to ban or unban" />
        <button class="secondary" data-owner-action="ban">Ban</button>
        <button class="secondary" data-owner-action="unban">Unban</button>
      </div>
      <div class="owner-command-row">
        <input id="owner-budget-amount" type="number" min="0" step="50" placeholder="budget in k, like 5000" />
        <button class="secondary" data-owner-action="set-draft-budget">Set Draft Budget</button>
        <button class="secondary" data-owner-action="set-trade-budget">Set Trade Budget</button>
      </div>
      <div class="owner-command-grid">
        <button class="secondary" data-owner-command="money">Add $1000k</button>
        <button class="secondary" data-owner-command="boost">Boost My Team</button>
        <button class="secondary" data-owner-command="heal">Heal Injuries</button>
        <button class="secondary" data-owner-command="unfire">Clear Fired</button>
        <button class="secondary" data-owner-command="wins">Add 5 Wins</button>
      </div>
      <div id="owner-command-message" class="muted">Owner commands only work on the Avik Hardy account.</div>
    </div>
  `;
  consoleEls.forEach((consoleEl) => {
    consoleEl.innerHTML = html;
  });
}

function ownerMessage(message) {
  const el = qs("#owner-command-message");
  if (el) el.textContent = message;
}

function ownerTargetUsername() {
  const input = qs("#owner-ban-username");
  return sanitizeUsername(input ? input.value : "");
}

function ownerBudgetAmount() {
  const input = qs("#owner-budget-amount");
  const amount = Number(input ? input.value : 0);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : null;
}

function ownerBanAccount() {
  if (!isOwnerAccount()) return;
  const target = ownerTargetUsername();
  if (!target) {
    ownerMessage("Type a username first.");
    return;
  }
  if (isOwnerUsername(target)) {
    ownerMessage("Owner accounts cannot be banned.");
    return;
  }
  const accounts = readAccounts();
  if (!accounts[target]) {
    ownerMessage(`No account found for @${target}.`);
    return;
  }
  accounts[target].banned = true;
  writeAccounts(accounts);
  const board = readLeaderboard();
  if (board[target]) board[target].banned = true;
  writeLeaderboard(board);
  renderLeaderboard();
  ownerMessage(`Banned @${target}.`);
}

function ownerUnbanAccount() {
  if (!isOwnerAccount()) return;
  const target = ownerTargetUsername();
  if (!target) {
    ownerMessage("Type a username first.");
    return;
  }
  const accounts = readAccounts();
  if (!accounts[target]) {
    ownerMessage(`No account found for @${target}.`);
    return;
  }
  accounts[target].banned = false;
  writeAccounts(accounts);
  const board = readLeaderboard();
  if (board[target]) board[target].banned = false;
  writeLeaderboard(board);
  renderLeaderboard();
  ownerMessage(`Unbanned @${target}.`);
}

function ownerSetBudget(type) {
  if (!isOwnerAccount()) return;
  const amount = ownerBudgetAmount();
  if (amount === null) {
    ownerMessage("Type a valid budget number first.");
    return;
  }
  if (type === "draft") {
    state.draftBudget = amount;
    state.tradeMessage = `Owner command set draft budget to $${amount}k.`;
  }
  if (type === "trade") {
    state.tradeBudget = amount;
    state.tradeMessage = `Owner command set trade budget to $${amount}k.`;
  }
  saveAccountProgress();
  renderAll();
  ownerMessage(state.tradeMessage);
}

function runOwnerCommand(command) {
  if (!isOwnerAccount()) return;
  if (state.selected === null && command !== "unfire") {
    ownerMessage("Choose a team before using that command.");
    return;
  }
  const team = state.selected !== null ? state.teams[state.selected] : null;
  if (command === "money") {
    state.draftBudget += 1000;
    state.tradeBudget += 1000;
    state.tradeMessage = "Owner command added $1000k to draft and trade budgets.";
  }
  if (command === "boost" && team) {
    team.roster.forEach((player) => {
      player.rating = Math.min(99, player.rating + 5);
    });
    team.fanbase = Math.min(100, team.fanbase + 10);
    team.chemistry = Math.min(100, team.chemistry + 10);
    state.tradeMessage = "Owner command boosted your roster, fanbase, and chemistry.";
  }
  if (command === "heal" && team) {
    team.roster.forEach((player) => {
      player.injuryWeeks = 0;
    });
    state.tradeMessage = "Owner command healed every player on your roster.";
  }
  if (command === "unfire") {
    state.fired = false;
    state.ownerGoalReviewPending = false;
    state.tradeMessage = "Owner command cleared fired status.";
  }
  if (command === "wins" && team) {
    team.wins += 5;
    team.gf += 60;
    team.ga = Math.max(0, team.ga - 20);
    state.tradeMessage = "Owner command added 5 wins.";
  }
  saveAccountProgress();
  renderAll();
  ownerMessage(state.tradeMessage || "Owner command complete.");
}

function renderHallOfFame() {
  const hallEl = qs("#hall-of-fame");
  if (!hallEl) return;
  const legends = [...(state.hallOfFame || [])].sort((a, b) => b.score - a.score).slice(0, 25);
  if (!legends.length) {
    hallEl.innerHTML = `<div class="muted">No retired legends yet. Players enter after retirement if their career score is high enough.</div>`;
    return;
  }
  hallEl.innerHTML = `
    <div class="standings-head hall-head"><strong>#</strong><span>Player</span><span>Team</span><span>Career</span><span>Score</span></div>
    ${legends.map((player, index) => {
      const career = player.position === "Goalie"
        ? `${player.saves} saves, ${player.wins} wins`
        : `${player.goals}G ${player.assists}A ${player.points}PTS`;
      return `
        <div class="row table-row hall-row">
          <strong>${index + 1}</strong>
          <span>${player.name}<br><span class="muted">${player.position}, retired age ${player.age}, ${player.rating} OVR</span></span>
          <span>${player.team}</span>
          <span>${career}<br><span class="muted">${player.seasons} seasons</span></span>
          <span>${player.score}</span>
        </div>
      `;
    }).join("")}
  `;
}

function renderTrades() {
  cleanupTradeOffers();
  qs("#trade-budget").textContent = money(state.tradeBudget);
  const message = state.tradeMessage ? `<div class="trade-message">${state.tradeMessage}</div>` : "";
  qs("#trade-offers").innerHTML = message + (state.offers.length ? state.offers.map((o, i) => {
    const mine = state.teams[state.selected];
    const other = state.teams[o.buyer];
    const out = mine.roster.find((p) => p.id === o.outgoing);
    const inc = other.roster.find((p) => p.id === o.incoming);
    return `
      <div class="player-card trade-card">
        <strong>${other.name} request</strong>
        <span>They want ${out ? out.name : "a player"} and offer ${inc ? inc.name : "a player"}${o.pick ? " and a draft pick" : ""}</span>
        <div class="trade-matchup">
          ${playerStatCard("Your player", out, mine.name)}
          ${playerStatCard("Their player", inc, other.name)}
        </div>
        <div class="trade-actions">
          <button data-offer="${i}">Accept</button>
          <button class="danger" data-decline="${i}">Decline</button>
        </div>
      </div>
    `;
  }).join("") : `<div class="muted">No active requests. Refresh or simulate weeks for new requests.</div>`);
  qsa("[data-offer]").forEach((btn) => btn.addEventListener("click", () => {
    const index = Number(btn.dataset.offer);
    confirmAction(
      "Accept Trade",
      `${describeOffer(state.offers[index])} Accept this trade?`,
      () => acceptOffer(index)
    );
  }));
  qsa("[data-decline]").forEach((btn) => btn.addEventListener("click", () => {
    declineOffer(Number(btn.dataset.decline));
  }));
  qs("#manual-trades").innerHTML = state.teams.filter((t) => t.id !== state.selected).slice(0, 8).map((t) => {
    const preview = manualTradePreview(t.id);
    return `
      <div class="player-card trade-card">
        <strong>${t.name}</strong>
        <div class="trade-matchup">
          ${playerStatCard("You would send", preview.myPlayer, state.teams[state.selected].name)}
          ${playerStatCard("You would get", preview.theirPlayer, t.name)}
        </div>
        <button data-manual="${t.id}" ${preview.disabled ? "disabled" : ""}>Offer</button>
      </div>
    `;
  }).join("");
  qsa("[data-manual]").forEach((btn) => btn.addEventListener("click", () => {
    const team = state.teams[Number(btn.dataset.manual)];
    confirmAction(
      "Offer Trade",
      `Send a trade offer to ${team.name}? The game will choose a budget-safe deal if one is available.`,
      () => manualTrade(team.id)
    );
  }));
}

function manualTradePreview(teamId) {
  const mine = state.teams[state.selected];
  const other = state.teams[teamId];
  const myPlayer = [...mine.roster].sort((a, b) => a.rating - b.rating)[0];
  const theirPlayer = myPlayer ? other.roster
    .filter((p) => p.salary <= state.tradeBudget + myPlayer.salary)
    .filter((p) => tradeKeepsRostersPlayable(myPlayer, p, other))
    .sort((a, b) => b.rating - a.rating)[0] : null;
  const cost = theirPlayer ? Math.max(35, Math.round((theirPlayer.rating - myPlayer.rating + 10) * 8)) : Infinity;
  return { myPlayer, theirPlayer, disabled: !theirPlayer || cost > state.tradeBudget };
}

function renderAwards() {
  const awardsEl = qs("#awards");
  if (!awardsEl) return;
  qs("#continue-playoffs").disabled = !state.seasonDone;
  if (!state.seasonDone) {
    awardsEl.innerHTML = `<div class="muted">Finish the regular season to reveal awards.</div>`;
    return;
  }
  const awards = state.playoffs ? state.playoffs.awards : makeAwards();
  awardsEl.innerHTML = `
    <div class="awards-row">
      ${awardCard("The Can't Stop Scoring Award", awards.scorer, `${awards.scorer.goals} goals`)}
      ${awardCard("The Dish Master Award", awards.assister, `${awards.assister.assists} assists`)}
      ${awardCard("The Points Machine Award", awards.pointsLeader, `${awards.pointsLeader.goals + awards.pointsLeader.assists} points`)}
      ${awardCard("The Next Up Rookie Award", awards.rookie, awards.rookie ? `${awards.rookie.goals + awards.rookie.assists} points` : "No rookie stats")}
      ${awardCard("The Brick Wall Goalie Award", awards.goalie, `${awards.goalie.saves} saves, ${awards.goalie.wins} wins`)}
      ${awardCard("The Face of the League Award", awards.mvp, `${awards.mvp.rating} OVR, ${awards.mvp.goals + awards.mvp.assists} points`)}
      ${teamAwardCard("The Glow Up Team Award", awards.improvedTeam)}
    </div>
  `;
}

function renderPlayoffs() {
  const playoffButton = qs("#run-playoffs");
  if (state.seasonDone) initializePlayoffs();
  const nextGame = state.playoffs && !state.playoffsDone ? nextMyPlayoffGame() : null;
  const remainingGame = state.playoffs && !state.playoffsDone ? nextPlayableGame(state.playoffs) : null;
  playoffButton.disabled = !state.seasonDone || state.playoffsDone || !!state.playoffLive;
  if (state.playoffsDone) {
    playoffButton.textContent = "Playoffs Complete";
  } else if (state.playoffLive) {
    playoffButton.textContent = "Game Live";
  } else if (nextGame) {
    playoffButton.textContent = `Sim ${seedLabel(nextGame.homeSeed)} vs ${seedLabel(nextGame.awaySeed)}`;
  } else if (remainingGame) {
    playoffButton.textContent = `Sim rest of ${formatRoundNumber(state.playoffs)}`;
  } else if (state.playoffs) {
    playoffButton.textContent = "Next Round Ready";
  } else {
    playoffButton.textContent = "Sim First Game";
  }
  if (!state.playoffs) {
    qs("#playoffs").innerHTML = state.seasonDone ? `<div class="muted">Top 8 teams are ready. Continue to run the bracket.</div>` : `<div class="muted">Top 8 teams qualify after Week 20.</div>`;
    return;
  }
  const { bracket, champion } = state.playoffs;
  qs("#playoffs").innerHTML = `
    ${state.playoffLive ? `<div class="scoreboard playoff-live">${knockoutLiveBox(state.playoffLive)}</div>` : ""}
    <div class="bracket">
      ${bracket.map((round) => `
        <div class="bracket-round">
          <strong>${round.name}</strong>
          ${round.games.map((game) => `
            <div class="bracket-game">
              <div class="${teamRowClass(game.home.id, "bracket-team")}">
                <span>${seedLabel(game.homeSeed)} ${game.home.name}</span><strong>${game.played ? game.homeScore : "-"}</strong>
              </div>
              <div class="${teamRowClass(game.away.id, "bracket-team")}">
                <span>${seedLabel(game.awaySeed)} ${game.away.name}</span><strong>${game.played ? game.awayScore : "-"}</strong>
              </div>
              <span class="muted">${game.played ? `Winner: ${state.teams[game.winner].name}` : "Matchup set"}</span>
            </div>
          `).join("")}
        </div>
      `).join("")}
    </div>
    ${champion ? `<div class="${teamRowClass(champion.id, "row champion-row")}"><span>Champion</span><strong>${champion.name}</strong></div>` : `<div class="muted">Next round is ready.</div>`}
  `;
}

function seedLabel(seed) {
  return `#${seed}`;
}

function knockoutLiveBox(live) {
  const homeQuarters = live.quarters.map((q) => q[0]);
  const awayQuarters = live.quarters.map((q) => q[1]);
  return `
    <div class="score-line mini-live"><strong>Team</strong><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span>F</span></div>
    <div class="${teamRowClass(live.game.away.id, "score-line mini-live")}"><strong>${seedLabel(live.game.awaySeed)} ${live.game.away.name}</strong>${awayQuarters.map((x) => `<span>${x}</span>`).join("")}<span>${live.as}</span></div>
    <div class="${teamRowClass(live.game.home.id, "score-line mini-live")}"><strong>${seedLabel(live.game.homeSeed)} ${live.game.home.name}</strong>${homeQuarters.map((x) => `<span>${x}</span>`).join("")}<span>${live.hs}</span></div>
    <div class="live-note">Live playoff game: ${live.index}/${live.events.length} scoring plays</div>
  `;
}

function renderWorlds() {
  const worldsButton = qs("#run-worlds");
  const nextSeasonButton = qs("#next-season");
  const previewRoster = state.worlds ? state.worlds.usaRoster : state.playoffsDone ? makeTeamUSARoster() : [];
  if (state.playoffsDone) initializeWorlds();
  const nextGame = state.worlds && !state.worldsDone ? nextTeamUSAGame() : null;
  const remainingGame = state.worlds && !state.worldsDone ? nextWorldGame() : null;
  worldsButton.disabled = !state.playoffsDone || state.worldsDone || !!state.worldsLive;
  nextSeasonButton.classList.toggle("hidden", !state.worldsDone);
  nextSeasonButton.textContent = state.worldsDone && needsFinalOwnerReview() ? "Owner Review" : "Continue";
  if (state.worldsDone) {
    worldsButton.textContent = "Worlds Complete";
  } else if (state.worldsLive) {
    worldsButton.textContent = "Worlds Game Live";
  } else if (nextGame) {
    worldsButton.textContent = `Sim ${seedLabel(nextGame.homeSeed)} vs ${seedLabel(nextGame.awaySeed)}`;
  } else if (remainingGame) {
    worldsButton.textContent = `Sim rest of ${formatRoundNumber(state.worlds)}`;
  } else if (state.worlds) {
    worldsButton.textContent = "Next Worlds Round Ready";
  } else {
    worldsButton.textContent = "Sim First Worlds Game";
  }
  if (!state.playoffsDone) {
    qs("#worlds").innerHTML = `<div class="muted">Run the playoffs first.</div>`;
    return;
  }
  if (!state.worlds) {
    qs("#worlds").innerHTML = teamUSARosterHtml(previewRoster) + `<div class="muted">Worlds is ready after playoffs. Team USA is selected from the best season performers.</div>`;
    return;
  }
  qs("#worlds").innerHTML = `
    ${teamUSARosterHtml(previewRoster)}
    ${state.worldsLive ? `<div class="scoreboard worlds-live">${worldsLiveBox(state.worldsLive)}</div>` : ""}
    <div class="bracket">
      ${state.worlds.bracket.map((round) => `
        <div class="bracket-round">
          <strong>${round.name}</strong>
          ${round.games.map((game) => `
            <div class="bracket-game">
              <div class="${worldTeamClass(game.home, "bracket-team")}">
                <span>${seedLabel(game.homeSeed)} ${game.home.name}</span><strong>${game.played ? game.homeScore : "-"}</strong>
              </div>
              <div class="${worldTeamClass(game.away, "bracket-team")}">
                <span>${seedLabel(game.awaySeed)} ${game.away.name}</span><strong>${game.played ? game.awayScore : "-"}</strong>
              </div>
              <span class="muted">${game.played ? `Winner: ${game.winner}` : "Elimination matchup set"}</span>
            </div>
          `).join("")}
        </div>
      `).join("")}
    </div>
    ${state.worlds.champion ? `<div class="${worldTeamClass(state.worlds.champion, "row champion-row")}"><span>World Champion</span><strong>${state.worlds.champion.name}</strong></div>` : `<div class="muted">Next Worlds stage is ready.</div>`}
  `;
}

function worldsLiveBox(live) {
  const homeQuarters = live.quarters.map((q) => q[0]);
  const awayQuarters = live.quarters.map((q) => q[1]);
  return `
    <div class="score-line mini-live"><strong>Team</strong><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span>F</span></div>
    <div class="${worldTeamClass(live.game.away, "score-line mini-live")}"><strong>${seedLabel(live.game.awaySeed)} ${live.game.away.name}</strong>${awayQuarters.map((x) => `<span>${x}</span>`).join("")}<span>${live.as}</span></div>
    <div class="${worldTeamClass(live.game.home, "score-line mini-live")}"><strong>${seedLabel(live.game.homeSeed)} ${live.game.home.name}</strong>${homeQuarters.map((x) => `<span>${x}</span>`).join("")}<span>${live.hs}</span></div>
    <div class="live-note">Live Worlds game: ${live.index}/${live.events.length} scoring plays</div>
  `;
}

function setTab(tab) {
  if (!tabAllowed(tab)) {
    showLockedTab(tab);
    return;
  }
  qsa(".tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
  qsa(".tab-view").forEach((view) => view.classList.toggle("active", view.id === `${tab}-view`));
}

let pendingConfirm = null;

function confirmAction(title, message, onContinue, cancelText = "Cancel") {
  pendingConfirm = onContinue;
  qs("#confirm-title").textContent = title;
  qs("#confirm-message").textContent = message;
  qs("#confirm-cancel").textContent = cancelText;
  qs("#confirm-continue").textContent = "Continue";
  qs("#confirm-modal").classList.remove("hidden");
}

function closeConfirm() {
  pendingConfirm = null;
  qs("#confirm-modal").classList.add("hidden");
}

function continueConfirm() {
  const next = pendingConfirm;
  closeConfirm();
  if (next) next();
}

function showTradeToast(message) {
  qs("#toast-title").textContent = "Trade request";
  qs("#toast-message").textContent = message;
  qs("#trade-toast").classList.remove("hidden");
}

function hideTradeToast() {
  qs("#trade-toast").classList.add("hidden");
}

function showEmailToast(email) {
  qs("#email-toast-title").textContent = email.subject;
  qs("#email-toast-message").textContent = `${email.from}: ${email.body}`;
  qs("#email-toast").classList.remove("hidden");
}

function hideEmailToast() {
  qs("#email-toast").classList.add("hidden");
}

function showNewsToast(story) {
  qs("#news-toast-title").textContent = story.title;
  qs("#news-toast-message").textContent = story.body;
  qs("#news-toast").classList.remove("hidden");
}

function hideNewsToast() {
  qs("#news-toast").classList.add("hidden");
}

function loadYouTubeSong(songKey) {
  const song = youtubeSongs[songKey] || youtubeSongs["stolen-dance"];
  const frame = qs("#youtube-frame");
  const webOrigin = /^https?:$/.test(window.location.protocol) ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
  frame.src = `https://www.youtube-nocookie.com/embed/${song.id}?playsinline=1&rel=0${webOrigin}`;
  frame.title = `${song.name} by ${song.artist} on YouTube`;
}

function openYouTubePlayer() {
  if (music.on) stopCalmMusic();
  const player = qs("#youtube-player");
  player.classList.remove("hidden");
  loadYouTubeSong(qs("#youtube-select").value);
}

function closeYouTubePlayer() {
  const player = qs("#youtube-player");
  const frame = qs("#youtube-frame");
  if (frame) frame.src = "about:blank";
  if (player) player.classList.add("hidden");
}

function changeYouTubeSong(songKey) {
  if (music.on) stopCalmMusic();
  loadYouTubeSong(songKey);
}

function startCalmMusic() {
  if (music.on) return;
  closeYouTubePlayer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    renderMusicButton("Music unavailable");
    return;
  }
  if (!music.ctx) {
    music.ctx = new AudioCtx();
    music.master = music.ctx.createGain();
    music.master.gain.value = 0.0001;
    music.master.connect(music.ctx.destination);
    music.sfx = music.ctx.createGain();
    music.sfx.gain.value = 0.8;
    music.sfx.connect(music.ctx.destination);
  }
  music.on = true;
  renderMusicButton();
  const resume = music.ctx.state === "suspended" ? music.ctx.resume() : Promise.resolve();
  resume.then(() => {
    if (!music.on) return;
    music.master.gain.cancelScheduledValues(music.ctx.currentTime);
    music.master.gain.setTargetAtTime(currentSong().volume, music.ctx.currentTime, 0.12);
    startMusicPad();
    playMusicPing();
    scheduleMusicChord();
    scheduleMusicMelody();
    scheduleMusicBeat();
    if (music.timer) window.clearInterval(music.timer);
    if (music.melodyTimer) window.clearInterval(music.melodyTimer);
    if (music.beatTimer) window.clearInterval(music.beatTimer);
    music.timer = window.setInterval(scheduleMusicChord, currentSong().chordMs);
    music.melodyTimer = window.setInterval(scheduleMusicMelody, currentSong().melodyMs);
    music.beatTimer = window.setInterval(scheduleMusicBeat, currentSong().beatMs);
  }).catch(() => {
    music.on = false;
    renderMusicButton("Music blocked");
  });
}

function soundCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!music.ctx) {
    music.ctx = new AudioCtx();
    music.master = music.ctx.createGain();
    music.master.gain.value = music.on ? currentSong().volume : 0.7;
    music.master.connect(music.ctx.destination);
    music.sfx = music.ctx.createGain();
    music.sfx.gain.value = 0.8;
    music.sfx.connect(music.ctx.destination);
  }
  if (!music.sfx) {
    music.sfx = music.ctx.createGain();
    music.sfx.gain.value = 0.8;
    music.sfx.connect(music.ctx.destination);
  }
  if (music.ctx.state === "suspended") music.ctx.resume().catch(() => {});
  return music.ctx;
}

function playUiSound(type) {
  const ctx = soundCtx();
  if (!ctx || !music.sfx) return;
  const now = ctx.currentTime;
  const patterns = {
    draft: [440, 660, 880],
    trade: [392, 523.25, 659.25],
    champion: [523.25, 659.25, 783.99, 1046.5]
  };
  const notes = patterns[type] || [440];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + index * 0.07;
    osc.type = type === "champion" ? "triangle" : "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(type === "champion" ? 0.12 : 0.075, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.connect(gain);
    gain.connect(music.sfx);
    osc.start(start);
    osc.stop(start + 0.25);
    trackMusicVoice(osc, gain);
  });
}

function stopCalmMusic() {
  music.on = false;
  if (music.timer) window.clearInterval(music.timer);
  if (music.melodyTimer) window.clearInterval(music.melodyTimer);
  if (music.beatTimer) window.clearInterval(music.beatTimer);
  music.timer = null;
  music.melodyTimer = null;
  music.beatTimer = null;
  stopMusicPad();
  stopMusicVoices();
  if (music.master) {
    music.master.gain.cancelScheduledValues(music.ctx.currentTime);
    music.master.gain.setValueAtTime(0.0001, music.ctx.currentTime);
  }
  renderMusicButton();
}

function toggleCalmMusic() {
  if (music.on) stopCalmMusic();
  else startCalmMusic();
}

function scheduleMusicChord() {
  if (!music.on || !music.ctx || !music.master) return;
  const chords = currentSong().chords;
  const chord = chords[music.chordStep % chords.length];
  music.chordStep += 1;
  const now = music.ctx.currentTime;
  music.master.gain.setTargetAtTime(currentSong().volume, now, 0.35);
  chord.forEach((freq, index) => {
    const osc = music.ctx.createOscillator();
    const gain = music.ctx.createGain();
    osc.type = currentSong().chordWave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(currentSong().chordGain * (index === 1 ? 1 : 0.82), now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(3.2, currentSong().chordMs / 1000 - 0.12));
    osc.connect(gain);
    gain.connect(music.master);
    osc.start(now);
    osc.stop(now + 3.2);
    trackMusicVoice(osc, gain);
  });
}

function startMusicPad() {
  if (music.pad.length) return;
  const now = music.ctx.currentTime;
  currentSong().pad.forEach((freq, index) => {
    const osc = music.ctx.createOscillator();
    const gain = music.ctx.createGain();
    osc.type = currentSong().padWave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(currentSong().padGain[index] || 0.025, now + 0.7);
    osc.connect(gain);
    gain.connect(music.master);
    osc.start(now);
    music.pad.push({ osc, gain });
  });
}

function stopMusicPad() {
  if (!music.ctx) return;
  const now = music.ctx.currentTime;
  music.pad.forEach(({ osc, gain }) => {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.0001, now);
    try {
      osc.stop(now + 0.02);
    } catch (error) {}
  });
  music.pad = [];
}

function playMusicPing() {
  if (!music.ctx || !music.master) return;
  const now = music.ctx.currentTime;
  currentSong().melody.slice(0, 2).forEach((freq, index) => {
    const osc = music.ctx.createOscillator();
    const gain = music.ctx.createGain();
    osc.type = currentSong().melodyWave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(currentSong().melodyGain * 1.5, now + 0.03 + index * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + index * 0.08);
    osc.connect(gain);
    gain.connect(music.master);
    osc.start(now);
    osc.stop(now + 0.7);
    trackMusicVoice(osc, gain);
  });
}

function scheduleMusicMelody() {
  if (!music.on || !music.ctx || !music.master) return;
  const notes = currentSong().melody;
  const now = music.ctx.currentTime;
  const freq = notes[music.melodyStep % notes.length];
  music.melodyStep += 1;
  if (!freq) return;
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = currentSong().melodyWave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(currentSong().melodyGain, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(1.1, currentSong().melodyMs / 1000 - 0.05));
  osc.connect(gain);
  gain.connect(music.master);
  osc.start(now);
  osc.stop(now + 1);
  trackMusicVoice(osc, gain);
}

function scheduleMusicBeat() {
  if (!music.on || !music.ctx || !music.master) return;
  const song = currentSong();
  const now = music.ctx.currentTime;
  const beatIndex = music.beatStep % 16;
  music.beatStep += 1;
  if (song.beat === "spark") {
    playSpark(now, song, beatIndex);
    return;
  }
  const patterns = {
    soft: { kick: [0, 8], snare: [], hat: [4, 12], bass: [0, 8] },
    electro: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], bass: [0, 4, 8, 12] },
    click: { kick: [0, 8], snare: [], hat: [3, 7, 11, 15], bass: [0, 8] },
    stadium: { kick: [0, 3, 8, 11], snare: [4, 12], hat: [2, 6, 10, 14], bass: [0, 8] },
    rap: { kick: [0, 3, 7, 10, 14], snare: [4, 12], hat: [2, 6, 8, 11, 15], bass: [0, 3, 7, 10, 14] },
    phonk: { kick: [0, 2, 5, 8, 11, 14], snare: [4, 12], hat: [1, 3, 6, 9, 13, 15], bass: [0, 5, 8, 11, 14] },
    hardcore: { kick: [0, 2, 4, 6, 8, 10, 12, 14], snare: [4, 7, 12, 15], hat: [1, 3, 5, 7, 9, 11, 13, 15], bass: [0, 4, 8, 12] },
    trap: { kick: [0, 3, 7, 10, 15], snare: [4, 12], hat: [2, 6, 8, 9, 10, 14, 15], bass: [0, 3, 7, 10, 15] },
    lofi: { kick: [0, 7, 10], snare: [4, 12], hat: [2, 6, 10, 14], bass: [0, 7, 10] },
    drill: { kick: [0, 6, 9, 11, 15], snare: [4, 12], hat: [2, 3, 7, 8, 10, 14, 15], bass: [0, 6, 9, 11, 15] }
  };
  const pattern = patterns[song.beat] || patterns.soft;
  const swing = song.beat === "lofi" && beatIndex % 2 ? 0.07 : 0;
  const hitTime = now + swing;
  if (pattern.kick.includes(beatIndex)) playKick(hitTime, song);
  if (pattern.snare.includes(beatIndex)) playSnare(hitTime, song);
  if (pattern.hat.includes(beatIndex)) playHat(hitTime, song, song.beat === "lofi" ? 0.022 : 0.045);
  if (pattern.bass.includes(beatIndex)) playBass(hitTime, song);
  if (song.beat === "phonk" && [1, 5, 9, 13].includes(beatIndex)) playCowbell(hitTime, beatIndex);
  if (song.beat === "click" && [0, 4, 8, 12].includes(beatIndex)) playMusicClick(hitTime, beatIndex === 0);
}

function playSpark(now, song, beatIndex) {
  const notes = [1046.5, 1318.51, 1567.98, 1975.53];
  notes.slice(0, beatIndex % 2 ? 2 : 3).forEach((freq, index) => {
    const osc = music.ctx.createOscillator();
    const gain = music.ctx.createGain();
    osc.type = index === 0 ? "triangle" : "sine";
    osc.frequency.value = freq;
    const start = now + index * 0.055;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    osc.connect(gain);
    gain.connect(music.master);
    osc.start(start);
    osc.stop(start + 0.28);
    trackMusicVoice(osc, gain);
  });
  if (beatIndex % 4 === 0) playBass(now, song);
}

function playKick(now, song) {
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(song.beat === "hardcore" ? 95 : 72, now);
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.16);
  gain.gain.setValueAtTime(song.beat === "hardcore" ? 0.35 : 0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.connect(gain);
  gain.connect(music.master);
  osc.start(now);
  osc.stop(now + 0.24);
  trackMusicVoice(osc, gain);
}

function playSnare(now, song) {
  const source = music.ctx.createBufferSource();
  const gain = music.ctx.createGain();
  const filter = music.ctx.createBiquadFilter();
  source.buffer = getMusicNoiseBuffer();
  filter.type = "bandpass";
  filter.frequency.value = song.beat === "lofi" ? 1100 : 1800;
  filter.Q.value = 0.7;
  gain.gain.setValueAtTime(song.beat === "hardcore" ? 0.16 : 0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (song.beat === "lofi" ? 0.18 : 0.11));
  source.connect(filter);
  filter.connect(gain);
  gain.connect(music.master);
  source.start(now);
  source.stop(now + 0.2);
  trackMusicVoice(source, gain);
}

function playHat(now, song, level = 0.055) {
  const source = music.ctx.createBufferSource();
  const gain = music.ctx.createGain();
  const filter = music.ctx.createBiquadFilter();
  source.buffer = getMusicNoiseBuffer();
  filter.type = "highpass";
  filter.frequency.value = song.beat === "lofi" ? 4200 : 6500;
  gain.gain.setValueAtTime(level, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(music.master);
  source.start(now);
  source.stop(now + 0.065);
  trackMusicVoice(source, gain);
}

function playBass(now, song) {
  const freq = song.bass[music.bassStep % song.bass.length];
  music.bassStep += 1;
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = song.beat === "lofi" ? "sine" : "sawtooth";
  osc.frequency.value = freq;
  if (song.beat === "drill") osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.72), now + 0.32);
  gain.gain.setValueAtTime(song.beat === "soft" ? 0.035 : 0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(0.5, song.beatMs / 1000));
  osc.connect(gain);
  gain.connect(music.master);
  osc.start(now);
  osc.stop(now + Math.min(0.55, song.beatMs / 1000 + 0.05));
  trackMusicVoice(osc, gain);
}

function getMusicNoiseBuffer() {
  if (music.noiseBuffer) return music.noiseBuffer;
  const length = Math.floor(music.ctx.sampleRate * 0.25);
  const buffer = music.ctx.createBuffer(1, length, music.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  music.noiseBuffer = buffer;
  return buffer;
}

function playCowbell(now, beatIndex) {
  [540, 800].forEach((freq, index) => {
    const osc = music.ctx.createOscillator();
    const gain = music.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq * (beatIndex % 8 === 5 ? 0.88 : 1);
    gain.gain.setValueAtTime(index === 0 ? 0.045 : 0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(music.master);
    osc.start(now);
    osc.stop(now + 0.15);
    trackMusicVoice(osc, gain);
  });
}

function playMusicClick(now, accent) {
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = accent ? 1200 : 820;
  gain.gain.setValueAtTime(accent ? 0.055 : 0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  osc.connect(gain);
  gain.connect(music.master);
  osc.start(now);
  osc.stop(now + 0.05);
  trackMusicVoice(osc, gain);
}

function trackMusicVoice(osc, gain) {
  music.voices.push({ osc, gain });
  osc.onended = () => {
    music.voices = music.voices.filter((voice) => voice.osc !== osc);
  };
}

function stopMusicVoices() {
  if (!music.ctx) return;
  const now = music.ctx.currentTime;
  music.voices.forEach(({ osc, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0001, now);
      osc.stop(now + 0.02);
    } catch (error) {}
  });
  music.voices = [];
}

function currentSong() {
  return musicSongs[music.song] || musicSongs.calm;
}

function changeMusicSong(songId) {
  music.song = musicSongs[songId] ? songId : "calm";
  resetMusicSteps();
  if (music.on) {
    if (music.timer) window.clearInterval(music.timer);
    if (music.melodyTimer) window.clearInterval(music.melodyTimer);
    if (music.beatTimer) window.clearInterval(music.beatTimer);
    stopMusicVoices();
    stopMusicPad();
    startMusicPad();
    playMusicPing();
    scheduleMusicChord();
    scheduleMusicMelody();
    scheduleMusicBeat();
    music.timer = window.setInterval(scheduleMusicChord, currentSong().chordMs);
    music.melodyTimer = window.setInterval(scheduleMusicMelody, currentSong().melodyMs);
    music.beatTimer = window.setInterval(scheduleMusicBeat, currentSong().beatMs);
  }
  renderMusicButton();
}

function resetMusicSteps() {
  music.chordStep = 0;
  music.melodyStep = 0;
  music.beatStep = 0;
  music.bassStep = 0;
}

function renderMusicButton(label) {
  const btn = qs("#music-toggle");
  if (!btn) return;
  btn.textContent = label || (music.on ? `Turn Music Off: ${currentSong().name}` : "Turn Music On");
  btn.classList.toggle("playing", music.on);
}

function applyTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light-mode", light);
  document.body.classList.toggle("dark-mode", !light);
  localStorage.setItem(themeStorageKey, light ? "light" : "dark");
  renderThemeButton();
}

function toggleTheme() {
  applyTheme(document.body.classList.contains("light-mode") ? "dark" : "light");
}

function renderThemeButton() {
  const btn = qs("#theme-toggle");
  if (!btn) return;
  btn.textContent = document.body.classList.contains("light-mode") ? "Dark Mode" : "Light Mode";
  btn.title = "Switch dark or light mode";
}

function teamConfettiColors(team) {
  return [team && team.color ? team.color : "#20ff9f", "#ffffff", "#00e5ff", "#ff2bd6"];
}

function worldConfettiColors(team) {
  if (team && team.name === "Team USA") return ["#c73562", "#ffffff", "#296fba", "#00e5ff"];
  return ["#20ff9f", "#ffffff", "#d99a29", "#00e5ff"];
}

function showCelebration(kicker, title, message, tone = "", confettiColors = null) {
  if (kicker.includes("Champions")) playUiSound("champion");
  qs("#celebration-kicker").textContent = kicker;
  qs("#celebration-title").textContent = title;
  qs("#celebration-message").textContent = message;
  qs("#celebration").classList.toggle("danger", tone === "danger");
  qs("#celebration").dataset.next = tone === "awards" ? "awards" : tone === "owner-review" ? "owner-review" : "";
  qs("#confetti").innerHTML = tone === "danger" ? "" : Array.from({ length: 44 }, (_, index) => {
    const colors = confettiColors || ["#20ff9f", "#ff2bd6", "#00e5ff", "#d99a29", "#ffffff"];
    return `<span style="left:${(index * 13) % 100}%; background:${colors[index % colors.length]}; animation-delay:${(index % 9) * 0.12}s"></span>`;
  }).join("");
  qs("#celebration").classList.remove("hidden");
}

function hideCelebration() {
  const next = qs("#celebration").dataset.next;
  qs("#celebration").classList.add("hidden");
  qs("#celebration").dataset.next = "";
  if (next === "awards") setTab("awards");
  if (next === "owner-review") evaluateOwnerGoal(true);
}

function drawField() {
  const canvas = qs("#field-art");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.fillStyle = "#030303";
  ctx.fillRect(0, 0, w, h);
  for (let x = -60; x < w + 60; x += 80) {
    ctx.strokeStyle = "rgba(0,229,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 150, h);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(32,255,159,0.78)";
  ctx.lineWidth = 3;
  ctx.strokeRect(w * 0.08, h * 0.16, w * 0.84, h * 0.66);
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.18, 0, Math.PI * 2);
  ctx.stroke();
  [["#20ff9f", 0.18, 0.68], ["#ff2bd6", 0.72, 0.35], ["#00e5ff", 0.55, 0.72]].forEach(([c, x, y]) => {
    ctx.fillStyle = c;
    ctx.shadowColor = c;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(w * x, h * y, 18, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

qs("#get-started").addEventListener("click", () => {
  startCalmMusic();
  showRulesScreen();
});
qs("#continue-to-teams").addEventListener("click", showTeamSelect);
qs("#music-toggle").addEventListener("click", toggleCalmMusic);
qs("#theme-toggle").addEventListener("click", toggleTheme);
qs("#music-select").addEventListener("change", (event) => changeMusicSong(event.target.value));
qs("#youtube-toggle").addEventListener("click", openYouTubePlayer);
qs("#youtube-close").addEventListener("click", closeYouTubePlayer);
qs("#youtube-select").addEventListener("change", (event) => changeYouTubeSong(event.target.value));
qs("#run-lottery").addEventListener("click", () => confirmAction(
  "Run Lottery",
  "Continue and reveal the full weighted draft lottery order?",
  runLotteryMachine
));
qs("#confirm-cuts").addEventListener("click", () => confirmAction(
  "Confirm Roster",
  "Continue with these 17 players and release everyone else?",
  confirmRosterCuts
));
qs("#auto-lineup").addEventListener("click", autoSetLineup);
qs("#simulate-week").addEventListener("click", () => confirmAction(
  "Sim Week",
  `Continue and simulate Week ${state.week}?`,
  simulateWeek
));
qs("#simulate-season").addEventListener("click", () => confirmAction(
  !state.allStarDone && state.week <= 10 ? "Sim to All-Star" : "Sim Season",
  !state.allStarDone && state.week <= 10 ? "Continue and simulate to All-Star Weekend?" : "Continue and simulate the rest of the regular season?",
  simulateSeason
));
qs("#run-playoffs").addEventListener("click", runPlayoffs);
qs("#continue-playoffs").addEventListener("click", () => setTab("playoffs"));
qs("#run-worlds").addEventListener("click", runWorldsStage);
qs("#next-season").addEventListener("click", () => confirmAction(
  "Next Season",
  "Continue to the next season and keep your roster?",
  continueToNextSeason
));
qs("#ask-draft-advice").addEventListener("click", () => addAdvice("draft"));
qs("#ask-trade-advice").addEventListener("click", () => addAdvice("trade"));
qs("#refresh-advice").addEventListener("click", () => addAdvice("general"));
qs("#refresh-offers").addEventListener("click", () => {
  confirmAction("Refresh Trade Offers", "Continue and ask other teams for new trade requests?", () => {
    generateOffers(true);
    renderAll();
  });
});
qs("#new-game").addEventListener("click", () => confirmAction(
  "Reset Game",
  "Continue and start a new PLS save?",
  () => {
    resetGame();
    saveAccountProgress();
  }
));
qs("#confirm-cancel").addEventListener("click", closeConfirm);
qs("#confirm-continue").addEventListener("click", continueConfirm);
qs("#scout-close").addEventListener("click", closeScoutCard);
qs("#toast-close").addEventListener("click", hideTradeToast);
qs("#toast-view").addEventListener("click", () => {
  hideTradeToast();
  setTab("trades");
});
qs("#toast-decline").addEventListener("click", () => {
  if (state.latestToastOffer !== null) declineOffer(state.latestToastOffer);
  state.latestToastOffer = null;
  hideTradeToast();
});
qs("#email-toast-close").addEventListener("click", hideEmailToast);
qs("#email-toast-view").addEventListener("click", () => {
  hideEmailToast();
  setTab("advice");
});
qs("#news-toast-close").addEventListener("click", hideNewsToast);
qs("#news-toast-view").addEventListener("click", () => {
  hideNewsToast();
  setTab("news");
});
qs("#open-interview").addEventListener("click", openInterviewModal);
qs("#interview-close").addEventListener("click", closeInterviewModal);
qs("#interview-back").addEventListener("click", backToInterviewPlayers);
qs("#interview-player-list").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-interview-player]");
  if (btn) startPlayerInterview(btn.dataset.interviewPlayer);
});
qs("#send-interview").addEventListener("click", sendInterviewQuestion);
qs("#interview-question").addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendInterviewQuestion();
});
qs("#show-signup").addEventListener("click", () => setAccountMode("signup"));
qs("#show-login").addEventListener("click", () => setAccountMode("login"));
qs("#account-submit").addEventListener("click", submitAccountForm);
qs("#continue-save").addEventListener("click", continueSavedAccount);
qs("#start-over-save").addEventListener("click", startAccountOver);
qsa("#account-modal input").forEach((input) => input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitAccountForm();
}));
function handleOwnerConsoleClick(event) {
  const actionButton = event.target.closest("[data-owner-action]");
  const commandButton = event.target.closest("[data-owner-command]");
  const fillButton = event.target.closest("[data-owner-fill]");
  if (fillButton) {
    const input = qs("#owner-ban-username");
    if (input) input.value = fillButton.dataset.ownerFill;
  }
  if (actionButton && actionButton.dataset.ownerAction === "ban") ownerBanAccount();
  if (actionButton && actionButton.dataset.ownerAction === "unban") ownerUnbanAccount();
  if (actionButton && actionButton.dataset.ownerAction === "set-draft-budget") ownerSetBudget("draft");
  if (actionButton && actionButton.dataset.ownerAction === "set-trade-budget") ownerSetBudget("trade");
  if (commandButton) runOwnerCommand(commandButton.dataset.ownerCommand);
}
qs("#owner-console").addEventListener("click", handleOwnerConsoleClick);
qs("#owner-console-start").addEventListener("click", handleOwnerConsoleClick);
qs("#owner-console-main").addEventListener("click", handleOwnerConsoleClick);
qs("#celebration-close").addEventListener("click", hideCelebration);
qsa(".tab").forEach((btn) => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
window.addEventListener("resize", drawField);

function showStartupError(error) {
  const grid = document.querySelector("#teams-grid");
  if (!grid) return;
  grid.innerHTML = `
    <div class="load-note">
      The game script did not start in this browser. Try Chrome, Safari, or Edge and open
      index.html directly. Error: ${error && error.message ? error.message : error}
    </div>
  `;
}

try {
  normalizeOwnerAccounts();
  applyTheme(localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark");
  drawField();
  setAccountMode("signup");
} catch (error) {
  showStartupError(error);
}
