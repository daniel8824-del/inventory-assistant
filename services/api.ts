import { StockItem, DealItem } from '../types';
import { GET_MOCK_DATA, SUPABASE_URL, SUPABASE_KEY, SUPABASE_TABLE } from '../constants';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { apiLogger, realtimeLogger } from '../utils/logger';

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
    apiLogger.warn("Credentials missing - using simulation data");
    return { data: GET_MOCK_DATA(), source: 'SIMULATION' };
  }

  // 2. Fetch ALL data using Supabase Client (세션 토큰 자동 포함)
  try {
    apiLogger.info("Fetching stock data with Supabase client...");

    // Supabase는 기본적으로 1000개 제한이 있으므로, range로 페이지네이션
    let allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: chunk, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        apiLogger.error(`Supabase Error: ${error.message}`);
        break;
      }

      if (chunk && chunk.length > 0) {
        allData = allData.concat(chunk);
        apiLogger.debug(`Fetched ${chunk.length} items (offset: ${offset}, total: ${allData.length})`);
        offset += limit;
        
        if (chunk.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (allData.length > 0) {
      // 디버깅 로그 (개발 환경에서만 출력)
      apiLogger.debug("DB 첫 번째 row:", allData[0]);
      apiLogger.debug("DB 컬럼명:", Object.keys(allData[0]));
      
      const normalizedData = allData.map(mapDbToUI);
      
      // 카테고리 정보 (개발 환경에서만)
      const uniqueCategories = [...new Set(normalizedData.map(item => item.구분명))];
      apiLogger.debug(`고유 구분명 ${uniqueCategories.length}개:`, uniqueCategories);
      
      apiLogger.success(`Stock data loaded: ${normalizedData.length} items`);
      
      return { data: normalizedData, source: 'SUPABASE' };
    }
  } catch (error) {
    apiLogger.error("Connection Failed:", error);
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
    apiLogger.warn("Credentials missing for deal_data");
    return { data: [], source: 'SIMULATION' };
  }

  try {
    apiLogger.info("Fetching deal data with Supabase client...");

    let allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: chunk, error } = await supabase
        .from('deal_data')
        .select('*')
        .order('제출일시', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        apiLogger.error(`Deal data Error: ${error.message}`);
        break;
      }

      if (chunk && chunk.length > 0) {
        allData = allData.concat(chunk);
        apiLogger.debug(`Deal data fetched: ${chunk.length} items (offset: ${offset}, total: ${allData.length})`);
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
      apiLogger.success(`Deal data loaded: ${normalizedData.length} items`);
      return { data: normalizedData, source: 'SUPABASE' };
    }

    return { data: [], source: 'SUPABASE' };
  } catch (error) {
    apiLogger.error("Deal data fetch failed:", error);
    return { data: [], source: 'SIMULATION' };
  }
};

// ========== Realtime 구독 ==========

export type RealtimeCallback = () => void;

// current_stock 테이블 실시간 구독
export const subscribeToStockChanges = (onUpdate: RealtimeCallback): RealtimeChannel => {
  realtimeLogger.info("Subscribing to current_stock changes...");
  
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
        realtimeLogger.info(`Stock data changed: ${payload.eventType}`);
        onUpdate();
      }
    )
    .subscribe((status) => {
      realtimeLogger.debug(`Stock subscription status: ${status}`);
    });

  return channel;
};

// deal_data 테이블 실시간 구독
export const subscribeToDealChanges = (onUpdate: RealtimeCallback): RealtimeChannel => {
  realtimeLogger.info("Subscribing to deal_data changes...");
  
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
        realtimeLogger.info(`Deal data changed: ${payload.eventType}`);
        onUpdate();
      }
    )
    .subscribe((status) => {
      realtimeLogger.debug(`Deal subscription status: ${status}`);
    });

  return channel;
};

// 구독 해제
export const unsubscribeChannel = (channel: RealtimeChannel) => {
  realtimeLogger.debug("Unsubscribing channel...");
  supabase.removeChannel(channel);
};

