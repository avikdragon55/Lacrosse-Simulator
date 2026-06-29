import * as THREE from "./vendor/three.module.js";

const overlay = document.querySelector("#trade-room");
const host = document.querySelector("#trade-room-3d");
const walkUi = document.querySelector("#trade-room-walk-ui");
const locationLabel = document.querySelector("#trade-room-location");
const sitButton = document.querySelector("#trade-room-sit");
const moveButtons = [...document.querySelectorAll("[data-trade-move]")];

let renderer;
let scene;
let camera;
let clock;
let active = false;
let seated = false;
let doorOpening = false;
let doorOpen = false;
let doorProgress = 0;
let sitProgress = 0;
let doorPivot;
let handle;
let hand;
let handArm;
let people = [];
let accentMaterials = [];
let audioContext;
let lastStep = 0;
const keys = { forward: false, backward: false, left: false, right: false };
const startPosition = new THREE.Vector3(0, 1.68, 10.2);
const seatPosition = new THREE.Vector3(0, 1.28, 0.55);
const lookTarget = new THREE.Vector3(0, 1.45, -4.15);

function init() {
  if (renderer || !host) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b10);
  scene.fog = new THREE.Fog(0x070b10, 18, 42);
  camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.03, 70);
  camera.position.copy(startPosition);
  camera.lookAt(new THREE.Vector3(0, 1.55, 2));
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  host.appendChild(renderer.domElement);
  clock = new THREE.Clock();

  buildLighting();
  buildArchitecture();
  buildOffice();
  buildHand();
  resize();
  bindControls();
  addEventListener("resize", resize);
  animate();
}

