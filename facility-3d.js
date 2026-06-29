import * as THREE from "./vendor/three.module.js";

const overlay = document.querySelector("#facility");
const host = document.querySelector("#facility-3d");
const locationLabel = document.querySelector("#facility-location");
const teamLabel = document.querySelector("#facility-team");
const interactButton = document.querySelector("#facility-interact");
const tourPanel = document.querySelector("#facility-tour");
const tourStep = document.querySelector("#facility-tour-step");
const tourTitle = document.querySelector("#facility-tour-title");
const tourCopy = document.querySelector("#facility-tour-copy");
const computerOverlay = document.querySelector("#facility-computer");
const moveButtons = [...document.querySelectorAll("[data-facility-move]")];

let renderer;
let scene;
let camera;
let clock;
let doorPivot;
let doorHandle;
let hand;
let guide;
let buildingSign;
let leaderboardScreen;
let playoffScreen;
let active = false;
let introActive = false;
let introTime = 0;
let tourActive = false;
let tourIndex = 0;
let tourTime = 0;
let yaw = 0;
let dragging = false;
let dragX = 0;
let nearestInteraction = null;
let currentConfig = {};
let accentColor = new THREE.Color("#20ff9f");
const keys = { forward: false, backward: false, left: false, right: false };
const interactions = [];
const animatedPeople = [];

const tourStops = [
  { position: [-4.8, 1.66, 10.2], guide: [-4.8, 0, 7.4], title: "Boardroom", copy: "Your owner, cap director, scouts, and assistant GM meet here. The computer at your seat opens the draft room." },
  { position: [0, 1.66, 3.1], guide: [0, 0, 0.4], title: "League Wall", copy: "The hallway screens hold standings, league leaders, and the global records of real GM accounts." },
  { position: [5.9, 1.66, 0], guide: [6.2, 0, -3], title: "Trade Office", copy: "Walk into the trade office for offers, opposite advice, and every roster negotiation." },
  { position: [7.2, 1.66, -8], guide: [7.2, 0, -11], title: "Field Control", copy: "The glass tunnel overlooks your home field. This desk runs the season and live game simulations." },
  { position: [-6.4, 1.66, -8.2], guide: [-6.4, 0, -11.2], title: "Playoff Suite", copy: "The bracket room activates after the regular season and leads directly into every playoff broadcast." },
  { position: [0, 1.66, -13.5], guide: [0, 0, -16.2], title: "Trophy Gallery", copy: "Championships, awards, and the top 25 retired players live in the Hall of Fame gallery." },
  { position: [5.8, 1.66, 9.7], guide: [5.8, 0, 7.1], title: "Your GM Office", copy: "This is your office: a field view, working computer, team equipment, and a newspaper you can pick up." },
  { position: [-4.8, 1.66, 9.9], guide: [-4.8, 0, 7.2], title: "Tour Complete", copy: "Use WASD or the arrow controls to explore. Walk near an object and press E or the on-screen button." }
];

function material(color, roughness = 0.65, metalness = 0.03) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(size, color, position, options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    options.material || material(color, options.roughness ?? 0.65, options.metalness ?? 0.03)
  );
  mesh.position.set(...position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  mesh.castShadow = options.cast !== false;
  mesh.receiveShadow = options.receive !== false;
  scene.add(mesh);
  return mesh;
}

function init() {
  if (renderer || !host) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fc7dc);
  scene.fog = new THREE.Fog(0x9fc7dc, 45, 85);
  camera = new THREE.PerspectiveCamera(57, innerWidth / innerHeight, 0.035, 110);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  host.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  buildLights();
  buildExterior();
  buildInterior();
  buildHand();
  bindControls();
  addEventListener("resize", resize);
  animate();
}

function buildLights() {
  scene.add(new THREE.HemisphereLight(0xe3f3ff, 0x403126, 2.35));
  const sun = new THREE.DirectionalLight(0xfff0d2, 4.2);
  sun.position.set(-16, 24, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);
  [[-6, 4, 7], [6, 4, 7], [0, 4, 0], [-6, 4, -8], [6, 4, -8], [0, 4, -16]].forEach(([x, y, z], index) => {
    const light = new THREE.PointLight(index % 2 ? 0xcce8ff : 0xffd8a8, 30, 12, 1.7);
    light.position.set(x, y, z);
    scene.add(light);
  });
}

