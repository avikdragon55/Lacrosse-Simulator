import * as THREE from "./vendor/three.module.js";

const overlay = document.querySelector("#lax-broadcast");
const host = document.querySelector("#lax-broadcast-scene");
const FIELD = { width: 14, length: 26, goalZ: 10.25 };
const ui = {
  awayTeam: document.querySelector("#lax-away-team"),
  homeTeam: document.querySelector("#lax-home-team"),
  awayName: document.querySelector("#lax-away-team .lax-team-name"),
  homeName: document.querySelector("#lax-home-team .lax-team-name"),
  awayScore: document.querySelector("#lax-away-score"),
  homeScore: document.querySelector("#lax-home-score"),
  quarter: document.querySelector("#lax-quarter"),
  clock: document.querySelector("#lax-clock"),
  possession: document.querySelector("#lax-possession"),
  week: document.querySelector("#lax-week-label"),
  event: document.querySelector("#lax-event-label"),
  periods: [1, 2, 3, 4].map((number) => document.querySelector(`#lax-p${number}`)),
  key: document.querySelector("#lax-broadcast .lax-field-key"),
  weather: document.querySelector("#lax-weather"),
  camera: document.querySelector("#lax-camera"),
  sound: document.querySelector("#lax-sound"),
  hotPlayer: document.querySelector("#lax-hot-player strong"),
  replay: document.querySelector("#lax-replay")
};

let renderer;
let scene;
let camera;
let clock;
let ball;
let ballShadow;
let players = [];
let active = false;
let config = null;
let simTime = 0;
let possession = "home";
let carrierIndex = 1;
let shot = null;
let cameraTarget = new THREE.Vector3();
let goalFlash = 0;
let finishTimer = null;
let fieldMesh;
let crowdHeads;
let crowdBodies;
let crowdFans = [];
let crowdPulse = 0;
let weatherParticles;
let weatherMode = "clear";
let venueLights = [];
let venueBanners = [];
let cameraMode = 0;
let simSpeed = 1;
let soundOn = true;
let audioContext;
let ambientSource;
let replayShot = null;
let replayPending = false;
let lastShot = null;
let replayDelay = 0;
let replayActive = false;
const cameraModes = ["Broadcast", "Sideline", "Behind Goal", "Overhead"];

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07100d);
  scene.fog = new THREE.FogExp2(0x07100d, 0.026);
  camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.05, 90);
  camera.position.set(12.5, 10.5, 16.5);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  buildVenue();
  buildBall();
  buildTeams();
  buildWeather();
  bindControls();
  addEventListener("resize", resize);
  animate();
}

function bindControls() {
  ui.weather.addEventListener("change", () => setWeather(ui.weather.value));
  ui.camera.addEventListener("click", () => {
    cameraMode = (cameraMode + 1) % cameraModes.length;
    ui.camera.textContent = cameraModes[cameraMode];
  });
  ui.sound.addEventListener("click", () => {
    soundOn = !soundOn;
    ui.sound.textContent = soundOn ? "Sound On" : "Sound Off";
    if (!soundOn) stopAmbient();
    else if (active) startAmbient();
  });
  document.querySelectorAll("[data-lax-speed]").forEach((button) => button.addEventListener("click", () => setSpeed(Number(button.dataset.laxSpeed))));
}

function setSpeed(speed) {
  simSpeed = [1, 2, 3].includes(speed) ? speed : 1;
  document.querySelectorAll("[data-lax-speed]").forEach((button) => button.classList.toggle("active", Number(button.dataset.laxSpeed) === simSpeed));
}

function getSpeed() {
  return simSpeed;
}

