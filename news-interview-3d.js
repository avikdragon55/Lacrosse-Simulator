import * as THREE from "./vendor/three.module.js";

const officeHost = document.querySelector("#news-office-3d");
const pressHost = document.querySelector("#press-conference-3d");
let office;
let press;

function standard(color, roughness = 0.62, metalness = 0.03) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(scene, size, color, position, options = {}) {
  const item = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    options.material || standard(color, options.roughness ?? 0.62, options.metalness ?? 0.03)
  );
  item.position.set(...position);
  if (options.rotation) item.rotation.set(...options.rotation);
  item.castShadow = options.cast !== false;
  item.receiveShadow = options.receive !== false;
  scene.add(item);
  return item;
}

function makeRenderer(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.48;
  host.appendChild(renderer.domElement);
  return renderer;
}

function addLights(scene, warm = true) {
  scene.add(new THREE.HemisphereLight(0xd9edff, 0x30241b, 2.25));
  const key = new THREE.DirectionalLight(warm ? 0xffe7c5 : 0xd9e7ff, 4.1);
  key.position.set(-5, 8, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  scene.add(key);
  const fill = new THREE.PointLight(warm ? 0xffd59c : 0x9fc5ff, 44, 16, 1.7);
  fill.position.set(4, 4, 1);
  scene.add(fill);
}

function createOffice() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6ea1bb);
  scene.fog = new THREE.Fog(0x6ea1bb, 20, 42);
  const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.04, 45);
  camera.position.set(0, 1.62, 5.3);
  camera.lookAt(0, 1.15, -1.3);
  scene.add(camera);
  const renderer = makeRenderer(officeHost);
  addLights(scene, true);

  const floor = addBox(scene, [12, 0.16, 14], 0x58351f, [0, -0.08, -1.2], { roughness: 0.72 });
  floor.receiveShadow = true;
  addBox(scene, [2.1, 4.6, 0.22], 0x69777f, [-4.95, 2.3, -7.25]);
  addBox(scene, [2.1, 4.6, 0.22], 0x69777f, [4.95, 2.3, -7.25]);
  addBox(scene, [7.8, 0.85, 0.22], 0x69777f, [0, 4.18, -7.25]);
  addBox(scene, [7.8, 1, 0.22], 0x69777f, [0, 0.5, -7.25]);
  addBox(scene, [0.22, 4.6, 14], 0x58666f, [-6, 2.3, -1.2]);
  addBox(scene, [0.22, 4.6, 14], 0x58666f, [6, 2.3, -1.2]);
  addBox(scene, [12, 0.16, 14], 0x354149, [0, 4.55, -1.2], { cast: false });
  buildOfficeWindow(scene);
  const computer = buildOfficeDesk(scene);
  buildOfficeDecor(scene);
  const hands = buildFirstPersonHands(camera);
  const newspaper = buildDeskNewspaper(scene);
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let active = false;
  let paperMotion = 0;
  let paperTarget = 0;

  officeHost.addEventListener("click", (event) => {
    if (!active) return;
    const rect = officeHost.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(newspaper, true).length) window.dispatchEvent(new Event("news-newspaper-open"));
    else if (raycaster.intersectObject(computer, true).length) window.dispatchEvent(new Event("news-computer-open"));
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    if (active) {
      hands.left.rotation.z = -0.08 + Math.sin(t * 1.1) * 0.01;
      hands.right.rotation.z = 0.08 - Math.sin(t * 1.1) * 0.01;
      paperMotion = THREE.MathUtils.lerp(paperMotion, paperTarget, 0.09);
      newspaper.position.set(
        THREE.MathUtils.lerp(-1.65, 0, paperMotion),
        THREE.MathUtils.lerp(1.115, 1.65, paperMotion) + Math.sin(t * 1.4) * 0.002,
        THREE.MathUtils.lerp(0.35, 3.55, paperMotion)
      );
      newspaper.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.46, paperMotion);
      newspaper.rotation.y = THREE.MathUtils.lerp(0.08, 0, paperMotion);
      hands.left.position.y = -0.55 + paperMotion * 0.23;
      hands.right.position.y = -0.55 + paperMotion * 0.23;
    }
    renderer.render(scene, camera);
    clock.getDelta();
  }
  animate();
  return {
    renderer,
    camera,
    open(config = {}) {
      active = true;
      if (config.accent) newspaper.userData.paperMaterial.color.set(config.accent).lerp(new THREE.Color(0xe8dfc7), 0.88);
      camera.position.set(0, 1.62, 5.3);
      camera.lookAt(0, 1.15, -1.3);
      paperMotion = 0;
      paperTarget = 0;
    },
    close() { active = false; },
    pickUpPaper() { paperTarget = 1; },
    lowerPaper() { paperTarget = 0; }
  };
}

