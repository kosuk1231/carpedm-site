// CARPEDM 캠퍼스 둘레의 도심: 평평한 시가지, 캠퍼스 남쪽 보도에 바로 붙은 큰길과 순환도로,
// 파스텔 톤 빌딩 블록, 가로수, 오가는 차와 셔틀. 그리고 동·서·북 담장(남쪽은 열려 있음)과 모서리 조명탑, 셔틀 정류장.

import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { N, GATE_X, OUT_LEN } from '../../data/villageMap';
import { rand } from './kit';

const HALF = N / 2;
// 3D 좌표(X, Z)의 땅 높이: 도심은 평지
export function heightAt() {
  return 0;
}

// 걷는 사람의 발 높이
export function groundY() {
  return 0;
}

function windowsCanvas() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(70,96,110,.55)';
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(8 + i * 32, 10 + j * 32, 18, 16);
  g.fillStyle = 'rgba(255,255,255,.5)';
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(10 + i * 32, 12 + j * 32, 5, 12);
  return c;
}

function laneCanvas() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = '#6C7074'; g.fillRect(0, 0, 128, 32);
  g.fillStyle = '#F2EEE6'; g.fillRect(0, 15, 60, 3);
  return c;
}

export function buildTerrain(THREE, kit, scene) {
  const { track, toon, mesh, canvasTex } = kit;
  const updates = [];
  const X0 = GATE_X - HALF;
  const clay = (color, extra = {}) => track(new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra }));

  // 바닥: 연한 보도블록 색의 넓은 평지
  const flat = (w, d, x, z, mat, y = 0) => {
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(w, d)), mat);
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true;
    scene.add(m); return m;
  };
  flat(600, 600, 0, 0, clay('#E2DCD0'), -0.02);
  // 캠퍼스 둘레 잔디 띠(남쪽은 보도까지)
  flat(N + 8, N + 4, 0, -2, clay('#A9C48A'), -0.01);
  // 캠퍼스 남쪽 보도: 큰길에서 바로 캠퍼스로 이어짐
  flat(N + 8, OUT_LEN, 0, HALF + OUT_LEN / 2, clay('#EAE5DA'), -0.005);
  flat(6, OUT_LEN + 3, X0, HALF + OUT_LEN / 2 - 1.5, clay('#F2EEE6'), -0.003); // 입구 앞 밝은 포장

  // 도로: 아스팔트 + 차선
  const lane = canvasTex(laneCanvas(), { repeat: true });
  const roadMat = (len, vertical) => {
    const t = lane.clone(); t.needsUpdate = true; track(t);
    t.repeat.set(len / 8, 1);
    if (vertical) t.rotation = Math.PI / 2;
    return clay('#ffffff', { map: t });
  };
  const ROAD = 7;
  const roadEW = (z, x0, x1) => flat(x1 - x0, ROAD, (x0 + x1) / 2, z, roadMat(x1 - x0), 0.005);
  const roadNS = (x, z0, z1) => { const m = flat(ROAD, z1 - z0, x, (z0 + z1) / 2, roadMat(z1 - z0)); m.material.map.rotation = Math.PI / 2; m.material.map.center.set(0.5, 0.5); m.material.map.repeat.set((z1 - z0) / 8, 1); m.position.y = 0.004; return m; };
  const STREET_Z = HALF + OUT_LEN + ROAD / 2; // 캠퍼스 보도 바로 앞 큰길(동서)
  const RING = HALF + 7.5;              // 순환도로 중심선
  roadEW(STREET_Z, -260, 260);
  roadEW(-RING, -260, 260);
  roadNS(-RING, -RING, STREET_Z);
  roadNS(RING, -RING, STREET_Z);
  roadNS(0, STREET_Z + ROAD / 2, 260);
  roadNS(-RING, -260, -RING); roadNS(RING, -260, -RING);
  // 횡단보도(정류장 앞)
  for (let i = 0; i < 6; i++) flat(0.5, ROAD - 0.6, X0 - 1.5 + i * 0.6, STREET_Z, clay('#F4F1EA'), 0.012);

  const glass = track(new THREE.MeshStandardMaterial({ color: '#BFE0E4', roughness: 0.3, transparent: true, opacity: 0.45 }));

  // 빌딩 블록: 파스텔 톤 상자 빌딩을 하나로 합쳐 그림(그리기 호출 1번)
  const winTex = canvasTex(windowsCanvas(), { repeat: true });
  const palette = ['#F2D9C4', '#CFE0E3', '#E9E2F0', '#F4E7B8', '#D6E6CF', '#F1CFC7', '#E4DCCF', '#C9D7E8'].map((c) => new THREE.Color(c));
  const geos = [], roofGeos = [];
  const inCampusZone = (x, z) => Math.abs(x) < RING + ROAD / 2 + 2 && z > -RING - ROAD / 2 - 2 && z < STREET_Z + ROAD / 2 + 2;
  const onRoad = (x, z, w, d) => Math.abs(x) < ROAD / 2 + w / 2 + 1 && z > STREET_Z
    || Math.abs(z - STREET_Z) < ROAD / 2 + d / 2 + 1 || Math.abs(z + RING) < ROAD / 2 + d / 2 + 1
    || (Math.abs(Math.abs(x) - RING) < ROAD / 2 + w / 2 + 1);
  let k = 0;
  for (let gx = -200; gx <= 200; gx += 16) {
    for (let gz = -200; gz <= 220; gz += 16) {
      for (let j = 0; j < 2; j++) {
        k++;
        const w = 5 + rand(k) * 6, d = 5 + rand(k + 1) * 6;
        const x = gx + (j ? 4 : -3) + (rand(k + 2) - 0.5) * 3, z = gz + (rand(k + 3) - 0.5) * 6;
        if (inCampusZone(x, z) || onRoad(x, z, w, d)) continue;
        const near = Math.hypot(x, z - 10);
        const h = 3 + rand(k + 4) * (near < 60 ? 9 : 26) + (near > 90 ? rand(k + 5) * 18 : 0);
        const g = new THREE.BoxGeometry(w, h, d);
        const uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          const face = Math.floor(i / 4);
          const sx = face < 2 ? d : w;
          if (face === 2 || face === 3) uv.setXY(i, 0, 0); // 지붕·바닥은 창 없음
          else uv.setXY(i, uv.getX(i) * sx / 3, uv.getY(i) * h / 3);
        }
        g.translate(x, h / 2, z);
        const col = palette[Math.floor(rand(k + 6) * palette.length)];
        const cols = new Float32Array(g.attributes.position.count * 3);
        for (let i = 0; i < cols.length; i += 3) { cols[i] = col.r; cols[i + 1] = col.g; cols[i + 2] = col.b; }
        g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        geos.push(g);
        if (rand(k + 7) > 0.55) {
          const r = new THREE.BoxGeometry(w * 0.4, 0.8, d * 0.4); r.translate(x, h + 0.4, z);
          const rc = new Float32Array(r.attributes.position.count * 3).fill(0.85);
          r.setAttribute('color', new THREE.BufferAttribute(rc, 3));
          roofGeos.push(r);
        }
      }
    }
  }
  const cityMesh = new THREE.Mesh(track(mergeGeometries(geos, false)), clay('#ffffff', { map: winTex, vertexColors: true }));
  cityMesh.receiveShadow = true;
  scene.add(cityMesh);
  if (roofGeos.length) scene.add(new THREE.Mesh(track(mergeGeometries(roofGeos, false)), clay('#ffffff', { vertexColors: true })));
  geos.forEach((g) => g.dispose()); roofGeos.forEach((g) => g.dispose());

  // 가로수: 둥근 클레이 나무를 길가에
  const trunkGeo = track(new THREE.CylinderGeometry(0.15, 0.22, 1.6, 7)); trunkGeo.translate(0, 0.8, 0);
  const crownGeo = track(new THREE.IcosahedronGeometry(1.1, 1)); crownGeo.translate(0, 2.4, 0);
  const spots = [];
  for (let x = -120; x <= 120; x += 6) { spots.push([x, STREET_Z - ROAD / 2 - 1.2]); spots.push([x, STREET_Z + ROAD / 2 + 1.2]); spots.push([x, -RING - ROAD / 2 - 1.2]); }
  for (let z = -RING; z <= STREET_Z; z += 6) for (const s of [-1, 1]) { spots.push([s * (RING + ROAD / 2 + 1.2), z]); spots.push([s * (RING - ROAD / 2 - 1.2), z]); }
  // 캠퍼스 앞 보도는 비워 둠(걸어 들어오는 길)
  const keep = spots.filter(([x, z]) => !(Math.abs(x) < HALF + 3 && z > HALF - 1 && z < STREET_Z));
  const trunks = new THREE.InstancedMesh(trunkGeo, clay('#8A6448'), keep.length);
  const crowns = new THREE.InstancedMesh(crownGeo, clay('#8DBA6E'), keep.length);
  const mtx = new THREE.Matrix4(), q4 = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  const crownCol = ['#8DBA6E', '#7FAE62', '#A3C77F', '#F2B8C6'].map((c) => new THREE.Color(c));
  keep.forEach(([x, z], i) => {
    const s = 0.85 + rand(i) * 0.3;
    ps.set(x, 0, z); q4.identity(); sc.set(s, s, s); mtx.compose(ps, q4, sc);
    trunks.setMatrixAt(i, mtx); crowns.setMatrixAt(i, mtx);
    crowns.setColorAt(i, crownCol[i % 9 === 0 ? 3 : i % 3]);
  });
  for (const im of [trunks, crowns]) { im.castShadow = true; scene.add(im); }

  // 오가는 차: 큰길과 북쪽 순환도로
  const carCols = ['#F2B8A0', '#A9CBE0', '#F4E1A0', '#B8D8B0', '#E0B8D8', '#F4F1EA'];
  const cars = [];
  for (let i = 0; i < 12; i++) {
    const c = new THREE.Group();
    c.add(mesh(new THREE.BoxGeometry(2.4, 0.7, 1.2), clay(carCols[i % carCols.length]), { y: 0.55 }));
    c.add(mesh(new THREE.BoxGeometry(1.4, 0.55, 1.1), clay('#BFD8E2', { transparent: true, opacity: 0.85 }), { x: -0.1, y: 1.15 }));
    for (const x of [-0.8, 0.8]) for (const z of [-0.6, 0.6]) c.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 12), clay('#3A3F44'), { x, y: 0.25, z, rx: Math.PI / 2 }));
    scene.add(c);
    const north = i >= 8;
    cars.push({ c, dir: i % 2 ? 1 : -1, z: (north ? -RING : STREET_Z) + (i % 2 ? 1.6 : -1.6), off: rand(i) * 240, speed: 7 + rand(i + 3) * 4 });
  }
  updates.push((t) => {
    for (const car of cars) {
      const x = (((car.off + t * car.speed) % 240) + 240) % 240 - 120;
      car.c.position.set(car.dir * x, 0, car.z);
      car.c.rotation.y = car.dir > 0 ? 0 : Math.PI;
    }
  });

  // 캠퍼스 담장: 낮은 석재 담 + 위쪽 생울타리. 남쪽은 담 없이 보도로 열어 둠
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
  const H = HALF;
  wallSeg(-H, -H, H, -H);
  wallSeg(-H, -H, -H, H);
  wallSeg(H, -H, H, H);
  // 모서리 조명탑(밤처럼 은은한 빛)
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    scene.add(mesh(new THREE.BoxGeometry(1.4, 3.6, 1.4), toon('#E6E1D6'), { x: sx * H, y: 1.8, z: sz * H }));
    scene.add(mesh(new THREE.BoxGeometry(1.5, 0.3, 1.5), toon('#FFE2A8', { emissive: 0xFFB45A, emissiveIntensity: 0.7 }), { x: sx * H, y: 3.3, z: sz * H, cast: false }));
    scene.add(mesh(new THREE.BoxGeometry(1.6, 0.12, 1.6), toon('#2E3436'), { x: sx * H, y: 3.66, z: sz * H }));
  }
  // 셔틀 정류장(출발점 옆, 보도 끝 차도 쪽): 지붕, 벤치, 노선 표지판. 뒤판은 캠퍼스 쪽
  const stop = new THREE.Group();
  stop.position.set(X0 + 6.2, 0, HALF + OUT_LEN - 0.9);
  stop.rotation.y = Math.PI / 2;
  stop.add(mesh(new THREE.BoxGeometry(1.6, 0.08, 2.4), toon('#2E3436'), { y: 2.3 }));
  for (const z of [-1.1, 1.1]) stop.add(mesh(new THREE.BoxGeometry(0.08, 2.3, 0.08), toon('#2E3436'), { x: 0.7, y: 1.15, z }));
  stop.add(mesh(new THREE.BoxGeometry(0.04, 1.6, 2.2), glass, { x: 0.72, y: 1.2, cast: false }));
  stop.add(mesh(new THREE.BoxGeometry(0.4, 0.06, 1.8), toon('#B98A5A'), { x: 0.4, y: 0.45 }));
  stop.add(mesh(new THREE.BoxGeometry(0.06, 0.7, 0.5), toon('#43706A'), { x: -0.5, y: 2.75, z: -1.0 }));
  scene.add(stop);
  // 자율주행 셔틀: 정류장 앞 큰길을 오감
  const shuttle = new THREE.Group();
  shuttle.add(mesh(new THREE.BoxGeometry(2.6, 1.2, 1.4), toon('#F4F1EA'), { y: 0.95 }));
  shuttle.add(mesh(new THREE.BoxGeometry(2.3, 0.5, 1.42), clay('#4F7D86', { transparent: true, opacity: 0.8 }), { y: 1.15, cast: false }));
  shuttle.add(mesh(new THREE.BoxGeometry(2.62, 0.12, 1.44), toon('#E0995A'), { y: 0.55 }));
  for (const x of [-0.9, 0.9]) for (const z of [-0.7, 0.7]) shuttle.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 14), toon('#2E3436'), { x, y: 0.3, z, rx: Math.PI / 2 }));
  scene.add(shuttle);
  updates.push((t) => {
    const k = Math.sin(t * 0.1);
    shuttle.position.set(X0 + k * 40, 0, STREET_Z - 1.6);
    shuttle.rotation.y = Math.cos(t * 0.1) > 0 ? 0 : Math.PI;
  });

  return { update: (t) => updates.forEach((f) => f(t)) };
}
