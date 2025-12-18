import { StockItem } from './types';

// 1. Supabase (Direct DB Access)
export const SUPABASE_URL = "https://yizyfkhsnncxyzwsvrfp.supabase.co";

// Supabase 'anon' public key
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpenlma2hzbm5jeHl6d3N2cmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDU1NjksImV4cCI6MjA4MTM4MTU2OX0.VqRTm70s7_wcz3O1lMjDcgxokhn7mdIpsph3DGyZIBk"; 

export const SUPABASE_TABLE = "current_stock"; 

// Target Categories for filtering (22 Items) - 순서 중요!
export const TARGET_CATEGORIES = [
  "신천등기구_조립",
  "신천등기구_미조립",
  "루넥스등기구",
  "유니온SMPS",
  "K1모듈",
  "세종&교은모듈",
  "네오네온모듈",
  "하네스",
  "모듈생산창고",
  "기타재고",
  "킹브라이트렌즈",
  "백룡등기구",
  "기민전자,엔에스,나이스테크등기구",
  "크리패키지",
  "오스람패키지",
  "서울반도체패키지",
  "삼성패키지",
  "엘지패키지",
  "루멘스&루미레즈패키지",
  "씨앤지옵틱렌즈",
  "ILENS렌즈",
  "유니온K1재고"
];

// 구분명 순서 매핑 (정렬용)
export const CATEGORY_ORDER: { [key: string]: number } = TARGET_CATEGORIES.reduce(
  (acc, cat, idx) => ({ ...acc, [cat]: idx + 1 }),
  {}
);

// 구분명 순서 반환 함수
export const getCategoryOrder = (category: string): number => {
  return CATEGORY_ORDER[category] ?? 999;
};

// Chat Webhook (Only for ChatPanel)
export const CHAT_WEBHOOK_URL = "https://daniel8824.app.n8n.cloud/webhook/5d8f1d94-30c6-4b7a-b351-5f78ffad2143/chat";

// 2. Dynamic Simulation Data (Fallback if API fails)
const generateMockData = (): StockItem[] => [
  { "구분명": "신천등기구_조립", "품목명[규격]": "S-보안등기구-AB [2구]", "단가": 75000, "현재수량": Math.floor(Math.random() * 20) + 5, "전월수량": 100, "위험재고": 30, "상태": "🔴 위험", "금액": 1500000 },
  { "구분명": "K1모듈", "품목명[규격]": "LEMWA33X80LX3000", "단가": 3400, "현재수량": Math.floor(Math.random() * 50) + 100, "전월수량": 150, "위험재고": 45, "상태": "🟢 안전", "금액": 340000 },
  { "구분명": "신천등기구_미조립", "품목명[규격]": "방열판-150W [AL6063]", "단가": 11125, "현재수량": Math.floor(Math.random() * 10), "전월수량": 80, "위험재고": 24, "상태": "🔴 위험", "금액": 890000 },
  { "구분명": "하네스", "품목명[규격]": "LG-Innotek 5630", "단가": 2240, "현재수량": 2500 + Math.floor(Math.random() * 100), "전월수량": 2800, "위험재고": 500, "상태": "🟢 안전", "금액": 5600000 },
  { "구분명": "유니온SMPS", "품목명[규격]": "KS-50W-Outdoor", "단가": 20000, "현재수량": 12, "전월수량": 60, "위험재고": 15, "상태": "🔴 위험", "금액": 240000 },
  { "구분명": "기타재고", "품목명[규격]": "Diecast-AL-200", "단가": 26666.67, "현재수량": 45, "전월수량": 40, "위험재고": 10, "상태": "🟡 보류", "금액": 1200000 },
];

export const GET_MOCK_DATA = () => generateMockData();