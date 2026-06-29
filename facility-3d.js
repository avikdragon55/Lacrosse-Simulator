import * as THREE from "./vendor/three.module.js";

const overlay = document.querySelector("#facility");
const host = document.querySelector("#facility-3d");
const locationLabel = document.querySelector("#facility-location");
const teamLabel = document.querySelector("#facility-team");
const interactButton = document.querySelector("#facility-interact");
const computerOverlay = document.querySelector("#facility-computer");
const elevatorPanel = document.querySelector("#facility-elevator");
const elevatorStatus = document.querySelector("#facility-elevator-status");
const moveButtons = [...document.querySelectorAll("[data-facility-move]")];
const floorButtons = [...document.querySelectorAll("[data-facility-floor]")];

const FLOOR_HEIGHT = 8;
const FIELD = { width: 14, length: 26, goalZ: 10.25, centerX: 30 };
const keys = { forward: false, backward: false, left: false, right: false };
const interactions = [];
const obstacles = [];
const animatedPeople = [];
const elevatorDoors = {};
const hallPlaques = [];

let renderer;
let scene;
let camera;
let clock;
let hand;
let mainDoorPivot;
let mainDoorHandle;
let tunnelDoorPivot;
let tunnelDoorOpen = false;
let tunnelDoorProgress = 0;
let leaderboardScreen;
let buildingSign;
let stadiumTurf;
let active = false;
let introActive = false;
let introTime = 0;
let currentFloor = 1;
let yaw = 0;
let dragging = false;
let dragX = 0;
let nearestInteraction = null;
let inElevator = false;
let elevatorTravel = null;
let currentConfig = {};
let savedPosition = null;
let savedYaw = 0;

function mat(color, roughness = 0.64, metalness = 0.03) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(size, color, position, options = {}) {
  const item = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    options.material || mat(color, options.roughness ?? 0.64, options.metalness ?? 0.03)
  );
  item.position.set(...position);
  if (options.rotation) item.rotation.set(...options.rotation);
  item.castShadow = options.cast !== false;
  item.receiveShadow = options.receive !== false;
  scene.add(item);
  return item;
}

function init() {
  if (renderer || !host) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ac4da);
  scene.fog = new THREE.Fog(0x9ac4da, 48, 105);
  camera = new THREE.PerspectiveCamera(57, innerWidth / innerHeight, 0.035, 130);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  host.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  buildLights();
  buildExterior();
  buildFloorShell(1);
  buildFloorShell(2);
  buildFloorShell(3);
  buildFloorOne();
  buildFloorTwo();
  buildFloorThree();
  buildBroadcastField();
  buildHand();
  bindControls();
  addEventListener("resize", resize);
  animate();
}

function buildLights() {
  scene.add(new THREE.HemisphereLight(0xe5f3ff, 0x2e271f, 2.25));
  const sun = new THREE.DirectionalLight(0xffeed5, 4.5);
  sun.position.set(-18, 30, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  scene.add(sun);
  for (let floor = 1; floor <= 3; floor += 1) {
    const base = floorBase(floor);
    [[-7, 4.6, 8], [0, 4.6, 4], [7, 4.6, 8], [-7, 4.6, -7], [4, 4.6, -7]].forEach(([x, y, z], index) => {
      const light = new THREE.PointLight(index % 2 ? 0xcbe7ff : 0xffd9aa, 30, 13, 1.7);
      light.position.set(x, base + y, z);
      scene.add(light);
    });
  }
}

function buildExterior() {
  addBox([86, 0.18, 82], 0x347d49, [13, -0.16, 8], { roughness: 0.92, cast: false });
  addBox([8, 0.08, 23], 0xa7acae, [0, -0.02, 25], { roughness: 0.92, cast: false });
  const facade = mat(0x27333b, 0.52, 0.08);
  for (let floor = 1; floor <= 3; floor += 1) {
    const base = floorBase(floor);
    if (floor === 1) {
      addBox([10.25, 5.6, 0.36], 0, [-6.85, base + 2.8, 15], { material: facade });
      addBox([10.25, 5.6, 0.36], 0, [6.85, base + 2.8, 15], { material: facade });
      addBox([3.45, 1, 0.36], 0, [0, base + 5.1, 15], { material: facade });
    } else {
      addBox([24, 5.6, 0.36], 0, [0, base + 2.8, 15], { material: facade });
    }
    if (floor > 1) {
      [-8.7, -5.2, -1.7, 1.7, 5.2, 8.7].forEach((x) => {
        const windowPanel = addBox([2.5, 2.85, 0.07], 0x31556b, [x, base + 2.85, 15.21], { roughness: 0.18, metalness: 0.12, cast: false });
        windowPanel.material.emissive = new THREE.Color(0x0a1d28);
        windowPanel.material.emissiveIntensity = 0.55;
      });
    }
    addBox([24.8, 0.38, 0.7], 0x182127, [0, base + 5.75, 14.9], { metalness: 0.25 });
  }
  buildingSign = addBox([10, 1.15, 0.12], 0xffffff, [0, 22.4, 15.28], {
    material: makeScreenMaterial(currentConfig.teamName || "TEAM FACILITY", currentConfig.accent || "#20ff9f"), cast: false
  });
  buildMainDoor();
}

function buildMainDoor() {
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x78abc2, transparent: true, opacity: 0.42, roughness: 0.08, transmission: 0.22 });
  const metal = mat(0x171e23, 0.25, 0.75);
  mainDoorPivot = new THREE.Group();
  mainDoorPivot.position.set(-1.55, 0, 15.22);
  scene.add(mainDoorPivot);
  const door = new THREE.Group();
  door.position.x = 1.55;
  mainDoorPivot.add(door);
  const part = (geometry, partMaterial, position) => {
    const mesh = new THREE.Mesh(geometry, partMaterial);
    mesh.position.set(...position);
    mesh.castShadow = true;
    door.add(mesh);
    return mesh;
  };
  part(new THREE.BoxGeometry(3.05, 0.18, 0.16), metal, [0, 4.55, 0]);
  part(new THREE.BoxGeometry(3.05, 0.18, 0.16), metal, [0, 0.1, 0]);
  part(new THREE.BoxGeometry(0.18, 4.6, 0.16), metal, [-1.45, 2.3, 0]);
  part(new THREE.BoxGeometry(0.18, 4.6, 0.16), metal, [1.45, 2.3, 0]);
  part(new THREE.BoxGeometry(2.7, 4.25, 0.06), glass, [0, 2.3, 0]);
  mainDoorHandle = part(new THREE.CylinderGeometry(0.055, 0.055, 0.78, 14), mat(0xd4bc82, 0.18, 0.9), [1.02, 1.4, 0.15]);
}

