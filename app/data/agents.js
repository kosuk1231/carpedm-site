// CARPEDM 캠퍼스의 팀원: 사람 5 + 로봇 5, 그리고 미션컨트롤의 대표.
// 키는 OpenClaw 에이전트 id 와 같습니다(ceo 는 에이전트가 아니라 고석우 대표 본인).
// kind: 'human' | 'robot'. 카드 그림은 public/agents/<id>.png 가 있으면 씁니다(img: true).
// menu: 캠퍼스에서 이 팀원에게 다가가면 말풍선으로 소개하고, 누르면 이동하는 사이트 메뉴.

export const AGENTS = {
  main: {
    emoji: '🧭', name: '초원 실장', kind: 'human', title: '실장', img: '/agents/main.png',
    role: '배분·종합',
    greet: '어서 오세요. 캠퍼스 안내는 제가 맡습니다. 어디부터 둘러보시겠어요?',
    desc: '요청을 받아 누구에게 무엇을 맡길지 정하고, 돌아온 결과를 하나로 엮어 내놓습니다. 대부분의 일은 남에게 넘기지 않고 직접 끝냅니다.',

    menu: { href: '/contact', label: '문의하기', pitch: '요청은 제가 한 곳에서 받아요. 강의·컨설팅·구축, 무엇이든 문의를 남겨 주세요.' },
  },
  developer: {
    emoji: '🔨', name: '뚝딱봇', kind: 'robot', title: '빌드 로봇', img: '/agents/developer.png',
    role: '코딩·디버깅',
    greet: '뚝딱. 만들 게 있으면 말씀만 하세요. 빌드랩에서 끝내 가지고 나옵니다.',
    desc: '말보다 결과로 보여 주는 작업 로봇입니다. 공구 팔로 도구를 만들고, 고장 난 곳을 찾아 고칩니다.',

    menu: { href: '#portfolio', label: '만든 것 보기', pitch: '현장에 실제로 투입한 시스템들, 빌드랩에서 만든 것들을 보여 드릴게요.' },
  },
  critic: {
    emoji: '🧐', name: '서진 수석', kind: 'human', title: '수석 리뷰어', img: '/agents/critic.png',
    role: '비평·전략 검토',
    greet: '좋다는 말은 끝까지 읽고 나서 하겠습니다.',
    desc: '계획과 결과물을 끝까지 읽고, 허점이 보이면 먼저 짚습니다. 칭찬에 인색한 대신 놓치는 게 없습니다.',

    menu: { href: '#services', label: '진단표 보기', pitch: '우리 기관이 입문·심화·구축 중 어디서 시작하면 좋을지, 진단표로 함께 짚어 봐요.' },
  },
  researcher: {
    emoji: '🔍', name: '서치봇', kind: 'robot', title: '조사 드론', img: '/agents/researcher.png',
    role: '조사·자료 읽기',
    greet: '자료는 제가 찾아오겠습니다. 판단은 사람이 하시고요.',
    desc: '흩어진 자료를 찾아 날아오는 드론입니다. 답을 대신 내기보다 판단에 필요한 근거를 모아 옵니다.',

    menu: { href: '#record', label: '강의·사업 이력 보기', pitch: '그동안 다녀온 강의와 사업 이력을 빠짐없이 모아 두었어요.' },
  },
  writer: {
    emoji: '✍️', name: '은설 작가', kind: 'human', title: '작가', img: '/agents/writer.png',
    role: '초고 집필',
    greet: '초고는 제가 씁니다. 겪지 않은 일은 쓰지 않아요.',
    desc: '주어진 재료 안에서 초고를 씁니다. 저자의 목소리를 흉내 내되 저자를 대신하지 않습니다.',

    menu: { href: '#notes', label: '실무 노트 읽기', pitch: '현장에서 해 본 일을 실무 노트로 정리해 두었어요. 한 편 읽어 보실래요?' },
  },
  editor: {
    emoji: '📕', name: '교정봇', kind: 'robot', title: '교열 로봇', img: '/agents/editor.png',
    role: '교열',
    greet: '어긋난 문장은 누가 썼든 빨간 펜으로 고칩니다.',
    desc: '맞춤법과 문장 흐름을 다듬는 로봇입니다. 원칙에서 물러서지 않지만, 고집이 지나치지 않게 스스로 경계합니다.',

    menu: { href: '#fieldlog', label: '현장 기록 보기', pitch: '다녀온 현장의 기록을 다듬어 두었습니다. 현장 기록으로 안내할게요.' },
  },
  trainer: {
    emoji: '🎓', name: '은채 코치', kind: 'human', title: '코치', img: '/agents/trainer.png',
    role: '강의안·교안',
    greet: '어려운 말은 쉽게, 쉬운 말은 깊게. 아카데미에 오신 걸 환영해요.',
    desc: '듣는 사람 눈높이에서 강의안과 교안을 짭니다. 용어보다 현장의 상황을 먼저 이야기합니다.',

    menu: { href: '#programs', label: '강의 프로그램 보기', pitch: '스마트워크·생성형 AI·바이브코딩, 의뢰 가능한 강의 프로그램을 소개해 드릴게요.' },
  },
  minutes: {
    emoji: '📝', name: '메모봇', kind: 'robot', title: '기록 로봇', img: '/agents/minutes.png',
    role: '회의록 초안',
    greet: '회의에서 나온 말만 적습니다. 나오지 않은 말은 적지 않습니다.',
    desc: '회의를 듣고 기록을 뽑아내는 로봇입니다. 알아듣기 어려운 대목은 채우지 않고 확인할 곳으로 표시해 둡니다.',

    menu: { href: '#tools', label: '바로 써 보기', pitch: '설치 없이 바로 써 볼 수 있는 도구들이 있어요. 한번 눌러 보세요.' },
  },
  brief: {
    emoji: '📨', name: '한결 매니저', kind: 'human', title: '매니저', img: '/agents/brief.png',
    role: '요약·전달',
    greet: '먼 길 오셨어요. 광장에서 길이 갈라지니 가실 곳을 골라 보세요.',
    desc: '긴 내용을 추려 꼭 전할 말만 전합니다. 손님을 맞고 팀 사이를 오가며 소식을 잇습니다.',

    menu: { href: '#faq', label: '자주 묻는 것 보기', pitch: '의뢰 전에 많이들 물어보시는 것들을 짧게 추려 두었어요.' },
  },
  local: {
    emoji: '🔒', name: '지킴이', kind: 'robot', title: '환영 로봇', img: '/agents/dir/local-0.webp',
    role: '로컬 전용 처리',
    greet: '반가워요! CARPEDM 캠퍼스에 오신 걸 환영해요. 방문증 여기 있어요.',
    desc: '캠퍼스 입구에서 손님을 가장 먼저 반기는 환영 로봇입니다. 손님 이야기는 반갑게 듣고, 바깥으로 내보내면 안 되는 자료는 이 기기 안에서만 소중히 다룹니다.',

    menu: { href: '#programs', label: '강의 프로그램 보기', pitch: '반가워요! 처음 오셨다면 의뢰할 수 있는 강의·컨설팅부터 보세요. 문의는 맨 위 「문의하기」로 언제든 하실 수 있어요.' },
  },
  ceo: {
    emoji: '☕', name: '고석우 대표', kind: 'human', title: '대표', notAgent: true, img: '/profile/kosukwoo-portrait.webp',
    role: '강의·컨설팅·구축',
    greet: '끝까지 와 주셨네요. 커피 한 잔 하면서 기관 이야기 들려주세요.',
    desc: '사회복지 현장에서 일하다 스마트워크·AI 전환을 맡게 됐습니다. 강의로 시작해 컨설팅과 시스템 구축까지 한 흐름으로 이어서 맡습니다.',

    menu: { href: '#speaker', label: '강사 소개 보기', pitch: '고석우입니다. 강사 소개와 결재용 프로필은 여기서 보실 수 있어요.' },
  },
};