function material(color, roughness = 0.65, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function mesh(geometry, meshMaterial, position, cast = true, receive = true) {
  const item = new THREE.Mesh(geometry, meshMaterial);
  item.position.set(...position);
  item.castShadow = cast;
  item.receiveShadow = receive;
  scene.add(item);
  return item;
}

function box(size, color, position, options = {}) {
  const item = mesh(
    new THREE.BoxGeometry(...size),
    options.material || material(color, options.roughness ?? 0.65, options.metalness ?? 0.02),
    position,
    options.cast !== false,
    options.receive !== false
  );
  if (options.rotation) item.rotation.set(...options.rotation);
  return item;
}

function buildLighting() {
  scene.add(new THREE.HemisphereLight(0xaac9ef, 0x17120e, 1.35));
  const hall = new THREE.DirectionalLight(0xb8d7ff, 2.2);
  hall.position.set(-5, 8, 11);
  hall.castShadow = true;
  hall.shadow.mapSize.set(2048, 2048);
  hall.shadow.camera.left = -12;
  hall.shadow.camera.right = 12;
  hall.shadow.camera.top = 15;
  hall.shadow.camera.bottom = -15;
  scene.add(hall);
  [[-3.6, 3.3, -1.5], [3.6, 3.3, -1.5], [0, 3.4, -6]].forEach(([x, y, z], index) => {
    const light = new THREE.PointLight(index === 2 ? 0x9bc9ff : 0xffd7a1, index === 2 ? 22 : 30, 11, 1.7);
    light.position.set(x, y, z);
    light.castShadow = index < 2;
    scene.add(light);
  });
}

function buildArchitecture() {
  const woodFloor = createFloorTexture();
  woodFloor.wrapS = woodFloor.wrapT = THREE.RepeatWrapping;
  woodFloor.repeat.set(3, 5);
  const floor = mesh(
    new THREE.PlaneGeometry(12, 16),
    new THREE.MeshStandardMaterial({ map: woodFloor, roughness: 0.64, metalness: 0.02 }),
    [0, 0, -1.5],
    false,
    true
  );
  floor.rotation.x = -Math.PI / 2;
  const hallFloor = mesh(new THREE.PlaneGeometry(12, 9), material(0x252b32, 0.82), [0, 0, 9.5], false, true);
  hallFloor.rotation.x = -Math.PI / 2;

  box([0.24, 4.2, 16], 0x273039, [-6, 2.1, -1.5]);
  box([0.24, 4.2, 16], 0x273039, [6, 2.1, -1.5]);
  box([12, 4.2, 0.25], 0x202932, [0, 2.1, -9.35]);
  box([12, 0.2, 16], 0x171c22, [0, 4.22, -1.5], { cast: false });

  buildGlassEntrance();
  buildExteriorWindows();
  buildCeilingLights();
  buildFieldView();
}

function createFloorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#5b3a25";
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    for (let x = 0; x < 512; x += 170) {
      const offset = (y / 64) % 2 ? 82 : 0;
      ctx.fillStyle = `hsl(25 39% ${25 + ((x + y) % 11)}%)`;
      ctx.fillRect(x - offset, y + 2, 164, 58);
      ctx.strokeStyle = "rgba(20,10,5,.55)";
      ctx.strokeRect(x - offset, y + 2, 164, 58);
      ctx.strokeStyle = "rgba(255,220,170,.08)";
      for (let line = 12; line < 150; line += 24) {
        ctx.beginPath();
        ctx.moveTo(x - offset + line, y + 10);
        ctx.bezierCurveTo(x - offset + line + 14, y + 23, x - offset + line - 12, y + 42, x - offset + line + 10, y + 53);
        ctx.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildGlassEntrance() {
  const frame = material(0x15191e, 0.3, 0.75);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x7890a2,
    roughness: 0.12,
    metalness: 0,
    transparent: true,
    opacity: 0.24,
    transmission: 0.32,
    side: THREE.DoubleSide
  });
  box([12, 0.18, 0.24], 0, [0, 4.1, 5.1], { material: frame });
  box([12, 0.18, 0.24], 0, [0, 0.1, 5.1], { material: frame });
  [-6, -3.6, -1.25, 1.25, 3.6, 6].forEach((x) => box([0.14, 4.1, 0.2], 0, [x, 2.05, 5.1], { material: frame }));
  [[-4.8, 2.25], [4.8, 2.25]].forEach(([x, width]) => {
    box([width, 3.78, 0.06], 0, [x, 2.05, 5.09], { material: glass, cast: false });
  });

  doorPivot = new THREE.Group();
  doorPivot.position.set(-1.2, 0, 5.05);
  scene.add(doorPivot);
  const door = new THREE.Group();
  door.position.x = 1.2;
  doorPivot.add(door);
  const doorFrame = material(0x261a12, 0.38, 0.25);
  const addDoorBox = (size, position, meshMaterial) => {
    const item = new THREE.Mesh(new THREE.BoxGeometry(...size), meshMaterial);
    item.position.set(...position);
    item.castShadow = true;
    item.receiveShadow = true;
    door.add(item);
    return item;
  };
  addDoorBox([2.34, 0.18, 0.16], [0, 4, 0], doorFrame);
  addDoorBox([2.34, 0.18, 0.16], [0, 0.1, 0], doorFrame);
  addDoorBox([0.18, 4, 0.16], [-1.08, 2.05, 0], doorFrame);
  addDoorBox([0.18, 4, 0.16], [1.08, 2.05, 0], doorFrame);
  addDoorBox([1.95, 3.62, 0.05], [0, 2.05, 0], glass);
  addDoorBox([1.96, 0.72, 0.11], [0, 0.55, 0], doorFrame);
  handle = new THREE.Group();
  handle.position.set(0.79, 1.08, 0.17);
  const handleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 20), material(0xc9b27f, 0.2, 0.85));
  handleBase.rotation.x = Math.PI / 2;
  const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.46, 14), material(0xd8c28d, 0.18, 0.9));
  lever.rotation.z = Math.PI / 2;
  lever.position.x = -0.18;
  handle.add(handleBase, lever);
  door.add(handle);
  accentMaterials.push(doorFrame);
}