function buildFloorShell(floor) {
  const base = floorBase(floor);
  const floorColor = floor === 1 ? 0x5b3a27 : floor === 2 ? 0x4a3a31 : 0x30383d;
  addBox([24, 0.2, 30], floorColor, [0, base, 0], { roughness: 0.76 });
  addBox([24, 0.2, 30], 0x222a30, [0, base + 5.6, 0], { cast: false });
  addBox([0.3, 5.6, 30], 0x3f4a51, [-12, base + 2.8, 0]);
  if (floor > 1) addBox([0.3, 5.6, 30], 0x3f4a51, [12, base + 2.8, 0]);
  else {
    addBox([0.3, 5.6, 20], 0x3f4a51, [12, base + 2.8, -5]);
    addBox([0.3, 5.6, 3.4], 0x3f4a51, [12, base + 2.8, 13.3]);
    addBox([0.3, 1.15, 4.6], 0x3f4a51, [12, base + 5.02, 8.5]);
  }
  addBox([24, 5.6, 0.3], 0x3b464d, [0, base + 2.8, -15]);
  buildCeilingPanels(base);
  buildElevatorBank(floor, base);
}

function buildCeilingPanels(base) {
  for (let z = 11; z >= -11; z -= 4.5) {
    [-7, 0, 7].forEach((x) => {
      const panel = addBox([2.6, 0.04, 0.7], 0xffffff, [x, base + 5.46, z], { cast: false });
      panel.material.emissive = new THREE.Color(0xffffff);
      panel.material.emissiveIntensity = 1.25;
    });
  }
}

function buildElevatorBank(floor, base) {
  const wall = mat(0x252d32, 0.34, 0.62);
  const steel = mat(0x9ba6ac, 0.22, 0.82);
  addBox([0.38, 5, 4.8], 0, [-11.65, base + 2.5, 0], { material: wall });
  const left = addBox([0.16, 4.15, 1.75], 0, [-11.42, base + 2.12, -0.92], { material: steel });
  const right = addBox([0.16, 4.15, 1.75], 0, [-11.42, base + 2.12, 0.92], { material: steel });
  elevatorDoors[floor] = { left, right };
  const display = addBox([0.1, 0.42, 0.76], 0xffffff, [-11.4, base + 4.55, 0], { material: makeScreenMaterial(String(floor), currentConfig.accent || "#20ff9f"), cast: false });
  display.rotation.y = Math.PI / 2;
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: currentConfig.accent || "#20ff9f", emissiveIntensity: 1.8 }));
  button.position.set(-11.22, base + 1.45, 2.75);
  scene.add(button);
  addInteraction(floor, -9.35, 0, "Enter Elevator", "elevator");
  addObstacle(floor, -11.2, 0, 1.2, 5.2);
}

function buildFloorOne() {
  const base = 0;
  buildReception(base);
  buildPressRoom(base);
  buildStadiumTunnel(base);
}

function buildReception(base) {
  const desk = mat(0x29353d, 0.42, 0.1);
  addBox([7.4, 1.2, 1.45], 0, [0, base + 0.62, 8.2], { material: desk });
  addBox([7.8, 0.17, 1.75], 0, [0, base + 1.25, 8.2], { material: mat(0x829096, 0.28, 0.3) });
  addBox([6.2, 0.44, 0.08], 0xffffff, [0, base + 0.78, 8.96], { material: makeScreenMaterial("RECEPTION", currentConfig.accent || "#20ff9f"), cast: false });
  [-2.2, 2.2].forEach((x, index) => {
    makeDeskMonitor(x, base + 1.77, 7.78, index ? "MEDIA" : "NEWS", index ? "#62b8ff" : "#e75b67");
    const worker = createPerson(index ? 0x384f68 : 0x58414c, index ? 0xc88c66 : 0xe0ad86, index ? "Devon Price | Media" : "Avery Stone | News");
    worker.position.set(x, base, 6.9);
    worker.userData.baseY = base;
    scene.add(worker);
    animatedPeople.push(worker);
  });
  leaderboardScreen = addBox([8.6, 3.55, 0.35], 0xffffff, [0, base + 2.5, 4.7], { material: makeLeaderboardMaterial(), cast: false });
  addObstacle(1, 0, 8.2, 7.4, 1.9);
  addObstacle(1, 0, 4.7, 9.1, 0.75);
  addInteraction(1, -2.2, 10.2, "Open News", "news");
  addInteraction(1, 0, 6.45, "View All-Time Leaderboard", "leaderboard");
  [-7.7, 7.7].forEach((x) => {
    addBox([2.6, 0.55, 1], 0x31576c, [x, base + 0.45, 10.4]);
    addBox([2.6, 0.85, 0.28], 0x29495b, [x, base + 0.88, 10.85]);
    addObstacle(1, x, 10.4, 2.9, 1.4);
  });
}

function buildPressRoom(base) {
  addBox([16, 0.04, 10], 0x252d32, [0, base + 0.13, -5], { cast: false });
  addBox([16, 4.7, 0.3], 0x153246, [0, base + 2.35, -10]);
  const backdrop = addBox([10, 3.45, 0.08], 0xffffff, [0, base + 2.5, -9.8], { material: makePressBackdrop(), cast: false });
  backdrop.receiveShadow = false;
  const podiumWood = mat(0x54321f, 0.46);
  addBox([2, 1.4, 0.85], 0, [0, base + 0.8, -5.7], { material: podiumWood });
  addBox([2.35, 0.16, 1], 0, [0, base + 1.52, -5.7], { material: podiumWood });
  const chair = addBox([1.25, 0.18, 1.05], 0x20282e, [0, base + 0.78, -7.1]);
  chair.rotation.y = Math.PI;
  addBox([1.25, 1.45, 0.2], 0x20282e, [0, base + 1.48, -7.55], { rotation: [-0.12, 0, 0] });
  const player = createPerson(currentConfig.accent || 0x287fa8, 0xc98f69, currentConfig.topPlayer || "Team Captain");
  player.position.set(0, base, -7.15);
  player.userData.baseY = base;
  scene.add(player);
  animatedPeople.push(player);
  [-3.4, 3.4].forEach((x) => buildCameraRig(x, base, -2.6));
  for (let i = 0; i < 8; i += 1) {
    const x = -5.25 + (i % 4) * 3.5;
    const z = -0.1 - Math.floor(i / 4) * 1.4;
    addBox([1.05, 0.16, 0.9], 0x273139, [x, base + 0.62, z]);
    addBox([1.05, 0.92, 0.16], 0x273139, [x, base + 1.08, z + 0.35]);
  }
  addInteraction(1, 0, -3.6, "Start Player Interview", "press");
  addObstacle(1, 0, -5.7, 2.8, 1.5);
}

