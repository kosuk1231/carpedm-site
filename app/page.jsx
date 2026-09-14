import Link from 'next/link';

const WORK = [
  { ko: '스마트워크', en: 'SMART WORK', desc: '구글 워크스페이스와 자동화로 반복 업무를 걷어냅니다. 도구 소개에서 끝나지 않고 기관의 실제 서식과 결재 흐름에 맞춰 붙입니다.' },
  { ko: '인공지능 활용', en: 'AX', desc: '생성형 AI를 업무에 앉히는 방법. 프롬프트 요령을 넘어 기관 문서 규칙을 학습시킨 전용 도구를 함께 만듭니다.' },
  { ko: '디지털 전환', en: 'DX', desc: '종이와 엑셀에 흩어진 업무를 하나의 시스템으로 옮깁니다. 신청·집계·통계까지 이어지는 구조를 설계하고 구축합니다.' },
  { ko: '영상과 홍보', en: 'MEDIA', desc: '촬영 장비 없이 만드는 기관 홍보 영상, 카드뉴스, 행사 기록. 담당자가 혼자서도 이어갈 수 있는 수준으로 남깁니다.' },
];

const TOOLS = [
  { name: '행사 운영 시스템', desc: '신청·명단·현장 접수를 한 번에. 대규모 행사에 사용 중' },
  { name: '탄력근무 신청 시스템', desc: '신청부터 결재까지 웹으로. 종이 결재를 대체' },
  { name: '감탄일기 마라톤', desc: '참여자가 매일 기록을 남기는 챌린지 웹앱' },
  { name: '기억곳간', desc: '어르신이 쓰기 쉬운 큰 글씨 일기장. 복지관 프로그램용' },
];

export default function Home() {
  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="brand">
          <b>CARPEDM</b>
          <span>카르페디엠</span>
        </Link>
        <a className="navlink" href="mailto:hello@carpedm.kr">문의하기</a>
      </nav>

      <header className="hero">
        <p className="kicker">사회복지 현장의 스마트워크 · AI 전환</p>
        <h1 className="lede">오늘 쓸 도구를<br /><em>오늘</em> 만듭니다.</h1>

        <div className="wordmark">
          <p>이 사이트의 모든 링크는 이렇게 나갑니다</p>
          <div className="line mono">carpedm.kr/<i>ax</i></div>
        </div>
      </header>

      <section className="sec">
        <h2 className="h2">강의와 컨설팅</h2>
        {WORK.map((w) => (
          <div className="workrow" key={w.en}>
            <h3>{w.ko}<small>{w.en}</small></h3>
            <p>{w.desc}</p>
          </div>
        ))}
      </section>

      <section className="sec">
        <h2 className="h2">만들어 쓰고 있는 것</h2>
        <div className="tools">
          {TOOLS.map((t) => (
            <div className="tool" key={t.name}>
              <h4>{t.name}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <h2 className="h2">소개</h2>
        <div className="about">
          <div>
            <p>사회복지 현장에서 일하며, 현장에 필요한 도구를 직접 만들어 왔습니다. 강의는 도구를 소개하는 자리가 아니라 참여자가 자기 업무에 맞는 도구를 하나 들고 나가는 자리여야 한다고 생각합니다.</p>
            <p>2010년 복지관에서 시작해 지금까지 전국의 기관을 다니며 스마트워크와 디지털 전환을 함께 고민했습니다. 그 과정에서 만든 시스템들이 실제 기관에서 돌아가고 있습니다.</p>
            <p>강의·자문·시스템 구축 문의를 받습니다.</p>
          </div>
          <dl className="facts">
            <div className="fact"><dt>현장 경력</dt><dd>2010년부터</dd></div>
            <div className="fact"><dt>방문 기관</dt><dd>전국 500여 곳</dd></div>
            <div className="fact"><dt>저서 참여</dt><dd>샌드위치 사회복지사 생존기술</dd></div>
            <div className="fact"><dt>주제</dt><dd>스마트워크 · AI · DX · 영상</dd></div>
          </dl>
        </div>
      </section>

      <section className="cta">
        <h2>강의나 컨설팅을 의뢰하시나요?</h2>
        <p>기관 상황과 원하는 주제를 알려 주시면 맞는 구성을 제안해 드립니다.</p>
        <a href="mailto:hello@carpedm.kr">hello@carpedm.kr</a>
      </section>

      <footer className="foot">
        <span>CARPEDM 카르페디엠</span>
        <Link href="/admin" className="mono">carpedm.kr</Link>
      </footer>
    </div>
  );
}
