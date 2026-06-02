# API Key Policy

- ManTRPG 기본 구조는 **BYOK(Bring Your Own Key)** 입니다.
- 개발자/운영자 환경변수 API Key를 기본 LLM 호출에 사용하지 않습니다.
- API Key 없이도 템플릿 GM, 로컬 파서, TypeScript 전투 엔진으로 기본 플레이가 가능합니다.
- 플레이어가 Provider API Key를 직접 입력한 경우에만 해당 Provider 계정에서 비용이 발생할 수 있습니다.
- 로컬 LLM은 사용하지 않습니다.
- 저장 기본값은 `sessionOnly`이며, 기기 저장은 PBKDF2 + AES-GCM 암호화 저장만 기본 UI에서 제공합니다.
- PIN/passphrase는 저장하지 않으며, 원문 API Key는 설정 export, prompt payload, usage log에 포함하지 않습니다.
- Worker `/llm`은 direct BYOK 기본 모드에서 사용하지 않습니다. `/proxy/llm`은 명시적 opt-in이며 API Key가 Worker를 통과할 수 있음을 UI/문서에서 경고해야 합니다.
