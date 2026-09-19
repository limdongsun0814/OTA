# 🚀 OTA (Over-The-Air) System

---

- **Firmware:** C++, [PlatformIO](https://platformio.org/), ESP8266
- **Backend:** NestJS
- **Frontend:** Vue
- **Environment:** VS Code, Git

# ✨ 소개

---

이 프로젝트는 펌웨어 배포 및 모니터링하기 위한 **통합 풀스택 플랫폼**입니다.

## ✨ 핵심 구현 기능

1. 펌웨어 무선 업데이트 (OTA) 로직 제어
   기기 부팅 및 주기적 폴링을 통한 최신 펌웨어 버전 체크 기능.

네트워크 끊김을 대비한 스트리밍 방식의 바이너리 다운로드 및 안정적인 플래시 메모리 라이팅 프로토콜 구현.

2. 중앙 집중식 배포 관리 백엔드 API
   새로운 펌웨어 파일(.bin) 업로드 및 메타데이터(버전, 하드웨어 호환성) 관리.

기기별 현재 버전을 확인하고 타겟 버전을 안전하게 서빙하는 무결성 검증 API 설계.

3. 실시간 모니터링 관리자 웹 대시보드
   전체 디바이스의 연결 상태 및 현재 구동 중인 펌웨어 버전 분포 시각화.

새로운 버전 배포 프로세스를 GUI 환경에서 제어할 수 있는 관리자 화면 구축.

---

## 🧠 Technical Challenges & Troubleshooting

# 💡 [PlatformIO 마이그레이션을 통한 생산성 향상]

문제점: 기존 Arduino IDE 환경에서는 라이브러리 의존성 관리 및 빌드 환경(개발/운영) 분리가 어려워 코드 형상 관리에 비효율성이 존재했습니다.

해결책: 프로젝트를 PlatformIO 환경으로 마이그레이션하여 platformio.ini를 통한 선언적 의존성 관리를 구축했습니다. 이를 통해 빌드 속도를 개선하고 향후 펌웨어 CI/CD(자동 빌드/배포) 파이프라인을 도입할 수 있는 확장성을 확보했습니다.

(※ 개발 중 겪으신 통신 에러 처리, 예외 처리, 메모리 최적화 등의 경험을 이곳에 기술서 형태로 추가하면 포트폴리오 효과가 극대화됩니다!)

## 🚀 Getting Started

Prerequisites

- PlatformIO IDE (VS Code Extension)

- Node.js vXX.XX / npm

Installation & Run

```bash
# Backend 실행
cd backend/ota
npm install
npm start
```

```bash
# Frontend 실행
cd frontend/ota
npm install
npm run dev
```
