'use client';

import Link from 'next/link';

// 캠퍼스 첫 화면 위 안내: 무엇을 하는 곳인지와 바로 가는 길을 먼저 보여 주고, 3D 둘러보기는 고를 수 있게 둡니다.
export default function CampusIntro({ onStart, loading = false }) {
  return (
    <div className="yv-intro">
      <div className="yv-intro-card">
        <p className="yv-intro-kicker">CARPEDM · 고석우</p>
        <h2>사회복지 현장의<br />스마트워크·AI 강의·컨설팅</h2>
        <p>처음 배우는 직원 교육부터 반복 업무 자동화까지, 기관의 수준에 맞춰 함께합니다.</p>
        <small>고석우 · 사회복지사 1급 · 현장 17년차</small>
        <div className="yv-intro-actions">
          <a className="yv-intro-primary" href="#programs">강의·컨설팅 보기</a>
          <Link className="yv-intro-secondary" href="/contact">우리 기관에 맞는 교육 문의</Link>
        </div>
        <button type="button" className="yv-intro-3d" onClick={onStart}>
          <b aria-hidden="true">▶</b> 3D 캠퍼스 둘러보기{loading ? ' · 불러오는 중…' : ''}
        </button>
        <span className="yv-intro-note">걸어 다니며 강의·사례·문의 공간을 둘러볼 수 있어요. 둘러보지 않아도 아래로 내리면 모든 내용이 있습니다.</span>
      </div>
    </div>
  );
}