function buildStadiumTunnel(base) {
  const frame = mat(0x1d252a, 0.3, 0.68);
  tunnelDoorPivot = new THREE.Group();
  tunnelDoorPivot.position.set(11.78, base, 6.8);
  scene.add(tunnelDoorPivot);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x7cb9d0, transparent: true, opacity: 0.4, roughness: 0.08, transmission: 0.25 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.35, 3.25), glass);
  door.position.set(0, 2.2, 1.6);
  tunnelDoorPivot.add(door);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.75, 14), mat(0xd2b977, 0.18, 0.88));
  handle.position.set(-0.14, 1.48, 2.5);
  tunnelDoorPivot.add(handle);
  const sign = addBox([0.1, 0.62, 3.1], 0xffffff, [11.72, base + 4.72, 8.4], { material: makeScreenMaterial("STADIUM TUNNEL", currentConfig.accent || "#20ff9f"), cast: false });
  sign.rotation.y = Math.PI / 2;
  addBox([10.5, 0.08, 3.8], 0x5a6266, [17, 0.02, 8.4], { cast: false });
  addBox([10.5, 3.4, 0.2], 0x303a40, [17, 1.7, 6.5]);
  addBox([10.5, 3.4, 0.2], 0x303a40, [17, 1.7, 10.3]);
  addBox([10.5, 0.2, 3.8], 0x222a2f, [17, 3.4, 8.4], { cast: false });
  for (let x = 13; x <= 21; x += 2) {
    const light = addBox([0.8, 0.03, 0.45], 0xffffff, [x, 3.28, 8.4], { cast: false });
    light.material.emissive = new THREE.Color(0xffffff);
    light.material.emissiveIntensity = 1.4;
  }
  addInteraction(1, 9.75, 8.4, "Open Stadium Tunnel", "tunnel");
}

function buildFloorTwo() {
  const base = floorBase(2);
  buildOfficeDividerZ(2, base, -4.15, -4, "GM OFFICE");
  buildOfficeDividerZ(2, base, 4.15, -4, "TRADE OFFICE");
  buildOfficeDividerX(2, base, 3.1, 0, "TROPHY ROOM");
  buildGmOffice(base);
  buildTradeOffice(base);
  buildTrophyRoom(base);
  addRoomLabel(base, -4, -3.15, "GENERAL MANAGER");
  addRoomLabel(base, -4, 3.15, "TRADE OFFICE");
  addRoomLabel(base, 3.2, 0, "TROPHY ROOM");
}

function buildGmOffice(base) {
  addBox([10.5, 0.04, 9.5], 0x45504a, [-2.2, base + 0.13, -9.3], { cast: false });
  addBox([10.5, 4.8, 0.24], 0x4b5960, [-2.2, base + 2.4, -14]);
  addBox([0.24, 4.8, 9.5], 0x4b5960, [3.05, base + 2.4, -9.3]);
  const deskWood = mat(0x603a22, 0.42, 0.05);
  addBox([7.2, 0.24, 2.3], 0, [-2.6, base + 1.02, -9.3], { material: deskWood });
  addBox([0.3, 1, 1.9], 0, [-5.5, base + 0.5, -9.3], { material: deskWood });
  addBox([0.3, 1, 1.9], 0, [0.3, base + 0.5, -9.3], { material: deskWood });
  buildLaptop(-1.7, base + 1.2, -9.15);
  buildNewspaper(-4.4, base + 1.18, -9.2);
  buildLacrosseRack(-6.6, base, -12.8);
  addInteraction(2, -1.7, -7.5, "Open GM Laptop", "computer");
  addInteraction(2, -4.4, -7.5, "Read Newspaper", "newspaper");
  addObstacle(2, -2.6, -9.3, 7.8, 2.9);
}

function buildTradeOffice(base) {
  addBox([10.5, 0.04, 9.5], 0x3e4349, [-2.2, base + 0.13, 9.3], { cast: false });
  addBox([10.5, 4.8, 0.24], 0x434e55, [-2.2, base + 2.4, 14]);
  addBox([0.24, 4.8, 9.5], 0x434e55, [3.05, base + 2.4, 9.3]);
  const table = mat(0x50301e, 0.46);
  addBox([6.8, 0.22, 2], 0, [-2.2, base + 1, 9], { material: table });
  [-4.4, 0].forEach((x, index) => {
    const person = createPerson(index ? 0x3e3431 : 0x254665, index ? 0xc88e67 : 0xe0ad86, index ? `${currentConfig.owner || "Owner"} | Owner` : "Marcus Vale | Cap Director");
    person.position.set(x, base, 11.3);
    person.userData.baseY = base;
    person.rotation.y = Math.PI;
    scene.add(person);
    animatedPeople.push(person);
  });
  addInteraction(2, -5.3, 4.7, "Enter Trade Office", "trades");
  addObstacle(2, -2.2, 9, 7.5, 2.6);
}

function buildTrophyRoom(base) {
  addBox([8.6, 0.04, 10.5], 0x3d3729, [7.5, base + 0.13, 0], { cast: false });
  addBox([0.24, 4.8, 10.5], 0x515b61, [11.6, base + 2.4, 0]);
  for (let i = 0; i < 7; i += 1) {
    const z = -4.2 + i * 1.4;
    addBox([1.15, 0.9, 1.05], 0x263139, [8.8, base + 0.45, z]);
    const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.34, 0.66, 18), mat(i % 2 ? 0xc7ccd0 : 0xd9aa39, 0.18, 0.88));
    trophy.position.set(8.8, base + 1.3, z);
    trophy.castShadow = true;
    scene.add(trophy);
  }
  const standings = addBox([4.6, 2.8, 0.08], 0xffffff, [7.2, base + 2.55, 5.02], { material: makeScreenMaterial("FULL STANDINGS", "#4a9de0"), cast: false });
  standings.rotation.y = Math.PI;
  const leaders = addBox([4.6, 2.8, 0.08], 0xffffff, [7.2, base + 2.55, -5.02], { material: makeScreenMaterial("LEAGUE LEADERS", "#e5ae3f"), cast: false });
  addInteraction(2, 7.2, 3.25, "View Full Standings", "league");
  addInteraction(2, 7.2, -3.25, "View League Leaders", "leaders");
  addInteraction(2, 5.2, 0, "View Season Awards", "awards");
}

function buildFloorThree() {
  const base = floorBase(3);
  buildOfficeDividerZ(3, base, -4.3, -3.5, "HALL OF FAME");
  buildOfficeDividerZ(3, base, 4.3, -3.5, "DRAFT STAGE");
  buildHallOfFame(base);
  buildDraftRoom(base);
  addRoomLabel(base, 1.5, -4.4, "HALL OF FAME");
  addRoomLabel(base, 0, 4.4, "DRAFT STAGE");
}

