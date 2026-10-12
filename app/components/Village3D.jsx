'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENTS, CAMPS } from '../data/agents';
import VillageCards from './VillageCards';
import {
  N, SPEED, TALK_R, DOOR_R, BUILDINGS, door, PIECES, DECOR, PONDS, STREAMS, STREAM_HALF, START, PLAZA, blocked, findPath,
} from '../data/villageMap';

// 융중 마을 3D: 구름 바다 위에 뜬 섬을 Three.js 로 그립니다.
// 땅·물·산·나무·깃발·구름은 입체로 만들고, 건물 디오라마와 인물 피규어는 카메라를 바라보는 판(스프라이트)으로 세웁니다.
// 카메라는 비스듬히 내려다보는 각도를 기본으로 하고, 끌어서 조금 돌리거나 휠·두 손가락으로 가까이 볼 수 있습니다.

const HALF = N / 2;
const toXZ = (x, y) => [x - HALF, y - HALF];          // 지도 칸 → 3D 좌표
const BASE_AZ = Math.PI / 4;                            // 기본 카메라 방위(지도 앞쪽에서)
const AZ_RANGE = 0.55;
const EL_MIN = 0.42, EL_MAX = 1.0, EL_DEFAULT = 0.62;
const DIST_MIN = 11, DIST_MAX = 40, DIST_DEFAULT = 27;
const BUILDING_SIZE = 5.6;
const FIGURE_H = 2.2;
const PLAYER_H = 1.95;

// 꼭짓점 좌표로 정하는 난수: 같은 자리의 꼭짓점은 같은 만큼 움직여 틈이 생기지 않습니다.
const hash3 = (x, y, z) => {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
};

const rand = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* ---------- 캔버스로 그리는 질감들 ---------- */
function groundCanvas() {
  const S = 2048, k = S / N;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#C8BA88';
  g.fillRect(0, 0, S, S);
  // 풀밭·흙 얼룩
  for (let i = 0; i < 70; i++) {
    const x = rand(i + 300) * S, y = rand(i + 400) * S, r = (1 + rand(i + 500) * 2.6) * k;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const green = rand(i + 600) > 0.35;
    grad.addColorStop(0, green ? 'rgba(128,150,92,.55)' : 'rgba(226,207,163,.7)');
    grad.addColorStop(1, green ? 'rgba(128,150,92,0)' : 'rgba(226,207,163,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // 풀 포기
  g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) {
    const x = rand(i + 900) * S, y = rand(i + 4000) * S;
    g.strokeStyle = rand(i + 7000) > 0.5 ? 'rgba(98,120,70,.45)' : 'rgba(120,138,84,.35)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x - 2, y - 7);
    g.moveTo(x + 2, y); g.lineTo(x + 3, y - 8);
    g.moveTo(x + 4, y); g.lineTo(x + 7, y - 6);
    g.stroke();
  }
  // 길: 광장에서 각 건물 입구까지
  const road = (w, color) => {
    g.strokeStyle = color; g.lineWidth = w * k;
    for (const b of BUILDINGS) {
      const d = door(b);
      g.beginPath(); g.moveTo(PLAZA.x * k, PLAZA.y * k); g.lineTo(d.x * k, d.y * k); g.stroke();
    }
  };
  road(1.05, 'rgba(160,136,96,.6)');
  road(0.82, '#E3D3AC');
  // 팔진도 광장
  const oct = (r) => {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      const x = (PLAZA.x + Math.cos(a) * r) * k, y = (PLAZA.y + Math.sin(a) * r) * k;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.closePath();
  };
  oct(2.6); g.fillStyle = '#E2D3AE'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#8E7651'; g.stroke();
  g.setLineDash([16, 12]); oct(2.15); g.lineWidth = 3; g.strokeStyle = '#A48C62'; g.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    g.beginPath();
    g.moveTo((PLAZA.x + Math.cos(a) * 0.9) * k, (PLAZA.y + Math.sin(a) * 0.9) * k);
    g.lineTo((PLAZA.x + Math.cos(a) * 2.15) * k, (PLAZA.y + Math.sin(a) * 2.15) * k);
    g.stroke();
  }
  g.setLineDash([]);
  oct(0.9); g.fillStyle = '#C5AE84'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#6E5A3A'; g.stroke();
  // 태극 문양
  const cx = PLAZA.x * k, cy = PLAZA.y * k, r = 0.5 * k;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = '#F2E8D2'; g.fill();
  g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2); g.arc(cx, cy + r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true);
  g.arc(cx, cy - r / 2, r / 2, Math.PI / 2, -Math.PI / 2); g.fillStyle = '#3B2F22'; g.fill();
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = '#3B2F22'; g.stroke();
  // 섬 가장자리 풀 테두리
  g.lineWidth = 10; g.strokeStyle = 'rgba(96,128,70,.75)'; g.strokeRect(5, 5, S - 10, S - 10);
  return c;
}

