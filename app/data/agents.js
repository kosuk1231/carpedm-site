// CARPEDM 캠퍼스의 팀원: 사람 5 + 로봇 5, 그리고 미션컨트롤의 대표.
// 키는 OpenClaw 에이전트 id 와 같습니다(ceo 는 에이전트가 아니라 고석우 대표 본인).
// kind: 'human' | 'robot'. 카드 그림은 public/agents/<id>.png 가 있으면 씁니다(img: true).

export const AGENTS = {
  main: {
    emoji: '🧭', name: '초원 실장', kind: 'human', title: '실장', img: '/agents/main.png',
    role: '배분·종합',
    greet: '어서 오세요. 캠퍼스 안내는 제가 맡습니다. 어디부터 둘러보시겠어요?',
    desc: '요청을 받아 누구에게 무엇을 맡길지 정하고, 돌아온 결과를 하나로 엮어 내놓습니다. 대부분의 일은 남에게 넘기지 않고 직접 끝냅니다.',
  },
  developer: {
    emoji: '🔨', name: '뚝딱봇', kind: 'robot', title: '빌드 로봇', img: '/agents/developer.png',
    role: '코딩·디버깅',
    greet: '뚝딱. 만들 게 있으면 말씀만 하세요. 빌드랩에서 끝내 가지고 나옵니다.',
    desc: '말보다 결과로 보여 주는 작업 로봇입니다. 공구 팔로 도구를 만들고, 고장 난 곳을 찾아 고칩니다.',
  },
  critic: {
    emoji: '🧐', name: '서진 수석', kind: 'human', title: '수석 리뷰어', img: '/agents/critic.png',
    role: '비평·전략 검토',
    greet: '좋다는 말은 끝까지 읽고 나서 하겠습니다.',
    desc: '계획과 결과물을 끝까지 읽고, 허점이 보이면 먼저 짚습니다. 칭찬에 인색한 대신 놓치는 게 없습니다.',
  },
  researcher: {
    emoji: '🔍', name: '서치봇', kind: 'robot', title: '조사 드론', img: '/agents/researcher.png',
    role: '조사·자료 읽기',
    greet: '자료는 제가 찾아오겠습니다. 판단은 사람이 하시고요.',
    desc: '흩어진 자료를 찾아 날아오는 드론입니다. 답을 대신 내기보다 판단에 필요한 근거를 모아 옵니다.',
  },
  writer: {
    emoji: '✍️', name: '은설 작가', kind: 'human', title: '작가', img: '/agents/writer.png',
    role: '초고 집필',
    greet: '초고는 제가 씁니다. 겪지 않은 일은 쓰지 않아요.',
    desc: '주어진 재료 안에서 초고를 씁니다. 저자의 목소리를 흉내 내되 저자를 대신하지 않습니다.',
  },
  editor: {
    emoji: '📕', name: '교정봇', kind: 'robot', title: '교열 로봇', img: '/agents/editor.png',
    role: '교열',
    greet: '어긋난 문장은 누가 썼든 빨간 펜으로 고칩니다.',
    desc: '맞춤법과 문장 흐름을 다듬는 로봇입니다. 원칙에서 물러서지 않지만, 고집이 지나치지 않게 스스로 경계합니다.',
  },
  trainer: {
    emoji: '🎓', name: '은채 코치', kind: 'human', title: '코치', img: '/agents/trainer.png',
    role: '강의안·교안',
    greet: '어려운 말은 쉽게, 쉬운 말은 깊게. 아카데미에 오신 걸 환영해요.',
    desc: '듣는 사람 눈높이에서 강의안과 교안을 짭니다. 용어보다 현장의 상황을 먼저 이야기합니다.',
  },
  minutes: {
    emoji: '📝', name: '메모봇', kind: 'robot', title: '기록 로봇', img: '/agents/minutes.png',
    role: '회의록 초안',
    greet: '회의에서 나온 말만 적습니다. 나오지 않은 말은 적지 않습니다.',
    desc: '회의를 듣고 기록을 뽑아내는 로봇입니다. 알아듣기 어려운 대목은 채우지 않고 확인할 곳으로 표시해 둡니다.',
  },
  brief: {
    emoji: '📨', name: '한결 매니저', kind: 'human', title: '매니저', img: '/agents/brief.png',
    role: '요약·전달',
    greet: '먼 길 오셨어요. 광장에서 길이 갈라지니 가실 곳을 골라 보세요.',
    desc: '긴 내용을 추려 꼭 전할 말만 전합니다. 손님을 맞고 팀 사이를 오가며 소식을 잇습니다.',
  },
  local: {
    emoji: '🔒', name: '지킴이', kind: 'robot', title: '환영 로봇', img: '/agents/dir/local-0.webp',
    role: '로컬 전용 처리',
    greet: '반가워요! CARPEDM 캠퍼스에 오신 걸 환영해요. 방문증 여기 있어요.',
    desc: '정문에서 손님을 가장 먼저 반기는 환영 로봇입니다. 손님 이야기는 반갑게 듣고, 바깥으로 내보내면 안 되는 자료는 이 기기 안에서만 소중히 다룹니다.',
  },
  ceo: {
    emoji: '☕', name: '고석우 대표', kind: 'human', title: '대표', notAgent: true, img: '/profile/kosukwoo-portrait.webp',
    role: '강의·컨설팅·구축',
    greet: '끝까지 와 주셨네요. 커피 한 잔 하면서 기관 이야기 들려주세요.',
    desc: '사회복지 현장에서 일하다 스마트워크·AI 전환을 맡게 됐습니다. 강의로 시작해 컨설팅과 시스템 구축까지 한 흐름으로 이어서 맡습니다.',
  },
};