function buildHallOfFame(base) {
  addBox([18, 0.04, 10], 0x2e3135, [2, base + 0.13, -9.5], { cast: false });
  addBox([18, 4.8, 0.24], 0x3d474e, [2, base + 2.4, -14.4]);
  const legends = currentConfig.legends || [];
  for (let i = 0; i < 25; i += 1) {
    const col = i % 9;
    const row = Math.floor(i / 9);
    const x = -5.7 + col * 1.9;
    const plaque = addBox([1.55, 0.82, 0.08], 0xffffff, [x, base + 1.45 + row * 1.35, -14.2], {
      material: makePlaqueMaterial(legends[i], i + 1), cast: false
    });
    plaque.receiveShadow = false;
    hallPlaques.push(plaque);
  }
  addInteraction(3, 2, -6.7, "Open Hall of Fame", "hof");
}

function buildDraftRoom(base) {
  addBox([18, 0.04, 10], 0x232b31, [2, base + 0.13, 9.3], { cast: false });
  addBox([18, 4.8, 0.24], 0x10273a, [2, base + 2.4, 14.2]);
  addBox([10.5, 0.4, 4.8], 0x493023, [4.5, base + 0.35, 10.8]);
  addBox([9.4, 3.4, 0.08], 0xffffff, [4.5, base + 2.55, 14], { material: makeScreenMaterial("PROFESSIONAL LACROSSE DRAFT", currentConfig.accent || "#20ff9f"), cast: false });
  addBox([1.8, 1.45, 0.78], 0x4c2d1b, [7.2, base + 1.1, 10.2]);
  const commissioner = createPerson(0x202d3c, 0xd5a17c, "League Commissioner");
  commissioner.position.set(7.2, base + 0.5, 9.7);
  commissioner.userData.baseY = base + 0.5;
  scene.add(commissioner);
  const prospect = createPerson(currentConfig.accent || 0x2e7aa4, 0xc88e67, "Top Prospect");
  prospect.position.set(2.5, base + 0.5, 10.2);
  prospect.userData.baseY = base + 0.5;
  scene.add(prospect);
  animatedPeople.push(commissioner, prospect);
  for (let row = 0; row < 3; row += 1) {
    addBox([1.1, 0.28 + row * 0.2, 8.5], 0x252e35, [-5.6 - row * 0.72, base + 0.2 + row * 0.22, 9.3], { cast: false });
  }
  addInteraction(3, 0.5, 6.2, "Enter Draft Room", "draft");
}

function addRoomLabel(base, x, z, text) {
  const sign = addBox([4.8, 0.62, 0.08], 0xffffff, [x, base + 4.5, z], { material: makeScreenMaterial(text, currentConfig.accent || "#20ff9f"), cast: false });
  if (Math.abs(z) < 4) sign.rotation.y = Math.PI / 2;
}

function buildOfficeDividerZ(floor, base, z, doorX, label) {
  const wallMaterial = mat(0x455159, 0.68);
  const leftEnd = doorX - 1.45;
  const rightStart = doorX + 1.45;
  const leftWidth = leftEnd + 11.7;
  const rightWidth = 11.7 - rightStart;
  addBox([leftWidth, 4.8, 0.22], 0, [-11.7 + leftWidth / 2, base + 2.4, z], { material: wallMaterial });
  addBox([rightWidth, 4.8, 0.22], 0, [rightStart + rightWidth / 2, base + 2.4, z], { material: wallMaterial });
  addBox([2.9, 0.85, 0.22], 0, [doorX, base + 4.38, z], { material: wallMaterial });
  const door = new THREE.Group();
  door.position.set(doorX - 1.35, base, z + (z > 0 ? -0.05 : 0.05));
  door.rotation.y = z > 0 ? -Math.PI * 0.42 : Math.PI * 0.42;
  scene.add(door);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.9, 0.12), mat(0x563622, 0.5));
  slab.position.set(1.35, 1.95, 0);
  door.add(slab);
  const sign = addBox([2.7, 0.48, 0.08], 0xffffff, [doorX, base + 4.7, z + (z > 0 ? -0.15 : 0.15)], { material: makeScreenMaterial(label, currentConfig.accent || "#20ff9f"), cast: false });
  if (z < 0) sign.rotation.y = Math.PI;
  addObstacle(floor, -11.7 + leftWidth / 2, z, leftWidth, 0.5, 0.15);
  addObstacle(floor, rightStart + rightWidth / 2, z, rightWidth, 0.5, 0.15);
}

function buildOfficeDividerX(floor, base, x, doorZ, label) {
  const wallMaterial = mat(0x455159, 0.68);
  const lowEnd = doorZ - 1.45;
  const highStart = doorZ + 1.45;
  const lowDepth = lowEnd + 5.1;
  const highDepth = 5.1 - highStart;
  addBox([0.22, 4.8, lowDepth], 0, [x, base + 2.4, -5.1 + lowDepth / 2], { material: wallMaterial });
  addBox([0.22, 4.8, highDepth], 0, [x, base + 2.4, highStart + highDepth / 2], { material: wallMaterial });
  addBox([0.22, 0.85, 2.9], 0, [x, base + 4.38, doorZ], { material: wallMaterial });
  const sign = addBox([0.08, 0.48, 2.7], 0xffffff, [x - 0.15, base + 4.7, doorZ], { material: makeScreenMaterial(label, currentConfig.accent || "#20ff9f"), cast: false });
  sign.rotation.y = Math.PI / 2;
  addObstacle(floor, x, -5.1 + lowDepth / 2, 0.5, lowDepth, 0.15);
  addObstacle(floor, x, highStart + highDepth / 2, 0.5, highDepth, 0.15);
}

function buildBroadcastField() {
  const texture = createBroadcastFieldTexture(currentConfig.teamName || "PRO LACROSSE", currentConfig.accent || "#ffffff");
  stadiumTurf = new THREE.Mesh(new THREE.PlaneGeometry(FIELD.width, FIELD.length), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.93 }));
  stadiumTurf.rotation.x = -Math.PI / 2;
  stadiumTurf.position.set(FIELD.centerX, 0.04, 0);
  stadiumTurf.receiveShadow = true;
  scene.add(stadiumTurf);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(FIELD.width + 6, FIELD.length + 5), new THREE.MeshStandardMaterial({ color: 0x151b1c, roughness: 0.88 }));
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(FIELD.centerX, 0, 0);
  scene.add(apron);
  buildBroadcastGoal(-1);
  buildBroadcastGoal(1);
  buildEmptyBroadcastStands();
  [-4.3, 4.3].forEach((z) => addBox([0.46, 0.14, 3.2], 0x30383e, [FIELD.centerX + 7.65, 0.42, z], { metalness: 0.48 }));
}