function buildExteriorWindows() {
  const frame = material(0x11171c, 0.25, 0.7);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x517792, transparent: true, opacity: 0.25, roughness: 0.08, transmission: 0.25 });
  [-3.9, 0, 3.9].forEach((x) => {
    box([3.35, 2.65, 0.08], 0, [x, 2.2, -9.2], { material: glass, cast: false });
    box([3.55, 0.12, 0.18], 0, [x, 0.85, -9.12], { material: frame });
    box([3.55, 0.12, 0.18], 0, [x, 3.55, -9.12], { material: frame });
    box([0.12, 2.8, 0.18], 0, [x - 1.76, 2.2, -9.12], { material: frame });
    box([0.12, 2.8, 0.18], 0, [x + 1.76, 2.2, -9.12], { material: frame });
  });
}

function buildCeilingLights() {
  [-3.4, 0, 3.4].forEach((x) => {
    [-5, 0.3, 3.5].forEach((z) => {
      const panel = box([1.3, 0.05, 0.34], 0xe8d8bb, [x, 4.1, z], { cast: false });
      panel.material = new THREE.MeshStandardMaterial({ color: 0xffe9c7, emissive: 0xffc77c, emissiveIntensity: 1.1 });
    });
  });
}

function buildFieldView() {
  const exterior = box([20, 0.18, 10], 0x122a21, [0, -0.05, -14], { cast: false });
  exterior.receiveShadow = false;
  for (let i = 0; i < 26; i += 1) {
    const x = -10 + (i % 13) * 1.7;
    const z = -18 + Math.floor(i / 13) * 3.5;
    const height = 1 + ((i * 7) % 8) * 0.38;
    const tower = box([1.05, height, 1.05], i % 3 ? 0x17202a : 0x273341, [x, height / 2, z], { cast: false });
    tower.material.emissive = new THREE.Color(i % 4 ? 0x0b1016 : 0x2a210e);
    tower.material.emissiveIntensity = 0.35;
  }
  [-6, 6].forEach((x) => {
    const pole = box([0.1, 5.2, 0.1], 0x838b92, [x, 2.6, -11.8], { metalness: 0.8 });
    pole.material.emissive = new THREE.Color(0x111111);
    const lights = box([1.1, 0.28, 0.25], 0xf4e2b5, [x, 5.1, -11.9], { cast: false });
    lights.material.emissive = new THREE.Color(0xffdb88);
    lights.material.emissiveIntensity = 1.8;
  });
}

function buildOffice() {
  buildDesk();
  createOfficeChair(0, 0.15, 0.55, true);
  createOfficeChair(-2, 0.15, -4.55, false);
  createOfficeChair(2, 0.15, -4.55, false);
  people = [
    createPerson(-2, -4.42, 0x183d68, 0xe0ad86, "director"),
    createPerson(2, -4.42, 0x34302f, 0xc78e69, "owner")
  ];
  buildShelves();
  buildLacrosseDisplay();
}

function buildDesk() {
  const deskMaterial = material(0x4a2b19, 0.46, 0.05);
  box([6.9, 0.22, 1.9], 0, [0, 1.18, -2.95], { material: deskMaterial });
  box([0.28, 1.15, 1.55], 0, [-3.05, 0.6, -2.95], { material: deskMaterial });
  box([0.28, 1.15, 1.55], 0, [3.05, 0.6, -2.95], { material: deskMaterial });
  box([6.15, 0.82, 0.12], 0x2b180f, [0, 0.65, -3.75]);
  const screen = box([1.8, 1.05, 0.08], 0x111820, [0, 1.88, -3.3], { roughness: 0.22, metalness: 0.4 });
  screen.rotation.x = -0.12;
  screen.material.emissive = new THREE.Color(0x0b3744);
  screen.material.emissiveIntensity = 0.65;
  box([0.08, 0.65, 0.08], 0x414a50, [0, 1.43, -3.48], { metalness: 0.8 });
  [-2.35, 2.3].forEach((x, index) => {
    const folder = box([1.05, 0.035, 0.68], index ? 0x1e5c80 : 0x7a2831, [x, 1.32, -2.8], { cast: false });
    folder.rotation.y = index ? 0.1 : -0.08;
  });
  const lampStem = box([0.05, 0.75, 0.05], 0xc2aa72, [2.9, 1.7, -3.2], { metalness: 0.8 });
  lampStem.rotation.z = -0.18;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.35, 20, 1, true), material(0xd7c8aa, 0.7));
  shade.position.set(2.83, 2.12, -3.2);
  shade.rotation.z = Math.PI;
  shade.castShadow = true;
  scene.add(shade);
}

