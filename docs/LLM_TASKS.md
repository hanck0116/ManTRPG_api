# LLM Tasks

Allowed tasks:

- `interpret`: 자연어 행동을 `ParsedAction`으로 변환합니다.
- `enemy-action`: 숨겨진 적의 의도(`attack|guard|wait|pressure`)와 짧은 힌트만 고릅니다.
- `narrate`: 코드가 계산한 `EngineResult`를 짧은 한국어 TRPG 묘사로 표현합니다.
- `generate-skill`: 새 스킬/마법의 이름, 분위기, 설명, 태그 후보만 만듭니다.
- `compact-summary`: 긴 visible log를 300자 이하 요약으로 압축합니다.

Forbidden outputs:

- HP/MP 변경, 피해량/회복량 계산, dice 판정, 보상 지급, item 수량 변경, 장비 변경, 레벨 변경.
- 적 수 생성, 보스몹 생성, 맵 이동 생성, V18에 없는 수치 효과 확정.
- `stateDeltas` 또는 유사한 상태 변경 지시.

상태와 연산 권한은 TypeScript 엔진에만 있습니다.
