import * as THREE from "./vendor/three.module.js";

const host = document.querySelector("#draft-stage-3d");
const cameraLabel = document.querySelector("#draft-camera-label");
let renderer;
let scene;
let camera;
let clock;
let active = false;
let timeline = 0;
let completed = false;
let player;
let commissioner;
let jersey;
let backdrop;
let crowd = [];
let photographers = [];
let flashes = [];
let config = null;

function mat(color, roughness = 0.6, metalness = 0.03) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(size, color, position, options = {}) {
  const item = new THREE.Mesh(new THREE.BoxGeometry(...size), options.material || mat(color, options.roughness ?? 0.6, options.metalness ?? 0.03));
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
  scene.background = new THREE.Color(0x05080d);
  scene.fog = new THREE.Fog(0x05080d, 18, 42);
  camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.04, 60);
  camera.position.set(0, 3.2, 11.5);
  camera.lookAt(0, 1.5, -1);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  buildLighting();
  buildVenue();
  buildCharacters();
  buildPhotographers();
  addEventListener("resize", resize);
  animate();
}

function buildLighting() {
  scene.add(new THREE.HemisphereLight(0xb8d7f5, 0x211912, 2.15));
  const key = new THREE.SpotLight(0xffffff, 95, 28, Math.PI / 5, 0.5, 1.4);
  key.position.set(-4, 10, 7);
  key.target.position.set(0, 1.4, -1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  scene.add(key, key.target);
  [-7, 0, 7].forEach((x) => {
    const light = new THREE.SpotLight(0x8fc8ff, 58, 25, Math.PI / 6, 0.58, 1.5);
    light.position.set(x, 8, -3);
    light.target.position.set(x * 0.22, 1.2, -1);
    scene.add(light, light.target);
  });
}

function buildVenue() {
  addBox([18, 0.35, 10], 0x1a2027, [0, 0, -1.2]);
  addBox([18, 5.6, 0.3], 0x101c2b, [0, 2.8, -6.1]);
  addBox([18, 0.2, 15], 0x0e1217, [0, 6.2, 0], { cast: false });
  backdrop = addBox([12.8, 4.35, 0.09], 0x18304b, [0, 3, -5.87], { cast: false });
  backdrop.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const runway = addBox([4.2, 0.12, 12], 0x303942, [-5.6, 0.24, 4.7]);
  runway.receiveShadow = true;
  buildStands(-1);
  buildStands(1);
  addBox([4.8, 0.35, 2.2], 0x3d2518, [1.1, 0.37, -1.15]);
  addBox([1.7, 1.5, 0.72], 0x452817, [2.1, 1.1, -1.05]);
  const podiumTop = addBox([2, 0.16, 0.95], 0x5a331c, [2.1, 1.85, -1.05]);
  podiumTop.rotation.x = -0.05;
  [-0.35, 0.35].forEach((offset) => {
    const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.34, 5, 10), mat(0x171a1e, 0.3, 0.55));
    mic.position.set(2.1 + offset, 2.27, -0.85);
    scene.add(mic);
  });
}

function buildStands(side) {
  for (let row = 0; row < 4; row += 1) {
    const x = side * (6.2 + row * 0.62);
    addBox([1.15, 0.32, 13], row % 2 ? 0x202a34 : 0x18212a, [x, 0.38 + row * 0.52, 1.6]);
    for (let seat = 0; seat < 11; seat += 1) {
      const fan = createFan(side, row, seat);
      fan.position.set(x - side * 0.18, 0.9 + row * 0.52, -3.4 + seat * 0.98);
      fan.userData.baseY = fan.position.y;
      fan.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      scene.add(fan);
      crowd.push(fan);
    }
  }
}

function createFan(side, row, seat) {
  const group = new THREE.Group();
  const shirtColors = [0x2e6f9b, 0xc54355, 0xe0a53f, 0x338562, 0x7254a8];
  const skinColors = [0xe4b08a, 0xc88e67, 0x8f5c43, 0xf0c29e];
  const shirt = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.28, 5, 10), mat(shirtColors[(row * 3 + seat) % shirtColors.length], 0.7));
  shirt.position.y = 0.22;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 9), mat(skinColors[(seat + row) % skinColors.length], 0.75));
  head.position.y = 0.58;
  group.add(shirt, head);
  group.userData.phase = row * 0.8 + seat * 0.45 + side;
  return group;
}