function buildOfficeWindow(scene) {
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x47708d, transparent: true, opacity: 0.3, roughness: 0.12, transmission: 0.2 });
  addBox(scene, [7.6, 2.65, 0.06], 0, [0, 2.35, -7.08], { material: glass, cast: false });
  [-3.9, 0, 3.9].forEach((x) => addBox(scene, [0.14, 2.9, 0.16], 0x11191f, [x, 2.35, -7]));
  addBox(scene, [7.9, 0.14, 0.18], 0x11191f, [0, 1, -7]);
  addBox(scene, [7.9, 0.14, 0.18], 0x11191f, [0, 3.72, -7]);
  const turf = addBox(scene, [17, 0.12, 15], 0x2f8b55, [0, 0.02, -13.7], { cast: false, roughness: 0.9 });
  turf.receiveShadow = true;
  for (let z = -19; z <= -9; z += 2.5) addBox(scene, [15, 0.015, 0.045], 0xffffff, [0, 0.09, z], { cast: false });
  addBox(scene, [0.045, 0.015, 13], 0xffffff, [0, 0.1, -13.7], { cast: false });
  [-5.2, 5.2].forEach((x) => addBox(scene, [0.08, 2.2, 0.08], 0xd7464e, [x, 1.1, -16.4], { metalness: 0.45 }));
  for (let i = 0; i < 18; i += 1) {
    const seat = addBox(scene, [0.7, 0.55 + (i % 3) * 0.15, 0.7], i % 2 ? 0x315f96 : 0xd34c5c, [-7.5 + (i % 9) * 1.85, 0.35, -21 - Math.floor(i / 9) * 1.1], { cast: false });
    seat.rotation.y = Math.PI;
  }
}

function buildOfficeDesk(scene) {
  const wood = standard(0x4b2b18, 0.44);
  addBox(scene, [8.2, 0.24, 2.6], 0, [0, 1.02, 0.1], { material: wood });
  addBox(scene, [0.34, 1.05, 2.25], 0, [-3.55, 0.5, 0.1], { material: wood });
  addBox(scene, [0.34, 1.05, 2.25], 0, [3.55, 0.5, 0.1], { material: wood });
  const monitor = addBox(scene, [2.05, 1.18, 0.1], 0xffffff, [1.3, 1.9, -0.5], { material: makeOfficeComputerMaterial(), roughness: 0.2, metalness: 0.35 });
  monitor.rotation.y = -0.2;
  addBox(scene, [0.09, 0.65, 0.09], 0x687078, [1.3, 1.34, -0.45], { metalness: 0.8 });
  addBox(scene, [1.25, 0.08, 0.48], 0x222b32, [1.3, 1.14, -0.1]);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.42, 20), standard(0x1d627b, 0.35));
  cup.position.set(2.75, 1.34, 0.15);
  cup.castShadow = true;
  scene.add(cup);
  return monitor;
}

function makeOfficeComputerMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 520;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 900, 520);
  gradient.addColorStop(0, "#0d5367");
  gradient.addColorStop(1, "#102632");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 900, 520);
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.font = "900 38px system-ui";
  ctx.fillText("GM WORKSTATION", 45, 65);
  const apps = [["G", "GMAIL"], ["D", "DRAFT"], ["S", "STANDINGS"], ["N", "NEWS"]];
  apps.forEach(([letter, label], index) => {
    const x = 60 + index * 205;
    ctx.fillStyle = index === 0 ? "#d84d4d" : index === 1 ? "#37b889" : index === 2 ? "#4b83d0" : "#d6a23f";
    ctx.fillRect(x, 155, 130, 130);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "900 58px system-ui";
    ctx.fillText(letter, x + 65, 240);
    ctx.font = "800 21px system-ui";
    ctx.fillText(label, x + 65, 325);
  });
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.font = "700 24px system-ui";
  ctx.fillText("CLICK THE SCREEN OR OPEN COMPUTER", 45, 455);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function buildDeskNewspaper(scene) {
  const group = new THREE.Group();
  group.position.set(-1.65, 1.115, 0.35);
  group.rotation.y = 0.08;
  const paperMaterial = standard(0xe8dfc7, 0.9);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.035, 1.45), paperMaterial);
  paper.receiveShadow = true;
  group.add(paper);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(2.08, 1.28), makeNewspaperMaterial());
  front.rotation.x = -Math.PI / 2;
  front.position.y = 0.028;
  group.add(front);
  group.userData.paperMaterial = paperMaterial;
  scene.add(group);
  return group;
}

function makeNewspaperMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 560;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f1ead8";
  ctx.fillRect(0, 0, 900, 560);
  ctx.fillStyle = "#1e211f";
  ctx.textAlign = "center";
  ctx.font = "900 70px Georgia";
  ctx.fillText("LACROSSE DAILY", 450, 82);
  ctx.fillRect(42, 102, 816, 5);
  ctx.font = "900 42px Georgia";
  ctx.fillText("FRONT OFFICE MAKES ITS MOVE", 450, 162);
  ctx.fillStyle = "#466879";
  ctx.fillRect(45, 195, 360, 210);
  ctx.fillStyle = "#222";
  for (let column = 0; column < 2; column += 1) {
    for (let row = 0; row < 10; row += 1) ctx.fillRect(445 + column * 205, 200 + row * 21, 175 - (row % 3) * 24, 7);
  }
  for (let row = 0; row < 5; row += 1) ctx.fillRect(45, 435 + row * 20, 800 - (row % 2) * 90, 7);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function buildOfficeDecor(scene) {
  const shelf = standard(0x302116, 0.66);
  addBox(scene, [2.2, 3.2, 0.4], 0, [-4.72, 1.72, -5.8], { material: shelf });
  [0.55, 1.28, 2.02, 2.75].forEach((y) => addBox(scene, [2, 0.08, 0.72], 0, [-4.72, y, -5.52], { material: shelf }));
  const colors = [0x914250, 0x285d7a, 0x737a42, 0xc09244];
  for (let i = 0; i < 16; i += 1) addBox(scene, [0.18, 0.45 + i % 2 * 0.13, 0.3], colors[i % colors.length], [-5.45 + i % 8 * 0.21, 0.88 + Math.floor(i / 8) * 0.75, -5.18], { cast: false });
  [4.45, 4.95].forEach((x, index) => {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.7, 9), standard(0xc9d0d5, 0.22, 0.85));
    shaft.position.set(x, 2.05, -6.3);
    shaft.rotation.z = index ? -0.18 : 0.18;
    scene.add(shaft);
    const head = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.42, 0.58, 0.08)), new THREE.LineBasicMaterial({ color: index ? 0x20ff9f : 0x00e5ff }));
    head.position.set(x + (index ? 0.23 : -0.23), 3.42, -6.3);
    scene.add(head);
  });
  const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 0.6, 18), standard(0xd3a83f, 0.2, 0.82));
  trophy.position.set(-4.7, 3.22, -5.4);
  scene.add(trophy);
}

