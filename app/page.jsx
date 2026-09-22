import Link from 'next/link';

const WORK = [
  { ko: '스마트워크', en: 'SMART WORK', desc: '구글 워크스페이스와 자동화로 반복 업무를 걷어냅니다. 도구 소개에서 끝나지 않고 기관의 실제 서식과 결재 흐름에 맞춰 붙입니다.' },
  { ko: '인공지능 활용', en: 'AX', desc: '생성형 AI를 업무에 앉히는 방법. 프롬프트 요령을 넘어 기관 문서 규칙을 학습시킨 전용 도구를 함께 만듭니다.' },
  { ko: '디지털 전환', en: 'DX', desc: '종이와 엑셀에 흩어진 업무를 하나의 시스템으로 옮깁니다. 신청·집계·통계까지 이어지는 구조를 설계하고 구축합니다.' },
  { ko: '영상과 홍보', en: 'MEDIA', desc: '촬영 장비 없이 만드는 기관 홍보 영상, 카드뉴스, 행사 기록. 담당자가 혼자서도 이어갈 수 있는 수준으로 남깁니다.' },
];

const CATEGORIES = [
  {
    title: '행사 운영',
    line: '사전접수부터 현장 접수, 인증 이벤트, 스태프 운영, 경품 추첨까지. 행사 하나를 종이 없이 돌립니다.',
    meta: ['최대 1,500명 규모', '반복 사용 시스템 1종', 'DX · 스마트워크'],
    problem: '행사마다 구글 폼을 새로 만들고, 명단을 엑셀로 내려받아 현장에서 종이로 체크합니다. 접수 확인 문자는 수백 통을 손으로 보내고, 인증 이벤트는 종이에 받아 경품 지급이 밀립니다. 스태프 30명이 각자 다른 큐시트를 들고 있습니다.',
    solve: '행사 하나를 6자리 코드 하나로 열면 신청·명단·현장 접수·통계 화면이 자동으로 생깁니다. 신청 즉시 카카오 알림톡이 나가고, 현장 접수 화면은 몇 대를 켜도 실시간으로 맞춰집니다. 인증 이벤트는 QR로 참가자가 직접 제출하고, 스태프는 모두 같은 당일 안내 페이지를 봅니다.',
    tools: [
      { name: '행사 운영 시스템', desc: '코드 하나로 7개 화면 자동 생성, 실시간 동기화, 관리자 비밀번호 보호. 여러 행사에 반복 사용' },
      { name: '사전접수 + 알림톡 자동 발송', desc: '신청과 동시에 카카오 알림톡. 2026 등반대회 사전접수 1,470명(목표 1,200명 초과), 현장 1,500명' },
      { name: '완주·포토 인증 페이지', desc: '동시접속 100~200명 대응, 전화번호 기준 1회 제출' },
      { name: '스태프 운영 도구', desc: '준비물 3단 체크리스트(D-2 패킹·D-1 확인·당일), 당일 안내 페이지(타임라인·개인별 업무·큐시트·비상연락망, PIN으로 현장 수정)' },
      { name: '맞춤 신청 페이지', desc: '구글 폼이 못 하는 것들 — 5분 단위 시간 선점, 정원 도달 시 자동 마감, 회비 납부 등 자격 항목. 프로필 촬영 예약, 공동체 상영 GV(92석), 친선전 등' },
      { name: '경품 추첨기 · 수령 확인 앱', desc: '107명 참가 성과공유회에서 종이 뽑기와 서명지를 대체' },
      { name: '기념행사 통합 운영', desc: '사전등록·스태프 앱·포토 이벤트·SNS 인증까지 외주 없이. 협회 40주년 기념행사' },
    ],
    stack: ['Next.js', 'Supabase', 'Google Sheets API', 'Google Apps Script', 'Solapi 알림톡', 'Vercel'],
  },
  {
    title: '회의·소통 운영',
    line: '날짜 조율, 의견 수집, 위원회 운영. 단톡방에서 흩어지는 것들을 한 화면으로 모읍니다.',
    meta: ['공개 앱 2종', '위원회 상시 운영', '스마트워크 · AX'],
    problem: '회의 날짜 하나 잡으려고 단톡방에 "가능한 날 알려주세요"가 오가고 결국 아무도 정리하지 않습니다. 의견을 모으려면 유료 툴을 쓰거나 포스트잇을 붙이는데, 유료 툴은 기관 결재가 안 나옵니다. 위원회 활동 계획은 설문으로 받고 엑셀로 다시 정리합니다.',
    solve: '링크 하나를 뿌리면 각자 가능한 칸을 칠하고, 겹치는 시간이 바로 보입니다. 보드를 만들고 QR을 띄우면 참여자가 로그인 없이 카드를 붙입니다. 위원회 설문은 제출되는 순간 대시보드에 집계됩니다.',
    tools: [
      { name: '우모가 — 일정 조율 앱', desc: '여러 사람의 가능 시간을 한 화면에서. 벤토 그리드, 다크 모드, 홈 화면 설치(PWA)', url: 'https://schedule.carpedm.kr', urlLabel: 'schedule.carpedm.kr' },
      { name: '모담 — 의견·질문 보드', desc: '패들렛을 대신하는 우리 보드. 보드 무제한, 카드형 배치, 반응, 이미지 업로드, 링크 미리보기. 강의장에서 실시간 질문 수집에 사용', url: 'https://board.carpedm.kr', urlLabel: 'board.carpedm.kr' },
      { name: '위원회 의견수렴 설문 + 대시보드', desc: '정책·공정위원회 의견 수집과 활동계획 설문이 곧바로 집계 화면으로' },
      { name: '워크숍 웹 안내 페이지', desc: '일정·장소·숙소 배정·차량을 한 페이지에. 1박 2일 워크숍 17명 운영' },
    ],
    stack: ['React', 'Supabase', 'Firebase Hosting', 'Google Apps Script', 'Vercel'],
  },
  {
    title: '업무 효율화',
    line: '설치 없는 PDF 도구, 시트 하나로 돌아가는 신청·집계 자동화, 행정문서 자동 생성. 반복 업무를 걷어냅니다.',
    meta: ['공개 도구 pdf.carpedm.kr', '앱스 스크립트 자동화 다수', '스마트워크 · AX'],
    problem: 'PDF 하나 합치려고 유료 프로그램을 깔거나 민감한 문서를 외부 사이트에 올립니다. 신청은 구글 폼, 집계는 엑셀, 알림은 문자. 세 군데를 오가며 복사합니다. 회의록·공문은 매번 서식을 열어 같은 자리에 같은 것을 채웁니다.',
    solve: '파일이 서버로 가지 않는 브라우저 안 PDF 도구를 만들었습니다. 신청·집계·알림은 구글 시트 하나를 백엔드로 삼아 앱스 스크립트가 이어 줍니다. 기관 문서 규칙을 학습시킨 전용 AI 도구로 한글(HWPX) 문서를 규격대로 만듭니다.',
    tools: [
      { name: 'pdf.carpedm.kr', desc: '병합·분할·회전·텍스트 추출·압축·PDF→PPTX·PDF→JPG·페이지 편집·쪽번호. 업로드 없이 브라우저에서 처리', url: 'https://pdf.carpedm.kr', urlLabel: 'pdf.carpedm.kr' },
      { name: '시트 기반 신청·집계 자동화', desc: '구글 앱스 스크립트 백엔드 + 정적 프론트. 기관 담당자가 시트에서 바로 관리할 수 있어 인수인계가 쉽습니다' },
      { name: '행정문서 자동 생성', desc: '협회 행정문서 규칙(날짜·항목기호·글꼴·"끝" 표시)을 학습시킨 AI 도구로 회의록·기안·결과보고서를 HWPX로 생성' },
      { name: '단축 URL', desc: 'carpedm.kr/ax 같은 짧은 주소. 강의장에서 QR 대신 말로 불러 줄 수 있는 길이' },
      { name: '비영리 라이선스 도입 지원', desc: 'Google Workspace·Microsoft 365·AI 라이선스 등 무료·할인 신청부터 정착까지. 예산 없이 시작하는 방법' },
    ],
    stack: ['Vanilla JS', 'Google Apps Script', 'python-hwpx', 'Cloudflare Workers', 'Vercel'],
  },
  {
    title: 'OpenClaw AI 시스템',
    line: 'Mac mini를 상시 AI 허브로 만들고, 역할이 다른 AI 에이전트와 Obsidian 지식베이스를 하나의 업무 시스템으로 연결했습니다.',
    meta: ['4-Agent AI 운영체계', '평일 08:30 자동 브리핑', '로컬 AI · 멀티에이전트'],
    problem: 'ChatGPT·Claude·로컬 AI를 각각 사용하면 같은 맥락을 반복해서 설명해야 하고, 결과도 여러 서비스와 파일에 흩어집니다. 매일 쌓이는 회의·프로젝트·메모를 AI가 활용하려면 개인정보와 원본 파일을 무분별하게 수정하지 않으면서 지속적으로 읽을 수 있는 구조도 필요했습니다.',
    solve: 'Mac mini M4를 상시 AI 허브로 두고 OpenClaw가 역할별 에이전트를 연결하도록 구성했습니다. main이 작업을 조율하고 developer는 GPT-5.6 Sol, critic은 Claude Opus 5, local은 Ollama의 gemma4-agent를 사용합니다. Obsidian Vault를 공통 지식베이스로 연결하고 Docker 읽기 전용 샌드박스로 원본 보호 원칙을 유지합니다.',
    tools: [
      { name: 'OpenClaw 멀티에이전트', desc: 'main이 작업을 조율하고 developer·critic을 목적에 따라 호출. 개발과 검토를 하나의 흐름으로 연결' },
      { name: 'Obsidian 지식베이스', desc: '프로젝트·회의·Daily Note·inbox를 하나의 Vault에 축적. iCloud 동기화와 심볼릭 링크로 Mac mini와 개인 기기에서 같은 지식베이스 사용' },
      { name: '로컬 AI — Ollama', desc: 'gemma4-agent를 이용해 반복적인 읽기·요약 작업을 로컬에서 처리. 클라우드 모델 사용량을 줄이고 역할을 분리' },
      { name: 'CarpeDM 아침 브리핑', desc: '평일 오전 8시 30분 Daily Note·진행 프로젝트·최근 회의·inbox를 읽어 오늘의 체크리스트와 다음 행동을 자동 정리' },
      { name: 'Telegram 원격 인터페이스', desc: 'Mac mini에서 상시 동작하는 OpenClaw와 Telegram을 연결해 외부에서도 AI 시스템에 접근' },
      { name: '읽기 전용 AI 운영', desc: 'Docker sandbox와 read-only Vault를 기본값으로 두고 AI가 원본 문서를 임의로 수정하지 못하도록 권한을 제한' },
    ],
    stack: ['OpenClaw', 'Obsidian', 'Ollama', 'GPT-5.6 Sol', 'Claude Opus 5', 'Docker', 'Telegram'],
  },
  {
    title: '캠페인·홍보',
    line: '현장 인증 사진 수집, 서명운동, 기념 영상, 웹 초대장. 촬영 장비 없이 담당자 혼자 이어갈 수 있는 홍보.',
    meta: ['40주년 미디어 산출물 27건', '캠페인 대상 158개소 1,152명', '미디어 · DX'],
    problem: '캠페인 참여 사진을 카톡과 메일로 받으면 정리에 이틀이 걸리고 개인정보 동의를 받을 방법이 없습니다. 행사 영상은 외주를 주면 예산이 없고, 안 주면 아무것도 남지 않습니다.',
    solve: 'QR 하나로 사진 제출과 개인정보 동의를 같이 받고, 사진은 드라이브로, 데이터는 시트로 자동 분리 저장합니다. 영상·카드뉴스·웹 초대장은 무료 도구 조합으로 내부에서 만들고, 그 방법을 강의로 다시 전달합니다.',
    tools: [
      { name: '이슈온 — 현안대응 캠페인 플랫폼', desc: '판넬 문구 9종 슬라이드쇼, 사진 병렬 업로드 제출, 시의회 전달용 서명 페이지, 관리자 숨김 기능. 14개 직능·158개소·1,152명 처우개선 이슈' },
      { name: '40주년 기념행사 미디어', desc: '기념 영상, SNS 인증 앱, 포토 이벤트 등 27건' },
      { name: '《샌드위치 사회복지사 생존기술》 북콘서트', desc: '텀블벅 펀딩, 웹 초대장, 현장 아케이드 게임' },
      { name: '기관 홍보 영상·숏폼 제작법', desc: 'Canva AI·Vrew·CapCut·Suno·Google Earth Studio 조합. 대학생 봉사단 103슬라이드 강의로 정리' },
    ],
    stack: ['Next.js', 'Supabase', 'Google Drive API', 'Canva', 'Vrew', 'CapCut', 'Vercel'],
  },
];