function buildCharacters() {
  commissioner = createPerson("commissioner", 0x202c3d, 0xd5a17c);
  commissioner.group.position.set(2.1, 0.5, -1.45);
  scene.add(commissioner.group);
  player = createPerson("player", 0x2e7aa4, 0xc58b66);
  player.group.position.set(-5.7, 0.45, 4.9);
  player.group.visible = false;
  scene.add(player.group);
  jersey = createJersey();
  jersey.visible = false;
  scene.add(jersey);
}

function createPerson(role, uniformColor, skinColor) {
  const group = new THREE.Group();
  const uniform = mat(uniformColor, 0.6);
  const skin = mat(skinColor, 0.74);
  const hair = mat(role === "commissioner" ? 0x77706b : 0x211a17, 0.82);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.82, 8, 18), uniform);
  torso.position.y = 1.55;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 22, 16), skin);
  head.position.y = 2.42;
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.318, 20, 11, 0, Math.PI * 2, 0, Math.PI * 0.48), hair);
  hairCap.position.y = 2.53;
  group.add(torso, head, hairCap);
  [-0.12, 0.12].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 9, 7), mat(0x172029, 0.3));
    eye.position.set(x, 2.47, 0.29);
    group.add(eye);
  });
  const arms = [];
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.58, 6, 11), uniform);
    arm.position.set(side * 0.5, 1.55, 0.02);
    group.add(arm);
    arms.push(arm);
  });
  [-0.2, 0.2].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.72, 6, 12), mat(role === "commissioner" ? 0x151a20 : uniformColor, 0.62));
    leg.position.set(x, 0.58, 0);
    group.add(leg);
  });
  group.traverse((item) => { if (item.isMesh) item.castShadow = true; });
  return { group, uniform, skin, hair, arms, head };
}

function createJersey() {
  const group = new THREE.Group();
  const cloth = mat(0x2e7aa4, 0.72);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.18, 0.08), cloth);
  const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.08), cloth);
  const rightSleeve = leftSleeve.clone();
  leftSleeve.position.set(-0.82, 0.28, 0);
  rightSleeve.position.set(0.82, 0.28, 0);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 1.05), new THREE.MeshBasicMaterial({ transparent: true }));
  front.position.z = 0.055;
  group.add(body, leftSleeve, rightSleeve, front);
  group.position.set(0.15, 2.02, -0.42);
  group.userData.cloth = cloth;
  group.userData.front = front;
  return group;
}

function buildPhotographers() {
  [-3.2, -1.5, 1.2, 3.4].forEach((x, index) => {
    const group = new THREE.Group();
    group.position.set(x, 0, 4.3 + index % 2 * 0.6);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.48, 6, 11), mat(index % 2 ? 0x2d3844 : 0x352b29, 0.7));
    body.position.y = 0.72;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 9), mat(0xc68e69, 0.75));
    head.position.y = 1.2;
    const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.27, 0.38), mat(0x17191c, 0.28, 0.5));
    cameraBody.position.set(0, 1.3, -0.23);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 14), mat(0x20252a, 0.2, 0.7));
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.3, -0.52);
    group.add(body, head, cameraBody, lens);
    scene.add(group);
    photographers.push(group);
    const flash = new THREE.PointLight(0xeaf5ff, 0, 8, 1.7);
    flash.position.set(x, 1.8, 3.6);
    scene.add(flash);
    flashes.push(flash);
  });
}