function buildVenue() {
  scene.add(new THREE.HemisphereLight(0xd8efff, 0x162216, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 3.2);
  sun.position.set(-8, 18, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  scene.add(sun);
  [[-10, -13], [10, -13], [-10, 13], [10, 13]].forEach(([x, z]) => {
    const light = new THREE.SpotLight(0xffffff, 105, 42, Math.PI / 4.5, 0.65, 1.5);
    light.position.set(x, 13, z);
    light.target.position.set(0, 0, z * 0.25);
    scene.add(light, light.target);
    venueLights.push(light);
  });

  const turfTexture = createFieldTexture();
  turfTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(FIELD.width, FIELD.length),
    new THREE.MeshStandardMaterial({ map: turfTexture, roughness: 0.93 })
  );
  turf.rotation.x = -Math.PI / 2;
  turf.receiveShadow = true;
  scene.add(turf);
  fieldMesh = turf;

  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(FIELD.width + 6, FIELD.length + 5),
    new THREE.MeshStandardMaterial({ color: 0x151b1c, roughness: 0.88 })
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.y = -0.025;
  scene.add(apron);
  buildGoal(-1);
  buildGoal(1);
  buildStands();
  buildSideline();
  buildVenueBranding();
}

function buildVenueBranding() {
  [-1, 1].forEach((side) => {
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.15),
      new THREE.MeshStandardMaterial({ color: 0x16362a, emissive: 0x0b1b15, emissiveIntensity: 0.6, roughness: 0.55 })
    );
    banner.position.set(side * 6.95, 4.2, 0);
    banner.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(banner);
    venueBanners.push(banner);
  });
  [-1, 1].forEach((side) => {
    const goalLight = new THREE.PointLight(0xffffff, 0, 9, 2);
    goalLight.position.set(0, 2.8, side * FIELD.goalZ);
    scene.add(goalLight);
    venueLights.push(goalLight);
  });
}

function createFieldTexture(homeName = "PRO LACROSSE", accent = "#ffffff") {
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
  for (let i = 0; i < 24000; i += 1) {
    const shade = Math.floor(70 + Math.random() * 50);
    ctx.fillStyle = `rgba(${shade * 0.35},${shade},${shade * 0.58},.08)`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 3);
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
  ctx.strokeStyle = "rgba(255,255,255,.34)";
  ctx.lineWidth = 3;
  for (let yard = -9; yard <= 9; yard += 1) {
    ctx.beginPath();
    ctx.moveTo(x(-0.18), z(yard));
    ctx.lineTo(x(0.18), z(yard));
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.68)";
  ctx.font = "900 58px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(homeName.toUpperCase(), canvas.width / 2, canvas.height / 2 - 90);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildGoal(side) {
  const z = side * FIELD.goalZ;
  const depthDirection = side;
  const frame = new THREE.MeshStandardMaterial({ color: 0xff6238, metalness: 0.34, roughness: 0.28 });
  const postGeometry = new THREE.CylinderGeometry(0.035, 0.035, 1.45, 12);
  [-0.72, 0.72].forEach((x) => {
    const post = new THREE.Mesh(postGeometry, frame);
    post.position.set(x, 0.725, z);
    post.castShadow = true;
    scene.add(post);
  });
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.44, 12), frame);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, 1.45, z);
  scene.add(crossbar);
  const baseLeft = new THREE.Vector3(-0.72, 0, z);
  const baseRight = new THREE.Vector3(0.72, 0, z);
  const back = new THREE.Vector3(0, 0.28, z + depthDirection * 1.05);
  const topBack = new THREE.Vector3(0, 1.12, z + depthDirection * 0.86);
  const netPoints = [];
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    const bottom = baseLeft.clone().lerp(baseRight, t);
    const top = new THREE.Vector3(THREE.MathUtils.lerp(-0.72, 0.72, t), 1.45, z);
    netPoints.push(bottom, back, top, topBack, bottom, top);
  }
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8;
    netPoints.push(baseLeft.clone().lerp(new THREE.Vector3(-0.02, 0.28, back.z), t), baseRight.clone().lerp(new THREE.Vector3(0.02, 0.28, back.z), t));
    netPoints.push(new THREE.Vector3(-0.72 * (1 - t), t * 1.45, z + depthDirection * t * 0.86), new THREE.Vector3(0.72 * (1 - t), t * 1.45, z + depthDirection * t * 0.86));
  }
  const net = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(netPoints),
    new THREE.LineBasicMaterial({ color: 0xf7f7f3, transparent: true, opacity: 0.78 })
  );
  scene.add(net);
}