function buildFirstPersonHands(camera) {
  const skin = standard(0xc88f69, 0.72);
  const cuff = standard(0x26394f, 0.58);
  const create = (side) => {
    const group = new THREE.Group();
    group.position.set(side * 0.65, -0.55, -1.05);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.58, 7, 14), cuff);
    sleeve.rotation.x = Math.PI / 2.65;
    sleeve.position.z = 0.25;
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.42), skin);
    palm.position.z = -0.12;
    group.add(sleeve, palm);
    camera.add(group);
    return group;
  };
  return { left: create(-1), right: create(1) };
}

function createPressConference() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080b10);
  scene.fog = new THREE.Fog(0x080b10, 13, 30);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.04, 42);
  camera.position.set(0, 1.7, 7.1);
  camera.lookAt(0, 1.55, -0.6);
  const renderer = makeRenderer(pressHost);
  addLights(scene, false);
  const stage = addBox(scene, [12, 0.28, 8], 0x20262c, [0, 0.05, -1.7]);
  stage.receiveShadow = true;
  addBox(scene, [12, 5, 0.3], 0x12283a, [0, 2.5, -5.5]);
  addBox(scene, [12, 0.18, 11], 0x14191e, [0, 5, -0.2], { cast: false });
  const backdropMaterial = createPressBackdrop("LACROSSE", "#159cc4");
  const backdrop = addBox(scene, [9.7, 3.6, 0.08], 0, [0, 2.5, -5.28], { material: backdropMaterial, cast: false });
  const podium = buildPodium(scene);
  const player = buildPressPlayer(scene);
  const cameras = [buildCameraRig(scene, -2.85, 3.25), buildCameraRig(scene, 2.85, 3.35)];
  buildPressAudience(scene);
  const clock = new THREE.Clock();
  let active = false;
  let talking = false;

  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    if (active) {
      player.group.position.y = Math.sin(t * 1.2) * 0.006;
      player.mouth.scale.x = talking && Math.sin(t * 12) > 0 ? 1.35 : 0.72;
      player.head.rotation.y = talking ? Math.sin(t * 1.8) * 0.08 : Math.sin(t * 0.55) * 0.025;
      player.arm.rotation.z = talking ? -0.25 + Math.sin(t * 2.5) * 0.14 : -0.08;
      cameras.forEach((rig, index) => { rig.rotation.y = Math.sin(t * 0.35 + index) * 0.025; });
    }
    renderer.render(scene, camera);
    clock.getDelta();
  }
  animate();
  return {
    renderer,
    camera,
    open(config = {}) {
      active = true;
      camera.position.set(0, 1.7, 7.1);
      camera.lookAt(0, 1.55, -0.6);
      if (config.teamName) {
        backdrop.material = createPressBackdrop(config.teamName, config.accent || "#159cc4");
        backdrop.material.needsUpdate = true;
      }
    },
    close() { active = false; talking = false; },
    setPlayer(data = null) {
      player.group.visible = !!data;
      podium.visible = !!data;
      if (!data) return;
      player.uniform.color.set(data.color || "#159cc4");
      const seed = [...String(data.name || "Player")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      player.skin.color.setHSL(0.06, 0.38, 0.55 + seed % 9 / 100);
      player.hair.color.set(seed % 3 ? 0x251c18 : 0x6b625c);
    },
    setTalking(value) { talking = !!value; }
  };
}

function createPressBackdrop(teamName, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#102536";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  for (let x = 0; x < 1024; x += 256) {
    for (let y = 0; y < 512; y += 128) {
      ctx.strokeRect(x + 18, y + 18, 218, 92);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 21px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(String(teamName).toUpperCase().slice(0, 18), x + 127, y + 75);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.78 });
}