const BIZ = [
  { period: '2024.06 ~ 현재', name: '열매똑똑 스마트워크 사업 총괄 실무', desc: '서울시 사회복지시설·단체 디지털 전환 지원. Google·Microsoft 협업, 기관별 진단→컨설팅→교육→업무환경 구축', scale: '3년 63개소 · 연간 교육 20회' },
  { period: '2015 ~ 2017', name: '서울시 사회복지기관 디지털 리터러시 사업 기획·운영', desc: 'Microsoft 후원 디지털 전환 지원 사업', scale: '서울시 내 사회복지기관' },
  { period: '상시', name: '비영리 라이선스 도입 지원', desc: 'Google Workspace·Microsoft 365·AI 라이선스 등 비영리 무료·할인 라이선스 신청부터 정착까지', scale: '기관별' },
];

const LECTURES = [
  { year: '2026', host: '강원도사회복지사협회 보수교육', topic: 'AI 도구 활용을 넘어 도구 생성 — 구글 앱스 스크립트 자동화', count: '1회' },
  { year: '2026', host: '고양시덕양행신 대학생 봉사단', topic: 'AI로 만드는 기관 홍보 영상·숏폼 (실습)', count: '1회' },
  { year: '2026', host: '4·16재단', topic: '스마트워크 · 생성형 AI 활용', count: '1회' },
  { year: '2026', host: '한국타이어나눔재단 후원 지역아동센터', topic: '스마트워크 · 생성형 AI 활용', count: '3회' },
  { year: '2015 ~ 2017', host: '서울시 사회복지기관', topic: '디지털 리터러시', count: '다수' },
  { year: '2014 ~ 2015', host: 'Microsoft 주최 NGO-Cloud Day', topic: '세션 강의', count: '5회' },
  { year: '2015 ~ 현재', host: '사회복지관 · 지역아동센터 · 시설 실무자 및 중간관리자', topic: '스마트워크 · 생성형 AI 활용', count: '연 20회 내외' },
];