function buildExterior() {
  const grass = box([70, 0.16, 70], 0x2d7544, [0, -0.13, 12], { roughness: 0.92, cast: false });
  grass.receiveShadow = true;
  box([8, 0.08, 18], 0x9ca2a5, [0, 0, 22], { roughness: 0.9, cast: false });
  const facade = material(0x28333b, 0.55, 0.08);
  box([24, 5.4, 0.35], 0, [0, 2.7, 14], { material: facade });
  box([24, 1.3, 1.5], 0x202a31, [0, 5.7, 13.6], { material: facade });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x7bb7d4, transparent: true, opacity: 0.36, roughness: 0.08, transmission: 0.25 });
  [-8.8, -6.2, 6.2, 8.8].forEach((x) => box([2.05, 3.55, 0.08], 0, [x, 2.55, 14.22], { material: glass, cast: false }));
  buildingSign = box([8.4, 1.05, 0.12], 0, [0, 5.2, 14.44], { material: makeSignMaterial(currentConfig.teamName || "TEAM FACILITY", currentConfig.accent || "#20ff9f"), cast: false });

  doorPivot = new THREE.Group();
  doorPivot.position.set(-1.5, 0, 14.28);
  scene.add(doorPivot);
  const door = new THREE.Group();
  door.position.x = 1.5;
  doorPivot.add(door);
  const frame = material(0x171d22, 0.28, 0.72);
  const addDoorPart = (geometry, partMaterial, position) => {
    const part = new THREE.Mesh(geometry, partMaterial);
    part.position.set(...position);
    part.castShadow = true;
    door.add(part);
    return part;
  };
  addDoorPart(new THREE.BoxGeometry(3, 0.18, 0.16), frame, [0, 4.65, 0]);
  addDoorPart(new THREE.BoxGeometry(3, 0.18, 0.16), frame, [0, 0.1, 0]);
  addDoorPart(new THREE.BoxGeometry(0.18, 4.7, 0.16), frame, [-1.42, 2.36, 0]);
  addDoorPart(new THREE.BoxGeometry(0.18, 4.7, 0.16), frame, [1.42, 2.36, 0]);
  addDoorPart(new THREE.BoxGeometry(2.65, 4.35, 0.06), glass, [0, 2.36, 0]);
  doorHandle = addDoorPart(new THREE.CylinderGeometry(0.055, 0.055, 0.72, 14), material(0xd6bd83, 0.18, 0.88), [1.03, 1.4, 0.15]);
}

function buildInterior() {
  const floor = box([23.5, 0.2, 34], 0x6a442c, [0, 0, -2.7], { roughness: 0.72 });
  floor.receiveShadow = true;
  box([23.5, 0.18, 34], 0x293139, [0, 5.2, -2.7], { cast: false });
  box([0.24, 5.2, 34], 0x35424a, [-11.75, 2.6, -2.7]);
  const fieldGlass = new THREE.MeshPhysicalMaterial({ color: 0x8bc8db, transparent: true, opacity: 0.22, roughness: 0.08, transmission: 0.36 });
  box([0.16, 5.2, 34], 0, [11.75, 2.6, -2.7], { material: fieldGlass, cast: false });
  box([23.5, 5.2, 0.24], 0x303b43, [0, 2.6, -19.7]);
  buildCeilingLights();
  buildField();
  buildBoardroom();
  buildGmOffice();
  buildLeagueWall();
  buildRosterRoom();
  buildTradeRoomDoor();
  buildFieldControl();
  buildPlayoffSuite();
  buildTrophyGallery();
  guide = createHuman(0x1e4867, 0xc88f69, "Jordan Wells | Assistant GM");
  guide.position.set(0, 0, 11.8);
  scene.add(guide);
}

function buildCeilingLights() {
  for (let z = 11; z >= -17; z -= 4.2) {
    [-7, 0, 7].forEach((x) => {
      const panel = box([2.5, 0.05, 0.65], 0xffffff, [x, 5.08, z], { cast: false });
      panel.material.emissive = new THREE.Color(0xffffff);
      panel.material.emissiveIntensity = 1.2;
    });
  }
}