// ========== Google Sheets 연동 ==========

// 환경변수에서 Google Sheet 설정 로드
const GOOGLE_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '';
const INTERNAL_CONTACTS_GID = import.meta.env.VITE_INTERNAL_CONTACTS_GID || ''; // 내부 담당자 시트

export interface ContactItem {
  거래일시: string;
  계산서일자: string;
  거래처명: string;
  품명: string;
  공급가액: number;
  합계금액: number;
  비고: string;
  위치: string;
  담당자: string;
  담당자연락처: string;
  담당자이메일: string;
}

export const fetchGoogleSheetData = async (): Promise<ContactItem[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json`;
    
    apiLogger.info("Fetching Google Sheets data...");
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Google Sheets JSON 응답에서 실제 JSON 추출
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!jsonMatch) {
      apiLogger.error("Failed to parse Google Sheets response");
      return [];
    }
    
    const json = JSON.parse(jsonMatch[1]);
    const rows = json.table?.rows || [];
    const cols = json.table?.cols || [];
    
    // 컬럼 헤더 확인용 로그 (개발 환경에서만, 개인정보 제외)
    apiLogger.debug("Columns:", cols.map((c: any, i: number) => `${i}:${c.label}`).join(', '));
    apiLogger.debug(`Total rows: ${rows.length}`);

    // 데이터 매핑
    const data: ContactItem[] = rows.slice(0).map((row: any) => {
      const cells = row.c || [];
      return {
        거래일시: cells[0]?.v || '',
        계산서일자: cells[1]?.v || '',
        거래처명: cells[2]?.v || '',
        품명: cells[3]?.v || '',
        공급가액: parseFloat(String(cells[4]?.v || '0').replace(/,/g, '')) || 0,
        합계금액: parseFloat(String(cells[5]?.v || '0').replace(/,/g, '')) || 0,
        비고: cells[6]?.v || '',
        위치: cells[7]?.v || '',
        담당자: cells[8]?.v || '',
        담당자연락처: cells[9]?.v || '',
        담당자이메일: cells[10]?.v || '',
      };
    }).filter((item: ContactItem) => item.거래처명); // 빈 행 제거
    
    apiLogger.success(`Google Sheets loaded: ${data.length} items`);
    return data;
  } catch (error) {
    apiLogger.error("Google Sheets fetch failed:", error);
    return [];
  }
};

// ========== 내부 담당자 연락처 (두 번째 시트) ==========

export interface InternalContact {
  부서: string;
  직급: string;
  담당자: string;
  연락처: string;
  이메일: string;
}

export const fetchInternalContacts = async (): Promise<InternalContact[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&gid=${INTERNAL_CONTACTS_GID}`;
    
    apiLogger.info("Fetching Internal Contacts...");
    
    const response = await fetch(url);
    const text = await response.text();
    
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!jsonMatch) {
      apiLogger.error("Failed to parse Internal Contacts response");
      return [];
    }
    
    const json = JSON.parse(jsonMatch[1]);
    const rows = json.table?.rows || [];
    
    // 첫 번째 행은 헤더이므로 스킵
    const data: InternalContact[] = rows.slice(1).map((row: any) => {
      const cells = row.c || [];
      return {
        부서: cells[0]?.v || '',
        직급: cells[1]?.v || '',
        담당자: cells[2]?.v || '',
        연락처: cells[3]?.v || '',
        이메일: cells[4]?.v || '',
      };
    }).filter((item: InternalContact) => item.담당자); // 빈 행 제거
    
    apiLogger.success(`Internal Contacts loaded: ${data.length} items`);
    return data;
  } catch (error) {
    apiLogger.error("Internal Contacts fetch failed:", error);
    return [];
  }
};

// ========== Audit Logs ==========

import { AuditLog } from '../types';

// ========== 에코비 (Ecob) 데이터 ==========

