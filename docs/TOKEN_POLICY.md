# Token Policy

- 토큰 최소화를 최우선으로 합니다.
- 전체 GameState, 전체 룰북, 전체 catalog, 전체 로그, 적 상세 수치는 API에 보내지 않습니다.
- API 직전 `compactPayload`로 짧은 필드명 JSON을 생성하고 공백 없는 `JSON.stringify`를 사용합니다.
- task별 최대 출력 토큰: interpret 80, enemy-action 80, narrate 180, compact-summary 160, generate-skill 220.
- 명확한 버튼/명령어 행동과 일반 전투 묘사는 API를 호출하지 않습니다.
- API 호출 전 예상 token/cost 문구를 제공하고, 확인 옵션과 session/daily 예산으로 호출을 중단할 수 있습니다.
