import { NextResponse } from 'next/server';

// 문의폼 → 이 라우트 → Google Apps Script 웹앱 → 스프레드시트 '강의 문의' 시트 저장 + 메일 알림.
// 브라우저는 같은 도메인(/api/contact)만 호출하므로 CSP connect-src 'self' 를 그대로 유지합니다.
// Apps Script URL 과 공유 비밀은 Vercel 환경 변수에 둡니다.
//   CONTACT_GAS_URL   = https://script.google.com/macros/s/.../exec
//   CONTACT_SECRET    = Apps Script 의 SHARED_SECRET 과 같은 문자열
// 설정 방법: docs/contact-form-setup.md

export const runtime = 'nodejs';

const TYPES = ['강의', '실습 워크숍', '컨설팅·진단', '시스템 구축', '행사 운영·온라인 중계', '기타'];
const METHODS = ['오프라인', '온라인', '미정'];

function clean(v, max) {
  return String(v ?? '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

function makeId() {
  const d = new Date();
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const ymd = kst.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CD-${ymd}-${rand}`;
}

async function notifyAgent(payload) {
  const url = process.env.CONTACT_AGENT_WEBHOOK;
  const secret = process.env.CONTACT_AGENT_SECRET;
  if (!url || !secret) return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CARPEDM-Secret': secret,
      },
      body: JSON.stringify({
        event: 'contact.received',
        mode: 'draft_only',
        requestedActions: [
          'summarize_inquiry',
          'draft_reply',
          'notify_owner',
          'suggest_next_steps',
        ],
        ...payload,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    // 에이전트 연결 실패가 문의 접수 자체를 실패시키면 안 됩니다.
    console.warn('contact: agent webhook failed', err);
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  // honeypot — 봇이 채운 경우 성공한 것처럼 응답하고 버립니다.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true, id: makeId() });
  }

  const data = {
    type: TYPES.includes(body.type) ? body.type : '기타',
    program: clean(body.program, 40),
    programTitle: clean(body.programTitle, 80),
    org: clean(body.org, 80),
    name: clean(body.name, 40),
    phone: clean(body.phone, 20),
    email: clean(body.email, 120),
    schedule: clean(body.schedule, 80),
    headcount: clean(body.headcount, 20),
    method: METHODS.includes(body.method) ? body.method : '미정',
    message: clean(body.message, 2000),
    consent: body.consent === true,
    page: clean(body.page, 300),
  };

  if (!data.org || !data.name || !data.phone || !data.email || !data.message) {
    return NextResponse.json({ ok: false, error: '필수 항목(기관명·담당자·연락처·이메일·문의 내용)을 모두 입력해 주세요.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json({ ok: false, error: '이메일 형식을 확인해 주세요.' }, { status: 400 });
  }
  if (!data.consent) {
    return NextResponse.json({ ok: false, error: '개인정보 수집·이용에 동의해 주세요.' }, { status: 400 });
  }

  const gasUrl = process.env.CONTACT_GAS_URL;
  const secret = process.env.CONTACT_SECRET;
  if (!gasUrl || !secret) {
    // 아직 시트 연결 전: 폼이 이메일 대체 경로를 보여줍니다.
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const id = makeId();
  const payload = {
    secret,
    id,
    receivedAt: new Date().toISOString(),
    ...data,
    ua: clean(req.headers.get('user-agent'), 200),
  };

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS 는 text/plain 이어야 preflight 없이 받습니다
      body: JSON.stringify(payload),
      redirect: 'follow', // Apps Script 웹앱은 POST 후 302 로 결과 페이지를 돌려줍니다
      cache: 'no-store',
    });
    const text = await res.text();
    let out = {};
    try { out = JSON.parse(text); } catch { /* GAS 가 HTML 오류 페이지를 준 경우 */ }
    if (!res.ok || !out.ok) {
      console.error('contact: GAS error', res.status, text.slice(0, 300));
      return NextResponse.json({ ok: false, error: '접수 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
    }

    const finalId = out.id || id;
    await notifyAgent({
      id: finalId,
      receivedAt: payload.receivedAt,
      inquiry: data,
    });

    return NextResponse.json({ ok: true, id: finalId });
  } catch (err) {
    console.error('contact: fetch failed', err);
    return NextResponse.json({ ok: false, error: '접수 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
  }
}
