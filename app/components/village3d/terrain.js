// 융중성 바깥의 실제 지형: 성이 앉은 평지, 남쪽으로 뻗은 골짜기 길, 길을 가로지르는 강과 다리,
// 둘레의 구릉과 먼 산, 숲과 바위, 바람에 눕는 풀. 그리고 캠퍼스 담장과 모서리 조명탑, 셔틀 정류장.

import { N, GATE_X, OUT_LEN, RIVER_Y, BRIDGE_HALF, riverZ } from '../../data/villageMap';
import { rand, hash3 } from './kit';

const HALF = N / 2;

// 값 노이즈 + fbm
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const h = (a, b) => hash3(a, b, 7.13);
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = h(xi, zi), b = h(xi + 1, zi), c = h(xi, zi + 1), d = h(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, z, oct = 5) {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += vnoise(x * f, z * f) * amp; f *= 2.03; amp *= 0.5; }
  return s;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// 3D 좌표(X, Z)의 땅 높이
const VALLEY_END = HALF + 56;
const V0 = HALF + 16, V1 = HALF + 46; // 골짜기가 굽기 시작하는 구간
export const riverWorldZ = (X) => riverZ(X + HALF) - HALF;
export function heightAt(X, Z) {
  // 평평해야 하는 곳: 성 둘레와 남쪽 골짜기 바닥
  const dCity = Math.hypot(Math.max(Math.abs(X) - (HALF + 2.5), 0), Math.max(Math.abs(Z) - (HALF + 2.5), 0));
  const valleyHalf = 6 + Math.max(0, Z - V0) * 0.12;
  const dValley = Z > HALF - 4 ? Math.hypot(Math.max(Math.abs(X + Math.sin(Z * 0.05) * 2 * smooth(V0, V1, Z)) - valleyHalf, 0), Math.max(Z - VALLEY_END, 0)) : 1e3;
  const d = Math.min(dCity, dValley);
  const r = Math.hypot(X, Z - (HALF - 8));
  let h = fbm(X * 0.035, Z * 0.035) * 9 * smooth(0, 14, d);
  h += smooth(HALF + 28, HALF + 81, r) * (fbm(X * 0.02 + 9, Z * 0.02 - 3, 4) * 46 + 6);
  h += smooth(0, 8, d) * 0.6;
  // 강이 골짜기를 깎음
  // 강: 둘레가 높든 낮든 일정한 깊이의 물길로 깎음(언덕을 지나면 협곡이 됨)
  const dr = Math.abs(Z - riverWorldZ(X));
  const bed = 1 - smooth(1.4, 4.2, dr);
  h = h * (1 - bed) + -1.25 * bed;
  return h;
}

// 걷는 사람의 발 높이(다리 위는 아치)
export function groundY(x, y) {
  const X = x - HALF;
  if (y > N + 0.5 && Math.abs(X - (GATE_X - HALF)) < BRIDGE_HALF + 0.3) {
    const Z = y - HALF, dz = Z - riverWorldZ(X);
    if (Math.abs(dz) < 2.6) return 0.55 * Math.cos((dz / 2.6) * Math.PI * 0.5);
  }
  return 0;
}

function terrainColor(THREE, X, Z, h, slope) {
  const c = new THREE.Color();
  const n = fbm(X * 0.08 + 3, Z * 0.08, 3);
  const grassA = new THREE.Color('#8FA866'), grassB = new THREE.Color('#6E8C52'), dry = new THREE.Color('#BBAF7A');
  const rock = new THREE.Color('#8E8A7E'), rockDark = new THREE.Color('#5E6058'), bank = new THREE.Color('#7A6E52');
  c.copy(grassA).lerp(grassB, n);
  c.lerp(dry, smooth(0.55, 0.8, fbm(X * 0.03 - 5, Z * 0.03 + 2, 3)) * 0.6);
  if (h < -0.3) c.lerp(bank, smooth(-0.3, -1.2, h));
  c.lerp(rock, smooth(0.45, 0.9, slope));
  c.lerp(rockDark, smooth(18, 40, h) * 0.6);
  return c;
}

