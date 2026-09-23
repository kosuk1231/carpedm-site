'use client';

import { useState } from 'react';

function roundedRect(ctx, x, y, w, h, r, fill, stroke) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = wrapLines(ctx, text, maxWidth);
  const limited = maxLines ? lines.slice(0, maxLines) : lines;
  limited.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  return y + limited.length * lineHeight;
}

function drawBulletList(
  ctx,
  items,
  x,
  y,
  maxWidth,
  lineHeight,
  textColor = '#332D26',
  bulletColor = '#607845',
  itemGap = 10
) {
  let cy = y;
  for (const item of items) {
    ctx.fillStyle = bulletColor;
    ctx.beginPath();
    ctx.arc(x + 5, cy - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = textColor;
    const lines = wrapLines(ctx, item, maxWidth - 24);
    lines.forEach((line, i) => ctx.fillText(line, x + 22, cy + i * lineHeight));
    cy += lines.length * lineHeight + itemGap;
  }
  return cy;
}

async function loadImage(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

function base64ToBytes(base64) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function makePdfFromJpeg(jpegBytes, imgW, imgH) {
  const enc = new TextEncoder();
  const parts = [];
  const offsets = [0];

  const pushText = (s) => parts.push(enc.encode(s));
  const pushBytes = (b) => parts.push(b);
  const currentLength = () => parts.reduce((sum, p) => sum + p.length, 0);

  pushText('%PDF-1.4\n%CARPEDM\n');
  offsets.push(currentLength());
  pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets.push(currentLength());
  pushText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  offsets.push(currentLength());
  pushText('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');
  offsets.push(currentLength());
  pushText(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  pushBytes(jpegBytes);
  pushText('\nendstream\nendobj\n');
  const content = enc.encode('q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n');
  offsets.push(currentLength());
  pushText(`5 0 obj\n<< /Length ${content.length} >>\nstream\n`);
  pushBytes(content);
  pushText('endstream\nendobj\n');

  const xref = currentLength();
  pushText('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i += 1) {
    pushText(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
  }
  pushText('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');

  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  parts.forEach((p) => {
    out.set(p, at);
    at += p.length;
  });
  return out;
}

async function generateProfilePdf(filename) {
  if (document.fonts?.ready) await document.fonts.ready;

  const W = 1240;
  const H = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg = '#F7F2EA';
  const card = '#FFFDF8';
  const ink = '#2B241E';
  const body = '#5E5348';
  const muted = '#8B7A69';
  const olive = '#607845';
  const apricot = '#D98B4F';
  const line = '#E5D8C7';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Header
  roundedRect(ctx, 70, 68, 1100, 420, 36, card, line);
  roundedRect(ctx, 92, 92, 250, 310, 28, '#EEF3E7', '#D7E0CC');
  const portrait = await loadImage('/profile/kosukwoo-site-clean.jpg');
  const ratio = Math.max(230 / portrait.width, 290 / portrait.height);
  const dw = portrait.width * ratio;
  const dh = portrait.height * ratio;
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, 102, 102, 230, 290, 22);
  ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(102, 102, 230, 290);
  ctx.drawImage(portrait, 102 + (230 - dw) / 2, 102 + (290 - dh) / 2, dw, dh);
  ctx.restore();

  ctx.fillStyle = apricot;
  ctx.font = '700 21px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('SOCIAL WORKER · DIGITAL PRACTITIONER', 380, 122);

  ctx.fillStyle = olive;
  ctx.font = '800 66px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('고석우', 380, 190);
  ctx.fillStyle = muted;
  ctx.font = '500 24px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('Ko Sukwoo', 610, 185);

  ctx.fillStyle = ink;
  ctx.font = '800 34px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('사회복지 현장의 스마트워크 · 디지털 전환 · AI 활용 강사', 380, 244);

  ctx.fillStyle = body;
  ctx.font = '500 21px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('서울특별시사회복지사협회 과장 · 열매똑똑 스마트워크 사업 담당 · 사회복지사 1급', 380, 288);
  ctx.fillText('kosuk1231@carpedm.kr  ·  www.carpedm.kr', 380, 326);

  const pills = [
    { label: '17년차 사회복지사', x: 380, y: 350, fill: '#FAEFE4', color: apricot },
    { label: '500+ 기관 방문·컨설팅', x: 724, y: 350, fill: '#EEF3E7', color: olive },
    { label: '연 20회+ 강의·컨설팅', x: 380, y: 404, fill: '#FAEFE4', color: apricot },
    { label: '최대 1,500명 행사 운영', x: 724, y: 404, fill: '#EEF3E7', color: olive },
  ];
  ctx.font = '700 18px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  pills.forEach(({ label, x, y, fill, color }) => {
    roundedRect(ctx, x, y, 326, 44, 22, fill);
    ctx.fillStyle = color;
    ctx.fillText(label, x + 18, y + 29);
  });

  // Intro
  ctx.fillStyle = olive;
  ctx.font = '800 29px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('소개', 80, 548);
  ctx.strokeStyle = line;
  ctx.beginPath(); ctx.moveTo(80, 566); ctx.lineTo(325, 566); ctx.stroke();

  ctx.fillStyle = body;
  ctx.font = '500 20px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  drawWrapped(
    ctx,
    '2010년 사회복지 현장에서 일을 시작해 2014년부터 서울특별시사회복지사협회에서 근무하고 있습니다. 기관의 스마트워크·디지털 전환·생성형 AI 활용을 지원하면서 실제 업무에 필요한 웹도구와 자동화를 직접 만들고 운영해 왔습니다. 강의에서는 개념 설명에 그치지 않고 현장에서 바로 적용할 수 있는 도구와 방법을 실습 중심으로 다룹니다.',
    80, 606, 1080, 34, 4
  );

  // Two-column cards
  roundedRect(ctx, 70, 760, 530, 380, 28, card, line);
  roundedRect(ctx, 620, 760, 550, 380, 28, card, line);

  ctx.fillStyle = olive;
  ctx.font = '800 28px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('주요 경력 · 사업', 96, 810);
  ctx.fillText('최근 강의 · 활동 (2026)', 646, 810);

  ctx.font = '500 19px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillStyle = ink;
  drawBulletList(ctx, [
    '2014.03~현재  서울특별시사회복지사협회 과장',
    '열매똑똑 스마트워크 사업 총괄 실무 - 3년 63개소 지원',
    '우모가·모담·pdf.carpedm.kr 등 현장형 실무 도구 개발·운영',
    'Google Workspace·Microsoft 365·AI 라이선스 도입 지원',
    '행사 운영·등록·의견수렴·문서 자동화 등 웹 기반 업무 시스템 구축',
    '공저 《샌드위치 사회복지사 생존기술》(2026) 디지털·스마트워크 파트 집필',
  ], 96, 854, 470, 27, ink, olive, 8);

  drawBulletList(ctx, [
    '휴먼임팩트 협동조합 - 실시간 온라인 AI 강의 (7월·11월, 2회)',
    '강원도사회복지사협회 보수교육 - Apps Script 자동화',
    '4·16재단 - 스마트워크·생성형 AI 활용',
    '한국타이어나눔재단 후원 지역아동센터 - 스마트워크·생성형 AI 활용 (3회)',
    '고양시덕양행신 대학생 봉사단 - AI로 만드는 기관 홍보 영상·숏폼',
    '2026 서울사회복지사 등반대회 - 1,500명 디지털 운영 시스템',
  ], 646, 854, 490, 27, ink, olive, 8);

  // Bottom: formats + topics
  roundedRect(ctx, 70, 1170, 1100, 430, 28, '#33402C');
  ctx.fillStyle = '#F2B181';
  ctx.font = '800 20px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('PROGRAM & DELIVERY', 96, 1224);
  ctx.fillStyle = '#FFFDF8';
  ctx.font = '800 31px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('강의부터 컨설팅·구축, 행사 운영까지 현장에 맞춰 연결합니다.', 96, 1278);

  ctx.font = '600 19px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  drawBulletList(ctx, [
    '강의 2~3시간 · 실습 3~6시간 · 온·오프라인·온오프믹스',
    '실습 권장 30명 내외 · 기관 맞춤형 구성·컨설팅 연계',
    '스마트워크 · 생성형 AI · Apps Script · 디지털 전환 · 홍보',
    '행사 운영: 신청 · 알림 · 현장 접수 · 인증 · 통계',
    '온라인 중계: 사전 협의 · 리허설 · 현장 송출 · 아카이브',
  ], 96, 1330, 1005, 31, '#F4EFE6', '#F2B181', 13);

  ctx.fillStyle = '#F2B181';
  ctx.font = '800 22px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('CARPEDM · 현장의 문제를 작동하는 도구로 바꿉니다.', 96, 1566);

  ctx.fillStyle = muted;
  ctx.font = '500 18px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('Updated 2026.09 · www.carpedm.kr', 80, 1686);
  ctx.fillStyle = olive;
  ctx.font = '800 18px system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillText('A4 PORTRAIT · 1 PAGE', 900, 1686);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const jpegBytes = base64ToBytes(dataUrl.split(',')[1]);
  const pdfBytes = makePdfFromJpeg(jpegBytes, W, H);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ProfilePdfButton({ filename, version, updated, size }) {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    try {
      await generateProfilePdf(filename);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="speaker-kit-download" type="button" onClick={handleDownload} disabled={busy}>
      <span>
        <small>PROFILE PDF · {version} · {updated}</small>
        <strong>{busy ? 'A4 세로 PDF 만드는 중…' : '강사 프로필 PDF 다운로드'}</strong>
        <em>{size}</em>
      </span>
      <b aria-hidden="true">↓</b>
    </button>
  );
}
