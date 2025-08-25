import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>404 - 페이지를 찾을 수 없습니다</h1>
      <p>요청하신 페이지를 찾을 수 없습니다. 주소를 다시 확인해주세요.</p>
      <Link href="/">홈으로 돌아가기</Link>
    </div>
  );
}