function buildStands() {
  const concrete = new THREE.MeshStandardMaterial({ color: 0x1a2024, roughness: 0.86 });
  for (const side of [-1, 1]) {
    for (let row = 0; row < 5; row += 1) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, FIELD.length + 5), concrete);
      step.position.set(side * (8.25 + row * 0.92), 0.2 + row * 0.4, 0);
      scene.add(step);
    }
  }
  const count = 430;
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.8 }), count);
  const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.12, 0.22, 4, 6), new THREE.MeshStandardMaterial({ roughness: 0.72 }), count);
  crowdHeads = heads;
  crowdBodies = bodies;
  crowdFans = [];
  const dummy = new THREE.Object3D();
  const shirts = [0x20ff9f, 0xf04f5f, 0x3b8bd8, 0xf0be4f, 0xf2f3f4, 0x693fa3];
  const skins = [0x5f3b2b, 0x936246, 0xc88b65, 0xe4b38c];
  const color = new THREE.Color();
  let index = 0;
  for (const side of [-1, 1]) {
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 43 && index < count; col += 1) {
        const px = side * (8 + row * 0.92);
        const py = 0.64 + row * 0.4;
        const pz = -14.6 + col * 0.69;
        crowdFans.push({ x: px, y: py, z: pz, row, index });
        dummy.position.set(px, py + 0.24, pz);
        dummy.updateMatrix();
        heads.setMatrixAt(index, dummy.matrix);
        heads.setColorAt(index, color.setHex(skins[(index + row) % skins.length]));
        dummy.position.set(px, py, pz);
        dummy.updateMatrix();
        bodies.setMatrixAt(index, dummy.matrix);
        bodies.setColorAt(index, color.setHex(shirts[(index * 3 + row) % shirts.length]));
        index += 1;
      }
    }
  }
  heads.instanceMatrix.needsUpdate = true;
  bodies.instanceMatrix.needsUpdate = true;
  scene.add(heads, bodies);
}

function updateCrowdColors() {
  if (!crowdBodies || !config) return;
  const palette = [config.home.color, config.home.color, config.away.color, 0xf1f3f4, 0x1d252a];
  const color = new THREE.Color();
  crowdFans.forEach((fan) => crowdBodies.setColorAt(fan.index, color.set(palette[(fan.index * 3 + fan.row) % palette.length])));
  if (crowdBodies.instanceColor) crowdBodies.instanceColor.needsUpdate = true;
}

function updateCrowd(dt) {
  if (crowdPulse <= 0 || !crowdHeads || !crowdBodies) return;
  crowdPulse = Math.max(0, crowdPulse - dt * 1.25);
  const dummy = new THREE.Object3D();
  crowdFans.forEach((fan) => {
    const jump = Math.abs(Math.sin(simTime * 15 + fan.index * 0.7)) * 0.2 * crowdPulse;
    dummy.position.set(fan.x, fan.y + 0.24 + jump, fan.z);
    dummy.updateMatrix();
    crowdHeads.setMatrixAt(fan.index, dummy.matrix);
    dummy.position.set(fan.x, fan.y + jump, fan.z);
    dummy.updateMatrix();
    crowdBodies.setMatrixAt(fan.index, dummy.matrix);
  });
  crowdHeads.instanceMatrix.needsUpdate = true;
  crowdBodies.instanceMatrix.needsUpdate = true;
}

function buildSideline() {
  const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x30383e, metalness: 0.48, roughness: 0.38 });
  [-4.3, 4.3].forEach((z) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 3.2), benchMaterial);
    bench.position.set(7.65, 0.42, z);
    scene.add(bench);
  });
  const table = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.68, 3.4), new THREE.MeshStandardMaterial({ color: 0x10171a, roughness: 0.6 }));
  table.position.set(-7.6, 0.34, 0);
  scene.add(table);
}

function buildBall() {
  ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf8e66a, roughness: 0.5 }));
  ball.castShadow = true;
  scene.add(ball);
  ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.1, 18), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }));
  ballShadow.rotation.x = -Math.PI / 2;
  ballShadow.position.y = 0.012;
  scene.add(ballShadow);
}

function buildWeather() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 38;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  weatherParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xbfe8ff, size: 0.055, transparent: true, opacity: 0.66, depthWrite: false }));
  weatherParticles.visible = false;
  scene.add(weatherParticles);
}