function buildField() {
  const turf = box([22, 0.08, 48], 0x2b8653, [23, -0.02, -3], { cast: false });
  turf.receiveShadow = true;
  for (let z = -23; z <= 17; z += 4) box([20, 0.015, 0.05], 0xffffff, [23, 0.03, z], { cast: false });
  box([0.05, 0.02, 45], 0xffffff, [23, 0.04, -3], { cast: false });
  [-18, 12].forEach((z) => buildGoal(23, z));
  for (let i = 0; i < 28; i += 1) {
    const stand = box([0.55, 0.65 + (i % 4) * 0.12, 0.55], [0x2a64a1, 0xd04a5a, 0xe1a73c][i % 3], [35 + Math.floor(i / 14) * 1.1, 0.35, -19 + (i % 14) * 2.6]);
    stand.rotation.y = -Math.PI / 2;
  }
}

function buildGoal(x, z) {
  const red = material(0xd8494f, 0.35, 0.5);
  const post = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.055, 9, 32, Math.PI), red);
  post.position.set(x, 1.25, z);
  post.rotation.set(0, 0, Math.PI);
  scene.add(post);
  [-1.25, 1.25].forEach((side) => box([0.08, 2.5, 0.08], 0xd8494f, [x + side, 1.25, z], { material: red }));
}

function buildBoardroom() {
  addZoneFloor(-5.7, 7.3, 9.4, 7.2, 0x233b4d);
  addRoomSign(-5.7, 11.6, "BOARDROOM + DRAFT");
  const wood = material(0x59341f, 0.42, 0.05);
  box([7.2, 0.24, 2.4], 0, [-5.7, 1.03, 7.2], { material: wood });
  box([0.3, 1, 2], 0, [-8.7, 0.5, 7.2], { material: wood });
  box([0.3, 1, 2], 0, [-2.7, 0.5, 7.2], { material: wood });
  const monitor = makeMonitor(-5.7, 1.85, 5.95, "DRAFT ROOM", currentConfig.accent || "#20ff9f");
  monitor.rotation.x = -0.1;
  interactions.push({ label: "Open Draft Computer", position: new THREE.Vector3(-5.7, 0, 8.8), action: "draft" });
  const roles = [
    [currentConfig.owner || "Team Owner", "Owner", -8.3, 7.2, 0x3a3030],
    ["Jordan Wells", "Assistant GM", -6.6, 7.2, 0x203f5d],
    ["Marcus Vale", "Cap Director", -4.7, 7.2, 0x243d61],
    ["Nia Brooks", "Head Scout", -3.1, 7.2, 0x553345]
  ];
  roles.forEach(([name, role, x, z, color], index) => {
    const person = createHuman(color, index % 2 ? 0xe0ad86 : 0xb77958, `${name} | ${role}`);
    person.position.set(x, 0, z + (index % 2 ? 1.65 : -1.65));
    person.rotation.y = index % 2 ? Math.PI : 0;
    scene.add(person);
    animatedPeople.push(person);
  });
}

function buildGmOffice() {
  addZoneFloor(6, 7.4, 9.2, 7, 0x394735);
  addRoomSign(6, 11.6, "GENERAL MANAGER OFFICE");
  const desk = material(0x5b351e, 0.42, 0.06);
  box([7.2, 0.24, 2.2], 0, [6, 1.05, 6.3], { material: desk });
  box([0.3, 1.05, 1.8], 0, [3.1, 0.52, 6.3], { material: desk });
  box([0.3, 1.05, 1.8], 0, [8.9, 0.52, 6.3], { material: desk });
  makeMonitor(7.3, 1.9, 5.65, "GM DESKTOP", "#55d8ff");
  interactions.push({ label: "Open GM Computer", position: new THREE.Vector3(7.2, 0, 5.1), action: "computer" });
  const paper = makeNewspaper(4.55, 1.2, 6.2);
  paper.rotation.y = 0.08;
  interactions.push({ label: "Pick Up Newspaper", position: new THREE.Vector3(4.55, 0, 5.35), action: "newspaper" });
  buildOfficeChair(6.2, 0, 8.1);
  buildEquipmentRack(9.9, 7.3);
}