function createOfficeChair(x, y, z, userChair) {
  const chair = new THREE.Group();
  chair.position.set(x, y, z);
  const leather = material(userChair ? 0x27313a : 0x2a201c, 0.5, 0.05);
  const metal = material(0x434a50, 0.25, 0.75);
  const add = (geometry, meshMaterial, position, rotation = null) => {
    const item = new THREE.Mesh(geometry, meshMaterial);
    item.position.set(...position);
    if (rotation) item.rotation.set(...rotation);
    item.castShadow = true;
    chair.add(item);
  };
  add(new THREE.BoxGeometry(1.25, 0.2, 1.1), leather, [0, 0.72, 0]);
  add(new THREE.BoxGeometry(1.28, 1.5, 0.22), leather, [0, 1.48, 0.48], [-0.12, 0, 0]);
  [-0.72, 0.72].forEach((side) => {
    add(new THREE.BoxGeometry(0.12, 0.72, 0.12), metal, [side, 0.82, 0]);
    add(new THREE.BoxGeometry(0.24, 0.12, 0.9), leather, [side, 1.17, -0.05]);
  });
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), metal, [0, 0.38, 0]);
  for (let i = 0; i < 5; i += 1) {
    const angle = i * Math.PI * 0.4;
    add(new THREE.BoxGeometry(0.08, 0.08, 0.72), metal, [Math.sin(angle) * 0.28, 0.1, Math.cos(angle) * 0.28], [0, angle, 0]);
  }
  if (!userChair) chair.rotation.y = Math.PI;
  scene.add(chair);
  return chair;
}

function createPerson(x, z, suitColor, skinColor, role) {
  const person = new THREE.Group();
  person.position.set(x, 0, z);
  person.rotation.y = 0;
  const suit = material(suitColor, 0.62);
  const shirt = material(role === "owner" ? 0x1a1c20 : 0xe5e9ec, 0.72);
  const skin = material(skinColor, 0.76);
  const hair = material(role === "owner" ? 0x77706a : 0x201a18, 0.82);
  const shoe = material(0x111315, 0.3, 0.45);
  const add = (geometry, meshMaterial, position, rotation = null, parent = person) => {
    const item = new THREE.Mesh(geometry, meshMaterial);
    item.position.set(...position);
    if (rotation) item.rotation.set(...rotation);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  };
  add(new THREE.CapsuleGeometry(0.44, 0.88, 8, 18), suit, [0, 1.55, 0]);
  add(new THREE.BoxGeometry(0.27, 0.76, 0.05), shirt, [0, 1.63, 0.43], [-0.05, 0, 0]);
  if (role === "director") add(new THREE.ConeGeometry(0.09, 0.42, 10), material(0x243d61, 0.6), [0, 1.66, 0.47], [Math.PI, 0, 0]);
  add(new THREE.CylinderGeometry(0.15, 0.17, 0.24, 16), skin, [0, 2.18, 0]);
  add(new THREE.SphereGeometry(0.32, 24, 18), skin, [0, 2.48, 0]);
  add(new THREE.SphereGeometry(0.326, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), hair, [0, 2.58, 0.02]);
  add(new THREE.ConeGeometry(0.055, 0.15, 10), skin, [0, 2.43, 0.31], [-Math.PI / 2, 0, 0]);
  [-0.12, 0.12].forEach((side) => {
    add(new THREE.SphereGeometry(0.032, 10, 8), material(0x18242d, 0.25), [side, 2.52, 0.29]);
  });
  const mouth = add(new THREE.BoxGeometry(0.14, 0.018, 0.015), material(role === "owner" ? 0x633326 : 0x714438, 0.8), [0, 2.34, 0.315]);
  mouth.rotation.z = role === "owner" ? -0.06 : 0.02;

  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();
  leftArm.position.set(-0.48, 1.92, 0);
  rightArm.position.set(0.48, 1.92, 0);
  person.add(leftArm, rightArm);
  add(new THREE.CapsuleGeometry(0.11, 0.56, 6, 12), suit, [0, -0.25, 0.12], [-0.7, 0, 0.08], leftArm);
  add(new THREE.CapsuleGeometry(0.11, 0.56, 6, 12), suit, [0, -0.25, 0.12], [-0.7, 0, -0.08], rightArm);
  add(new THREE.SphereGeometry(0.12, 14, 10), skin, [-0.36, 1.35, 0.42]);
  add(new THREE.SphereGeometry(0.12, 14, 10), skin, [0.36, 1.35, 0.42]);
  [-0.28, 0.28].forEach((side) => {
    add(new THREE.CapsuleGeometry(0.16, 0.72, 7, 14), suit, [side, 0.82, 0.31], [Math.PI / 2, 0, 0]);
    add(new THREE.CapsuleGeometry(0.135, 0.67, 7, 14), suit, [side, 0.43, 0.73], [-0.22, 0, 0]);
    add(new THREE.BoxGeometry(0.28, 0.16, 0.54), shoe, [side, 0.14, 0.97]);
  });
  person.userData = { role, leftArm, rightArm, baseY: 0, mouth };
  scene.add(person);
  return person;
}

