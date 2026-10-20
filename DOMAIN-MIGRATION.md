# 복싱사관학교.com 독립 배포

- 새 홈페이지: https://복싱사관학교.com/ (`xn--zb0bzfz85bysd8qd313b.com`)
- 스파링클럽 원본: https://sparringclub.kr/club.html
- 신규 저장소: `sucrebae-star/boxingacademy-homepage`
- 원본 저장소와 버전: `sucrebae-star/sparringclub` / `43f1480025e59424acd2b97e84accfde7f07b223`

원본 배포와 DNS는 변경하지 않는다. 검증된 원본을 고정 버전으로 가져와 홈페이지 공개 파일만 새 도메인용으로 배포한다. 기존 클럽 로그인·Firebase·회원 데이터는 복사하지 않는다. 클럽 메뉴·공유 주소는 원래 도메인으로 연결한다. ERP, Record, KIOSK 및 연락관리 서버는 수정하지 않는다.

원본은 `npm test`, `npm run build`, `npm run test:build`를 모두 통과해야 한다. 별도 변환은 canonical/OG·사이트맵, 클럽 외부 링크, 홈페이지 전용 설치 manifest·서비스워커에 한정한다. 사진·영상·스타일·예약 상품·연락처는 원본을 보존한다.

로컬 검증:

```sh
node prepare.mjs ../source-sparringclub/dist ../academy-public
ACADEMY_OUTPUT=../academy-public node --test tests/*.test.mjs
```

GitHub Pages의 게시 소스는 GitHub Actions로 설정한다. 새 도메인을 GitHub에 등록·확인한 후 호스팅케이알 DNS의 루트 A 레코드를 GitHub Pages의 4개 IP로 설정한다. `www` CNAME은 `sucrebae-star.github.io`로 설정한다. 기존 `sparringclub.kr` DNS와 앱 도메인은 건드리지 않는다. HTTPS 인증서 발급과 실제 화면 확인이 끝나기 전에는 운영 완료로 보고하지 않는다.

기존 도메인을 새 도메인으로 리디렉션하지 않는다. 향후 원본 홈페이지 수정 시 이 저장소 workflow의 고정 원본 SHA를 검토·테스트 후 갱신한다. 자동으로 원본 브랜치 최신을 따라가지 않으므로 원본의 무관한 변경이 새 홈페이지에 즉시 영향을 주지 않는다.