function setWeather(mode) {
  weatherMode = ["clear", "rain", "snow", "night"].includes(mode) ? mode : "clear";
  ui.weather.value = weatherMode;
  weatherParticles.visible = weatherMode === "rain" || weatherMode === "snow";
  weatherParticles.material.color.set(weatherMode === "snow" ? 0xffffff : 0x9edcff);
  weatherParticles.material.size = weatherMode === "snow" ? 0.11 : 0.045;
  weatherParticles.material.opacity = weatherMode === "snow" ? 0.82 : 0.58;
  scene.background.set(weatherMode === "night" ? 0x010506 : weatherMode === "rain" ? 0x10191a : weatherMode === "snow" ? 0x9ba9aa : 0x07100d);
  scene.fog.color.copy(scene.background);
  scene.fog.density = weatherMode === "night" ? 0.038 : weatherMode === "rain" ? 0.035 : weatherMode === "snow" ? 0.028 : 0.026;
  venueLights.slice(0, 4).forEach((light) => { light.intensity = weatherMode === "night" ? 190 : weatherMode === "rain" ? 135 : 105; });
  if (fieldMesh) {
    fieldMesh.material.roughness = weatherMode === "rain" ? 0.52 : 0.93;
    fieldMesh.material.color.set(weatherMode === "night" ? 0x8bb59e : weatherMode === "snow" ? 0xd5dfd8 : 0xffffff);
  }
}

function updateWeather(dt) {
  if (!weatherParticles.visible) return;
  const positions = weatherParticles.geometry.attributes.position;
  const fall = weatherMode === "snow" ? 1.35 : 12;
  for (let i = 0; i < positions.count; i += 1) {
    let y = positions.getY(i) - fall * dt;
    let x = positions.getX(i) + (weatherMode === "snow" ? Math.sin(simTime + i) * dt * 0.18 : -dt * 1.8);
    if (y < 0) {
      y = 14 + Math.random() * 4;
      x = (Math.random() - 0.5) * 30;
    }
    positions.setXY(i, x, y);
  }
  positions.needsUpdate = true;
}

function ensureAudio() {
  if (!soundOn) return null;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function startAmbient() {
  const context = ensureAudio();
  if (!context || ambientSource) return;
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.11;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.loop = true;
  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = 780;
  gain.gain.value = 0.055;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
  ambientSource = source;
}

function stopAmbient() {
  if (!ambientSource) return;
  try { ambientSource.stop(); } catch {}
  ambientSource = null;
}

function tone(frequency, duration, type = "sine", volume = 0.04, delay = 0) {
  const context = ensureAudio();
  if (!context) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(context.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function eventSound(type) {
  if (!soundOn) return;
  if (type === "goal") {
    tone(185, 0.5, "sawtooth", 0.07);
    tone(277, 0.45, "square", 0.045, 0.08);
    tone(415, 0.55, "triangle", 0.04, 0.16);
  } else if (type === "save") tone(118, 0.12, "square", 0.035);
  else if (type === "penalty") tone(880, 0.22, "sine", 0.045);
  else if (type === "hit") tone(72, 0.09, "sine", 0.06);
  else if (type === "faceoff") tone(620, 0.09, "square", 0.03);
  else tone(290, 0.06, "triangle", 0.018);
}

function buildTeams() {
  players = [];
  for (const side of ["away", "home"]) {
    for (let index = 0; index < 10; index += 1) {
      const group = createAthlete(index === 9);
      group.userData.side = side;
      group.userData.index = index;
      group.userData.role = index < 3 ? "Attack" : index < 6 ? "Midfield" : index < 9 ? "Defense" : "Goalie";
      group.scale.setScalar(0.86);
      scene.add(group);
      players.push(group);
    }
  }
}

function createAthlete(goalie) {
  const group = new THREE.Group();
  const uniform = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.58 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x20252a, roughness: 0.62 });
  const skin = new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0x9b6749 : 0xd2a17d, roughness: 0.75 });
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.18, roughness: 0.42 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(goalie ? 0.3 : 0.25, goalie ? 0.34 : 0.29, 0.62, 14), uniform);
  torso.position.y = 1.25;
  torso.castShadow = true;
  group.add(torso);
  const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.31, 0.3, 12), trim);
  shorts.position.y = 0.82;
  group.add(shorts);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), skin);
  head.position.y = 1.76;
  group.add(head);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.72), helmetMaterial);
  helmet.position.y = 1.81;
  group.add(helmet);
  const cage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.3, 0.18, 0.16)),
    new THREE.LineBasicMaterial({ color: 0xb8c3ca })
  );
  cage.position.set(0, 1.72, -0.15);
  group.add(cage);
  const arms = [];
  const legs = [];
  [-1, 1].forEach((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.15, 0.72, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 5, 8), skin);
    upper.position.y = -0.2;
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.3, 5, 8), skin);
    lower.position.y = -0.52;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.32), trim);
    shoe.position.set(0, -0.73, -0.08);
    leg.add(upper, lower, shoe);
    group.add(leg);
    legs.push(leg);
    const arm = new THREE.Group();
    arm.position.set(side * 0.31, 1.43, 0);
    const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.42, 5, 8), skin);
    limb.position.y = -0.22;
    arm.add(limb);
    group.add(arm);
    arms.push(arm);
  });
  const stick = createStick(goalie);
  stick.position.set(0.34, 1.08, -0.22);
  stick.rotation.z = -0.3;
  group.add(stick);
  group.userData = { uniform, trim, helmetMaterial, torso, arms, legs, stick, goalie, side: "", index: 0, velocity: new THREE.Vector3() };
  return group;
}