function buildPodium(scene) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.35, 0.7), standard(0x3c2418, 0.48));
  body.position.y = 0.82;
  const top = new THREE.Mesh(new THREE.BoxGeometry(2, 0.16, 0.9), standard(0x54301b, 0.42));
  top.position.y = 1.5;
  group.add(body, top);
  group.position.set(0, 0.1, 0.25);
  group.traverse((item) => { if (item.isMesh) item.castShadow = true; });
  scene.add(group);
  [-0.35, 0.35].forEach((x) => {
    const stem = addBox(scene, [0.035, 0.7, 0.035], 0x777f86, [x, 1.85, 0.08], { metalness: 0.8 });
    stem.rotation.z = x > 0 ? 0.22 : -0.22;
    const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.2, 5, 10), standard(0x171a1d, 0.35));
    mic.position.set(x + (x > 0 ? 0.08 : -0.08), 2.18, 0.08);
    scene.add(mic);
  });
  return group;
}

function buildPressPlayer(scene) {
  const group = new THREE.Group();
  group.position.set(0, 0, -0.85);
  const uniform = standard(0x159cc4, 0.58);
  const skin = standard(0xc78e69, 0.72);
  const hair = standard(0x241b17, 0.8);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.82, 8, 18), uniform);
  torso.position.y = 1.55;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 16), skin);
  neck.position.y = 2.14;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), skin);
  head.position.y = 2.45;
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.326, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), hair);
  hairCap.position.y = 2.56;
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.02), standard(0x63372d, 0.8));
  mouth.position.set(0, 2.34, 0.3);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.58, 6, 12), uniform);
  arm.position.set(0.5, 1.55, 0.08);
  group.add(torso, neck, head, hairCap, mouth, arm);
  [-0.12, 0.12].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), standard(0x172029, 0.25));
    eye.position.set(x, 2.5, 0.29);
    group.add(eye);
  });
  group.traverse((item) => { if (item.isMesh) item.castShadow = true; });
  group.visible = false;
  scene.add(group);
  return { group, uniform, skin, hair, head, mouth, arm };
}

function buildCameraRig(scene, x, z) {
  const rig = new THREE.Group();
  rig.position.set(x, 0, z);
  const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 0.9), standard(0x171a1e, 0.28, 0.4));
  cameraBody.position.y = 1.9;
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.55, 18), standard(0x222a30, 0.18, 0.7));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 1.9, -0.62);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.08), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 }));
  light.position.set(0, 2.35, -0.2);
  rig.add(cameraBody, lens, light);
  [-0.32, 0, 0.32].forEach((offset, index) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.65, 8), standard(0x5c6267, 0.28, 0.8));
    leg.position.set(offset, 0.83, index === 1 ? 0.18 : 0);
    leg.rotation.z = offset * 0.25;
    rig.add(leg);
  });
  rig.rotation.y = x < 0 ? -0.28 : 0.28;
  scene.add(rig);
  return rig;
}

function buildPressAudience(scene) {
  const skin = standard(0xb98262, 0.76);
  for (let i = 0; i < 10; i += 1) {
    const x = -4.8 + i % 5 * 2.4;
    const z = 4.7 + Math.floor(i / 5) * 1.3;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), skin);
    head.position.set(x, 1.35 + i % 2 * 0.1, z);
    scene.add(head);
  }
}

function resize() {
  [office, press].filter(Boolean).forEach((experience) => {
    experience.camera.aspect = innerWidth / innerHeight;
    experience.camera.updateProjectionMatrix();
    experience.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
    experience.renderer.setSize(innerWidth, innerHeight);
  });
}

addEventListener("resize", resize);

window.newsOffice3D = {
  open(config) {
    if (!office) office = createOffice();
    resize();
    office.open(config);
  },
  close() { if (office) office.close(); },
  pickUpPaper() { if (office) office.pickUpPaper(); },
  lowerPaper() { if (office) office.lowerPaper(); }
};

window.pressConference3D = {
  open(config) {
    if (!press) press = createPressConference();
    resize();
    press.open(config);
  },
  close() { if (press) press.close(); },
  setPlayer(player) { if (press) press.setPlayer(player); },
  setTalking(value) { if (press) press.setTalking(value); }
};

window.dispatchEvent(new Event("news-interview-3d-ready"));