// 에코비 재고 데이터 조회
export const fetchEcobStockData = async (): Promise<FetchResult> => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    apiLogger.warn("Credentials missing - using empty data for ecob_stock");
    return { data: [], source: 'SIMULATION' };
  }

  try {
    apiLogger.info("Fetching ecob_stock data...");

    let allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: chunk, error } = await supabase
        .from('ecob_stock')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        apiLogger.error(`Ecob Stock Error: ${error.message}`);
        break;
      }

      if (chunk && chunk.length > 0) {
        allData = allData.concat(chunk);
        apiLogger.debug(`Ecob stock fetched: ${chunk.length} items (offset: ${offset}, total: ${allData.length})`);
        offset += limit;
        
        if (chunk.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (allData.length > 0) {
      const normalizedData = allData.map(mapDbToUI);
      apiLogger.success(`Ecob stock loaded: ${normalizedData.length} items`);
      return { data: normalizedData, source: 'SUPABASE' };
    }

    return { data: [], source: 'SUPABASE' };
  } catch (error) {
    apiLogger.error("Ecob stock fetch failed:", error);
    return { data: [], source: 'SIMULATION' };
  }
};

// 에코비 거래 데이터 조회
export const fetchEcobDealData = async (): Promise<DealFetchResult> => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    apiLogger.warn("Credentials missing for ecob_deal");
    return { data: [], source: 'SIMULATION' };
  }

  try {
    apiLogger.info("Fetching ecob_deal data...");

    let allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: chunk, error } = await supabase
        .from('ecob_deal')
        .select('*')
        .order('제출일시', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        apiLogger.error(`Ecob deal Error: ${error.message}`);
        break;
      }

      if (chunk && chunk.length > 0) {
        allData = allData.concat(chunk);
        apiLogger.debug(`Ecob deal fetched: ${chunk.length} items (offset: ${offset}, total: ${allData.length})`);
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
      apiLogger.success(`Ecob deal loaded: ${normalizedData.length} items`);
      return { data: normalizedData, source: 'SUPABASE' };
    }

    return { data: [], source: 'SUPABASE' };
  } catch (error) {
    apiLogger.error("Ecob deal fetch failed:", error);
    return { data: [], source: 'SIMULATION' };
  }
};

// ecob_stock 테이블 실시간 구독
export const subscribeToEcobStockChanges = (onUpdate: RealtimeCallback): RealtimeChannel => {
  realtimeLogger.info("Subscribing to ecob_stock changes...");
  
  const channel = supabase
    .channel('ecob-stock-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ecob_stock'
      },
      (payload) => {
        realtimeLogger.info(`Ecob stock changed: ${payload.eventType}`);
        onUpdate();
      }
    )
    .subscribe((status) => {
      realtimeLogger.debug(`Ecob stock subscription status: ${status}`);
    });

  return channel;
};

// ecob_deal 테이블 실시간 구독
export const subscribeToEcobDealChanges = (onUpdate: RealtimeCallback): RealtimeChannel => {
  realtimeLogger.info("Subscribing to ecob_deal changes...");
  
  const channel = supabase
    .channel('ecob-deal-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ecob_deal'
      },
      (payload) => {
        realtimeLogger.info(`Ecob deal changed: ${payload.eventType}`);
        onUpdate();
      }
    )
    .subscribe((status) => {
      realtimeLogger.debug(`Ecob deal subscription status: ${status}`);
    });

  return channel;
};

// ========== Audit Logs ==========

export const fetchAuditLogs = async (limit: number = 100): Promise<AuditLog[]> => {
  try {
    apiLogger.info("Fetching audit logs...");

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      apiLogger.error(`Audit logs Error: ${error.message}`);
      return [];
    }

    apiLogger.success(`Audit logs loaded: ${data?.length || 0} items`);
    return data || [];
  } catch (error) {
    apiLogger.error("Audit logs fetch failed:", error);
    return [];
  }
};