function buildLeagueWall() {
  addZoneFloor(0, 0, 5.3, 5, 0x253541);
  const wall = box([8.5, 3.5, 0.3], 0x17242d, [0, 2.35, -2.2]);
  leaderboardScreen = box([7.8, 2.75, 0.06], 0xffffff, [0, 2.45, -2.02], { material: makeLeaderboardMaterial(), cast: false });
  interactions.push({ label: "View Global Leaderboard", position: new THREE.Vector3(0, 0, 0.2), action: "leaderboard" });
  interactions.push({ label: "Open Standings", position: new THREE.Vector3(-3.4, 0, -1.1), action: "league" });
  interactions.push({ label: "Open League Leaders", position: new THREE.Vector3(3.4, 0, -1.1), action: "leaders" });
  wall.receiveShadow = true;
}

function buildRosterRoom() {
  addZoneFloor(-6.2, -5.6, 8.5, 5.3, 0x443b2f);
  addRoomSign(-6.2, -2.65, "ROSTER + LINEUPS");
  [-8.8, -7.1, -5.4, -3.7].forEach((x, index) => {
    const locker = box([1.35, 3.1, 1], index % 2 ? 0x263b49 : 0x314c5b, [x, 1.55, -7.2]);
    box([1, 0.08, 0.8], 0x11191f, [x, 1.15, -6.65]);
    locker.material.color.lerp(accentColor, 0.1);
  });
  makeMonitor(-6.2, 1.85, -4.25, "LINEUP BOARD", "#f0b84b");
  interactions.push({ label: "Set Lineup", position: new THREE.Vector3(-6.2, 0, -3.7), action: "lineup" });
  interactions.push({ label: "Manage Roster Cuts", position: new THREE.Vector3(-8.6, 0, -5.2), action: "cuts" });
}

function buildTradeRoomDoor() {
  addZoneFloor(6.2, -5.6, 8.5, 5.3, 0x343b42);
  addRoomSign(6.2, -2.65, "TRADE OFFICE");
  box([7.6, 3.6, 0.25], 0x253039, [6.2, 1.8, -7.8]);
  box([2.5, 3.2, 0.18], 0x4b2c1d, [6.2, 1.6, -7.62]);
  box([0.62, 0.2, 0.1], 0xd1b46e, [7.05, 1.6, -7.48], { metalness: 0.8 });
  interactions.push({ label: "Enter Trade Office", position: new THREE.Vector3(6.2, 0, -5.45), action: "trades" });
}

function buildFieldControl() {
  addZoneFloor(6.2, -11.7, 8.5, 5.2, 0x294538);
  addRoomSign(6.2, -9.05, "FIELD CONTROL");
  const consoleDesk = box([6.6, 1.05, 1.15], 0x25333c, [6.2, 0.55, -13.1]);
  consoleDesk.material.color.lerp(accentColor, 0.08);
  [-1.9, 0, 1.9].forEach((offset, index) => makeMonitor(6.2 + offset, 1.55, -13.55, index === 1 ? "LIVE GAME" : index ? "SCHEDULE" : "TEAM DATA", index === 1 ? "#20ff9f" : "#55bfff"));
  interactions.push({ label: "Run Season", position: new THREE.Vector3(6.2, 0, -11.5), action: "season" });
}

function buildPlayoffSuite() {
  addZoneFloor(-6.2, -11.7, 8.5, 5.2, 0x3f2c3c);
  addRoomSign(-6.2, -9.05, "PLAYOFF WAR ROOM");
  playoffScreen = box([7.2, 3.25, 0.12], 0xffffff, [-6.2, 2.5, -14], { material: makeBracketMaterial(), cast: false });
  interactions.push({ label: "Open Playoffs", position: new THREE.Vector3(-6.2, 0, -11.4), action: "playoffs" });
  interactions.push({ label: "Season Awards", position: new THREE.Vector3(-8.7, 0, -11.4), action: "awards" });
}

function buildTrophyGallery() {
  addZoneFloor(0, -17, 20.5, 4.6, 0x4a4027);
  addRoomSign(0, -14.45, "HALL OF FAME + TROPHY GALLERY");
  for (let i = 0; i < 7; i += 1) {
    const x = -8.1 + i * 2.7;
    const pedestal = box([1.3, 1, 1.15], 0x26313a, [x, 0.5, -18.1]);
    const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.34, 0.68, 18), material(i % 2 ? 0xc9ccd1 : 0xd8ad3f, 0.18, 0.88));
    trophy.position.set(x, 1.48, -18.1);
    trophy.castShadow = true;
    scene.add(trophy);
    pedestal.castShadow = true;
  }
  interactions.push({ label: "Enter Hall of Fame", position: new THREE.Vector3(0, 0, -15.65), action: "hof" });
}

