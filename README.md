# boxingacademy-homepage
복싱사관학교 공식 홈페이지 — 복싱사관학교.com 전용 배포. 스파링클럽 및 ERP와 분리.

## 지점 선택 홈페이지

`academy-source/`는 역삼본점·전주효천관·협업문의 UI의 자체 완결 소스입니다. React와 Tailwind를 빌드하여 정적 본문을 먼저 제공하고, 사진·폰트·수업 영상은 버전 경로에서 필요한 때 불러옵니다. 오프라인 기본본과 영상 포함본도 같은 소스로 만들 수 있습니다.

로컬 편집 프로젝트를 이 저장소로 가져올 때에는 `node sync-academy-source.mjs <preview-project-path>`를 사용합니다. 스크립트는 소스·사용 에셋·테스트·지도 지형과 의존성 파일만 복사합니다. 조사 문서, 참고사진 원본, 생성 원본, 개인 검토 캡처는 복사하지 않습니다.

GitHub Actions는 고정된 기존 `sparringclub` 소스에서 기존 에셋과 도메인 격리를 검증한 뒤 새 홈페이지 결과를 덧씌웁니다. 이전 에셋 주소·공유 링크를 보존하면서 canonical·공유 메타데이터·홈페이지 설치 정보·서비스 워커는 새 홈페이지에 맞게 갱신합니다. 서비스 워커는 홈페이지 파일만 다루며 스파링클럽과 개인 API를 캐시하지 않습니다.

```sh
cd academy-source
npm ci --ignore-scripts
npm run build
npm test
node build.mjs --production
node --test tests/production/*.test.mjs
```

PR에서는 빌드와 검사만 실행합니다. `main`으로 병합되면 기존 GitHub Pages 배포가 실행됩니다. 도메인과 DNS는 변경하지 않습니다. 클럽 메뉴, 기존 게시물 공유 주소와 회원·관리 기능은 `https://sparringclub.kr/club.html`의 원본 서비스에 남아 있습니다.
