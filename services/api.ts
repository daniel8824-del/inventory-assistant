import { StockItem, DealItem } from '../types';
import { GET_MOCK_DATA, SUPABASE_URL, SUPABASE_KEY, SUPABASE_TABLE } from '../constants';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

export type DataSourceType = 'SUPABASE' | 'SIMULATION';

// Supabase 클라이언트 생성 (Realtime용)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface FetchResult {
  data: StockItem[];
  source: DataSourceType;
}

// Helper: Safe number parser
const parseSafeNum = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(/,/g, '').trim();
    return clean ? Number(clean) : 0;
  }
  return 0;
};

// Map Database keys directly to UI keys
const mapDbToUI = (item: any): StockItem => {
  return {
    "유니크키": item.유니크키 || "",  // No (순서 번호)
    "구분명": (item.구분명 || "").trim(), 
    "품목명[규격]": item["품목명[규격]"] || item.품목명 || "-",
    "품목코드": item.품목코드 || "",
    "비고": item.비고 || "",
    "단가": parseSafeNum(item.단가),
    "현재수량": parseSafeNum(item.현재수량),
    "전월수량": parseSafeNum(item.전월수량),
    "위험재고": parseSafeNum(item.위험재고),
    "재고회전": item.재고회전 || "",
    "상태": item.상태 || "-",
    "금액": parseSafeNum(item.금액 ?? item.총금액),
    "updated_at": item.updated_at || ""
  };
};

export const fetchStockData = async (): Promise<FetchResult> => {
  // 1. Validate Configuration
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[API] Credentials missing.");
    return { data: GET_MOCK_DATA(), source: 'SIMULATION' };
  }

  // 2. Fetch ALL data from Supabase using pagination (1000개씩 가져오기)
  try {
    let allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    console.log("[API] 📡 Fetching all data with pagination...");

    while (hasMore) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=*&limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`[API] Supabase Error: ${response.status} ${response.statusText}`);
        break;
      }

      const chunk = await response.json();
      
      if (Array.isArray(chunk) && chunk.length > 0) {
        allData = allData.concat(chunk);
        console.log(`[API] 📦 Fetched ${chunk.length} items (offset: ${offset}, total so far: ${allData.length})`);
        offset += limit;
        
        // 마지막 페이지인지 확인
        if (chunk.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (allData.length > 0) {
      // 🔍 디버깅: 첫 번째 row의 실제 컬럼명 확인
      console.log("[API] DB 첫 번째 row 원본 데이터:", allData[0]);
      console.log("[API] DB 컬럼명 목록:", Object.keys(allData[0]));
      
      const normalizedData = allData.map(mapDbToUI);
      
      // 🔍 디버깅: DB에 존재하는 고유 구분명 목록
      const uniqueCategories = [...new Set(normalizedData.map(item => item.구분명))];
      console.log("[API] DB 고유 구분명 목록 (총 " + uniqueCategories.length + "개):", uniqueCategories);
      
      // 🔍 디버깅: 특정 카테고리 데이터 존재 여부 확인
      const checkCategories = ["루넥스등기구", "세종&교은모듈"];
      checkCategories.forEach(cat => {
        const found = normalizedData.filter(item => item.구분명 === cat);
        console.log(`[API] "${cat}" 데이터: ${found.length}건`);
      });
      
      console.log(`[API] ✅ Total loaded: ${normalizedData.length} items from Supabase.`);
      
      return { data: normalizedData, source: 'SUPABASE' };
    }
  } catch (error) {
    console.error("[API] Connection Failed:", error);
  }

  // 3. Fallback
  return { data: GET_MOCK_DATA(), source: 'SIMULATION' };
};

// Deal Data 매핑
const mapDbToDeal = (item: any): DealItem => {
  return {
    id: item.id?.toString() || "",
    "구분명": (item.구분명 || "").trim(),
    "품목명[규격]": item["품목명[규격]"] || "-",
    "비고": item.비고 || "",
    "품목코드": item.품목코드 || "",
    "단가": parseSafeNum(item.단가),
    "거래처명": item.거래처명 || "-",
    "거래구분": item.거래구분 || "입고",
    "거래수량": parseSafeNum(item.거래수량),
    "금액": parseSafeNum(item.금액),
    "거래일자": item.거래일자 || "-",
    "담당자": item.담당자 || "",
    "적요": item.적요 || "",
    "제출일시": item.제출일시 || "",
    "거래 전 재고": parseSafeNum(item["거래 전 재고"]),
    "거래 후 재고": parseSafeNum(item["거래 후 재고"])
  };
};

export interface DealFetchResult {
  data: DealItem[];
  source: DataSourceType;
}

export const fetchDealData = async (): Promise<DealFetchResult> => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[API] Credentials missing for deal_data.");
    return { data: [], source: 'SIMULATION' };
  }

  try {
    let allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    console.log("[API] 📡 Fetching deal_data with pagination...");

    while (hasMore) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/deal_data?select=*&order=제출일시.asc&limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`[API] deal_data Error: ${response.status} ${response.statusText}`);
        break;
      }

      const chunk = await response.json();
      
      if (Array.isArray(chunk) && chunk.length > 0) {
        allData = allData.concat(chunk);
        console.log(`[API] 📦 Deal data fetched: ${chunk.length} items (offset: ${offset}, total: ${allData.length})`);
        offset += limit;
        
        if (chunk.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (allData.length > 0) {
      const normalizedData = allData.map(mapDbToDeal);
      console.log(`[API] ✅ Total deal_data loaded: ${normalizedData.length} items`);
      return { data: normalizedData, source: 'SUPABASE' };
    }

    return { data: [], source: 'SUPABASE' };
  } catch (error) {
    console.error("[API] Deal data fetch failed:", error);
    return { data: [], source: 'SIMULATION' };
  }
};

