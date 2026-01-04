export interface StockItem {
  "유니크키"?: string;  // 품목 고유 식별자 (품목명+비고)
  "구분명": string;
  "품목명[규격]": string;
  "품목코드"?: string;
  "비고"?: string;
  "단가": number;
  "현재수량": number;
  "전월수량": number;
  "위험재고": number;
  "재고회전"?: string;
  "상태": string;
  "금액"?: number;
  "updated_at"?: string;  // 업데이트 일시
}

export interface DealItem {
  id: string;
  "구분명": string;
  "품목명[규격]": string;
  "비고"?: string;
  "품목코드"?: string;
  "단가": number;
  "거래처명": string;
  "거래구분": '입고' | '출고';
  "거래수량": number;
  "금액": number;
  "거래일자": string;
  "담당자"?: string;
  "적요"?: string;
  "제출일시"?: string;
  "거래 전 재고"?: number;
  "거래 후 재고"?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface N8nResponse {
  output?: string;
  response?: string;
  [key: string]: any;
}

export interface AuditLog {
  id: number;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  user_id: string | null;
  user_email: string | null;
  created_at: string;
}