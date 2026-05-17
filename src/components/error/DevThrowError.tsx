// TODO: 테스트 완료 후 이 파일과 사용처를 모두 제거할 것

export default function DevThrowError(): never {
  throw new Error('[DEV] 에러 바운더리 테스트용');
}
