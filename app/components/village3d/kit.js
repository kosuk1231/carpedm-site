// 융중 마을 3D 공용 도구: 툰 재질, 처마가 들린 기와지붕, 캔버스 질감, 난수.
// 모든 함수는 동적으로 불러온 THREE 를 인자로 받습니다(서버 렌더링 시 three 를 불러오지 않기 위해).

export const rand = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// 꼭짓점 좌표로 정하는 난수: 같은 자리의 꼭짓점은 같은 만큼 움직여 틈이 생기지 않습니다.
export const hash3 = (x, y, z) => {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
};

export function createKit(THREE, renderer) {
  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  // 세 단계 음영(툰)
  const ramp = new THREE.DataTexture(new Uint8Array([105, 105, 105, 255, 178, 178, 178, 255, 255, 255, 255, 255]), 3, 1);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.generateMipmaps = false;
  ramp.needsUpdate = true;
  track(ramp);

  const cache = new Map();
  const toon = (color, opts = {}) => {
    const em = opts.emissive?.isColor ? opts.emissive.getHexString() : (opts.emissive || '');
    const key = `${color}|${em}|${opts.emissiveIntensity ?? ''}|${opts.side || ''}|${opts.map ? opts.map.uuid : ''}`;
    if (!cache.has(key)) {
      // 카드 그림(클레이 피규어)과 같은 톤: 부드러운 무광 재질
      cache.set(key, track(new THREE.MeshStandardMaterial({
        color, roughness: 0.82, metalness: 0,
        emissive: opts.emissive || 0x000000,
        emissiveIntensity: opts.emissiveIntensity ?? 1,
        side: opts.side ?? THREE.FrontSide,
        map: opts.map || null,
      })));
    }
    return cache.get(key);
  };

  const canvasTex = (cv, { srgb = true, repeat } = {}) => {
    const t = track(new THREE.CanvasTexture(cv));
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  };

  // 메시 한 개를 만들어 그림자 설정까지
  const mesh = (geo, mat, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s, cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(track(geo), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    if (s !== undefined) { if (Array.isArray(s)) m.scale.set(...s); else m.scale.setScalar(s); }
    m.castShadow = cast;
    m.receiveShadow = receive;
    return m;
  };

  // 기와 줄무늬
  const tileTex = (base, line) => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, 64, 64);
    g.fillStyle = line;
    for (let i = 0; i < 4; i++) g.fillRect(i * 16, 0, 4, 64);
    g.fillStyle = 'rgba(0,0,0,.12)';
    g.fillRect(0, 60, 64, 4);
    return canvasTex(c, { repeat: true });
  };

  // 처마 끝이 하늘로 들린 우진각 지붕. 반폭 W×D(처마 포함), 높이 h, 용마루 반길이 rw, 처마 들림 curl.
  const curvedRoof = (W, D, h, rw, curl, mat) => {
    const nu = 14, nv = 7;
    const group = new THREE.Group();
    const faces = [
      (u) => [[u * W, 0, D], [u * rw, h, 0]],
      (u) => [[-u * W, 0, -D], [-u * rw, h, 0]],
      (u) => [[W, 0, -u * D], [rw, h, 0]],
      (u) => [[-W, 0, u * D], [-rw, h, 0]],
    ];
    faces.forEach((f, fi) => {
      const pos = [], uv = [], idx = [];
      const along = fi < 2 ? W * 2 : D * 2;
      for (let j = 0; j <= nv; j++) {
        const v = j / nv;
        for (let i = 0; i <= nu; i++) {
          const u = (i / nu) * 2 - 1;
          const [e, r] = f(u);
          const x = e[0] + (r[0] - e[0]) * v;
          const z = e[2] + (r[2] - e[2]) * v;
          // 오목하게 처진 지붕면 + 네 귀의 들림
          const y = h * Math.pow(v, 1.55) + curl * Math.pow(Math.abs(u), 4) * Math.pow(1 - v, 2);
          pos.push(x, y, z);
          uv.push(((u + 1) / 2) * along * 2.2, v * 3);
        }
      }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
        const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true; m.receiveShadow = true;
      group.add(m);
    });
    return group;
  };

  const dispose = () => {
    for (const d of disposables) d.dispose?.();
  };

  return { track, toon, canvasTex, mesh, tileTex, curvedRoof, dispose, ramp };
}

/* ---------- 캔버스로 그리는 질감 ---------- */
export function cloudCanvas(seed) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    puffs.push([70 + t * 372 + (rand(seed + i) - 0.5) * 30, 150 - Math.sin(t * Math.PI) * (40 + rand(seed + i + 20) * 40), 42 + Math.sin(t * Math.PI) * 38 + rand(seed + i + 40) * 16]);
  }
  for (let i = 0; i < 6; i++) puffs.push([110 + i * 58 + (rand(seed + i + 60) - 0.5) * 16, 178, 30 + rand(seed + i + 70) * 10]);
  g.fillStyle = '#A2906F';
  puffs.forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill(); });
  puffs.forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.2, x, y, r);
    gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#F1EBDD');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  });
  g.strokeStyle = '#A2906F'; g.lineWidth = 4; g.lineCap = 'round';
  [[140, 172], [300, 160], [390, 182]].forEach(([x, y]) => {
    g.beginPath(); g.arc(x, y, 14, Math.PI * 0.2, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.arc(x + 3, y + 2, 6, Math.PI, Math.PI * 2.6); g.stroke();
  });
  return c;
}

export function ridgeCanvas(seed, [r, g, b], alpha, height) {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
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
    const taper = Math.pow(Math.sin(Math.PI * t), 0.6);
    pts.push([t * W, H - (0.12 + y * height) * taper * H]);
  }
  const grad = x.createLinearGradient(0, H * (1 - height - 0.15), 0, H);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grad.addColorStop(0.55, `rgba(${r},${g},${b},${alpha * 0.55})`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grad;
  x.beginPath(); x.moveTo(0, H);
  pts.forEach(([px, py]) => x.lineTo(px, py));
  x.lineTo(W, H); x.closePath(); x.fill();
  x.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 70; i++) {
    const px = rand(seed + i * 3) * W, py = H * (0.35 + rand(seed + i * 5) * 0.5);
    x.strokeStyle = `rgba(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)},${0.12 + rand(i) * 0.15})`;
    x.lineWidth = 2 + rand(seed + i) * 4;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 10, py + 30, px - 6, py + 70); x.stroke();
  }
  x.globalCompositeOperation = 'destination-in';
  const fade = x.createLinearGradient(0, 0, W, 0);
  fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(0.15, 'rgba(0,0,0,1)');
  fade.addColorStop(0.85, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = fade; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}

export function bannerCanvas(text = '漢') {
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
  g.fillText(text, 64, 88);
  return c;
}

export function radialCanvas(inner, outer, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return c;
}

export function petalCanvas() {
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

export function skyCanvas() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 512;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#A9CDE6'); gr.addColorStop(0.6, '#DCEBF2'); gr.addColorStop(1, '#F4F1EA');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
  return c;
}

export function boardCanvas(lines) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#2F3B33'; g.fillRect(0, 0, 256, 160);
  g.strokeStyle = 'rgba(240,236,220,.85)'; g.lineWidth = 3; g.lineCap = 'round';
  g.fillStyle = 'rgba(240,236,220,.9)';
  g.font = '700 30px Hahmlet, serif';
  g.fillText(lines[0], 22, 50);
  g.font = '500 20px Pretendard, sans-serif';
  lines.slice(1).forEach((t, i) => g.fillText(t, 22, 88 + i * 30));
  return c;
}
