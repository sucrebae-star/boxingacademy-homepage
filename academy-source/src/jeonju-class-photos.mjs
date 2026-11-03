// Approved 2026-11-03 AI reconstructions. Not documentary member/facility photos.
export const reconstructionCaption='실제 수업 구도를 참고한 AI 재구성 이미지';
export const classPhotos={
  "kids-01": {
    "id": "kids-01",
    "title": "단체 가드 연습",
    "scene": "assets/jeonju/class-20261103/kids-01",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "kids-02": {
    "id": "kids-02",
    "title": "파트너 미트 수업",
    "scene": "assets/jeonju/05-kids",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "kids-03": {
    "id": "kids-03",
    "title": "다 함께 기본기 훈련",
    "scene": "assets/jeonju/class-20261103/kids-03",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "boxing-01": {
    "id": "boxing-01",
    "title": "단체 줄넘기",
    "scene": "assets/jeonju/class-20261103/boxing-01",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "boxing-02": {
    "id": "boxing-02",
    "title": "단체 복싱 기본기",
    "scene": "assets/jeonju/01-hero",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "boxing-03": {
    "id": "boxing-03",
    "title": "파트너 복싱 훈련",
    "scene": "assets/jeonju/04-boxing",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "boxing-04": {
    "id": "boxing-04",
    "title": "세로 파트너 훈련",
    "scene": "assets/jeonju/class-20261103/boxing-04",
    "width": 941,
    "height": 1672,
    "mobileWidth": 640,
    "mobileHeight": 1138
  },
  "crossfit-01": {
    "id": "crossfit-01",
    "title": "박스 스텝업",
    "scene": "assets/jeonju/03-physical",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "crossfit-02": {
    "id": "crossfit-02",
    "title": "바벨 그룹 트레이닝",
    "scene": "assets/jeonju/06-morning",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  },
  "crossfit-03": {
    "id": "crossfit-03",
    "title": "그룹 러닝",
    "scene": "assets/jeonju/class-20261103/crossfit-03",
    "width": 1280,
    "height": 721,
    "mobileWidth": 640,
    "mobileHeight": 361
  }
};
export const coursePhotoIds={'physical-training':['crossfit-01','crossfit-02','crossfit-03'],'adult-boxing':['boxing-01','boxing-02','boxing-03','boxing-04'],'kids-boxing':['kids-01','kids-02','kids-03']};
const byScene=new Map(Object.values(classPhotos).map(p=>[p.scene,p]));
export const classPhotoForScene=scene=>byScene.get(scene);