function createStick(goalie) {
  const stick = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, goalie ? 1.65 : 1.35, 8), new THREE.MeshStandardMaterial({ color: 0xcbd4d9, metalness: 0.6, roughness: 0.25 }));
  shaft.position.y = -0.55;
  stick.add(shaft);
  const headWidth = goalie ? 0.52 : 0.32;
  const headHeight = goalie ? 0.5 : 0.34;
  const head = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(headWidth, headHeight, 0.06)),
    new THREE.LineBasicMaterial({ color: 0xf5f7f8 })
  );
  head.position.y = goalie ? 0.48 : 0.32;
  stick.add(head);
  const meshPoints = [];
  for (let i = -2; i <= 2; i += 1) {
    meshPoints.push(new THREE.Vector3(i * headWidth / 5, head.position.y - headHeight / 2, 0), new THREE.Vector3(i * headWidth / 5, head.position.y + headHeight / 2, 0));
  }
  stick.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(meshPoints), new THREE.LineBasicMaterial({ color: 0xe8edf0, transparent: true, opacity: 0.7 })));
  return stick;
}

function setTeamAppearance(teamPlayers, color, selected) {
  const primary = new THREE.Color(color);
  teamPlayers.forEach((player) => {
    player.userData.uniform.color.copy(primary);
    player.userData.helmetMaterial.color.copy(primary).offsetHSL(0, -0.08, 0.16);
    player.userData.trim.color.set(selected ? 0x20ff9f : 0x171c20);
    if (!player.userData.highlight) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.31, 0.39, 28), new THREE.MeshBasicMaterial({ color: 0x20ff9f, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.015;
      player.add(ring);
      player.userData.highlight = ring;
    }
    player.userData.highlight.visible = selected;
  });
}

function setHotPlayers() {
  players.forEach((player) => {
    if (!player.userData.hotRing) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 28), new THREE.MeshBasicMaterial({ color: 0xffc74a, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      player.add(ring);
      player.userData.hotRing = ring;
    }
    player.userData.hotRing.visible = false;
  });
  const homeHot = players.find((player) => player.userData.side === "home" && player.userData.index === (config.hotHome?.index ?? 0));
  const awayHot = players.find((player) => player.userData.side === "away" && player.userData.index === (config.hotAway?.index ?? 0));
  if (homeHot) homeHot.userData.hotRing.visible = true;
  if (awayHot) awayHot.userData.hotRing.visible = true;
  ui.hotPlayer.textContent = config.selectedSide === "home" ? config.hotHome?.name || "Home playmaker" : config.hotAway?.name || "Away playmaker";
}