function buildShelves() {
  const wood = material(0x302116, 0.6);
  box([2.2, 3.1, 0.35], 0, [-4.75, 1.7, -7.6], { material: wood });
  [0.65, 1.35, 2.05, 2.75].forEach((y) => box([2, 0.08, 0.65], 0, [-4.75, y, -7.35], { material: wood }));
  const bookColors = [0x8a3542, 0x315b75, 0x5f6740, 0xb08a4c];
  for (let i = 0; i < 14; i += 1) {
    const shelf = i % 4;
    box([0.16 + (i % 3) * 0.03, 0.42 + (i % 2) * 0.12, 0.28], bookColors[i % bookColors.length], [-5.55 + (i % 7) * 0.25, 0.94 + shelf * 0.7, -7.05], { cast: false });
  }
}

function buildLacrosseDisplay() {
  const shaftMaterial = material(0xd2d7db, 0.22, 0.85);
  [4.75, 5.15].forEach((x, index) => {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 10), shaftMaterial);
    shaft.position.set(x, 2.1, -7.95);
    shaft.rotation.z = index ? -0.18 : 0.18;
    shaft.castShadow = true;
    scene.add(shaft);
    const head = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.42, 0.55, 0.08)), new THREE.LineBasicMaterial({ color: index ? 0x20ff9f : 0x00e5ff }));
    head.position.set(x + (index ? 0.22 : -0.22), 3.35, -7.95);
    head.rotation.z = index ? -0.18 : 0.18;
    scene.add(head);
  });
}

function buildHand() {
  hand = new THREE.Group();
  hand.position.set(0.42, -0.46, -0.78);
  hand.rotation.set(-0.22, -0.2, -0.12);
  const skin = material(0xc88f69, 0.72);
  handArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.58, 8, 16), skin);
  handArm.position.set(0.08, -0.15, 0.25);
  handArm.rotation.x = Math.PI / 2.8;
  hand.add(handArm);
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.14), skin);
  palm.position.set(0, 0.12, -0.08);
  palm.rotation.z = -0.12;
  hand.add(palm);
  for (let i = 0; i < 4; i += 1) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.027, 0.19 - i * 0.012, 5, 10), skin);
    finger.position.set(-0.095 + i * 0.064, 0.31, -0.06);
    finger.rotation.z = -0.06 + i * 0.03;
    hand.add(finger);
  }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.17, 5, 10), skin);
  thumb.position.set(0.16, 0.12, -0.11);
  thumb.rotation.z = -1.02;
  hand.add(thumb);
  camera.add(hand);
}