function addZoneFloor(x, z, width, depth, color) {
  box([width, 0.035, depth], color, [x, 0.12, z], { roughness: 0.84, cast: false });
}

function addRoomSign(x, z, text) {
  const sign = box([4.6, 0.58, 0.08], 0xffffff, [x, 3.95, z], { material: makeSignMaterial(text, currentConfig.accent || "#20ff9f"), cast: false });
  sign.material.color = new THREE.Color(0xffffff);
}

function makeMonitor(x, y, z, title, accent) {
  const screen = box([2.05, 1.22, 0.12], 0xffffff, [x, y, z], { material: makeSignMaterial(title, accent), cast: false });
  box([0.08, 0.58, 0.08], 0x5a6268, [x, y - 0.63, z + 0.03], { metalness: 0.82 });
  box([1.05, 0.06, 0.48], 0x333b40, [x, y - 0.9, z + 0.12], { metalness: 0.55 });
  return screen;
}

function makeSignMaterial(text, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07131c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, canvas.width, 13);
  ctx.fillRect(0, canvas.height - 13, canvas.width, 13);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 58px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(String(text).toUpperCase().slice(0, 27), 512, 150);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makeLeaderboardMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 520;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07131c";
  ctx.fillRect(0, 0, 1200, 520);
  ctx.fillStyle = currentConfig.accent || "#20ff9f";
  ctx.fillRect(0, 0, 1200, 12);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 46px system-ui";
  ctx.fillText("GLOBAL GM LEADERBOARD", 50, 75);
  ctx.font = "800 25px system-ui";
  (currentConfig.leaders || []).slice(0, 5).forEach((entry, index) => {
    const y = 145 + index * 70;
    ctx.fillStyle = index === 0 ? currentConfig.accent || "#20ff9f" : "#dbe7ee";
    ctx.fillText(`${index + 1}. ${entry.gmName || entry.username}`, 65, y);
    ctx.textAlign = "right";
    ctx.fillText(`${entry.championships || 0} TITLES  |  ${entry.yearsPlayed || 0} YEARS`, 1135, y);
    ctx.textAlign = "left";
  });
  if (!(currentConfig.leaders || []).length) {
    ctx.fillStyle = "#a9bac5";
    ctx.fillText("Play seasons to enter the global board", 65, 165);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makeBracketMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 520;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0c1118";
  ctx.fillRect(0, 0, 1100, 520);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 44px system-ui";
  ctx.fillText("CHAMPIONSHIP PATH", 45, 65);
  ctx.strokeStyle = currentConfig.accent || "#20ff9f";
  ctx.lineWidth = 7;
  for (let row = 0; row < 4; row += 1) {
    const y = 120 + row * 92;
    ctx.strokeRect(55, y, 240, 54);
    ctx.beginPath();
    ctx.moveTo(295, y + 27);
    ctx.lineTo(430, y + 27);
    ctx.stroke();
  }
  [170, 355].forEach((y) => ctx.strokeRect(430, y, 240, 60));
  ctx.strokeRect(810, 245, 240, 70);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makeNewspaper(x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.04, 1.5), material(0xf0ead9, 0.9));
  group.add(paper);
  const headline = makeSignMaterial("LACROSSE DAILY", "#222222");
  const front = new THREE.Mesh(new THREE.PlaneGeometry(2.12, 1.28), headline);
  front.rotation.x = -Math.PI / 2;
  front.position.y = 0.031;
  group.add(front);
  scene.add(group);
  return group;
}

function buildOfficeChair(x, y, z) {
  box([1.35, 0.18, 1.2], 0x22292e, [x, y + 0.82, z]);
  box([1.35, 1.5, 0.2], 0x22292e, [x, y + 1.55, z + 0.52], { rotation: [-0.12, 0, 0] });
  box([0.12, 0.72, 0.12], 0x555d62, [x, y + 0.42, z], { metalness: 0.8 });
}

function buildEquipmentRack(x, z) {
  box([2.2, 3.4, 0.42], 0x26313a, [x, 1.7, z]);
  [0.65, 1.4, 2.15, 2.9].forEach((y) => box([2, 0.08, 0.75], 0x1b252b, [x, y, z + 0.25]));
  for (let i = 0; i < 6; i += 1) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2, 8), material(i % 2 ? 0xd6dadd : 0x303940, 0.25, 0.75));
    shaft.position.set(x - 0.75 + i * 0.3, 1.75, z + 0.52);
    shaft.rotation.z = -0.15 + i * 0.05;
    scene.add(shaft);
  }
}