function createBroadcastFieldTexture(teamName, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1800;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#238052";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 22; i += 1) {
    ctx.fillStyle = i % 2 ? "rgba(14,72,44,.13)" : "rgba(119,205,143,.055)";
    ctx.fillRect(0, i * canvas.height / 22, canvas.width, canvas.height / 22);
  }
  const x = (value) => canvas.width / 2 + value * canvas.width / FIELD.width;
  const z = (value) => canvas.height / 2 + value * canvas.height / FIELD.length;
  ctx.strokeStyle = "#f5f7ef";
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.beginPath();
  ctx.moveTo(14, canvas.height / 2);
  ctx.lineTo(canvas.width - 14, canvas.height / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 0.85 * canvas.width / FIELD.width, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 1.25 * canvas.width / FIELD.width, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#f5f7ef";
  ctx.lineWidth = 8;
  [-1, 1].forEach((side) => {
    const goalZ = side * FIELD.goalZ;
    ctx.beginPath();
    ctx.arc(x(0), z(goalZ), 1.55 * canvas.width / FIELD.width, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(x(-4.2), Math.min(z(side * 5.4), z(side * 10.8)), 8.4 * canvas.width / FIELD.width, 5.4 * canvas.height / FIELD.length);
    ctx.beginPath();
    ctx.moveTo(x(-2.7), z(side * 5.4));
    ctx.lineTo(x(2.7), z(side * 5.4));
    ctx.stroke();
  });
  ctx.fillStyle = "rgba(255,255,255,.68)";
  ctx.font = "900 58px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(teamName.toUpperCase(), canvas.width / 2, canvas.height / 2 - 90);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildBroadcastGoal(side) {
  const z = side * FIELD.goalZ;
  const frame = mat(0xff6238, 0.28, 0.34);
  [-0.72, 0.72].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.45, 12), frame);
    post.position.set(FIELD.centerX + x, 0.725, z);
    scene.add(post);
  });
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.44, 12), frame);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(FIELD.centerX, 1.45, z);
  scene.add(crossbar);
  const points = [];
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    const px = THREE.MathUtils.lerp(-0.72, 0.72, t);
    points.push(new THREE.Vector3(FIELD.centerX + px, 0, z), new THREE.Vector3(FIELD.centerX + px * 0.1, 0.28, z + side * 1.05));
    points.push(new THREE.Vector3(FIELD.centerX + px, 1.45, z), new THREE.Vector3(FIELD.centerX + px * 0.1, 1.12, z + side * 0.86));
  }
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xf7f7f3, transparent: true, opacity: 0.78 })));
}

function buildEmptyBroadcastStands() {
  const concrete = mat(0x1a2024, 0.86);
  for (const side of [-1, 1]) {
    for (let row = 0; row < 5; row += 1) {
      addBox([1.45, 0.42, FIELD.length + 5], 0, [FIELD.centerX + side * (8.25 + row * 0.92), 0.2 + row * 0.4, 0], { material: concrete, cast: false });
      addBox([0.95, 0.12, FIELD.length + 3.8], row % 2 ? 0x2f627e : 0xb8c2c7, [FIELD.centerX + side * (7.98 + row * 0.92), 0.48 + row * 0.4, 0], { cast: false });
    }
  }
}

function makeDeskMonitor(x, y, z, text, accent) {
  addBox([1.9, 1.08, 0.1], 0xffffff, [x, y, z], { material: makeScreenMaterial(text, accent), cast: false });
  addBox([0.08, 0.55, 0.08], 0x5b6469, [x, y - 0.56, z + 0.02], { metalness: 0.8 });
}

function buildLaptop(x, y, z) {
  const silver = mat(0xb8c0c4, 0.28, 0.72);
  const base = addBox([2.25, 0.1, 1.45], 0, [x, y, z + 0.35], { material: silver });
  base.rotation.y = -0.08;
  const keyboard = addBox([1.85, 0.02, 0.92], 0xffffff, [x, y + 0.06, z + 0.38], { material: makeKeyboardMaterial(), cast: false });
  keyboard.rotation.z = -0.08;
  const screenGroup = new THREE.Group();
  screenGroup.position.set(x, y + 0.08, z - 0.3);
  screenGroup.rotation.x = -0.2;
  screenGroup.rotation.y = -0.08;
  scene.add(screenGroup);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.35, 0.08), silver);
  lid.position.y = 0.68;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.12), makeLaptopScreenMaterial());
  screen.position.set(0, 0.68, 0.046);
  screenGroup.add(lid, screen);
}

function buildNewspaper(x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = 0.08;
  const paper = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.35), mat(0xefe8d5, 0.9));
  const front = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.18), makeNewspaperMaterial());
  front.rotation.x = -Math.PI / 2;
  front.position.y = 0.03;
  group.add(paper, front);
  scene.add(group);
}

function buildLacrosseRack(x, base, z) {
  addBox([2.4, 3.4, 0.4], 0x29343a, [x, base + 1.7, z]);
  for (let i = 0; i < 6; i += 1) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 8), mat(i % 2 ? 0xd7dcdf : 0x38454e, 0.22, 0.8));
    shaft.position.set(x - 0.8 + i * 0.32, base + 1.65, z + 0.3);
    shaft.rotation.z = -0.16 + i * 0.05;
    scene.add(shaft);
  }
}

function buildCameraRig(x, base, z) {
  addBox([0.72, 0.48, 0.85], 0x171b1f, [x, base + 1.9, z], { metalness: 0.4 });
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.52, 16), mat(0x20272c, 0.18, 0.7));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(x, base + 1.9, z - 0.62);
  scene.add(lens);
  [-0.3, 0, 0.3].forEach((offset) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.65, 8), mat(0x5b6267, 0.28, 0.8));
    leg.position.set(x + offset, base + 0.83, z + Math.abs(offset) * 0.4);
    leg.rotation.z = offset * 0.3;
    scene.add(leg);
  });
}

