'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Admin() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [links, setLinks] = useState([]);
  const [target, setTarget] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (copied === null) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  async function load(k) {
    const res = await fetch('/_api/links', { headers: { 'x-admin-key': k } });
    if (res.status === 401) { setErr('비밀번호가 맞지 않습니다.'); return false; }
    const data = await res.json();
    setLinks(data.links || []);
    return true;
  }

  async function signIn() {
    setErr(''); setBusy(true);
    const ok = await load(key);
    setBusy(false);
    if (ok) setAuthed(true);
  }

  async function create() {
    setErr(''); setBusy(true);
    const res = await fetch('/_api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ target, slug, title }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error || '만들지 못했습니다.'); return; }
    setTarget(''); setSlug(''); setTitle('');
    load(key);
  }

  async function remove(s) {
    setBusy(true);
    await fetch('/_api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ op: 'delete', slug: s }),
    });
    setBusy(false);
    load(key);
  }

  function copy(s) {
    const text = `https://carpedm.kr/${s}`;
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(text);
    } catch {}
    setCopied(s);
  }

  const total = links.reduce((a, b) => a + Number(b.clicks || 0), 0);
  const top = links.reduce((a, b) => (Number(b.clicks || 0) > Number(a?.clicks || -1) ? b : a), null);

  if (!authed) {
    return (
      <div className="wrap">
        <nav className="nav">
          <Link href="/" className="brand"><b>CARPEDM</b><span>링크 관리</span></Link>
        </nav>
        <div className="gate">
          <h2 className="h2">관리자 비밀번호</h2>
          <div className="field">
            <input
              className="in"
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && signIn()}
              placeholder="비밀번호"
            />
          </div>
          <div className="row">
            <button className="btn" onClick={signIn} disabled={busy || !key}>들어가기</button>
            {err && <span className="err">{err}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="brand"><b>CARPEDM</b><span>링크 관리</span></Link>
      </nav>

      <section className="sec" style={{ paddingTop: 20 }}>
        <h2 className="h2">새 링크 만들기</h2>

        <div className="field">
          <label className="label" htmlFor="t">줄일 주소</label>
          <input id="t" className="in mono" value={target}
            onChange={(e) => { setTarget(e.target.value); setErr(''); }}
            placeholder="https://docs.google.com/forms/d/e/1FAIpQLSd..." />
        </div>

        <div className="field">
          <label className="label" htmlFor="m">메모 (선택)</label>
          <input id="m" className="in" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="2026 등반대회 신청" />
        </div>

        <label className="label">짧은 주소</label>
        <div className="urlline">
          <span className="host mono">carpedm.kr/</span>
          <input className="slugin" value={slug}
            onChange={(e) => { setSlug(e.target.value); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder="ax" maxLength={24} />
        </div>

        <div className="row">
          <button className="btn" onClick={create} disabled={busy}>링크 만들기</button>
          {err ? <span className="err">{err}</span> : <span className="hint">비워 두면 무작위로 만들어집니다</span>}
        </div>
      </section>

      <section className="sec">
        <h2 className="h2">현황</h2>
        <dl className="stats">
          <div className="stat"><dt>만든 링크</dt><dd>{links.length}</dd></div>
          <div className="stat"><dt>전체 클릭</dt><dd>{total.toLocaleString()}</dd></div>
          <div className="stat"><dt>가장 많이 열린 링크</dt><dd className="mono" style={{ fontSize: 20 }}>{top ? `/${top.slug}` : '—'}</dd></div>
        </dl>

        <div className="list" style={{ marginTop: 0 }}>
          {links.length === 0 && <p className="empty">아직 만든 링크가 없습니다. 위에서 첫 링크를 만들어 보세요.</p>}
          {links.map((l) => (
            <div className="item" key={l.slug}>
              <div className="item-main">
                <div className="short mono">carpedm.kr/{l.slug}</div>
                <div className="target">{l.title || l.target}</div>
              </div>
              <div className="clicks"><b>{Number(l.clicks || 0).toLocaleString()}</b> 클릭</div>
              <button className="mini" data-done={copied === l.slug} onClick={() => copy(l.slug)}>
                {copied === l.slug ? '복사함' : '복사'}
              </button>
              <button className="mini" onClick={() => remove(l.slug)}>삭제</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">
        <span>새 링크는 만든 직후부터 바로 작동합니다.</span>
      </footer>
    </div>
  );
}
