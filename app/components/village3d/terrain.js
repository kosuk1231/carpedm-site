// CARPEDM 캠퍼스 둘레의 도심: 굽은 캠퍼스 부지를 따라 도는 순환도로와 사방으로 뻗은 굽은 길,
// 남쪽 큰길(캠퍼스 보도에 바로 붙음), 길을 피해 앉은 파스텔 톤 빌딩, 가로수, 생울타리, 먼 산줄기. 차는 다니지 않는 조용한 거리.

import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NX, NY, GATE_X, OUT_LEN, CAMPUS, offsetPoly, inPoly, HEDGE_IN } from '../../data/villageMap';
import { rand } from './kit';

const HX = NX / 2, HY = NY / 2;
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
  const X0 = GATE_X - HX;
  const clay = (color, extra = {}) => track(new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra }));

  // 바닥: 연한 보도블록 색의 넓은 평지
  const flat = (w, d, x, z, mat, y = 0) => {
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(w, d)), mat);
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true;
    scene.add(m); return m;
  };
  flat(700, 700, 0, 0, clay('#E2DCD0'), -0.02);

  // 캠퍼스 둘레(격자 좌표 → 3D 좌표)
  const toW = (p) => [p.x - HX, p.y - HY];
  const ROAD = 7;
  const RING_OFF = OUT_LEN + ROAD / 2;            // 둘레에서 순환도로 중심까지
  const rim = CAMPUS.map(toW);
  const ring = offsetPoly(CAMPUS, RING_OFF).map(toW);
  const STREET_Z = HY + RING_OFF;               // 캠퍼스 남쪽 큰길(동서)

  // 띠 모양(두 곡선 사이) 바닥
  const band = (inner, outer, y, mat, closed = true) => {
    const pos = [], idx = [];
    const n = inner.length;
    for (let i = 0; i < n; i++) pos.push(inner[i][0], y, inner[i][1], outer[i][0], y, outer[i][1]);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = i * 2, b = ((i + 1) % n) * 2;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    if (g.attributes.normal.getY(0) < 0) { idx.reverse(); g.setIndex(idx); g.computeVertexNormals(); }
    const m = new THREE.Mesh(track(g), mat); m.receiveShadow = true; scene.add(m); return m;
  };
  // 캠퍼스를 두른 보도(남쪽은 큰길 앞 보도)와 낮은 경계석
  band(rim, offsetPoly(CAMPUS, OUT_LEN).map(toW), -0.006, clay('#EAE5DA'));
  band(offsetPoly(CAMPUS, -0.05).map(toW), offsetPoly(CAMPUS, 0.35).map(toW), 0.02, clay('#D3CCBD'));
  flat(6, OUT_LEN + 3, X0, HY + OUT_LEN / 2 - 1.5, clay('#F2EEE6'), -0.003); // 입구 앞 밝은 포장

  // 도로: 곡선을 따라 까는 아스팔트 띠 + 차선
  const lane = canvasTex(laneCanvas(), { repeat: true });
  const roadMat = clay('#ffffff', { map: lane });
  const ribbon = (pts, width, y, closed = false) => {
    const pos = [], uv = [], idx = [];
    const n = pts.length;
    let len = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      if (i) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const nx = -tz * width / 2, nz = tx * width / 2;
      pos.push(pts[i][0] + nx, y, pts[i][1] + nz, pts[i][0] - nx, y, pts[i][1] - nz);
      uv.push(len / 8, 0, len / 8, 1);
    }
    if (closed) { // 이음매
      len += Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]);
      pos.push(pos[0], pos[1], pos[2], pos[3], pos[4], pos[5]); uv.push(len / 8, 0, len / 8, 1);
    }
    const m = pos.length / 6;
    for (let i = 0; i < m - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 2, a + 3, a + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    if (g.attributes.normal.getY(0) < 0) { idx.reverse(); g.setIndex(idx); g.computeVertexNormals(); }
    const mesh2 = new THREE.Mesh(track(g), roadMat); mesh2.receiveShadow = true; scene.add(mesh2);
  };
  const smoothLine = (ctrl, step = 3) => {
    // 조절점을 지나는 부드러운 길
    const out = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      const seg = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let k = 0; k < seg; k++) {
        const t = k / seg, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(ctrl[ctrl.length - 1]);
    return out;
  };
  const pick = (score) => ring.reduce((b, p) => (score(p) < score(b) ? p : b), ring[0]);
  const rN = pick((p) => p[1] + Math.abs(p[0] + 4) * 0.3), rE = pick((p) => -p[0] + Math.abs(p[1]) * 0.3);
  const rW = pick((p) => p[0] + Math.abs(p[1] + 2) * 0.3), rNW = pick((p) => p[0] + p[1]);
  const roads = {
    main: [[-300, STREET_Z], [300, STREET_Z]],
    south: smoothLine([[0, STREET_Z + ROAD / 2], [0, 80], [8, 150], [22, 300]]),
    north: smoothLine([rN, [rN[0] - 4, rN[1] - 40], [rN[0] - 18, -140], [rN[0] - 40, -300]]),
    east: smoothLine([rE, [rE[0] + 40, rE[1] + 3], [140, -6], [300, -22]]),
    west: smoothLine([rW, [rW[0] - 36, rW[1] + 4], [-130, 18], [-300, 36]]),
    diag: smoothLine([rNW, [rNW[0] - 40, rNW[1] - 34], [-200, -190]]),
  };
  ribbon(ring, ROAD, 0.006, true);
  Object.values(roads).forEach((pl, i) => ribbon(pl, ROAD, 0.004 + i * 0.0006));
  // 횡단보도(정류장 앞)
  for (let i = 0; i < 6; i++) flat(0.5, ROAD - 0.6, X0 - 1.5 + i * 0.6, STREET_Z, clay('#F4F1EA'), 0.012);
  const allRoads = [...Object.values(roads), [...ring, ring[0]]];
  const roadDist = (x, z) => {
    let best = Infinity;
    for (const pl of allRoads) for (let i = 0; i < pl.length - 1; i++) {
      const [ax, az] = pl[i], [bx, bz] = pl[i + 1];
      const dx = bx - ax, dz = bz - az;
      const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      best = Math.min(best, Math.hypot(x - (ax + u * dx), z - (az + u * dz)));
    }
    return best;
  };
  const glass = track(new THREE.MeshStandardMaterial({ color: '#BFE0E4', roughness: 0.3, transparent: true, opacity: 0.45 }));

  // 빌딩 블록: 파스텔 톤 상자 빌딩을 하나로 합쳐 그림(그리기 호출 1번). 길과 캠퍼스 둘레를 피해 앉힘
  const winTex = canvasTex(windowsCanvas(), { repeat: true });
  const palette = ['#F2D9C4', '#CFE0E3', '#E9E2F0', '#F4E7B8', '#D6E6CF', '#F1CFC7', '#E4DCCF', '#C9D7E8'].map((c) => new THREE.Color(c));
  const geos = [], roofGeos = [];
  const keepOut = offsetPoly(CAMPUS, RING_OFF + ROAD / 2 + 3);
  let k = 0;
  for (let gx = -176; gx <= 176; gx += 16) {
    for (let gz = -176; gz <= 190; gz += 16) {
      for (let j = 0; j < 2; j++) {
        k++;
        const w = 5 + rand(k) * 6, d = 5 + rand(k + 1) * 6;
        const x = gx + (j ? 4 : -3) + (rand(k + 2) - 0.5) * 3, z = gz + (rand(k + 3) - 0.5) * 6;
        if (Math.hypot(x, z) > 168) continue;
        if (inPoly(keepOut, x + HX, z + HY)) continue;
        if (roadDist(x, z) < ROAD / 2 + Math.max(w, d) * 0.72 + 1) continue;
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
        g.rotateY((rand(k + 8) - 0.5) * 0.5);
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

  // 먼 산: 도시를 두른 낮은 산줄기(안개에 묻혀 멀리 보임)
  const hillGeos = [];
  const hillCol = ['#9DB59A', '#8FAE93', '#A9BFA3', '#94A9A0'].map((c) => new THREE.Color(c));
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + rand(i + 900) * 0.15;
    const r = 185 + rand(i + 901) * 55, h = 18 + rand(i + 902) * 40, wd = 30 + rand(i + 903) * 30;
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position;
    for (let v = 0; v < p.count; v++) {
      const y = p.getY(v);
      const n = 1 + (rand(v * 7 + i) - 0.5) * 0.18;
      p.setXYZ(v, p.getX(v) * wd * n, Math.max(0, y) * h * n, p.getZ(v) * wd * 0.8 * n);
    }
    g.computeVertexNormals();
    g.translate(Math.cos(a) * r, -1, Math.sin(a) * r);
    const col = hillCol[i % hillCol.length];
    const cols = new Float32Array(p.count * 3);
    for (let v = 0; v < cols.length; v += 3) { cols[v] = col.r; cols[v + 1] = col.g; cols[v + 2] = col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    hillGeos.push(g);
  }
  scene.add(new THREE.Mesh(track(mergeGeometries(hillGeos, false)), clay('#ffffff', { vertexColors: true, flatShading: true })));
  hillGeos.forEach((g) => g.dispose());

  // 가로수: 둥근 클레이 나무를 모든 길가에(캠퍼스 앞 걸어 들어오는 보도는 비움)
  const trunkGeo = track(new THREE.CylinderGeometry(0.15, 0.22, 1.6, 7)); trunkGeo.translate(0, 0.8, 0);
  const crownGeo = track(new THREE.IcosahedronGeometry(1.1, 1)); crownGeo.translate(0, 2.4, 0);
  const spots = [];
  for (const pl of allRoads) {
    let acc = 0;
    for (let i = 0; i < pl.length - 1; i++) {
      const [ax, az] = pl[i], [bx, bz] = pl[i + 1];
      const l = Math.hypot(bx - ax, bz - az); if (!l) continue;
      const nx = -(bz - az) / l, nz = (bx - ax) / l;
      for (let s = (6 - acc % 6) % 6; s < l; s += 6) {
        const x = ax + (bx - ax) * s / l, z = az + (bz - az) * s / l;
        if (Math.hypot(x, z) > 150) continue;
        for (const sd of [-1, 1]) spots.push([x + nx * sd * (ROAD / 2 + 1.3), z + nz * sd * (ROAD / 2 + 1.3)]);
      }
      acc += l;
    }
  }
  const campusPad = offsetPoly(CAMPUS, 0.5);
  const keep = spots.filter(([x, z]) => !inPoly(campusPad, x + HX, z + HY)
    && !(z > HY - 1 && z < STREET_Z && Math.abs(x) < HX + 1)
    && roadDist(x, z) > ROAD / 2 + 0.8);
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

  // 캠퍼스 생울타리: 둘레를 따라 둥근 관목을 빽빽이(남쪽 큰길 쪽은 트여 있음)
  const hedgeLine = offsetPoly(CAMPUS, -HEDGE_IN);
  const bushes = [];
  let accH = 0;
  for (let i = 0; i < hedgeLine.length; i++) {
    const a = hedgeLine[i], b = hedgeLine[(i + 1) % hedgeLine.length];
    if (CAMPUS[i].y > NY - 0.4 && CAMPUS[(i + 1) % CAMPUS.length].y > NY - 0.4) continue;
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    for (let s = (0.7 - accH % 0.7) % 0.7; s < l; s += 0.7) bushes.push([a.x + (b.x - a.x) * s / l - HX, a.y + (b.y - a.y) * s / l - HY]);
    accH += l;
  }
  const bushGeo = track(new THREE.IcosahedronGeometry(0.55, 1)); bushGeo.scale(1, 0.85, 1); bushGeo.translate(0, 0.42, 0);
  const bushMesh = new THREE.InstancedMesh(bushGeo, clay('#5E8A4B'), bushes.length);
  const bushCol = ['#5E8A4B', '#6A9655', '#557F45'].map((c) => new THREE.Color(c));
  bushes.forEach(([x, z], i) => {
    const s = 0.85 + rand(i + 500) * 0.35;
    ps.set(x, 0, z); q4.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand(i + 501) * 6); sc.set(s, s * (0.9 + rand(i + 502) * 0.3), s); mtx.compose(ps, q4, sc);
    bushMesh.setMatrixAt(i, mtx); bushMesh.setColorAt(i, bushCol[i % 3]);
  });
  bushMesh.castShadow = true; bushMesh.receiveShadow = true; scene.add(bushMesh);

  // 셔틀 정류장(출발점 옆, 보도 끝 차도 쪽): 지붕, 벤치, 노선 표지판. 뒤판은 캠퍼스 쪽
  const stop = new THREE.Group();
  stop.position.set(X0 + 6.2, 0, HY + OUT_LEN - 0.9);
  stop.rotation.y = Math.PI / 2;
  stop.add(mesh(new THREE.BoxGeometry(1.6, 0.08, 2.4), toon('#2E3436'), { y: 2.3 }));
  for (const z of [-1.1, 1.1]) stop.add(mesh(new THREE.BoxGeometry(0.08, 2.3, 0.08), toon('#2E3436'), { x: 0.7, y: 1.15, z }));
  stop.add(mesh(new THREE.BoxGeometry(0.04, 1.6, 2.2), glass, { x: 0.72, y: 1.2, cast: false }));
  stop.add(mesh(new THREE.BoxGeometry(0.4, 0.06, 1.8), toon('#B98A5A'), { x: 0.4, y: 0.45 }));
  stop.add(mesh(new THREE.BoxGeometry(0.06, 0.7, 0.5), toon('#43706A'), { x: -0.5, y: 2.75, z: -1.0 }));
  scene.add(stop);
  return { update: (t) => updates.forEach((f) => f(t)) };
}