function bindControls() {
  addEventListener("keydown", (event) => {
    const action = keyAction(event.key);
    if (action && active && !seated) {
      keys[action] = true;
      event.preventDefault();
    }
    if (event.key === "Enter" && active && !sitButton.classList.contains("hidden")) sitDown();
  });
  addEventListener("keyup", (event) => {
    const action = keyAction(event.key);
    if (action) keys[action] = false;
  });
  moveButtons.forEach((button) => {
    const action = button.dataset.tradeMove;
    const start = (event) => {
      event.preventDefault();
      keys[action] = true;
    };
    const stop = (event) => {
      event.preventDefault();
      keys[action] = false;
    };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  });
  sitButton.addEventListener("click", sitDown);
}

function keyAction(key) {
  return { ArrowUp: "forward", ArrowDown: "backward", ArrowLeft: "left", ArrowRight: "right" }[key];
}

function open(config = {}) {
  init();
  active = true;
  seated = false;
  doorOpening = false;
  doorOpen = false;
  doorProgress = 0;
  sitProgress = 0;
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  camera.position.copy(startPosition);
  camera.lookAt(new THREE.Vector3(0, 1.55, 2.6));
  doorPivot.rotation.y = 0;
  handle.rotation.z = 0;
  hand.position.set(0.42, -0.46, -0.78);
  hand.rotation.set(-0.22, -0.2, -0.12);
  hand.visible = true;
  walkUi.classList.remove("hidden");
  sitButton.classList.add("hidden");
  locationLabel.textContent = "Hallway";
  if (config.accent) accentMaterials.forEach((item) => item.color.lerp(new THREE.Color(config.accent), 0.18));
  if (config.skipWalk) {
    doorOpen = true;
    doorPivot.rotation.y = Math.PI * 0.5;
    camera.position.copy(seatPosition);
    camera.lookAt(lookTarget);
    seated = true;
    sitProgress = 0.99;
    hand.visible = false;
    walkUi.classList.add("hidden");
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("trade-room-seated")), 80);
  }
  clock.start();
}

function close() {
  active = false;
  seated = false;
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  if (sitButton) sitButton.classList.add("hidden");
}

function sitDown() {
  if (!active || seated || sitButton.classList.contains("hidden")) return;
  seated = true;
  sitProgress = 0;
  sitButton.classList.add("hidden");
  walkUi.classList.add("hidden");
  playChairSound();
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer) return;
  const dt = Math.min(0.035, clock.getDelta());
  if (active) update(dt);
  renderer.render(scene, camera);
}

function update(dt) {
  const time = performance.now() * 0.001;
  updatePeople(time);
  if (seated) {
    updateSitting(dt);
    return;
  }
  if (doorOpening) {
    updateDoor(dt);
    return;
  }
  updateMovement(dt);
  if (!doorOpen && camera.position.z < 7.1 && Math.abs(camera.position.x) < 1.25) startDoorOpening();
  const atChair = doorOpen && camera.position.z < 1.55 && camera.position.z > -0.5 && Math.abs(camera.position.x) < 1.45;
  sitButton.classList.toggle("hidden", !atChair);
  locationLabel.textContent = camera.position.z > 5.4 ? "Hallway" : atChair ? "Guest Chair" : "Trade Office";
}

function updateMovement(dt) {
  let dx = 0;
  let dz = 0;
  if (keys.forward) dz -= 1;
  if (keys.backward) dz += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  const length = Math.hypot(dx, dz);
  if (!length) return;
  const speed = 2.9;
  dx = dx / length * speed * dt;
  dz = dz / length * speed * dt;
  const nextX = THREE.MathUtils.clamp(camera.position.x + dx, -4.9, 4.9);
  let nextZ = THREE.MathUtils.clamp(camera.position.z + dz, -0.2, 11.3);
  if (!doorOpen && nextZ < 5.65) nextZ = 5.65;
  if (doorOpen && nextZ < 0.25 && Math.abs(nextX) > 1.4) nextZ = 0.25;
  camera.position.x = nextX;
  camera.position.z = nextZ;
  camera.lookAt(new THREE.Vector3(camera.position.x * 0.28, 1.48, camera.position.z - 5.5));
  hand.position.y = -0.46 + Math.sin(performance.now() * 0.012) * 0.012;
  if (performance.now() - lastStep > 390) {
    lastStep = performance.now();
    playStepSound();
  }
}

