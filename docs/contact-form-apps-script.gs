/**
 * CARPEDM 문의폼 → 스프레드시트 '강의 문의' 저장 + 메일 알림
 *
 * 붙이는 곳: 스프레드시트 1q4ulu2tv8sKWWJi6vLMwm_13M6jpLZTs7uzjcWJammE
 *   확장 프로그램 → Apps Script → 이 파일 내용 붙이기 → 배포 → 새 배포 → 웹 앱
 *   실행 계정: 나 / 액세스 권한: 모든 사용자(익명 포함)
 *
 * 스크립트 속성(프로젝트 설정 → 스크립트 속성)에 아래 두 개를 넣습니다.
 *   SHARED_SECRET  임의의 긴 문자열 (Vercel 의 CONTACT_SECRET 과 같아야 함)
 *   ADMIN_EMAIL    알림 받을 주소 (비우면 스크립트 소유자 메일)
 *
 * 처음 doPost 가 실행될 때 '문의' 시트와 헤더를 자동으로 만듭니다.
 */

var SHEET_NAME = '문의';
var HEADERS = [
  '접수일시', '접수번호', '상태', '문의유형', '관심프로그램',
  '기관명', '담당자', '연락처', '이메일',
  '희망일정', '예상인원', '진행방식', '문의내용',
  '개인정보동의', '유입페이지', '브라우저', '메모',
];

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('SHARED_SECRET');

  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }
  if (!secret || body.secret !== secret) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_();
    var received = body.receivedAt ? new Date(body.receivedAt) : new Date();
    var id = body.id || makeId_(received);
    var program = body.programTitle || (body.program ? body.program : '미정');

    sheet.appendRow([
      received,                  // 접수일시 (시트 시간대 = 서울)
      id,
      '신규',
      body.type || '',
      program,
      body.org || '',
      body.name || '',
      String(body.phone || ''),
      body.email || '',
      body.schedule || '',
      body.headcount || '',
      body.method || '',
      body.message || '',
      body.consent ? 'Y' : 'N',
      body.page || '',
      body.ua || '',
      '',
    ]);

    // 접수번호 셀은 텍스트로, 연락처는 앞의 0 이 사라지지 않게 텍스트 서식
    var last = sheet.getLastRow();
    sheet.getRange(last, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    sheet.getRange(last, 8).setNumberFormat('@');

    notifyAdmin_(body, id, received);
    autoReply_(body, id);

    return json_({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

// 브라우저에서 URL 을 직접 열었을 때 상태 확인용
function doGet() {
  return json_({ ok: true, service: 'carpedm-contact', sheet: SHEET_NAME });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var head = sheet.getRange(1, 1, 1, HEADERS.length);
    head.setFontWeight('bold').setBackground('#EEF3E7');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADERS.length, 120);
    sheet.setColumnWidth(13, 360); // 문의내용
    // 상태 열 드롭다운: 신규 → 확인 → 회신 → 확정 → 완료 / 보류
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['신규', '확인', '회신', '확정', '완료', '보류'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 3, 1000, 1).setDataValidation(rule);
  }
  return sheet;
}

function makeId_(d) {
  var ymd = Utilities.formatDate(d, 'Asia/Seoul', 'yyMMdd');
  var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'CD-' + ymd + '-' + rand;
}

function adminEmail_() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('ADMIN_EMAIL') || Session.getEffectiveUser().getEmail();
}

function notifyAdmin_(b, id, received) {
  var to = adminEmail_();
  if (!to) return;
  var subject = '[강의 문의] ' + (b.org || '기관 미기재') + ' · ' + (b.type || '') +
    (b.programTitle ? ' · ' + b.programTitle : '') + ' (' + id + ')';
  var lines = [
    '접수번호: ' + id,
    '접수일시: ' + Utilities.formatDate(received, 'Asia/Seoul', 'yyyy-MM-dd HH:mm'),
    '',
    '문의 유형: ' + (b.type || ''),
    '관심 프로그램: ' + (b.programTitle || '미정'),
    '기관명: ' + (b.org || ''),
    '담당자: ' + (b.name || ''),
    '연락처: ' + (b.phone || ''),
    '이메일: ' + (b.email || ''),
    '희망 일정: ' + (b.schedule || '미정'),
    '예상 인원: ' + (b.headcount || ''),
    '진행 방식: ' + (b.method || ''),
    '',
    '[문의 내용]',
    b.message || '',
    '',
    '시트: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    '유입: ' + (b.page || ''),
  ];
  MailApp.sendEmail({
    to: to,
    replyTo: b.email || undefined,
    subject: subject,
    body: lines.join('\n'),
    name: 'CARPEDM 문의 접수',
  });
}

function autoReply_(b, id) {
  if (!b.email) return;
  var subject = '[CARPEDM] 문의가 접수되었습니다 (' + id + ')';
  var body = [
    (b.name || '담당자') + '님, 안녕하세요. 고석우입니다.',
    '',
    (b.org || '') + '의 ' + (b.type || '문의') + ' 문의가 접수되었습니다.',
    '내용을 확인한 뒤 영업일 기준 2일 안에 회신드리겠습니다.',
    '',
    '접수번호: ' + id,
    '문의 유형: ' + (b.type || ''),
    '관심 프로그램: ' + (b.programTitle || '미정'),
    '희망 일정: ' + (b.schedule || '미정'),
    '예상 인원: ' + (b.headcount || '미정') + ' / 진행 방식: ' + (b.method || '미정'),
    '',
    '문의 내용:',
    b.message || '',
    '',
    '강사 프로필 PDF와 공문용 소개문은 아래에서 바로 받으실 수 있습니다.',
    'https://www.carpedm.kr/#speaker-kit',
    '',
    '급한 일정이면 이 메일에 바로 회신해 주세요.',
    '',
    '고석우 · 서울특별시사회복지사협회 과장 · 열매똑똑 스마트워크 사업 담당',
    'https://www.carpedm.kr',
  ].join('\n');
  MailApp.sendEmail({
    to: b.email,
    replyTo: adminEmail_(),
    subject: subject,
    body: body,
    name: 'CARPEDM 고석우',
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 에디터에서 한 번 실행해 시트·헤더를 미리 만들고 권한을 승인해 둡니다. */
function setup() {
  getSheet_();
  Logger.log('ready: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
}
