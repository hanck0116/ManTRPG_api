# Cost-free BYOK Structure

- 기본 플레이 비용은 0원입니다. API Key가 없으면 API 호출을 하지 않습니다.
- 개발자 API Key 자동 fallback이 없습니다.
- 브라우저 client가 플레이어의 Provider API를 직접 호출하는 것이 기본 추천 구조입니다.
- Worker proxy는 기본 경로가 아니며, opt-in 시 API Key가 Worker를 통과할 수 있습니다.
- 로컬 LLM은 금지되어 있으므로 모델 실행 비용/환경 요구사항이 없습니다.