// 캠퍼스 건물. 입구에서 시작해 걷는 순서대로 번호를 붙였습니다. 입구에 서면 이 내용이 열립니다.
export const CAMPS = [
  {
    key: 'gate',
    what: '시작 안내',
    no: '01',
    place: '웰컴 입구',
    title: 'CARPEDM 캠퍼스에 오신 것을 환영합니다',
    body: '사회복지사 고석우가 현장의 스마트워크·AI 전환을 강의하고, 컨설팅하고, 직접 도구를 만들어 온 곳입니다. 캠퍼스의 인물들은 고석우가 실제 업무에 쓰는 AI 에이전트를 의인화한 것입니다. 가로수 산책로를 따라 북쪽으로 걸으면 아카데미, 컨설팅룸, 빌드랩, 아카이브, 미션컨트롤, 컨택 라운지가 차례로 양옆에 나옵니다.',
    link: { href: '#programs', label: '강의 프로그램 먼저 보기' },
  },
  {
    key: 'academy',
    what: '교육 안내',
    no: '02',
    place: '아카데미',
    title: '입문에서 구축까지, 강의',
    body: '스마트워크·생성형 AI·바이브코딩을 현장 눈높이로 가르치고, 강의 뒤에 기관 안에서 돌아가는 구조를 남깁니다.',
    link: { href: '#programs', label: '의뢰 가능한 프로그램' },
  },
  {
    key: 'consult',
    what: '단계 진단',
    no: '03',
    place: '컨설팅룸',
    title: '우리 기관은 지금 어느 단계에 있을까',
    body: '입문·실무 심화·구축 운영 중 어디서 시작할지 함께 진단합니다. 한 기관과 강의에서 구축까지 3년을 이어간 경험이 있습니다.',
    link: { href: '#services', label: '진단표 보기' },
  },
  {
    key: 'lab',
    what: '구축 사례',
    no: '04',
    place: '빌드랩',
    title: '설명이 아니라 실제로 만든 것',
    body: '행사 운영, 회의·소통, 업무 효율화, 캠페인 도구. 현장에 투입된 시스템과 바로 써 볼 수 있는 도구들입니다.',
    link: { href: '#portfolio', label: '만든 것 보기' },
  },
  {
    key: 'archive',
    what: '기록·노트',
    no: '05',
    place: '아카이브',
    title: '현장 기록과 실무 노트',
    body: '다녀온 현장과 해 본 일을 글로 남깁니다. 초고와 교열, 회의록 정리는 AI 에이전트가 거들고, 최종 판단은 고석우가 합니다.',
    link: { href: '#notes', label: '실무 노트 읽기' },
  },
  {
    key: 'mission',
    what: 'AI 운영 구조',
    no: '06',
    place: '미션컨트롤',
    title: 'AI 에이전트 열을 이렇게 움직입니다',
    body: '요청은 초원 실장 한 곳으로 받고, 일의 성격에 따라 각 AI 에이전트에게 나눠 보냅니다. 바깥으로 내보내면 안 되는 자료는 이 기기 안에서만 다룹니다. 고석우 대표가 이곳에서 일합니다.',
    link: { href: '#portfolio', label: 'AI 시스템 사례 보기' },
  },
  {
    key: 'lounge',
    what: '문의·상담',
    no: '07',
    place: '컨택 라운지',
    title: '주제가 정해지지 않아도 괜찮습니다',
    body: '강의·컨설팅·구축 문의를 남기시면 영업일 기준 2일 안에 맞는 구성으로 회신드립니다.',
    link: { href: '/contact', label: '문의하기' },
  },
];