// ========== Realtime 구독 ==========

export type RealtimeCallback = () => void;

// current_stock 테이블 실시간 구독
export const subscribeToStockChanges = (onUpdate: RealtimeCallback): RealtimeChannel => {
  console.log("[Realtime] 📡 Subscribing to current_stock changes...");
  
  const channel = supabase
    .channel('stock-changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE 모두 감지
        schema: 'public',
        table: SUPABASE_TABLE
      },
      (payload) => {
        console.log("[Realtime] 🔔 Stock data changed:", payload.eventType);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("[Realtime] Stock subscription status:", status);
    });

  return channel;
};

// deal_data 테이블 실시간 구독
export const subscribeToDealChanges = (onUpdate: RealtimeCallback): RealtimeChannel => {
  console.log("[Realtime] 📡 Subscribing to deal_data changes...");
  
  const channel = supabase
    .channel('deal-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deal_data'
      },
      (payload) => {
        console.log("[Realtime] 🔔 Deal data changed:", payload.eventType);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("[Realtime] Deal subscription status:", status);
    });

  return channel;
};

// 구독 해제
export const unsubscribeChannel = (channel: RealtimeChannel) => {
  console.log("[Realtime] 🔌 Unsubscribing channel...");
  supabase.removeChannel(channel);
};

// ========== Google Sheets 연동 ==========

const GOOGLE_SHEET_ID = '1uMNcJWCN4CEF5_g5KqrgqlRhiLutk18Ousb9I8RgKJs';
const INTERNAL_CONTACTS_GID = '185225430'; // 내부 담당자 시트

export interface ContactItem {
  견적서발행일: string;
  세금계산서발행일: string;
  거래처명: string;
  적요품목: string;
  매출합계: number;
  공급가액: number;
  부가세: number;
  입금액: number;
  미수잔액: number;
  수금예정일: string;
  담당자: string;
  담당자연락처: string;
  담당자이메일: string;
  세금계산서확인: boolean;
  입금확인: boolean;
  발송횟수: number;
}

export const fetchGoogleSheetData = async (): Promise<ContactItem[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json`;
    
    console.log("[API] 📡 Fetching Google Sheets data...");
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Google Sheets JSON 응답에서 실제 JSON 추출
    // 응답 형식: google.visualization.Query.setResponse({...})
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!jsonMatch) {
      console.error("[API] Failed to parse Google Sheets response");
      return [];
    }
    
    const json = JSON.parse(jsonMatch[1]);
    const rows = json.table?.rows || [];
    const cols = json.table?.cols || [];
    
    // 헤더 스킵 (첫 번째 행이 헤더)
    const data: ContactItem[] = rows.slice(0).map((row: any) => {
      const cells = row.c || [];
      return {
        견적서발행일: cells[0]?.v || '',
        세금계산서발행일: cells[1]?.v || '',
        거래처명: cells[2]?.v || '',
        적요품목: cells[3]?.v || '',
        매출합계: parseFloat(String(cells[4]?.v || '0').replace(/,/g, '')) || 0,
        공급가액: parseFloat(String(cells[5]?.v || '0').replace(/,/g, '')) || 0,
        부가세: parseFloat(String(cells[6]?.v || '0').replace(/,/g, '')) || 0,
        입금액: parseFloat(String(cells[7]?.v || '0').replace(/,/g, '')) || 0,
        미수잔액: parseFloat(String(cells[8]?.v || '0').replace(/,/g, '')) || 0,
        수금예정일: cells[9]?.v || '',
        담당자: cells[10]?.v || '',
        담당자연락처: cells[11]?.v || '',
        담당자이메일: cells[12]?.v || '',
        세금계산서확인: cells[13]?.v === true || cells[13]?.v === 'TRUE',
        입금확인: cells[14]?.v === true || cells[14]?.v === 'TRUE',
        발송횟수: parseInt(cells[15]?.v || '0') || 0,
      };
    }).filter((item: ContactItem) => item.거래처명); // 빈 행 제거
    
    console.log(`[API] ✅ Google Sheets loaded: ${data.length} items`);
    return data;
  } catch (error) {
    console.error("[API] Google Sheets fetch failed:", error);
    return [];
  }
};

// ========== 내부 담당자 연락처 (두 번째 시트) ==========

export interface InternalContact {
  품목명: string;
  관리부서: string;
  담당자: string;
  연락처: string;
  이메일: string;
}

export const fetchInternalContacts = async (): Promise<InternalContact[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&gid=${INTERNAL_CONTACTS_GID}`;
    
    console.log("[API] 📡 Fetching Internal Contacts from Google Sheets...");
    
    const response = await fetch(url);
    const text = await response.text();
    
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!jsonMatch) {
      console.error("[API] Failed to parse Internal Contacts response");
      return [];
    }
    
    const json = JSON.parse(jsonMatch[1]);
    const rows = json.table?.rows || [];
    
    // 첫 번째 행은 헤더이므로 스킵
    const data: InternalContact[] = rows.slice(1).map((row: any) => {
      const cells = row.c || [];
      return {
        품목명: cells[0]?.v || '',
        관리부서: cells[1]?.v || '',
        담당자: cells[2]?.v || '',
        연락처: cells[3]?.v || '',
        이메일: cells[4]?.v || '',
      };
    }).filter((item: InternalContact) => item.품목명); // 빈 행 제거
    
    console.log(`[API] ✅ Internal Contacts loaded: ${data.length} items`);
    return data;
  } catch (error) {
    console.error("[API] Internal Contacts fetch failed:", error);
    return [];
  }
};