function createPerson(clothingColor, skinColor, label) {
  const group = new THREE.Group();
  const clothing = mat(clothingColor, 0.62);
  const skin = mat(skinColor, 0.74);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.82, 8, 17), clothing);
  torso.position.y = 1.45;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 22, 16), skin);
  head.position.y = 2.32;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.307, 20, 11, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(0x28201d, 0.82));
  hair.position.y = 2.43;
  group.add(torso, head, hair);
  [-0.45, 0.45].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.58, 6, 11), clothing);
    arm.position.set(side, 1.45, 0);
    group.add(arm);
  });
  [-0.18, 0.18].forEach((side) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.7, 6, 12), mat(0x182028, 0.64));
    leg.position.set(side, 0.55, 0);
    group.add(leg);
  });
  group.add(makeLabelSprite(label));
  group.traverse((item) => { if (item.isMesh) item.castShadow = true; });
  group.userData.phase = Math.random() * 5;
  return group;
}

function makeLabelSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 150;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(4,10,14,.88)";
  ctx.fillRect(8, 8, 884, 134);
  ctx.strokeStyle = currentConfig.accent || "#20ff9f";
  ctx.lineWidth = 7;
  ctx.strokeRect(8, 8, 884, 134);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "900 42px system-ui";
  ctx.fillText(String(text).slice(0, 34), 450, 94);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true }));
  sprite.position.y = 2.9;
  sprite.scale.set(innerWidth < 600 ? 1.25 : 1.8, innerWidth < 600 ? 0.21 : 0.3, 1);
  return sprite;
}

function makeScreenMaterial(text, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07131c";
  ctx.fillRect(0, 0, 1200, 420);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 1200, 14);
  ctx.fillRect(0, 406, 1200, 14);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "900 64px system-ui";
  ctx.fillText(String(text).toUpperCase().slice(0, 32), 600, 238);
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
  ctx.fillRect(0, 0, 1200, 14);
  ctx.fillStyle = "#fff";
  ctx.font = "900 45px system-ui";
  ctx.fillText("ALL-TIME GM LEADERBOARD", 45, 70);
  ctx.font = "800 24px system-ui";
  (currentConfig.leaders || []).slice(0, 5).forEach((entry, index) => {
    const y = 140 + index * 70;
    ctx.fillStyle = index === 0 ? currentConfig.accent || "#20ff9f" : "#e4edf2";
    ctx.fillText(`${index + 1}. ${entry.gmName || entry.username}`, 60, y);
    ctx.textAlign = "right";
    ctx.fillText(`${entry.championships || 0} TITLES | ${entry.yearsPlayed || 0} YEARS`, 1140, y);
    ctx.textAlign = "left";
  });
  if (!(currentConfig.leaders || []).length) {
    ctx.fillStyle = "#aabac4";
    ctx.fillText("Play seasons to enter the leaderboard", 60, 160);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makePressBackdrop() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 500;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0d2a3d";
  ctx.fillRect(0, 0, 1200, 500);
  for (let x = 0; x < 1200; x += 300) {
    for (let y = 0; y < 500; y += 125) {
      ctx.strokeStyle = currentConfig.accent || "#20ff9f";
      ctx.lineWidth = 5;
      ctx.strokeRect(x + 18, y + 17, 264, 91);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "900 21px system-ui";
      ctx.fillText(String(currentConfig.teamName || "LACROSSE").toUpperCase().slice(0, 20), x + 150, y + 73);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makePlaqueMaterial(legend, rank) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = rank <= 3 ? "#8a6725" : "#26333c";
  ctx.fillRect(0, 0, 640, 320);
  ctx.strokeStyle = rank <= 3 ? "#f1ca64" : "#91a5b1";
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 620, 300);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "900 38px system-ui";
  ctx.fillText(`#${rank}`, 320, 62);
  ctx.font = "900 42px system-ui";
  ctx.fillText((legend && legend.name ? legend.name : "Future Legend").slice(0, 24), 320, 145);
  ctx.font = "800 24px system-ui";
  ctx.fillStyle = "#d9e3e8";
  ctx.fillText(legend ? `${legend.position || "Player"} | ${legend.rating || "--"} OVR` : "Hall of Fame", 320, 205);
  ctx.fillText(legend ? `${legend.points || 0} POINTS | ${legend.seasons || 0} SEASONS` : "Awaiting induction", 320, 255);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makeKeyboardMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#bbc2c5";
  ctx.fillRect(0, 0, 700, 360);
  ctx.fillStyle = "#20262a";
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 12; col += 1) ctx.fillRect(25 + col * 54, 20 + row * 48, 42, 35);
  }
  ctx.strokeStyle = "#6d767b";
  ctx.lineWidth = 5;
  ctx.strokeRect(245, 275, 210, 70);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makeLaptopScreenMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 560;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 1000, 560);
  gradient.addColorStop(0, "#0c6375");
  gradient.addColorStop(1, "#122734");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 560);
  ctx.fillStyle = "#fff";
  ctx.font = "900 44px system-ui";
  ctx.fillText("GM COMMAND CENTER", 45, 70);
  const apps = [["20", "SEASON"], ["T", "TRADES"], ["N", "NEWS"], ["L", "LINEUP"], ["G", "GMAIL"], ["C", "CUTS"]];
  apps.forEach(([letter, label], index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 70 + col * 300;
    const y = 130 + row * 190;
    ctx.fillStyle = ["#3ca57a", "#4a8ed1", "#d59b3a", "#7656bd", "#d85252", "#475b68"][index];
    ctx.fillRect(x, y, 115, 115);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "900 44px system-ui";
    ctx.fillText(letter, x + 57, y + 72);
    ctx.font = "800 20px system-ui";
    ctx.fillText(label, x + 57, y + 148);
    ctx.textAlign = "left";
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function makeNewspaperMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 540;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f1ead8";
  ctx.fillRect(0, 0, 900, 540);
  ctx.fillStyle = "#20211f";
  ctx.textAlign = "center";
  ctx.font = "900 66px Georgia";
  ctx.fillText("LACROSSE DAILY", 450, 80);
  ctx.fillRect(40, 100, 820, 5);
  ctx.font = "900 39px Georgia";
  ctx.fillText("THE LATEST FROM THE LEAGUE", 450, 158);
  ctx.fillStyle = "#476a7b";
  ctx.fillRect(45, 190, 350, 195);
  ctx.fillStyle = "#222";
  for (let col = 0; col < 2; col += 1) for (let row = 0; row < 10; row += 1) ctx.fillRect(440 + col * 205, 195 + row * 20, 175 - row % 3 * 20, 7);
  for (let row = 0; row < 5; row += 1) ctx.fillRect(45, 420 + row * 19, 800 - row % 2 * 80, 7);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function buildHand() {
  hand = new THREE.Group();
  hand.position.set(0.42, -0.48, -0.82);
  hand.scale.setScalar(0.58);
  const skin = mat(0xc88f69, 0.72);
  const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.6, 7, 14), mat(0x25394f, 0.58));
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
    if (action && !introActive && !elevatorTravel && computerOverlay.classList.contains("hidden") && elevatorPanel.classList.contains("hidden")) {
      keys[action] = true;
      event.preventDefault();
    }
    if ((event.key === "e" || event.key === "E" || event.key === "Enter") && nearestInteraction && !introActive) useInteraction();
    if (event.key === "Escape") {
      computerOverlay.classList.add("hidden");
      if (inElevator && !elevatorTravel) exitElevator();
    }
  });
  addEventListener("keyup", (event) => {
    const action = keyAction(event.key);
    if (action) keys[action] = false;
  });
  moveButtons.forEach((button) => {
    const action = button.dataset.facilityMove;
    const start = (event) => { event.preventDefault(); if (!introActive && !inElevator) keys[action] = true; };
    const stop = (event) => { event.preventDefault(); keys[action] = false; };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  });
  host.addEventListener("pointerdown", (event) => { dragging = true; dragX = event.clientX; });
  addEventListener("pointermove", (event) => {
    if (!dragging || !active || introActive || inElevator) return;
    yaw -= (event.clientX - dragX) * 0.004;
    dragX = event.clientX;
  });
  addEventListener("pointerup", () => { dragging = false; });
  interactButton.addEventListener("click", useInteraction);
  document.querySelector("#facility-computer-close").addEventListener("click", () => computerOverlay.classList.add("hidden"));
  document.querySelector("#facility-elevator-close").addEventListener("click", exitElevator);
  floorButtons.forEach((button) => button.addEventListener("click", () => travelToFloor(Number(button.dataset.facilityFloor))));
  document.querySelectorAll("[data-facility-section]").forEach((button) => button.addEventListener("click", () => dispatchSection(button.dataset.facilitySection)));
}