function cloudCanvas(seed) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    puffs.push([70 + t * 372 + (rand(seed + i) - 0.5) * 30, 150 - Math.sin(t * Math.PI) * (40 + rand(seed + i + 20) * 40), 42 + Math.sin(t * Math.PI) * 38 + rand(seed + i + 40) * 16]);
  }
  // 아랫단도 둥근 덩이로 받쳐서 밑변이 곧게 잘리지 않게
  for (let i = 0; i < 6; i++) puffs.push([110 + i * 58 + (rand(seed + i + 60) - 0.5) * 16, 178, 30 + rand(seed + i + 70) * 10]);
  // 외곽선(먹선)
  g.fillStyle = '#A2906F';
  puffs.forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill(); });
  // 몸통
  puffs.forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.2, x, y, r);
    gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#F1EBDD');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  });
  // 말린 획
  g.strokeStyle = '#A2906F'; g.lineWidth = 4; g.lineCap = 'round';
  [[140, 172], [300, 160], [390, 182]].forEach(([x, y]) => {
    g.beginPath(); g.arc(x, y, 14, Math.PI * 0.2, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.arc(x + 3, y + 2, 6, Math.PI, Math.PI * 2.6); g.stroke();
  });
  return c;
}

function bannerCanvas() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 200;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 128, 0);
  gr.addColorStop(0, '#9E3522'); gr.addColorStop(1, '#C24C31');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 0); g.lineTo(128, 170);
  for (let i = 0; i < 4; i++) { g.lineTo(128 - 32 * i - 16, 200); g.lineTo(128 - 32 * (i + 1), 170); }
  g.closePath(); g.fill();
  g.strokeStyle = '#E2B65A'; g.lineWidth = 6; g.strokeRect(10, 10, 108, 150);
  g.fillStyle = '#F6E8CF'; g.font = '700 84px Hahmlet, "Noto Serif KR", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('漢', 64, 88);
  return c;
}

function ridgeCanvas(seed, [r, g, b], alpha, height) {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  // 능선: 큰 봉우리 2~3개와 잔 봉우리
  const pts = [];
  const peaks = 2 + Math.floor(rand(seed) * 2);
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    let y = 0;
    for (let k = 0; k < peaks; k++) {
      const cx = (k + 0.5) / peaks + (rand(seed + k) - 0.5) * 0.2;
      const w = 0.09 + rand(seed + k + 9) * 0.1;
      y = Math.max(y, Math.exp(-((t - cx) ** 2) / (2 * w * w)) * (0.65 + rand(seed + k + 3) * 0.35));
    }
    y += Math.sin(t * 40 + seed) * 0.02 + Math.sin(t * 17 + seed * 2) * 0.03;
    const taper = Math.pow(Math.sin(Math.PI * t), 0.6); // 양 끝은 땅으로 내려앉게
    pts.push([t * W, H - (0.12 + y * height) * taper * H]);
  }
  const grad = x.createLinearGradient(0, H * (1 - height - 0.15), 0, H);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grad.addColorStop(0.55, `rgba(${r},${g},${b},${alpha * 0.55})`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grad;
  x.beginPath();
  x.moveTo(0, H);
  pts.forEach(([px, py]) => x.lineTo(px, py));
  x.lineTo(W, H);
  x.closePath();
  x.fill();
  // 준법(皴法) 느낌의 붓질
  x.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 70; i++) {
    const px = rand(seed + i * 3) * W, py = H * (0.35 + rand(seed + i * 5) * 0.5);
    x.strokeStyle = `rgba(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)},${0.12 + rand(i) * 0.15})`;
    x.lineWidth = 2 + rand(seed + i) * 4;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 10, py + 30, px - 6, py + 70); x.stroke();
  }
  // 좌우 가장자리는 서서히 사라지게
  x.globalCompositeOperation = 'destination-in';
  const fade = x.createLinearGradient(0, 0, W, 0);
  fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(0.15, 'rgba(0,0,0,1)');
  fade.addColorStop(0.85, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = fade; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}

function radialCanvas(inner, outer, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return c;
}

function petalCanvas() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.translate(32, 32); g.rotate(0.6);
  g.fillStyle = '#F4B8B8';
  g.beginPath(); g.ellipse(0, 0, 14, 24, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FBE1DD';
  g.beginPath(); g.ellipse(-3, -4, 6, 12, 0, 0, Math.PI * 2); g.fill();
  return c;
}

function skyCanvas() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 512;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#E6DDC8'); gr.addColorStop(0.55, '#F3EBD9'); gr.addColorStop(1, '#EADFC6');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
  return c;
}

