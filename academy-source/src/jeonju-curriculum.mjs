// Generated concept photographs, not photographs of actual members or facilities.
const parts = (rows) => rows.map(([file, title, description]) => ({
  image: `assets/curriculum/${file}.webp`, title, description,
}));
export const curricula = {
  'physical-training': {
    times: ['10:00', '19:00', '21:00'],
    intro: '다양한 전신 운동으로 체력과 지구력을 차근차근 쌓습니다.',
    parts: parts([
      ['01-group-stretch', '단체 스트레칭', '함께 몸을 풀며 운동을 준비합니다.'],
      ['02-music-boxing', '뮤직복싱', '음악에 맞춰 복싱 동작과 스텝을 이어갑니다.'],
      ['03-heavy-bag', '헤비백 타격', '샌드백을 치며 펀치와 전신 움직임을 연결합니다.'],
      ['04-circuit', '서킷트레이닝', '여러 운동을 번갈아 수행하며 전신을 사용합니다.'],
      ['05-crossfit', '크로스핏', '다양한 기능성 동작으로 근력과 체력을 기릅니다.'],
    ]),
  },
  'adult-boxing': {
    times: ['20:00'],
    intro: '성인과 고학년 학생이 함께 기본 동작과 복싱 기술을 익힙니다.',
    parts: parts([
      ['06-all-stretch', '체조·스트레칭', '성인과 학생이 함께 몸을 풀며 수업을 시작합니다.'],
      ['07-all-jump-rope', '줄넘기', '일정한 리듬으로 뛰며 발 움직임을 준비합니다.'],
      ['08-all-plyometric', '도약·플라이오메트릭', '도구 없이 뛰고 착지하며 민첩성과 균형을 연습합니다.'],
      ['09-all-shadow', '쉐도우복싱', '자세와 스텝, 펀치를 연결하며 기본기를 익힙니다.'],
      ['10-all-friendly', '친선게임', '보호장구를 착용하고 서로 배려하며 기술을 연습합니다.'],
      ['11-all-strength-circuit', '근력·체력 서킷', '맨몸과 소도구 운동으로 복싱에 필요한 체력을 쌓습니다.'],
    ]),
  },
  'kids-boxing': {
    times: ['15:00', '17:00'],
    intro: '초·중학생이 함께 움직이며 복싱의 기본기와 협동심을 배웁니다.',
    parts: parts([
      ['12-kids-stretch', '체조·스트레칭', '선생님과 함께 몸을 풀며 운동을 준비합니다.'],
      ['13-kids-jump-rope', '줄넘기', '리듬에 맞춰 뛰며 집중력과 협응력을 연습합니다.'],
      ['14-kids-plyometric', '도약·플라이오메트릭', '가볍게 뛰고 안정적으로 착지하는 방법을 익힙니다.'],
      ['15-kids-shadow', '쉐도우복싱', '기본 자세와 펀치 동작을 차근차근 따라 배웁니다.'],
      ['16-kids-friendly', '친선게임', '보호장구를 착용하고 친구를 배려하며 함께 연습합니다.'],
      ['17-kids-strength-circuit', '근력·체력 서킷', '맨몸과 가벼운 소도구로 다양한 움직임을 경험합니다.'],
    ]),
  },
};


// Two actual RandomCut class highlights precede, rather than replace, the exercise photos.
const videoPrograms = { 'physical-training': 'physical', 'adult-boxing': 'boxing', 'kids-boxing': 'kids' };
for (const [id, stem] of Object.entries(videoPrograms)) {
  const description = id === 'physical-training'
    ? '크로스핏 수업에서 함께 전신을 움직이는 훈련 모습을 만나보세요.'
    : id === 'adult-boxing'
      ? '저녁 8시 모두의 복싱, 함께 기본기를 연습하는 수업 모습입니다.'
      : '키즈복싱 수업에서 함께 배우고 움직이는 모습을 만나보세요.';
  curricula[id].parts.unshift(...[1, 2].map(n => ({
    image: `assets/videos/${stem}-${n}.webp`,
    video: `assets/videos/${stem}-${n}.mp4`,
    title: n === 1 ? '수업 하이라이트' : '함께하는 훈련',
    description,
  })));
}

for (const part of curricula['physical-training'].parts) {
  if (part.title === '헤비백 타격') part.photoScene = 'heavy-bag';
  if (part.title === '서킷트레이닝') part.photoScene = 'circuit';
}
