// 융중 작전도에 세우는 AI 장수 10명.
// 이름·자·내력은 각 에이전트 워크스페이스의 IDENTITY.md, 모델은 에이전트 이름 대조표를 따릅니다.
// 그림은 public/agents/<id>.png (배경 투명).

export const AGENTS = {
  main: {
    emoji: '🪶', name: '제갈량', style: '공명',
    role: '배분·종합', model: 'Claude Sonnet 5',
    greet: '어서 오십시오. 융중 마을을 안내하겠습니다. 길을 따라 진영을 하나씩 둘러보시지요.',
    desc: '요청을 받아 누구에게 무엇을 맡길지 정하고, 돌아온 결과를 하나로 엮어 내놓습니다. 대부분의 일은 남을 부르지 않고 직접 끝냅니다.',
  },
  developer: {
    emoji: '🔨', name: '조운', style: '자룡',
    role: '코딩·디버깅', model: 'GPT-5.6',
    greet: '만들 것이 있으면 말씀만 하십시오. 공방에서 끝내 가지고 나오겠습니다.',
    desc: '장판파에서 홀로 대군 속으로 들어가 맡은 것을 안고 나왔습니다. 떠들지 않고 결과로 말합니다.',
  },
  critic: {
    emoji: '🧐', name: '사마의', style: '중달',
    role: '비평·전략 검토', model: 'Claude Opus 5',
    greet: '좋다는 말은 끝까지 읽고 나서 하겠습니다.',
    desc: '상대의 수를 끝까지 읽고, 허점이 드러나기 전에는 성문을 열지 않습니다. 칭찬에 인색합니다.',
  },
  researcher: {
    emoji: '🔍', name: '서서', style: '원직',
    role: '조사·자료 읽기', model: 'Claude Sonnet 5',
    greet: '자료는 제가 찾아오겠습니다. 판단은 군사께서 하십시오.',
    desc: '형세를 읽어다 바치고, 답을 대신 내기보다 맞는 사람을 천거합니다. 말은 적고 집요합니다.',
  },
  writer: {
    emoji: '✍️', name: '주유', style: '공근',
    role: '초고 집필', model: 'Claude Sonnet 5',
    greet: '초고는 제가 씁니다. 다만 겪지 않은 일은 쓰지 않습니다.',
    desc: '음률에 밝아 한 가락만 어긋나도 알아챘습니다. 남의 목소리로 쓸 때도 그 귀를 씁니다.',
  },
  editor: {
    emoji: '📕', name: '관우', style: '운장',
    role: '교열', model: 'GPT-5.6',
    greet: '어긋난 문장은 누가 썼든 고칩니다.',
    desc: '진중에서도 춘추를 놓지 않았습니다. 어긋난 문장은 누가 썼든 봐주지 않습니다.',
  },
  trainer: {
    emoji: '🎓', name: '유비', style: '현덕',
    role: '강의안·교안', model: 'Claude Sonnet 5',
    greet: '어려운 말은 쉽게, 쉬운 말은 깊게. 강의 진영에 오신 것을 환영합니다.',
    desc: '어려운 말로 누르지 않고 듣는 사람 눈높이에서 말했습니다. 강의가 하는 일이 그것입니다.',
  },
  minutes: {
    emoji: '📝', name: '방통', style: '사원',
    role: '회의록 초안', model: 'Claude Sonnet 5',
    greet: '회의에서 나온 말만 적습니다. 나오지 않은 말은 적지 않습니다.',
    desc: '백 일 밀린 송사를 한나절에 막힘없이 처리했습니다. 듣고 가려 적는 일이 빠릅니다.',
  },
  brief: {
    emoji: '📨', name: '노숙', style: '자경',
    role: '요약', model: '로컬 Gemma',
    greet: '긴 말은 줄이고, 전할 말만 전하겠습니다.',
    desc: '오와 촉 사이를 오가며 양쪽 말을 다 듣고, 추려서 전할 말만 전했습니다.',
  },
  local: {
    emoji: '🔒', name: '장료', style: '문원',
    role: '로컬 전용 처리', model: '로컬 Gemma',
    greet: '이 성문 안의 자료는 바깥으로 나가지 않습니다.',
    desc: '합비 성문을 지켜냈습니다. 바깥으로 내보내면 안 되는 자료는 이 기기 안에서만 다룹니다.',
  },
};

// 두루마리 지도 위 진영. 스크롤하면 왼쪽에서 오른쪽으로 차례로 지나갑니다.
export const CAMPS = [
  {
    key: 'chorye',
    no: '壹',
    place: '융중 초려',
    title: '사회복지 현장의 작전도를 펼칩니다',
    body: '강의, 도구, 기록, AI 팀까지. 현장의 문제를 작동하는 도구로 바꿔 온 길을 두루마리 한 장에 담았습니다. 아래로 내리면 지도가 펼쳐집니다.',
    image: '/illust/kraft-02.webp',
    imageAlt: '크래프트지 위 디지털 작업 공간에 앉아 있는 고석우',
    agents: ['main'],
    link: { href: '#speaker', label: '강사 소개 보기' },
  },
  {
    key: 'lecture',
    no: '貳',
    place: '강의 진영',
    title: '입문에서 구축까지, 강의와 컨설팅',
    body: '스마트워크·생성형 AI·바이브코딩을 현장 눈높이로 가르치고, 강의 뒤에 기관 안에서 돌아가는 구조를 남깁니다.',
    agents: ['trainer', 'researcher'],
    link: { href: '#programs', label: '의뢰 가능한 프로그램' },
  },
  {
    key: 'workshop',
    no: '參',
    place: '공방',
    title: '설명이 아니라 실제로 만든 것',
    body: '행사 운영, 회의·소통, 업무 효율화, 캠페인 도구. 현장에 투입된 시스템과 바로 써 볼 수 있는 도구들입니다.',
    agents: ['developer', 'critic'],
    link: { href: '#portfolio', label: '만든 것 보기' },
  },
  {
    key: 'library',
    no: '肆',
    place: '서고',
    title: '현장 기록과 실무 노트',
    body: '다녀온 현장과 해 본 일을 글로 남깁니다. 초고와 교열, 회의록 정리를 장수들과 나눠 맡습니다.',
    agents: ['writer', 'editor', 'minutes'],
    link: { href: '#notes', label: '실무 노트 읽기' },
  },
  {
    key: 'gate',
    no: '伍',
    place: '성문',
    title: '장수 열 명을 이렇게 부립니다',
    body: '요청은 제갈량 한 곳으로 받고, 일의 성격에 따라 장수를 나눠 보냅니다. 바깥에 내보내면 안 되는 자료는 장료가 이 기기 안에서만 다룹니다.',
    agents: ['brief', 'local'],
    link: { href: '#portfolio', label: 'AI 시스템 사례 보기' },
    roster: true,
  },
  {
    key: 'beacon',
    no: '陸',
    place: '봉화대',
    title: '일정과 인원만 알려 주세요',
    body: '강의·컨설팅·구축 문의를 남기시면 영업일 기준 2일 안에 맞는 구성으로 회신드립니다.',
    agents: [],
    link: { href: '/contact', label: '문의하기' },
  },
];