function keyAction(key) {
  return { w: "forward", W: "forward", ArrowUp: "forward", s: "backward", S: "backward", ArrowDown: "backward", a: "left", A: "left", ArrowLeft: "left", d: "right", D: "right", ArrowRight: "right" }[key];
}

function open(config = {}) {
  currentConfig = config;
  init();
  active = true;
  computerOverlay.classList.add("hidden");
  elevatorPanel.classList.add("hidden");
  inElevator = false;
  elevatorTravel = null;
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  teamLabel.textContent = config.teamName || "Team Facility";
  overlay.style.setProperty("--facility-accent", config.accent || "#20ff9f");
  refreshDisplays();
  if (config.firstVisit) startEntrance();
  else if (savedPosition) {
    camera.position.copy(savedPosition);
    yaw = savedYaw;
    introActive = false;
    currentFloor = floorFromY(camera.position.y);
    mainDoorPivot.rotation.y = Math.PI * 0.52;
  } else {
    currentFloor = 1;
    camera.position.set(0, 1.66, 12.2);
    yaw = 0;
    introActive = false;
    mainDoorPivot.rotation.y = Math.PI * 0.52;
  }
  clock.start();
}

function close() {
  active = false;
  if (!introActive && !inElevator && !elevatorTravel) {
    savedPosition = camera.position.clone();
    savedYaw = yaw;
  }
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  computerOverlay.classList.add("hidden");
  elevatorPanel.classList.add("hidden");
}

function refreshDisplays() {
  replaceMaterial(buildingSign, makeScreenMaterial(currentConfig.teamName || "TEAM FACILITY", currentConfig.accent || "#20ff9f"));
  replaceMaterial(leaderboardScreen, makeLeaderboardMaterial());
  const legends = currentConfig.legends || [];
  hallPlaques.forEach((plaque, index) => replaceMaterial(plaque, makePlaqueMaterial(legends[index], index + 1)));
  if (stadiumTurf && stadiumTurf.material) {
    if (stadiumTurf.material.map) stadiumTurf.material.map.dispose();
    stadiumTurf.material.map = createBroadcastFieldTexture(currentConfig.teamName || "PRO LACROSSE", currentConfig.accent || "#ffffff");
    stadiumTurf.material.needsUpdate = true;
  }
}

function replaceMaterial(mesh, next) {
  if (!mesh) return;
  const previous = mesh.material;
  mesh.material = next;
  if (previous && previous.map) previous.map.dispose();
  if (previous) previous.dispose();
}

function startEntrance() {
  currentFloor = 1;
  introActive = true;
  introTime = 0;
  camera.position.set(0, 1.68, 26);
  yaw = 0;
  mainDoorPivot.rotation.y = 0;
  mainDoorHandle.rotation.z = 0;
  hand.visible = true;
  interactButton.classList.add("hidden");
}

function useInteraction() {
  if (!nearestInteraction || introActive || elevatorTravel) return;
  const action = nearestInteraction.action;
  if (action === "computer") {
    document.querySelector("#facility-computer-title").textContent = `${currentConfig.teamName || "Team"} GM Laptop`;
    computerOverlay.classList.remove("hidden");
    return;
  }
  if (action === "elevator") {
    enterElevator();
    return;
  }
  if (action === "tunnel") {
    tunnelDoorOpen = !tunnelDoorOpen;
    nearestInteraction.label = tunnelDoorOpen ? "Close Stadium Tunnel" : "Open Stadium Tunnel";
    interactButton.textContent = nearestInteraction.label;
    return;
  }
  dispatchSection(action);
}

function enterElevator() {
  inElevator = true;
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  camera.position.set(-10.72, floorBase(currentFloor) + 1.66, 0);
  yaw = -Math.PI / 2;
  setElevatorDoors(currentFloor, true);
  elevatorStatus.textContent = `Currently on floor ${currentFloor}`;
  floorButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.facilityFloor) === currentFloor));
  elevatorPanel.classList.remove("hidden");
  interactButton.classList.add("hidden");
}

function exitElevator() {
  if (!inElevator || elevatorTravel) return;
  inElevator = false;
  elevatorPanel.classList.add("hidden");
  camera.position.set(-9.1, floorBase(currentFloor) + 1.66, 0);
  yaw = Math.PI / 2;
  locationLabel.textContent = floorName(currentFloor);
  window.setTimeout(() => setElevatorDoors(currentFloor, false), 700);
}

function travelToFloor(targetFloor) {
  if (!inElevator || elevatorTravel || targetFloor === currentFloor) return;
  elevatorTravel = {
    from: currentFloor,
    to: targetFloor,
    time: 0,
    startY: floorBase(currentFloor) + 1.66,
    endY: floorBase(targetFloor) + 1.66
  };
  setElevatorDoors(currentFloor, false);
  elevatorStatus.textContent = `Going to floor ${targetFloor}`;
  floorButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.facilityFloor) === targetFloor));
}

