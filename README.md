# OTA (Over-The-Air) System

ESP8266 장치의 펌웨어를 무선으로 업데이트하고, 백엔드와 웹 대시보드에서 장치 상태를 관리하기 위한 풀스택 프로젝트입니다.

## 주요 기능

- ESP8266 장치의 펌웨어 OTA 업데이트
- MQTT 기반 펌웨어와 백엔드 간 통신
- 펌웨어 파일 업로드 및 장치별 배포 관리
- 웹 대시보드에서 장치 연결 상태와 펌웨어 버전 확인
- Socket\.IO를 이용한 실시간 상태 업데이트

## 시연 영상

OTA 시스템의 전체 동작 과정은 아래 영상에서 확인할 수 있습니다.

<!-- 실제 시연 영상 링크와 썸네일을 준비한 뒤 아래 내용을 추가합니다.
[![OTA 시스템 시연 영상](./docs/demo-thumbnail.png)](시연_영상_URL)
1. 웹 대시보드에서 펌웨어 배포
2. 백엔드가 MQTT로 장치에 업데이트 명령 전달
3. ESP8266이 펌웨어 다운로드 및 업데이트
4. 장치 상태와 버전이 대시보드에 반영
-->

## 시스템 구성

```text
OTA/
├── backend/ota/     # NestJS API 및 MQTT 마이크로서비스
├── frontend/ota/    # Vue 관리자 웹 애플리케이션
└── firmware/ota/    # ESP8266 PlatformIO 펌웨어
```

### 동작 개요

```text
ESP8266 펌웨어 <-- HTTP / MQTT --> NestJS 백엔드 <-- HTTP / Socket\.IO --> Vue 대시보드
                                      └── MySQL (TypeORM)
```

## 개발 환경

- NestJS 11, Vue 3, PlatformIO
- ESP8266 D1
- MQTT 브로커(XXXX), Socket\.IO
- MySQL(TypeORM)


## 기술 스택 및 주요 버전

| 영역 | 기술 |
| --- | --- |
| Firmware | C++, PlatformIO, ESP8266 |
| Backend | NestJS 11, TypeScript, MQTT, Socket\.IO, TypeORM, MySQL |
| Frontend | Vue 3, Bootstrap, Axios, Socket\.IO Client |

## 시작하기

각 영역은 독립적인 NestJS, PlatformIO, Vue 프로젝트입니다. 각각의 저장소에서 아래 명령을 실행합니다.

### 프로젝트 환경 설정

#### 백엔드

| 변수 | 설명 |
| --- | --- |
| `MQTT_BROKER` | 백엔드에서 연결할 MQTT 브로커 주소 |

예시:

```bash
MQTT_BROKER=mqtt://localhost:1883
```

#### 프론트엔드

| 변수 | 설명 |
| --- | --- |
| `BACKENDHOSTNAME` | HTTP 프록시의 백엔드 호스트 |
| `BACKENDPORT` | HTTP 프록시의 백엔드 포트 |
| `VUE_APP_SOCKET_HOSTNAME` | Socket.IO 호스트 |
| `VUE_APP_SOCKET_PORT` | Socket.IO 포트 |

예시:

```bash
BACKENDHOSTNAME=localhost
BACKENDPORT=3000
VUE_APP_SOCKET_HOSTNAME=localhost
VUE_APP_SOCKET_PORT=3000
```

#### 펌웨어

펌웨어는 운영체제 환경 변수 대신 `firmware/ota/src/arduino_secrets.h` 파일에서 Wi-Fi, MQTT, 백엔드 연결 정보와 암호화 키를 설정합니다. 이 파일은 `.gitignore`에 등록되어 있으므로 로컬에서 직접 생성해야 합니다.

```cpp
#define SECRET_SSID "your-wifi-ssid"
#define SECRET_PASS "your-wifi-password"
#define MQTT_URL "mqtt://your-mqtt-broker"
#define MQTT_PORT 1883
#define BACK_URL "http://your-backend-host:3000"

const uint8_t secretKey[] = { /* encryption key */ };
```

### 1. 백엔드

```bash
cd backend/ota
npm install
npm run start:dev
```

백엔드는 기본적으로 `3000` 포트에서 실행됩니다. 운영 환경에서는 데이터베이스 연결 정보 등 애플리케이션에서 요구하는 환경 변수를 함께 설정해야 합니다.

### 2. 프론트엔드

```bash
cd frontend/ota
npm install
npm run serve
```

프론트엔드는 기본적으로 `8080` 포트에서 실행됩니다. 포트를 변경하려면 `frontend/ota/vue.config.js`의 `devServer`에 `port` 옵션을 추가합니다.

```js
module.exports = defineConfig({
  devServer: {
    port: 8081,
  },
});

```

### 3. 펌웨어


```bash
cd firmware/ota
pio run
pio run -t upload
pio device monitor
```

펌웨어 의존성은 아래와 같습니다.

- `knolleary/PubSubClient` - MQTT 통신
- `rweather/Crypto` - 암호화 기능


펌웨어는 ESP8266 D1 보드와 115200 baud 시리얼 모니터를 사용합니다. 업로드 포트가 다른 경우 `firmware/ota/platformio.ini`의 `upload_port` 값을 연결된 포트에 맞게 변경합니다.

### 4. 데이터베이스
<!-- 수정 예정 -->
MySQL를 사용하며, Docker에서 실행할 수 있습니다.  

- 데이터베이스: MySQL
- 배포 방식: Docker
- 참조 이미지: [`asme12/projectdb`](https://hub.docker.com/repository/docker/asme12/projectdb)


## 주요 디렉터리

```text
backend/ota/src/
├── firmware/   # 펌웨어 관련 백엔드 기능
├── file/       # 파일 처리
├── mcu/        # 장치 및 MCU 기능
├── mqtt/       # MQTT 통신
├── socket/     # 실시간 통신
└── state/      # 상태 관리

firmware/ota/src/
├── controller/ # 장치 제어
├── network/    # 네트워크 통신
├── update/     # OTA 업데이트
├── crypto/     # 암호화
└── state/      # 장치 상태
```