function createHuman(suitColor, skinColor, labelText) {
  const group = new THREE.Group();
  const suit = material(suitColor, 0.62);
  const skin = material(skinColor, 0.75);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.82, 8, 17), suit);
  torso.position.y = 1.45;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 22, 16), skin);
  head.position.y = 2.32;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.307, 20, 11, 0, Math.PI * 2, 0, Math.PI * 0.5), material(0x28201d, 0.82));
  hair.position.y = 2.43;
  group.add(torso, head, hair);
  [-0.45, 0.45].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.58, 6, 11), suit);
    arm.position.set(x, 1.45, 0);
    group.add(arm);
  });
  [-0.18, 0.18].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.7, 6, 12), material(0x182028, 0.64));
    leg.position.set(x, 0.55, 0);
    group.add(leg);
  });
  group.add(makeTextSprite(labelText));
  group.traverse((item) => { if (item.isMesh) item.castShadow = true; });
  group.userData.phase = Math.random() * 5;
  return group;
}

function makeTextSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(3,9,13,.86)";
  ctx.fillRect(8, 8, 1008, 144);
  ctx.strokeStyle = currentConfig.accent || "#20ff9f";
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 1008, 144);
  ctx.fillStyle = "white";
  ctx.font = "900 48px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, 512, 102);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true }));
  sprite.position.y = 2.9;
  sprite.scale.set(innerWidth < 600 ? 1.5 : 2.25, innerWidth < 600 ? 0.25 : 0.36, 1);
  return sprite;
}

function buildHand() {
  hand = new THREE.Group();
  hand.position.set(0.42, -0.48, -0.82);
  hand.scale.setScalar(0.58);
  const skin = material(0xc88f69, 0.72);
  const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.6, 7, 14), material(0x25394f, 0.58));
  sleeve.position.set(0.08, -0.18, 0.24);
  sleeve.rotation.x = Math.PI / 2.7;
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.16), skin);
  palm.position.set(0, 0.12, -0.08);
  hand.add(sleeve, palm);
  for (let i = 0; i < 4; i += 1) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.19 - i * 0.01, 5, 9), skin);
    finger.position.set(-0.1 + i * 0.065, 0.31, -0.07);
    hand.add(finger);
  }
  camera.add(hand);
}

function bindControls() {
  addEventListener("keydown", (event) => {
    if (!active) return;
    const action = keyAction(event.key);
    if (action && !tourActive && !introActive && computerOverlay.classList.contains("hidden")) {
      keys[action] = true;
      event.preventDefault();
    }
    if ((event.key === "e" || event.key === "E" || event.key === "Enter") && nearestInteraction && !tourActive && !introActive) useInteraction();
    if (event.key === "Escape" && !computerOverlay.classList.contains("hidden")) computerOverlay.classList.add("hidden");
  });
  addEventListener("keyup", (event) => {
    const action = keyAction(event.key);
    if (action) keys[action] = false;
  });
  moveButtons.forEach((button) => {
    const action = button.dataset.facilityMove;
    const start = (event) => { event.preventDefault(); if (!tourActive && !introActive) keys[action] = true; };
    const stop = (event) => { event.preventDefault(); keys[action] = false; };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  });
  host.addEventListener("pointerdown", (event) => { dragging = true; dragX = event.clientX; });
  addEventListener("pointermove", (event) => {
    if (!dragging || !active || tourActive || introActive) return;
    yaw -= (event.clientX - dragX) * 0.004;
    dragX = event.clientX;
  });
  addEventListener("pointerup", () => { dragging = false; });
  interactButton.addEventListener("click", useInteraction);
  document.querySelector("#facility-tour-skip").addEventListener("click", finishTour);
  document.querySelector("#facility-computer-close").addEventListener("click", () => computerOverlay.classList.add("hidden"));
  document.querySelectorAll("[data-facility-section]").forEach((button) => button.addEventListener("click", () => dispatchSection(button.dataset.facilitySection)));
}