/* ---------- 3D 장면 만들기 ---------- */
function buildScene(THREE, renderer, onReady) {
  const scene = new THREE.Scene();
  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };
  const canvasTex = (cv, srgb = true) => {
    const t = track(new THREE.CanvasTexture(cv));
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  };

  scene.background = canvasTex(skyCanvas());
  scene.fog = new THREE.Fog(0xEEE5CF, 34, 100);

  // 빛
  scene.add(new THREE.HemisphereLight(0xFFF6E5, 0x6F6347, 1.15));
  const sun = new THREE.DirectionalLight(0xFFE6C0, 2.1);
  sun.position.set(-12, 30, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 });
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const manager = new THREE.LoadingManager();
  manager.onLoad = onReady;
  const loader = new THREE.TextureLoader(manager);
  const loadTex = (url) => {
    const t = track(loader.load(url));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  };

  // 그리는 순서가 중요합니다.
  // 1) 땅 아래의 것(구름 바다·섬 뿌리·산)을 먼저 그리고
  // 2) 땅을 깊이 기록 없이 덮어 땅 아래가 비치지 않게 한 뒤
  // 3) 바닥에 세운 판(건물·인물)을 마지막에 그려 판의 아랫부분이 땅에 잘리지 않게 합니다.
  // 판과 땅은 모두 '투명' 목록에 넣어 renderOrder 로 순서를 고정합니다.
  const groundGeo = track(new THREE.PlaneGeometry(N, N));
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, track(new THREE.MeshStandardMaterial({ map: canvasTex(groundCanvas()), roughness: 1 })));
  ground.receiveShadow = true;
  ground.renderOrder = -10;
  ground.material.depthWrite = false;
  ground.material.transparent = true;
  scene.add(ground);

  // 섬의 흙벽과 아래로 늘어진 바위 뿌리
  const soilMat = track(new THREE.MeshStandardMaterial({ color: 0x7A5A38, roughness: 1, flatShading: true }));
  const wall = (w, rotY, px, pz) => {
    const geo = track(new THREE.PlaneGeometry(w, 2.4, 24, 3));
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) < 1.1) p.setZ(i, (rand(i + rotY * 10) - 0.5) * 0.35);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, soilMat);
    m.position.set(px, -1.2, pz); m.rotation.y = rotY;
    scene.add(m);
  };
  wall(N, 0, 0, HALF); wall(N, Math.PI / 2, HALF, 0); wall(N, Math.PI, 0, -HALF); wall(N, -Math.PI / 2, -HALF, 0);
  const rootGeo = track(new THREE.ConeGeometry(HALF * 0.98, 12, 8, 6));
  rootGeo.rotateX(Math.PI); rootGeo.rotateY(Math.PI / 8);
  {
    const p = rootGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y < 5.9) { p.setX(i, p.getX(i) * (0.85 + rand(i) * 0.3)); p.setZ(i, p.getZ(i) * (0.85 + rand(i + 7) * 0.3)); }
    }
    rootGeo.computeVertexNormals();
  }
  const root = new THREE.Mesh(rootGeo, track(new THREE.MeshStandardMaterial({ color: 0x5E4630, roughness: 1, flatShading: true })));
  root.position.y = -8.4;
  scene.add(root);

  // 물: 연못과 개울. 반짝이는 물결선을 셰이더로 그립니다.
  const waterUniforms = { uTime: { value: 0 } };
  const waterMat = track(new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uTime; varying vec3 vW;
      void main(){
        vec3 deep = vec3(0.44,0.62,0.60); vec3 light = vec3(0.86,0.94,0.91);
        float w = sin(vW.x*3.1 + uTime*1.3) * sin(vW.z*2.7 - uTime*1.1);
        float line = smoothstep(0.78, 0.95, w);
        gl_FragColor = vec4(mix(deep, light, line*0.85), 0.93);
      }`,
  }));
  const bankMat = track(new THREE.MeshBasicMaterial({ color: 0x5F7D61, depthWrite: false, transparent: true }));
  const flat = (geo, mat, y, order) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y; m.renderOrder = order;
    scene.add(m);
    return m;
  };
  for (const [[cx, cy], r] of PONDS) {
    const [X, Z] = toXZ(cx, cy);
    for (const [rr, mat, y, o] of [[r + 0.22, bankMat, 0.02, -9], [r, waterMat, 0.03, -8]]) {
      const geo = track(new THREE.CircleGeometry(rr, 48)); geo.rotateX(-Math.PI / 2);
      flat(geo, mat, y, o).position.set(X, y, Z);
    }
  }
  for (const s of STREAMS) {
    for (let i = 0; i < s.length - 1; i++) {
      const [ax, az] = toXZ(...s[i]), [bx, bz] = toXZ(...s[i + 1]);
      const len = Math.hypot(bx - ax, bz - az);
      for (const [hw, mat, y, o] of [[STREAM_HALF + 0.22, bankMat, 0.02, -9], [STREAM_HALF, waterMat, 0.03, -8]]) {
        const geo = track(new THREE.PlaneGeometry(len, hw * 2)); geo.rotateX(-Math.PI / 2);
        const m = flat(geo, mat, y, o);
        m.position.set((ax + bx) / 2, y, (az + bz) / 2);
        m.rotation.y = -Math.atan2(bz - az, bx - ax);
        const cap = track(new THREE.CircleGeometry(hw, 24)); cap.rotateX(-Math.PI / 2);
        flat(cap, mat, y, o).position.set(bx, y, bz);
      }
    }
  }

  // 먹빛 산: 산수화처럼 붓으로 그린 능선 세 겹을 섬 뒤에 세웁니다(가까울수록 짙게).
  const layers = [
    { dist: 46, color: [52, 64, 57], alpha: 0.9, count: 7, h: 0.5 },
    { dist: 66, color: [96, 108, 98], alpha: 0.75, count: 8, h: 0.62 },
    { dist: 92, color: [146, 154, 143], alpha: 0.6, count: 9, h: 0.75 },
  ];
  layers.forEach((L, li) => {
    for (let i = 0; i < L.count; i++) {
      const tex = canvasTex(ridgeCanvas(li * 40 + i, L.color, L.alpha, L.h));
      const m = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false })));
      const a = BASE_AZ + Math.PI + ((i + 0.5) / L.count - 0.5) * 2.7;
      const w = L.dist * 0.95;
      m.scale.set(w, w * 0.5, 1);
      m.center.set(0.5, 0);
      m.position.set(Math.cos(a) * L.dist, -9, Math.sin(a) * L.dist);
      m.renderOrder = -40 + li * -1;
      scene.add(m);
    }
  });

  // 붉은 해
  const sunSprite = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: canvasTex(radialCanvas('rgba(214,96,70,.9)', 'rgba(214,96,70,0)')), fog: false, depthWrite: false })));
  sunSprite.scale.set(26, 26, 1);
  sunSprite.position.set(Math.cos(BASE_AZ + Math.PI + 0.45) * 110, 34, Math.sin(BASE_AZ + Math.PI + 0.45) * 110);
  sunSprite.renderOrder = -20;
  scene.add(sunSprite);

  // 구름: 섬을 받치는 구름 바다 + 머리 위를 흘러가는 구름
  const cloudTex = [0, 1, 2].map((s) => canvasTex(cloudCanvas(s * 50)));
  const cloudMats = cloudTex.map((t) => track(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: true, toneMapped: false })));
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2 + rand(i) * 0.3;
    const rr = HALF * (0.9 + rand(i + 5) * 0.75);
    const s = new THREE.Sprite(cloudMats[i % 3]);
    const w = 7 + rand(i + 9) * 6;
    s.scale.set(w, w / 2, 1);
    s.position.set(Math.cos(a) * rr * 1.3, -4 - rand(i + 13) * 3, Math.sin(a) * rr * 1.3);
    s.renderOrder = -20;
    scene.add(s);
  }
  const drift = [];
  const driftMats = cloudTex.map((t) => track(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0.38, depthWrite: false, toneMapped: false })));
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(driftMats[i % 3]);
    const w = 10 + rand(i + 70) * 8;
    s.scale.set(w, w / 2, 1);
    s.position.set(-40 + rand(i + 71) * 80, 17 + rand(i + 72) * 8, -30 + rand(i + 73) * 30);
    s.userData.speed = 0.5 + rand(i + 74) * 0.6;
    scene.add(s);
    drift.push(s);
  }

  // 소나무·대나무·괴석·깃발
  const pineTrunk = track(new THREE.MeshStandardMaterial({ color: 0x5A3F26, roughness: 1, flatShading: true }));
  const pineLeaf = [0x46664E, 0x56755A, 0x3C5946].map((c) => track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true })));
  const bambooMat = track(new THREE.MeshStandardMaterial({ color: 0x77985A, roughness: 0.8 }));
  const bambooLeaf = track(new THREE.MeshStandardMaterial({ color: 0x4E7240, roughness: 0.8, side: THREE.DoubleSide, flatShading: true }));
  const rockMat = track(new THREE.MeshStandardMaterial({ color: 0xA7A393, roughness: 0.95, flatShading: true }));
  const poleMat = track(new THREE.MeshStandardMaterial({ color: 0x4A3524, roughness: 0.9 }));
  const bannerTex = canvasTex(bannerCanvas());
  const tierGeo = track(new THREE.SphereGeometry(1, 9, 6));
  const trunkGeo = track(new THREE.CylinderGeometry(0.09, 0.15, 1.6, 6));
  const stalkGeo = track(new THREE.CylinderGeometry(0.045, 0.05, 1, 6));
  const leafGeo = track(new THREE.PlaneGeometry(0.5, 0.075));
  leafGeo.translate(0.25, 0, 0);
  const sway = [];
  const flags = [];
  DECOR.forEach(([type, x, y], i) => {
    const [X, Z] = toXZ(x, y);
    const g = new THREE.Group();
    g.position.set(X, 0, Z);
    if (type === 'pine') {
      const trunk = new THREE.Mesh(trunkGeo, pineTrunk);
      trunk.position.y = 0.8; trunk.rotation.z = (rand(i) - 0.5) * 0.25; trunk.castShadow = true;
      g.add(trunk);
      for (let t = 0; t < 4; t++) {
        const m = new THREE.Mesh(tierGeo, pineLeaf[(t + i) % 3]);
        const s = 0.95 - t * 0.17 + rand(i * 7 + t) * 0.15;
        m.scale.set(s, 0.22, s * (0.8 + rand(i + t) * 0.3));
        m.position.set((rand(i * 3 + t) - 0.5) * 0.5, 1.15 + t * 0.42, (rand(i * 5 + t) - 0.5) * 0.5);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      }
      g.scale.setScalar(0.72 + rand(i + 2) * 0.22);
    } else if (type === 'bamboo') {
      for (let k = 0; k < 6; k++) {
        const h = 2.4 + rand(i * 9 + k) * 1.4;
        const st = new THREE.Mesh(stalkGeo, bambooMat);
        st.scale.y = h; st.position.set((rand(i + k) - 0.5) * 0.7, h / 2, (rand(i + k + 30) - 0.5) * 0.7);
        st.castShadow = true;
        g.add(st);
        // 잎은 마디에서 비스듬히 늘어지게
        for (let l = 0; l < 7; l++) {
          const lf = new THREE.Mesh(leafGeo, bambooLeaf);
          lf.position.set(st.position.x, h - 0.15 - Math.floor(l / 2) * 0.38, st.position.z);
          lf.rotation.order = 'YZX';
          lf.rotation.set((rand(k * 5 + l) - 0.5) * 0.8, rand(i * 3 + l + k) * Math.PI * 2, -0.75 - rand(l + k) * 0.45);
          g.add(lf);
        }
      }
      sway.push(g);
    } else if (type === 'rock') {
      const geo = track(new THREE.DodecahedronGeometry(0.5, 1));
      const p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const x0 = p.getX(v), y0 = p.getY(v), z0 = p.getZ(v);
        const j = 0.8 + hash3(x0 + i, y0, z0) * 0.4;
        p.setXYZ(v, x0 * j, y0 * (0.9 + hash3(y0, z0 + i, x0) * 0.2), z0 * j);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, rockMat);
      m.scale.set(0.8, 1.7, 0.7); m.position.y = 0.78; m.rotation.y = rand(i) * 3;
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    } else if (type === 'flag') {
      const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.06, 3.6, 6)), poleMat);
      pole.position.y = 1.8; pole.castShadow = true;
      g.add(pole);
      const geo = track(new THREE.PlaneGeometry(1, 1.55, 10, 4));
      geo.translate(0.5, 0, 0);
      const banner = new THREE.Mesh(geo, track(new THREE.MeshStandardMaterial({ map: bannerTex, side: THREE.DoubleSide, transparent: true, alphaTest: 0.4 })));
      banner.position.set(0.05, 2.7, 0); banner.castShadow = true;
      g.add(banner);
      g.rotation.y = BASE_AZ;
      g.scale.setScalar(0.72);
      flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), phase: i });
    }
    scene.add(g);
  });

  // 봉화대 불빛과 불티
  const beacon = BUILDINGS.find((b) => b.key === 'beacon');
  const [BX, BZ] = toXZ(beacon.x, beacon.y);
  const fire = new THREE.PointLight(0xFF8A3D, 6, 10, 1.6);
  fire.position.set(BX, 4.2, BZ);
  scene.add(fire);
  const emberCount = 40;
  const emberGeo = track(new THREE.BufferGeometry());
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) { emberPos[i * 3] = BX; emberPos[i * 3 + 1] = 4 + rand(i) * 3; emberPos[i * 3 + 2] = BZ; }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(emberGeo, track(new THREE.PointsMaterial({ color: 0xFFB45A, size: 0.12, transparent: true, opacity: 0.9, depthWrite: false })));
  scene.add(embers);

  // 흩날리는 복숭아꽃 잎(도원결의)
  const petalCount = 170;
  const petalGeo = track(new THREE.BufferGeometry());
  const petalPos = new Float32Array(petalCount * 3);
  for (let i = 0; i < petalCount; i++) {
    petalPos[i * 3] = (rand(i + 1) - 0.5) * N * 1.2;
    petalPos[i * 3 + 1] = rand(i + 2) * 12;
    petalPos[i * 3 + 2] = (rand(i + 3) - 0.5) * N * 1.2;
  }
  petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
  const petals = new THREE.Points(petalGeo, track(new THREE.PointsMaterial({ map: canvasTex(petalCanvas()), size: 0.32, transparent: true, depthWrite: false, alphaTest: 0.2 })));
  scene.add(petals);

  // 그림자 원판(인물·방문자 발밑)
  const blobMat = track(new THREE.MeshBasicMaterial({ map: canvasTex(radialCanvas('rgba(40,26,10,.45)', 'rgba(40,26,10,0)')), transparent: true, depthWrite: false }));
  const blobGeo = track(new THREE.PlaneGeometry(1.5, 1.5));
  blobGeo.rotateX(-Math.PI / 2);
  const blob = (X, Z, s = 1) => {
    const m = new THREE.Mesh(blobGeo, blobMat);
    m.position.set(X, 0.04, Z); m.scale.setScalar(s); m.renderOrder = -7;
    scene.add(m);
    return m;
  };

  // 건물 디오라마(판)
  const pickables = [];
  const buildingSprites = BUILDINGS.map((b) => {
    const [X, Z] = toXZ(b.x, b.y);
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: loadTex(`/village/${b.key}.png`), alphaTest: 0.5, transparent: true, toneMapped: false })));
    s.center.set(0.5, 0.41);
    s.scale.set(BUILDING_SIZE, BUILDING_SIZE, 1);
    s.position.set(X, 0, Z);
    s.userData = { kind: 'place', id: b.key };
    s.renderOrder = 1;
    scene.add(s);
    pickables.push(s);
    return s;
  });

  // 장수 피규어(판)
  const agentSprites = PIECES.map((p) => {
    const [X, Z] = toXZ(p.x, p.y);
    const tex = loadTex(`/agents/${p.id}.png`);
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, alphaTest: 0.5, transparent: true, toneMapped: false })));
    s.center.set(0.5, 0.02);
    s.position.set(X, 0, Z);
    s.userData = { kind: 'agent', id: p.id, tex };
    s.renderOrder = 1;
    blob(X, Z, 0.9);
    scene.add(s);
    pickables.push(s);
    return s;
  });

  // 방문자
  const playerTex = loadTex('/village/visitor.png');
  playerTex.wrapS = THREE.RepeatWrapping;
  const player = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: playerTex, alphaTest: 0.5, transparent: true, toneMapped: false })));
  player.center.set(0.5, 0.02);
  player.renderOrder = 1;
  scene.add(player);
  const playerBlob = blob(0, 0, 0.85);

  const fitSprites = () => {
    for (const s of agentSprites) {
      const img = s.userData.tex.image;
      if (img && img.width) s.scale.set((FIGURE_H * img.width) / img.height, FIGURE_H, 1);
    }
    const img = playerTex.image;
    if (img && img.width) player.scale.set((PLAYER_H * img.width) / img.height, PLAYER_H, 1);
  };

  const update = (t, dt) => {
    waterUniforms.uTime.value = t;
    for (const s of drift) {
      s.position.x += s.userData.speed * dt;
      if (s.position.x > 45) s.position.x = -45;
    }
    for (let i = 0; i < sway.length; i++) sway[i].rotation.z = Math.sin(t * 0.9 + i) * 0.035;
    for (const f of flags) {
      const p = f.geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const bx = f.base[v * 3];
        p.setZ(v, Math.sin(bx * 3.2 - t * 3.4 + f.phase) * 0.14 * bx);
      }
      p.needsUpdate = true;
    }
    fire.intensity = 5 + Math.sin(t * 13) * 0.8 + Math.sin(t * 7.3) * 0.6;
    const ep = emberGeo.attributes.position;
    for (let i = 0; i < emberCount; i++) {
      let y = ep.getY(i) + dt * (0.8 + rand(i) * 0.9);
      let x = ep.getX(i) + Math.sin(t * 2 + i) * dt * 0.25;
      let z = ep.getZ(i) + Math.cos(t * 1.7 + i) * dt * 0.25;
      if (y > 8) { y = 4; x = BX + (rand(i + t) - 0.5) * 0.5; z = BZ + (rand(i + t + 1) - 0.5) * 0.5; }
      ep.setXYZ(i, x, y, z);
    }
    ep.needsUpdate = true;
    const pp = petalGeo.attributes.position;
    for (let i = 0; i < petalCount; i++) {
      let y = pp.getY(i) - dt * (0.35 + rand(i + 9) * 0.35);
      let x = pp.getX(i) + dt * (0.45 + Math.sin(t * 0.7 + i) * 0.35);
      const z = pp.getZ(i) + Math.cos(t * 0.5 + i * 1.3) * dt * 0.3;
      if (y < 0.05) { y = 10 + rand(i + t) * 3; x = (rand(i + t * 3) - 0.5) * N * 1.2 - 4; }
      pp.setXYZ(i, x, y, z);
    }
    pp.needsUpdate = true;
  };

  const dispose = () => {
    for (const d of disposables) d.dispose?.();
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose?.(); });
  };

  return { scene, player, playerBlob, playerTex, pickables, buildingSprites, agentSprites, fitSprites, update, dispose };
}

export default function Village3D({ onSwitch, onFail }) {
  const stageRef = useRef(null);
  const canvasHostRef = useRef(null);
  const labelRefs = useRef({});
  const bubbleRef = useRef(null);
  const ctl = useRef(null);
  const pos = useRef({ ...START });
  const keys = useRef(new Set());
  const target = useRef(null);
  const activeRef = useRef(false);
  const [near, setNear] = useState(null);
  const [open, setOpen] = useState(null);
  const [hint, setHint] = useState(true);
  const [ready, setReady] = useState(false);
  const openRef = useRef(null);
  openRef.current = open;
  const nearRef = useRef(null);
  nearRef.current = near;

  const interact = useCallback((n) => {
    const t = n || nearRef.current;
    if (t) { setOpen(t); keys.current.clear(); target.current = null; }
  }, []);

  const walkTo = useCallback((pt) => { target.current = findPath(pos.current, pt); setHint(false); setOpen(null); }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      let THREE;
      try { THREE = await import('three'); } catch { onFail?.(); return; }
      if (disposed) return;
      const host = canvasHostRef.current, stage = stageRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      } catch { onFail?.(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      host.appendChild(renderer.domElement);

      const cam = new THREE.PerspectiveCamera(32, 1, 0.5, 400);
      const view = { az: BASE_AZ, el: EL_DEFAULT, dist: DIST_DEFAULT, intro: 0 };
      const camTarget = new THREE.Vector3(...[toXZ(START.x, START.y)[0], 0.8, toXZ(START.x, START.y)[1]]);
      let introStart = 0;

      const world = buildScene(THREE, renderer, () => {
        world.fitSprites();
        introStart = performance.now();
        setReady(true);
      });

      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; activeRef.current = e.intersectionRatio > 0.6; }, { threshold: [0, 0.6, 1] });
      io.observe(stage);

      const tmp = new THREE.Vector3();
      const project = (x, y, z) => {
        tmp.set(x, y, z).project(cam);
        return { x: (tmp.x + 1) / 2 * host.clientWidth, y: (1 - tmp.y) / 2 * host.clientHeight, hidden: tmp.z > 1 };
      };
      const placeLabel = (el, p) => {
        if (!el) return;
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        el.style.visibility = p.hidden ? 'hidden' : 'visible';
      };

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pickAt = (clientX, clientY) => {
        const r = host.getBoundingClientRect();
        ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, cam);
        const agentsFirst = raycaster.intersectObjects(world.agentSprites, false);
        if (agentsFirst.length) return agentsFirst[0].object.userData;
        const bHit = raycaster.intersectObjects(world.buildingSprites, false);
        if (bHit.length) return bHit[0].object.userData;
        const hit = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(groundPlane, hit)) return { kind: 'ground', x: hit.x + HALF, y: hit.z + HALF };
        return null;
      };

      // 끌어서 돌리기·눌러서 걷기·휠로 확대
      let drag = null;
      const pointers = new Map();
      const onDown = (e) => {
        if (e.target.closest('button, a')) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el, moved: false, pinch: pointers.size === 2 ? null : undefined };
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          drag.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: view.dist };
        }
        view.intro = 1;
      };
      const onMove = (e) => {
        if (!drag || !pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2 && drag.pinch) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          view.dist = THREE.MathUtils.clamp(drag.pinch.dist * (drag.pinch.d / d), DIST_MIN, DIST_MAX);
          drag.moved = true;
          return;
        }
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 6) drag.moved = true;
        if (drag.moved) {
          view.az = THREE.MathUtils.clamp(drag.az - dx * 0.004, BASE_AZ - AZ_RANGE, BASE_AZ + AZ_RANGE);
          view.el = THREE.MathUtils.clamp(drag.el + dy * 0.003, EL_MIN, EL_MAX);
        }
      };
      const onUp = (e) => {
        const wasDrag = drag && drag.moved;
        pointers.delete(e.pointerId);
        if (pointers.size) return;
        drag = null;
        if (wasDrag || e.target.closest('button, a')) return;
        const hit = pickAt(e.clientX, e.clientY);
        if (!hit) return;
        setHint(false);
        if (hit.kind === 'agent') { interact({ kind: 'agent', id: hit.id }); return; }
        if (hit.kind === 'place') { target.current = findPath(pos.current, door(BUILDINGS.find((b) => b.key === hit.id))); return; }
        if (hit.kind === 'ground') {
          target.current = findPath(pos.current, { x: THREE.MathUtils.clamp(hit.x, 1, N - 1), y: THREE.MathUtils.clamp(hit.y, 1, N - 1) });
        }
      };
      const onWheel = (e) => {
        if (!activeRef.current) return;
        e.preventDefault();
        view.dist = THREE.MathUtils.clamp(view.dist * (1 + Math.sign(e.deltaY) * 0.08), DIST_MIN, DIST_MAX);
        view.intro = 1;
      };
      stage.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      stage.addEventListener('wheel', onWheel, { passive: false });

      const keyMap = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
      const kd = (e) => {
        if (e.key === 'Escape') { setOpen(null); return; }
        if (!activeRef.current || openRef.current) return;
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (keyMap[e.code]) { keys.current.add(keyMap[e.code]); setHint(false); view.intro = 1; e.preventDefault(); }
        else if ((e.code === 'Space' || e.code === 'Enter') && nearRef.current && tag !== 'BUTTON' && tag !== 'A') { e.preventDefault(); interact(); }
      };
      const ku = (e) => { if (keyMap[e.code]) keys.current.delete(keyMap[e.code]); };
      const blur = () => keys.current.clear();
      window.addEventListener('keydown', kd);
      window.addEventListener('keyup', ku);
      window.addEventListener('blur', blur);

      let raf = 0, last = performance.now(), facing = 1;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible || document.hidden) return;

        // 카메라 기준 방향으로 이동
        const up = { x: -Math.cos(view.az), y: -Math.sin(view.az) };
        const right = { x: -up.y, y: up.x };
        let dx = 0, dy = 0;
        const k = keys.current;
        if (!openRef.current) {
          if (k.has('up'))    { dx += up.x; dy += up.y; }
          if (k.has('down'))  { dx -= up.x; dy -= up.y; }
          if (k.has('right')) { dx += right.x; dy += right.y; }
          if (k.has('left'))  { dx -= right.x; dy -= right.y; }
          if (dx || dy) target.current = null;
          else if (target.current) {
            const wp = target.current[0];
            const tx = wp.x - pos.current.x, ty = wp.y - pos.current.y;
            const d = Math.hypot(tx, ty);
            if (d < 0.12) { target.current.shift(); if (!target.current.length) target.current = null; }
            else { dx = tx / d; dy = ty / d; }
          }
        }
        const len = Math.hypot(dx, dy);
        const moving = len > 0;
        if (moving) {
          const s = (SPEED * dt) / len;
          const nx = pos.current.x + dx * s, ny = pos.current.y + dy * s;
          if (!blocked(nx, ny)) { pos.current.x = nx; pos.current.y = ny; }
          else if (!blocked(nx, pos.current.y)) pos.current.x = nx;
          else if (!blocked(pos.current.x, ny)) pos.current.y = ny;
          else target.current = null;
          const side = dx * right.x + dy * right.y;
          if (Math.abs(side) > 0.05) facing = side < 0 ? -1 : 1;
        }
        const [PX, PZ] = toXZ(pos.current.x, pos.current.y);
        const bob = moving ? Math.abs(Math.sin(now / 95)) * 0.08 : 0;
        world.player.position.set(PX, bob, PZ);
        world.playerBlob.position.set(PX, 0.04, PZ);
        world.playerTex.repeat.x = facing;
        world.playerTex.offset.x = facing < 0 ? 1 : 0;

        // 카메라: 처음에는 하늘에서 구름을 뚫고 내려옵니다.
        camTarget.lerp(tmp.set(PX, 0.8, PZ), 1 - Math.pow(0.002, dt));
        let el = view.el, dist = view.dist;
        if (introStart && view.intro < 1) {
          view.intro = Math.min(1, (now - introStart) / 4200);
          const t = ease(view.intro);
          el = THREE.MathUtils.lerp(1.32, view.el, t);
          dist = THREE.MathUtils.lerp(92, view.dist, t);
        } else if (!introStart) { el = 1.32; dist = 92; }
        // 세로로 긴 화면에서는 조금 더 물러서서 마을이 보이게
        if (cam.aspect < 1) dist *= Math.min(1.6, 0.75 / cam.aspect);
        cam.position.set(
          camTarget.x + dist * Math.cos(el) * Math.cos(view.az),
          camTarget.y + dist * Math.sin(el),
          camTarget.z + dist * Math.cos(el) * Math.sin(view.az),
        );
        cam.lookAt(camTarget);

        world.update(now / 1000, dt);
        renderer.render(world.scene, cam);

        // 이름표·간판·말풍선 위치
        for (const p of PIECES) {
          const [X, Z] = toXZ(p.x, p.y);
          placeLabel(labelRefs.current[`a-${p.id}`], project(X, -0.05, Z));
        }
        for (const b of BUILDINGS) {
          const [X, Z] = toXZ(b.x, b.y);
          placeLabel(labelRefs.current[`b-${b.key}`], project(X, BUILDING_SIZE * 0.62, Z));
        }
        const cur = nearRef.current;
        if (cur?.kind === 'agent' && bubbleRef.current) {
          const p = PIECES.find((q) => q.id === cur.id);
          const [X, Z] = toXZ(p.x, p.y);
          placeLabel(bubbleRef.current, project(X, FIGURE_H + 0.25, Z));
        }

        // 가까운 대상
        let found = null, best = Infinity;
        for (const p of PIECES) {
          const d = Math.hypot(pos.current.x - p.x, pos.current.y - p.y);
          if (d < TALK_R && d < best) { best = d; found = { kind: 'agent', id: p.id }; }
        }
        for (const b of BUILDINGS) {
          const dr = door(b);
          const d = Math.hypot(pos.current.x - dr.x, pos.current.y - dr.y);
          if (d < DOOR_R && d < best) { best = d; found = { kind: 'place', id: b.key }; }
        }
        if ((cur?.id || null) !== (found?.id || null)) setNear(found);
      };
      raf = requestAnimationFrame(loop);

      ctl.current = { view };
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect();
        stage.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        stage.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', kd);
        window.removeEventListener('keyup', ku);
        window.removeEventListener('blur', blur);
        world.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, [interact, onFail]);

  const nearLabel = near
    ? near.kind === 'agent'
      ? `${AGENTS[near.id].emoji} ${AGENTS[near.id].name}에게 말 걸기`
      : `${CAMPS.find((c) => c.key === near.id).place} 들어가기`
    : null;

  return (
    <section className="yv yv3" aria-label="융중 마을 — 3D로 걸어서 둘러보는 포트폴리오">
      <div className="yv-stage yv3-stage" ref={stageRef}>
        <div className="yv3-canvas" ref={canvasHostRef} />

        <div className="yv3-labels" aria-hidden="true">
          {BUILDINGS.map((b) => {
            const c = CAMPS.find((x) => x.key === b.key);
            return (
              <div key={b.key} className="yv3-pin" ref={(el) => { labelRefs.current[`b-${b.key}`] = el; }}>
                <span className="yv3-sign">{c.no} {c.place}</span>
              </div>
            );
          })}
          {PIECES.map((p) => (
            <div key={p.id} className="yv3-pin" ref={(el) => { labelRefs.current[`a-${p.id}`] = el; }}>
              <span className="yv3-name">{AGENTS[p.id].emoji} {AGENTS[p.id].name}</span>
            </div>
          ))}
          {near?.kind === 'agent' && (
            <div className="yv3-pin" ref={bubbleRef}>
              <div className="yv3-bubble">{AGENTS[near.id].greet}</div>
            </div>
          )}
        </div>

        {!ready && (
          <div className="yv3-loading">
            <b>융중으로 들어가는 중…</b>
            <span>구름 위의 마을을 불러오고 있습니다</span>
          </div>
        )}

        {ready && hint && (
          <div className="yv-hint">
            <b>융중 마을에 오신 것을 환영합니다</b>
            <span className="yv-hint-desk">방향키·WASD로 걷고, 끌어서 둘러보고, 휠로 가까이. 장수나 건물 앞에서 Space</span>
            <span className="yv-hint-touch">바닥을 누르면 걸어가고, 끌면 둘러봅니다</span>
          </div>
        )}

        {nearLabel && !open && (
          <button type="button" className="yv-act" onClick={() => interact()}>
            {nearLabel} <kbd>Space</kbd>
          </button>
        )}

        <nav className="yv-hud" aria-label="마을 빠른 이동">
          {CAMPS.map((c) => {
            const b = BUILDINGS.find((x) => x.key === c.key);
            return (
              <button type="button" key={c.key} onClick={() => walkTo(door(b))} title={`${c.place}(으)로 걸어가기`}>
                <b>{c.no}</b>{c.place}
              </button>
            );
          })}
          {onSwitch && <button type="button" className="yv-mode" onClick={onSwitch}>가볍게 보기</button>}
          <a className="yv-skip" href="#overview">목록으로 보기 ↓</a>
        </nav>
      </div>

      <VillageCards open={open} setOpen={setOpen} />
    </section>
  );
}