function createPanelTexture(text, background) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 220;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 74px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function start(nextConfig) {
  if (!renderer) init();
  config = nextConfig;
  active = true;
  simTime = 0;
  possession = "home";
  carrierIndex = 1;
  shot = null;
  goalFlash = 0;
  crowdPulse = 0;
  replayPending = false;
  replayShot = null;
  lastShot = null;
  cameraMode = 0;
  ui.camera.textContent = cameraModes[0];
  setSpeed(1);
  if (finishTimer) clearTimeout(finishTimer);
  overlay.classList.remove("hidden");
  const awayPlayers = players.filter((player) => player.userData.side === "away");
  const homePlayers = players.filter((player) => player.userData.side === "home");
  setTeamAppearance(awayPlayers, config.away.color, config.selectedSide === "away");
  setTeamAppearance(homePlayers, config.home.color, config.selectedSide === "home");
  setHotPlayers();
  resetFormation(awayPlayers, "away");
  resetFormation(homePlayers, "home");
  ui.awayName.textContent = config.away.name;
  ui.homeName.textContent = config.home.name;
  ui.awayTeam.style.setProperty("--broadcast-team", config.away.color);
  ui.homeTeam.style.setProperty("--broadcast-team", config.home.color);
  ui.awayScore.textContent = "0";
  ui.homeScore.textContent = "0";
  ui.quarter.textContent = "Q1";
  ui.clock.textContent = "12:00";
  ui.week.textContent = config.label || `WEEK ${config.week}`;
  ui.event.textContent = "Opening faceoff";
  ui.possession.textContent = "Opening faceoff at midfield";
  ui.periods.forEach((period) => { period.textContent = "0-0"; });
  ui.key.querySelector("span").style.background = config.selectedColor;
  ui.key.querySelector("span").style.boxShadow = `0 0 12px ${config.selectedColor}`;
  ui.key.classList.toggle("hidden", !config.selectedSide);
  fieldMesh.material.map = createFieldTexture(config.home.name, config.home.color);
  fieldMesh.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  fieldMesh.material.needsUpdate = true;
  venueBanners.forEach((banner, index) => {
    banner.material.map = createPanelTexture(index ? config.away.name : config.home.name, index ? config.away.color : config.home.color);
    banner.material.emissive.set(index ? config.away.color : config.home.color);
    banner.material.needsUpdate = true;
  });
  venueLights.slice(-2)[0].color.set(config.away.color);
  venueLights.slice(-2)[1].color.set(config.home.color);
  venueLights.slice(-2).forEach((light) => { light.intensity = 1.8; });
  updateCrowdColors();
  setWeather(ui.weather.value || "clear");
  ui.replay.classList.add("hidden");
  startAmbient();
  clock.start();
}

function resetFormation(teamPlayers, side) {
  const attackDirection = side === "home" ? 1 : -1;
  const positions = [
    [-3.1, attackDirection * 7.1], [0, attackDirection * 6.1], [3.1, attackDirection * 7.1],
    [-3.8, attackDirection * 2.2], [0, attackDirection * 1.1], [3.8, attackDirection * 2.2],
    [-3.2, -attackDirection * 4.6], [0, -attackDirection * 5.4], [3.2, -attackDirection * 4.6],
    [0, -attackDirection * 9.65]
  ];
  teamPlayers.forEach((player, index) => {
    player.position.set(positions[index][0], 0, positions[index][1]);
    player.userData.velocity.set(0, 0, 0);
  });
}