function keyAction(key) {
  return { w: "forward", W: "forward", ArrowUp: "forward", s: "backward", S: "backward", ArrowDown: "backward", a: "left", A: "left", ArrowLeft: "left", d: "right", D: "right", ArrowRight: "right" }[key];
}

function open(config = {}) {
  currentConfig = config;
  accentColor = new THREE.Color(config.accent || "#20ff9f");
  init();
  active = true;
  computerOverlay.classList.add("hidden");
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  teamLabel.textContent = config.teamName || "Team Facility";
  overlay.style.setProperty("--facility-accent", config.accent || "#20ff9f");
  updateDynamicDisplays();
  if (config.firstVisit) startEntrance();
  else {
    introActive = false;
    tourActive = false;
    camera.position.set(-4.8, 1.66, 10.5);
    yaw = 0;
    guide.visible = false;
    tourPanel.classList.add("hidden");
    doorPivot.rotation.y = Math.PI * 0.52;
    locationLabel.textContent = "Boardroom";
  }
  clock.start();
}

function updateDynamicDisplays() {
  replaceDisplayMaterial(buildingSign, makeSignMaterial(currentConfig.teamName || "TEAM FACILITY", currentConfig.accent || "#20ff9f"));
  replaceDisplayMaterial(leaderboardScreen, makeLeaderboardMaterial());
  replaceDisplayMaterial(playoffScreen, makeBracketMaterial());
}

function replaceDisplayMaterial(display, nextMaterial) {
  if (!display) return;
  const previous = display.material;
  display.material = nextMaterial;
  if (previous && previous.map) previous.map.dispose();
  if (previous) previous.dispose();
}

function close() {
  active = false;
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  computerOverlay.classList.add("hidden");
}

function startEntrance() {
  introActive = true;
  introTime = 0;
  tourActive = false;
  camera.position.set(0, 1.68, 25.5);
  yaw = 0;
  doorPivot.rotation.y = 0;
  doorHandle.rotation.z = 0;
  hand.visible = true;
  guide.visible = true;
  guide.position.set(0, 0, 11.2);
  tourPanel.classList.remove("hidden");
  tourStep.textContent = "WELCOME TO THE CLUB";
  tourTitle.textContent = currentConfig.teamName || "Your new facility";
  tourCopy.textContent = "Your assistant GM is waiting inside to show you the building.";
  interactButton.classList.add("hidden");
}

function startTour() {
  introActive = false;
  tourActive = true;
  tourIndex = 0;
  tourTime = 0;
  hand.visible = false;
  showTourStop();
}

function showTourStop() {
  const stop = tourStops[tourIndex];
  tourStep.textContent = `FACILITY TOUR ${tourIndex + 1} / ${tourStops.length}`;
  tourTitle.textContent = stop.title;
  tourCopy.textContent = stop.copy;
  tourPanel.classList.remove("hidden");
}

function finishTour() {
  introActive = false;
  tourActive = false;
  tourIndex = tourStops.length - 1;
  camera.position.set(-4.8, 1.66, 10.5);
  yaw = 0;
  guide.position.set(-4.8, 0, 7.2);
  guide.visible = true;
  hand.visible = true;
  tourPanel.classList.add("hidden");
  window.dispatchEvent(new Event("facility-tour-complete"));
}

function dispatchSection(section) {
  computerOverlay.classList.add("hidden");
  window.dispatchEvent(new CustomEvent("facility-open-section", { detail: { section } }));
}

function useInteraction() {
  if (!nearestInteraction) return;
  if (nearestInteraction.action === "computer") {
    document.querySelector("#facility-computer-title").textContent = `${currentConfig.teamName || "Team"} GM Computer`;
    computerOverlay.classList.remove("hidden");
    return;
  }
  dispatchSection(nearestInteraction.action);
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer) return;
  const dt = Math.min(0.04, clock.getDelta());
  if (active) update(dt);
  renderer.render(scene, camera);
}

function update(dt) {
  const time = performance.now() * 0.001;
  animatedPeople.forEach((person, index) => {
    person.position.y = Math.sin(time * 1.1 + index) * 0.008;
    person.rotation.z = Math.sin(time * 0.7 + index) * 0.006;
  });
  if (introActive) updateEntrance(dt);
  else if (tourActive) updateTour(dt);
  else if (computerOverlay.classList.contains("hidden")) updateWalking(dt);
  updateCameraLook();
}