function dispatchSection(section) {
  computerOverlay.classList.add("hidden");
  window.dispatchEvent(new CustomEvent("facility-open-section", { detail: { section } }));
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
    person.position.y = (person.userData.baseY || 0) + Math.sin(time * 1.1 + index) * 0.008;
    person.rotation.z = Math.sin(time * 0.7 + index) * 0.006;
  });
  tunnelDoorProgress = THREE.MathUtils.lerp(tunnelDoorProgress, tunnelDoorOpen ? 1 : 0, Math.min(1, dt * 3.2));
  if (tunnelDoorPivot) tunnelDoorPivot.rotation.y = -tunnelDoorProgress * Math.PI * 0.52;
  if (introActive) updateEntrance(dt);
  else if (elevatorTravel) updateElevatorTravel(dt);
  else if (!inElevator && computerOverlay.classList.contains("hidden")) updateWalking(dt);
  updateCameraLook();
}

function updateEntrance(dt) {
  introTime += dt;
  camera.position.z = THREE.MathUtils.lerp(26, 16.1, smoothstep(0.3, 2.45, introTime));
  const reach = smoothstep(2.2, 3, introTime) * (1 - smoothstep(4.1, 4.8, introTime));
  hand.position.set(0.42 - reach * 0.18, -0.48 + reach * 0.24, -0.82 - reach * 0.3);
  hand.rotation.z = -reach * 0.55;
  mainDoorHandle.rotation.z = -smoothstep(2.65, 3.3, introTime) * 0.78;
  mainDoorPivot.rotation.y = smoothstep(3.05, 4.5, introTime) * Math.PI * 0.52;
  if (introTime > 4.1) camera.position.z = THREE.MathUtils.lerp(16.1, 12.2, smoothstep(4.1, 6.1, introTime));
  locationLabel.textContent = introTime < 2.4 ? "Front Entrance" : introTime < 4.6 ? "Opening Main Door" : "Reception Lobby";
  if (introTime >= 6.2) {
    introActive = false;
    camera.position.set(0, 1.66, 12.2);
    yaw = 0;
    hand.position.set(0.42, -0.48, -0.82);
    hand.rotation.z = 0;
    window.dispatchEvent(new Event("facility-entrance-complete"));
  }
}

function updateElevatorTravel(dt) {
  elevatorTravel.time += dt;
  const progress = smoothstep(0, 2.4, elevatorTravel.time);
  camera.position.y = THREE.MathUtils.lerp(elevatorTravel.startY, elevatorTravel.endY, progress);
  camera.position.x = -10.72;
  camera.position.z = 0;
  locationLabel.textContent = `Elevator | Floor ${elevatorTravel.to}`;
  if (elevatorTravel.time >= 2.5) {
    currentFloor = elevatorTravel.to;
    elevatorTravel = null;
    setElevatorDoors(currentFloor, true);
    elevatorStatus.textContent = `Arrived at floor ${currentFloor}`;
    window.setTimeout(exitElevator, 450);
  }
}

function setElevatorDoors(floor, open) {
  const doors = elevatorDoors[floor];
  if (!doors) return;
  doors.left.position.z = open ? -1.7 : -0.92;
  doors.right.position.z = open ? 1.7 : 0.92;
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
    const speed = 4 * dt / length;
    const forwardX = Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = Math.sin(yaw);
    const nextX = camera.position.x + (forwardX * forward + rightX * side) * speed;
    const nextZ = camera.position.z + (forwardZ * forward + rightZ * side) * speed;
    if (canOccupy(nextX, camera.position.z)) camera.position.x = nextX;
    if (canOccupy(camera.position.x, nextZ)) camera.position.z = nextZ;
    camera.position.y = floorBase(currentFloor) + 1.66 + Math.sin(performance.now() * 0.012) * 0.025;
    hand.position.y = -0.48 + Math.sin(performance.now() * 0.012) * 0.018;
  }
  updateNearestInteraction();
  locationLabel.textContent = locationFor(camera.position.x, camera.position.z, currentFloor);
}

function updateNearestInteraction() {
  nearestInteraction = null;
  let nearestDistance = Infinity;
  interactions.forEach((interaction) => {
    if (interaction.floor !== currentFloor) return;
    const distance = Math.hypot(camera.position.x - interaction.x, camera.position.z - interaction.z);
    if (distance < 2.5 && distance < nearestDistance) {
      nearestDistance = distance;
      nearestInteraction = interaction;
    }
  });
  interactButton.classList.toggle("hidden", !nearestInteraction || inElevator);
  if (nearestInteraction) interactButton.textContent = nearestInteraction.label;
}

function canOccupy(x, z) {
  if (currentFloor === 1 && x > 11.2) {
    const tunnel = tunnelDoorOpen && x <= 23.5 && z >= 6.25 && z <= 10.55;
    const stadium = x >= 21.5 && x <= 40 && z >= -15.8 && z <= 15.8;
    if (!tunnel && !stadium) return false;
  } else if (x < -10.7 || x > 10.7 || z < -13.8 || z > 13.8) return false;
  return !obstacles.some((obstacle) => obstacle.floor === currentFloor && x > obstacle.minX && x < obstacle.maxX && z > obstacle.minZ && z < obstacle.maxZ);
}

function locationFor(x, z, floor) {
  if (floor === 1) {
    if (x > 22) return "Home Stadium";
    if (x > 10.7) return "Stadium Tunnel";
    if (z < 2.5) return "Press Conference Level";
    return "Reception Lobby";
  }
  if (floor === 2) {
    if (z < -3) return "General Manager Office";
    if (z > 3) return "Trade Office";
    if (x > 2) return "Trophy Room";
    return "Second Floor Hallway";
  }
  if (z < 0) return "Hall of Fame";
  if (z > 3) return "Draft Stage";
  return "Third Floor Hallway";
}

function updateCameraLook() {
  camera.lookAt(camera.position.x + Math.sin(yaw) * 7, camera.position.y - 0.08, camera.position.z - Math.cos(yaw) * 7);
}

function addInteraction(floor, x, z, label, action) {
  interactions.push({ floor, x, z, label, action });
}

function addObstacle(floor, x, z, width, depth, padding = 0.35) {
  obstacles.push({ floor, minX: x - width / 2 - padding, maxX: x + width / 2 + padding, minZ: z - depth / 2 - padding, maxZ: z + depth / 2 + padding });
}

function floorBase(floor) {
  return (floor - 1) * FLOOR_HEIGHT;
}

function floorFromY(y) {
  return THREE.MathUtils.clamp(Math.round((y - 1.66) / FLOOR_HEIGHT) + 1, 1, 3);
}

function floorName(floor) {
  return floor === 1 ? "Reception Lobby" : floor === 2 ? "Second Floor Hallway" : "Third Floor Hallway";
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