function playEvent(gameEvent, live) {
  if (!active) return { replay: false };
  possession = gameEvent.team;
  const sidePlayers = players.filter((player) => player.userData.side === gameEvent.team);
  carrierIndex = live.index % 6;
  const carrier = sidePlayers[carrierIndex];
  const targetZ = gameEvent.team === "home" ? FIELD.goalZ : -FIELD.goalZ;
  const type = gameEvent.type || "goal";
  const labels = {
    faceoff: "Faceoff won cleanly",
    save: "Goalie save and outlet",
    turnover: "Forced turnover",
    penalty: "Flag down - extra-man chance",
    hit: "Clean body check",
    clear: "Successful clear",
    shotWide: "Shot misses wide",
    pass: "Quick passing sequence"
  };
  let importantReplay = false;
  if (type === "goal") {
    shot = {
      start: carrier.position.clone().add(new THREE.Vector3(0.32, 1.18, 0)),
      end: new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.78 + Math.random() * 0.45, targetZ),
      progress: 0,
      duration: 0.46
    };
    lastShot = { start: shot.start.clone(), end: shot.end.clone() };
    importantReplay = live.index % 6 === 0 || (gameEvent.quarter >= 2 && Math.abs(live.hs - live.as) <= 1);
    replayPending = importantReplay;
    replayShot = importantReplay ? { start: shot.start.clone(), end: shot.end.clone() } : null;
    goalFlash = 1;
    crowdPulse = 1;
    ui.event.textContent = `${gameEvent.team === "home" ? config.home.name : config.away.name} scores`;
    ui.possession.textContent = `${carrierIndex === 5 ? "Transition" : carrierIndex === 4 ? "Outside rip" : "Quick-stick finish"} - GOAL`;
  } else {
    if (type === "turnover" || type === "clear") possession = gameEvent.team;
    if (type === "faceoff") ball.position.set(0, 0.15, 0);
    if (type === "save" || type === "shotWide") {
      shot = {
        start: carrier.position.clone().add(new THREE.Vector3(0.32, 1.18, 0)),
        end: new THREE.Vector3(type === "shotWide" ? 1.3 : 0.35, type === "shotWide" ? 1.65 : 0.95, targetZ + (gameEvent.team === "home" ? -0.25 : 0.25)),
        progress: 0,
        duration: 0.38
      };
    }
    goalFlash = type === "hit" || type === "penalty" ? 0.28 : 0.08;
    ui.event.textContent = labels[type] || "Live possession";
    ui.possession.textContent = `${gameEvent.team === "home" ? config.home.name : config.away.name}: ${labels[type] || "settled offense"}`;
  }
  ui.homeScore.textContent = live.hs;
  ui.awayScore.textContent = live.as;
  ui.quarter.textContent = `Q${gameEvent.quarter + 1}`;
  const quarterEvents = config.events.filter((item) => item.quarter === gameEvent.quarter);
  const completed = config.events.slice(0, live.index).filter((item) => item.quarter === gameEvent.quarter).length;
  const remaining = Math.max(0, Math.round(720 * (1 - completed / Math.max(1, quarterEvents.length))));
  ui.clock.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  live.quarters.forEach((period, index) => { ui.periods[index].textContent = `${period[1]}-${period[0]}`; });
  ui.hotPlayer.textContent = gameEvent.team === "home" ? config.hotHome?.name || "Home playmaker" : config.hotAway?.name || "Away playmaker";
  eventSound(type);
  return { replay: importantReplay };
}

function finish(done) {
  if (!active) {
    done();
    return;
  }
  ui.quarter.textContent = "FINAL";
  ui.clock.textContent = "0:00";
  ui.event.textContent = "Final horn";
  ui.possession.textContent = `${config.away.name} ${ui.awayScore.textContent} - ${config.home.name} ${ui.homeScore.textContent}`;
  finishTimer = setTimeout(() => {
    active = false;
    overlay.classList.add("hidden");
    stopAmbient();
    done();
  }, 1400 / simSpeed);
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer || !scene || !camera) return;
  const dt = Math.min(0.04, clock ? clock.getDelta() : 0.016);
  if (active) update(dt);
  renderer.render(scene, camera);
}

function update(dt) {
  const scaledDt = dt * simSpeed;
  simTime += scaledDt;
  updatePlayers(scaledDt);
  if (replayDelay > 0) {
    replayDelay -= scaledDt;
    if (replayDelay <= 0 && replayShot) {
      replayActive = true;
      ui.replay.classList.remove("hidden");
      shot = { start: replayShot.start.clone(), end: replayShot.end.clone(), progress: 0, duration: 0.9 };
    }
  }
  updateBall(scaledDt);
  updateCamera(dt);
  updateWeather(scaledDt);
  updateCrowd(scaledDt);
  goalFlash = Math.max(0, goalFlash - scaledDt * 4.5);
  renderer.toneMappingExposure = 1.12 + goalFlash * 0.32;
}