export function buildTerrain(THREE, kit, scene) {
  const { track, toon, mesh, curvedRoof, tileTex, canvasTex } = kit;
  const updates = [];

  // 땅
  const SIZE = 340, SEG = 260;
  const geo = track(new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG));
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const e = 0.6;
  for (let i = 0; i < p.count; i++) {
    const X = p.getX(i), Z = p.getZ(i);
    const h = heightAt(X, Z);
    p.setY(i, h);
    const slope = Math.min(1, Math.hypot(heightAt(X + e, Z) - heightAt(X - e, Z), heightAt(X, Z + e) - heightAt(X, Z - e)) / (2 * e) / 1.4);
    const c = terrainColor(THREE, X, Z, h, slope);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(geo, track(new THREE.MeshLambertMaterial({ vertexColors: true })));
  terrain.receiveShadow = true;
  scene.add(terrain);

  // 강물
  const waterUniforms = { uTime: { value: 0 } };
  const riverMat = track(new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    transparent: true,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uTime; varying vec3 vW;
      void main(){
        vec3 deep = vec3(0.32,0.50,0.50); vec3 light = vec3(0.86,0.94,0.92);
        float flow = sin(vW.x*0.9 - uTime*1.6 + sin(vW.z*2.1)*0.8) * sin(vW.z*3.3 + uTime*0.7);
        float line = smoothstep(0.82, 0.97, flow);
        gl_FragColor = vec4(mix(deep, light, line*0.8), 0.92);
      }`,
  }));
  const riverGeo = track(new THREE.PlaneGeometry(SIZE, 5.2, 260, 1));
  riverGeo.rotateX(-Math.PI / 2);
  const rp = riverGeo.attributes.position;
  for (let i = 0; i < rp.count; i++) rp.setZ(i, rp.getZ(i) + riverWorldZ(rp.getX(i)));
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.position.y = -0.78;
  scene.add(river);
  updates.push((t) => { waterUniforms.uTime.value = t; });

  // 보행교: 흰 아치 상판, 유리 난간, 손잡이 조명
  const bridgeGlass = track(new THREE.MeshToonMaterial({ color: '#BFE0E4', gradientMap: kit.ramp, transparent: true, opacity: 0.45 }));
  const bridge = new THREE.Group();
  const X0 = GATE_X - HALF, Zr = riverWorldZ(X0);
  bridge.position.set(X0, 0, Zr);
  const plank = toon('#ECE8DF'), rail = toon('#2E3436');
  for (let i = -12; i <= 12; i++) {
    const dz = (i / 12) * 2.6;
    const y = 0.55 * Math.cos((dz / 2.6) * Math.PI * 0.5);
    bridge.add(mesh(new THREE.BoxGeometry(2.8, 0.1, 0.22), plank, { y: y - 0.02, z: dz, rx: -Math.sin((dz / 2.6) * Math.PI * 0.5) * 0.35 }));
    if (i % 3 === 0) for (const s of [-1, 1]) bridge.add(mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), rail, { x: s * 1.35, y: y + 0.3, z: dz }));
    if (i % 2 === 0) for (const s of [-1, 1]) bridge.add(mesh(new THREE.BoxGeometry(0.02, 0.5, 0.22), bridgeGlass, { x: s * 1.35, y: y + 0.28, z: dz, cast: false }));
  }
  for (const s of [-1, 1]) {
    const pts = [];
    for (let i = -12; i <= 12; i++) { const dz = (i / 12) * 2.6; pts.push(new THREE.Vector3(s * 1.35, 0.55 * Math.cos((dz / 2.6) * Math.PI * 0.5) + 0.6, dz)); }
    bridge.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.04, 6), toon('#FFE2A8', { emissive: 0xFFB45A, emissiveIntensity: 0.6 })));
  }
  for (const s of [-1, 1]) for (const z of [-2.2, 2.2]) bridge.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 8), toon('#CFC8BA'), { x: s * 1.2, y: -0.5, z }));
  scene.add(bridge);

  // 성 밖 흙길(다리 앞뒤로 나눔)
  const roadTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 64, 0);
    gr.addColorStop(0, 'rgba(196,176,130,0)'); gr.addColorStop(0.2, 'rgba(206,188,144,.95)');
    gr.addColorStop(0.8, 'rgba(206,188,144,.95)'); gr.addColorStop(1, 'rgba(196,176,130,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(150,128,90,${0.15 + rand(i) * 0.2})`; g.beginPath(); g.ellipse(12 + rand(i + 3) * 40, rand(i + 5) * 256, 3, 2, 0, 0, Math.PI * 2); g.fill(); }
    return canvasTex(c, { repeat: true });
  })();
  const roadMat = track(new THREE.MeshLambertMaterial({ map: roadTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  const roadStrip = (z0, z1) => {
    const len = z1 - z0;
    const g2 = track(new THREE.PlaneGeometry(3.4, len, 1, Math.ceil(len)));
    g2.rotateX(-Math.PI / 2);
    const q = g2.attributes.position;
    for (let i = 0; i < q.count; i++) {
      const Z = q.getZ(i) + (z0 + z1) / 2;
      const X = X0 + q.getX(i) + Math.sin(Z * 0.05) * 2 * smooth(V0, V1, Z);
      q.setX(i, X); q.setZ(i, Z); q.setY(i, heightAt(X, Z) + 0.04);
    }
    roadTex.repeat.set(1, len / 6);
    const m = new THREE.Mesh(g2, roadMat);
    m.receiveShadow = true;
    scene.add(m);
  };
  roadStrip(HALF + 0.5, Zr - 2.7);
  roadStrip(Zr + 2.7, HALF + 52);

  // 숲: 구릉에 소나무를 흩뿌림(인스턴스 한 벌)
  const trunkGeo = track(new THREE.CylinderGeometry(0.12, 0.2, 1.8, 5));
  trunkGeo.translate(0, 0.9, 0);
  const crownGeo = track(new THREE.ConeGeometry(1.1, 2.6, 7));
  crownGeo.translate(0, 2.6, 0);
  const crown2 = track(new THREE.ConeGeometry(0.85, 2.0, 7));
  crown2.translate(0, 3.6, 0);
  const COUNT = 1100;
  const trunks = new THREE.InstancedMesh(trunkGeo, toon('#5A3F26'), COUNT);
  const crowns = new THREE.InstancedMesh(crownGeo, toon('#4A6B4C'), COUNT);
  const crowns2 = new THREE.InstancedMesh(crown2, toon('#567A56'), COUNT);
  const mtx = new THREE.Matrix4(), q4 = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  let n = 0;
  for (let i = 0; n < COUNT && i < 20000; i++) {
    const X = (rand(i * 3 + 1) - 0.5) * 240, Z = (rand(i * 3 + 2) - 0.5) * 240 + 10;
    const h = heightAt(X, Z);
    if (Math.abs(X) < HALF + 4 && Math.abs(Z) < HALF + 4) continue;               // 성 안·성벽 둘레
    if (Z > HALF - 2 && Math.abs(X) < 8 + Math.max(0, Z - V0) * 0.12) continue; // 골짜기 길
    if (Math.abs(Z - riverWorldZ(X)) < 3.5) continue;                     // 강가
    if (h > 26 || fbm(X * 0.05, Z * 0.05, 3) < 0.42) continue;           // 숲이 성긴 곳
    const s = 0.8 + rand(i) * 0.7;
    ps.set(X, h - 0.1, Z); q4.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand(i + 9) * 6); sc.set(s, s * (0.9 + rand(i + 4) * 0.4), s);
    mtx.compose(ps, q4, sc);
    trunks.setMatrixAt(n, mtx); crowns.setMatrixAt(n, mtx); crowns2.setMatrixAt(n, mtx);
    n++;
  }
  for (const im of [trunks, crowns, crowns2]) { im.count = n; im.castShadow = true; im.receiveShadow = true; scene.add(im); }

  // 바람에 눕는 풀(성 밖 골짜기와 강가)
  const bladeGeo = track(new THREE.PlaneGeometry(0.06, 0.34, 1, 3));
  bladeGeo.translate(0, 0.17, 0);
  const grassUniforms = { uTime: { value: 0 } };
  const grassMat = track(new THREE.MeshLambertMaterial({ color: '#86A35E', side: THREE.DoubleSide }));
  grassMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = grassUniforms.uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 ip = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
        float sway = sin(uTime*1.8 + ip.x*0.35 + ip.z*0.25) * 0.5 + sin(uTime*3.1 + ip.x*1.3) * 0.15;
        transformed.x += sway * position.y * 0.45;
        transformed.z += sway * position.y * 0.2;`);
  };
  const GRASS = 9000;
  const grass = new THREE.InstancedMesh(bladeGeo, grassMat, GRASS);
  let g = 0;
  for (let i = 0; g < GRASS && i < 60000; i++) {
    const X = (rand(i * 7 + 11) - 0.5) * 80, Z = HALF + rand(i * 7 + 12) * 60;
    if (Math.abs(X - X0 - Math.sin(Z * 0.05) * 2 * smooth(V0, V1, Z)) < 2.6) continue; // 길 위는 비움
    if (Math.abs(Z - riverWorldZ(X)) < 2.6) continue;
    if (Z < HALF + 1.5) continue;
    const h = heightAt(X, Z);
    if (h > 8) continue;
    const s = 0.7 + rand(i) * 0.8;
    ps.set(X, h, Z); q4.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand(i + 5) * 6); sc.set(s, s, s);
    mtx.compose(ps, q4, sc);
    grass.setMatrixAt(g, mtx);
    g++;
  }
  grass.count = g;
  grass.receiveShadow = true;
  scene.add(grass);
  updates.push((t) => { grassUniforms.uTime.value = t; });

  // 캠퍼스 담장: 낮은 석재 담 + 위쪽 생울타리, 남쪽 가운데는 정문 자리로 비움
  const WALL_H = 1.1, WALL_T = 0.9;
  const stoneTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 64;
    const g2 = c.getContext('2d');
    g2.fillStyle = '#D6D0C2'; g2.fillRect(0, 0, 128, 64);
    g2.strokeStyle = 'rgba(120,112,98,.35)'; g2.lineWidth = 2;
    for (let r = 0; r < 2; r++) { g2.beginPath(); g2.moveTo(0, r * 32); g2.lineTo(128, r * 32); g2.stroke(); for (let k = 0; k < 3; k++) { const x = k * 48 + (r % 2) * 24; g2.beginPath(); g2.moveTo(x, r * 32); g2.lineTo(x, r * 32 + 32); g2.stroke(); } }
    return canvasTex(c, { repeat: true });
  })();
  const hedge = toon('#5E8A4B');
  const wallSeg = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const t = stoneTex.clone(); t.needsUpdate = true; t.repeat.set(len / 2.4, 1); track(t);
    const ry = -Math.atan2(z1 - z0, x1 - x0);
    scene.add(mesh(new THREE.BoxGeometry(len, WALL_H, WALL_T), toon('#ffffff', { map: t }), { x: (x0 + x1) / 2, y: WALL_H / 2, z: (z0 + z1) / 2, ry }));
    scene.add(mesh(new THREE.BoxGeometry(len, 0.7, WALL_T * 0.8), hedge, { x: (x0 + x1) / 2, y: WALL_H + 0.3, z: (z0 + z1) / 2, ry }));
  };
  const H = HALF, GAP = 3.1;
  wallSeg(-H, -H, H, -H);
  wallSeg(-H, -H, -H, H);
  wallSeg(H, -H, H, H);
  wallSeg(-H, H, -GAP, H);
  wallSeg(GAP, H, H, H);
  // 모서리 조명탑(밤처럼 은은한 빛)
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    scene.add(mesh(new THREE.BoxGeometry(1.4, 3.6, 1.4), toon('#E6E1D6'), { x: sx * H, y: 1.8, z: sz * H }));
    scene.add(mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), toon('#FFE2A8', { emissive: 0xFFB45A, emissiveIntensity: 0.7 }), { x: sx * H, y: 3.3, z: sz * H, cast: false }));
    scene.add(mesh(new THREE.BoxGeometry(1.6, 0.12, 1.6), toon('#2E3436'), { x: sx * H, y: 3.66, z: sz * H }));
  }
  // 셔틀 정류장(출발점 옆): 지붕, 벤치, 노선 표지판
  const stop = new THREE.Group();
  const SZ = HALF + OUT_LEN - 2;
  stop.position.set(X0 + 2.8, heightAt(X0 + 2.8, SZ), SZ);
  stop.add(mesh(new THREE.BoxGeometry(1.6, 0.08, 2.4), toon('#2E3436'), { y: 2.3 }));
  for (const z of [-1.1, 1.1]) stop.add(mesh(new THREE.BoxGeometry(0.08, 2.3, 0.08), toon('#2E3436'), { x: 0.7, y: 1.15, z }));
  stop.add(mesh(new THREE.BoxGeometry(0.04, 1.6, 2.2), bridgeGlass, { x: 0.72, y: 1.2, cast: false }));
  stop.add(mesh(new THREE.BoxGeometry(0.4, 0.06, 1.8), toon('#B98A5A'), { x: 0.4, y: 0.45 }));
  stop.add(mesh(new THREE.BoxGeometry(0.06, 0.7, 0.5), toon('#43706A'), { x: -0.5, y: 2.75, z: -1.0 }));
  scene.add(stop);
  // 자율주행 셔틀: 정류장 앞을 오감
  const shuttle = new THREE.Group();
  shuttle.add(mesh(new THREE.BoxGeometry(1.4, 1.2, 2.6), toon('#F4F1EA'), { y: 0.95 }));
  shuttle.add(mesh(new THREE.BoxGeometry(1.42, 0.5, 2.3), track(new THREE.MeshToonMaterial({ color: '#4F7D86', gradientMap: kit.ramp, transparent: true, opacity: 0.8 })), { y: 1.15, cast: false }));
  shuttle.add(mesh(new THREE.BoxGeometry(1.44, 0.12, 2.62), toon('#E0995A'), { y: 0.55 }));
  for (const x of [-0.7, 0.7]) for (const z of [-0.9, 0.9]) shuttle.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 14), toon('#2E3436'), { x, y: 0.3, z, rz: Math.PI / 2 }));
  scene.add(shuttle);
  updates.push((t) => {
    const k = (Math.sin(t * 0.12) + 1) / 2; // 천천히 왕복
    const Z = HALF + 20 + k * 30;
    const X = X0 - 3.2 + Math.sin(Z * 0.05) * 2 * smooth(V0, V1, Z);
    shuttle.position.set(X, heightAt(X, Z), Z);
    shuttle.rotation.y = Math.cos(t * 0.12) > 0 ? 0 : Math.PI;
  });

  return { update: (t) => updates.forEach((f) => f(t)) };
}
