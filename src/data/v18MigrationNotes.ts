export const v18MigrationNotes = {
  currentStatus: 'staging_data_only',
  summary: '현재 저장소에는 모바일 PWA 검증용 최소 장비/스킬/마법/아이템/적/보상 데이터만 포함되어 있습니다.',
  stagingData: {
    equipment: ['EQ_WEAPON_SCYTHE_BASIC', 'EQ_ARMOR_TRAVELER_COAT'],
    skills: ['SK_REAPING_ARC'],
    magic: ['MG_EMBER_01'],
    items: ['IT_HERB_SMALL'],
    enemies: ['ENEMY_STRAY_SHADOW'],
    rewards: ['RW_COIN_SMALL', 'RW_HERB_SMALL', 'RW_APPEARANCE_BONUS'],
  },
  nextStep: '다음 단계에서 V18 통합본 기준 장비/스킬/마법/아이템/보상/특성/기술 전체 카탈로그를 이식합니다.',
  constraintsKept: ['맵 제거', '적 1명', '보스몹 없음', '로컬 LLM 미사용'],
} as const;