function updatePlayers(dt) {
  const phase = simTime * 5.8;
  players.forEach((player) => {
    const side = player.userData.side;
    const index = player.userData.index;
    const isOffense = side === possession;
    const attackDirection = side === "home" ? 1 : -1;
    const role = player.userData.role;
    let targetX;
    let targetZ;
    if (player.userData.goalie) {
      targetX = Math.sin(phase * 0.45) * 0.3;
      targetZ = -attackDirection * (FIELD.goalZ - 0.52);
    } else if (isOffense) {
      if (role === "Attack") {
        targetX = [-3.4, 0, 3.4][index] + Math.sin(phase + index) * 0.5;
        targetZ = attackDirection * (7.2 + (index % 2) * 1.2) + Math.sin(phase * 0.72 + index) * 0.8;
      } else if (role === "Midfield") {
        targetX = [-4.1, 0, 4.1][index - 3] + Math.sin(phase + index) * 0.65;
        targetZ = attackDirection * (2.2 + ((index + Math.floor(phase)) % 3) * 1.35) + Math.sin(phase * 0.8 + index) * 1.2;
      } else {
        targetX = [-3.2, 0, 3.2][index - 6] + Math.sin(phase + index) * 0.35;
        targetZ = -attackDirection * (3.7 + (index % 2) * 1.1);
      }
    } else {
      const markIndex = role === "Defense" ? index - 6 : role === "Midfield" ? index : index + 6;
      const mark = players.find((candidate) => candidate.userData.side === possession && candidate.userData.index === markIndex);
      targetX = (mark ? mark.position.x : 0) + Math.sin(index) * 0.35;
      targetZ = (mark ? mark.position.z : 0) - (possession === "home" ? -1 : 1) * 0.78;
    }
    const target = new THREE.Vector3(targetX, 0, targetZ);
    const delta = target.sub(player.position);
    const distance = delta.length();
    const speed = player.userData.goalie ? 3.2 : isOffense ? 8.8 : 7.9;
    if (distance > 0.03) {
      const step = delta.normalize().multiplyScalar(Math.min(distance, speed * dt));
      player.position.add(step);
      player.userData.velocity.lerp(step.divideScalar(Math.max(dt, 0.001)), 0.3);
      player.rotation.y = Math.atan2(player.userData.velocity.x, player.userData.velocity.z);
    }
    const stride = Math.sin(phase * 2.8 + index) * Math.min(0.62, distance * 0.2);
    player.userData.legs[0].rotation.x = stride;
    player.userData.legs[1].rotation.x = -stride;
    player.userData.arms[0].rotation.x = -stride * 0.6;
    player.userData.arms[1].rotation.x = stride * 0.6;
    player.userData.stick.rotation.z = -0.3 + Math.sin(phase * 1.8 + index) * 0.08;
    player.position.y = Math.abs(Math.sin(phase * 2.8 + index)) * Math.min(0.055, distance * 0.015);
  });
}

function updateBall(dt) {
  if (shot) {
    shot.progress = Math.min(1, shot.progress + dt / shot.duration);
    const point = shot.start.clone().lerp(shot.end, shot.progress);
    point.y += Math.sin(Math.PI * shot.progress) * 1.85;
    ball.position.copy(point);
    if (shot.progress >= 1) {
      shot = null;
      if (replayPending) {
        replayPending = false;
        replayDelay = 0.16;
      } else if (replayActive) {
        replayActive = false;
        replayShot = null;
        ui.replay.classList.add("hidden");
      }
    }
  } else {
    const sidePlayers = players.filter((player) => player.userData.side === possession);
    const carrier = sidePlayers[Math.min(carrierIndex, 5)] || sidePlayers[0];
    const stickPoint = new THREE.Vector3(0.38, 1.35, -0.24).applyQuaternion(carrier.quaternion).add(carrier.position);
    ball.position.lerp(stickPoint, 0.62);
  }
  ballShadow.position.set(ball.position.x, 0.012, ball.position.z);
  const scale = THREE.MathUtils.clamp(1.15 - ball.position.y * 0.16, 0.42, 1);
  ballShadow.scale.setScalar(scale);
}

function updateCamera(dt) {
  const ballFocus = ball.position.clone().setY(0.8);
  let desired;
  let focus;
  if (cameraMode === 1) {
    desired = new THREE.Vector3(16.5, 5.8, 0);
    focus = ballFocus;
  } else if (cameraMode === 2) {
    desired = new THREE.Vector3(0, 4.5, possession === "home" ? -13.2 : 13.2);
    focus = ballFocus;
  } else if (cameraMode === 3) {
    desired = new THREE.Vector3(0, 23.5, 0.01);
    focus = new THREE.Vector3(0, 0, 0);
  } else {
    desired = new THREE.Vector3(12.8, 10.2, 15.8);
    focus = new THREE.Vector3(ballFocus.x * 0.22, 0.7, ballFocus.z * 0.28);
  }
  cameraTarget.lerp(focus, 1 - Math.pow(0.09, dt));
  camera.position.lerp(desired, 1 - Math.pow(0.04, dt));
  camera.lookAt(cameraTarget);
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
}

window.lacrosseLiveBroadcast = { start, event: playEvent, goal: playEvent, finish, getSpeed };

init();