function makeBackdropTexture(teamName, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0d1c2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, canvas.width, 12);
  ctx.fillRect(0, canvas.height - 12, canvas.width, 12);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  for (let x = 0; x < 1280; x += 220) ctx.fillRect(x, 0, 2, 480);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 74px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("PROFESSIONAL LACROSSE DRAFT", 640, 175);
  ctx.fillStyle = accent;
  ctx.font = "900 48px system-ui";
  ctx.fillText(teamName.toUpperCase().slice(0, 28), 640, 280);
  ctx.fillStyle = "#aebfd0";
  ctx.font = "800 28px system-ui";
  ctx.fillText("THE FUTURE STARTS HERE", 640, 355);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeJerseyTexture(teamName, playerName, pickNumber) {
  const canvas = document.createElement("canvas");
  canvas.width = 620;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "900 48px system-ui";
  ctx.fillText(teamName.toUpperCase().slice(0, 18), 310, 82);
  ctx.font = "900 235px system-ui";
  ctx.fillText(String(pickNumber || 1), 310, 325);
  ctx.font = "900 43px system-ui";
  ctx.fillText(playerName.toUpperCase().slice(0, 18), 310, 425);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function play(nextConfig) {
  init();
  config = nextConfig;
  active = true;
  timeline = 0;
  completed = false;
  player.group.visible = true;
  player.group.position.set(-5.7, 0.45, 4.9);
  player.group.rotation.y = 0;
  player.uniform.color.set(config.teamColor || "#2e7aa4");
  jersey.userData.cloth.color.set(config.teamColor || "#2e7aa4");
  if (jersey.userData.front.material.map) jersey.userData.front.material.map.dispose();
  jersey.userData.front.material.map = makeJerseyTexture(config.teamName, config.playerName, config.pick);
  jersey.userData.front.material.needsUpdate = true;
  jersey.visible = false;
  commissioner.group.position.set(2.1, 0.5, -1.45);
  if (backdrop.material.map) backdrop.material.map.dispose();
  backdrop.material.map = makeBackdropTexture(config.teamName, config.teamColor || "#2e7aa4");
  backdrop.material.needsUpdate = true;
  commissioner.arms.forEach((arm) => { arm.rotation.z = 0; });
  flashes.forEach((flash) => { flash.intensity = 0; });
  camera.userData.angle = 0;
  setCamera(0);
  clock.start();
}

function close() {
  active = false;
  if (player) player.group.visible = false;
  if (jersey) jersey.visible = false;
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer) return;
  const dt = Math.min(0.04, clock.getDelta());
  if (active) update(dt);
  renderer.render(scene, camera);
}

function update(dt) {
  timeline += dt;
  const walk = THREE.MathUtils.smoothstep(timeline, 1.25, 4.25);
  player.group.position.x = THREE.MathUtils.lerp(-5.7, -0.65, walk);
  player.group.position.z = THREE.MathUtils.lerp(4.9, -0.5, walk);
  player.group.rotation.y = THREE.MathUtils.lerp(-0.65, 0, walk);
  const stride = Math.sin(timeline * 11) * (walk < 0.98 ? 0.45 : 0);
  player.arms[0].rotation.x = stride;
  player.arms[1].rotation.x = -stride;
  if (timeline > 4.2) {
    jersey.visible = true;
    player.group.position.set(-0.8, 0.45, -0.72);
    commissioner.group.position.x = 1.25;
    player.arms[0].rotation.z = -0.95;
    commissioner.arms[1].rotation.z = 0.95;
  }
  updateCameraCuts();
  updateCrowd();
  updateFlashes();
  if (timeline >= 8.4 && !completed) {
    completed = true;
    active = false;
    window.dispatchEvent(new Event("draft-stage-complete"));
  }
}

function setCamera(angle) {
  if (angle === 1) {
    camera.position.set(-7.4, 2.4, 5.6);
    camera.lookAt(-2.1, 1.35, 0.4);
    cameraLabel.textContent = "Aisle Camera";
  } else if (angle === 2) {
    camera.position.set(0, 2.25, 5.1);
    camera.lookAt(0.1, 1.7, -0.7);
    cameraLabel.textContent = "Jersey Presentation";
  } else if (angle === 3) {
    camera.position.set(4.8, 2.05, 4.2);
    camera.lookAt(0.1, 1.7, -0.7);
    cameraLabel.textContent = "Photo Line";
  } else {
    camera.position.set(0, 3.2, 11.5);
    camera.lookAt(0, 1.5, -1);
    cameraLabel.textContent = "Main Stage";
  }
}

function updateCameraCuts() {
  const angle = timeline < 1.5 ? 0 : timeline < 4.25 ? 1 : timeline < 6.25 ? 2 : 3;
  if (camera.userData.angle !== angle) {
    camera.userData.angle = angle;
    setCamera(angle);
  }
}

function updateCrowd() {
  crowd.forEach((fan) => {
    const excitement = timeline > 4.1 ? 0.13 : 0.035;
    fan.position.y = fan.userData.baseY + Math.sin(timeline * 5.2 + fan.userData.phase) * excitement * 0.08;
    fan.rotation.z = Math.sin(timeline * 3.1 + fan.userData.phase) * excitement;
  });
}

function updateFlashes() {
  photographers.forEach((photographer, index) => {
    photographer.rotation.y = Math.sin(timeline * 0.7 + index) * 0.04;
    const flashBeat = timeline > 4.6 && Math.sin(timeline * (7.5 + index * 0.8) + index) > 0.93;
    flashes[index].intensity = flashBeat ? 95 : Math.max(0, flashes[index].intensity - 7);
  });
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setSize(innerWidth, innerHeight);
}

window.draftStage3D = { play, close };
window.dispatchEvent(new Event("draft-stage-3d-ready"));
