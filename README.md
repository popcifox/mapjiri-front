# Mapjiri Frontend

Mapjiri는 음식점 검색 및 리뷰 서비스를 제공하는 웹 애플리케이션입니다.

## 📋 프로젝트 개요

Mapjiri는 사용자가 위치 기반으로 음식점을 검색하고, 리뷰를 작성하며, 즐겨찾기를 관리할 수 있는 종합적인 음식점 검색 플랫폼입니다.

## ✨ 주요 기능

### 🔍 음식점 검색
- **키워드 검색**: 구/동 단위로 지역을 선택하고 음식 카테고리별 검색
- **주변 전체 음식점**: 현재 위치 기반 주변 음식점 검색
- **위치+음식 검색**: 위치와 음식 카테고리를 조합한 정확한 검색

### ⭐ 즐겨찾기 시스템
- **장소 즐겨찾기**: 자주 방문하는 음식점 저장
- **메뉴 즐겨찾기**: 선호하는 음식 메뉴 저장
- **아코디언 형태**: 깔끔한 UI로 즐겨찾기 관리

### 🗺️ 지도 서비스
- **Kakao Maps API** 연동
- **실시간 검색 결과** 지도에 마커로 표시
- **검색 결과 리스트**와 지도 연동

### 👤 사용자 관리
- **회원가입**: 이메일 인증을 통한 가입
- **로그인/로그아웃**: JWT 토큰 기반 인증
- **사용자 프로필**: 닉네임 관리

### 📝 리뷰 시스템
- **음식점 리뷰**: 사용자 경험 공유
- **리뷰 목록**: 가게별 리뷰 모음

### 📊 실시간 랭킹
- **키워드 랭킹**: 인기 검색어 실시간 표시

## 🏗️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인 및 모던 UI
- **JavaScript (ES6+)**: 동적 기능 구현
- **Kakao Maps API**: 지도 서비스

### Backend 연동
- **RESTful API**: `https://mapjiri.site` 백엔드 서버와 통신
- **JWT 인증**: Bearer 토큰 기반 보안
- **Fetch API**: 비동기 데이터 통신

## 📁 프로젝트 구조

```
mapjiri-front/
├── public/
│   ├── index.html          # 메인 페이지 (음식점 검색)
│   ├── login.html          # 로그인 페이지
│   ├── register.html       # 회원가입 페이지
│   ├── review.html         # 리뷰 페이지
│   └── src/
│       ├── css/
│       │   ├── styles.css          # 메인 스타일
│       │   ├── loginStyles.css     # 로그인 스타일
│       │   ├── registerStyles.css  # 회원가입 스타일
│       │   └── review.css          # 리뷰 스타일
│       └── js/
│           ├── main.js             # 메인 기능 (검색, 지도)
│           ├── login.js            # 로그인 로직
│           ├── register.js         # 회원가입 로직
│           └── review.js           # 리뷰 관리
└── README.md
```

## 🚀 시작하기

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd mapjiri-front
```

### 2. 웹 서버 실행
프로젝트는 정적 파일로 구성되어 있어 간단한 웹 서버만 있으면 실행 가능합니다.

**Python을 사용하는 경우:**
```bash
cd public
python -m http.server 8000
```

**Node.js를 사용하는 경우:**
```bash
npm install -g http-server
cd public
http-server -p 8000
```

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## 🔧 주요 API 엔드포인트

### 위치 관련
- `GET /api/v1/locations/gu` - 구 목록 조회
- `GET /api/v1/locations/dong?gu={gu}` - 동 목록 조회

### 음식 메뉴
- `GET /api/v1/menu/type` - 음식 카테고리 조회
- `GET /api/v1/menu/subcategory?type={type}` - 음식 서브카테고리 조회

### 사용자 인증
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/verify` - 이메일 인증

## 🎨 UI/UX 특징

- **탭 기반 인터페이스**: 3가지 검색 모드를 탭으로 구분
- **반응형 디자인**: 다양한 화면 크기에 대응
- **즐겨찾기 아코디언**: 깔끔한 즐겨찾기 관리
- **직관적인 검색 폼**: 단계별 검색 옵션 제공
- **실시간 지도 연동**: 검색 결과를 지도에 즉시 표시

## 🔒 보안 기능

- **JWT 토큰 인증**: 안전한 사용자 세션 관리
- **이메일 인증**: 회원가입 시 이메일 검증
- **API 키 보호**: Kakao Maps API 키 보안

## 📱 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**Mapjiri** - 맛집을 찾는 가장 쉬운 방법 🍽️