function updateEntrance(dt) {
  introTime += dt;
  const approach = smoothstep(0.4, 2.4, introTime);
  camera.position.z = THREE.MathUtils.lerp(25.5, 15.8, approach);
  const reach = smoothstep(2.2, 3, introTime) * (1 - smoothstep(4.1, 4.8, introTime));
  hand.position.set(0.42 - reach * 0.18, -0.48 + reach * 0.24, -0.82 - reach * 0.3);
  hand.rotation.z = -reach * 0.55;
  doorHandle.rotation.z = -smoothstep(2.65, 3.25, introTime) * 0.78;
  doorPivot.rotation.y = smoothstep(3.05, 4.45, introTime) * Math.PI * 0.52;
  if (introTime > 4.1) camera.position.z = THREE.MathUtils.lerp(15.8, 11.4, smoothstep(4.1, 6.1, introTime));
  locationLabel.textContent = introTime < 2.3 ? "Front Entrance" : introTime < 4.5 ? "Opening Main Door" : "Executive Lobby";
  if (introTime >= 6.2) startTour();
}

function updateTour(dt) {
  const stop = tourStops[tourIndex];
  tourTime += dt;
  const move = smoothstep(0, 1.5, tourTime);
  camera.position.lerp(new THREE.Vector3(...stop.position), Math.min(1, dt * (2.2 + move * 2)));
  guide.position.lerp(new THREE.Vector3(...stop.guide), Math.min(1, dt * 2.5));
  const dx = guide.position.x - camera.position.x;
  const dz = guide.position.z - camera.position.z;
  yaw = Math.atan2(dx, -dz);
  locationLabel.textContent = stop.title;
  if (tourTime >= 4.35) {
    tourTime = 0;
    tourIndex += 1;
    if (tourIndex >= tourStops.length) finishTour();
    else showTourStop();
  }
}

function updateWalking(dt) {
  let forward = 0;
  let side = 0;
  if (keys.forward) forward += 1;
  if (keys.backward) forward -= 1;
  if (keys.right) side += 1;
  if (keys.left) side -= 1;
  const length = Math.hypot(forward, side);
  if (length) {
    const speed = 4.1 * dt / length;
    const forwardX = Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = Math.sin(yaw);
    camera.position.x += (forwardX * forward + rightX * side) * speed;
    camera.position.z += (forwardZ * forward + rightZ * side) * speed;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -10.7, 10.7);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -18.4, 12.8);
    camera.position.y = 1.66 + Math.sin(performance.now() * 0.012) * 0.025;
    hand.position.y = -0.48 + Math.sin(performance.now() * 0.012) * 0.018;
  }
  updateNearestInteraction();
  locationLabel.textContent = locationFor(camera.position.x, camera.position.z);
}

function updateNearestInteraction() {
  nearestInteraction = null;
  let nearestDistance = Infinity;
  interactions.forEach((interaction) => {
    const distance = Math.hypot(camera.position.x - interaction.position.x, camera.position.z - interaction.position.z);
    if (distance < 2.5 && distance < nearestDistance) {
      nearestDistance = distance;
      nearestInteraction = interaction;
    }
  });
  interactButton.classList.toggle("hidden", !nearestInteraction);
  if (nearestInteraction) interactButton.textContent = nearestInteraction.label;
}

function locationFor(x, z) {
  if (z > 4.1 && x < -1.5) return "Boardroom";
  if (z > 4.1 && x > 1.5) return "GM Office";
  if (z > -2.8) return "League Hallway";
  if (z > -8.3 && x < 0) return "Roster Room";
  if (z > -8.3) return "Trade Office";
  if (z > -14.5 && x < 0) return "Playoff Suite";
  if (z > -14.5) return "Field Control";
  return "Trophy Gallery";
}

function updateCameraLook() {
  if (!camera) return;
  camera.lookAt(
    camera.position.x + Math.sin(yaw) * 7,
    camera.position.y - 0.08,
    camera.position.z - Math.cos(yaw) * 7
  );
  if (guide && tourActive) guide.rotation.y = Math.atan2(camera.position.x - guide.position.x, camera.position.z - guide.position.z);
}

function smoothstep(min, max, value) {
  const x = THREE.MathUtils.clamp((value - min) / Math.max(0.0001, max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
}

window.teamFacility3D = { open, close };
window.dispatchEvent(new Event("facility-3d-ready"));
