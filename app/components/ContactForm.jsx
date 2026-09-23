'use client';

import { useEffect, useMemo, useState } from 'react';

export const INQUIRY_TYPES = ['강의', '실습 워크숍', '컨설팅·진단', '시스템 구축', '행사 운영·온라인 중계', '기타'];
export const METHODS = ['오프라인', '온라인', '온오프믹스', '미정'];
export const HEADCOUNTS = ['~20명', '21~50명', '51~100명', '100명 이상', '미정'];

const CONTACT_EMAIL = 'kosuk1231@carpedm.kr';

const EMPTY = {
  type: '강의',
  program: '',
  org: '',
  name: '',
  phone: '',
  email: '',
  schedule: '',
  headcount: '미정',
  method: '미정',
  message: '',
  consent: false,
  website: '', // honeypot — 사람은 채우지 않는 숨은 칸
};

export default function ContactForm({ programs }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | done | error | fallback
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 프로그램 상세 페이지 CTA 에서 ?program=slug&type=강의 형태로 넘어오면 미리 선택
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const program = q.get('program');
      const type = q.get('type');
      setForm((f) => ({
        ...f,
        program: program && programs.some((p) => p.slug === program) ? program : f.program,
        type: type && INQUIRY_TYPES.includes(type) ? type : f.type,
      }));
    } catch {
      /* noop */
    }
  }, [programs]);

  const programTitle = useMemo(
    () => programs.find((p) => p.slug === form.program)?.title || '',
    [programs, form.program]
  );

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const mailtoHref = useMemo(() => {
    const subject = `[강의 문의] ${form.org || '기관명'} · ${form.type}${programTitle ? ` · ${programTitle}` : ''}`;
    const body = [
      `문의 유형: ${form.type}`,
      `관심 프로그램: ${programTitle || '미정'}`,
      `기관명: ${form.org}`,
      `담당자: ${form.name}`,
      `연락처: ${form.phone}`,
      `이메일: ${form.email}`,
      `희망 일정: ${form.schedule || '미정'}`,
      `예상 인원: ${form.headcount}`,
      `진행 방식: ${form.method}`,
      '',
      form.message,
    ].join('\n');
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [form, programTitle]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.consent) {
      setError('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, programTitle, page: window.location.href }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        // 시트 연결(환경 변수)이 아직 없을 때: 이메일로 이어갈 수 있게 안내
        setStatus('fallback');
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error || '접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        setStatus('error');
        return;
      }
      setResult(data);
      setStatus('done');
    } catch {
      setError('네트워크 오류로 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="cf-done" role="status">
        <span className="cf-done-kicker">RECEIVED</span>
        <h3>문의가 접수되었습니다.</h3>
        <p>
          접수번호 <b className="mono">{result?.id}</b>
          {form.email ? <> · 입력하신 이메일(<b>{form.email}</b>)로 접수 확인 메일을 보냈습니다.</> : null}
        </p>
        <p>내용을 확인한 뒤 영업일 기준 2일 안에 회신드립니다. 급한 일정이면 메일 제목에 [긴급]을 붙여 주세요.</p>
        <div className="cf-done-actions">
          <a href="#programs">다른 프로그램 보기</a>
          <button type="button" onClick={() => { setForm(EMPTY); setStatus('idle'); setResult(null); }}>새 문의 작성</button>
        </div>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={submit} noValidate>
      <div className="cf-grid">
        <label className="cf-field">
          <span>문의 유형 <i>*</i></span>
          <div className="cf-chips" role="radiogroup" aria-label="문의 유형">
            {INQUIRY_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                className={form.type === t ? 'on' : ''}
                aria-pressed={form.type === t}
                onClick={() => set('type', t)}
              >
                {t}
              </button>
            ))}
          </div>
        </label>

        <label className="cf-field">
          <span>관심 프로그램</span>
          <select value={form.program} onChange={(e) => set('program', e.target.value)}>
            <option value="">아직 정하지 않았습니다 / 상담 후 결정</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>{p.index}. {p.title}</option>
            ))}
          </select>
        </label>

        <label className="cf-field">
          <span>기관명 <i>*</i></span>
          <input
            type="text"
            required
            maxLength={80}
            placeholder="예: OO종합사회복지관"
            value={form.org}
            onChange={(e) => set('org', e.target.value)}
          />
        </label>

        <label className="cf-field">
          <span>담당자 성함 <i>*</i></span>
          <input
            type="text"
            required
            maxLength={40}
            placeholder="예: 김OO 사회복지사"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>

        <label className="cf-field">
          <span>연락처 <i>*</i></span>
          <input
            type="tel"
            required
            inputMode="tel"
            maxLength={20}
            placeholder="010-0000-0000"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </label>

        <label className="cf-field">
          <span>이메일 <i>*</i></span>
          <input
            type="email"
            required
            maxLength={120}
            placeholder="name@org.or.kr"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>

        <label className="cf-field">
          <span>희망 일정</span>
          <input
            type="text"
            maxLength={80}
            placeholder="예: 11월 중 평일 오후 / 12.5(금) 14:00"
            value={form.schedule}
            onChange={(e) => set('schedule', e.target.value)}
          />
        </label>

        <label className="cf-field">
          <span>예상 인원</span>
          <select value={form.headcount} onChange={(e) => set('headcount', e.target.value)}>
            {HEADCOUNTS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>

        <label className="cf-field">
          <span>진행 방식</span>
          <div className="cf-chips" role="radiogroup" aria-label="진행 방식">
            {METHODS.map((m) => (
              <button
                type="button"
                key={m}
                className={form.method === m ? 'on' : ''}
                aria-pressed={form.method === m}
                onClick={() => set('method', m)}
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        <label className="cf-field cf-field-wide">
          <span>문의 내용 <i>*</i></span>
          <textarea
            required
            rows={5}
            maxLength={2000}
            placeholder="교육 대상(직급·직무), 기대하는 변화, 예산 범위나 내부 결재 일정이 있다면 함께 적어 주세요."
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
          />
          <small>{form.message.length} / 2000</small>
        </label>

        {/* honeypot: 화면에 보이지 않음. 봇이 채우면 서버에서 버립니다. */}
        <label className="cf-hp" aria-hidden="true">
          <span>Website</span>
          <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
        </label>

        <label className="cf-consent cf-field-wide">
          <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} />
          <span>
            <b>[필수] 개인정보 수집·이용 동의</b>
            <small>
              수집 항목: 기관명·담당자 성함·연락처·이메일·문의 내용 / 목적: 강의·컨설팅 문의 회신 및 일정 협의 / 보유 기간: 문의 처리 완료 후 1년 (요청 시 즉시 삭제). 동의를 거부할 수 있으나 거부 시 문의 접수가 어렵습니다.
            </small>
          </span>
        </label>
      </div>

      {error ? <p className="cf-error" role="alert">{error}</p> : null}

      {status === 'fallback' ? (
        <div className="cf-fallback" role="status">
          <strong>온라인 접수가 아직 연결되지 않았습니다.</strong>
          <p>작성한 내용을 그대로 담은 이메일로 보내 주시면 같은 방식으로 회신드립니다.</p>
          <a href={mailtoHref}>작성 내용으로 이메일 열기 <b aria-hidden="true">↗</b></a>
        </div>
      ) : null}

      <div className="cf-actions">
        <button type="submit" className="cf-submit" disabled={status === 'sending'}>
          {status === 'sending' ? '접수 중…' : '문의 보내기'}
          <b aria-hidden="true">→</b>
        </button>
        <span className="cf-alt">
          이메일이 편하시면 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </span>
      </div>
    </form>
  );
}
