import React, { useState, useMemo } from 'react';
import { Loader2, CreditCard, Search, X, Filter, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { ContactItem } from '../services/api';

interface ReceivablesTableProps {
  data: ContactItem[];
  loading: boolean;
}

type FilterType = 'all' | 'unpaid' | 'paid';

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    let result = [...data];

    // 상태 필터
    if (filterType === 'unpaid') {
      result = result.filter(item => item.미수잔액 > 0);
    } else if (filterType === 'paid') {
      result = result.filter(item => item.미수잔액 === 0);
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.거래처명?.toLowerCase().includes(term) ||
        item.적요품목?.toLowerCase().includes(term) ||
        item.담당자?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [data, filterType, searchTerm]);

  // 통계
  const stats = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.매출합계, 0);
    const received = data.reduce((sum, item) => sum + item.입금액, 0);
    const outstanding = data.reduce((sum, item) => sum + item.미수잔액, 0);
    const unpaidCount = data.filter(item => item.미수잔액 > 0).length;
    
    return { total, received, outstanding, unpaidCount };
  }, [data]);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // Date 형식이거나 문자열일 수 있음
    if (dateStr.includes('Date')) {
      const match = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = match[1];
        const month = String(parseInt(match[2]) + 1).padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return dateStr.split(' ')[0].split('T')[0];
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'unpaid': return '미수금';
      case 'paid': return '수금완료';
      default: return '전체';
    }
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-violet-400" />
              <h3 className="text-base font-semibold text-zinc-200">Receivables</h3>
            </div>
            {stats.unpaidCount > 0 && (
              <div className="flex items-center gap-2 text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">
                <AlertCircle size={10} />
                <span>미수금 {stats.unpaidCount}건</span>
              </div>
            )}
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            {filteredData.length} / {data.length} 거래
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-body border border-border rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">총 매출액</div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{formatAmount(stats.total)}원</div>
          </div>
          <div className="bg-bg-body border border-border rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">수금 완료</div>
            <div className="text-sm font-mono font-semibold text-emerald-400">{formatAmount(stats.received)}원</div>
          </div>
          <div className="bg-bg-body border border-border rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">미수금 잔액</div>
            <div className="text-sm font-mono font-semibold text-rose-400">{formatAmount(stats.outstanding)}원</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="거래처, 품목 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                filterType !== 'all' 
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                  : 'bg-bg-body border-border text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <Filter size={14} />
              <span>{getFilterLabel()}</span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-bg-sidebar border border-border rounded-lg shadow-xl z-50">
                {(['all', 'unpaid', 'paid'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                      filterType === type ? 'text-violet-400 bg-violet-500/5' : 'text-zinc-300'
                    }`}
                  >
                    {type === 'all' ? '전체' : type === 'unpaid' ? '미수금' : '수금완료'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-bg-card/80 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-violet-400" size={24} />
              <span className="text-sm font-medium">데이터를 불러오는 중...</span>
            </div>
          </div>
        )}
        
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="bg-white/[0.02] border-b border-border">
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider whitespace-nowrap">견적일</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider whitespace-nowrap">거래처</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider whitespace-nowrap">품목/적요</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right whitespace-nowrap">청구액</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right whitespace-nowrap">수금액</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right whitespace-nowrap">미수금</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider whitespace-nowrap">수금예정</th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-center whitespace-nowrap">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredData.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-zinc-500 text-sm">
                  {searchTerm || filterType !== 'all' ? '검색 결과가 없습니다.' : '거래 데이터가 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-sm">
                  <td className="py-2.5 px-3 font-mono text-xs text-zinc-400">
                    {formatDate(item.견적서발행일)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-zinc-200">
                    {item.거래처명}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 max-w-[200px] truncate" title={item.적요품목}>
                    {item.적요품목}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-300 text-right whitespace-nowrap">
                    {formatAmount(item.매출합계)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 text-right whitespace-nowrap">
                    {formatAmount(item.입금액)}
                  </td>
                  <td className={`py-2.5 px-3 font-mono text-right whitespace-nowrap font-semibold ${
                    item.미수잔액 > 0 ? 'text-rose-400' : 'text-zinc-500'
                  }`}>
                    {formatAmount(item.미수잔액)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-zinc-400">
                    {formatDate(item.수금예정일)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.미수잔액 === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                        <CheckCircle size={10} />
                        완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400">
                        <AlertCircle size={10} />
                        미수
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-bg-card/50 text-xs text-zinc-500">
        <span>데이터 출처: </span>
        <a 
          href="https://docs.google.com/spreadsheets/d/1uMNcJWCN4CEF5_g5KqrgqlRhiLutk18Ousb9I8RgKJs/edit?gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300"
        >
          케이원솔루션 미수금 시트
        </a>
      </div>
    </div>
  );
};

export default ReceivablesTable;