function startDoorOpening() {
  doorOpening = true;
  doorProgress = 0;
  locationLabel.textContent = "Opening Door";
  playDoorSound();
}

function updateDoor(dt) {
  doorProgress = Math.min(1, doorProgress + dt / 1.7);
  const reach = smoothstep(0, 0.3, doorProgress) * (1 - smoothstep(0.72, 1, doorProgress));
  hand.position.set(0.42 - reach * 0.16, -0.46 + reach * 0.18, -0.78 - reach * 0.28);
  hand.rotation.z = -0.12 - smoothstep(0.16, 0.42, doorProgress) * 0.62;
  handle.rotation.z = -smoothstep(0.18, 0.42, doorProgress) * 0.78;
  doorPivot.rotation.y = smoothstep(0.34, 0.95, doorProgress) * Math.PI * 0.5;
  if (doorProgress >= 1) {
    doorOpening = false;
    doorOpen = true;
    handle.rotation.z = 0;
    hand.position.set(0.42, -0.46, -0.78);
    hand.rotation.set(-0.22, -0.2, -0.12);
    locationLabel.textContent = "Trade Office";
  }
}

function updateSitting(dt) {
  sitProgress = Math.min(1, sitProgress + dt / 1.1);
  const eased = smoothstep(0, 1, sitProgress);
  camera.position.lerp(seatPosition, Math.min(1, dt * (4 + eased * 5)));
  const currentTarget = new THREE.Vector3(camera.position.x * 0.1, 1.45, -4.15);
  currentTarget.lerp(lookTarget, eased);
  camera.lookAt(currentTarget);
  hand.position.y = -0.54;
  hand.position.z = -0.68;
  if (sitProgress >= 1 && !overlay.classList.contains("room-open")) {
    hand.visible = false;
    window.dispatchEvent(new CustomEvent("trade-room-seated"));
  }
}

function updatePeople(time) {
  people.forEach((person, index) => {
    person.position.y = Math.sin(time * 1.3 + index) * 0.006;
    person.userData.leftArm.rotation.z = Math.sin(time * 0.8 + index * 2) * 0.035;
    person.userData.rightArm.rotation.z = Math.sin(time * 0.9 + index) * 0.045;
    if (seated && sitProgress > 0.75) {
      const talking = Math.sin(time * (index ? 7.1 : 6.3)) > 0.25;
      person.userData.mouth.scale.x = talking ? 1.18 : 0.84;
      person.userData.rightArm.rotation.x = index ? Math.max(0, Math.sin(time * 1.8)) * 0.18 : 0;
    }
  });
}

function smoothstep(min, max, value) {
  const x = THREE.MathUtils.clamp((value - min) / Math.max(0.0001, max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

function ensureAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function tone(frequency, duration, type, volume, slide = 1) {
  const context = ensureAudio();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, frequency * slide), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playStepSound() {
  tone(82 + Math.random() * 12, 0.075, "triangle", 0.018, 0.62);
}

function playDoorSound() {
  tone(92, 0.7, "sawtooth", 0.045, 0.46);
  window.setTimeout(() => tone(145, 0.45, "triangle", 0.032, 0.58), 260);
  window.setTimeout(() => tone(690, 0.07, "square", 0.025, 0.7), 90);
}

function playChairSound() {
  tone(68, 0.32, "triangle", 0.032, 0.72);
  window.setTimeout(() => tone(210, 0.08, "square", 0.015, 0.7), 180);
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  if (hand) hand.scale.setScalar(innerWidth < 600 ? 0.72 : 1);
}

window.tradeRoom3D = { open, close };
window.dispatchEvent(new Event("trade-room-3d-ready"));
