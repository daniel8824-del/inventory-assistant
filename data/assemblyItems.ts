// 신천등기구 미조립 리스트 - CSV 원본 그대로 파싱
// 빈 줄(,,)로 세트 구분
// 조립가능수량 = min(세트 내 모든 품목 수량)

export interface AssemblyItem {
  name: string;
  csvQuantity: number; // CSV에 있던 수량 (참고용)
}

export interface AssemblySet {
  id: number;
  items: AssemblyItem[];
  csvAssemblyQty: number | null; // CSV에 있던 조립가능수량 (참고용)
}

// CSV 원본 구조 그대로 파싱 (빈줄 기준 세트 구분)
export const ASSEMBLY_SETS: AssemblySet[] = [
  // 세트 1
  {
    id: 1,
    items: [
      { name: "S-보안등기구 바디 [2구]", csvQuantity: 54 },
      { name: "S-보안등기구 커버 [2구]", csvQuantity: 62 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용]", csvQuantity: 273 },
    ],
    csvAssemblyQty: 54
  },
  // 세트 2
  {
    id: 2,
    items: [
      { name: "S-보안등기구 커버 [2구/기와진회색]", csvQuantity: 47 },
      { name: "S-보안등기구 바디 [2구/기와진회색]", csvQuantity: 46 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/기와진회색]", csvQuantity: 111 },
    ],
    csvAssemblyQty: 46
  },
  // 세트 3
  {
    id: 3,
    items: [
      { name: "S-보안등기구 바디", csvQuantity: 208 },
      { name: "S-보안등기구 커버", csvQuantity: 184 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용]", csvQuantity: 273 },
    ],
    csvAssemblyQty: 184
  },
  // 세트 4
  {
    id: 4,
    items: [
      { name: "S-가로등기구 바디 [4구]", csvQuantity: 113 },
      { name: "S-가로등기구 커버 [4구]", csvQuantity: 136 },
      { name: "S-가로등기구 4구 암대", csvQuantity: 175 },
    ],
    csvAssemblyQty: 113
  },
  // 세트 5
  {
    id: 5,
    items: [
      { name: "S-보안등기구 바디 [기와진회색]", csvQuantity: 96 },
      { name: "S-보안등기구 커버 [기와진회색]", csvQuantity: 114 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/기와진회색]", csvQuantity: 111 },
    ],
    csvAssemblyQty: 96
  },
  // 세트 6
  {
    id: 6,
    items: [
      { name: "S-가로등기구 바디", csvQuantity: 88 },
      { name: "S-가로등기구 커버", csvQuantity: 46 },
      { name: "S-가로등기구 암대 [5구&6구 공용]", csvQuantity: 6 },
    ],
    csvAssemblyQty: 6
  },
  // 세트 7
  {
    id: 7,
    items: [
      { name: "S-가로등기구 바디 [5구]", csvQuantity: 39 },
      { name: "S-가로등기구 커버 [5구]", csvQuantity: 48 },
      { name: "S-가로등기구 암대 [5구&6구 공용]", csvQuantity: 6 },
    ],
    csvAssemblyQty: 6
  },
  // 세트 8
  {
    id: 8,
    items: [
      { name: "S-가로등기구 바디 [4구/기와진회색]", csvQuantity: 12 },
      { name: "S-가로등기구 커버 [4구/기와진회색]", csvQuantity: 14 },
      { name: "S-가로등기구 4구 암대 기와진회색", csvQuantity: 12 },
    ],
    csvAssemblyQty: 12
  },
  // 세트 9
  {
    id: 9,
    items: [
      { name: "S-가로등기구 바디 [10구/기와진회색]", csvQuantity: 3 },
      { name: "S-가로등기구 커버 [10구/기와진회색]", csvQuantity: 3 },
      { name: "S-가로등기구 암대 [10구 & 원형 공용 / 기와진회색]", csvQuantity: 3 },
    ],
    csvAssemblyQty: 3
  },
  // 세트 10 - 바디 없음! 조립 불가
  {
    id: 10,
    items: [
      { name: "S-가로등기구 커버 [기와진회색]", csvQuantity: 33 },
      { name: "S-가로등기구 암대 [5구&6구공용/기와진회색]", csvQuantity: 41 },
    ],
    csvAssemblyQty: null // 바디 없어서 조립 불가
  },
  // 세트 11
  {
    id: 11,
    items: [
      { name: "S-가로등기구 바디 [5구/기와진회색]", csvQuantity: 6 },
      { name: "S-가로등기구 커버 [5구/기와진회색]", csvQuantity: 7 },
      { name: "S-가로등기구 암대 [5구&6구공용/기와진회색]", csvQuantity: 41 },
    ],
    csvAssemblyQty: 6
  },
  // 세트 12
  {
    id: 12,
    items: [
      { name: "S-원형 보안등기구 바디", csvQuantity: 53 },
      { name: "S-원형 보안등기구 커버", csvQuantity: 32 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용]", csvQuantity: 273 },
    ],
    csvAssemblyQty: 32
  },
  // 세트 13
  {
    id: 13,
    items: [
      { name: "S-원형 보안등기구-커버 기와진회색", csvQuantity: 12 },
      { name: "S-원형 보안등기구-바디 기와진회색", csvQuantity: 12 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/기와진회색]", csvQuantity: 111 },
    ],
    csvAssemblyQty: 12
  },
  // 세트 14
  {
    id: 14,
    items: [
      { name: "S-보안등기구 바디 [PX8576(S)-SC2940] KCC기와진", csvQuantity: 34 },
      { name: "S-보안등기구 커버 [PX8576(S)-SC2940] KCC기와진", csvQuantity: 34 },
      { name: "S-보안등기구 암대 [PX8576(S)-SC2940] KCC기와진", csvQuantity: 34 },
    ],
    csvAssemblyQty: 34
  },
  // 세트 15
  {
    id: 15,
    items: [
      { name: "S-보안등기구 바디 [P-GY2397-S3/노장진회색]", csvQuantity: 0 },
      { name: "S-보안등기구 커버 [P-GY2397-S3/노장진회색]", csvQuantity: 0 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/P-GY2397-S3/노장진회색]", csvQuantity: 0 },
    ],
    csvAssemblyQty: 0
  },
  // 세트 16
  {
    id: 16,
    items: [
      { name: "S-보안등기구 바디 [2구/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 1 },
      { name: "S-보안등기구 커버 [2구/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 1 },
      { name: "S-보안등기구-암대 [2구&3구&원형 공용/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 3 },
    ],
    csvAssemblyQty: 1
  },
  // 세트 17
  {
    id: 17,
    items: [
      { name: "S-보안등기구-바디 [PTX GY1060 그레이 (Cool gray)]", csvQuantity: 0 },
      { name: "S-보안등기구-커버 [PTX GY1060 그레이 (Cool gray)]", csvQuantity: 1 },
      { name: "S-보안등기구-암대 [2구&3구&원형 공용/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 3 },
    ],
    csvAssemblyQty: 0
  },
  // 세트 18
  {
    id: 18,
    items: [
      { name: "S-가로등기구 바디 [5구/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 14 },
      { name: "S-가로등기구 커버 [5구/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 14 },
      { name: "S-가로등기구-암대 [5구&6구 공용/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 7 },
    ],
    csvAssemblyQty: 7
  },
  // 세트 19
  {
    id: 19,
    items: [
      { name: "S-가로등기구-바디 [PTX GY1060 그레이 (Cool gray)]", csvQuantity: 19 },
      { name: "S-가로등기구-커버 [PTX GY1060 그레이 (Cool gray)]", csvQuantity: 45 },
      { name: "S-가로등기구-암대 [5구&6구 공용/PTX GY1060 그레이 (Cool gray)]", csvQuantity: 7 },
    ],
    csvAssemblyQty: 7
  },
  // 세트 20 - 커버만 있음
  {
    id: 20,
    items: [
      { name: "S-보안등기구 커버 [2구/P-GY2779-S3/N4.0]", csvQuantity: 140 },
    ],
    csvAssemblyQty: null
  },
  // 세트 21 - 암대만 있음
  {
    id: 21,
    items: [
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/P-GY4381-X0]", csvQuantity: 1 },
    ],
    csvAssemblyQty: null
  },
  // 세트 22 - 바디+커버만, 암대 없음
  {
    id: 22,
    items: [
      { name: "S-보안등기구 바디 [외장형 0162 SILVER 유광]", csvQuantity: 1 },
      { name: "S-보안등기구 커버 [외장형 0162 SILVER 유광]", csvQuantity: 1 },
    ],
    csvAssemblyQty: null
  },
  // 세트 23
  {
    id: 23,
    items: [
      { name: "S-보안등기구 바디 [P-BRO0582-S9 / 초코브라운]", csvQuantity: 30 },
      { name: "S-보안등기구 커버 [P-BRO0582-S9 / 초코브라운]", csvQuantity: 18 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/P-BRO0582-S9 / 초코브라운]", csvQuantity: 17 },
    ],
    csvAssemblyQty: 17
  },
  // 세트 24
  {
    id: 24,
    items: [
      { name: "S-보안등기구-바디 [한마톤 GY001]", csvQuantity: 7 },
      { name: "S-보안등기구-커버 [한마톤 GY001]", csvQuantity: 6 },
      { name: "S-보안등기구-암대 [2구&3구&원형 공용/한마톤 GY001]", csvQuantity: 8 },
    ],
    csvAssemblyQty: 6
  },
  // 세트 25 - 바디+암대만, 커버 없음
  {
    id: 25,
    items: [
      { name: "S-보안등기구 바디 [H-GY1727-S3/N2.0]", csvQuantity: 19 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/H-GY1727-S3/N2.0]", csvQuantity: 107 },
    ],
    csvAssemblyQty: null
  },
  // 세트 26 - 커버+암대만
  {
    id: 26,
    items: [
      { name: "S-보안등기구 커버 2139", csvQuantity: 2 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/P-GY2139-A3 / 도시형(MT-9211-3)]", csvQuantity: 2 },
    ],
    csvAssemblyQty: null
  },
  // 세트 27
  {
    id: 27,
    items: [
      { name: "S-원형 보안등기구 커버 [무도장]", csvQuantity: 10 },
      { name: "S-원형 보안등기구 바디 [무도장]", csvQuantity: 11 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/무도장]", csvQuantity: 67 },
    ],
    csvAssemblyQty: 10
  },
  // 세트 28
  {
    id: 28,
    items: [
      { name: "S-보안등기구 바디 [무도장]", csvQuantity: 14 },
      { name: "S-보안등기구 커버 [무도장]", csvQuantity: 17 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/무도장]", csvQuantity: 67 },
    ],
    csvAssemblyQty: 14
  },
  // 세트 29
  {
    id: 29,
    items: [
      { name: "S-보안등기구 바디 [안산시 기와진회색]", csvQuantity: 21 },
      { name: "S-보안등기구 커버 [안산시 기와진회색]", csvQuantity: 20 },
      { name: "S-보안등기구 암대 [2구&3구&원형 공용/안산시 기와진회색]", csvQuantity: 18 },
    ],
    csvAssemblyQty: 18
  },
  // 세트 30
  {
    id: 30,
    items: [
      { name: "S-원형 가로등기구-바디", csvQuantity: 21 },
      { name: "S-원형 가로등기구-커버", csvQuantity: 44 },
      { name: "S-가로등기구 암대 [10구 & 원형 공용]", csvQuantity: 50 },
    ],
    csvAssemblyQty: 21
  },
  // 세트 31
  {
    id: 31,
    items: [
      { name: "S-가로등기구 커버 [GD602]", csvQuantity: 2 },
      { name: "S-가로등기구 바디 [GD602]", csvQuantity: 2 },
      { name: "S-가로등기구 암대 [5구&6구 공용/GD602]", csvQuantity: 2 },
    ],
    csvAssemblyQty: 2
  },
  // 세트 32 - 커버+암대만
  {
    id: 32,
    items: [
      { name: "S-가로등기구 커버 [P-GY2397-S3/노장진회색]", csvQuantity: 3 },
      { name: "S-가로등기구 암대 [5구&6구 공용/P-GY2397-S3/노장진회색]", csvQuantity: 3 },
    ],
    csvAssemblyQty: null
  },
  // 세트 33
  {
    id: 33,
    items: [
      { name: "S-가로등기구 암대 [5구&6구 공용/MX302K]", csvQuantity: 102 },
      { name: "S-가로등기구 커버 [MX302K]", csvQuantity: 101 },
      { name: "S-가로등기구 바디 302K", csvQuantity: 98 },
    ],
    csvAssemblyQty: 98
  },
  // 세트 34 - 바디+암대만
  {
    id: 34,
    items: [
      { name: "S-가로등기구 바디 [5구/PSG-GY-296/갯벌색]", csvQuantity: 1 },
      { name: "S-가로등기구 암대 [5구&6구 공용/PSG-GY-296/갯벌색]", csvQuantity: 1 },
    ],
    csvAssemblyQty: null
  },
  // 세트 35
  {
    id: 35,
    items: [
      { name: "S-가로등기구 바디 [P-GY4381-X0]", csvQuantity: 36 },
      { name: "S-가로등기구 커버 [P-GY4381-X0]", csvQuantity: 32 },
      { name: "S-가로등기구 암대 [5구&6구 공용/P-GY4381-X0]", csvQuantity: 26 },
    ],
    csvAssemblyQty: 26
  },
  // 세트 36
  {
    id: 36,
    items: [
      { name: "S-가로등기구 바디 [N7.0]", csvQuantity: 32 },
      { name: "S-가로등기구 암대 [5구&6구 공용/N7.0]", csvQuantity: 32 },
      { name: "S-가로등기구 커버 [N7.0]", csvQuantity: 32 },
    ],
    csvAssemblyQty: 32
  },
  // 세트 37
  {
    id: 37,
    items: [
      { name: "S-가로등기구 바디 [PX8576(S)-SC2940] KCC기와진", csvQuantity: 120 },
      { name: "S-가로등기구 커버 [PX8576(S)-SC2940] KCC기와진", csvQuantity: 120 },
      { name: "S-가로등기구 암대 [5구&6구 공용/PX8576(S)-SC2940] KCC기와진", csvQuantity: 120 },
    ],
    csvAssemblyQty: 120
  },
  // 세트 38
  {
    id: 38,
    items: [
      { name: "S-가로등기구 바디 [5구/P-GY1887-H9]", csvQuantity: 11 },
      { name: "S-가로등기구 커버 [5구/P-GY1887-H9]", csvQuantity: 10 },
      { name: "S-가로등기구 암대 [P-GY1887-H9 / 5구&6구 공용]", csvQuantity: 11 },
    ],
    csvAssemblyQty: 10
  },
  // 세트 39
  {
    id: 39,
    items: [
      { name: "S-가로등기구 커버 [5구/무도장]", csvQuantity: 10 },
      { name: "S-가로등기구 바디 [5구/무도장]", csvQuantity: 10 },
      { name: "S-가로등기구 암대 [5구&6구공용/무도장]", csvQuantity: 96 },
    ],
    csvAssemblyQty: 10
  },
  // 세트 40
  {
    id: 40,
    items: [
      { name: "S-가로등기구 커버 [무도장]", csvQuantity: 86 },
      { name: "S-가로등기구 바디 [무도장]", csvQuantity: 86 },
      { name: "S-가로등기구 암대 [5구&6구공용/무도장]", csvQuantity: 96 },
    ],
    csvAssemblyQty: 86
  },
  // 세트 41
  {
    id: 41,
    items: [
      { name: "S-가로등기구 초코브라운 커버", csvQuantity: 1 },
      { name: "S-가로등기구 초코브라운 바디", csvQuantity: 2 },
      { name: "S-가로등기구 초코브라운 암대 5구&6구공용", csvQuantity: 2 },
    ],
    csvAssemblyQty: 1
  },
  // 세트 42
  {
    id: 42,
    items: [
      { name: "S-원형 보안등기구 커버 흰색", csvQuantity: 1 },
      { name: "S-원형 보안등기구 바디 흰색", csvQuantity: 1 },
      { name: "S-원형 보안등기구 암대 2구&3구&원형 공용/ 흰색", csvQuantity: 1 },
    ],
    csvAssemblyQty: 1
  },
  // 세트 43 - 바디만
  {
    id: 43,
    items: [
      { name: "S-원형 가로등기구 바디 흰색", csvQuantity: 24 },
    ],
    csvAssemblyQty: null
  },
  // 세트 44
  {
    id: 44,
    items: [
      { name: "S-가로등기구 커버 안산시 기와진회색", csvQuantity: 2 },
      { name: "S-가로등기구 바디 안산시 기와진회색", csvQuantity: 3 },
      { name: "S-가로등기구 암대 5구&6구 공용/안산시 기와진회색", csvQuantity: 2 },
    ],
    csvAssemblyQty: 2
  },
  // 세트 45
  {
    id: 45,
    items: [
      { name: "S-원형 가로등기구 커버 무도장", csvQuantity: 10 },
      { name: "S-원형 가로등기구 바디 무도장", csvQuantity: 10 },
      { name: "S-가로등기구 암대 10구 & 원형 공용 / 무도장", csvQuantity: 10 },
    ],
    csvAssemblyQty: 10
  },
  // 세트 46
  {
    id: 46,
    items: [
      { name: "S-보안등기구 커버 서울시기와진", csvQuantity: 5 },
      { name: "S-보안등기구 바디 서울시기와진", csvQuantity: 5 },
      { name: "S-보안등기구 암대 2구&3구&원형 공용/서울시기와진", csvQuantity: 5 },
    ],
    csvAssemblyQty: 5
  },
  // 세트 47 - 바디만
  {
    id: 47,
    items: [
      { name: "S-가로등기구 바디 광주시향", csvQuantity: 4 },
    ],
    csvAssemblyQty: null
  },
  // 세트 48 - 바디만
  {
    id: 48,
    items: [
      { name: "S-보안등기구 바디 광주시향", csvQuantity: 7 },
    ],
    csvAssemblyQty: null
  },
  // 세트 49 - 바디만
  {
    id: 49,
    items: [
      { name: "S-가로등기구 바디 5구 광주시향", csvQuantity: 6 },
    ],
    csvAssemblyQty: null
  },
  // 세트 50 - 암대만
  {
    id: 50,
    items: [
      { name: "S-가로등기구 암대 [4구/무도장]", csvQuantity: 120 },
    ],
    csvAssemblyQty: null
  },
  // 세트 51 - 터널등 (바디+중간판+커버+SMPS)
  {
    id: 51,
    items: [
      { name: "S-터널등기구 4구 바디", csvQuantity: 6 },
      { name: "S-터널등기구 4구 중간판", csvQuantity: 16 },
      { name: "S-터널등기구 커버", csvQuantity: 1 },
      { name: "S-터널등기구 SMPS 철판", csvQuantity: 2 },
    ],
    csvAssemblyQty: 1
  },
  // 세트 52 - 바디만
  {
    id: 52,
    items: [
      { name: "S-터널등기구 8구 바디", csvQuantity: 11 },
    ],
    csvAssemblyQty: null
  },
  // 세트 53 - 중간판만
  {
    id: 53,
    items: [
      { name: "S-터널등기구 4구 중간판 기와진회색", csvQuantity: 2 },
    ],
    csvAssemblyQty: null
  },
  // 세트 54 - 바디만
  {
    id: 54,
    items: [
      { name: "S-터널등기구 8구 바디 기와진회색", csvQuantity: 2 },
    ],
    csvAssemblyQty: null
  },
  // 세트 55 - 커버만
  {
    id: 55,
    items: [
      { name: "S-터널등기구 커버 기와진회색", csvQuantity: 2 },
    ],
    csvAssemblyQty: null
  },
  // 세트 56 - 브라켓만
  {
    id: 56,
    items: [
      { name: "S-터널등용 브라켓", csvQuantity: 146 },
    ],
    csvAssemblyQty: null
  },
  // 세트 57 - 벽부등 (바디+커버)
  {
    id: 57,
    items: [
      { name: "S-벽부등기구 커버", csvQuantity: 18 },
      { name: "S-벽부등기구 바디", csvQuantity: 18 },
    ],
    csvAssemblyQty: 18
  },
  // 세트 58 - 공장등 (거치대+렌즈+바디+손잡이)
  {
    id: 58,
    items: [
      { name: "공장등기구 거치대", csvQuantity: 12 },  // CSV: 커버 → DB: 거치대
      { name: "공장등기구 렌즈", csvQuantity: 3 },
      { name: "공장등기구 바디", csvQuantity: 4 },
      { name: "공장등기구 손잡이", csvQuantity: 129 },
    ],
    csvAssemblyQty: 3
  },
  // 세트 59 - 소형 공장등
  {
    id: 59,
    items: [
      { name: "소형 공장등기구 커버 [무도장]", csvQuantity: 18 },
      { name: "소형 공장등기구 렌즈", csvQuantity: 29 },
      { name: "소형 공장등기구 바디 [무도장]", csvQuantity: 27 },
      { name: "소형 공장등기구 갓 [무도장]", csvQuantity: 20 },
    ],
    csvAssemblyQty: 18
  },
  // 세트 60 - 스포츠등만
  {
    id: 60,
    items: [
      { name: "S-스포츠등", csvQuantity: 9 },
    ],
    csvAssemblyQty: null
  },
  // 세트 61 - 암대만
  {
    id: 61,
    items: [
      { name: "S-가로등기구 긴 암대 5구&6구공용", csvQuantity: 31 },
    ],
    csvAssemblyQty: null
  },
  // 세트 62 - 암대만
  {
    id: 62,
    items: [
      { name: "S-63파이 암대 0162", csvQuantity: 1 },
    ],
    csvAssemblyQty: null
  },
  // 세트 63 - 홀가공 세트
  {
    id: 63,
    items: [
      { name: "S-가로등기구 홀가공 [4구]", csvQuantity: 7 },  // CSV: 홀가공 바디 → DB: 홀가공
      { name: "S-가로등기구 커버 [4구]", csvQuantity: 136 },
      { name: "S-가로등기구 4구 암대", csvQuantity: 175 },
    ],
    csvAssemblyQty: 7
  },
];

// 전체 품목명 리스트 (자동 생성)
export const ASSEMBLY_ITEM_NAMES: string[] = ASSEMBLY_SETS.flatMap(set => 
  set.items.map(item => item.name)
);
