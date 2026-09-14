# CARPEDM 홈페이지 (Vercel) — Cloudflare Workers 방식

이 저장소는 **홈페이지만** 담당합니다. 단축 링크(`/ax`, `/climb` 등)는
별도의 `carpedm-worker` 프로젝트가 Cloudflare 에서 처리합니다.

```
carpedm.kr/        → Cloudflare Worker → (통과) → 여기(Vercel)가 홈페이지를 보여줌
carpedm.kr/admin   → Cloudflare Worker → (통과) → 여기(Vercel)가 관리자 화면을 보여줌
carpedm.kr/ax      → Cloudflare Worker → KV 조회 → 302 이동 (여기까지 오지 않음)
```

관리자 화면(`app/admin/page.jsx`)은 `/_api/links` 로 요청을 보내는데,
이 주소는 Vercel 이 아니라 **Cloudflare Worker 가 가로채서 응답**합니다.
(Worker 쪽 라우팅에 `/_api/links` 를 통과시키지 않도록 이미 설정되어 있습니다.)

---

## 이 저장소에 없는 것

아래는 구글 시트 방식에서 쓰던 파일로, Cloudflare Workers 방식에서는 필요 없어 뺐습니다.

- `app/[slug]/route.js` — Worker 가 대신 처리
- `app/api/links/route.js` — Worker 의 `/_api/links` 가 대신 처리
- `lib/links.js` — 구글 시트 연동 코드, 불필요
- `apps-script/Code.gs` — 구글 시트 연동 코드, 불필요

---

## 배포 순서

### 1. 깃허브에 올리기

```bash
git init
git add .
git commit -m "carpedm 홈페이지 (Cloudflare Workers 방식)"
git branch -M main
git remote add origin https://github.com/<내아이디>/carpedm-site.git
git push -u origin main
```

### 2. Vercel에 연결

1. vercel.com → **Add New → Project** → 이 저장소 Import
2. Framework 는 Next.js 자동 인식, 건드릴 것 없음
3. **환경변수는 필요 없습니다.** (구글 시트 안 쓰므로)
4. Deploy

이 시점에 `carpedm-site.vercel.app` 임시 주소로 홈페이지가 뜹니다.
`/admin` 을 열어보면 비밀번호 입력창까지는 나오지만, 아직 Worker 를
안 붙였으니 로그인은 안 됩니다. 정상입니다.

### 3. carpedm.kr 도메인 연결

Vercel **Settings → Domains** 에 `carpedm.kr` 추가.
(Cloudflare 를 이미 DNS 앞단에 두셨다면, Vercel 이 알려주는 값이 이미
Cloudflare DNS 레코드와 같은지만 확인하시면 됩니다.)

### 4. Cloudflare Worker 배포

별도로 드린 `carpedm-worker` 프로젝트의 README 를 따라 진행하세요.
이 저장소는 여기까지가 할 일입니다.

---

## 확인 방법

| 확인할 것 | 방법 |
|---|---|
| 홈페이지가 뜨는가 | `carpedm.kr` 접속 |
| 관리자 화면이 뜨는가 (로그인은 아직 안 돼도 됨) | `carpedm.kr/admin` 접속 |
| 단축 링크가 작동하는가 | Worker 배포 후에만 확인 가능 |
