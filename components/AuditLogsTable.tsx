import React, { useState, useMemo } from 'react';
import { Search, Clock, RefreshCw, FileEdit, Trash2, PlusCircle, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsTableProps {
  data: AuditLog[];
  loading: boolean;
  onRefresh: () => void;
}

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ data, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  // 테이블 목록 (재고 → 거래 순서로 정렬)
  const tableNames = useMemo(() => {
    const names = [...new Set(data.map(log => log.table_name))];
    // 재고(current_stock, ecob_stock)가 거래(deal_data, ecob_deal)보다 먼저 오도록 정렬
    const order: { [key: string]: number } = {
      'current_stock': 1,
      'ecob_stock': 2,
      'deal_data': 3,
      'ecob_deal': 4
    };
    return names.sort((a, b) => (order[a] || 99) - (order[b] || 99));
  }, [data]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return data.filter(log => {
      const matchesSearch = 
        (log.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (log.table_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (log.record_id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesTable = filterTable === 'all' || log.table_name === filterTable;
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      
      return matchesSearch && matchesTable && matchesAction;
    });
  }, [data, searchTerm, filterTable, filterAction]);

  // 액션 아이콘 및 색상
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'INSERT':
        return { icon: PlusCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'UPDATE':
        return { icon: FileEdit, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'DELETE':
        return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
      default:
        return { icon: Database, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/30' };
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 테이블명 한글화
  const getTableNameKo = (tableName: string) => {
    switch (tableName) {
      case 'current_stock': return '재고';
      case 'ecob_stock': return '재고';
      case 'deal_data': return '거래';
      case 'ecob_deal': return '거래';
      case 'users': return '사용자';
      default: return tableName;
    }
  };

  // 액션명 한글화
  const getActionNameKo = (action: string) => {
    switch (action) {
      case 'INSERT': return '추가';
      case 'UPDATE': return '수정';
      case 'DELETE': return '삭제';
      default: return action;
    }
  };

  // JSON 데이터 요약
  const summarizeData = (data: Record<string, any> | null) => {
    if (!data) return '-';
    const keys = Object.keys(data);
    if (keys.length === 0) return '-';
    
    const importantKeys = ['품목명[규격]', '구분명', '거래처명', '현재수량', '거래수량', '금액'];
    const summary = importantKeys
      .filter(key => data[key] !== undefined)
      .map(key => `${key}: ${data[key]}`)
      .slice(0, 2)
      .join(', ');
    
    return summary || `${keys.length}개 필드`;
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-rose-400">Activity Logs</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <Clock size={10} className="text-rose-400" />
              AUDIT
            </span>
            <span className="text-[10px] font-medium bg-rose-500/20 text-rose-400 px-2 py-1 rounded border border-rose-500/30">
              로그 {filteredData.length}건
            </span>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-rose-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="mt-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="이메일, 테이블, ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-body border border-border rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[10px] text-zinc-500 py-1.5">테이블</span>
          <button
            onClick={() => setFilterTable('all')}
            className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
              filterTable === 'all'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                : 'bg-transparent text-zinc-500 border-border hover:border-zinc-600'
            }`}
          >
            전체
          </button>
          {tableNames.map(name => (
            <button
              key={name}
              onClick={() => setFilterTable(name)}
              className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
                filterTable === name
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  : 'bg-transparent text-zinc-500 border-border hover:border-zinc-600'
              }`}
            >
              {getTableNameKo(name)}
            </button>
          ))}
          
          <span className="text-[10px] text-zinc-500 py-1.5 ml-4">작업</span>
          <button
            onClick={() => setFilterAction('all')}
            className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
              filterAction === 'all'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                : 'bg-transparent text-zinc-500 border-border hover:border-zinc-600'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterAction('INSERT')}
            className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
              filterAction === 'INSERT'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'bg-transparent text-zinc-500 border-border hover:border-zinc-600'
            }`}
          >
            ⊕ 추가
          </button>
          <button
            onClick={() => setFilterAction('UPDATE')}
            className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
              filterAction === 'UPDATE'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-transparent text-zinc-500 border-border hover:border-zinc-600'
            }`}
          >
            ⊙ 수정
          </button>
          <button
            onClick={() => setFilterAction('DELETE')}
            className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
              filterAction === 'DELETE'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                : 'bg-transparent text-zinc-500 border-border hover:border-zinc-600'
            }`}
          >
            ⊖ 삭제
          </button>
        </div>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="p-8 text-center">
          <RefreshCw size={24} className="animate-spin text-rose-400 mx-auto mb-2" />
          <span className="text-zinc-500 text-sm">로딩 중...</span>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 text-sm">
          활동 로그가 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-900/30">
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">시간</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">사용자</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">작업</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">테이블</th>
                <th className="px-4 py-3 text-left text-zinc-400 font-medium">변경 내용</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">상세</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((log) => {
                const actionStyle = getActionStyle(log.action);
                const ActionIcon = actionStyle.icon;
                const isExpanded = expandedRow === log.id;

                return (
                  <React.Fragment key={log.id}>
                    <tr className="border-b border-border/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3 text-center text-zinc-400 whitespace-nowrap text-[11px]">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white text-[11px]">
                          {log.user_email?.split('@')[0] || <span className="text-zinc-600">시스템</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${actionStyle.bg} ${actionStyle.color}`}>
                          <ActionIcon size={10} />
                          {getActionNameKo(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-zinc-300 text-[11px]">
                          {getTableNameKo(log.table_name)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 max-w-[250px] truncate text-[11px]">
                        {log.action === 'DELETE' 
                          ? summarizeData(log.old_data)
                          : summarizeData(log.new_data)
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          className={`p-1 rounded transition-colors ${
                            isExpanded 
                              ? 'text-rose-400 bg-rose-500/10' 
                              : 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10'
                          }`}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* 확장된 상세 정보 */}
                    {isExpanded && (
                      <tr className="bg-zinc-900/50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {log.old_data && (
                              <div>
                                <h4 className="text-[10px] font-medium text-zinc-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> 변경 전
                                </h4>
                                <pre className="bg-black/40 border border-border p-3 rounded-lg text-[10px] text-zinc-400 overflow-auto max-h-[200px]">
                                  {JSON.stringify(log.old_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <h4 className="text-[10px] font-medium text-zinc-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 변경 후
                                </h4>
                                <pre className="bg-black/40 border border-border p-3 rounded-lg text-[10px] text-zinc-400 overflow-auto max-h-[200px]">
                                  {JSON.stringify(log.new_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogsTable;