const TOPICS = [
  '사회복지 현장의 스마트워크, 무엇부터 바꿀까',
  '실무자를 위한 생성형 AI 활용법 (실습)',
  '기록·문서 업무를 줄이는 디지털 도구 활용',
  'AI로 만드는 기관 홍보 콘텐츠·숏폼 (실습)',
  '예산 없이 시작하는 비영리 라이선스 활용',
  '기관 업무환경 진단과 디지털 전환 컨설팅',
  'AI 도구 활용을 넘어 도구 생성 — 앱스 스크립트·바이브코딩',
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
        <div>
          <p className="kicker">사회복지 현장의 스마트워크 · AI 전환</p>
          <h1 className="lede">오늘 쓸 도구를<br /><em>오늘</em> 만듭니다.</h1>
          <p className="herosub">도구를 소개하는 강의가 아니라, 참여자가 자기 업무에 맞는 도구를 하나 들고 나가는 강의를 합니다.</p>
        </div>
        <aside className="heroside">
          <p>이 사이트의 모든 링크는 이렇게 나갑니다</p>
          <div className="line mono">carpedm.kr/<i>ax</i></div>
          <div className="note">강의장에서 QR 대신 말로 불러 줄 수 있는 길이의 짧은 주소입니다.</div>
        </aside>
      </header>

      <section className="sec">
        <h2 className="h2">강의와 컨설팅</h2>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)' }}>네 가지 영역에서 현장과 함께합니다</p>
        <div className="workgrid">
          {WORK.map((w) => (
            <div className="work" key={w.en}>
              <small>{w.en}</small>
              <h3>{w.ko}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <h2 className="h2">현장에서 돌아가고 있는 것들</h2>
        <p style={{ margin: '0 0 8px', fontSize: 15, color: 'var(--muted)', maxWidth: '56ch' }}>
          기획서로 끝난 것은 없습니다. 네 가지 영역에서 실제 행사와 업무에 투입된 도구들입니다.
        </p>

        <div className="cat-list">
          {CATEGORIES.map((c, i) => (
            <details className="cat" key={c.title} open={i === 0}>
              <summary className="cat-sum">
                <div>
                  <h3 className="cat-title">{c.title}</h3>
                  <p className="cat-line">{c.line}</p>
                  <div className="cat-meta">
                    {c.meta.map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
                <span className="cat-plus" aria-hidden="true" />
              </summary>

              <div className="cat-body">
                <div className="pair">
                  <div>
                    <h5>이런 문제를</h5>
                    <p>{c.problem}</p>
                  </div>
                  <div>
                    <h5>이렇게 풉니다</h5>
                    <p>{c.solve}</p>
                  </div>
                </div>

                <dl className="doclist">
                  {c.tools.map((t) => (
                    <div className="doclist-row" key={t.name} style={{ display: 'contents' }}>
                      <dt>{t.name}</dt>
                      <dd>
                        {t.desc}
                        {t.url && (
                          <>
                            {' — '}
                            <a href={t.url} target="_blank" rel="noopener noreferrer" className="mono">
                              {t.urlLabel}
                            </a>
                          </>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="stack">
                  {c.stack.map((s) => <span className="tag" key={s}>{s}</span>)}
                </div>
              </div>
            </details>
          ))}
        </div>

        <p className="common-note">
          위 도구들은 대부분 구글 시트 하나와 무료 호스팅으로 돌아갑니다. 기관에 그대로 옮겨 붙일 수 있는 이유입니다.
        </p>
      </section>

      <section className="sec">
        <h2 className="h2">강의와 컨설팅, 지금까지</h2>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--muted)', maxWidth: '56ch' }}>
          도구를 소개하고 끝나는 방문은 없었습니다. 기관의 서식과 결재 흐름에 맞춰 붙이는 것까지가 방문이었습니다.
        </p>

        <dl className="stats" style={{ marginBottom: 40 }}>
          <div className="stat"><dt>강의·컨설팅</dt><dd>연 20회</dd></div>
          <div className="stat"><dt>열매똑똑 동행 기관</dt><dd>63개소</dd></div>
          <div className="stat"><dt>누적 방문 기관</dt><dd>500여 곳</dd></div>
        </dl>

        <h4 className="h3">사업 단위</h4>
        <table className="rtable">
          <thead>
            <tr><th>기간</th><th>사업</th><th>내용</th><th>규모</th></tr>
          </thead>
          <tbody>
            {BIZ.map((b) => (
              <tr key={b.name}>
                <td>{b.period}</td>
                <td><b>{b.name}</b></td>
                <td>{b.desc}</td>
                <td>{b.scale}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4 className="h3">강의</h4>
        <table className="rtable">
          <thead>
            <tr><th>연도</th><th>주최·대상</th><th>주제</th><th>횟수</th></tr>
          </thead>
          <tbody>
            {LECTURES.map((l, i) => (
              <tr key={i}>
                <td>{l.year}</td>
                <td>{l.host}</td>
                <td>{l.topic}</td>
                <td>{l.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4 className="h3">주요 강의 주제</h4>
        <ul className="tags">
          {TOPICS.map((t) => <li className="tag" key={t}>{t}</li>)}
        </ul>
        <p style={{ margin: '20px 0 0', fontSize: 14.5, color: 'var(--muted)', maxWidth: '58ch' }}>
          강의장에서 바로 만들어 보는 실습형으로 진행합니다. 생성형 AI 실습, 숏폼·기관 홍보 영상 제작, 문서·기록 자동화까지 — 참여자가 자기 업무용 도구 하나를 들고 나갑니다.
        </p>
      </section>

      <section className="sec">
        <h2 className="h2">소개</h2>
        <div className="about">
          <div>
            <p>사회복지 현장에서 일하며, 현장에 필요한 도구를 직접 만들어 왔습니다. 강의는 도구를 소개하는 자리가 아니라 참여자가 자기 업무에 맞는 도구를 하나 들고 나가는 자리여야 한다고 생각합니다.</p>
            <p>2010년 반포종합사회복지관에서 시작해 2014년부터 서울특별시사회복지사협회에서 근무하며, 지금까지 전국의 기관을 다니며 스마트워크와 디지털 전환을 함께 고민했습니다. 그 과정에서 만든 시스템들이 실제 기관에서 돌아가고 있습니다.</p>
            <p>강의·자문·시스템 구축 문의를 받습니다.</p>
          </div>
          <dl className="facts">
            <div className="fact"><dt>현장 경력</dt><dd>2010년부터</dd></div>
            <div className="fact"><dt>방문 기관</dt><dd>전국 500여 곳</dd></div>
            <div className="fact"><dt>동행 기관</dt><dd>63개소 (열매똑똑 3년)</dd></div>
            <div className="fact"><dt>연간 강의</dt><dd>20회 내외</dd></div>
            <div className="fact"><dt>저서 참여</dt><dd>샌드위치 사회복지사 생존기술</dd></div>
            <div className="fact"><dt>운영 영역</dt><dd>행사 · 회의 · 업무 · 홍보</dd></div>
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
