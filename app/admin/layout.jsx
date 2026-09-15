export const metadata = {
  title: '링크 관리 — CARPEDM',
  // 관리자 화면은 검색엔진에 나오지 않게 합니다.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