// 캠퍼스 건물. 정문에서 시작해 걷는 순서대로 번호를 붙였습니다. 입구에 서면 이 내용이 열립니다.
export const CAMPS = [
  {
    key: 'gate',
    no: '01',
    place: '웰컴 게이트',
    title: 'CARPEDM 캠퍼스에 오신 것을 환영합니다',
    body: '사회복지 현장의 스마트워크·AI 전환을 강의하고, 컨설팅하고, 직접 만들어 온 팀입니다. 광장에서 길이 갈라집니다. 서쪽 아카데미, 북쪽 컨설팅룸과 미션컨트롤, 북동쪽 빌드랩, 동쪽 아카이브, 남동쪽 컨택 라운지로 이어집니다.',
    agents: ['local', 'brief'],
    link: { href: '#speaker', label: '강사 소개 먼저 보기' },
  },
  {
    key: 'academy',
    no: '02',
    place: '아카데미',
    title: '입문에서 구축까지, 강의',
    body: '스마트워크·생성형 AI·바이브코딩을 현장 눈높이로 가르치고, 강의 뒤에 기관 안에서 돌아가는 구조를 남깁니다.',
    agents: ['trainer', 'researcher'],
    link: { href: '#programs', label: '의뢰 가능한 프로그램' },
  },
  {
    key: 'consult',
    no: '03',
    place: '컨설팅룸',
    title: '우리 기관은 지금 어느 칸에 있을까',
    body: '입문·실무 심화·구축 운영 중 어디서 시작할지 함께 진단합니다. 한 기관과 강의에서 구축까지 3년을 이어간 경험이 있습니다.',
    agents: ['critic'],
    link: { href: '#services', label: '진단표 보기' },
  },
  {
    key: 'lab',
    no: '04',
    place: '빌드랩',
    title: '설명이 아니라 실제로 만든 것',
    body: '행사 운영, 회의·소통, 업무 효율화, 캠페인 도구. 현장에 투입된 시스템과 바로 써 볼 수 있는 도구들입니다.',
    agents: ['developer', 'minutes'],
    link: { href: '#portfolio', label: '만든 것 보기' },
  },
  {
    key: 'archive',
    no: '05',
    place: '아카이브',
    title: '현장 기록과 실무 노트',
    body: '다녀온 현장과 해 본 일을 글로 남깁니다. 초고와 교열, 회의록 정리를 팀원들과 나눠 맡습니다.',
    agents: ['writer', 'editor'],
    link: { href: '#notes', label: '실무 노트 읽기' },
  },
  {
    key: 'mission',
    no: '06',
    place: '미션컨트롤',
    title: 'AI 팀원 열 명을 이렇게 움직입니다',
    body: '요청은 초원 실장 한 곳으로 받고, 일의 성격에 따라 팀원에게 나눠 보냅니다. 바깥으로 내보내면 안 되는 자료는 이 기기 안에서만 다룹니다. 고석우 대표가 이곳에서 일합니다.',
    agents: ['main', 'ceo'],
    link: { href: '#portfolio', label: 'AI 시스템 사례 보기' },
  },
  {
    key: 'lounge',
    no: '07',
    place: '컨택 라운지',
    title: '일정과 인원만 알려 주세요',
    body: '강의·컨설팅·구축 문의를 남기시면 영업일 기준 2일 안에 맞는 구성으로 회신드립니다.',
    agents: [],
    link: { href: '/contact', label: '문의하기' },
  },
];
